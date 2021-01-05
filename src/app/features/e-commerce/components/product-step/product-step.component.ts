import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, Observable, of, forkJoin } from 'rxjs';
import { assign, findIndex, find, uniq, keys, each } from 'lodash';

import { MessageService } from 'app/core/services/message.service';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { ArtworksService } from 'app/core/services/artworks.service';
import { FuseArtworksListComponent } from 'app/features/artworks/artworks-list/artworks-list.component';

import { EcommerceOrderService } from '../../order.service';
import { ProductUniversalSearchComponent } from '../product-universal-search/product-universal-search.component';
import { EcommerceProductsService } from '../../products/products.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ProductManualEntryComponent } from '../product-manual-entry/product-manual-entry.component';
import { ProductKitsQtyDialogComponent } from '../product-kits-qty-dialog/product-kits-qty-dialog.component';
import { chain } from '../../utils';
import { Artwork, OrderDetails } from 'app/models';
import { AttachDesignDialogComponent } from '../attach-design-dialog/attach-design-dialog.component';
import { ProductsListComponent } from '../products-list/products-list.component';
import { GlobalConfigService } from 'app/core/services/global.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'order-details-product-step',
  templateUrl: './product-step.component.html',
  styleUrls: ['./product-step.component.scss']
})
export class ProductStepComponent implements OnInit, OnDestroy {
  @ViewChild('artworksList') artworksList: FuseArtworksListComponent;
  @ViewChild(ProductsListComponent) productsList: ProductsListComponent;

  view = 'lineitems';
  selectedProducts = [];
  selectedDetails = null;
  decoData = null;
  designsToModify = [];
  artworkFolderId = '';
  sysConfig: any;
  kitProductsQty = [];
  isKitFound = false;
  onSelectionChangedSubscription: Subscription;
  loading = true;
  context: any;
  order: OrderDetails;

  constructor(
    private orderService: EcommerceOrderService,
    private productsService: EcommerceProductsService,
    private api: ApiService,
    private artworks: ArtworksService,
    private dialog: MatDialog,
    private msg: MessageService,
    private selection: SelectionService,
    private globalService: GlobalConfigService
  ) { }

  ngOnInit() {
    this.sysConfig = this.globalService.getSysConfig();
    this.order = this.orderService.order;

    this.context = this.orderService.context;

    this.api.getAdvanceSystemConfigAll({ module: 'Products' }).subscribe((response: any) => {
      this.sysConfig.inventoryEnabled = response.settings.inventoryEnabled === '1';
      this.loading = false;
    });

    this.onSelectionChangedSubscription =
      this.productsService.onSelectionChanged.subscribe(selection => {
        this.selectedProducts = selection;
      });
  }

  ngOnDestroy() {
    this.onSelectionChangedSubscription.unsubscribe();
  }

  changeView(ev) {
    this.view = ev.value;
  }

  openAdvanceSearchDialog() {
    const dialog = this.dialog.open(ProductUniversalSearchComponent, {
      panelClass: 'product-universal-search',
      data: {
        addTo: 'order',
        context: this.orderService.context,
        parent: this
      }
    });

    dialog.afterClosed().subscribe(
      action => {
        if (action === 'add_to_product') {
          this.view = 'lineitems';
        }
      }
    )
  }

  clearFilters() {
    this.productsService.messageQueue.next({ type: 'clear-filters' });
  }

  addToOrder() {
    if (this.selectedProducts && this.selectedProducts.length == 0) {
      this.msg.show('Please select products above.', 'error');
      return;
    }

    const order = this.orderService.order;
    this.productsService.messageQueue.next({
      type: 'set-loading',
      extra: true
    });

    this.api.getProductBriefDetails(this.selectedProducts)
      .subscribe((res: any) => {
        this.isKitFound = false;
        res.forEach((product: any) => {
          if (product.productType == '2') {
            this.isKitFound = true;
          }
        });
        if (this.isKitFound) {
          this.productsService.messageQueue.next({
            type: 'set-loading',
            extra: false
          });
          const confirmKitQtyDialogRef = this.dialog.open(ProductKitsQtyDialogComponent, {
            disableClose: false,
            panelClass: 'product-kits-qty-dialog',
            data: {
              kitProducts: res,
            }
          });

          confirmKitQtyDialogRef.afterClosed().subscribe(result => {
            this.productsService.messageQueue.next({
              type: 'set-loading',
              extra: true
            });
            if (result) {
              result.forEach((product: any) => {
                this.kitProductsQty[product.id] = product.kitQty;
              });
              this.api.getAdvanceSystemConfigAll({ module: 'Orders' })
                .subscribe((res: any) => {
                  const orderConfig: any = res.settings;
                  chain(
                    this.selectedProducts.map(pid =>
                      this.api.getProductDetailsCurrency(pid)
                    )
                  ).finished.pipe(
                    switchMap((products: any) => {
                      products.result.forEach(p => {
                        this.productsService.messageQueue.next({
                          type: 'set-loading',
                          extra: true
                        });
                        const defaultImage = p.MediaContent && p.MediaContent[0] && p.MediaContent[0].url;
                        order.lineItems.push({
                          ...p,
                          ...orderConfig,
                          productId: p.id,
                          itemNo: p.productId,
                          customerDescription: p.description,
                          chargeSalesTax: p.taxEnabled,
                          chargeGstTaxOnPo: true,
                          salesTaxOff: !p.taxEnabled,
                          quoteCustomImage: [defaultImage],
                          quantity: this.kitProductsQty[p.id],
                        });
                      });
                      this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                      });
                      return this.orderService.updateOrder(order);
                    }),
                  ).subscribe(
                    () => {
                      this.view = 'lineitems';
                      this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                      });
                    },
                    (err) => {
                      this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                      });
                    }
                  );
                }, (err) => {
                  this.productsService.messageQueue.next({
                    type: 'set-loading',
                    extra: false
                  });
                });

            } else {
              this.api.getAdvanceSystemConfigAll({ module: 'Orders' })
                .subscribe((res: any) => {
                  const orderConfig: any = res.settings;
                  chain(
                    this.selectedProducts.map(pid =>
                      this.api.getProductDetailsCurrency(pid)
                    )
                  ).finished.pipe(
                    switchMap((products: any) => {
                      products.result.forEach(p => {
                        this.productsService.messageQueue.next({
                          type: 'set-loading',
                          extra: true
                        });
                        const defaultImage = p.MediaContent && p.MediaContent[0] && p.MediaContent[0].url;
                        order.lineItems.push({
                          ...p,
                          productId: p.id,
                          itemNo: p.productId,
                          customerDescription: p.description,
                          chargeSalesTax: p.taxEnabled,
                          chargeGstTaxOnPo: true,
                          salesTaxOff: !p.taxEnabled,
                          quoteCustomImage: [defaultImage],
                          ...orderConfig
                        });
                      });
                      this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                      });
                      return this.orderService.updateOrder(order);
                    }),
                  ).subscribe(
                    () => {
                      this.view = 'lineitems';
                      this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                      });
                    },
                    (err) => {
                      this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                      });
                    }
                  );
                }, (err) => {
                  this.productsService.messageQueue.next({
                    type: 'set-loading',
                    extra: false
                  });
                });
            }
          });
        } else {
          this.api.getAdvanceSystemConfigAll({ module: 'Orders' })
            .subscribe((res: any) => {
              const orderConfig: any = res.settings;
              chain(
                this.selectedProducts.map(pid =>
                  this.api.getProductDetailsCurrency(pid)
                )
              ).finished.pipe(
                switchMap((products: any) => {
                  products.result.forEach(p => {
                    this.productsService.messageQueue.next({
                      type: 'set-loading',
                      extra: true
                    });
                    const defaultImage = p.MediaContent && p.MediaContent[0] && p.MediaContent[0].url;
                    order.lineItems.push({
                      ...p,
                      ...orderConfig,
                      productId: p.id,
                      itemNo: p.productId,
                      customerDescription: p.description,
                      quoteCustomImage: [defaultImage],
                      chargeSalesTax: p.taxEnabled,
                      chargeGstTaxOnPo: true,
                      salesTaxOff: !p.taxEnabled,
                    });
                  });
                  this.productsService.messageQueue.next({
                    type: 'set-loading',
                    extra: false
                  });
                  return this.orderService.updateOrder(order);
                }),
              ).subscribe(
                () => {
                  this.view = 'lineitems';
                  this.productsService.messageQueue.next({
                    type: 'set-loading',
                    extra: false
                  });
                },
                (err) => {
                  this.productsService.messageQueue.next({
                    type: 'set-loading',
                    extra: false
                  });
                }
              );
            }, (err) => {
              this.productsService.messageQueue.next({
                type: 'set-loading',
                extra: false
              });
            });
        }

      }, (err) => {
        this.productsService.messageQueue.next({
          type: 'set-loading',
          extra: false
        });
      });
    if (this.selectedProducts.length > 0) {

    }
    /*
    */
  }

  deleteSelectedProducts() {

    if (this.productsService._selection.length > 0) {
      const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
        disableClose: false
      });

      confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected Products?';

      confirmDialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.productsService.messageQueue.next({
            type: 'set-loading',
            extra: true
          });

          this.productsService.deleteSelectedProducts()
            .subscribe((res: any) => {
              this.msg.show('These items have been moved to the Recycle Bin', 'success');
              this.productsService.deselectAll();
              this.productsService.messageQueue.next({
                type: 'delete-success'
              });

            }, (err) => {
              this.msg.show(err.message, 'error');
              this.productsService.messageQueue.next({
                type: 'set-loading',
                extra: false
              });

            });
        }
      });
    }
    else {
      this.msg.show('Please select activities to delete.', 'success');
    }
  }

  showView(v) {
    if (v === 'decoration-new') {
      forkJoin([
        this.artworks.getDesignLocations(),
        this.artworks.getAllDesignTypes(),
        this.artworks.getStatusList(),
        this.artworks.getAllDesignTypesDetailsOptions(),
      ]).subscribe(() => {
        const artwork = new Artwork();
        artwork.customerId = this.orderService.order.accountId;
        artwork.customerName = this.orderService.order.accountName;
        artwork.orderIdentity = this.orderService.order.orderIdentity;
        artwork.orderId = this.orderService.order.id;
        this.decoData = ['new', artwork.toObject()];
        this.view = v;
      });
      return;
    }

    if (v === 'decoration-select' || v === 'decoration-select-edit') {
      this.selection.reset(false);
      this.artworks.changeView('list');
      this.artworks.payload.term.customerName = this.orderService.order.accountName;
    }

    this.view = v;
  }

  newProduct() {
    this.dialog.open(ProductManualEntryComponent, {
      panelClass: 'product-manual-entry-dialog'
    });
  }

  showProductDetails(product) {
    this.selectedDetails = product;
    this.view = 'product-details';
  }

  saveProductDetails(details) {
    const order = this.orderService.order;
    const i = findIndex(order.lineItems, { productId: details.id });

    if (i >= 0) {
      assign(order.lineItems[i], details);
      this.orderService.updateOrder(order)
        .subscribe(() => { });
    }
    this.showView('lineitems');
  }

  selectDecorationToLink() {
    if (this.selection.selectedCount === 0) {
      this.msg.show('Please select a decoration to add to order', 'error');
      return;
    }

    forkJoin(
      this.artworksList.getSelectedDesignIds()
        .map(did =>
          this.api.linkDesignToLineItem(
            did,
            this.orderService.order.id,
            this.orderService.selectedLineItemId,
            this.orderService.selectedMatrixRows
          )
        )
    ).pipe(
      switchMap((res: any) => {
        this.designsToModify = [];

        const lineitem = find(this.orderService.order.lineItems, {
          lineItemUpdateId: this.orderService.selectedLineItemId
        });

        res.forEach((dRes: any) => {
          if (dRes.status === 'error') {
            dRes.extra.variationToChooseFrom = dRes.variationToChooseFrom;
            this.designsToModify.push({
              ...dRes.extra,
              color: this.orderService.selectedLineItemColor,
              itemNo: lineitem.itemNo
            });
          }
        })

        if (this.designsToModify.length > 0) {
          this.showView('decoration-variations');
          return of(false);
        }

        return this.orderService.getOrder(this.orderService.order.id);
      })
    ).subscribe(
      (res) => {
        if (res) {
          this.showLineItemsAndDecorationList();
        }
      },
      err => {
        console.log(err);
        this.msg.show('Error occured while linking design to line item', 'error');
      }
    );
  }

  showDecoVariationEdit(ev) {
    this.designsToModify = [
      {
        designId: ev.designId,
        decoVendorRecordId: ev.decoVendorRecordId,
        itemNo: ev.itemNo,
        color: ev.color,
        error: ''
      }
    ];
    this.showView('decoration-variations-edit');
  }

  selectVariation(i, ev) {
    this.designsToModify[i].variationId = ev.variationId;
    this.designsToModify[i].design = ev.design;
    this.designsToModify[i].error = '';
  }

  linkVariationToLineItem() {
    let errors = false;

    this.designsToModify.forEach((meta, i) => {
      if (!meta.variationId) {
        errors = true;
        meta.error = 'Please choose a variation';
        return;
      }

      meta.variationToChooseFrom = {};
      meta.matrixRowIds.forEach(mrId => {
        meta.variationToChooseFrom[mrId] = meta.variationId;
      });
    });

    if (errors) {
      return;
    }

    forkJoin(
      this.designsToModify.map(meta => {
        const variation = find(meta.design.variation, {
          design_variation_unique_id: meta.variationId
        });

        if (variation.design_variation_color.split(',').indexOf(meta.color) < 0) {
          if (variation.design_variation_color) {
            variation.design_variation_color += ',' + meta.color;
          } else {
            variation.design_variation_color = meta.color;
          }

          return this.api.updateDesign(meta.design.toObject()).pipe(
            switchMap(() => this.api.linkDesignToLineItemWithVariation(
              meta.designId,
              meta.orderId,
              meta.lineItemId,
              meta.matrixRowIds,
              meta.variationToChooseFrom
            )),
          );

        }

        return this.api.linkDesignToLineItemWithVariation(
          meta.designId,
          meta.orderId,
          meta.lineItemId,
          meta.matrixRowIds,
          meta.variationToChooseFrom
        )
      })
    ).subscribe(
      (list: any[]) => {
        this.designsToModify = this.designsToModify.filter((meta, i) => list[i].status !== 'success');
        if (this.designsToModify.length === 0) {
          this.orderService.getOrder(this.orderService.order.id)
            .subscribe(() => {
              this.showLineItemsAndDecorationList();
            });
        } else {
          this.msg.show('Error occured while linking line item variation', 'error');
        }
      },
      (err) => {
        this.msg.show('Error occured while linking line item variation', 'error');
      }
    )
  }

  changeDesignVariation() {
    const meta = this.designsToModify[0];
    this.api.deleteDesignFromLineItem({
      orderId: this.orderService.order.id,
      lineItemId: this.orderService.selectedLineItemId,
      decoVendorRecordIds: [meta.decoVendorRecordId]
    }).pipe(
      switchMap(() => {
        const variationsToChooseFrom = {};
        this.orderService.selectedMatrixRows
          .forEach(matrixUpdateId => {
            variationsToChooseFrom[matrixUpdateId] = meta.variationId;
          });

        return this.api.linkDesignToLineItemWithVariation(
          meta.designId,
          this.orderService.order.id,
          this.orderService.selectedLineItemId,
          this.orderService.selectedMatrixRows,
          variationsToChooseFrom
        );
      }),
      switchMap(() => this.orderService.getOrder(this.orderService.order.id))
    ).subscribe(res => {
      this.showLineItemsAndDecorationList();
    });
  }

  selectDecorationToEdit() {
    if (this.selection.selectedCount !== 1) {
      this.msg.show('Please select a decoration to add to order', 'error');
      return;
    }
    this.artworks.getArtwork(this.selection.selectedIds[0]).pipe(
      switchMap((res: any) => {
        const artwork = new Artwork(res);
        artwork.id = '';
        artwork.designId = '';
        artwork.design.id = '';
        artwork.identity += ' Copy';
        artwork.statusId = '1';
        artwork.statusName = 'Pending';
        artwork.statusLabel = 'Pending';
        //artwork.designNo = 'Auto Generated';
        artwork.customerId = this.orderService.order.accountId;
        artwork.customerName = this.orderService.order.accountName;
        artwork.orderId = this.orderService.order.id;
        artwork.orderIdentity = this.orderService.order.orderIdentity;
        return this.api.createArtwork(artwork.toObject());
      }),
      switchMap((res: any) => this.api.getArtworkDetails(res.extra.id)),
      switchMap((res: any) =>
        forkJoin([
          of('edit'),
          of(res),
          this.artworks.getDesignLocations(),
          this.artworks.getAllDesignTypes(),
          this.artworks.getStatusList(),
          this.artworks.getAllDesignTypesDetailsOptions(),
        ])
      )
    ).subscribe(data => {
      this.decoData = data;
      this.showView('decoration-edit');
    });
  }

  toModifyDesign(ev) {
    this.artworks.onFolderReady.next(null);

    forkJoin([
      of('edit'),
      this.artworks.getArtwork(ev),
      this.artworks.getDesignLocations(),
      this.artworks.getAllDesignTypes(),
      this.artworks.getStatusList(),
      this.artworks.getAllDesignTypesDetailsOptions(),
    ]).subscribe(data => {
      this.decoData = data;
      this.showView('decoration-edit');
    });
  }

  selectModifiedDesign() {
    this.api.linkDesignToLineItem(
      this.decoData[1].designId,
      this.orderService.order.id,
      this.orderService.selectedLineItemId,
      this.orderService.selectedMatrixRows
    ).pipe(
      switchMap((res: any) => {
        this.designsToModify = [];

        const lineitem = find(this.orderService.order.lineItems, {
          lineItemUpdateId: this.orderService.selectedLineItemId
        });

        if (res.status === 'error') {
          res.extra.variationToChooseFrom = res.variationToChooseFrom;
          this.designsToModify.push({
            ...res.extra,
            color: this.orderService.selectedLineItemColor,
            itemNo: lineitem.itemNo
          });
        }

        if (this.designsToModify.length > 0) {
          this.showView('decoration-variations');
          return of(false);
        }

        return this.orderService.getOrder(this.orderService.order.id);
      })
    ).subscribe(
      (res) => {
        if (res) {
          this.showLineItemsAndDecorationList();
        }
      },
      err => {
        console.log(err);
        this.msg.show('Error occured while linking design to line item', 'error');
      }
    );
  }

  showLineItemsAndDecorationList() {
    this.showView('lineitems');

    setTimeout(() => {
      this.productsList.reopenDecorationsList();
    }, 1000);
  }

  showAttachDecorationDialog() {
    this.artworks.getStatusList()
      .subscribe(() => {
        const dialogRef = this.dialog.open(AttachDesignDialogComponent, {
          data: {
            parentFolderId: this.orderService.rootFolderId,
          }
        });

        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            this.decoData = [null, res];
            this.selectModifiedDesign();
          } else {
            this.showLineItemsAndDecorationList();
          }
        });
      });
  }
}

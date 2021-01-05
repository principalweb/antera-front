import { Component, OnInit, Input, ChangeDetectionStrategy, OnChanges, SimpleChanges, ViewChild, ChangeDetectorRef, ContentChildren, QueryList, AfterContentInit, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ILineItem, IDecoVendor, IProduct } from './interfaces';
import { forkJoin, of, Subscription } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { EcommerceOrderService } from '../order.service';
import { MatrixRow, AdditionalCharge, LineItem, OrderDetails, Artwork, ProductConfig, ProductDetails } from 'app/models';
import { OrderItemListComponent } from './order-item-list/order-item-list.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FormBuilder, FormGroupDirective } from '@angular/forms';
import { switchMap, map, finalize } from 'rxjs/operators';
import { AdditionalChargesComponent } from '../components/additional-charges/additional-charges.component';
import { SelectDecorationComponent } from '../components/select-decoration/select-decoration.component';
import { ComponentPortal, CdkPortalOutlet } from '@angular/cdk/portal';
import { OrderItemFormComponent } from './order-item/order-item-form/order-item-form.component';
import { EcommerceProductsService } from '../products/products.service';
import { ProductKitsQtyDialogComponent } from '../components/product-kits-qty-dialog/product-kits-qty-dialog.component';
import { ArtworksService } from 'app/core/services/artworks.service';
import { Store } from '@ngrx/store';
import * as fromOrderForm from './store/order-form.reducer';
import { AddProductsToOrder, UpdateMatrixRow, UpdateLineItem, UpdateCharge, ReorderItemDropped, ShowView, AddDecoration, UpdateDecoration, PasteDecorations, DeleteLineItem, LoadDecorationVendorsForType, DeleteDecorations, DeleteMatrixRows, DeleteCharge, SaveChargeDialog, SaveOrder, UpdateConfig, LoadOrder, DuplicateLineItem, PasteCharges, ChangeDesignVariation, LoadProductInventory, LoadProduct, LoadLocalWarehouses, SyncTaxJar, SyncShipStation, UpdateItemRows, LoadOrderArtProofs } from './store/order-form.actions';
import { OrderFindProductsComponent } from './order-find-products/order-find-products.component';
import { OrderDecorationSelectComponent } from './actions/order-decoration-select/order-decoration-select.component';
import { OrderDecorationNewComponent } from './actions/order-decoration-new/order-decoration-new.component';
import { ProductNoteComponent } from '../components/product-note/product-note.component';
import { AttachDesignDialogComponent } from '../components/attach-design-dialog/attach-design-dialog.component';
import { PricingInventoryNewComponent } from '../components/pricing-inventory-new/pricing-inventory-new.component';
import { LineitemImageUploadDialogComponent } from '../components/lineitem-image-upload-dialog/lineitem-image-upload-dialog.component';
import { ItemNotesDialogComponent } from './item-notes-dialog/item-notes-dialog.component';
import { OrderFormService } from './order-form.service';
import { ProductDescriptionComponent } from '../components/product-description/product-description.component';
import { DeleteArtProof } from './store/actions/art-proof.actions';
import { SocketService } from 'app/core/services/socket.service';

interface IVendorItems {
  id: string;
  name: string;
  items: ILineItem[];
}

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ArtworksService],
})
export class OrderFormComponent implements OnInit, OnChanges, AfterContentInit {

  @Input() order: OrderDetails = new OrderDetails();
  @Input() vm: OrderFormService;
  @Input() config: any;
  @Output() save: EventEmitter<boolean> = new EventEmitter();
  @Output() reload: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('aside') aside: MatSidenav;
  @ViewChild('orderList') orderList: OrderItemListComponent;
  @ContentChildren(FormGroupDirective, { descendants: true }) formGroups: QueryList<FormGroupDirective>;

  dropshipList: IVendorItems[];
  selectedItem: any;
  selectedRow: any;

  action = 'edit';
  loading: boolean;
  priceInventoryDialog: any;
  addForm: any;
  products: any[] = [];
  actionView: string;
  decoData: any;
  selectedDecorations: any;
  copyDecorationPayload: any;
  copyChargesPayload: any;

  /* I'm not sure this is the best place for this
    just seems straightforward to receive an event
   from socketio and prompt a user to refresh
   */
  private _socketSub: Subscription;
  refreshPromptDialog: any;

  constructor(
    private api: ApiService,
    private msgService: MessageService,
    private dialog: MatDialog,
    private orderService: EcommerceOrderService,
    private cd: ChangeDetectorRef,
    private productsService: EcommerceProductsService,
    private artworks: ArtworksService,
    private store: Store<fromOrderForm.State>,
    private socket: SocketService,
  ) { }

  ngOnInit() {
    // Setup order config
    // this.api.getAdvanceSystemConfigAll({ module: 'Orders' })
    this.store.dispatch(new LoadLocalWarehouses());

    this._socketSub = this.socket.orderRemoteChange.pipe(
      map(msg => msg.data.username),
    ).subscribe((user) => this.openRefreshOrderPrompt(user));


  }
  ngAfterContentInit() {
    // contentChildren is set
  }

  displayFn(item?: ILineItem): string | undefined {
    return item ? item.productName : undefined;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.order) {
      // this.gatherDropship();
    }
  }

  syncTaxJar() {
    this.vm.saveIfDirty().subscribe((action) => {
      this.store.dispatch(new SyncTaxJar({ id: this.order.id }));
    });
  }

  syncShipStation() {
    this.vm.saveIfDirty().subscribe((action) => {
      this.store.dispatch(new SyncShipStation({ id: this.order.id }));
    });
  }

  /*
  toggleTax() {
    if(confirm("This will make all line items (taxable|non-taxable). Proceed?")) {
      this.api.updateLineItemsNonTaxable({id: this.order.id }).subscribe((res: any) => {
        this.msgService.show('Order Line Items Changed!', 'info');
      });
    }
  }*/

  gatherDropship() {
    // list of items needing dropshipping
    this.dropshipList = this.order.lineItems.reduce((vendors, line) => {
      const dropshipRows = line.matrixRows.filter((row) => row.poType === 'DropShip');
      if (dropshipRows.length) {
        const vendorIndex = vendors.findIndex((vendor) => vendor.id === line.vendorId)
        const match = {
          ...line,
          matrixRows: dropshipRows
        };
        if (vendorIndex === -1) {
          vendors.push({
            id: line.vendorId,
            name: line.vendorName,
            items: [match],
          })
        } else {
          vendors[vendorIndex].items.push(match);
        }
      }
      return vendors;
    }, []);
  }

  openLineItemImageDialog(_row, item, featuredImage = false) {
    // Shallow clone for immutability

    let payload: any;
    if(featuredImage && item.quoteCustomImage){
        payload = { ...item, image: item.quoteCustomImage[0] ? item.quoteCustomImage[0] : '' };
    }else{
        payload = { ...item, image: _row.imageUrl };
        payload.matrixRows = [{ ..._row }];
    }
    

    const dialogRef = this.dialog.open(LineitemImageUploadDialogComponent, {
      data: {
        folderId: this.orderService.rootFolderId,
        row: payload,
        emitValue: true,
      }
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        if(featuredImage){
        payload.quoteCustomImage = [res.url];
        this.store.dispatch(new UpdateLineItem(payload));
        }else{
                payload.matrixRows.forEach((row) => {
                  row.imageUrl = res.url;
                });
                this.store.dispatch(new UpdateMatrixRow({
                  row: payload.matrixRows[0],
                  lineItemUpdateId: item.lineItemUpdateId,
                  valid: true
                }));
        }

      }
    });
  }

  selectItem(item, product?: Partial<ProductDetails>) {
    this.actionView = 'order-item-form';

    const dialogRef = this.dialog.open(OrderItemFormComponent, {
      width: '80%',
      maxWidth: '600px',
    });

    dialogRef.componentInstance.item = item;
    dialogRef.componentInstance.product = product;
    dialogRef.componentInstance.config = this.config;
    dialogRef.componentInstance.accountId = this.order.accountId;

    dialogRef.afterClosed().subscribe((action) => {
      if (action) {
        this.store.dispatch(new UpdateLineItem(action.payload));
      }
    });
  }

  closeOrderItemForm() {
    this.selectedItem = undefined;
    this.aside.close();
  }

  selectDecorationDialog(item, row) {
    let dialogRef;
    dialogRef = this.dialog.open(SelectDecorationComponent, {
      panelClass: 'select-decoration-dialog'
    });

    dialogRef.afterClosed()
      .subscribe(data => {
        if (data) {
          let decoDialogRef;
          if (data.type === 'New') {

            decoDialogRef = this.dialog.open(OrderDecorationNewComponent, {
              width: '90vw',
              height: '90vh',
            });

            decoDialogRef.componentInstance.order = this.order;
            const artwork = new Artwork();
            artwork.customerId = this.order.accountId;
            artwork.customerName = this.order.accountName;
            artwork.orderIdentity = this.order.orderIdentity;
            decoDialogRef.componentInstance.decoData = ['new', artwork.toObject()];

            decoDialogRef.afterClosed().subscribe((res) => {
              if (res) {
                const designsToModify = [{
                  designId: res.designId,
                  orderId: this.order.id,
                  lineItemId: item.lineItemUpdateId,
                  matrixRowIds: [row.matrixUpdateId],
                  variationToChooseFrom: {},
                }];

                const selectDialogRef = this.dialog.open(OrderDecorationSelectComponent, {
                  // panelClass: 'select-decoration-dialog',
                  width: '100vw',
                  height: '100vh',
                        data: {
                          customerName: this.order.accountName
                        }                  
                });

                selectDialogRef.afterOpened().subscribe(() => {
                  // Configure component
                  setTimeout(() => {
                    selectDialogRef.componentInstance.order = this.order;
                    selectDialogRef.componentInstance.item = item;
                    selectDialogRef.componentInstance.row = row;
                    selectDialogRef.componentInstance.designsToModify = designsToModify;

                    // Apply filter to show customer artwork
                    selectDialogRef.componentInstance.artworkList
                      .filterForm.patchValue({
                        customerName: this.order.accountName
                      });

                    selectDialogRef.componentInstance.artworkList.filterArtworks();
                  }, 50);
                });

                selectDialogRef.afterClosed().subscribe((action) => {
                  if (action) {
                    this.handleDecorationActions(action);
                  }
                });

                // this.store.dispatch(new AddDecoration(payload));
              }
            });

            // this.onViewChanged.emit('decoration-new');
          }
          else if (data.type === 'Modify') {

            const selectDialogRef = this.dialog.open(OrderDecorationSelectComponent, {
              // panelClass: 'select-decoration-dialog',
              width: '100vw',
              height: '100vh',
                        data: {
                          customerName: this.order.accountName
                        }         
            });

            selectDialogRef.afterOpened().subscribe(() => {
              // Configure component
              setTimeout(() => {
                selectDialogRef.componentInstance.order = this.order;
                selectDialogRef.componentInstance.item = item;
                selectDialogRef.componentInstance.row = row;
                selectDialogRef.componentInstance.action = 'modify';

                // Apply filter to show customer artwork
                selectDialogRef.componentInstance.artworkList
                  .filterForm.patchValue({
                    customerName: this.order.accountName
                  });

                selectDialogRef.componentInstance.artworkList.filterArtworks();
              }, 0);
            });

            selectDialogRef.afterClosed().subscribe((action) => {
              if (action) {
                this.handleDecorationActions(action);
              }
            });

            // this.onViewChanged.emit('decoration-select-edit');
          }
          else if (data.type === 'Select') {

            const selectDialogRef = this.dialog.open(OrderDecorationSelectComponent, {
              // panelClass: 'select-decoration-dialog',
              width: '100vw',
              height: '100vh',
                        data: {
                          customerName: this.order.accountName
                        }         
            });

            this.artworks.payload.term = {
              ...this.artworks.payload.term,
              customerName: this.order.accountName
            };

            selectDialogRef.afterOpened().subscribe(() => {
              // Configure component
              setTimeout(() => {
                selectDialogRef.componentInstance.order = this.order;
                selectDialogRef.componentInstance.item = item;
                selectDialogRef.componentInstance.row = row;
                selectDialogRef.componentInstance.action = 'select';

                // Apply filter to show customer artwork
                selectDialogRef.componentInstance.artworkList
                  .filterForm.patchValue({
                    customerName: this.order.accountName
                  });

                selectDialogRef.componentInstance.artworkList.filterArtworks();
              }, 59);
            });

            selectDialogRef.afterClosed().subscribe((action) => {
              if (action) {
                this.handleDecorationActions(action);
              }
            });


          }
          else if (data.type === 'Attach') {

            const attachDialogRef = this.dialog.open(AttachDesignDialogComponent, {
              data: {
                parentFolderId: this.orderService.rootFolderId,
              }
            });

            attachDialogRef.afterClosed().subscribe(res => {

              const variation = res.design.variation[0];
              const payload: any = {
                designsToModify: [{
                  designId: res.designId,
                  orderId: this.order.id,
                  lineItemId: item.lineItemUpdateId,
                  matrixRowIds: [row.matrixUpdateId],
                  variationId: variation.design_variation_unique_id,
                  variationToChooseFrom: {},
                }]
              };

              payload.designsToModify[0].variationToChooseFrom[row.matrixUpdateId] = variation.design_variation_unique_id;

              this.store.dispatch(new AddDecoration(payload));
            });


            // this.attach.emit();
          }
          this.cd.markForCheck();
        }
      });
  }

  showDecorationsList(item, row) {
    this.selectDecorationDialog(item, row);
  }

  openChargesDialog(payload: { item: LineItem, product: ProductDetails, vendor?: IDecoVendor }) {
    let dialogRef;

    const charges = payload.vendor ? payload.vendor.addonCharges : payload.item.addonCharges;

    dialogRef = this.dialog.open(AdditionalChargesComponent, {
      data: {
        charges: charges,
        deco: payload.vendor,
        config: this.config,
        item: payload.item,
        product: payload.product,
        oId: this.order.id
      }
    });

    dialogRef.afterClosed()
      .subscribe(data => {
        if (data && data.action === 'save') {

          const _payload: any = {
            orderId: this.order.id,
            lineItemUpdateId: payload.item.lineItemUpdateId,
            data: data,
          };
          if (payload.vendor) {
            _payload.vendor = payload.vendor;
          }

          this.vm.saveIfDirty().subscribe((action) => {
            this.store.dispatch(new SaveChargeDialog(_payload));
          });

        }
      });
  }

  private emitSave() {
    // TODO: Cleanup component hierarchies
    this.save.emit(true);
  }

  openPricingDialog(item: LineItem) {
    // this.loading = true;
    const lineItem = { ...item };

      // this.loading = false;
      this.priceInventoryDialog = this.dialog.open(PricingInventoryNewComponent, {
        panelClass: 'price-inventory-dialog',
        width: '95vw',
        maxWidth: '95vw',
        data: {
          lineItem,
          oId: this.order.id,
          order: this.order,
          configState: this.config
        }
      });

      this.priceInventoryDialog.afterClosed()
        .subscribe((data: any) => {
          this.priceInventoryDialog = null;

          if (!data) {
            return;
          }

          if (data.action === 'save') {
            // this.loading = true;
            lineItem.productMargin = data.margin;
            lineItem.priceType = data.priceType;
            lineItem.modifiedPriceBreaks = data.modifiedPriceBreaks;
            lineItem.uomConversionRatio = data.uomConversionRatio;
            lineItem.uomId = data.uomId;

            // Rows returned from dialog with new pricing
            lineItem.matrixRows = data.matrixRows.map((row, index) => {
              // Keep any manual price overrides
              row.uomConversionRatio = data.uomConversionRatio;
              row.uomId = data.uomId;
              row.rowIndex = index;
              row.quantity = row.unitQuantity * row.uomConversionRatio;
              return row;
            });

            // Update addon-charge qty with new product quantity
            const totalCount = data.matrixRows.map(row => Number(row.quantity)).reduce((sum, qty) => {
              sum += qty;
              return sum;
            }, 0);

            lineItem.addonCharges = lineItem.addonCharges.map((charge) => {
              const addonCharge = new AdditionalCharge(charge);
              if (addonCharge.matchOrderQty) {
                addonCharge.quantity = totalCount;
              }
              return addonCharge.toObject();
            });

            lineItem.decoVendors = lineItem.decoVendors.map(_decoVendor => {
              let decoTotalCount = 0;
              // Shallow clone deco vendor
              const decoVendor = { ..._decoVendor };
              decoVendor.decorationDetails = decoVendor.decorationDetails.map(_decoDetail => {

                // Shallow clone deco detail
                const decoDetail = { ..._decoDetail };

                const mrow = data.matrixRows.find((row) => row.matrixUpdateId === decoDetail.matrixId);
                if (mrow) {
                  decoDetail.decoProductQty = mrow.quantity;
                  decoTotalCount += mrow.quantity;
                }
                return decoDetail;
              });
              decoVendor.quantity = decoTotalCount;
              return decoVendor;
            });
            //
            this.store.dispatch(new UpdateLineItem(lineItem));
            this.vm.saveIfDirty().subscribe((action) => {
            });
          }
        }, () => {
          this.priceInventoryDialog = null;
        });
  }


  handleAction(action) {
    // Item
    if (action.type === 'editItem') {
      this.selectItem(action.event.item, action.event.product);
    }

    if (action.type === 'useProductPricing') {
      const item = { ...action.payload.item, priceType: null };
      this.store.dispatch(new UpdateLineItem(item));
    }

    if (action.type === 'duplicateItem') {
      const item = action.payload.item;

      this.vm.saveIfDirty().subscribe((action) => {
        this.store.dispatch(new DuplicateLineItem({ item: item }));
      });
    }

    if (action.type === 'deleteItem') {
      this.store.dispatch(new DeleteLineItem(action.payload));
    }

    if (action.type === 'itemChange') {
      if (action.payload && action.valid) {
        this.store.dispatch(new UpdateLineItem(action.payload));
      }
    }

    if (action.type === 'UpdateItemRows') {
      this.store.dispatch(new UpdateItemRows(action.item, action.payload));
    }

    if (action.type === 'LoadArtProofs') {
      this.store.dispatch(new LoadOrderArtProofs({ id: this.order.id }));
    }
    if (action.type === 'DeleteArtProof') {
      this.store.dispatch(new DeleteArtProof({ id: action.payload.id }));
    }

    if (action.type === 'editOrderNotes') {
      const dialogRef = this.dialog.open(ProductNoteComponent, {
        panelClass: 'product-note-dialog',
        data: {
          type: 'Order Note',
          orderNote: this.order.orderNote ? this.order.orderNote : '',
          oId: this.order.id
        }
      });

      dialogRef.afterClosed()
        .subscribe((orderNote: any) => {
          if (!orderNote) { return; }
          const order = { ...this.order };
          order.orderNote = orderNote;
          this.store.dispatch(new SaveOrder(order));
        });
    }

    if (action.type === 'copyCharges') {
      this.copyChargesPayload = action.payload;
    }

    if (action.type === 'editVendorNotes') {
      const item = { ...action.payload.item };
      const dialogRef = this.dialog.open(ItemNotesDialogComponent, {
        panelClass: 'product-note-dialog',
        width: '80%',
        height: '80%',
        data: {}
      });
      dialogRef.componentInstance.item = item;
      dialogRef.componentInstance.order = this.order;
      dialogRef.componentInstance.config = this.config;

      dialogRef.afterClosed()
        .subscribe((res: any) => {
          if (!res) { return; }

          const order = {
            ...this.order,
            orderNote: res.orderNote,
            workOrderNote: res.workOrderNote,
            lineItems: [...this.order.lineItems],
          };
          item.vendorPONote = res.vendorPONote;
          item.decoVendors = item.decoVendors.map((_vendor, index) => {
            const vendor = { ..._vendor };

            if (res.decoVendors[index]) {
              vendor.decorationNotes = res.decoVendors[index].decorationNotes;
              vendor.isGeneralNote = res.decoVendors[index].isGeneralNote ? "1" : "0";
            }
            return vendor;
          });

          const lineItemIndex = order.lineItems.findIndex((_item: any) => {
            return _item.lineItemUpdateId === item.lineItemUpdateId;
          });

          if (lineItemIndex !== -1) {
            order.lineItems[lineItemIndex] = item;
          }

          this.store.dispatch(new SaveOrder(order));
        });

      // const dialogRef = this.dialog.open(ProductNoteComponent, {
      //   panelClass: 'product-note-dialog',
      //   data: {
      //     type: 'Vendor Note',
      //     vendorPONote: item.vendorPONote ? item.vendorPONote : '',
      //     oId: this.order.id
      //   }
      // });

      // dialogRef.afterClosed()
      //   .subscribe((vendorPONote: any) => {
      //     if (!vendorPONote) { return; }
      //     item.vendorPONote = vendorPONote;
      //     this.store.dispatch(new UpdateLineItem(item));
      //   });
    }

    if (action.type === 'itemDropped') {
      this.store.dispatch(new ReorderItemDropped(action.items));
    }

    if (action.type === 'fetchProductAndWarehouses') {
      this.store.dispatch(new LoadProduct(action.item.productId));
    }

    if (action.type === 'fetchInventory') {
      this.store.dispatch(new LoadProductInventory(action.product, action.color));
    }

    if (action.type === 'editProductDescription') {

    }

    if (action.type === 'priceDialogTrigger') {
      this.openPricingDialog(action.event);
    }

    // Addon Charges
    if (action.type === 'openChargesDialog') {
      this.vm.saveIfDirty().subscribe((res) => {
        this.openChargesDialog(action.payload);
      });
    }

    if (action.type === 'loadDecoVendorsByType') {
      this.store.dispatch(new LoadDecorationVendorsForType({
        decoType: action.decoType
      }));
    }

    if (action.type === 'decoAddonChargeChanged') {
      this.store.dispatch(new UpdateCharge(action, 'decoVendor'));
    }

    if (action.type === 'itemAddonChargeChanged') {
      this.store.dispatch(new UpdateCharge(action.event));
    }

    // Decorations
    if (action.type === 'changeDecorationVariation') {

      const designsToModify = [{
        designId: action.decoration.designId,
        orderId: this.order.id,
        lineItemId: action.item.lineItemUpdateId,
        matrixRowIds: [action.row.matrixUpdateId],
        variationToChooseFrom: {},
      }];

      const selectDialogRef = this.dialog.open(OrderDecorationSelectComponent, {
        // panelClass: 'select-decoration-dialog',
        width: '100vw',
        height: '100vh',
                        data: {
                          customerName: this.order.accountName
                        }         
      });

      selectDialogRef.afterOpened().subscribe(() => {
        // Configure component
        setTimeout(() => {
          selectDialogRef.componentInstance.order = this.order;
          selectDialogRef.componentInstance.item = action.item;
          selectDialogRef.componentInstance.row = action.row;
          selectDialogRef.componentInstance.action = 'select';
          selectDialogRef.componentInstance.designsToModify = designsToModify;

          // Apply filter to show customer artwork
          selectDialogRef.componentInstance.artworkList
            .filterForm.patchValue({
              customerName: this.order.accountName
            });

          selectDialogRef.componentInstance.artworkList.filterArtworks();
        }, 0);
      });

      selectDialogRef.afterClosed().subscribe((selectAction) => {
        if (selectAction) {
          const payload = {
            deco: action.decoration,
            designsToModify: selectAction.designsToModify,
            item: action.item,
            row: action.row
          };

          this.store.dispatch(new ChangeDesignVariation(payload));
        }
      });

    }
    if (action.type === 'decoChanged') {
      action.orderId = this.order.id;
      this.store.dispatch(new UpdateDecoration(action));
    }
    if (action.type === 'createNewItemFromProduct') {
      this.addToOrder([action.payload.product.id]);
    }

    if (action.type === 'deleteSelectedDecorations') {
      const ids = action.payload.selection.map((vendor) => vendor.decoVendorRecordId);

      this.store.dispatch(new DeleteDecorations({
        orderId: this.order.id,
        lineItemId: action.payload.item.id,
        ids: ids,
      }));
    }
    if (action.type === 'deleteDecoration') {
      this.store.dispatch(new DeleteDecorations({
        orderId: this.order.id,
        lineItemId: action.payload.item.lineItemUpdateId,
        ids: [action.payload.decoVendorRecordId],
      }));
    }

    if (action.type === 'changeDecorationVariation') {
    }

    if (action.type === 'openDecorationList') {
      const row = { ...action.row };
      row.lineItem = action.item;
      row.matrixRows = [{ ...action.row }];

      this.selectedItem = action.item;
      this.selectedRow = action.row;

      this.showDecorationsList(action.item, row);
      this.cd.markForCheck();
    }

    if (action.type === 'copySelectedDecorations') {
      this.copyDecorationPayload = action.payload;
    }

    if (action.type === 'openDecoChargesDialog') {
      this.openChargesDialog(action.payload);
    }


    // Matrix Rows
    if (action.type === 'itemRowChange') {
      if (action.event && action.event.valid) {

        this.store.dispatch(new UpdateMatrixRow({
          row: action.event.data,
          lineItemUpdateId: action.event.data.lineItemUpdateId,
          valid: action.event.valid,
        }));

        // TODO: Move to effects
        // this.orderService.updateOrderLineItemMatrixRows(item, rows).subscribe((res) => {
        //   this.orderService.getOrder(this.order.id).subscribe((res) => console.log(res));
        // });

      }
    }

    if (action.type === 'itemRowChangeImage') {
      this.openLineItemImageDialog(action.row, action.item);
    }

    if (action.type === 'itemChangeImage') {
      this.openLineItemImageDialog(action.row, action.item, true);
    }
    
    if (action.type === 'deleteAddonCharge') {
      if (action.payload) {

        this.store.dispatch(new DeleteCharge({
          orderId: this.order.id,
          lineItemUpdateId: action.payload.lineItemUpdateId,
          addonChargeUpdateIds: action.payload.addonChargeUpdateIds
        }));

      }
    }

    if (action.type === 'itemRowDelete') {
      if (action.data) {
        const { row } = action.data;
        this.store.dispatch(new DeleteMatrixRows({
          ids: [row.matrixUpdateId],
          rows: [row]
        }));
      }
    }
  }
  pasteSelectedCharges() {
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.vm.saveIfDirty().subscribe((action) => {
      const sourceCharges = this.copyChargesPayload.selection;
      const targetRows = this.orderList.selection.selected;

      confirmDialogRef.componentInstance.confirmMessage = `Are you sure you want to copy the
        ${sourceCharges.length} selected addons to the selected items?`;

      confirmDialogRef.afterClosed().subscribe(result => {
        if (result) {

          this.vm.saveIfDirty().subscribe((res) => {
            this.store.dispatch(new PasteCharges({
              sourceCharges: sourceCharges,
              targetRows: targetRows
            }));

            this.copyChargesPayload = undefined;
            this.orderList.selection.clear();
          });
        }
      });
    });
  }

  pasteSelectedDecorations() {

    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });
    const decoSelection = this.copyDecorationPayload.selection;
    const itemSelection = this.orderList.selection.selected;

    confirmDialogRef.componentInstance.confirmMessage = `Are you sure you want to copy the
        ${decoSelection.length} selected decorations
        to the ${itemSelection.length} items?`;

    confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vm.saveIfDirty().subscribe((action) => {
          this.store.dispatch(new PasteDecorations({
            sourceItem: this.copyDecorationPayload.item,
            sourceRow: this.copyDecorationPayload.row,
            decoSelection: decoSelection,
            itemRowsSelection: itemSelection
          }));

          this.copyDecorationPayload = undefined;
          this.orderList.selection.clear();
        });
      }
    });
  }

  deleteSelection() {
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete selected line item(s)?';

    confirmDialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        if (this.orderList.selection.hasValue()) {
          const rows = this.orderList.selection.selected;
          const ids = rows.map((row) => {
            return row.matrixUpdateId;
          });

          this.vm.saveIfDirty().subscribe((res) => {
            this.store.dispatch(new DeleteMatrixRows({ ids: ids, rows: rows }));
            this.orderList.selection.clear();
          });

        }
      }
    });
  }

  addToOrder(ids) {
    if (ids && ids.length == 0) {
      return;
    }

    this.productsService.messageQueue.next({
      type: 'set-loading',
      extra: true
    });

    let isKitFound = false;
    let kitProductsQty = {};
    const orderConfig: any = new ProductConfig(this.config.module.settings).toObject();

    // TODO: refactor to simplify
    this.api.getProductBriefDetails(ids)
      .subscribe((res: any) => {

        isKitFound = res.some(product => product.productType == '2');
        kitProductsQty = {};

        if (isKitFound) {
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
                kitProductsQty[product.id] = product.kitQty;
              });

              forkJoin(
                ids.map(pid =>
                  this.api.getProductDetailsCurrency(pid)
                )
              ).pipe(
                switchMap((products: any) => {
                  const payload = {
                    products: products.map((p) => {
                      const chargeSalesTax = p.taxEnabled == '1' && orderConfig.chargeSalesTax == '1';
                      const chargeGstTaxOnPo = orderConfig.enableGstOnPo == '1' && orderConfig.chargeGstTaxOnPo == '1';
                      const defaultImage = p.MediaContent && p.MediaContent[0] && p.MediaContent[0].url;
                      const firstSku = p.ProductPartArray.ProductPart[0];
                      const firstRow = new MatrixRow({
                        quantity: kitProductsQty[p.id],
                        unitQuantity: kitProductsQty[p.id],
                        uomConversionRatio: 1,
                        size: firstSku.ApparelSize.labelSize,
                        color: firstSku.ColorArray.Color.colorName,
                        cost: firstSku.partPrice.PartPriceArray.PartPrice[0].price,
                        origCost: firstSku.partPrice.PartPriceArray.PartPrice[0].price,
                        price: firstSku.partPrice.PartPriceArray.PartPrice[0].salePrice,
                        origPrice: firstSku.partPrice.PartPriceArray.PartPrice[0].salePrice,
                        priceStrategy: orderConfig.defaultProductPriceStrategy || 'MANUAL',
                        costStrategy: orderConfig.defaultProductCostStrategy || 'MANUAL',
                        poType: 'DropShip',
                      });
                      return {
                        ...p,
                        ...orderConfig,
                        productId: p.id,
                        itemNo: p.productId,
                        customerDescription: p.description,
                        chargeSalesTax: chargeSalesTax ? '1' : '0',
                        chargeGstTaxOnPo: chargeGstTaxOnPo ? '1' : '0',
                        salesTaxOff: !p.taxEnabled,
                        quoteCustomImage: [defaultImage],
                        quantity: kitProductsQty[p.id],
                        unitQuantity: kitProductsQty[p.id],
                        matrixRows: [
                          firstRow
                        ],
                        decoVendors: [],
                        sortOrder: this.order.lineItems.length,
                        showAttribColor: p.showColor ? '1' : '0',
                        showAttribSize: p.showSize ? '1' : '0',
                      };
                    })
                  };

                  this.store.dispatch(new AddProductsToOrder(payload));

                  this.productsService.messageQueue.next({
                    type: 'set-loading',
                    extra: false
                  });
                  return of(true);
                }),
              ).subscribe(
                () => {
                  this.productsService.messageQueue.next({
                    type: 'set-loading',
                    extra: false
                  });
                },
                () => {
                  this.productsService.messageQueue.next({
                    type: 'set-loading',
                    extra: false
                  });
                }
              );
            }
          });
        } else {
          forkJoin(
            ids.map(pid =>
              this.api.getProductDetailsCurrency(pid)
            )
          ).subscribe((products: any[]) => {
            const payload: { products: any } = {
              products: products.map((p) => {
                const chargeSalesTax = p.taxEnabled == '1' && orderConfig.chargeSalesTax == '1';
                const chargeGstTaxOnPo = orderConfig.enableGstOnPo == '1' && orderConfig.chargeGstTaxOnPo == '1';
                const defaultImage = p.MediaContent && p.MediaContent[0] && p.MediaContent[0].url;
                const firstSku = p.ProductPartArray.ProductPart[0];
                const item = {
                  ...p,
                  ...orderConfig,
                  productId: p.id,
                  itemNo: p.productId,
                  customerDescription: p.description,
                  chargeSalesTax: chargeSalesTax ? '1' : '0',
                  chargeGstTaxOnPo: chargeGstTaxOnPo ? '1' : '0',
                  quoteCustomImage: [defaultImage],
                  quantity: kitProductsQty[p.id],
                  showAttribColor: p.showColor ? '1' : '0',
                  showAttribSize: p.showSize ? '1' : '0',
                  decoVendors: [],
                  matrixRows: [
                    new MatrixRow({
                      quantity: 1,
                      size: firstSku.ApparelSize.labelSize,
                      color: firstSku.ColorArray.Color.colorName,
                      cost: firstSku.partPrice.PartPriceArray.PartPrice[0].price,
                      origCost: firstSku.partPrice.PartPriceArray.PartPrice[0].price,
                      price: firstSku.partPrice.PartPriceArray.PartPrice[0].salePrice,
                      origPrice: firstSku.partPrice.PartPriceArray.PartPrice[0].salePrice,
                      priceStrategy: orderConfig.defaultProductPriceStrategy || 'MANUAL',
                      costStrategy: orderConfig.defaultProductCostStrategy || 'MANUAL',
                      poType: 'DropShip',
                    }).toObject()
                  ],
                  sortOrder: this.order.lineItems.length,
                };
                return item;
              })
            };

            this.store.dispatch(new AddProductsToOrder(payload));

            this.productsService.messageQueue.next({
              type: 'set-loading',
              extra: false
            });
          },
            () => {
              this.productsService.messageQueue.next({
                type: 'set-loading',
                extra: false
              });
            }
          );
        }
      }, () => {
        this.productsService.messageQueue.next({
          type: 'set-loading',
          extra: false
        });
      });
  }

  handleDecorationActions(action) {
    if (action.type === 'selectArtwork') {
      this.vm.saveIfDirty().subscribe((res) => {
        this.store.dispatch(new AddDecoration(action));
      });
    }
  }

  resetLocalChanges() {
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to discard your changes?';

    confirmDialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.reload.emit(true);
      }
    });
  }

  findProducts() {
    let dialogRef;
    dialogRef = this.dialog.open(OrderFindProductsComponent, {
      panelClass: 'order-find-products',
      width: '90vw',
      height: '90vh',
    });

    dialogRef.afterClosed().subscribe((action) => {
      if (action) {
        if (action.type === 'productAddedToOrder') {
          this.store.dispatch(new LoadOrder({ id: this.order.id }));
        } else {
          this.addToOrder(action.payload);
        }
      }
    });
  }

  openRefreshOrderPrompt(user: string) {
    if (this.refreshPromptDialog) return;
    this.refreshPromptDialog = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.refreshPromptDialog.componentInstance.confirmMessage = 
        'This order was updated by ' + user + '. Saving your current changes will overwrite these changes. Would you like to refresh and update to the newest changes (Recommended)?';

    this.refreshPromptDialog.afterClosed().pipe(
        finalize(() => this.refreshPromptDialog = undefined),
    ).subscribe((confirm) => {
      if (confirm) {
        this.reload.emit(true);
      }
    });
  }

  onPaste(event) {
    console.log('ORDER FORM PASTE', event);
  }

  toggleHideCost() {
    this.store.dispatch(new UpdateConfig({
      hideCost: !this.config.hideCost
    }));
  }

  toggleHideVendor() {
    this.store.dispatch(new UpdateConfig({
      hideVendor: !this.config.hideVendor
    }));
  }
}

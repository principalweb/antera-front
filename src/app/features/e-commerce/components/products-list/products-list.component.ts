import { Component, OnInit, ViewEncapsulation, ViewChild, Directive, Input, EventEmitter, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { find, findIndex, each, assign, sum } from 'lodash';
import { Subscription, Observable, forkJoin, of } from 'rxjs';

import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { SelectionService } from 'app/core/services/selection.service';
import { AuthService } from 'app/core/services/auth.service';
import { PermissionService } from 'app/core/services/permission.service';
import { MatrixRow, Artwork, Design, ArtworkVariation, AdditionalCharge, Site } from 'app/models';

import { ProductDescriptionComponent } from '../product-description/product-description.component';
import { OrderMessagesComponent } from '../order-messages/order-messages.component';
import { PricingInventoryComponent } from '../pricing-inventory/pricing-inventory.component';
import { ProductDetailsDialogComponent } from '../product-details-dialog/product-details-dialog.component';
import { AdditionalChargesComponent } from '../additional-charges/additional-charges.component';
import { EcommerceOrderService } from '../../order.service';
import { SelectDecorationComponent } from '../select-decoration/select-decoration.component';
import { ProductConfigDialogComponent } from '../product-config-dialog/product-config-dialog.component';
import { DecorationsListComponent } from '../decorations-list/decorations-list.component';
import { chain } from '../../utils';
import { ItemTypeDialogComponent } from '../item-type-dialog/item-type-dialog.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { LineitemImageUploadDialogComponent } from '../lineitem-image-upload-dialog/lineitem-image-upload-dialog.component';
import { PriceOverrideComponent } from '../price-overrride/price-override.component';
import { fx2N, displayName } from 'app/utils/utils';
import { ProductNoteComponent } from '../product-note/product-note.component';
import { InventoryService } from 'app/core/services/inventory.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { take, tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'order-details-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductsListComponent implements OnInit {
  @Output() onViewChanged = new EventEmitter();
  @Output() showDetails = new EventEmitter();
  @Output() attach = new EventEmitter();
  @Output() editDecoVariations = new EventEmitter();
  @Input() sysConfig: any;
  sysconfigOrderFormCostDecimalUpto: string;
  sysconfigOrderFormQtyDecimalUpto: string;
  sysconfigOrderFormTotalDecimalUpto: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns = ['checkbox', 'vendor', 'id', 'image', 'color', 'name', 'warehouse', 'size', 'quantity', 'price', 'charges', 'decoType', 'config', 'actions'];
  dataSource: MatTableDataSource<any>;
  order: any;
  checkboxes = {};
  dialogRef: MatDialogRef<ProductDetailsDialogComponent>;
  onOrderChangedSubscription: Subscription;
  onSelectionSubscription: Subscription;
  loading = false;
  artwork: Artwork;
  priceInventoryDialog: MatDialogRef<PricingInventoryComponent>;

  form: FormGroup;

  // Inventory column
  filteredWarehouses$: Observable<Site[]>;
  displayName = displayName;

  loadDone = () => {
    this.loading = false;
  }

  constructor(
    private orderService: EcommerceOrderService,
    private api: ApiService,
    private msg: MessageService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    public selection: SelectionService,
    private inventory: InventoryService,
    private authService: AuthService,
    private permService: PermissionService
  ) { }

  ngOnInit() {

    //this.sysconfigOrderFormCostDecimalUpto = '1.' + this.sysConfig.sysconfigOrderFormCostDecimalUpto + '-' + this.sysConfig.sysconfigOrderFormCostDecimalUpto;
    this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.sysConfig.sysconfigOrderFormCostDecimalUpto;
    this.sysconfigOrderFormQtyDecimalUpto = '1.0-' + this.sysConfig.sysconfigOrderFormQtyDecimalUpto;
    this.sysconfigOrderFormTotalDecimalUpto = '1.2-2';

    this.configureInventory();
    // Inventory
    this.filteredWarehouses$ = this.inventory.onFobChanged.asObservable();

    this.dataSource = new MatTableDataSource([]);

    this.onOrderChangedSubscription =
      this.orderService.onOrderChanged.subscribe((order: any) => {
        this.order = order;

        // Construct the form fields for the warehouse per line item
        this.buildWarehouseForm(order);

        const tableData = [];
        order.lineItems.forEach((lineItem: any) => {

          if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
            lineItem.matrixRows = [new MatrixRow({})];
          }

          lineItem.matrixRows.forEach((row: any) => {
            const defaultImage = (lineItem.quoteCustomImage && lineItem.quoteCustomImage[0]) || '';
            const configFields = [
              'rollAddonChargesToProduct',
              'rollDecoChargesToProduct',
              'rollDecoAddonChargesToProduct',
              'chargeSalesTax',
              'chargeGstTaxOnPo',
              'payCommission',
              'hideLine',
              'overrideInHandDate'
            ];
            let hasConfigs = false;
            for (let i = 0; i < configFields.length; i++) {
              const f = configFields[i];
              if (lineItem[f] === '1') {
                hasConfigs = true;
                i = configFields.length;
              }
            }

            const decoVendors = lineItem.decoVendors.filter((vendor) => {
              return lineItem.matrixRows.some(mrow => vendor.decorationDetails.length && mrow.matrixUpdateId === vendor.decorationDetails[0].matrixId);
            });

            const newRow = {
              vendorName: lineItem.vendorName,
              productName: lineItem.productName,
              productId: lineItem.itemNo,
              lineItemUpdateId: lineItem.lineItemUpdateId,
              image: row.imageUrl || defaultImage,
              quantity: +row.quantity,
              unitQuantity: +row.unitQuantity,
              uomId: row.uomId,
              uomConversionRatio: row.uomConversionRatio,
              uomAbbreviation: row.uomAbbreviation,
              price: row.price,
              color: row.color,
              size: row.size,
              matrixRows: [row],
              decoType: lineItem.decoType,
              decoVendors: decoVendors,
              lineItem,
              hasConfigs,
              showAddonCharges: findIndex(tableData, { lineItemUpdateId: lineItem.lineItemUpdateId }) < 0,
              hasAddonCharges: lineItem.addonCharges && lineItem.addonCharges.length > 0,
              vendorPONote: lineItem.vendorPONote
            }

            tableData.push(newRow);
          });
        });

        tableData.forEach((row, i) => {
          let decoImages = [];
          let decoStatus = true;

          row.decoVendors.forEach(vendor => {
            if (!vendor.decorationDetails) {
              return;
            }

            let j = 0;
            for (; j < vendor.decorationDetails.length; j++) {
              const decoDetail = vendor.decorationDetails[j];
              const mrow = find(row.matrixRows, { matrixUpdateId: decoDetail.matrixId });
              if (mrow && decoDetail) {
                if (decoDetail.variationImagesThumbnail && decoDetail.variationImagesThumbnail[0]) {
                  decoImages.push({
                    location: vendor.decoLocation,
                    url: decoDetail.variationImagesThumbnail[0]
                  });
                } else {
                  decoImages.push({
                    location: vendor.decoLocation,
                    url: '/assets/images/ecommerce/product-image-placeholder.png',
                  });
                }
                break;
              }
            }

            if (j < vendor.decorationDetails.length && (
              vendor.decoStatus !== 'Done' ||
              !vendor.decoLocation ||
              !vendor.vendorId ||
              !vendor.decoChargeId
            )) {
              decoStatus = false;
            }
          });

          let potypes = [];
          row.matrixRows.forEach(mrow => {
            if (!mrow.potype && potypes.indexOf(mrow.poType) < 0) {
              potypes.push(mrow.poType);
            }
          });
          if (potypes.length > 1) {
            row.poType = 'Multiple';
          } else {
            row.poType = potypes[0] || 'DropShip';
          }

          if (decoImages.length > 0 && decoStatus) {
            row.decoTooltip = 'Artwork Approved';
          } else if (decoImages.length > 0 && !decoStatus) {
            row.decoTooltip = 'Artwork Pending';
          } else {
            row.decoTooltip = 'No Artwork has been added';
          }

          row.decoImages = decoImages;
          row.hasDecorations = decoImages.length > 0;
          row.decoStatus = decoStatus;
          row.id = i;
        });

        this.dataSource.data = tableData;
        if (this.paginator && tableData.length <= this.paginator.pageIndex * this.paginator.pageSize) {
          this.paginator.previousPage();
        }

        this.selection.init(
          this.dataSource._pageData(this.dataSource.filteredData)
        );
        this.selection.reset(false);
      });

    this.onSelectionSubscription =
      this.selection.onSelectionChanged.subscribe(selection => {
        this.checkboxes = selection;
      });
  }

  private configureInventory() {
    if (!this.sysConfig.inventoryEnabled) {
      const idx = this.displayedColumns.indexOf('warehouse');
      const _columns = [...this.displayedColumns];
      _columns.splice(idx, 1);
      this.displayedColumns = _columns;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.onOrderChangedSubscription.unsubscribe();
    this.onSelectionSubscription.unsubscribe();
  }

  showProductDescription(row) {
    const dialogRef = this.dialog.open(ProductDescriptionComponent, {
      panelClass: 'product-description-dialog',
      data: { row }
    });

    dialogRef.afterClosed()
      .subscribe(data => {
        if (!data) return;

        if (data.action === 'update') {
          assign(row.lineItem, data.data);

          this.updateOrder(this.order);
        }
      })
  }

  buildWarehouseForm(order: any) {

    if (!this.sysConfig.inventoryEnabled) {
      this.form = this.fb.group({});
    }

    let obj: any = {};

    let matrixCount = 0;
    // obj['items'] = this.fb.array([]);
    order.lineItems.forEach((item) => {
      if (!item.matrixRows || item.matrixRows.length === 0) {
        item.matrixRows = [new MatrixRow({})];
      }
      item.matrixRows.forEach((row: any) => {
        obj['itemId' + matrixCount] = item.id;
        obj['matrixUpdateId' + matrixCount] = row.matrixUpdateId;
        obj['lineItemUpdateId' + matrixCount] = item.lineItemUpdateId;

        if (row.distributorWarehouseId > 0) {
          obj['distributorWarehouseId' + matrixCount] = row.distributorWarehouseId;
          obj['distributorWarehouseName' + matrixCount] = row.distributorWarehouseName;
        } else {
          obj['distributorWarehouseId' + matrixCount] = null;
          obj['distributorWarehouseName' + matrixCount] = null;
        }
        // obj.items.push(this.fb.group({...obj}));
        matrixCount++;
      });
    });
    this.form = this.fb.group(obj);

    this.getSiteList().subscribe((warehouses) => {
      const defaultWarehouse = find(warehouses, { default: '1' });

      if (defaultWarehouse && matrixCount > 0) {
        for (let i = 0; i < matrixCount; i++) {
          const idField = this.form.get('distributorWarehouseId' + i);

          if (idField) {
            if (!idField.value || idField.value === '0') {
              this.selectWarehouse({ value: defaultWarehouse.fobId }, i);
            }
          }
        }
      }
    });
  }

  orderMessages() {
    const dialogRef = this.dialog.open(OrderMessagesComponent);
  }

  pricingInventory(row) {
    if (this.priceInventoryDialog || this.loading) {
      return;
    }

    const lineItem = row.lineItem;

    this.loading = true;

    forkJoin([
      this.api.getProductDetailsCurrency(lineItem.id),
      this.api.getAnteraFob(),
      this.api.getUniversalFob(lineItem.id),
      this.api.getAdvanceSystemConfigAll({ module: 'Orders' })
    ])
      .subscribe(([product, anteraFob, universalFob, config]: any) => {
        this.loading = false;
        this.priceInventoryDialog = this.dialog.open(PricingInventoryComponent, {
          panelClass: 'price-inventory-dialog',
          data: {
            lineItem,
            product: product,
            color: row.color,
            warehouses: anteraFob,
            suppliers: universalFob,
            sysconfigOrderFormCostDecimalUpto: this.sysConfig.sysconfigOrderFormCostDecimalUpto,
            oId: this.order.id,
            productsMargin: config && config.settings && config.settings.productsMargin || 40,
          }
        });

        this.priceInventoryDialog.afterClosed()
          .subscribe((data: any) => {
            this.priceInventoryDialog = null;

            if (!data) return;

            if (data.action === 'save') {
              this.loading = true;
              lineItem.productMargin = data.margin;
              lineItem.priceType = data.priceType;
              lineItem.modifiedPriceBreaks = data.modifiedPriceBreaks;
              lineItem.uomId = data.uomId;
              lineItem.uomConversionRatio = data.uomConversionRatio;

              // Rows with manual price override
              const rowsWithManualPrice = lineItem.matrixRows.reduce((rows, row, index) => {
                if (row.origPrice !== row.price) {
                  rows[row.matrixUpdateId] = row.price;
                }
                return rows;
              }, {});

              // Rows returned from dialog with new pricing
              lineItem.matrixRows = data.matrixRows.map((row) => {
                // Keep any manual price overrides
                if (rowsWithManualPrice[row.matrixUpdateId]) {
                  row.price = rowsWithManualPrice[row.matrixUpdateId];
                }
                return row;
              });

              // Update addon-charge qty with new product quantity
              const totalCount = sum(
                data.matrixRows.map(row => Number(row.quantity))
              );
              lineItem.addonCharges = lineItem.addonCharges.map((charge) => {
                const addonCharge = new AdditionalCharge(charge);
                if (addonCharge.matchOrderQty)
                  addonCharge.quantity = totalCount;
                return addonCharge.toObject();
              });

              lineItem.decoVendors = lineItem.decoVendors.map(decoVendor => {
                let decoTotalCount = 0;
                decoVendor.decorationDetails = decoVendor.decorationDetails.map(decoDetail => {
                  const mrow = find(data.matrixRows, { matrixUpdateId: decoDetail.matrixId });
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
              this.api.updateLineItem(this.order.id, [lineItem]).pipe(
                tap((res: any) => {
                  if (res.status === 'error') {
                    this.msg.show(res.msg, 'error');
                  }
                }),
                switchMap(() => this.orderService.getOrder(this.order.id)),
              ).subscribe(
                this.loadDone,
                this.loadDone
              );
            }
          }, err => {
            this.priceInventoryDialog = null;
          })
      });
  }

  openPriceOverrideDialog(row) {

    const payload = {
      data: {
        row: row,
        price: +row.price.toFixed(this.sysConfig.sysconfigOrderFormCostDecimalUpto),
        unitPrice: +(row.price * row.uomConversionRatio).toFixed(this.sysConfig.sysconfigOrderFormCostDecimalUpto),
        oId: this.order.id
      }
    };
    const dialogRef = this.dialog.open(PriceOverrideComponent, payload);
    dialogRef.afterClosed()
      .subscribe(res => {
        if (res) {
          row.matrixRows.forEach(mrow => {
            mrow.price = parseFloat(res.price);
            mrow.totalPrice = mrow.price * mrow.quantity;
            mrow.profit = (mrow.price - mrow.cost) * mrow.quantity;
            mrow.productMargin = fx2N((mrow.price - mrow.cost) * 100 / mrow.price);
          });

          this.loading = true;
          this.orderService
            .updateOrderLineItemMatrixRows(row.lineItem, row.matrixRows).pipe(
              switchMap(() => this.orderService.getOrder(this.order.id))
            ).subscribe(
              this.loadDone,
              this.loadDone
            );
        }
      });
  }

  openDecoration() {
    window.open('/assets/images/examples/decoration-mockup.png', '_blank');
  }

  addLineItem(productId) {
    const order = this.orderService.order;

    this.loading = true;
    forkJoin([
      this.api.getProductDetailsCurrency(productId),
      this.api.getAdvanceSystemConfigAll({ module: 'Orders' })
    ]).subscribe(res => {
      const details: any = res[0];
      const orderConfig: any = res[1];
      const defaultImage = details.MediaContent && details.MediaContent[0] && details.MediaContent[0].url;
      order.lineItems.push({
        ...details,
        productId: details.id,
        itemNo: details.productId,
        quoteCustomImage: [defaultImage],
        ...orderConfig.settings
      });
      this.updateOrder(order);
    }, this.loadDone);
  }

  deleteLineItem(row) {
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete selected line item(s)?';

    confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        const rowsToDelete = [];
        row.matrixRows.forEach((mrow) => {
          rowsToDelete.push(mrow.matrixUpdateId);
        });

        this.loading = true;
        this.api.deleteLineItemMatrixRows(
          this.order.id,
          row.lineItem.lineItemUpdateId,
          rowsToDelete
        ).pipe(
          switchMap(() => {
            if (row.lineItem.matrixRows.length === rowsToDelete.length) {
              return this.api.deleteLineItems(this.order.id, [row.lineItem.lineItemUpdateId]);
            }

          return of({});
          }),
        ).pipe(
          switchMap(() => this.orderService.getOrder(this.order.id)),
        ).subscribe(this.loadDone, this.loadDone);
      }
    });
  }

  editVendorPONote(row) {
    let dialogRef = this.dialog.open(ProductNoteComponent, {
      panelClass: 'product-note-dialog',
      data: {
        type: 'Vendor Note',
        vendorPONote: !row.vendorPONote ? '' : row.vendorPONote,
        oId: this.order.id
      }
    });

    dialogRef.afterClosed()
      .subscribe((vendorPONote: any) => {
          if (vendorPONote == undefined) return;
          const lineItem = row.lineItem;
          lineItem.vendorPONote = vendorPONote;
          this.loading = true;
          this.api.updateLineItem(this.order.id, [lineItem]).pipe(
            switchMap(() => this.orderService.getOrder(this.order.id))
          ).subscribe(
            this.loadDone
          );
      });
  }

  editOrderNote() {
    let dialogRef = this.dialog.open(ProductNoteComponent, {
      panelClass: 'product-note-dialog',
      data: {
        type: 'Order Note',
        orderNote: !this.order.orderNote ? '' : this.order.orderNote,
        oId: this.order.id
      }
    });

    dialogRef.afterClosed()
      .subscribe((orderNote: any) => {
          if (orderNote == undefined) return;
          this.loading = true;
          this.order.orderNote = orderNote;
          this.api.updateOrder(this.order).pipe(
            switchMap(() => this.orderService.getOrder(this.order.id))
          ).subscribe(
            this.loadDone
          );
      });
  }

  deleteSelectedLineItems() {
    const itemsToDelete = [];

    this.dataSource.data.forEach(
      (row) => {
        if (this.checkboxes[row.id]) {
          row.lineitem
          let item = find(itemsToDelete, { lineItemUpdateId: row.lineItem.lineItemUpdateId });
          if (!item) {
            item = {
              lineItemUpdateId: row.lineItem.lineItemUpdateId,
              matrixUpdateIds: [],
              matrixRowCount: row.lineItem.matrixRows.length
            };

            itemsToDelete.push(item);
          }

          row.matrixRows.forEach(mrow => {
            item.matrixUpdateIds.push(mrow.matrixUpdateId);
          });
        }
      }
    );

    if (itemsToDelete.length === 0) {
      this.msg.show('Please select line items to delete', 'error');
      return;
    }

    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete selected line item(s)?';

    confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        chain(
          itemsToDelete.map(item =>
            this.api.deleteLineItemMatrixRows(
              this.order.id,
              item.lineItemUpdateId,
              item.matrixUpdateIds
            )
          )
        ).finished.pipe(
          switchMap(() => {
            const lineItemUpdateIds = [];

            itemsToDelete.forEach(item => {
              if (item.matrixRowCount <= item.matrixUpdateIds.length) {
                lineItemUpdateIds.push(item.lineItemUpdateId);
              }
            });

            return this.api.deleteLineItems(this.order.id, lineItemUpdateIds);
          }),
          switchMap(() => this.orderService.getOrder(this.order.id))
        ).subscribe(this.loadDone, this.loadDone);
      }
    });
  }

  checkSelection(id) {
    this.selection.toggle(id);
  }

  toggleAll(ev) {
    this.selection.reset(ev.checked);
  }

  refreshChecks() {
    this.selection.init(
      this.dataSource._pageData(this.dataSource.filteredData)
    );
  }

  getPrice(lineItem) {
    if (lineItem.matrixRows &&
      lineItem.matrixRows[0] &&
      lineItem.matrixRows[0].price) {
      return lineItem.matrixRows[0].price;
    }
    return 0;
  }

  getQuantity(lineItem) {
    if (lineItem.matrixRows &&
      lineItem.matrixRows[0] &&
      lineItem.matrixRows[0].quantity) {
      return lineItem.matrixRows[0].quantity;
    }

    return 0;
  }

  updateOrder(order) {
    this.loading = true;
    this.orderService.updateOrder(order)
      .subscribe(
        this.loadDone,
        this.loadDone
      );
  }

  showProductDetails(ev, row) {
    ev.stopPropagation();

    this.showDetails.emit(row.lineItem);
  }

  charge(product) {
    let dialogRef;

    dialogRef = this.dialog.open(AdditionalChargesComponent, {
      data: {
        charges: product.lineItem.addonCharges,
        product: product,
        item: product.lineItem,
        oId: this.order.id
      }
    });

    dialogRef.afterClosed()
      .subscribe(data => {
        if (data && data.action === 'save') {
          this.loading = true;

          let request = this.api.updateAddonCharges(
            this.order.id,
            product.lineItem.lineItemUpdateId,
            data.charges
          );

          if (data.deleted.length > 0) {
            request = request.pipe(
              switchMap(() =>
                this.api.deleteAddonCharges(
                  this.order.id,
                  product.lineItem.lineItemUpdateId,
                  data.deleted
                )
              )
            );
          }

          request.pipe(
            switchMap( () => this.orderService.getOrder(this.order.id))
          ).subscribe(
            this.loadDone,
            this.loadDone
          );
        }
      });
  }

  selectDecorationDialog(row) {
    let dialogRef;

    dialogRef = this.dialog.open(SelectDecorationComponent, {
      panelClass: 'select-decoration-dialog'
    });

    dialogRef.afterClosed()
      .subscribe(data => {
        if (data) {
          if (data.type === 'New') {
            this.onViewChanged.emit('decoration-new');
          }
          else if (data.type === 'Modify') {
            this.onViewChanged.emit('decoration-select-edit');
          }
          else if (data.type === 'Select') {
            this.onViewChanged.emit('decoration-select');
          } else if (data.type === 'Attach') {
            this.attach.emit();
          }
        }
      });
  }

  showItemTypeDialog(row) {
    const dlgRef = this.dialog.open(ItemTypeDialogComponent, {
      panelClass: 'item-type-dialog',
      data: {
        rows: row.matrixRows,
        productId: row.lineItem.id,
        itemNo: row.lineItem.itemNo,
        productName: row.lineItem.productName
      }
    });

    dlgRef.afterClosed().subscribe(
      (res) => {
        if (res) {
          row.matrixRows.forEach((mrow, i) => {
            mrow.poType = res['type' + i];
            mrow.warehouse = res['warehouse' + i];
          });

          this.updateOrder(this.order);
        }
      }
    )
  }

  reopenDecorationsList() {
    const selectedRow = find(this.dataSource.data, { id: this.orderService.selectedRowId });

    if (selectedRow.hasDecorations) {
      this.showDecorationsList(selectedRow);
    } else {
      this.selectDecorationDialog(selectedRow);
    }
  }

  showDecorationsList(row) {
    this.orderService.selectedRowId = row.id;
    this.orderService.selectedLineItemId = row.lineItem.lineItemUpdateId;
    this.orderService.selectedMatrixRows =
      row.matrixRows.map(row => row.matrixUpdateId);
    this.orderService.selectedLineItemColor = row.color;

    if (row.size === '') {
      this.msg.show('Please select color and quantity first', 'error');
      return;
    }

    if (!row.hasDecorations) {
      this.selectDecorationDialog(row);
      return;
    }

    this.api.getAdvanceSystemConfigAll({ module: 'Orders' }).subscribe((config: any) => {
      const dialogRef = this.dialog.open(DecorationsListComponent, {
        data: {
          row,
          oId: this.order.id,
          decoMargin: config.settings.decoMargin,
        },
        panelClass: 'decorations-list-dialog'
      });

      dialogRef.afterClosed().subscribe(
        (res) => {
          this.selection.init(
            this.dataSource._pageData(this.dataSource.filteredData)
          );
          this.selection.reset(false);

          if (!res) return;

          let rows = [];
          switch (res.action) {
            case 'add':
              this.selectDecorationDialog(row);
              break;
            case 'change-variation':
              this.editDecoVariations.emit(res);
              break;
            case 'save':
              this.updateDecoList(row.lineItem, res);
              break;
            case 'apply-to-all':
              // this.updateDecoList(row.lineItem, res);
              rows = this.dataSource.data.slice(0);
              rows.splice(row.id, 1);
              this.applyDesignsToLineItem(row.id, rows, res);
              break;
            case 'apply-to-remaining':
              // this.updateDecoList(row.lineItem, res);
              rows = this.dataSource.data.slice(row.id + 1);
              this.applyDesignsToLineItem(row.id, rows, res);
              break;
          }
        }
      )


    });
  }

  showProductsView() {
    this.onViewChanged.emit('images');
  }

  sizeTooltip(row) {
    let sizes = {};
    each(row.matrixRows, mrow => {
      if (sizes[mrow.size]) {
        sizes[mrow.size] += (+mrow.quantity);
      } else {
        sizes[mrow.size] = (+mrow.quantity);
      }
    });

    let rst = [];
    each(sizes, (q, s) => rst.push(q + ' ' + s));

    return rst.join(', ');
  }

  showConfigDialog(row, index) {
    const dlgRef = this.dialog.open(ProductConfigDialogComponent, {
      panelClass: 'product-config-dialog',
      data: {
        lineitem: row.lineItem,
        oId: this.order.id
      }
    });

    dlgRef.afterClosed().subscribe(data => {
      if (!data) {
        return;
      }

      let i;
      let arr = this.order.lineItems;

      switch (data.action) {
        case 'apply-to-remaining':
          i = findIndex(this.order.lineItems, row.lineItem);
          for (; i < arr.length; i++) {
            assign(arr[i], data.config);
          }
          this.updateOrder(this.order);
          break;

        case 'apply-to-all':
          for (i = 0; i < arr.length; i++) {
            assign(arr[i], data.config);
          }
          this.updateOrder(this.order);
          break;

        case 'save':
          assign(row.lineItem, data.config);
          this.updateOrder(this.order);
          break;
      }
    })
  }

  openLineItemImageDialog(row) {
    const dialogRef = this.dialog.open(LineitemImageUploadDialogComponent, {
      data: {
        folderId: this.orderService.rootFolderId,
        row
      }
    });
  }

  toggleDecoration(visible) {
    if (visible) {
      this.displayedColumns = ['id', 'image', 'color', 'name', 'warehouse', 'size', 'decoVendor', 'decoration1', 'decoration2', 'decoration3', 'decoration4'];
    } else {
      this.displayedColumns = ['checkbox', 'vendor', 'id', 'image', 'color', 'name', 'warehouse', 'size', 'quantity', 'price', 'charges', 'decoType', 'config', 'actions'];
    }
  }

  private applyDesignsToLineItem(rowId, rows, res) {
    const sourceDecorations = [];
    const currentLine = this.dataSource.data[rowId];
    const mrId = currentLine.matrixRows[0].matrixUpdateId;
    const decoMargin = res.data.margin;

    let detailIndex = 0;
    currentLine.decoMargin = decoMargin;
    currentLine.lineItem.decoVendors = currentLine.lineItem.decoVendors.map((vendor) => {
      const decoDetail = find(vendor.decorationDetails, { matrixId: mrId });
      if (decoDetail) {
        // TODO: Fix assignment of index for decoration vendor rows
        const data = {
          ...vendor,
          decoLocation: res.data['decoLocation' + detailIndex],
          vendorSupplierDecorated: res.data['vendorSupplierDecorated' + detailIndex] ? '1' : '0',
          decorationNotes: res.data['decorationNotes' + detailIndex],
          customerPrice: res.data['price' + detailIndex],
          itemCost: res.data['cost' + detailIndex],
        };
        sourceDecorations.push(data);
        detailIndex++;
        return data;
      } else {
        return vendor;
      }
    });

    const lineItems = rows.reduce((_rows, row, index) => {
      let lineItem;

      let lineItemIndex = _rows.findIndex((r) => r.lineItemUpdateId === row.lineItemUpdateId);
      if (lineItemIndex === -1) {
        lineItem = {
          ...row.lineItem,
          decoVendors: row.decoVendors.map(vendor => {
            return {
              ...vendor,
              decorationDetails: [...vendor.decorationDetails],
              addonCharges: [...vendor.addonCharges]
            };
          }),
          decoMargin: decoMargin
        };
      } else {
        lineItem = _rows[lineItemIndex];
      }

      // For each matrix row
      row.matrixRows.forEach((matrixRow) => {
        sourceDecorations.forEach((source) => {
          // Find the deco vendor
          let decoVendor;
          const decoVendorIndex = lineItem.decoVendors.findIndex((vendor) => {
            return vendor.decorationDetails.some((detail) => {
              return detail.matrixId === matrixRow.matrixUpdateId
                && source.decoLocation === vendor.decoLocation
                && source.decorationDetails.map(sourceDetail => sourceDetail.variationUniqueId).includes(detail.variationUniqueId)
            });
          });

          // If it exists update it
          if (decoVendorIndex !== -1) {

            decoVendor = {
              ...lineItem.decoVendors[decoVendorIndex],
              decoLocation: source.decoLocation,
              vendorSupplierDecorated: source.vendorSupplierDecorated,
              itemCost: source.itemCost,
              customerPrice: source.customerPrice,
              quantity: matrixRow.quantity,
            };

            decoVendor.decorationDetails = decoVendor.decorationDetails.map(detail => {
              if (detail.variationUniqueId !== source.variationId && matrixRow.matrixUpdateId !== detail.matrixId) {
                return detail;
              }
              return {
                ...detail,
                decoProductQty: matrixRow.quantity
              };
            });
            const addonCharges = source.addonCharges.reduce((charges, sourceCharge, index) => {
              let charge = decoVendor.addonCharges.find((_charge) => _charge.code === sourceCharge.code);
              if (charge) {
                // Update charge
                charge = {
                  ...charge,
                  cost: sourceCharge.cost,
                  price: sourceCharge.price,
                  matchOrderQty: sourceCharge.matchOrderQty,
                };
                if (sourceCharge.matchOrderQty == '1') {
                  charge.quantity = matrixRow.quantity;
                } else {
                  charge.quantity = sourceCharge.quantity;
                }
              } else {
                // Add new charge
                charge = { ...sourceCharge };
                charge.decoVendorRecordId = decoVendor.decoVendorRecordId;
                charge.addonChargeUpdateId = ''; // I hope this will still work
                if (sourceCharge.matchOrderQty == '1') {
                  charge.quantity = matrixRow.quantity;
                } else {
                  charge.quantity = sourceCharge.quantity;
                }
              }
              charges.push(charge);
              return charges;
            }, []);
            decoVendor.addonCharges = addonCharges;
            // mutatedDecoVendors.push(decoVendor);
            lineItem.decoVendors[decoVendorIndex] = decoVendor;
          } else {
            // make one
            if (matrixRow.matrixUpdateId) {
              decoVendor = {
                ...source,
                decorationDetails: [...source.decorationDetails]
              };

              decoVendor.decoLocation = source.decoLocation;
              decoVendor.vendorSupplierDecorated = source.vendorSupplierDecorated;
              decoVendor.itemCost = source.itemCost;
              decoVendor.customerPrice = source.customerPrice;
              decoVendor.quantity = matrixRow.quantity;
              decoVendor.decoVendorRecordId = '';
              decoVendor.decorationDetails = decoVendor.decorationDetails.map((detail) => {
                return {
                  ...detail,
                  decoDetailId: '',
                  decoVendorRecordId: '',
                  matrixId: matrixRow.matrixUpdateId,
                  decoProductQty: matrixRow.quantity,
                };
              });
              decoVendor.addonCharges = [];

              const addonCharges = source.addonCharges.reduce((charges, sourceCharge, index) => {
                let charge = decoVendor.addonCharges.find((_charge) => _charge.code === sourceCharge.code);
                // Add new charge
                charge = { ...sourceCharge };
                charge.addonChargeUpdateId = ''; // I hope this will still work
                charge.decoVendorRecordId = '';
                if (sourceCharge.matchOrderQty) {
                  charge.quantity = matrixRow.quantity;
                }
                if (sourceCharge.matchOrderQty) {
                  charge.quantity = matrixRow.quantity;
                } else {
                  charge.quantity = 1;
                }
                charges.push(charge);
                return charges;
              }, []);

              decoVendor.addonCharges = addonCharges;

              // mutatedDecoVendors.push(decoVendor);

              lineItem.decoVendors.push(decoVendor);
            }
          }

          // Merge mutated decoVendors for each matrix row 
          // if (decoVendorIndex !== -1) {
          //   lineItem.decoVendors = [...mutatedDecoVendors];
          // } else {
          //   lineItem.decoVendors = [...lineItem.decoVendors, ...mutatedDecoVendors];
          // }
        });

      });


      if (lineItemIndex === -1) {
        _rows.push(lineItem);
      } else {
        _rows[lineItemIndex] = lineItem;
      }
      return _rows;
    }, []);


    // Update current line with form result
    let _currentLine = lineItems.find((item) => {
      return currentLine.lineItem.lineItemUpdateId === item.lineItemUpdateId;
    });
    if (_currentLine) {
      sourceDecorations.forEach((source) => {
        _currentLine.decoVendors.push(source);
      });
    } else {
      currentLine.lineItem.decoVendors = [...sourceDecorations];
      lineItems.push(currentLine.lineItem);
    }

    this.api.updateLineItem(this.orderService.order.id, lineItems).pipe(
      switchMap((res) => {
        return this.orderService.getOrder(this.orderService.order.id);
      }),
    ).subscribe((order) => { });
  }

  private updateDecoList(lineitem, res) {
    lineitem.decoMargin = res.data.margin;

    let vendors = [];
    let i = 0;

    while (res.data['decoId' + i]) {
      const decoId = res.data['decoId' + i];
      const vendor = find(lineitem.decoVendors, { decoVendorRecordId: decoId });
      vendor.vendorSupplierDecorated = res.data['vendorSupplierDecorated' + i] ? '1' : '0';
      vendor.decoLocation = res.data['decoLocation' + i];
      vendor.customerPrice = res.data['price' + i];
      vendor.itemCost = res.data['cost' + i];
      vendor.decorationNotes = res.data['decorationNotes' + i];
      vendors.push(vendor);
      i++;
    }

    this.loading = true;
    this.api.updateDecoVendors(
      this.order.id,
      lineitem.lineItemUpdateId,
      vendors
    ).pipe(
      switchMap(() =>
        this.api.updateOrder(this.order)
      ),
      switchMap(() =>
        this.orderService.getOrder(this.order.id)
      ),
    ).subscribe( (res: any) => {
        this.loading = false;
        if (res.status === 'success') {
          this.orderService.onOrderChanged.next(res.extra);
        }
      },
      this.loadDone
    );
  }

  getSiteList() {
    let payload = {
      type: 'Distributor'
    };
    this.inventory.getFob(payload);
    return this.inventory.onFobChanged.asObservable();
  }

  selectWarehouse(event, i) {
    const warehouseId = event.value;
    this.form.get('distributorWarehouseId' + i).setValue(warehouseId);

    let matrixUpdateId = this.form.get('matrixUpdateId' + i).value;
    let lineItemUpdateId = this.form.get('lineItemUpdateId' + i).value;

    let lineItem = this.order.lineItems.find((item) => item.lineItemUpdateId === lineItemUpdateId);
    let matrixRow = lineItem.matrixRows.find((row) => row.matrixUpdateId === matrixUpdateId);

    if (matrixRow && matrixRow.poType === "DropShip") {
      matrixRow.distributorWarehouseId = warehouseId;
      this.orderService
        .updateOrderLineItemMatrixRows(lineItem, lineItem.matrixRows).pipe(
          switchMap(() => this.orderService.getOrder(this.order.id))
        ).subscribe(() => { });
    }
  }

}

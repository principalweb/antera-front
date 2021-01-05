import {
  Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy,
  ChangeDetectorRef, OnChanges, SimpleChanges, Optional, Host, Output, EventEmitter, ViewChild, ViewChildren
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject } from 'rxjs';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { ILineItem, IMatrixRow, IAddonCharge, FobPoint } from '../interfaces';
import { FormBuilder } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSelectChange } from '@angular/material/select';
import { ProductDetails } from 'app/models';
import { Store } from '@ngrx/store';
import * as fromOrderForm from '../store/order-form.reducer';
import { AddMatrixRow } from '../store/order-form.actions';
import { OrderItemRowComponent } from './order-item-row/order-item-row.component';
import { OrderItemAddonComponent } from '../order-item-addon/order-item-addon.component';
import { OrderFormService } from '../order-form.service';
import { ProductInventory } from '../store/order-form.reducer';
import { ProductDescriptionComponent } from '../../components/product-description/product-description.component';
import { PreviewProductComponent } from 'app/shared/preview-product/preview-product.component';
import { IOrder } from '../interfaces';

@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemComponent implements OnInit, OnDestroy, OnChanges {

  @Input() item: ILineItem;
  @Input() order: IOrder;
  @Input() config: any;
  @Input() draggable: boolean;
  @Input() expandable: boolean;
  @Input() selection: SelectionModel<IMatrixRow>;
  @Input() product: ProductDetails;
  @Input() productFob: FobPoint[];
  @Input() adminFeeEnabled: boolean;
  @Input() localFob: FobPoint[];
  @Input() productInventory: ProductInventory;
  @Output() priceDialogTrigger: EventEmitter<any> = new EventEmitter();
  @Output() clicked: EventEmitter<any> = new EventEmitter();
  @Output() editItem: EventEmitter<any> = new EventEmitter();
  @Output() itemChanged: EventEmitter<any> = new EventEmitter();
  @Output() itemRowChanged: EventEmitter<any> = new EventEmitter();
  @Output() actions: EventEmitter<any> = new EventEmitter();

  @ViewChildren(OrderItemRowComponent) itemRowList;
  @ViewChildren(OrderItemAddonComponent) itemAddonList;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  addonSelection: SelectionModel<Partial<IAddonCharge>>;

  actionView: string;

  expanded = false;
  expandedMatrixRows = {};
  decorationsByRow: any;
  formGroup: any;
  destroyed$ = new Subject<boolean>();
  priceInventoryDialog: any;
  loading: any;

  sizes: any[];
  colors: any[];
  quantities: any[];

  constructor(
    @Host() @Optional() private dragDirective: CdkDrag,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    // Should refactor and keep this component dumb
    private api: ApiService,
    private dialog: MatDialog,
    private store: Store<fromOrderForm.State>,
    private orderFormService: OrderFormService
  ) { }


  toggleView(view) {
    if (this.actionView === view) {
      this.actionView = undefined;
      this.expanded = false;
    } else {
      if (view === 'variations') {
        setTimeout(() => {
          this.itemRowList.forEach((rowComponent) => {
            rowComponent.expand = false;
          });
        }, 0);
      }
      if (view === 'variations-expand') {
        setTimeout(() => {
          this.itemRowList.forEach((rowComponent) => {
            rowComponent.expand = true;
          });
        }, 0);
      }
      this.actionView = view;

      if (!this.product) {
        const action = {
          type: 'fetchProductAndWarehouses',
          item: this.item,
        };

        this.actions.emit(action);
        this.expanded = true;
      } else {
        this.expanded = true;
      }

    }
  }

  ngOnInit() {
    this.setupSelection();
    this.createForm();
  }

  hasDecorations(matrixUpdateId: string) {
    this.item.decoVendors.some((vendor: any) => vendor.decoDetails.matrixId === matrixUpdateId);
  }

  get decoIconClass() {
    if (this.item && this.item.decoVendors) {
      if (this.item.decoVendors.length > 0) {
        const allDone = this.item.decoVendors.every((deco) => deco.decoStatus === 'Done');
        return allDone ? 'green-fg' : 'orange-fg';
      }
    }
    return '';
  }

  get decoIconTooltip() {
    if (this.item && this.item.decoVendors) {
      if (this.item.decoVendors.length > 0) {
        const allDone = this.item.decoVendors.every((deco) => deco.decoStatus === 'Done');
        return allDone ? 'Artwork done' : 'Artwork pending';
      }
    }
    return 'No artwork added';
  }

  // TODO: Refactor away from dumb component
  toggleExpand(row) {
    if (!this.actionView) {
      this.actionView = 'variations';
    }
    if (!this.expanded) {
      // Cache product fetch
      if (!this.product) {

        const action = {
          type: 'fetchProductAndWarehouses',
          item: this.item,
        };

        this.actions.emit(action);
        this.expanded = true;

        // forkJoin([
        //   this.fetchProduct(),
        //   this.fetchUniversalFob(),
        //   this.fetchLocalFob(),
        // ]).subscribe(([product, supplierWarehouses, localWarehouses]: [ProductDetails, any, any]) => {
        //   if (product.productId) {
        //     this.product = product;
        //   }
        //   this.supplierWarehouses = supplierWarehouses.map((warehouse) => {
        //     warehouse.type = 'DropShip';
        //     warehouse.compareKey = warehouse.type + '-' + warehouse.fobId;
        //     return warehouse;
        //   });
        //   this.localWarehouses = localWarehouses.map((warehouse) => {
        //     warehouse.type = 'Stock';
        //     return warehouse;
        //   });

        //   this.loading = false;
        //   this.expanded = true;
        //   this.cd.markForCheck();
        // });
      } else {
        this.expanded = true;
      }
    } else {
      this.expanded = false;
    }
    this.cd.markForCheck();
  }

  openEditItem(item) {
    this.actions.emit({ type: 'editItem', event: { item: item, product: this.product }});
  }

  action(type, event) {
    this.actions.emit({ type: type, event: event });
  }

  private setupSelection() {
    this.addonSelection = new SelectionModel<Partial<IAddonCharge>>(true, []);
  }

  markForCheck() {
    this.cd.markForCheck();
  }

  get usedSupplierDecorations() {
    if (!this.item || !this.product) {
      return '';
    }

    const decorations = {};
    this.item.decoVendors.forEach(deco => {
      const location = this.product.SupplierLocationArray.Location.find(location => location.locationId == deco.sourceLocationId);
      if (location) {
        const decoration = location.DecorationArray.Decoration.find(d => d.decorationId === deco.sourceDecorationId);
        if (decoration) {
          decorations[decoration.decorationName] = true;
        }
      }
    });
    const decorationsString = Object.keys(decorations).join(', ');
    return decorationsString || '';
  }

  /**
   * Selection Helpers
   */

  // Toggle selection of all matrix rows
  masterToggle(type: string = 'matrixRow') {
    switch (type) {
      case 'addonCharge':
        return this.isAllSelected('addonCharge') ?
          this.clearSelection('addonCharge') :
          this.item.addonCharges.forEach(charge => this.addonSelection.select(charge));
        break;
      default: {
        return this.isAllSelected('matrixRow') ?
          this.clearSelection('matrixRow') :
          this.item.matrixRows.forEach(row => this.selection.select(row));
      }
    }
  }

  // Clear the selection of the matrix rows
  clearSelection(type: string = 'matrixRow') {
    switch (type) {
      case 'addonCharge': {
        this.item.addonCharges.forEach((charge) => {
          this.addonSelection.deselect(charge);
        });
        break;
      }
      default: {
        this.item.matrixRows.forEach((row) => {
          this.selection.deselect(row);
        });
        break;
      }
    }
  }

  isAnyRowSelected(type: string = 'matrixRow') {
    switch (type) {
      case 'addonCharge': {
        return this.item.addonCharges.some((charge) => this.addonSelection.isSelected(charge));
      }
      default: {
        return this.item.matrixRows.some((row) => this.selection.isSelected(row));
      }
    }
  }

  // Are all of the matrix rows selected?
  isAllSelected(type: string = 'matrixRow') {
    switch (type) {
      case 'addonCharge': {
        return this.item.addonCharges.every((charge) => this.addonSelection.isSelected(charge));
      }
      default: {
        return this.item.matrixRows.every((row) => this.selection.isSelected(row));
      }
    }
  }

  onQuantityChange(item, row, $event) {
    row.quantity = $event.target.value;
    this.calculateRowTotal(item, row);
  }

  onPriceChange(item, row, $event) {
    row.price = $event.target.value;
    this.calculateRowTotal(item, row);
  }

  calculateRowTotal(item, row) {
    row.totalPrice = row.quantity * row.price;
    item.quantity = item.matrixRows.reduce((qty, row, idx) => {
      qty += +row.quantity;
      return qty;
    }, 0);
    item.totalPrice = item.matrixRows.reduce((total, row, idx) => {
      total += row.totalPrice;
      return total;
    }, 0);

    this.cd.markForCheck();
  }

  useProductPricing() {
    const action: any = {
      type: 'useProductPricing',
      payload: {
        item: this.item
      }
    };
    this.actions.emit(action);
  }

  handleAddonActions(event) {
    switch (event.type) {
      case 'deleteAddonCharge': {
        this.actions.emit(event);
      }
    }
  }

  handleAddonChange(event) {
    this.actions.emit({
      type: 'itemAddonChargeChanged',
      event: event
    });
  }

  handleRowChange(event, row) {
    this.itemRowChanged.emit(event);
  }

  handleRowActions(action, row) {
    // Decorate action with item data
    if (action.type === 'itemRowUpdate') {
      action.event.item = this.item;
    }

    this.actions.emit(action);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.formGroup) {
      if (changes.item && changes.item.currentValue) {
        // Handle changes to product ( e.g. reorder )
        if (this.product && changes.item.currentValue.productId !== this.product.id) {
          this.product = undefined;
          this.expanded = false;
          this.cd.markForCheck();
        }
        this.formGroup.patchValue(changes.item.currentValue, { emitEvent: false });
      }
    }
    if (changes.item) {
      if (changes.item.currentValue._destroy) {
        this.expanded = false;
      }
      this.decorationsByRow = this.item.matrixRows.reduce((rows, row, index) => {
        const key = row.matrixUpdateId;
        rows[key] = this.item.decoVendors.filter((deco) => {
          return deco.decorationDetails.some((detail) => detail.matrixId == key);
        });

        return rows;
      }, {});
    }
  }

  trackByMatrix(index, item) {
    return index;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  openPriceDialog() {
    this.priceDialogTrigger.emit(this.item);
  }

  openChargesDialog() {
    this.actions.emit({
      type: 'openChargesDialog',
      payload: {
        item: this.item,
        product: this.product
      }
    });
  }

  addRow() {
    const rowIndex = this.item.matrixRows.length;
    this.store.dispatch(new AddMatrixRow({ lineItemUpdateId: this.item.lineItemUpdateId }));
    // this.item.matrixRows = [
    //   ...this.item.matrixRows,
    //   new MatrixRow({ rowIndex: rowIndex, quantity: 1 })
    // ];
  }

  createForm() {
    this.formGroup = this.fb.group({
      lineItemUpdateId: [this.item.lineItemUpdateId],
      id: [],
      order: [0],
      quantity: [this.item.quantity || 0],
      price: [this.item.price || 0],
      cost: [this.item.cost || 0],
      uomId: [this.item.uomId],
      productName: [this.item.productName],
      customerDescription: [this.item.customerDescription],
      vendorDescription: [this.item.vendorDescription],
    });

    this.formGroup.valueChanges.pipe(
      takeUntil(this.destroyed$),
    ).subscribe((value) => {
      const _action = { type: 'itemChange', payload: value, valid: this.formGroup.valid };
      this.actions.emit(_action);
    });
    return this.formGroup;
  }

  deleteItem() {
    const action = {
      type: 'deleteItem',
      payload: [this.item.lineItemUpdateId]
    };
    this.actions.emit(action);
  }

  openNotes() {
    const action = {
      type: 'editVendorNotes',
      payload: {
        item: this.item,
      }
    };
    this.actions.emit(action);
  }

  openOrderNotes() {
    const action = {
      type: 'editOrderNotes',
      payload: {
        item: this.item,
      }
    };
    this.actions.emit(action);
  }

  bulkDeleteCharges() {
    const ids = this.addonSelection.selected.map((charge) => charge.addonChargeUpdateId);
    this.actions.emit({
      type: 'deleteAddonCharge',
      payload: {
        type: 'item',
        addonChargeUpdateIds: ids,
        lineItemUpdateId: this.item.lineItemUpdateId,
      }
    });
  }

  copyCharges() {
    const ids = this.addonSelection.selected.map((charge) => charge.addonChargeUpdateId);
    this.actions.emit({
      type: 'copyCharges',
      payload: {
        type: 'item',
        selection: this.addonSelection.selected,
        addonChargeUpdateIds: ids,
        lineItemUpdateId: this.item.lineItemUpdateId,
      }
    });
    this.addonSelection.clear();
  }

  duplicateItem() {
    const action = {
      type: 'duplicateItem',
      payload: {
        item: this.item
      },
    };

    this.actions.emit(action);
  }

  previewProduct() {
    const dialogRef = this.dialog.open(PreviewProductComponent, {});
    dialogRef.componentInstance.product = this.product;
  }

  editDescription() {
    const action = {
      type: 'editProductDescription',
      payload: {
        item: this.item
      }
    };

    this.actions.emit(action);

    const dialogRef = this.dialog.open(ProductDescriptionComponent, {
      panelClass: 'product-description-dialog',
      data: {
        row: {
          productName: this.item.productName,
          lineItem: this.item
        },
      }
    });

    dialogRef.afterClosed()
      .subscribe(data => {
        if (!data) { return; }

        if (data.action === 'update') {
          this.formGroup.patchValue(data.data);
        }
      });
  }

  private fetchInventory() {
    this.actions.emit({
      type: 'fetchInventory',
      product: this.product,
    });
  }


  changeUom(event: MatSelectChange) {
    this.itemRowList.forEach(rowComponent => {
      rowComponent.changeUom(event);
    });
  }
  changeImage() {
    if (!this.config.edit) {
      return;
    }

    const action = {
      type: 'itemChangeImage',
      item: this.item,
      row: [],
    };

    this.actions.emit(action);
  }
}

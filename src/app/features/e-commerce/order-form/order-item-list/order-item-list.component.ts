import { Component, Input, OnInit, ViewChildren, QueryList, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { OrderItemComponent } from '../order-item/order-item.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { IMatrixRow, ILineItem, FobPoint } from '../interfaces';
import { displayName, fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { OrderFormService } from '../order-form.service';
import { ProductInventoryMapState } from '../store/order-form.reducer';
import { ProductDetails } from 'app/models';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { Subscription, Subject } from 'rxjs';
import { GlobalConfigService } from 'app/core/services/global.service';
import { takeUntil, map } from 'rxjs/operators';
import { CurrencyService } from 'app/features/admin/currency/currency.service';
import { Settings } from 'app/features/admin/currency/interface/interface';

@Component({
  selector: 'app-order-item-list',
  templateUrl: './order-item-list.component.html',
  styleUrls: ['./order-item-list.component.scss'],
})
export class OrderItemListComponent implements OnInit, OnDestroy {

  @Input() items;
  @Input() orders;
  @Input() config;
  @Input() selectable: boolean = true;
  @Input() inventoryMap: ProductInventoryMapState;
  @Input() productMap: { [key: string]: ProductDetails[] };
  @Input() productFobMap: { [key: string]: FobPoint[] };
  @Input() localFob: FobPoint[];
;
  @ViewChildren(OrderItemComponent) itemList;
  @Output() itemClicked: EventEmitter<any> = new EventEmitter();
  selection: SelectionModel<IMatrixRow>;

  @Output() itemChanged: EventEmitter<any> = new EventEmitter();
  @Output() actions: EventEmitter<any> = new EventEmitter();

  adminFeeEnabled: boolean = false;
  adminFeeSubscription: Subscription;
  currencyEnabled: boolean = false;
  fieldLabel = fieldLabel;
  fields = [];
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private accountService: AccountsService, private globalService: GlobalConfigService, public currencyService: CurrencyService) {
    if (this.selectable) {
      this.selection = new SelectionModel<IMatrixRow>(true, []);

      this.selection.changed.subscribe((change) => {
        this.refreshItemList();
      });
    }
  }

  onPaste(type, event) {
    console.log('Paste fired', type, event);
  }

  subscribeToAdminFee(){
    this.adminFeeSubscription = this.accountService.adminFeeEnabled.subscribe((adminFee: boolean) => {
      this.adminFeeEnabled = adminFee;
    });
  }

  subscribeToCurrencyEnabled(){
    this.currencyService.currencySettings.pipe(takeUntil(this.destroyed$))
    .subscribe((settings: Settings) => {
      this.currencyEnabled = settings.enableCurrency === "1";
    })
  }

  trackBy(item) {
    return item;
  }

  itemChecked(event) {
    console.log('Item changed', event);

  }

  handleItemChanged(event, item) {
    console.log("line item changed", event, item);
  }

  onTaskDrop(event: CdkDragDrop<ILineItem[]>) {

    let items = [...this.items];

    if (event.previousContainer === event.container) {
      moveItemInArray(items, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(items,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }

    this.actions.emit({ type: 'itemDropped', items: items });
  }

  ngOnInit() {
    this.subscribeToCurrencyEnabled();
    this.subscribeToAdminFee();
    this.getFields();
  }

  getFields(){
    this.globalService.onModuleFieldsChanged
    .pipe(takeUntil(this.destroyed$))
      .subscribe((fields: any[]) => {
        this.fields = fields;
      });
  }
  ngOnDestroy(){
    this.adminFeeSubscription.unsubscribe();
    this.destroyed$.next(true);
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.items.flatMap((item) => item.matrixRows).length;
    return numSelected == numRows;
  }

  handleItemAction(action) {
    this.actions.emit(action);
  }

  refreshItemList() {
    if (this.itemList) {
      this.itemList.forEach((item: OrderItemComponent) => {
        item.markForCheck();
      });
    }
  }

  handleItemClicked(item) {
    this.itemClicked.emit(item);
  }

  propagateEvent(type, event) {
    this.actions.emit({
      type: type,
      event: event
    });
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggleAll() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.items
        .flatMap((item) => item.matrixRows)
        .forEach(row => this.selection.select(row));

    this.refreshItemList();
  }

  createNewItemFromProduct(product) {
    this.actions.emit({
      type: 'createNewItemFromProduct',
      payload: {
        product: product
      }
    });
  }

  createNewProduct(product) {
    this.actions.emit({
      type: 'createNewProduct',
      payload: {
        product: product
      }
    });
  }

  createNewItem() {
    this.actions.emit({
      type: 'newItem'
    });
  }
}

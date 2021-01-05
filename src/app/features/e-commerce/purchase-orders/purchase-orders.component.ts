import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, Subscription, forkJoin, of, from, Subject} from 'rxjs';
import { PurchaseOrdersService } from "./services/purchaseOrders.service";
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { PurchaseOrder, OrderColors } from "app/models";
import { Store, select } from "@ngrx/store";
import { takeUntil, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { POFilters } from "./state/purchase-orders.state";
import * as fromPurchaseOrder from "app/features/e-commerce/purchase-orders/state/purchase-orders.state";
import * as purchaseOrderSelectors from "app/features/e-commerce/purchase-orders/state/selectors/purchase-orders.selectors";
import * as PurchaseOrderActions from "app/features/e-commerce/purchase-orders/store/purchase-orders.actions";
import { MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/core/services/api.service';
@Component({
  selector: 'purchase-orders',
  templateUrl: './purchase-orders.component.html',
  animations: fuseAnimations,
  styleUrls: ['./purchase-orders.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PurchaseOrdersComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  displayedColumns = ['checkbox', 'number', 'label', 'vendor', 'status', 'totalAmount', 'date', 'hidden'];
  dataSource: PurchaseOrdersDataSource | null;
  selectedAll: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  loading: boolean = false;
  hidden: string = "0";
  selectedAny: boolean = false;
  checkboxes: {[key: string]: boolean} = {};
  formValueSubscription : Subscription;
  colors = OrderColors;
  constructor(public orderService: PurchaseOrdersService, 
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<fromPurchaseOrder.State>) { }

  ngOnInit() {
    //this.store.subscribe(store => console.log("store", store));
    this.setupDataSource();
    this.subscribeToLoading();
    this.orderService.subscribeToPurchaseOrders();
    this.orderService.subscribeToFilters();
    this.orderService.subscribeToCount();
    this.createFilterForm();
    this.subscribeToHidden();
  }

  ngOnDestroy(){
    this.formValueSubscription.unsubscribe();
    this.destroyed$.next(true);
  }

  subscribeToLoading(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseOrderSelectors.getLoadingState))
    .subscribe((loading: boolean) => {
      this.loading = loading;
    });
  }

  subscribeToHidden(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseOrderSelectors.getHiddenState))
      .subscribe((hidden: string) => {
        this.hidden = hidden;
        if(this.paginator) {
          this.orderService.getPurchaseOrders(this.paginator.pageIndex, this.paginator.pageSize);
        }      
      });
  }
  

  cancelOrders(){
  }

  setupDataSource(){
    this.dataSource = new PurchaseOrdersDataSource(this.store);
  }

  

  toggleAll(){
    if (this.selectedAll) {
      this.initSelection(false);
    } else {
      this.initSelection(true);
    }
  }

  statusChange(event){
    this.store.dispatch(new PurchaseOrderActions.TrackFilters({
      status: event.value
    }));
    this.store.dispatch(new PurchaseOrderActions.IsLoading(true));
    this.orderService.getPurchaseOrders(this.paginator.pageIndex, this.paginator.pageSize);
  }

  createFilterForm(){
    this.filterForm = this.fb.group({
      number: this.orderService.filters.number,
       label: this.orderService.filters.label,
       vendor: this.orderService.filters.vendor
      // vendorId: this.filters.vendorId,
      // status: this.filters.status
    });
    this.formValueSubscription = this.filterForm.valueChanges
      .pipe(tap(val => this.store.dispatch(new PurchaseOrderActions.TrackFilters(val))),
      debounceTime(300),
      distinctUntilChanged())
    .subscribe(value => {
      this.store.dispatch(new PurchaseOrderActions.IsLoading(true));
      this.orderService
        .getPurchaseOrders(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  initSelection(val = false){
    if (val) {
      this.selectedAll = true;
    } else {
      this.selectedAll = false;
    }
    this.orderService.purchaseOrders.forEach(purchaseOrder => this.checkboxes[purchaseOrder.id] = val);
  }

  paginate(event){
    const { pageIndex , pageSize } = event;
    this.store.dispatch(new PurchaseOrderActions.IsLoading(true));
    this.orderService.getPurchaseOrders(pageIndex, pageSize);
  }

  onSelectedChange(purchaseOrderId, clickEvent){
    this.checkboxes[purchaseOrderId] = clickEvent.checked;
  }

  // handleVendorClick(event, accountId){
  //   event.stopPropogation();
  //   this.router.navigate([`/accounts/${accountId}`]);
  // }

  navigateToPurchaseOrder(purchaseOrderId: string){
    this.store.dispatch(new PurchaseOrderActions.IsLoading(true));
    this.router.navigate([`purchase_orders/${purchaseOrderId}`], { relativeTo: this.route });
  }

  

  newPurchaseOrder(){
    this.router.navigate(['new'], { relativeTo: this.route } )
  }

  showHidden(event){
    if (event.checked){
      this.store.dispatch(new PurchaseOrderActions.TrackFilters({hidden: ""}));
    } else {
      this.store.dispatch(new PurchaseOrderActions.TrackFilters({ hidden: "0" }));
    }
  }

  makeHidden(purchaseOrder: PurchaseOrder, event){
    event.stopPropagation();
    const data = {
      hidden: purchaseOrder.hidden == 0 ? "1" : "0"
    }
    this.api.updatePurchaseOrder(purchaseOrder.id, data).subscribe(res => {
      this.orderService.getPurchaseOrders(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }
}


export class PurchaseOrdersDataSource extends DataSource<any>
{
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store<fromPurchaseOrder.State>
  ) {
    super();
  }

  connect(): Observable<any[]> {
    // this.onTotalCountChanged =
    //   this.ordersService.onTotalCountChanged.pipe(
    //     delay(100),
    //   ).subscribe(total => {
    //     this.total = total;
    //   });

    // return this.ordersService.onOrdersChanged;
    return this.store.pipe(takeUntil(this.destroyed$), select(purchaseOrderSelectors.getPurchaseOrderList));
  }

  disconnect() {
    this.destroyed$.next(true);
  }
}

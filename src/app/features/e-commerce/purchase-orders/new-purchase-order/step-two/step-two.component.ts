import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, ElementRef  } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { NeedDetailDataSource, PurchaseNeedsService } from '../../services/purchase-needs.service';
import { Store, select } from "@ngrx/store";
import { Subject, Subscription, Observable } from 'rxjs';
import * as fromPurchaseNeed from "../../state/purchase-needs.state";
import { FormGroup, FormBuilder } from '@angular/forms';
import * as purchaseNeedSelectors from "../../state/selectors/purchase-needs.selectors";
import * as PurchaseNeedsActions from "../../store/purchase-needs.actions";
import { PurchaseNeed } from "../../interface/interface";
import { debounceTime, distinctUntilChanged, tap, switchMap, takeUntil } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';
import * as _ from 'lodash';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
@Component({
  selector: 'step-two',
  templateUrl: './step-two.component.html',
  styleUrls: ['./step-two.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class StepTwoComponent implements OnInit, OnDestroy {
  expandedColumns = [
    "checkbox",
    "orderNumber",
    //"type",
    "name",
    "item",
    //"description",
  "color",
  "size",
    "customer",
    "vendor",
    "inHouseId",
    "quantityNeeded",
    "quantityOrdered",
    "estimatedCost",
    "actualCost",
    "dueDate"
  ];
  filterForm: FormGroup;
  selectedAll: boolean = false;
  viewMode = "summaryView";
  loading: boolean;
  currentOrderVal: string;
  formValueSubscription: Subscription;
  customers: Observable<any>;
  dataSource: NeedDetailDataSource;
  orderNumbersSubscription: Subscription;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  @ViewChild("orderInput") orderInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatAutocompleteTrigger) autoTrigger: MatAutocompleteTrigger;
  constructor(private store: Store<fromPurchaseNeed.State>, public itemService: PurchaseNeedsService,
    private api: ApiService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.subscribeToLoading();
    this.createFilterForm();
    this.setupDataSource();
  }

  ngOnDestroy(){
    this.destroyed$.next(true);
    this.orderNumbersSubscription.unsubscribe();
    this.formValueSubscription.unsubscribe();
  }

  add(event) {
    console.log("add event", event);
  }

  changeView(event){
    this.viewMode = event.value;
  }

  toggleAll() {
    if (this.selectedAll) {
      this.initSelection(false);
    } else {
      this.initSelection(true);
    }
  }

  initSelection(val = false){
    const detailCheckbox = {};
    if (val){
      this.selectedAll = true;
      this.store.dispatch(new PurchaseNeedsActions.SelectMultipleNeeds(this.itemService.displayedNeeds));
      this.itemService.displayedNeeds.forEach((purchaseNeed: PurchaseNeed) => {
        detailCheckbox[purchaseNeed.id] = true
      });
    } else {
      this.selectedAll = false;
      const ids = this.itemService.displayedNeeds.map((displayedNeed: PurchaseNeed) => displayedNeed.id);
      this.store.dispatch(new PurchaseNeedsActions.DeselectSpecificNeeds(ids))
      this.itemService.displayedNeeds.forEach((purchaseNeed: PurchaseNeed) => {
        detailCheckbox[purchaseNeed.id] = false
      });
    }
    this.store.dispatch(new PurchaseNeedsActions.DetailCheckbox(detailCheckbox));
  }

  sortChange(event){
    this.store.dispatch(new PurchaseNeedsActions.DetailSortEvent(event));
    //this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
    this.itemService.filterPurchaseNeeds();
  }

  paginate(event){
    this.store.dispatch(new PurchaseNeedsActions.DetailPageEvent(event));
  }

  clearFilters() {
    const previousOrderNumbers = this.itemService.productFilters.refSalesOrderNo;
    const productFilters = { ...this.itemService.productFilters};
    delete productFilters["refSalesOrderNo"];
    this.store.dispatch(new PurchaseNeedsActions.AddMultiSelectOrderNumberFilter([]));
    this.itemService.clearChips();
    this.orderInput.nativeElement.value = "";
    if (Object.values(productFilters).every(el => el === "") && previousOrderNumbers.length) {
      this.itemService.filterPurchaseNeeds();
    }
    this.filterForm.patchValue({
      name: "",
      description: "",
      vendor: "",
      customer: "",
      supplierProductId: "",
    });
    
  }

  selectOrder(e) {
    this.store.dispatch(new PurchaseNeedsActions.AddSingleOrderNumberFilter(e.option.value));
    this.itemService.addChip(e.option.viewValue);
    this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
    this.itemService.filterPurchaseNeeds();
    this.orderInput.nativeElement.value = "";
    setTimeout(() => {
      this.itemService.orderNumberAutocomplete("");
      this.orderInput.nativeElement.blur();
      this.orderInput.nativeElement.focus();
      this.filterForm.controls.orderNumbers.patchValue("1");
      this.filterForm.controls.orderNumbers.patchValue("");
    }, 200);
  }

  subscribeToOrderNumbers() {
    this.orderNumbersSubscription = this.filterForm.controls.orderNumbers.valueChanges
      .pipe(debounceTime(300))
      .subscribe((val: string) => {
        this.itemService.orderNumberAutocomplete(val);
        this.currentOrderVal = val;
      });
  }

  expand(purchaseNeed: PurchaseNeed) {
    const event = {};
    if (!this.itemService.checkboxes[purchaseNeed.id]) {
      event["checked"] = true;
    } else {
      event["checked"] = false;
    }
    this.onSelectedChangeDetail(purchaseNeed.id, event, purchaseNeed);
  }
  selectCustomer(event) {
    const customer = event.option.value;
    this.filterForm.controls.customer.patchValue(customer.name);
  }

  populateOrderNumbers(){
    //this.filterForm.controls.orderNumbers.patchValue(this.filterForm.controls.orderNumbers.value);
    this.itemService.orderNumberAutocomplete("");
  }

  remove(chip) {
   if(chip) { const orderNumber = chip.split(" ")[0];
    this.store.dispatch(
      new PurchaseNeedsActions.RemoveMultiSelectOrderNumberFilter(orderNumber)
    );
    this.itemService.removeChip(chip);
    this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
    this.itemService.filterPurchaseNeeds();
  }
  }

  subscribeToCustomerAutocomplete() {
    this.customers = this.filterForm.controls.customer.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((val) => this.api.getCustomerAutocomplete(val))
    );
  }

  selectFiltered(){
    this.store.dispatch(new PurchaseNeedsActions.SelectFromFiltered());
  }

  createFilterForm(){
    this.filterForm = this.fb.group({
      name: [""],
      vendor: [""],
      customer: [""],
      description: [""],
      orderNumbers: [""],
      supplierProductId: [""],
      inhouseId: [""],
      color: [""],
      size: [""]
    });
    this.subscribeToFilterForm();
  }

  ordersSelected(e) {
    this.store.dispatch(
      new PurchaseNeedsActions.AddMultiSelectOrderNumberFilter(e.value)
    );
    this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
    this.itemService.getPurchaseNeedsByProductIds();
  }

  setupDataSource() {
    this.dataSource = new NeedDetailDataSource(this.store);
  }

  subscribeToFilterForm(){
    this.formValueSubscription = this.filterForm.valueChanges
      .pipe(
        tap((val) => {
          const newVal = val;
          delete newVal["orderNumbers"];
          this.store.dispatch(
            new PurchaseNeedsActions.TrackProductFilters(newVal)
          );
        }),
        debounceTime(300),
        distinctUntilChanged((prev, curr) => {
          delete prev["orderNumbers"];
          delete curr["orderNumbers"];
          return _.isEqual(prev, curr);
        })
      )
      .subscribe((value) => {
        this.store.dispatch(new PurchaseNeedsActions.IsLoading(true));
        this.itemService.filterPurchaseNeeds();
      });
      this.subscribeToOrderNumbers();
    this.subscribeToCustomerAutocomplete();
  }

  subscribeToLoading() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedSelectors.getLoadingState)
      )
      .subscribe((loading: boolean) => {
        this.loading = loading;
      });
  }

  onSelectedChangeDetail(purchaseNeedId, event, purchaseNeed: PurchaseNeed) {
    this.store.dispatch(
      new PurchaseNeedsActions.DetailCheckbox({
        [purchaseNeedId]: event.checked,
      })
    );
    if (event.checked) {
      this.store.dispatch(
        new PurchaseNeedsActions.SelectSingleNeed(purchaseNeed)
      );
    } else {
      this.store.dispatch(
        new PurchaseNeedsActions.DeselectSingleNeed(purchaseNeedId)
      );
    }
  }

}

import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Observable, Subject, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import * as fromPurchaseNeed from "../../../state/purchase-needs.state";
import * as purchaseNeedsActions from "../../../store/purchase-needs.actions";
import * as purchaseNeedsSelectors from "../../../state/selectors/purchase-needs.selectors";
import { map, tap, takeUntil, switchMap, filter, take, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PurchaseNeedsService } from '../../../services/purchase-needs.service';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PNPFilters, SummaryNeed } from '../../../state/purchase-needs.state';
@Component({
  selector: 'summary-view',
  templateUrl: './summary-view.component.html',
  styleUrls: ['./summary-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class SummaryViewComponent implements OnInit {
  dataSource: SummaryViewDataSource | null;
  extraFilterForm: FormGroup;
  displayedColumns = [
    "item",
    "name",
    //"attributes",
    "color",
    "size",
    "quantityNeeded",
    "quantityOrdered",
    "actualCost"
  ];
  formValueSubscription: Subscription;
  constructor(private store: Store<fromPurchaseNeed.State>, 
    public itemService: PurchaseNeedsService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.createExtraFilterForm();
    this.setupDataSource();
  }

  ngOnDestroy(){
    this.formValueSubscription.unsubscribe();
  }

  setupDataSource() {
    this.dataSource = new SummaryViewDataSource(this.store);
  }

  paginate(event) {
    this.store.dispatch(new purchaseNeedsActions.SummaryPageEvent(event));
  }

  sortChange(event: fromPurchaseNeed.SortEvent) {
    console.log("sorting event summary", event);
    this.store.dispatch(new purchaseNeedsActions.SummarySortEvent(event));
  }

  createExtraFilterForm(){
    this.extraFilterForm = this.fb.group({
      supplierProductId: [""],
      name: [""],
      description: [""],
      color: [""],
      size: [""]
    });
    this.subscribetoFilterForm();
  }

  subscribetoFilterForm(){
    this.formValueSubscription = this.extraFilterForm.valueChanges
    .pipe(
      tap((val) => {
        this.store.dispatch(new purchaseNeedsActions.TrackProductFilters(val));
      }),
      debounceTime(300),
      distinctUntilChanged(),
    )
    .subscribe(val => {
      this.store.dispatch(new purchaseNeedsActions.IsLoading(true));
      this.itemService.filterPurchaseNeeds();
    });
  }


  

}

export class SummaryViewDataSource extends DataSource<any>{
  page = {
    pageIndex: 0,
    pageSize: 50,
  };
  count: number = 0;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  summaryFilters: SummaryFilter = {
    name: "",
    color: "",
    size: "",
    supplierProductId: ""
  };
  filters;
  sort: fromPurchaseNeed.SortEvent = { active: "color", direction: "asc" };
  customerVendorFilter: CustomerVendorFilter = {
    customer: "",
    vendor: ""
  };
  constructor(private store: Store<fromPurchaseNeed.State>) {
    super();
  }

  handlePagination(array) {
    const begin = ((this.page.pageIndex + 1) - 1) * this.page.pageSize;
    const end = begin + this.page.pageSize;
    return array.slice(begin, end);
  }

  
  connect(): Observable<any[]> {
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getSummaryPage))
      .subscribe((page: fromPurchaseNeed.PageEvent) => this.page = page);

    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getProductFilterState),
      )
      .subscribe((filters: PNPFilters) => {
        this.filters = filters;
        const summaryFilter: SummaryFilter = {
          name: filters.name,
          color: filters.color,
          supplierProductId: filters.supplierProductId,
          size: filters.size,
          
        }
        this.summaryFilters = summaryFilter;
        this.customerVendorFilter = {
          customer: filters.customer,
          vendor: filters.vendor
        }
      });

      //sort subscription
      this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getSummaryTableSort))
      .subscribe((sort: fromPurchaseNeed.SortEvent) => this.sort = sort);

      //filters subscription
    return this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getSummaryNeeds),
      map((summaryNeeds: SummaryNeed[]) => {
        
        console.time("Summary Sort");
        let filteredSummaryNeeds = summaryNeeds;
        console.log("first summary needs", filteredSummaryNeeds);
       
        //*** filtering by summary filters */
        for (let key in this.summaryFilters) {
          let prop;
          switch (key) {
            case "name": {
              prop = "name";
              break;
            }
            case "supplierProductId": {
              prop = "item";
              break;
            }
            // case "description": {
            //   prop = "attribute";
            //   break;
            // }

            default: {
              prop = key;
              break;
            }
          }
          filteredSummaryNeeds = filteredSummaryNeeds.filter((summaryNeed: SummaryNeed) =>
            summaryNeed[prop].toLowerCase().startsWith(this.summaryFilters[key].toLowerCase()));
        }

        //** Filtering Summary needs by customer and vendor */
        if ((typeof this.filters.customer === 'string' && this.filters.customer.length) || (this.filters.customer.name && this.filters.customer.name.length) ){
          filteredSummaryNeeds = filteredSummaryNeeds.filter((summaryNeed: SummaryNeed) => {
            let checker: boolean = false;
            summaryNeed.customer.forEach((customer: string) => {
              if (customer.toLowerCase().startsWith(typeof this.filters.customer === 'string' ? this.filters.customer.toLowerCase() :
                this.filters.customer.name.toLowerCase())) {
                checker = true;
                return;
              }
            });
            return checker;
          });
        }
        filteredSummaryNeeds = filteredSummaryNeeds.filter((summaryNeed: SummaryNeed) => {
          let checker: boolean = false;
          summaryNeed.vendor.forEach((vendor: string) => {
            if (vendor.toLowerCase().startsWith(this.customerVendorFilter.vendor.toLowerCase())){
              checker = true;
              return;
            }
          });
          return checker;
        });

        // Filtering Summary Needs by OrderNumber

        if (this.filters.refSalesOrderNo.length){
          filteredSummaryNeeds = filteredSummaryNeeds.filter((summaryNeed: SummaryNeed) => {
            let checker: boolean = false;
            summaryNeed.refSalesOrderNo.forEach((orderNumber: string) => {
              if (this.filters.refSalesOrderNo.includes(orderNumber)) checker = true;
            });
            return checker;
          });
        }

        // Sorting Summary Needs after filter process has finished.
        if (this.sort.active === "color" && this.sort.direction === "asc"){
          filteredSummaryNeeds.sort((a: SummaryNeed, b: SummaryNeed) => {
            if (a.color < b.color){
              return -1;
            } else if (a.color > b.color){
              return 1;
            } else if (a.color === b.color && a.rank < b.rank) {
              return -1;
            } else if (a.color === b.color && a.rank > b.rank){
              return 1
            } else return 0;
          });
        } else if (this.sort.active === "color" && this.sort.direction === "desc"){
          filteredSummaryNeeds.sort((a: SummaryNeed, b: SummaryNeed) => {
            if (a.color < b.color) {
              return 1;
            } else if (a.color > b.color) {
              return -1;
            } else if (a.color === b.color && a.rank < b.rank) {
              return -1;
            } else if (a.color === b.color && a.rank > b.rank) {
              return 1
            } else return 0;
          });
        } else if (this.sort.active === "name" && this.sort.direction === "asc"){
          filteredSummaryNeeds.sort((a: SummaryNeed, b: SummaryNeed) => {
            if (a.name < b.name) {
              return -1;
            } else if (a.name > b.name) {
              return 1;
            } else if (a.name === b.name && a.rank < b.rank) {
              return -1;
            } else if (a.name === b.name && a.rank > b.rank) {
              return 1
            } else return 0;
          });
        } else if (this.sort.active === "name" && this.sort.direction === "desc"){
          filteredSummaryNeeds.sort((a: SummaryNeed, b: SummaryNeed) => {
            if (a.name < b.name) {
              return 1;
            } else if (a.name > b.name) {
              return -1;
            } else if (a.name === b.name && a.rank < b.rank) {
              return -1;
            } else if (a.name === b.name && a.rank > b.rank) {
              return 1
            } else return 0;
          });
        }
        console.timeEnd("Summary Sort");
        this.count = filteredSummaryNeeds.length;
        return this.handlePagination(filteredSummaryNeeds);
      })
    );
  }

  disconnect() {
    this.destroyed$.next(true);
  }
}

export interface SummaryFilter {
  name: string;
  //description: string;
  supplierProductId: string;
  color: string;
  size: string;
}

export interface CustomerVendorFilter {
  customer: string;
  vendor: string;
}

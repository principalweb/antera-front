import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { DataSource } from '@angular/cdk/collections';
import { PurchaseNeedFromServer, PurchaseNeed } from 'app/models';
import { Store, select } from '@ngrx/store';
import { map, tap, takeUntil, switchMap, filter, take } from 'rxjs/operators';
import * as fromPurchaseNeed from "../state/purchase-needs.state";
import * as purchaseNeedsActions from "../store/purchase-needs.actions";
import * as purchaseNeedsSelectors from "../state/selectors/purchase-needs.selectors";
import { Meta } from '../state/purchase-orders.state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PNFilters, PNPFilters } from "../state/purchase-needs.state";
import { checkFalseNumber } from '../state/selectors/purchase-needs.selectors';

@Injectable({
  providedIn: "root",
})
export class PurchaseNeedsService implements Resolve<any>, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  meta: Meta;
  orderNumbers: string[] = [];
  totalCost: number = 0;
  totalSum: string = "0.00";
  totalCountProducts: number;
  detailCount: number;
  summaryCount: number;
  //notDirty: boolean = true;
  productFilters: PNPFilters;
  detailSort: fromPurchaseNeed.SortEvent;
  productCheckboxes: { [key: number]: boolean };
  orderCost: {[key: number]: string } = {};
  checkboxes: { [key: number]: boolean };
  isDifferentQuantity: boolean;
  shouldShowInventory: boolean;
  orderCostError: boolean = false;
  currentUrl: string;
  selectedNeeds: PurchaseNeed[];
  chips: string[] = [];
  quantityChanged: { [key: number]: purchaseNeedsActions.IEditQuantity };
  selectionChanged: boolean;
  displayedNeeds: PurchaseNeed[] = [];
  orderNumberData: OrderNumberData[]
  productGroup: PurchaseNeed[];
  selectedProductIds: number[];
  constructor(
    private api: ApiService,
    private store: Store<fromPurchaseNeed.State>,
    private router: Router,
    private route: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {}
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    console.log("route", route);
    console.log("this.route", this.route);
    console.log("url", this.router.url);
    this.router.events.subscribe(val => console.log(val));
    this.subscribeToProductGroups();
    this.subscribeToSelectedProductGroups();
    this.subscribeToCount();
    this.subscribeToFilters();
    this.getOrderNumbersOfPurchaseNeeds();
    this.subscribeToSelectedNeeds();
    this.subscribeToShowInventory();
    this.subscribeToTotalSum();
    this.subscribeToDisplayedPurchaseNeeds();
    this.subscribeToSelectionChanged();
    this.subscribeToDetailSort();
    this.subscribeSummaryCount();
    this.subscribeToDetailCount();
    this.subscribeToQuantityChanged();
    this.subscribeToPOCreatedConfirmation();
    this.subscribeToCheckboxes();
    this.subscribeToIsDifferentQuantity();
    this.subscribeToFetchError();
    this.subscribeToOrderCostError();
    this.subscribeToOrderCost();
    this.subscribeToTotalCost();
    return this.api
      .getPurchaseNeedsByProduct(this.productFilters)
      .pipe(
        map((data: any[]) => {
          this.totalCountProducts = data.length;
          return data.map(
            (individualPurchaseNeed) => new PurchaseNeed(individualPurchaseNeed)
          );
        })
      )
      .subscribe((purchaseNeeds: PurchaseNeed[]) => {
        this.store.dispatch(
          new purchaseNeedsActions.ReceivePurchaseProductNeeds(purchaseNeeds)
        );
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
  }

  addChip(chip: string){
    this.chips.push(chip);
  }

  clearChips(){
    this.chips = [];
  }

  removeChip(chip: string){
    this.chips = this.chips.filter((el: string) => !el.includes(chip));
  }

  orderNumberAutocomplete(val){
    this.api.getOrderNumbersAutocomplete(val)
    .pipe(take(1))
    .subscribe((orderNumberResponse: orderNumberResponse) => {
      const newOrderNumberData = [];
      orderNumberResponse.data.forEach((orderNumberData: OrderNumberData) => {
        if (this.chips.findIndex((chip: string) => chip.includes(orderNumberData.refSalesOrderNo)) === -1) newOrderNumberData.push(orderNumberData);
      });
      this.orderNumberData = newOrderNumberData;
    });
  }

  subscribeToDetailSort(){
    this.store.pipe(
      takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getDetailSortState)
    )
    .subscribe((detailSort: fromPurchaseNeed.SortEvent) => this.detailSort = detailSort);
  }

  subscribeToProductGroups() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getPurchaseNeedsProductList)
      )
      .subscribe((subscribedPurchaseNeeds: PurchaseNeed[]) => {
        this.productGroup = subscribedPurchaseNeeds;
      });
  }

  subscribeToDetailCount(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getDetailCount))
    .subscribe((detailCount: number) => this.detailCount = detailCount);
  }

  subscribeToTotalCost() {
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getTotalCost))
      .subscribe((totalCost: number) => this.totalCost = totalCost);
  }

  subscribeToOrderCostError(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getOrderCostError))
      .subscribe((orderCostError: boolean) => this.orderCostError = orderCostError);
  }

  subscribeToOrderCost(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getOrderCost))
      .subscribe((orderCost: {[key: number]: string}) => this.orderCost = orderCost);
  }


  subscribeSummaryCount() {
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getSummaryCount))
      .subscribe((summaryCount: number) => this.summaryCount = summaryCount);
  }

  subscribeToCheckboxes() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getProductChexboxes)
      )
      .subscribe(
        (productCheckboxes: { [key: number]: boolean }) =>
          (this.productCheckboxes = productCheckboxes)
      );
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getDetailChexboxes)
      )
      .subscribe(
        (chexboxes: { [key: number]: boolean }) => (this.checkboxes = chexboxes)
      );
  }

  subscribeToFetchError() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getFetchError)
      )
      .subscribe((fetchError: boolean) => {
        if (fetchError)
          this._snackBar.open(
            "There was an error completing your request",
            null,
            { duration: 2000 }
          );
      });
  }

  subscribeToIsDifferentQuantity() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getIsDifferentQuantity)
      )
      .subscribe((isDifferentQuantity: boolean) => {
        this.isDifferentQuantity = isDifferentQuantity;
      });
  }

  subscribeToPOCreatedConfirmation() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getConfirmation)
      )
      .subscribe((confirmation: boolean) => {
        if (confirmation) this.handlePurchaseOrderCreation();
      });
  }

  subscribeToShowInventory(){
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getShowInventoryState)
      )
      .subscribe((showInventory: boolean) => {
        this.shouldShowInventory = showInventory;
      });
  }

  getOrderNumbersOfPurchaseNeeds() {
    this.api
      .getOrderNumbersOfNeeds()
      .pipe(
        map((orderNumberResponse: orderNumberResponse) => {
          return orderNumberResponse.data.map(
            (orderNumberObject) => `${orderNumberObject.refSalesOrderNo}`
          );
        })
      )
      .subscribe(
        (orderNumbers: string[]) => (this.orderNumbers = orderNumbers)
      );
  }

  convertToString(strings: string[]) {
    let myString = "";
    strings.forEach((string: string, idx: number) =>
      idx != strings.length - 1 ? (myString += ` ${string}`) : `${string}`
    );
    return myString;
  }

  subscribeToQuantityChanged() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getQuantityOrdered)
      )
      .subscribe(
        (quantityOrdered: {
          [key: number]: purchaseNeedsActions.IEditQuantity;
        }) => {
          this.quantityChanged = quantityOrdered;
          //this.notDirty = this.checkIfDirty(quantityOrdered);
          //this.sumSelectedNeeds();
        }
      );
  }

  subscribeToDisplayedPurchaseNeeds(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getPurchaseNeedsList))
    .subscribe((purchaseNeeds: PurchaseNeed[]) => this.displayedNeeds = purchaseNeeds);
  }

  checkIfDirty() {
    for (let key in this.quantityChanged) {
      if (this.quantityChanged[key].dirty) return false;
    }
    return true;
  }
  subscribeToCount() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getTotalCount)
      )
      .subscribe((count: number) => {
        if (count || count === 0) this.totalCountProducts = count;
      });
  }
  subscribeToFilters() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getProductFilterState)
      )
      .subscribe((filters: PNPFilters) => (this.productFilters = filters));
    //this.store.select("filters").subscribe(filters => console.log("filters", filters));
  }

  subscribeToSelectedProductGroups() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getSelectedProducts)
      )
      .subscribe((selectedProductNeeds: PurchaseNeed[]) => {
        this.selectedProductIds = selectedProductNeeds.map(
          (selectedNeed: PurchaseNeed) => selectedNeed.productId
        );
        this.getEstimatedTotal();
      });
  }

  getEstimatedTotal(){
    if (this.selectedProductIds.length > 0){
      this.store.dispatch(new purchaseNeedsActions.GetProductTotal(this.selectedProductIds, this.productFilters.inventory));
    } else {
      this.store.dispatch(new purchaseNeedsActions.ReceiveTotalSum("0.00"));
    }
  }

  // getNeedsTotal(){
  //   if (this.selectedNeeds.length > 0){
  //     const needIds = this.selectedNeeds.map((selectedNeed: PurchaseNeed) => selectedNeed.id);
  //     this.store.dispatch(new purchaseNeedsActions.GetNeedSum(needIds));
  //   } else {
  //     this.store.dispatch(new purchaseNeedsActions.ReceiveTotalSum("0.00"));
  //   }
  // }

  

  subscribeToTotalSum(){
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getTotalSum)
      )
      .subscribe((totalSum: string) => {
        this.totalSum = totalSum;
      });
  }

  subscribeToSelectedNeeds() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedsSelectors.getSelectedNeedSate)
      )
      .subscribe((selectedNeeds: PurchaseNeed[]) => {
        this.selectedNeeds = selectedNeeds;
        //this.sumNeeds(selectedNeeds);
        //this.getNeedsTotal();
      });
  }

  sumNeeds(selectedNeeds: PurchaseNeed[]) {
    this.totalCost = selectedNeeds.reduce((acc, curr) => {
      let quantityOrdered;
      if (
        this.quantityChanged[curr.id] &&
        this.quantityChanged[curr.id].quantity
      ) {
        quantityOrdered = this.quantityChanged[curr.id].quantity;
      } else {
        quantityOrdered = curr.quantityOrdered;
      }

      return acc + curr.actualUnitCost * quantityOrdered;
    }, 0);
  }

  sumNoModifyTotalCost(selectedNeeds: PurchaseNeed[]){
    return selectedNeeds.reduce((acc, curr) => {
      let quantityOrdered;
      let orderCost;
      if (
        this.quantityChanged[curr.id] &&
        this.quantityChanged[curr.id].quantity
      ) {
        quantityOrdered = parseFloat(this.quantityChanged[curr.id].quantity);
      } else {
        quantityOrdered = curr.quantityOrdered;
      }

      if (this.orderCost[curr.id] != undefined 
            && !checkFalseNumber(this.orderCost[curr.id]) && this.orderCost[curr.id] != null){
            orderCost = parseFloat(this.orderCost[curr.id]);
            } else {
                orderCost = curr.actualUnitCost;
            }


      return acc + orderCost * quantityOrdered;
    }, 0);
  }

  sumSelectedNeeds() {
    this.sumNeeds(this.selectedNeeds);
  }

  // getPurchaseNeeds(pageIndex: number, pageSize: number){
  //   this.store.dispatch(new purchaseNeedsActions.FilterPurchaseNeeds({
  //     filters: this.filters,
  //     currentPage: pageIndex += 1,
  //     perPage: pageSize
  //   }));
  // }

  filterPurchaseNeeds() {
    this.store.dispatch(
      new purchaseNeedsActions.FilterPurchaseNeeds({
        productIds: this.selectedProductIds,
        filters: this.productFilters,
        sort: this.detailSort
      })
    );
  }

  getPurchaseProductNeeds() {
    this.store.dispatch(
      new purchaseNeedsActions.FilterPurchaseProductNeeds({
        filters: this.productFilters,
      })
    );
  }

  getPurchaseNeedsByProductIds() {
    this.store.dispatch(
      new purchaseNeedsActions.FetchPurchaseNeedsByProductIds({
        productIds: this.selectedProductIds,
        filters: this.productFilters,
        sort: this.detailSort
      })
    );
  }

  // getPurchaseNeedsByProductId(productId, pageIndex: number=0, pageSize: number=50){
  //   this.store.dispatch(new purchaseNeedsActions.FetchPurchaseNeedsByProductId({
  //     pageIndex,
  //     pageSize,
  //     productId,
  //     filters: this.productFilters
  //   }));
  // }

  getPurchaseNeedsSingleDetailNeed(
    productId: number,
    pageIndex: number = 0,
    pageSize: number = 50
  ) {
    this.store.dispatch(
      new purchaseNeedsActions.FetchPurchaseNeedsByProductId({
        productId,
        pageIndex,
        pageSize,
        filters: this.productFilters,
      })
    );
  }

  sumQuantity(productId: number): number {
    let sum = 0;
    this.selectedNeeds
      .filter(
        (filterNeed: PurchaseNeed) =>
          filterNeed.productId === productId && filterNeed.type !== "Decoration"
      )
      .forEach((selectedNeed: PurchaseNeed) => {
        if (
          this.quantityChanged[selectedNeed.id] &&
          this.quantityChanged[selectedNeed.id].dirty
        ) {
          sum += parseInt(this.quantityChanged[selectedNeed.id].quantity);
        } else {
          sum += selectedNeed.quantityOrdered;
        }
      });
    return sum;
  }

  decorationQuantity(refDesignId: string): number {
    let sum = 0;
    this.selectedNeeds
      .filter(
        (filterNeed: PurchaseNeed) =>
          filterNeed.refDesignId === refDesignId &&
          filterNeed.type === "Decoration"
      )
      .forEach((selectedNeed: PurchaseNeed) => {
        if (
          this.quantityChanged[selectedNeed.id] &&
          this.quantityChanged[selectedNeed.id].dirty
        ) {
          sum += parseInt(this.quantityChanged[selectedNeed.id].quantity);
        } else {
          sum += selectedNeed.quantityOrdered;
        }
      });
    return sum;
  }

  subscribeToSelectionChanged(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getSelectionChanged))
    .subscribe((selectionChanged: boolean) => this.selectionChanged = selectionChanged);
  }

  calculatePriceBreak() {
    this._snackBar.open("Updating Cost", null, { duration: 2000 });
    this.store.dispatch(new purchaseNeedsActions.IsLoading(true));
    const products = [];
    const decorations = [];
    this.selectedNeeds.forEach((selectedNeed: PurchaseNeed) => {
      if (
        this.quantityChanged[selectedNeed.id] &&
        this.quantityChanged[selectedNeed.id].dirty
      ) {
        if (
          selectedNeed.type !== "Decoration" &&
          products.findIndex(
            (product) => product.productId === selectedNeed.productId
          ) === -1
        ) {
          products.push({
            productId: selectedNeed.productId,
            quantity: this.sumQuantity(selectedNeed.productId),
            refDesignId: selectedNeed.refDesignId,
          });
        } else if (
          selectedNeed.type === "Decoration" &&
          decorations.findIndex(
            (decoration) => decoration.refDesignId === selectedNeed.refDesignId
          ) === -1
        ) {
          decorations.push({
            refDesignId: selectedNeed.refDesignId,
            quantity: this.decorationQuantity(selectedNeed.refDesignId),
          });
        }
      }
    });
    if (products.length > 0) {
      this.store.dispatch(
        new purchaseNeedsActions.CalculatePriceBreak({
          variation: products,
          decoration: decorations,
        })
      );
    } else {
      this.store.dispatch(new purchaseNeedsActions.IsLoading(false));
    }
  }

  // showInventory(event){
  //   this.store.dispatch(new purchaseNeedsActions.ShowInventory(event.checked));
  //   this.store.dispatch(new purchaseNeedsActions.IsLoading(true));
  //   this.filterPurchaseNeeds();
  // }

  showInventoryProduct(event){
    this.store.dispatch(new purchaseNeedsActions.ShowInventory(event.checked));
    this.store.dispatch(new purchaseNeedsActions.IsLoading(true));
    this.getPurchaseProductNeeds();
  }

  handlePurchaseOrderCreation() {
    // this.store.dispatch(new purchaseNeedsActions.PurchaseOrderGeneratedConfirmation(false));
    // this.store.dispatch(new purchaseNeedsActions.IsLoading(true));
    // setTimeout(() => {
    //   this.store.dispatch(new purchaseNeedsActions.IsLoading(false));
    //   this.store.dispatch(new purchaseNeedsActions.SetInitState());

    // }, 2300);

    this._snackBar.open("Purchase Orders Generated", null, { duration: 2000 });
    this.router.navigate(["/e-commerce/purchase_orders"]);
    this.store.dispatch(new purchaseNeedsActions.SetInitState());
  }
}



export interface PurchaseNeedResponse {
  data: PurchaseNeedFromServer[];
  _links: {
    self: {
      href: string
    }
  };
  _meta: {
    totalCount: number,
    pageCount: number,
    currentPage: number,
    perPage: number
  };
}

export class NeedDetailDataSource extends DataSource<any>{
  page = {
    pageIndex: 0,
    pageSize: 50,
  };
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(private store: Store<fromPurchaseNeed.State>) {
    super();
  }

  handlePagination(array) {
    const begin = ((this.page.pageIndex + 1) - 1) * this.page.pageSize;
    const end = begin + this.page.pageSize;
    return array.slice(begin, end);
  }

  connect(): Observable<any[]> {
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getDetailPage))
      .subscribe((page: fromPurchaseNeed.PageEvent) => {
        this.page = page;
      });
      
    return this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedsSelectors.getSlicedPurchaseNeedsList)
    );
  }

  disconnect() {
    this.destroyed$.next(true);
  }
}

export interface productObject {
  productId: number;
  pageIndex: number;
  pageSize: number;
  filters: PNPFilters
}

export interface orderNumberResponse {
  data: [{ refSalesOrderId: string, refSalesOrderNo: string, identity: string, customer: string}];
  success: string;
}

export interface OrderNumberData {
  refSalesOrderId: string;
  refSalesOrderNo: string;
  identity: string;
  customer: string;
}


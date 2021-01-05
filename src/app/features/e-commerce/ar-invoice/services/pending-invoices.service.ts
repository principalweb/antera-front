import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from "@ngrx/store";
import * as fromPendingInvoices from "../state/pendingInvoices.state";
import * as PendingInvoiceSelectors from "../state/selectors/pendingInvoice.selectors";
import * as PendingInvoiceActions from "../store/pendingInvoices.actions";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { takeUntil, take, map } from 'rxjs/operators';
import { Invoice, LineItem } from 'app/models/ar-invoice';
import { PendingInvoiceResponse } from '../interface/interface';



@Injectable({
  providedIn: 'root'
})
export class PendingInvoicesService implements Resolve<any> {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  lineItemFilters: fromPendingInvoices.LineItemFilters;
  invoiceFilters: fromPendingInvoices.InvoiceFilters;
  pendingInvoiceCheckboxes: {[key: string]: boolean} = {};
  lineItemCheckboxes: { [key: string]: boolean };
  selectedLineItems: { [key:string]: LineItem } = {};
  selectedInvoices: { [key: string]: Invoice } = {};
  selectedInvoiceIds: string[] = [];
  deselectedInvoices: { [key: string]: Invoice } = {};
  quantityInvoiced: { [key: string]: string } = {};
  unitPrice: { [key: string]: string } = {};
  deselectedInvoiceIds: string[] = [];
  totalCount: number;
  totalPrice: number = 0;
  lineItems: LineItem[];
  summaryInvoices: Invoice[] = [];
  totalLineItemCount: number;
  phaseOneComplete: boolean;
  phaseTwoComplete: boolean;
  quantityInvoicedError: boolean;
  priceInputError: boolean;
  invoiceSelectionChanged: boolean;
  loading: boolean;
  pendingSelectAll: boolean;
  lineItemSelectAll: boolean;

  constructor(private store: Store<fromPendingInvoices.State>,
    private api: ApiService, 
    private router: Router,
    private route: ActivatedRoute) { }

  resolve(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> | Promise<any> | any{
      this.runSubscriptions();
      return this.api.getPendingInvoices(this.invoiceFilters)
      .pipe(take(1), map((data: PendingInvoiceResponse) => {
        console.log("data back from invoice", data);
        this.totalCount = data._meta.totalCount;
        return data.data.map(individualInvoice => new Invoice(individualInvoice))
      }))
      .subscribe((invoices: Invoice[]) => {
        this.store.dispatch(new PendingInvoiceActions.ReceivePendingInvoices(invoices, this.totalCount));
      });
  }

  runSubscriptions(){
    this.subscribeToLineItemFilters();
    this.subscribeToInvoiceFilters();
    this.subscribeToPendingInvoiceCheckboxes();
    this.subscribeToPendingSelectAll();
    this.subscribeToPendingInvoiceCount();
    this.subscribeToLoading();
    this.subscribeToSelectedInvoices();
    this.subscribeToDeselectedInvoices();
    this.subscribeToPhaseOneComplete();
    this.subscribeToLineItemCount();
    this.subscribeToLineItemCheckboxes();
    this.subscribeToLineItems();
    this.subscribeSelectionChanged();
    this.subscribeToLineItemSelectAll();
    this.subscribeToSummaryInvoices();
    this.subscribeToSelectedLineItems();
    this.subscribeToInvoiceQuantity();
    this.subscribeToUnitPrice();
    this.subscribeToCompleted();
    this.subscribeToPhaseTwoComplete();
    this.subscribeToQuantityInvoicedError();
    this.subscribeToQuantityUnitPriceError();
    this.subscribeToTotalPrice();
  }

  //***Subscriptions Start***

  subscribeToLineItemFilters(){
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getLineItemFilters))
      .subscribe((lineItemFilters: fromPendingInvoices.LineItemFilters) => this.lineItemFilters = lineItemFilters);
  }

  subscribeToInvoiceFilters(){
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getInvoiceFilters))
      .subscribe((invoiceFilters: fromPendingInvoices.InvoiceFilters) => this.invoiceFilters = invoiceFilters);
  }

  subscribeToPendingInvoiceCheckboxes() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getInvoiceCheckBoxes))
      .subscribe((invoiceCheckboxes: {[key: string]: boolean}) => this.pendingInvoiceCheckboxes = invoiceCheckboxes);
  }

  subscribeToLineItemCheckboxes() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getLineItemCheckBoxes))
      .subscribe((lineItemCheckboxes: { [key: string]: boolean }) => this.lineItemCheckboxes = lineItemCheckboxes);
  }

  subscribeToPendingSelectAll(){
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getSelectAll))
    .subscribe((selectAll: boolean) => this.pendingSelectAll = selectAll);
  }

  subscribeToLineItemSelectAll() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.lineItemSelectAll))
      .subscribe((selectAll: boolean) => this.lineItemSelectAll = selectAll);
  }

  subscribeToLoading() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getLoadingState))
      .subscribe((loading: boolean) => this.loading = loading);
  }

  subscribeToSelectedInvoices() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getSelectedInvoices))
      .subscribe((selectedInvoices: { [key: string]: Invoice }) => {
        this.selectedInvoices = selectedInvoices;
        this.selectedInvoiceIds = Object.values(selectedInvoices).map((selectedInvoice: Invoice) => selectedInvoice.id);
      }, error => console.log("Selected Invoices Error", error));
  }

  subscribeToSummaryInvoices() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getSummaryInvoices))
      .subscribe((summaryInvoices: Invoice[]) => {
        this.summaryInvoices = summaryInvoices;
        console.log("updated Invoice Summary in service", summaryInvoices);
      });
  }

  subscribeToDeselectedInvoices() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getDeselectedInvoices))
      .subscribe((deselectedInvoices: { [key: string]: Invoice }) => {
        this.deselectedInvoices = deselectedInvoices;
        this.deselectedInvoiceIds = Object.values(deselectedInvoices).map((deselectedInvoice: Invoice) => deselectedInvoice.id);
      }, error => console.log("deselected error", error));
  }

  subscribeToSelectedLineItems(){
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getSelectedLineItems))
    .subscribe((selectedLineItems: {[key:string]: LineItem}) => {
      this.selectedLineItems = selectedLineItems;
      //this.sumLineItems(Object.values(selectedLineItems));
    });
  }

  subscribeToPhaseOneComplete() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getPhaseOneComplete))
      .subscribe((phaseOneComplete: boolean) => this.phaseOneComplete = phaseOneComplete);
  }

  subscribeToPhaseTwoComplete(){
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getPhaseTwoComplete))
      .subscribe((phaseTwoComplete: boolean) => {
        this.phaseTwoComplete = phaseTwoComplete;
      });
  }

  subscribeToQuantityInvoicedError(){
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getQuantityInvoicedError))
      .subscribe((quantityInvoicedError: boolean) => {
        this.quantityInvoicedError = quantityInvoicedError;
      });
  }

  subscribeToQuantityUnitPriceError() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getQuantityUnitPriceError))
      .subscribe((unitPriceError: boolean) => {
        this.priceInputError = unitPriceError;
      });
  }

  subscribeToPendingInvoiceCount() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getPendingInvoiceCount))
      .subscribe((count: number) => {
        this.totalCount = count;
      });
  }

  subscribeToLineItems(){
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getLineItems))
    .subscribe((lineItems: LineItem[]) => this.lineItems = lineItems);
  }

  subscribeToLineItemCount() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getPendingLineItemCount))
      .subscribe((count: number) => {
        this.totalLineItemCount = count;
      });
  }

  subscribeSelectionChanged() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getSelectionChanged))
      .subscribe((selectionChanged: boolean) => {
        this.invoiceSelectionChanged = selectionChanged;
      });
  }

  subscribeToTotalPrice() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getTotalPrice))
      .subscribe((totalPrice: number) => {
        this.totalPrice = totalPrice;
      });
  }

  subscribeToInvoiceQuantity(){
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getQuantityInvoiced))
      .subscribe((quantityInvoiced: { [key: string]: string }) => {
        this.quantityInvoiced = quantityInvoiced;
        for (let key in quantityInvoiced){
          if (this.selectedLineItems[key] !== undefined && this.checkFalseNumber(quantityInvoiced[key]) || this.selectedLineItems[key] !== undefined && this.selectedLineItems[key].orderedQuantity < parseFloat(quantityInvoiced[key])){
            this.store.dispatch(new PendingInvoiceActions.QuantityInvoicedError(true));
            return;
          }
        }
        this.store.dispatch(new PendingInvoiceActions.QuantityInvoicedError(false));
      });
  }

  subscribeToUnitPrice() {
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getUnitPrice))
      .subscribe((unitPrice: { [key: string]: string }) => {
        this.unitPrice = unitPrice;
        for (let key in unitPrice) {
          if (this.selectedLineItems[key] !== undefined && this.checkFalseNumber(unitPrice[key])) {
            this.store.dispatch(new PendingInvoiceActions.UnitPriceError(true));
            return;
          }
        }
        this.store.dispatch(new PendingInvoiceActions.UnitPriceError(false));
      });
  }

  subscribeToCompleted(){
    this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getCompletedState))
    .subscribe((completed: boolean) => {
      if (completed){
        this.navigateToCompletedInvoices();
        this.store.dispatch(new PendingInvoiceActions.ResetState());
      }
    });
  }
  //***End Subscriptions***

  getPendingInvoices(currentPage: number, perPage: number){
    this.store.dispatch(new PendingInvoiceActions.FetchPendingInvoices({
      currentPage,
      perPage,
      filters: this.invoiceFilters
    }));
  }

  getLineItems(currentPage: number, perPage: number){
    console.log("this.selectedInvoiceIds", this.selectedInvoiceIds);
    console.log("this.pendingSelectAll", this.pendingSelectAll);
    console.log("this.deselectedInvoiceIds", this.deselectedInvoiceIds);
    this.store.dispatch(new PendingInvoiceActions.FetchLineItems({
      filters: this.lineItemFilters,
      perPage,
      currentPage,
      invoiceIds: !this.pendingSelectAll ? this.selectedInvoiceIds : this.deselectedInvoiceIds,
      deselect: this.pendingSelectAll
    }))
  }

  getSummaryInvoices(){
    console.log("get summary invoices running");
    const invoiceUsed = new Set();
    const invoiceIds = [];
    const lineItems = [];
    Object.values(this.selectedLineItems).forEach((selectedLineItem: LineItem) => {
      if (!invoiceUsed.has(selectedLineItem.invoiceId)){
        invoiceIds.push({
          id: selectedLineItem.invoiceId
        });
        invoiceUsed.add(selectedLineItem.invoiceId);
      }
      lineItems.push({
        id: selectedLineItem.id,
        parentId: selectedLineItem.parentId,
        invoiceQuantity: this.quantityInvoiced[selectedLineItem.id] ? 
        this.quantityInvoiced[selectedLineItem.id] : 
        selectedLineItem.invoiceQuantity,
        unitPrice: this.unitPrice[selectedLineItem.id] ? 
        this.unitPrice[selectedLineItem.id] :
        selectedLineItem.unitPrice
      });
    });
    const final = "0";
    const merged = "0";
    this.store.dispatch(new PendingInvoiceActions.IsLoading(true));
    this.store.dispatch(new PendingInvoiceActions.CreateSummaryInvoices({
      invoiceIds,
      lineItems,
      final,
      merged
    }));
  }

  finalizeInvoice(){
    const invoiceUsed = new Set();
    const invoiceIds = [];
    const lineItems = [];
    Object.values(this.selectedLineItems).forEach((selectedLineItem: LineItem) => {
      if (!invoiceUsed.has(selectedLineItem.invoiceId)) {
        invoiceIds.push({
          id: selectedLineItem.invoiceId
        });
        invoiceUsed.add(selectedLineItem.invoiceId);
      }
      lineItems.push({
        id: selectedLineItem.id,
        parentId: selectedLineItem.parentId,
        invoiceQuantity: this.quantityInvoiced[selectedLineItem.id] ?
          this.quantityInvoiced[selectedLineItem.id] :
          selectedLineItem.invoiceQuantity,
        unitPrice: this.unitPrice[selectedLineItem.id] ?
          this.unitPrice[selectedLineItem.id] :
          selectedLineItem.unitPrice
      });
    });
    const final = "1";
    const merged = "0";
    this.store.dispatch(new PendingInvoiceActions.IsLoading(true));
    this.store.dispatch(new PendingInvoiceActions.FinalizeInvoice({
      invoiceIds,
      lineItems,
      final,
      merged
    }));
  }

  navigateToCompletedInvoices(){
    this.router.navigate(['/e-commerce/invoicing']);
  }

  checkFalseNumber(number: string) {
    return Number.isNaN(parseFloat(number));
  }

  sumLineItems(lineItems: LineItem[]){
    this.totalPrice = lineItems.reduce((acc, curr) => {
      let quantityInvoiced: number;
      let actualUnitPrice: number;
      if (this.quantityInvoiced[curr.id] != undefined && !this.checkFalseNumber(this.quantityInvoiced[curr.id])){
        quantityInvoiced = parseFloat(this.quantityInvoiced[curr.id]);
      } else {
        quantityInvoiced = curr.invoiceQuantity;
      }

      if (this.unitPrice[curr.id] != undefined && !this.checkFalseNumber(this.unitPrice[curr.id])){
        actualUnitPrice = parseFloat(this.unitPrice[curr.id])
      } else {
        actualUnitPrice = curr.unitPrice;
      }
      return acc + actualUnitPrice * quantityInvoiced;
    }, 0)
  }

  ngOnDestroy(){
    this.destroyed$.next(true);
  }

}

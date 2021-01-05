import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { PendingInvoicesService } from '../../../services/pending-invoices.service';
import { Store, select } from "@ngrx/store";
import * as fromPendingInvoice from "../../../state/invoices.state";
import * as PendingInvoiceSelectors from "../../../state/selectors/pendingInvoice.selectors";
import { takeUntil, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as PendingInvoiceActions from "../../../store/pendingInvoices.actions";
import { MatPaginator } from '@angular/material/paginator';
import { ILineItem } from '../../../interface/interface';
import { Subscription, Subject, Observable } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';

@Component({
  selector: 'invoice-step-two',
  templateUrl: './step-two.component.html',
  styleUrls: ['./step-two.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class StepTwoComponent implements OnInit {
  expandedColumns = [
    "checkbox",
    "invoiceNumber",
    "customer",
    "itemNo",
    "name",
    "color",
    "size",
    "orderedQuantity",
    "invoiceQuantity",
    "unitPrice",
    "totalPrice",
  ]; 

  formValueSubscription: Subscription;
  filterForm: FormGroup;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: LineItemDataSource;

  constructor(public pendingService: PendingInvoicesService, 
    private store: Store<fromPendingInvoice.State>,
    private fb: FormBuilder ) { }

  ngOnInit() {
    this.setupDataSource();
    this.createFilterForm();
  }

  paginate(event){
    console.log("event", event);
    this.store.dispatch(new PendingInvoiceActions.LineItemPageEvent(event));
  }

  setupDataSource(){
    this.dataSource = new LineItemDataSource(this.store);
  }

  selectLineItem(event, lineItem: ILineItem){
    this.store.dispatch(new PendingInvoiceActions.SelectLineItem(lineItem, event.checked));
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      customer: [this.pendingService.lineItemFilters.customer],
      invoiceNo: [this.pendingService.lineItemFilters.invoiceNo]
    });
    this.subscribeToFilterForm();
  }

  toggleAll(event) {
    this.initSelection(event.checked);
  }

  initSelection(val = false) {
    this.store.dispatch(new PendingInvoiceActions.LineItemSelectAll(val));
  }

  chooseLineItem(lineItem: ILineItem){
    if (this.pendingService.lineItemCheckboxes[lineItem.id]){
      this.store.dispatch(new PendingInvoiceActions.SelectLineItem(lineItem, false))
    } else {
      this.store.dispatch(new PendingInvoiceActions.SelectLineItem(lineItem, true))
    }
  }

  subscribeToFilterForm() {
    this.formValueSubscription = this.filterForm.valueChanges
      .pipe(tap(val => {
        this.store.dispatch(new PendingInvoiceActions.TrackLineItemFilters(val))
      }),
        debounceTime(300),
        distinctUntilChanged())
      .subscribe((val) => {
        this.store.dispatch(new PendingInvoiceActions.IsLoading(true));
        this.pendingService.getLineItems(this.paginator.pageIndex + 1, this.paginator.pageSize);
      })
  }

}

export class LineItemDataSource extends DataSource<any> {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(private store: Store<fromPendingInvoice.State>) {
    super();
  }

  connect(): Observable<any[]> {
    return this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.paginatedLineItems));
  }
  disconnect() {
    this.destroyed$.next(true);
  }

}

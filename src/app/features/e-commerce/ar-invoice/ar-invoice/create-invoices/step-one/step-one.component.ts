import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Subject, Observable, Subscription } from 'rxjs';
import { Store, select } from "@ngrx/store";
import * as fromPendingInvoice from "../../../state/invoices.state";
import * as PendingInvoiceSelectors from "../../../state/selectors/pendingInvoice.selectors";
import { takeUntil, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PendingInvoicesService } from '../../../services/pending-invoices.service';
import { fuseAnimations } from '@fuse/animations';
import * as PendingInvoiceActions from "../../../store/pendingInvoices.actions";
import { MatPaginator } from '@angular/material/paginator';
import { IInvoice } from '../../../interface/interface';

@Component({
  selector: 'invoice-step-one',
  templateUrl: './step-one.component.html',
  styleUrls: ['./step-one.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class StepOneComponent implements OnInit, OnDestroy {
  displayedColumns = [
    "checkbox",
    "number",
    "label",
    "customer",
    "salesAmount"
  ];

  formValueSubscription: Subscription;
  filterForm: FormGroup;
  dataSource: PendingInvoiceDataSource;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private fb: FormBuilder, 
    private store: Store<fromPendingInvoice.State>,
    public pendingService: PendingInvoicesService) { }

  ngOnInit() {
    this.setupDataSource();
    this.createFilterForm();
  }

  ngOnDestroy(){
    if (this.formValueSubscription) this.formValueSubscription.unsubscribe();
  }

  setupDataSource(){
    this.dataSource = new PendingInvoiceDataSource(this.store);
  }

  phaseOneComplete(): boolean{
    //const val = (this.pendingService.pendingSelectAll && (this.pendingService.totalCount > Object.values(this.pendingService.deselectedInvoices).length)) || !!this.pendingService.selectedInvoices.length;
    return this.pendingService.phaseOneComplete;
  }

  selectInvoice(event, invoice: IInvoice){
    this.store.dispatch(new PendingInvoiceActions.SelectPendingInvoice(invoice, event.checked));
  }

  chooseInvoice(invoice: IInvoice){
    this.store.dispatch(new PendingInvoiceActions.SelectPendingInvoice(invoice,
      this.pendingService.pendingInvoiceCheckboxes[invoice.id] ? 
      false : true))
  }

  createFilterForm(){
    this.filterForm = this.fb.group({
      label: [this.pendingService.invoiceFilters.label],
      customer: [this.pendingService.invoiceFilters.customer],
      number: [this.pendingService.invoiceFilters.number]
    });
    this.subscribeToFilterForm();
  }

  paginate(event){
    this.pendingService.getPendingInvoices(event.pageIndex + 1, event.pageSize);
  }

  subscribeToFilterForm(){
    this.formValueSubscription = this.filterForm.valueChanges
    .pipe(tap(val => {
      this.store.dispatch(new PendingInvoiceActions.TrackInvoiceFilters(val))
    }),
      debounceTime(300),
      distinctUntilChanged())
    .subscribe((val) => {
      this.store.dispatch(new PendingInvoiceActions.IsLoading(true));
      this.pendingService.getPendingInvoices(this.paginator.pageIndex + 1, this.paginator.pageSize);
    })
  }

  toggleAll(){
    if (this.pendingService.pendingSelectAll){
      this.initSelection(false);
    } else {
      this.initSelection(true);
    }
  }

  initSelection(val = false){
    this.store.dispatch(new PendingInvoiceActions.PendingInvoiceSelectAll(val));
    if (val){
      this.store.dispatch(new PendingInvoiceActions.ClearDeselected());
    } else {
      this.store.dispatch(new PendingInvoiceActions.ClearSelected());
    }
  }

}

export class PendingInvoiceDataSource extends DataSource<any> {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(private store: Store<fromPendingInvoice.State>){
    super();
  }

  connect(): Observable<any[]> {
    return this.store.pipe(takeUntil(this.destroyed$), select(PendingInvoiceSelectors.getPendingInvoicesList));
  }
  disconnect() {
    this.destroyed$.next(true);
  }

}

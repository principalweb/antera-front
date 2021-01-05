import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { fuseAnimations } from "@fuse/animations";
import { DataSource } from "@angular/cdk/collections";
import { Subject, Observable, of, Subscription } from 'rxjs';
import { Store, select } from "@ngrx/store";
import { Router, ActivatedRoute } from '@angular/router';
import * as fromInvoice from "../../state/invoices.state";
import * as InvoiceSelectors from "../../state/selectors/invoice.selectors";
import { takeUntil, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ArInvoiceService } from '../../services/ar-invoice.service';
import * as InvoiceActions from "../../store/invoices.actions";

@Component({
  selector: "list-view",
  templateUrl: "./list-view.component.html",
  styleUrls: ["./list-view.component.scss"],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class ListViewComponent implements OnInit, OnDestroy {
  displayedColumns = [
    //"checkbox",
    "number",
    "label",
    "customer",
    "created",
    "salesAmount",
    "status",
  ];
  loading: boolean;
  filterForm: FormGroup;
  formValueSubscription: Subscription;
  checkboxes: { [key: string]: boolean } = {};
  dataSource: InvoiceListDataSource;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public invoiceService: ArInvoiceService,
    private store: Store<fromInvoice.State>
  ) {}

  ngOnInit() {
    this.setupDataSource();
    this.subscribeToLoading();
    this.createFilterForm();
  }

  setupDataSource() {
    this.dataSource = new InvoiceListDataSource(this.store);
  }

  subscribeToLoading() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(InvoiceSelectors.getLoadingState)
      )
      .subscribe((loading: boolean) => {
        this.loading = loading;
        console.log("loading", loading);
      });
  }

  statusChange(event) {}

  paginate(event){
    const { pageIndex, pageSize } = event;
    this.store.dispatch(new InvoiceActions.IsLoading(true));
    console.log("paginate triggered");
    this.invoiceService.getFinalInvoices(pageSize, pageIndex);
  }

  createFilterForm() {
    this.filterForm = this.fb.group({
      label: this.invoiceService.filters.label,
      customer: this.invoiceService.filters.customer,
    });
    this.formValueSubscription = this.filterForm.valueChanges
      .pipe(
        tap((val) => this.store.dispatch(new InvoiceActions.TrackFilters(val))),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value) => {
        this.store.dispatch(new InvoiceActions.IsLoading(true));
        console.log("here is the value", value);
      });
  }

  newInvoice() {
    this.router.navigate(["new"], { relativeTo: this.route });
  }

  navigateToInvoice(invoiceId: string){
    this.router.navigate([`invoices/${invoiceId}`], { relativeTo: this.route });
  }

  ngOnDestroy() {
    this.formValueSubscription.unsubscribe();
    this.destroyed$.next(true);
  }
}

export class InvoiceListDataSource extends DataSource<any>{
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(private store: Store<fromInvoice.State>) {
    super();
  }
  connect(): Observable<any[]> {
    return this.store.pipe(takeUntil(this.destroyed$), select(InvoiceSelectors.getFinalInvoicesList));
  }
  disconnect() {
    this.destroyed$.next(true);
  }
}

// const sampleList = [
//   {
//     id: "781919191",
//     number: "7001",
//     label: "Sample 1",
//     created: new Date().toDateString(),
//     salesAmount: 901.0,
//     status: "Unpaid",
//   },
//   {
//     id: "6161271287323",
//     number: "7002",
//     label: "Sample 2",
//     created: new Date().toDateString(),
//     salesAmount: 501,
//     status: "Paid",
//   },
//   {
//     number: "7003",
//     label: "Sample 3",
//     created: new Date().toDateString(),
//     salesAmount: 714.0,
//     status: "Unpaid",
//   },
// ];

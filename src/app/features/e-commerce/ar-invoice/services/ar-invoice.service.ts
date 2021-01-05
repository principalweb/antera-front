import { Injectable, OnDestroy } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Store, select } from "@ngrx/store";
import { ApiService } from 'app/core/services/api.service';
import { map, takeUntil } from 'rxjs/operators';
import { InvoiceResponse, Meta } from "../interface/interface";
import { IFilters } from '../state/invoices.state';
import { Invoice } from 'app/models/ar-invoice';
import * as fromInvoice from "../state/invoices.state";
import * as InvoiceActions from "../store/invoices.actions";
import * as InvoiceSelectors from "../state/selectors/invoice.selectors";
import { InvoiceDetailService } from './invoice-detail.service';
@Injectable({
  providedIn: "root",
})
export class ArInvoiceService implements Resolve<any>, OnDestroy {
  destroyed$: Subject<boolean> = new Subject();
  meta: Meta;
  filters: IFilters;
  finalInvoices: Invoice[];
  totalCount: number;
  constructor(private api: ApiService, private store: Store<fromInvoice.State>, private invoiceDetailService: InvoiceDetailService) {}
  
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any{
    this.subscribeToFilters();
    return this.api.getFinalInvoices({
      status: "",
      label: "",
      customer: ""
    }, 1, 50)
    .pipe(map((data: InvoiceResponse) => {
      console.log("initial final invoices", data);
      this.meta = data._meta;
      this.totalCount = this.meta.totalCount;
      return data.data.map(invidualInvoice => new Invoice(invidualInvoice))
    }))
    .subscribe((invoiceList: Invoice[]) => {
      console.log("modeled invoices", invoiceList);
      this.store.dispatch(new InvoiceActions.SetInitialState({
        invoiceList,
        selectedInvoice: !this.invoiceDetailService.invoice ? null : this.invoiceDetailService.invoice,
        loading: false,
        meta: this.meta,
        fetchError: false,
        filters: {
          status: "",
          label: "",
          customer: ""
        }
      }))
    })
  };

  ngOnDestroy(){
    this.destroyed$.next(true);
  }

  subscribeToFilters(){
    this.store.pipe(takeUntil(this.destroyed$), select(InvoiceSelectors.getFilterState))
    .subscribe((filters: IFilters) => this.filters = filters);
  }

  getFinalInvoices(perPage: number, currentPage: number){
    this.store.dispatch(new InvoiceActions.FetchFinalInvoices({
      filters: this.filters,
      perPage,
      currentPage
    }));
  }
}

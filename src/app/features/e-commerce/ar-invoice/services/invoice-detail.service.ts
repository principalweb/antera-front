import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, Params, Resolve, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/core/services/api.service';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import * as fromInvoice from "../state/invoices.state";
import * as InvoiceActions from "../store/invoices.actions";
import * as InvoiceSelectors from "../state/selectors/invoice.selectors";
import { Invoice } from 'app/models/ar-invoice';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InvoiceDetailService implements Resolve<any>, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  invoice: Invoice;
  invoiceId: string;
  constructor(private api: ApiService, private route: ActivatedRoute, private store: Store<fromInvoice.State>) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
    this.invoiceId = route.params.id;
    return this.api.getInvoiceDetails(this.invoiceId)
    .pipe(tap(invoice => {
      console.log("invoice", invoice);
      this.invoice = new Invoice(invoice);
      console.log("modeled invoice", this.invoice);
      this.store.dispatch(new InvoiceActions.ReceiveSelectedInvoice(invoice));
    }));
  }
  ngOnDestroy() {
    this.destroyed$.next(true);
  }

  updateInvoice(data){
    this.store.dispatch(new InvoiceActions.IsLoading(true));
    this.store.dispatch(new InvoiceActions.UpdateInvoice({
      invoiceId: this.invoiceId,
      data
    }));
  }

}

import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { ApiService } from 'app/core/services/api.service';
import * as InvoiceActions from "./invoices.actions";
import { switchMap, map, catchError } from 'rxjs/operators';
import { InvoiceResponse, IInvoice } from '../interface/interface';
import { Invoice } from 'app/models/ar-invoice';
import { of } from 'rxjs';

@Injectable()
export class InvoiceEffects {
  constructor(private actions$: Actions, private api: ApiService) {}

  @Effect()
  fetchFinalInvoices = this.actions$.pipe(
    ofType(InvoiceActions.FETCH_FINAL_INVOICES),
    switchMap((data: InvoiceActions.FetchFinalInvoices) => {
      console.log("effects are being triggered");
      return this.api
        .getFinalInvoices(
          data.payload.filters,
          data.payload.currentPage,
          data.payload.perPage
        )
        .pipe(
          switchMap((data: InvoiceResponse) => {
            console.log("fetch invoice data", data);
            const invoices: Invoice[] = data.data.map(
              (individualInvoice) => new Invoice(individualInvoice)
            );
            return [new InvoiceActions.ReceiveFinalInvoices(invoices)];
          })
        );
    }),
    catchError((error) => {
      console.log("filtered error", error);
      return of(new InvoiceActions.FetchError());
    })
  );

  @Effect()
  updateInvoice = this.actions$.pipe(
    ofType(InvoiceActions.UPDATE_INVOICE),
    switchMap((data: InvoiceActions.UpdateInvoice) => {
      return this.api
        .updateInvoice(data.payload.invoiceId, data.payload.data)
        .pipe(
          map((invoice) => {
            const newInvoice: IInvoice = new Invoice(invoice);
            return new InvoiceActions.ReceiveSelectedInvoice(newInvoice);
          })
        );
    }),
    catchError((error) => {
      console.log("filtered error", error);
      return of(new InvoiceActions.FetchError());
    })
  );
}
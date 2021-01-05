import { Injectable } from "@angular/core";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { ApiService } from 'app/core/services/api.service';
import * as PendingInvoiceActions from "./pendingInvoices.actions";
import { switchMap, map, catchError } from 'rxjs/operators';
import { InvoiceResponse, IInvoice, PendingInvoiceResponse, LineItemResponse } from '../interface/interface';
import { Invoice, LineItem } from 'app/models/ar-invoice';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable()
export class PendingInvoiceEffects {
    constructor(private actions$: Actions, private api: ApiService) { }

    @Effect()
    fetchPendingInvoices = this.actions$.pipe(
    ofType(PendingInvoiceActions.FETCH_PENDING_INVOICES),
    switchMap((data: PendingInvoiceActions.FetchPendingInvoices) => {
        return this.api.getPendingInvoices(
            data.payload.filters,
            data.payload.currentPage,
            data.payload.perPage)
        .pipe(map((data: PendingInvoiceResponse) => {
            const pendingInvoices: Invoice[] = data.data.map(individualPendingInvoice => new Invoice(individualPendingInvoice));
            return new PendingInvoiceActions.ReceivePendingInvoices(pendingInvoices, data._meta.totalCount);
        }))
    }), catchError((error: HttpErrorResponse) => {
        console.log("Fetch Pending Invoice error", error);
        return of(new PendingInvoiceActions.FetchError());
    })
    );

    @Effect()
    fetchLineItems = this.actions$.pipe(
        ofType(PendingInvoiceActions.FETCH_LINE_ITEMS),
        switchMap((data: PendingInvoiceActions.FetchLineItems) => {
            console.log("data in effect", data.payload);
            return this.api.fetchLineItemsByInvoiceIds(
                data.payload.currentPage,
                data.payload.perPage,
                data.payload.filters,
                data.payload.invoiceIds,
                data.payload.deselect
            )
            .pipe(map((response: LineItemResponse) => {
                console.log("Raw Response", response);
                const lineItems = response.data.map(individualLineItem => new LineItem(individualLineItem));
                const lineItemTotalCount = response.data.length;
                return new PendingInvoiceActions.ReceiveLineItems(lineItems, lineItemTotalCount)
            })
            );
        }), catchError((error: HttpErrorResponse) => {
            console.log("Line Item Response error", error);
            return of(new PendingInvoiceActions.FetchError())
        })
    );

    @Effect()
    createSummaryInvoices = this.actions$.pipe(
        ofType(PendingInvoiceActions.CREATE_SUMMARY_INVOICES),
        switchMap((data: PendingInvoiceActions.CreateSummaryInvoices) => {
            return this.api.createSummaryInvoices({
                invoiceIds: data.payload.invoiceIds,
                lineItems: data.payload.lineItems,
                final: data.payload.final,
                merged: data.payload.merged
            })
            .pipe(map((summaryResponse: PendingInvoiceResponse) => {
                console.log("summary response", summaryResponse);
                const summaryInvoices = summaryResponse.data.map(individualInvoice => new Invoice(individualInvoice));
                return new PendingInvoiceActions.ReceiveSummaryInvoices(summaryInvoices);
            }))
        }), 
        catchError((error: HttpErrorResponse) => {
            console.log("Fetch Create Summary Invoice error", error);
            return of(new PendingInvoiceActions.FetchError());
        })
    );

    @Effect()
    finalizeInvoices = this.actions$.pipe(
        ofType(PendingInvoiceActions.FINALIZE_INVOICE),
        switchMap((data: PendingInvoiceActions.FinalizeInvoice) => {
            return this.api.createSummaryInvoices({
                invoiceIds: data.payload.invoiceIds,
                lineItems: data.payload.lineItems,
                final: data.payload.final,
                merged: data.payload.merged
            }).pipe(map((summaryResponse: PendingInvoiceResponse) => {
                    console.log("summary response", summaryResponse);
                    return new PendingInvoiceActions.CompleteInvoices();
                }))
        }),
        catchError((error: HttpErrorResponse) => {
            console.log("Fetch Create Summary Invoice error", error);
            return of(new PendingInvoiceActions.FetchError());
        })
    )

}
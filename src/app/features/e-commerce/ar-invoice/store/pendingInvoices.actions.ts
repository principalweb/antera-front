import { Action } from "@ngrx/store";
import { IInvoice, SummaryInvoicePayload } from "../interface/interface";
import { InvoiceFilters, LineItemFilters, PageEvent } from '../state/pendingInvoices.state';
import { ILineItem } from '../interface/interface';

export const RECEIVE_PENDING_INVOICES = "[PENDING-INVOICES] RECEIVE_PENDING_INVOICES";
export const RECEIVE_SUMMARY_INVOICES = "[PENDING-INVOICES] RECEIVE_SUMMARY_INVOICES";
export const RECEIVE_LINE_ITEMS = "[PENDING-INVOICES] RECEIVE_LINE_ITEMS";
export const TRACK_INVOICE_FILTERS = "[PENDING-INVOICES] TRACK_INVOICE_FILTERS";
export const TRACK_LINE_ITEM_FILTERS = "[PENDING-INVOICES] TRACK_LINE_ITEM_FILTERS";
export const IS_LOADING = "[PENDING-INVOICES] IS_LOADING";
export const FETCH_PENDING_INVOICES = "[PENDING-INVOICES] FETCH_PENDING_INVOICES";
export const FETCH_LINE_ITEMS = "[PENDING-INVOICES] FETCH_LINE_ITEMS";
export const FETCH_ERROR = "[PENDING-INVOICES] FETCH_ERROR";
export const PENDING_INVOICE_SELECT_ALL = "[PENDING-INVOICES] PENDING_INVOICE_SELECT_ALL";
export const SELECT_LINE_ITEM = "[PENDING-INVOICES] SELECT_LINE_ITEM";
export const SELECT_PENDING_INVOICE = "[PENDING-INVOICES] SELECT_PENDING_INVOICE";
export const LINE_ITEM_SELECT_ALL = "[PENDING-INVOICES] LINE_ITEM_SELECT_ALL";
export const CLEAR_DESELECTED = "[PENDING-INVOICES] CLEAR_DESELECTED";
export const CLEAR_SELECTED = "[PENDING-INVOICES] CLEAR_SELECTED";
export const CLEAR_LINE_ITEM_DESELECTED = "[PENDING-INVOICES] CLEAR_DESELECTED";
export const CLEAR_LINE_ITEM_SELECTED = "[PENDING-INVOICES] CLEAR_LINE_ITEM_SELECTED";
export const INVOICE_SELECTION_CHANGED = "[PENDING-INVOICES] INVOICE_SELECTION_CHANGED";
export const LINE_ITEM_PAGE_EVENT = "[PENDING-INVOICES] LINE_ITEM_PAGE_EVENT";
export const EDIT_AMOUNT = "[PENDING-INVOICES] EDIT_AMOUNT";
export const EDIT_PRICE = "[PENDING-INVOICES] EDIT_PRICE";
export const CREATE_SUMMARY_INVOICES = "[PENDING-INVOICES] CREATE_SUMMARY_INVOICES";
export const FINALIZE_INVOICE = "[PENDING-INVOICES] FINALIZE_INVOICE";
export const COMPLETE_INVOICES = "[PENDING-INVOICES] COMPLETE_INVOICES";
export const RESET_STATE = "[PENDING-INVOICES] RESET_STATE";
export const QUANTITY_INVOICED_ERROR = "[PENDING-INVOICES] QUANTITY_INVOICED_ERROR";
export const UNIT_PRICE_ERROR = "[PENDING-INVOICES] UNIT_PRICE_ERROR";

export type PendingInvoiceActions = 
ReceivePendingInvoices |
TrackInvoiceFilters |
IsLoading |
FetchPendingInvoices |
FetchError |
ClearDeselected |
ClearSelected |
PendingInvoiceSelectAll |
LineItemSelectAll |
SelectPendingInvoice |
TrackLineItemFilters |
InvoiceSelectionChanged |
FetchLineItems |
ReceiveLineItems |
ClearLineItemSelected |
ClearLineItemDeselected |
LineItemPageEvent |
EditAmount |
EditPrice |
CreateSummaryInvoices |
ReceiveSummaryInvoices |
FinalizeInvoice |
CompleteInvoices |
ResetState |
QuantityInvoicedError |
UnitPriceError |
SelectLineItem;


export class ReceivePendingInvoices implements Action {
    readonly type = RECEIVE_PENDING_INVOICES;
    constructor(public payload: IInvoice[], public totalCount: number) { }
}

export class ReceiveLineItems implements Action {
    readonly type = RECEIVE_LINE_ITEMS;
    constructor(public payload: ILineItem[], public totalCount: number) { }
}

export class TrackInvoiceFilters implements Action {
    readonly type = TRACK_INVOICE_FILTERS;
    constructor(public payload: InvoiceFilters) { }
}

export class TrackLineItemFilters implements Action {
    readonly type = TRACK_LINE_ITEM_FILTERS;
    constructor(public payload: LineItemFilters) { }
}

export class IsLoading implements Action {
    readonly type = IS_LOADING;
    constructor(public payload: boolean) { }
}

export class ClearDeselected implements Action {
    readonly type = CLEAR_DESELECTED;
    constructor(public payload?) { }
}

export class ClearSelected implements Action {
    readonly type = CLEAR_SELECTED;
    constructor(public payload?) { }
}

export class ClearLineItemSelected implements Action {
    readonly type = CLEAR_LINE_ITEM_SELECTED;
    constructor(public payload?) { }
}

export class ClearLineItemDeselected implements Action {
    readonly type = CLEAR_LINE_ITEM_DESELECTED;
    constructor(public payload?) { }
}


export class FetchPendingInvoices implements Action {
    readonly type = FETCH_PENDING_INVOICES;
    constructor(public payload: FetchInvoiceRequest) { }
}

export class FetchLineItems implements Action {
    readonly type = FETCH_LINE_ITEMS;
    constructor(public payload: FetchLineItemRequest) { }
}

export class FetchError implements Action {
    readonly type = FETCH_ERROR;
    constructor(public payload?) { }
}

export class PendingInvoiceSelectAll implements Action {
    readonly type = PENDING_INVOICE_SELECT_ALL;
    constructor(public payload: boolean) { }
}

export class LineItemSelectAll implements Action {
    readonly type = LINE_ITEM_SELECT_ALL;
    constructor(public payload: boolean) { }
}

export class InvoiceSelectionChanged implements Action {
    readonly type = INVOICE_SELECTION_CHANGED;
    constructor(public payload: boolean) { }
}

export class LineItemPageEvent implements Action {
    readonly type = LINE_ITEM_PAGE_EVENT;
    constructor(public payload: PageEvent) { }
}

export class SelectLineItem implements Action {
    readonly type = SELECT_LINE_ITEM;
    constructor(public payload: ILineItem, public selected: boolean) { }
}

export class SelectPendingInvoice implements Action {
    readonly type = SELECT_PENDING_INVOICE;
    constructor(public payload: IInvoice, public selected: boolean) { }
}

export class EditAmount implements Action {
    readonly type = EDIT_AMOUNT;
    constructor(public payload: {[key: string]: string}) { }
}

export class CreateSummaryInvoices implements Action {
    readonly type = CREATE_SUMMARY_INVOICES;
    constructor(public payload: SummaryInvoicePayload) { }
}

export class FinalizeInvoice implements Action {
    readonly type = FINALIZE_INVOICE;
    constructor(public payload: SummaryInvoicePayload) { }
}

export class ReceiveSummaryInvoices implements Action {
    readonly type = RECEIVE_SUMMARY_INVOICES;
    constructor(public payload: IInvoice[]) { }
}

export class EditPrice implements Action {
    readonly type = EDIT_PRICE;
    constructor(public payload: {[key:string]: string}) { }
}

export class ResetState implements Action {
    readonly type = RESET_STATE;
    constructor(public payload?) { }
}

export class CompleteInvoices implements Action {
    readonly type = COMPLETE_INVOICES;
    constructor(public payload? ) { }
}

export class QuantityInvoicedError implements Action {
    readonly type = QUANTITY_INVOICED_ERROR;
    constructor(public payload: boolean) { }
}

export class UnitPriceError implements Action {
    readonly type = UNIT_PRICE_ERROR;
    constructor(public payload: boolean) { }
}

export interface FetchInvoiceRequest {
    filters: InvoiceFilters;
    perPage: number;
    currentPage: number;
}

export interface FetchLineItemRequest {
    filters: LineItemFilters;
    perPage: number;
    currentPage: number;
    invoiceIds: string[];
    deselect: boolean;
}

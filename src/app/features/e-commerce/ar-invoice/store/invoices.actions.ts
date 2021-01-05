import { Action } from "@ngrx/store";
import { IInvoice } from "../interface/interface";
import { IFilters, State } from '../state/invoices.state';

export const FETCH_FINAL_INVOICES = "[AR-INVOICE] FETCH_FINAL_INVOICES";
export const RECEIVE_FINAL_INVOICES = "[AR-INVOICE] RECEIVE_FINAL_INVOICES";
export const SET_INITIAL_STATE = "[AR-INVOICE] SET_INITIAL_STATE";
export const TRACK_FILTERS = "[AR-INVOICE] TRACK_FILTERS";
export const IS_LOADING = "[AR-INVOICE] IS_LOADING";
export const RECEIVE_SELECTED_INVOICE = "[AR-INVOICE] RECEIVE_SELECTED_INVOICE";
export const UPDATE_INVOICE = "[AR-INVOICE] UPDATE_INVOICE";
export const FETCH_ERROR = "[AR-INVOICE] FETCH_ERROR";

export type InvoiceActions =
  | FetchFinalInvoices
  | ReceiveFinalInvoices
  | SetInitialState
  | IsLoading
  | ReceiveSelectedInvoice
  | FetchError
  | TrackFilters;

export class FetchFinalInvoices implements Action {
  readonly type = FETCH_FINAL_INVOICES;
  constructor(public payload: FinalInvoiceFetchRequest) {}
}

export class ReceiveFinalInvoices implements Action {
  readonly type = RECEIVE_FINAL_INVOICES;
  constructor(public payload: IInvoice[]) {}
}

export class SetInitialState implements Action {
  readonly type = SET_INITIAL_STATE;
  constructor(public payload: State) {}
}

export class TrackFilters implements Action {
  readonly type = TRACK_FILTERS;
  constructor(public payload: IFilters) {}
}

export class IsLoading implements Action {
  readonly type = IS_LOADING;
  constructor(public payload: boolean) {}
}

export class ReceiveSelectedInvoice implements Action {
  readonly type = RECEIVE_SELECTED_INVOICE;
  constructor(public payload: IInvoice) { }
}

export class UpdateInvoice implements Action {
  readonly type = UPDATE_INVOICE;
  constructor(public payload: UpdateRequest) {}
}

export class FetchError implements Action {
  readonly type = FETCH_ERROR;
  constructor(public payload?) {}
}



export interface FinalInvoiceFetchRequest {
    filters: IFilters,
    perPage: number;
    currentPage: number;
}

export interface UpdateRequest{
  invoiceId: string;
  data: {[key: string]: string};
}

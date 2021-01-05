import { Action } from '@ngrx/store';
import { PurchaseOrder } from '../interface/interface';
import { State, POFilters, Meta } from "../state/purchase-orders.state";
export const RECEIVE_PURCHASE_ORDERS = "[Purchase Orders] RECEIVE_PURCHASE_ORDERS";
export const CREATE_PURCHASE_ORDER = "[Purchase Orders] CREATE_PURCHASE_ORDER";
export const FETCH_PURCHASE_ORDERS = "[Purchase Orders] FETCH_PURCHASE_ORDERS";
export const SET_INITIAL_PURCHASE_ORDERS = "[Purchase Orders] SET_INITIAL_PURCHASE_ORDERS";
export const FILTER_PURCHASE_ORDERS = "[Purchase Orders] FILTER_PURCHASE_ORDERS";
export const FETCH_ERROR = "[Purchase Orders] FETCH_ERROR";
export const CLEAR_FETCH_ERROR = "[Purchase Orders] CLEAR_FETCH_ERROR";
export const IS_LOADING = "[Purchase Orders] IS_LOADING";
export const TRACK_FILTERS = "[Purchase Orders] TRACK_FILTERS";
export const UPDATE_STATUS_FILTER = "[Purchase Orders] UPDATE_STATUS_FILTER";
export const UPDATE_META = "[Purchase Orders] UPDATE_META";
export const RECEIVE_SELECTED_PURCHASE_ORDER = "[Purchase Orders] RECEIVE_SELECTED_PURCHASE_ORDER";
export const UPDATE_HIDDEN = "[Purchase Orders] UPDATE_HIDDEN";
export const CHANGE_VENDOR = "[Purchase Orders] CHANGE_VENDOR";
export const FETCH_SELECTED_PURCHASE_ORDER = "[Purchase Orders] FETCH_SELECTED_PURCHASE_ORDER";
export const UPDATE_PURCHASE_ORDER = "[Purchase Orders] UPDATE_PURCHASE_ORDER";

export type PurchaseOrderActions = 
ReceivePurchaseOrders | 
CreatePurchaseOrder | 
setInitialPurchaseOrders |
fetchError |
IsLoading |
TrackFilters |
UpdateStatusFilter |
UpdateMeta |
UpdateHidden |
ChangeVendor |
UpdatePurchaseOrder |
ReceiveSelectedPurchaseOrder |
clearFetchError;

export class ReceivePurchaseOrders implements Action {
    readonly type = RECEIVE_PURCHASE_ORDERS;
    constructor(public payload: PurchaseOrder[]){}
}

export class CreatePurchaseOrder implements Action {
    readonly type = CREATE_PURCHASE_ORDER;
    constructor(public payload: PurchaseOrder) {}
}

export class UpdateMeta implements Action {
    readonly type = UPDATE_META;
    constructor(public payload: Meta) { }
}

export class UpdateHidden implements Action {
    readonly type = UPDATE_HIDDEN;
    constructor(public payload: {[key: string]: number}){}
}

export class IsLoading implements Action {
    readonly type = IS_LOADING;
    constructor(public payload: boolean){}
}

export class fetchError implements Action {
    readonly type = FETCH_ERROR;
    constructor(public payload?){}
}

export class clearFetchError implements Action {
    readonly type = CLEAR_FETCH_ERROR;
    constructor(public payload?) { }
}

export class TrackFilters implements Action {
    readonly type = TRACK_FILTERS;
    constructor(public payload: {[key: string]: string}){}
}

export class UpdateStatusFilter implements Action {
    readonly type = UPDATE_STATUS_FILTER;
    constructor(public payload: { [key: string]: string }){}
}

export class FilterPurchaseOrders implements Action {
    readonly type = FILTER_PURCHASE_ORDERS;
    constructor(public payload: FetchRequest){}
}

export class setInitialPurchaseOrders implements Action {
    readonly type = SET_INITIAL_PURCHASE_ORDERS;
    constructor(public payload: State){}
}


export class fetchPurchaseOrders implements Action {
    readonly type = FETCH_PURCHASE_ORDERS;
}

export class ReceiveSelectedPurchaseOrder implements Action {
    readonly type = RECEIVE_SELECTED_PURCHASE_ORDER;
    constructor(public payload: PurchaseOrder){}
}


export class ChangeVendor implements Action {
    readonly type = CHANGE_VENDOR;
    constructor(public payload: VendorChange) { }
}

export class UpdatePurchaseOrder implements Action {
    readonly type = UPDATE_PURCHASE_ORDER;
    constructor(public payload: UpdateInfo) { }
}

export class FetchSelectedPurchaseOrder implements Action {
    readonly type = FETCH_SELECTED_PURCHASE_ORDER;
    constructor(public payload: string) { }
}

export interface FetchRequest {
    filters: POFilters,
    currentPage: number,
    perPage: number
}

export interface VendorChange {
    id: string;
    vendorId: string;
    vendor: string;
}

export interface UpdateInfo {
    purchaseOrderId: string;
    data: {[key:string]: any }
}
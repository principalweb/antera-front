import { Action } from '@ngrx/store';
import { PurchaseNeed, CreatePurchaseOrderFromNeed } from '../interface/interface';
import { State, PNFilters, PNPFilters, SortEvent, PageEvent } from '../state/purchase-needs.state';
import { Meta } from '../state/purchase-orders.state';
import { productObject } from "../services/purchase-needs.service";
export const RECEIVE_PURCHASE_NEEDS = "[Purchase Needs] RECEIVE_PURCHASE_NEEDS";
export const TRACK_FILTERS = "[Purchase Needs] TRACK_FILTERS";
export const FILTER_PURCHASE_NEEDS = "[Purchase Needs] FILTER_PURCHASE_NEEDS";
export const IS_LOADING = "[Purchase Needs] IS_LOADING";
export const FETCH_ERROR = "[Purchase Needs] FETCH_ERROR";
export const CLEAR_FETCH_ERROR = "[Purchase Needs] CLEAR_FETCH_ERROR";
export const SELECT_MULTIPLE_NEEDS = "[Purchase Needs] SELECT_MULTIPLE_NEEDS";
export const SELECT_SINGLE_NEED = "[Purchase Needs] SELECT_SINGLE_NEED";
export const DESELECT_SINGLE_NEED = "[Purchase Needs] DESELECT_SINGLE_NEED";
export const DESELECT_MULTIPLE_NEEDS = "[Purchase Needs] DESELECT_MULTIPLE_NEEDS";
export const RECEIVE_PURCHASE_PRODUCT_NEEDS = "[Purchase Needs] RECEIVE_PURCHASE_PRODUCT_NEEDS";
export const FILTER_PURCHASE_PRODUCT_NEEDS = "[Purchase Needs] FILTER_PURCHASE_PRODUCT_NEEDS";
export const TRACK_PRODUCT_NEED_FILTERS = "[Purchase Needs] TRACK_PRODUCT_NEED_FILTERS";
export const DIALOG_IS_LOADING = "[Purchase Needs] DIALOG_IS_LOADING";
export const FETCH_PURCHASE_NEEDS_BY_PRODUCT_IDS = "[Purchase Needs] FETCH_PURCHASE_NEEDS_BY_PRODUCT_IDS";
export const ADD_MULTI_SELECT_ORDER_NUMBER_FILTER = "[Purchase Needs] ADD_MULTI_SELECT_ORDER_NUMBER_FILTER";
export const FETCH_PURCHASE_NEEDS_BY_PRODUCT_ID = "[Purchase Needs] FETCH_PURCHASE_NEEDS_BY_PRODUCT_ID";
export const DESELECT_PRODUCT_ID = "[Purchase Needs] DESELECT_PRODUCT_ID";
export const DESELECT_ALL_NEEDS_BY_PRODUCT = "[Purchase Needs] DESELECT_ALL_NEEDS_BY_PRODUCT";
export const PRODUCT_CHECKBOX = "[Purchase Needs] PRODUCT_CHECKBOX";
export const DETAIL_CHECKBOX = "[Purchase Needs] DETAIL_CHECKBOX";
export const EDIT_QUANTITY_ORDER = "[Purchase Needs] EDIT_QUANTITY_ORDER";
export const EDIT_COST = "[Purchase Needs] EDIT_COST";
export const SELECT_SINGLE_PRODUCT_LEVEL_NEED = "[Purchase Needs] SELECT_SINGLE_PRODUCT_LEVEL_NEED";
export const SELECT_MULTIPLE_PRODUCT_LEVEL_NEED = "[Purchase Needs] SELECT_MULTIPLE_PRODUCT_LEVEL_NEED";
export const DESELECT_SINGLE_PRODUCT_LEVEL_NEED = "[Purchase Needs] DESELECT_SINGLE_PRODUCT_LEVEL_NEED";
export const DESELECT_MULTIPLE_PRODUCT_LEVEL_NEED = "[Purchase Needs] DESELECT_MULTIPLE_PRODUCT_LEVEL_NEED";
export const All_DETAIL_CHEXBOXES_FALSE = "[Purchase Needs] All_DETAIL_CHEXBOXES_FALSE";
export const CALCULATE_PRICE_BREAK = "[Purchase Needs] CALCULATE_PRICE_BREAK";
export const REFRESH_LIST = "[Purchase Needs] REFRESH_LIST";
export const NEW_PRICE = "[Purchase Needs] NEW_PRICE";
export const CLEANSE_FORM = "[Purchase Needs] CLEANSE_FORM";
export const IS_DIFFERENT_QUANTITY = "[Purchase Needs] IS_DIFFERENT_QUANTITY";
export const GENERATE_PURCHASE_ORDER = "[Purchase Needs] GENERATE_PURCHASE_ORDER";
export const PURCHASE_ORDER_GENERATED_CONFIRMATION = "[Purchase Needs] PURCHASE_ORDER_GENERATED_CONFIRMATION";
export const SET_INIT_STATE = "[Purchase Needs] SET_INIT_STATE";
export const REMOVE_MULTI_SELECT_ORDER_NUMBER_FILTER = "[Purchase Needs] REMOVE_MULTI_SELECT_ORDER_NUMBER_FILTER";
export const ADD_SINGLE_ORDER_NUMBER_FILTER = "[Purchase Needs] ADD_SINGLE_ORDER_NUMBER_FILTER";
export const GET_PRODUCT_TOTAL = "[Purchase Needs] GET_PRODUCT_TOTAL";
export const RECEIVE_TOTAL_SUM = "[Purchase Needs] RECEIVE_TOTAL_SUM";
export const NEED_SUM = "[Purchase Needs] NEED_SUM";
export const SELECTION_CHANGED = "[Purchase Needs] SELECTION_CHANGED";
export const SELECT_FROM_FILTERED = "[Purchase Needs] SELECT_FROM_FILTERED";
export const DESELECT_SPECIFIC_NEEDS = "[Purchase Needs] DESELECT_SPECIFIC_NEEDS";
export const SUMMARY_SORT_EVENT = "[Purchase Needs] SUMMARY_SORT_EVENT";
export const PRODUCT_PAGE_EVENT = "[Purchase Needs] PRODUCT_PAGE_EVENT";
export const SUMMARY_PAGE_EVENT = "[Purchase Needs] SUMMARY_PAGE_EVENT";
export const DETAIL_PAGE_EVENT = "[Purchase Needs] DETAIL_PAGE_EVENT";
export const DETAIL_SORT_EVENT = "[Purchase Needs] DETAIL_SORT_EVENT";
export const SHOW_INVENTORY = "[Purchase Needs] SHOW_INVENTORY";
export const RECEIVE_PURCHASE_NEEDS_AND_SELECTED_NEEDS = "[Purchase Needs] RECEIVE_PURCHASE_NEEDS_AND_SELECTED_NEEDS";
export const UPDATE_SUMMARY_NEED_COUNT = "[Purchase Needs] UPDATE_SUMMARY_NEED_COUNT";
export type PurchaseNeedsActions =
  | ReceivePurchaseNeeds
  | TrackFilters
  | IsLoading
  | FilterPurchaseNeeds
  | fetchError
  | clearFetchError
  | DeselectMultipleNeeds
  | SelectMultipleNeeds
  | SelectSingleNeed
  | ReceivePurchaseProductNeeds
  | FilterPurchaseProductNeeds
  | TrackProductFilters
  | AddMultiSelectOrderNumberFilter
  | DeselectProductId
  | DeselectAllProductNeedsByProduct
  | DeselectSpecificNeeds
  | ProductCheckbox
  | DetailCheckbox
  | SelectMultipleProductLevelNeed
  | SelectSingleProductLevelNeed
  | DeselectSingleProductLevelNeed
  | DeselectMultipleProductLevelNeed
  | EditQuantityOrder
  | AllDetailChexboxesFalse
  | CalculatePriceBreak
  | PurchaseOrderGeneratedConfirmation
  | NewPrice
  | SelectFromFiltered
  | SelectionChanged
  | IsDifferentQuantity
  | CleanseForm
  | RefreshList
  | ReceivePurchaseNeedsAndSelectedNeeds
  | DialogIsLoading
  | RemoveMultiSelectOrderNumberFilter
  | SetInitState
  | GetProductTotal
  | SummarySortEvent
  | ReceiveTotalSum 
  | ProductPageEvent
  | DetailPageEvent
  | SummaryPageEvent
  | DetailSortEvent
  | AddSingleOrderNumberFilter
  | ShowInventory
  | EditCost
  | UpdateSummaryNeedCount
  | DeselectSingleNeed;

export class ReceivePurchaseNeeds implements Action {
    readonly type = RECEIVE_PURCHASE_NEEDS;
    constructor(public payload: PurchaseNeed[]){}
}

export class ReceivePurchaseProductNeeds implements Action {
    readonly type = RECEIVE_PURCHASE_PRODUCT_NEEDS;
    constructor(public payload: PurchaseNeed[]) { }
}

export class CleanseForm implements Action {
    readonly type = CLEANSE_FORM;
    constructor(public payload?) { }
}

export class CalculatePriceBreak implements Action {
    readonly type = CALCULATE_PRICE_BREAK;
    constructor(public payload: PriceBreak) { }
}

export class IsDifferentQuantity implements Action {
    readonly type = IS_DIFFERENT_QUANTITY;
    constructor(public payload: boolean){}
}

export class AllDetailChexboxesFalse implements Action {
    readonly type = All_DETAIL_CHEXBOXES_FALSE;
    constructor(public payload?){}
}

export class RefreshList implements Action {
    readonly type = REFRESH_LIST;
    constructor(public payload?) { }
}

export class SelectFromFiltered implements Action {
    readonly type = SELECT_FROM_FILTERED;
    constructor(public payload?) { }
}

export class ReceivePurchaseNeedsAndSelectedNeeds implements Action {
    readonly type = RECEIVE_PURCHASE_NEEDS_AND_SELECTED_NEEDS;
    constructor(public payload: PurchaseNeed[], public checkboxes: any) { }
}

export class UpdateSummaryNeedCount implements Action {
    readonly type = UPDATE_SUMMARY_NEED_COUNT;
    constructor(public payload: number) { }
}


export class EditQuantityOrder implements Action {
    readonly type = EDIT_QUANTITY_ORDER;
    constructor(public payload: {[key: number]: IEditQuantity}){}
}

export class EditCost implements Action {
  readonly type = EDIT_COST;
  constructor(public payload: { [key: number]: string }, public purchaseNeed: PurchaseNeed) {}
}

export class ProductCheckbox implements Action {
    readonly type = PRODUCT_CHECKBOX;
    constructor(public payload: { [key: number]: boolean }) { }
}

export class DetailCheckbox implements Action {
    readonly type = DETAIL_CHECKBOX;
    constructor(public payload: { [key: number]: boolean }) { }
}

export class GetProductTotal implements Action {
    readonly type = GET_PRODUCT_TOTAL;
    constructor(public payload: number[], public inventory: string) { }
}

export class ReceiveTotalSum implements Action {
    readonly type = RECEIVE_TOTAL_SUM;
    constructor(public payload: string) { }
}

export class GetNeedSum implements Action {
    readonly type = NEED_SUM;
    constructor(public payload: number[]) { }
}

export class TrackFilters implements Action {
    readonly type = TRACK_FILTERS;
    constructor(public payload: { [key: string]: string }) { }
}

export class AddMultiSelectOrderNumberFilter implements Action {
    readonly type = ADD_MULTI_SELECT_ORDER_NUMBER_FILTER;
    constructor(public payload: string[]) { }
}

export class AddSingleOrderNumberFilter implements Action {
  readonly type = ADD_SINGLE_ORDER_NUMBER_FILTER;
  constructor(public payload: string) {}
}

export class RemoveMultiSelectOrderNumberFilter implements Action {
  readonly type = REMOVE_MULTI_SELECT_ORDER_NUMBER_FILTER;
  constructor(public payload: string) {}
}

export class NewPrice implements Action {
    readonly type = NEW_PRICE;
    constructor(public payload: PurchaseNeed[]) { }
}

export class TrackProductFilters implements Action {
    readonly type = TRACK_PRODUCT_NEED_FILTERS;
    constructor(public payload: { [key: string]: string }) { }
}

export class fetchError implements Action {
    readonly type = FETCH_ERROR;
    constructor(public payload?) { }
}

export class FetchPurchaseNeedsByProductIds implements Action {
    readonly type = FETCH_PURCHASE_NEEDS_BY_PRODUCT_IDS;
    constructor(public payload:FetchPurchaseByProductsIds){}
}

export class DeselectProductId implements Action {
    readonly type = DESELECT_PRODUCT_ID;
    constructor(public payload: number){}
}

export class DeselectAllProductNeedsByProduct implements Action {
    readonly type = DESELECT_ALL_NEEDS_BY_PRODUCT;
    constructor(public payload: number){}
}



export class FetchPurchaseNeedsByProductId implements Action {
    readonly type = FETCH_PURCHASE_NEEDS_BY_PRODUCT_ID;
    constructor(public payload: FetchPurchaseByProductsId) {}
}

export class SelectMultipleNeeds implements Action {
    readonly type = SELECT_MULTIPLE_NEEDS;
    constructor(public payload: PurchaseNeed[]){}
}


export class DeselectMultipleNeeds implements Action {
    readonly type = DESELECT_MULTIPLE_NEEDS;
    constructor(public payload?) { }
}

export class SelectSingleNeed implements Action {
    readonly type = SELECT_SINGLE_NEED;
    constructor(public payload: PurchaseNeed) { }
}

export class ShowInventory implements Action {
    readonly type = SHOW_INVENTORY;
    constructor(public payload: boolean) { }
}

export class SelectSingleProductLevelNeed implements Action {
    readonly type = SELECT_SINGLE_PRODUCT_LEVEL_NEED;
    constructor(public payload: PurchaseNeed) { }
}

export class SelectMultipleProductLevelNeed implements Action {
    readonly type = SELECT_MULTIPLE_PRODUCT_LEVEL_NEED;
    constructor(public payload: PurchaseNeed[]) { }
}

export class DeselectMultipleProductLevelNeed implements Action {
    readonly type = DESELECT_MULTIPLE_PRODUCT_LEVEL_NEED;
    constructor(public payload: PurchaseNeed[]) { }
}

export class DeselectSingleProductLevelNeed implements Action {
    readonly type = DESELECT_SINGLE_PRODUCT_LEVEL_NEED;
    constructor(public payload: PurchaseNeed) { }
}


export class DeselectSingleNeed implements Action {
    readonly type = DESELECT_SINGLE_NEED;
    constructor(public payload: number) { }
}


export class IsLoading implements Action {
    readonly type = IS_LOADING;
    constructor(public payload: boolean) {}
}

export class DialogIsLoading implements Action {
    readonly type = DIALOG_IS_LOADING;
    constructor(public payload: boolean) {}
}

export class FilterPurchaseNeeds implements Action {
    readonly type = FILTER_PURCHASE_NEEDS;
    constructor(public payload: FetchRequest) { }
}

export class SelectionChanged implements Action {
    readonly type = SELECTION_CHANGED;
    constructor(public payload: boolean) { }
}

export class FilterPurchaseProductNeeds implements Action {
    readonly type = FILTER_PURCHASE_PRODUCT_NEEDS;
    constructor(public payload: ProductFetchRequest) { }
}

export class GeneratePurchaseOrder implements Action {
    readonly type = GENERATE_PURCHASE_ORDER;
    constructor(public payload: CreatePurchaseOrderFromNeed[]) { }
}

export class SetInitState implements Action {
  readonly type = SET_INIT_STATE;
  constructor(public payload?) {}
}

export class PurchaseOrderGeneratedConfirmation implements Action {
         readonly type = PURCHASE_ORDER_GENERATED_CONFIRMATION;
         constructor(public payload: boolean) {}
       }

export interface NeedsAndCount {
    purchaseNeeds: PurchaseNeed[],
   count: number
}

export class clearFetchError implements Action {
    readonly type = CLEAR_FETCH_ERROR;
    constructor(public payload?) { }
}

export class DeselectSpecificNeeds implements Action {
    readonly type = DESELECT_SPECIFIC_NEEDS;
    constructor(public payload: number[]) { }
}

export class SummarySortEvent implements Action {
    readonly type = SUMMARY_SORT_EVENT;
    constructor(public payload: SortEvent) { }
}

export class DetailSortEvent implements Action {
    readonly type = DETAIL_SORT_EVENT;
    constructor(public payload: SortEvent) { }
}

export class ProductPageEvent implements Action {
    readonly type = PRODUCT_PAGE_EVENT;
    constructor(public payload: PageEvent) { }
}

export class DetailPageEvent implements Action {
    readonly type = DETAIL_PAGE_EVENT;
    constructor(public payload: PageEvent) { }
}

export class SummaryPageEvent implements Action {
    readonly type = SUMMARY_PAGE_EVENT;
    constructor(public payload: PageEvent) { }
}

export interface FetchRequest {
    filters: PNPFilters,
    productIds: number[],
    sort?: SortEvent
}


export interface ProductFetchRequest {
    filters: PNPFilters
}

export interface FetchPurchaseByProductsIds{
    productIds: number[],
    filters: PNPFilters,
    sort?: SortEvent
}

export interface FetchPurchaseByProductsId {
    productId: number,
    pageIndex: number,
    pageSize: number,
    filters: PNPFilters
}

export interface IEditQuantity {
    productId: number;
    purchaseNeed: PurchaseNeed;
    sku: string;
    quantity?: string;
    dirty: boolean;
    purchaseNeedId: number;
    type: string;
}


export interface IAllSelected {
    productObjects: productObject[];
    all: boolean;
}

export interface PriceBreak {
    variation: PurchaseNeed[];
    decoration: PurchaseNeed[];
}

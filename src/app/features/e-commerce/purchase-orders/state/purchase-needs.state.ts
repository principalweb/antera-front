import { PurchaseNeed } from '../interface/interface';
import { Meta } from './purchase-orders.state';
import { IEditQuantity } from "../store/purchase-needs.actions";
export interface State {
    purchaseNeedsList: PurchaseNeed[];
    loading: boolean;
    filters: PNFilters;
    //meta: Meta | null;
    fetchError: boolean;
    selectedNeeds: PurchaseNeed[];
    selectedProductLevelNeeds: PurchaseNeed[];
    totalCountProducts: number;
    purchaseNeedsProductList: PurchaseNeed[],
    productListFilters: PNPFilters,
    productCheckBoxes: { [key: number]: boolean },
    detailCheckBoxes: { [key: number]: boolean },
    quantityOrdered: {[key: number]: IEditQuantity},
    orderCost: { [key: number]: string },
    refresh: number;
    cleanse: number;
    differentQuantity: boolean;
    dialogLoading: boolean;
    purchaseOrdersGenerated: boolean;
    totalSum: string;
    summaryNeeds: {[key: string]: SummaryNeed};
    selectionChanged: boolean;
    sortSummaryTable: SortEvent;
    sortDetailTable: SortEvent;
    productPage: PageEvent;
    summaryPage: PageEvent;
    detailPage: PageEvent;
    showInventory: boolean;
    summaryCount: number;
    detailCount: number;
    orderCostError : boolean;
    //secondMeta: Meta | null
}

export interface PNFilters {
    name: string;
    vendor: string;
    description: string;
    customer: string;
}

export interface PNPFilters {
    customer: string;
    refSalesOrderNo: string[];
    vendor: string;
    name: string;
    description: string;
    supplierProductId: string;
    inhouseId: string;
    color: string;
    size: string;
    inventory: string;
}

export interface SummaryNeed {
    sku: string;
    combinedQuantityNeeded: number;
    combinedQuantityOrdered: number;
    purchaseNeeds: PurchaseNeed[];
    attribute: string;
    name: string;
    item: string;
    actualCost: string;
    customer: string[];
    vendor: string[];
    color: string;
    size: string;
    rank: number;
    //multipleCosts: boolean;
    refSalesOrderNo: string[];
}

export interface SortEvent {
    active: string;
    direction: string;
}

export interface PageEvent {
    length: number;
    pageIndex: number;
    pageSize: number;
    previousPageIndex: number;
}


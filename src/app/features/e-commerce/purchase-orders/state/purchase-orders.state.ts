import { PurchaseOrder } from "../interface/interface";
export interface State {
    purchaseOrderList: PurchaseOrder[];
    selectedPurchaseOrder: PurchaseOrder | null;
    loading: boolean;
    filters: POFilters;
    fetchError: boolean;
    meta: Meta | null;
}

export interface POFilters {
    label: string; 
    number: string;
    vendor: string;
    //status: string[];
    status: string;
    hidden: string;
}

export interface Meta {
    totalCount: number,
    pageCount: number,
    currentPage: number,
    perPage: number
}

export function isPOFilter(arg: any): arg is POFilters {
    return true;
}

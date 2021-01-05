import { IInvoice, ILineItem } from '../interface/interface';

export interface State {
    pendingInvoicesList: IInvoice[];
    loading: boolean;
    lineItemFilters: LineItemFilters;
    invoiceFilters: InvoiceFilters;
    lineItems: ILineItem[];
    fetchError: boolean;
    selectedInvoices: { [key: string]: IInvoice };
    selectedLineItems: { [key: string]: ILineItem };
    invoiceCheckboxes: { [key: number]: boolean };
    lineItemCheckboxes: { [key: number]: boolean };
    showBooked: boolean;
    totalPendingInvoiceCount: number;
    totalLineItemCount: number;
    pendingSelectAll: boolean;
    lineItemSelectAll: boolean;
    deselectedInvoices: {[key: string]: IInvoice};
    //deselectedLineItems: { [key: string]: ILineItem };
    lineItemPage: PageEvent;
    invoiceSelectionChanged: boolean;
    summaryInvoices: IInvoice[];
    quantityInvoiced: {[key: string]: string};
    unitPrice: {[key:string]: string};
    completed: boolean;
    quantityInvoicedError: boolean;
    unitPriceError: boolean;
}

export interface LineItemFilters {
    customer: string;
    invoiceNo: string;
}

export interface InvoiceFilters {
    label: string;
    status: string;
    customer: string;
    number: string;
}

export interface LineItem {
    id: string;
    arInvoiceId: string;
    parentId: string;
    type: string;
    orderedQuantity: number;
    invoiceQuantity: number;
    backOrderedQuantity: number;
    uom: string;
    description: string;
    unitPrice: number;
    extendedPrice: number;
    tax: boolean;
    taxType: string;
    lineGroup: string;
    refSalesOrderId: string;
    refSalesOrderLineItemId: string;
    imageId: number;
    imageUrl: string;
    itemRef: string;
    status: string;
    matchOrderQty: boolean;
}

export interface PageEvent {
    length: number;
    pageIndex: number;
    pageSize: number;
    previousPageIndex: number;
}
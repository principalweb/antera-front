import { BaseModel } from './base-model';
import { PurchaseOrderContactInformation } from './purchase-order-contactInformation';
import { LineItem } from "./line-item";
export class PurchaseOrderFromServer extends BaseModel {
    id: string;
    currency: string;
    label: string;
    modified: string;
    number: string;
    adjustedTotalAmount: string;
    advancePaymentAmount: string;
    created: string;
    fob: string;
    salesAmount: string;
    shippingAmount: string;
    source: string;
    sourceRequest: string;
    status: string;
    tax: number;
    taxType: string;
    terms: string;
    totalAmount: string;
    hidden: number;
    vendor: string;
    type: string;
    vendorId: string;
    contactInformation: PurchaseOrderContactInformation[];
    lineItems: LineItem[];
}
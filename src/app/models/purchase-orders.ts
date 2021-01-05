import { BaseModel } from './base-model';
import { LineItem } from "./line-item";
import { PurchaseOrderContactInformation } from "./purchase-order-contactInformation";
import { PurchaseOrderTaxInformation } from "./purchase-order-tax-information";
import { ShipInfo } from './shipinfo';
export class PurchaseOrder extends BaseModel {
    id: string;
    currency: string;
    label: string;
    modified: string;
    number: string;
    adjustedTotalAmount: number;
    advancePaymentAmount: number;
    created: Date;
    fob: string;
    salesAmount: number;
    shippingAmount: number;
    source: string;
    sourceRequest: string;
    status: string;
    tax: number;
    taxType: string;
    terms: string;
    totalAmount: number;
    type: string;
    vendorId: string;
    vendor: string;
    hidden: number;
    lineItems: LineItem[];
    contactInformation: PurchaseOrderContactInformation[];
    taxInformation: PurchaseOrderTaxInformation;
    inhandDate: Date;
    vendorTerms: string;
    vendorNotes: string;
    poNotes: string;
    vendorInfo: string;
    
    setData(po){
        if (po.lineItems) this.setEmptyArray("lineItems");
        if (po.contactInformation) this.setEmptyArray("contactInformation");
        this.setString(po, "id");
        this.setString(po, "currency");
        this.setString(po, "label");
        this.setString(po, "modified");
        this.setString(po, "number");
        this.setString(po, "poNotes");
        this.setFloat(po, "adjustedTotalAmount");
        this.setFloat(po, "advancePaymentAmount");
        this.setDate(po, "created");
        this.setDate(po, "inhandDate");
        this.setString(po, "fob");
        this.setString(po, "vendor");
        this.setFloat(po, "hidden");
        this.setFloat(po, "salesAmount");
        this.setFloat(po, "shippingAmount");
        this.setString(po, "source");
        this.setString(po, "sourceRequest");
        this.setString(po, "status");
        this.setFloat(po, "tax");
        this.setString(po, "taxType");
        this.setString(po, "terms");
        this.setFloat(po, "totalAmount");
        this.setString(po, "type");
        this.setString(po, "vendorId");
        this.setString(po, "vendorTerms");
        this.setString(po, "vendorNotes");
        this.setObject(po, "taxInformation", PurchaseOrderTaxInformation);
        this.setString(po, "vendorInfo");
        if (po.lineItems) po.lineItems.forEach(lineItem => 
            this["lineItems"].push(new LineItem(lineItem))
        );
        if (po.contactInformation) po.contactInformation.forEach(contactInfo => this.contactInformation.push(new PurchaseOrderContactInformation(contactInfo)));
    }

    
}
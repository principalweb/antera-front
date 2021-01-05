import { BaseModel } from '../base-model';
import { Allocation } from './allocation';
import { LineItem } from './line-item';
import { SalesOrder } from './sales-order';
import { AccountInfo } from './account-info';

export class Invoice extends BaseModel
{
    id: string;
    number: string;
    label: string;
    type: string;
    customerId: string;
    customer: string;
    invoiceDate: string;
    created: string;
    needStatus: string;
    terms: string;
    currency: string;
    fob: string;
    salesAmount: number;
    shippingAmount: number;
    taxAmount: number;
    totalAmount: number;
    advancePaymentAmount: number;
    invoiceAmount: number;
    balance: number;
    status: string;
    source: string;
    modified: string;
    allocations: Allocation[];
    lineItems: LineItem[];
    salesOrders: SalesOrder[];
    billTo: AccountInfo;
    shipTo: AccountInfo;

    setData(invoice) {
        this.setString(invoice, 'id');
        this.setString(invoice, 'number');
        this.setString(invoice, 'label');
        this.setString(invoice, 'type');
        this.setString(invoice, 'customer');
        this.setDate(invoice, "created");
        this.setString(invoice, 'customerId');
        this.setString(invoice, 'invoiceDate');
        this.setString(invoice, 'terms');
        this.setString(invoice, 'currency');
        this.setString(invoice, 'fob');
        this.setFloat(invoice, 'salesAmount');
        this.setFloat(invoice, 'shippingAmount');
        this.setFloat(invoice, 'taxAmount');
        this.setFloat(invoice, 'totalAmount');
        this.setFloat(invoice, 'advancePaymentAmount');
        this.setFloat(invoice, 'invoiceAmount');
        this.setFloat(invoice, 'balance');
        this.setString(invoice, 'status');
        this.setString(invoice, 'source');
        this.setString(invoice, 'modified');
        this.setString(invoice, "needStatus");
        this.setObjectArray(invoice.allocations || [], 'allocations', Allocation);
        this.setObjectArray(invoice.lineItems || [], 'lineItems', LineItem);
        this.setObjectArray(invoice.salesOrders|| [], 'salesOrders', SalesOrder);
        this.setObject(invoice.billTo, 'billTo', AccountInfo);
        this.setObject(invoice.shipTo, 'shipTo', AccountInfo);
    }
}

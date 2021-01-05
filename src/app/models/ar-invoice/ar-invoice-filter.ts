import { BaseModel } from '../base-model';
import { SalesOrder} from './sales-order';

export class ArInvoiceFilter extends BaseModel {
    number: number;
    label: string;
    type: string;
    customerId: string;
    invoiceDate: string;
    created: string;
    terms: string;
    currency: string;
    fob: string;
    salesAMount: number;
    shippingAmount: number;
    taxAmount: number;
    totalAmount: number;
    advancePaymentAmount: number;
    invoiceAmount: number;
    balance: number;
    status: string;
    source: string;
    modified: string;
    salesOrders: SalesOrder[];

    setData(filter) {
        this.setFloat(filter, 'number');
        this.setString(filter, 'label');
        this.setString(filter, 'type');
        this.setString(filter, 'customerId');
        this.setString(filter, 'invoiceDate');
        this.setString(filter, 'created');
        this.setString(filter, 'terms');
        this.setString(filter, 'currency');
        this.setString(filter, 'fob');
        this.setFloat(filter, 'salesAmount');
        this.setFloat(filter, 'shippingAmount');
        this.setFloat(filter, 'taxAmount');
        this.setFloat(filter, 'totalAmount');
        this.setFloat(filter, 'advancePaymentAmount');
        this.setFloat(filter, 'invoiceAmount');
        this.setFloat(filter, 'balance');
        this.setString(filter, 'status');
        this.setString(filter, 'source');
        this.setString(filter, 'modified');
        this.setObjectArray(filter || [], 'salesOrders', SalesOrder);
    }
}

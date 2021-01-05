import { BaseModel } from './base-model';

export class CreditInfo extends BaseModel {
    id: string;
    accountId: string;
    orderId: string;
    paymentId: string;
    order: string;
    account: string;
    reason: string;
    precredit: string;
    procredit: string;
    reasonId: string;
    notes: string;
    creditAmount: number;
    paymentAmount: number;
    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'accountId');
        this.setString(data, 'orderId');
        this.setString(data, 'paymentId');
        this.setString(data, 'order');
        this.setString(data, 'account');
        this.setString(data, 'reason');
        this.setString(data, 'precredit');
        this.setString(data, 'procredit');
        this.setString(data, 'reasonId');
        this.setString(data, 'notes');
        this.setFloat(data, 'creditAmount');
        this.setFloat(data, 'paymentAmount');
    }

}

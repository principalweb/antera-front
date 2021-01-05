import { BaseModel } from '../base-model';

export class Allocation extends BaseModel
{
    id: string;
    paymentId: string;
    invoiceId: string;
    type: string;
    amount: number;
    info: string;
    userId: string;
    targetAllocationId: string;

    setData(allocation) {
        this.setString(allocation, 'id');
        this.setString(allocation, 'paymentId');
        this.setString(allocation, 'invoiceId');
        this.setString(allocation, 'type');
        this.setFloat(allocation, 'amount');
        this.setString(allocation, 'info');
        this.setString(allocation, 'userId');
        this.setString(allocation, 'targetAllocationId');
    }
}
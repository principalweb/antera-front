import { BaseModel } from '../base-model';

export class SalesOrder extends BaseModel
{
    salesOrderNumber: string; //wheee
    setData(data) {
        this.setString(data, 'salesOrderNumber');
    }
}
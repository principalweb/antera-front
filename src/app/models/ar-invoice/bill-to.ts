import { BaseModel } from '../base-model';

export class BillTo extends BaseModel {
    name: string;
    number: number;
    accountId: string;
    addressLines: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;

    setData(billTo) {
        this.setString(billTo, 'name');
        this.setFloat(billTo, 'number');
        this.setString(billTo, 'accountId');
        this.setArray(billTo, 'addressLines');
        this.setString(billTo, 'city');
        this.setString(billTo, 'state');
        this.setString(billTo, 'postalCode');
        this.setString(billTo, 'country');
    }
}
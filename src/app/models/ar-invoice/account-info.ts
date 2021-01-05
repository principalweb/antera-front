import { BaseModel } from '../base-model';

export class AccountInfo extends BaseModel
{
    name: string;
    number: string;
    accountId: string;
    addressLines: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;

    setData(data) {
        this.setString(data, 'name');
        this.setString(data, 'number');
        this.setString(data, 'accountId');
        this.setArray(data, 'addressLines');
        this.setString(data, 'city');
        this.setString(data, 'state');
        this.setString(data, 'postalCode');
        this.setString(data, 'country');
    }
}
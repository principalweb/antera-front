import { BaseModel } from '../base-model';

export class ShipTo extends BaseModel {
    name: string;
    number: number;
    accountId: string;
    addressLines: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;

    setData(shipTo) {
        this.setString(shipTo, 'name');
        this.setFloat(shipTo, 'number');
        this.setString(shipTo, 'accountId');
        this.setArray(shipTo, 'addressLines');
        this.setString(shipTo, 'city');
        this.setString(shipTo, 'state');
        this.setString(shipTo, 'postalCode');
        this.setString(shipTo, 'country');
    }
}
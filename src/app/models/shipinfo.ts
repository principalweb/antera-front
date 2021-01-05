import { BaseModel } from './base-model';
export class ShipInfo extends BaseModel {
    id: string;
    purchaseOrderId: string;
    type: string;
    name: string;
    number: string;
    accountId: string;
    accountName: string;
    addressLines: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
    region: string;
    phone: string;
    email: string;
    serviceEndpoint: string;
    transportMethod: string;
    comments: string;

    setData(si){
        this.setString(si, "id");
        this.setString(si, "purchaseOrderId");
        this.setString(si, "type");
        this.setString(si, "name");
        this.setString(si, "number");
        this.setString(si, "accountId");
        this.setString(si, "accountName");
        this.setArray(si, "addressLines");
        this.setString(si, "city");
        this.setString(si, "state");
        this.setString(si, "postalCode");
        this.setString(si, "country");
        this.setString(si, "region");
        this.setString(si, "phone");
        this.setString(si, "email");
        this.setString(si, "serviceEndpoint");
        this.setString(si, "transportMethod");
        this.setString(si, "comments");
    }
}
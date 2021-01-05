import { BaseModel } from "./base-model";
export class PurchaseOrderContactInformation extends BaseModel {
    type: string;
    name: string;
    number: string;
    accountId: string;
    accountName: string;
    addressLines: Array<string>;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    serviceEndpoint: string;
    transportMethod: string;
    comments: string;
    region: string;

    setData(poc){
        this.setString(poc, "type");
        this.setString(poc, "name");
        this.setString(poc, "number");
        this.setString(poc, "accountId");
        this.setString(poc, "accountName");
        this.setString(poc, "addressLines");
        this.setString(poc, "city");
        this.setString(poc, "state");
        this.setString(poc, "postalCode");
        this.setString(poc, "country");
        this.setString(poc, "phone");
        this.setString(poc, "email");
        this.setString(poc, "serviceEndpoint");
        this.setString(poc, "transportMethod");
        this.setString(poc, "comments");
        this.setString(poc, "region");
    }
}
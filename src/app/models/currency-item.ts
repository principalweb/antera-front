import { BaseModel } from './base-model';

export class CurrencyItem extends BaseModel {
    id: string;
    currency: string;
    symbol: string;
    code: string;
    dateCreated: Date;
    dateModified: Date;
    createdById: string;
    createdByName: string;
    modifiedById: string;
    modifiedByName: string;

    setData(ci){
        this.setString(ci, "id");
        this.setString(ci, "currency");
        this.setString(ci, "symbol");
        this.setString(ci, "code");
        this.setDate(ci, "dateCreated");
        this.setDate(ci, "dateModified");
        this.setString(ci, "createdById");
        this.setString(ci, "createdByName");
        this.setString(ci, "modifiedById");
        this.setString(ci, "modifiedByName");
    }
}
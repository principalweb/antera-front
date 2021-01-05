import { BaseModel } from './base-model';

export class DecorationType extends BaseModel {
    id: string;
    dateCreated: Date;
    dateModified: Date;
    name: string;
    code: string;
    detailName: string;
    sku: string;
    active: boolean;
    incomeAccount: string;
    assetAccount: string;
    expenseAccount: string;
    decorationGroup: string;
    createdByName: string;
    createdById: string;
    modifiedByName: string;
    modifiedById: string;

    setData(data) {
        this.setString(data, 'id');
        this.setDate(data, 'dateCreated');
        this.setDate(data, 'dateModified');
        this.setString(data, 'name');
        this.setString(data, 'code');
        this.setString(data, 'detailName');
        this.setBoolean(data, 'active');
        this.setString(data, 'sku');
        this.setString(data, 'incomeAccount');
        this.setString(data, 'assetAccount');
        this.setString(data, 'expenseAccount');
        this.setString(data, 'decorationGroup');
        this.setString(data, 'createdByName');
        this.setString(data, 'createdById');
        this.setString(data, 'modifiedByName');
        this.setString(data, 'modifiedById');
    }
}

export class DecorationTypeDetails extends BaseModel {
    id: string;
    dateCreated: Date;
    dateModified: Date;
    name: string;
    code: string;
    detailName: string;
    sku: string;
    active: boolean;
    incomeAccount: string;
    assetAccount: string;
    expenseAccount: string;
    decorationGroup: string;
    createdByName: string;
    createdById: string;
    modifiedByName: string;
    modifiedById: string;
    productionHour: Number;
    detailOptions: string[];

    setData(data) {
        this.setString(data, 'id');
        this.setDate(data, 'dateCreated');
        this.setDate(data, 'dateModified');
        this.setString(data, 'name');
        this.setString(data, 'code');
        this.setString(data, 'detailName');
        this.setBoolean(data, 'active');
        this.setString(data, 'sku');
        this.setString(data, 'incomeAccount');
        this.setString(data, 'assetAccount');
        this.setString(data, 'expenseAccount');
        this.setString(data, 'decorationGroup');
        this.setString(data, 'createdByName');
        this.setString(data, 'createdById');
        this.setString(data, 'modifiedByName');
        this.setString(data, 'modifiedById');
        this.setInt(data, 'productionHour');
        this.setArray(data, 'detailOptions');
    }
}

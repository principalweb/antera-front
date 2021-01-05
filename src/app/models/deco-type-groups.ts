import { BaseModel } from './base-model';
import { TaxCategory } from './tax-category';

export class DecoTypeGroups extends BaseModel {
    id: string;
    dateEntered: Date;
    dateModified: Date;
    name: string;
    status: boolean;
    createdByName: string;
    createdById: string;
    modifiedByName: string;
    modifiedById: string;

    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'name');
        this.setDate(data, 'dateEntered');
        this.setDate(data, 'dateModified');        
        this.setBoolean(data, 'status');
        this.setString(data, 'createdByName');
        this.setString(data, 'createdById');
        this.setString(data, 'modifiedByName');
        this.setString(data, 'modifiedById');
    }
}

export class DecoTypeGroupsDetails extends BaseModel {
    id: string;
    dateEntered: Date;
    dateModified: Date;
    name: string;
    status: boolean;
    createdByName: string;
    createdById: string;
    modifiedByName: string;
    modifiedById: string;
    taxJarObj: TaxCategory;

    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'name');
        this.setDate(data, 'dateEntered');
        this.setDate(data, 'dateModified');
        this.setBoolean(data, 'status');
        this.setString(data, 'createdByName');
        this.setString(data, 'createdById');
        this.setString(data, 'modifiedByName');
        this.setString(data, 'modifiedById');
        this.setObject(data.taxJarObj, 'taxJarObj', TaxCategory);
    }
}
import { BaseModel } from './base-model';

export class ModuleField extends BaseModel {
    id: string;
    dateCreated: Date;
    dateModified: Date;
    fieldName: string;
    defaultLabelName: string;
    labelName: string;
    fieldType: string;
    optionName: string;
    isVisible: boolean;
    module: string;
    moduleSection: string;
    strictlyRequired: boolean;
    required: boolean;
    allowImport: boolean;
    createdByName: string;
    createdById: string;
    modifiedByName: string;
    modifiedById: boolean;

    setData(data) {
        this.setString(data, 'id');
        this.setDate(data, 'dateCreated');
        this.setDate(data, 'dateModified');
        this.setString(data, 'fieldName');
        this.setString(data, 'defaultLabelName');
        this.setString(data, 'labelName');
        this.setString(data, 'fieldType');
        this.setString(data, 'optionName');
        this.setBoolean(data, 'isVisible');
        this.setString(data, 'module');
        this.setString(data, 'moduleSection');
        this.setBoolean(data, 'strictlyRequired');
        this.setBoolean(data, 'required');
        this.setBoolean(data, 'allowImport');
        this.setString(data, 'createdByName');
        this.setString(data, 'createdById');
        this.setString(data, 'modifiedByName');
        this.setString(data, 'modifiedById');
    }
}
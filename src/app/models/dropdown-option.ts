import { BaseModel } from './base-model';

export class DropdownOption extends BaseModel
{
    id: string;
    description: string;
    label: string;
    value: string;
    orderSequence: number;
    isDefault: boolean;
    dateCreated: Date;
    dateModified: Date;
    createdById: string;
    createdByName: string;
    modifiedById: string;
    modifiedByName: string;
    readOnly: boolean;

    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'description');
        this.setString(data, 'label');
        this.setString(data, 'value');
        this.setInt(data, 'orderSequence');
        this.setBoolean(data, 'isDefault');
        this.setDate(data, 'dateCreated');
        this.setDate(data, 'dateModified');
        this.setString(data, 'createdById');
        this.setString(data, 'createdByName');
        this.setString(data, 'modifiedById');
        this.setString(data, 'modifiedByName');
        this.setBoolean(data, 'readOnly');
    }
}


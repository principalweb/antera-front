import { BaseModel } from './base-model';

export class PermissionEntityType extends BaseModel
{
    id: Number;
    name: string;
    allowView: Boolean;
    allowEdit: Boolean;
    allowDelete: Boolean;
    allowPermission: Boolean;
    enabled: Boolean;
    unrestricted: Boolean;
    options: any[];

    setData(entityType) {
        this.setInt(entityType, 'id');
        this.setString(entityType, 'name');
        this.setBoolean(entityType, 'allowView');
        this.setBoolean(entityType, 'allowEdit');
        this.setBoolean(entityType, 'allowDelete');
        this.setBoolean(entityType, 'allowPermission');
        this.setBoolean(entityType, 'enabled');
        this.setBoolean(entityType, 'unrestricted');
        this.setArray(entityType, 'options');
    }
}

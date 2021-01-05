import { BaseModel } from './base-model';

export class PermissionGroupList extends BaseModel
{
    id: Number;
    name; string;
    users: Number;
    entities: Number;

    setData(group) {
        this.setFloat(group, 'id');
        this.setString(group, 'name');
        this.setInt(group, 'users');
        this.setInt(group, 'entities');
        this.setBoolean(group, 'active');
    }
}

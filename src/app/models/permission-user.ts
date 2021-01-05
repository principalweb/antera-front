import { BaseModel } from './base-model';

export class PermissionUser extends BaseModel
{
    id: string;
    name: string;

    setData(user) {
        this.setString(user, 'id');
        this.setString(user, 'name');
    }
}

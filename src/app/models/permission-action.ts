import { BaseModel } from './base-model';

export class PermissionAction extends BaseModel
{
    id: Number;
    name: string;
    label: string;
    allowAction: boolean;

    setData(action) {
        this.setInt(action, 'id');
        this.setString(action, 'name');
        this.setString(action, 'label');
        this.setBoolean(action, 'allowAction');
    }
}

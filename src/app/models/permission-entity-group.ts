import { BaseModel } from './base-model';

export class PermissionEntityGroup extends BaseModel
{
    groupId: Number;
    groupName: string;

    setData(group) {
        this.setFloat(group, 'groupId');
        this.setString(group, 'groupName');
    }
}

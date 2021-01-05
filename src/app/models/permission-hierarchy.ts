import { BaseModel } from './base-model';

export class PermissionHierarchy extends BaseModel
{
    id: Number;
    groupId: Number;
    groupName: string;
    rel: string;

    setData(hierarchy) {
        this.setInt(hierarchy, 'id');
        this.setInt(hierarchy, 'groupId');
        this.setString(hierarchy, 'groupName');
        this.setString(hierarchy, 'rel');
    }
}

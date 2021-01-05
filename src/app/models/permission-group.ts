import { BaseModel } from './base-model';
import { PermissionEntityType } from './permission-entity-type';
import { PermissionUser } from './permission-user';
import { PermissionEntity } from './permission-entity';
import { PermissionAction } from './permission-action';
import { PermissionHierarchy } from './permission-hierarchy';

export class PermissionGroup extends BaseModel
{
    id: Number;
    name: string;
    users: PermissionUser[];
    entityTypes: PermissionEntityType[];
    entities: PermissionEntity[];
    actions: PermissionAction[];
    hierarchy: PermissionHierarchy[];
    status: boolean;
    unrelated: PermissionHierarchy[];

    setData(group) {
        this.setFloat(group, 'id');
        this.setString(group, 'name');
        this.setObjectArray(group.users || [], 'users', PermissionUser);
        this.setObjectArray(group.entityTypes || [], 'entityTypes', PermissionEntityType);
        this.setObjectArray(group.entities || [], 'entities', PermissionEntity);
        this.setObjectArray(group.actions || [], 'actions', PermissionAction);
        this.setObjectArray(group.hierarchy || [], 'hierarchy', PermissionHierarchy);
        this.setObjectArray(group.unrelated || [], 'unrelated', PermissionHierarchy);
        this.setBoolean(group, 'status');
    }

    setObjectArray(data, field, modelType) {
        this[field] = [];
        Object.entries(data).forEach(([key, value]) => {
            this[field].push(new modelType(value));
        });
    }
}

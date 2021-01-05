import { BaseModel } from './base-model';

export class PermissionEntity extends BaseModel
{
    id: string;
    name: string;
    typeId: Number;
    typeName: string;

    setData(entity) {
        this.setString(entity, 'id');
        this.setString(entity, 'name');
        this.setInt(entity, 'typeId');
        this.setString(entity, 'typeName');
    }
}


import { BaseModel } from './base-model';

export class EquipmentDecoType extends BaseModel
{
    id: number;
    name: string;

    setData(decoTypes) {
        this.setFloat(decoTypes, 'id');
        this.setString(decoTypes, 'name');
    }
}
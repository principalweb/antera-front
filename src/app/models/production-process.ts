import { BaseModel } from './base-model';

export class ProductionProcess extends BaseModel
{
    id: Number;
    name: string;
    decoTypeId: Number;
    decoTypeName: string;
    additionalTime: Number;

    setData(process) {
        this.setInt(process, 'id');
        this.setString(process, 'name');
        this.setInt(process, 'decoTypeId');
        this.setString(process, 'decoTypeName');
        this.setFloat(process, 'additionalTime');
    }
}

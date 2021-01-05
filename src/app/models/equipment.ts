import { BaseModel } from './base-model';
import { Production } from 'app/models/production';
import { EquipmentDecoType } from 'app/models/equipment-deco-type'; 

export class Equipment extends BaseModel
{
    id: Number;
    name: string;
    decoTypes: EquipmentDecoType[];
    heads: Number;
    prodHour: Number;
    spm: Number;
    capacity: Number;
    reservedHours: Number;
    jobs: Production[];

    setData(equipment) {
        this.setFloat(equipment, 'id');
        this.setString(equipment, 'name');
        this.setFloat(equipment, 'heads');
        this.setFloat(equipment, 'prodHour');
        this.setFloat(equipment, 'spm');
        this.setFloat(equipment, 'capacity');
        this.setFloat(equipment, 'reservedHours');
        this.setObjectArray(equipment.jobs || [], 'jobs', Production);
        this.setObjectArray(equipment.decoTypes || [], 'decoTypes', EquipmentDecoType);
    }
}
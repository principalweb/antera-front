import { BaseModel } from './base-model';

export class Uom extends BaseModel {
    id: string;
    name: string;
    description: string;
    type: string;
    conversionRatio: string;
    abbreviation: string;
    uomGroupId: string;
    status: boolean;
    isBase: string;
    
    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'name');
        this.setString(data, 'description');
        this.setString(data, 'type');
        this.setString(data, 'abbreviation');
        this.setString(data, 'conversionRatio');
        this.setString(data, 'uomGroupId');
        this.setBoolean(data, 'status');
        this.setString(data, 'isBase');
    }
}

export class UomDetails extends BaseModel {
    id: string;
    name: string;
    description: string;
    type: string;
    conversionRatio: string;
    abbreviation: string;
    uomGroupId: string;
    status: boolean;
    isBase: string;

    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'name');
        this.setString(data, 'description');
        this.setString(data, 'type');
        this.setString(data, 'abbreviation');
        this.setString(data, 'conversionRatio');
        this.setString(data, 'uomGroupId');        
        this.setBoolean(data, 'status');
        this.setString(data, 'isBase');
    }
}
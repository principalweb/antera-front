import { BaseModel } from './base-model';

export class UomGroups extends BaseModel {
    id: string;
    name: string;
    description: string;
    type: string;
    defaultPurchaseUnit: string;
    defaultSalesUnit: string;
    defaultShippingUnit: string;
    status: boolean;
    
    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'name');
        this.setString(data, 'description');
        this.setString(data, 'type');
        this.setString(data, 'defaultPurchaseUnit');
        this.setString(data, 'defaultSalesUnit');
        this.setString(data, 'defaultShippingUnit');
        this.setBoolean(data, 'status');
    }
}

export class UomGroupsDetails extends BaseModel {
    id: string;
    name: string;
    description: string;
    type: string;
    defaultPurchaseUnit: string;
    defaultSalesUnit: string;
    defaultShippingUnit: string;
    status: boolean;

    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'name');
        this.setString(data, 'description');
        this.setString(data, 'type');
        this.setString(data, 'defaultPurchaseUnit');
        this.setString(data, 'defaultSalesUnit');
        this.setString(data, 'defaultShippingUnit');        
        this.setBoolean(data, 'status');
    }
}
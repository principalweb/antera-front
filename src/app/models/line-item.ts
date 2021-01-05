import { BaseModel } from './base-model';
import { ShipInfo } from './shipinfo';
export class LineItem extends BaseModel {
    id: string;
    quantity: number;
    unitPrice: number;
    extendedPrice: number;
    uom: string;
    description: string;
    supplierProductId: string;
    supplierProductPartId: string | null;
    customerProductId: string;
    customerProductVariation: string | null;
    sequence1: number;
    parentId: string | null;
    lineGroup: string;
    refSalesOrderId: string;
    refSalesOrderLineItemId: string;
    type: string;
    status: string;
    config: {
        image: string;
    }
    shipInfo: ShipInfo;
    color: string;
    size: string;
    setData(li){
        this.setString(li, "id");
        this.setFloat(li, "quantity");
        this.setFloat(li, "unitPrice");
        this.setFloat(li, "extendedPrice");
        this.setString(li, "uom");
        this.setString(li, "description");
        this.setString(li, "supplierProductId");
        this.setString(li, "supplierProductPartId");
        this.setString(li, "customerProductId");
        this.setString(li, "customerProductVariation");
        this.setFloat(li, "sequence1");
        this.setString(li, "parentId");
        this.setString(li, "lineGroup");
        this.setString(li, "refSalesOrderId");
        this.setString(li, "refSalesOrderLineItemId");
        this.setString(li, "type");
        this.setString(li, "status");
        this.setObject(li.shipInfo, "shipInfo", ShipInfo);
        this.setObject(li.config, "config");
        this.setString(li, "color");
        this.setString(li, "size");
    }
    
}
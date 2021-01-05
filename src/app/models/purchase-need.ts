import { BaseModel } from './base-model';
export class PurchaseNeed extends BaseModel {
    id : number;                                                                                                                                                                                                                                                     
    productId : number;
    name : string;
    description: string;
    supplierProductId: string;
    sku : string;
    uom : number;
    quantityNeeded : number;
    quantityOrdered : number;
    estimatedUnitCost : number;
    actualUnitCost : number;
    type : string;
    vendorId : string;
    refLineItemId : string;
    refSalesOrderId : string;
    vendor: string;
    customer: string;
    customerId: string;
    countProduct: number;
    status: string; 
    parentId: number;
    refDesignId: string;
    refSalesOrderNo: string;
    inhouseId: string;
    dueDate: string;
    color: string;
    size: string;
    rank: number;

    
    setData(pn){
        this.setFloat(pn, "id");
        this.setFloat(pn, "productId");
        this.setFloat(pn, "parentId");
        this.setString(pn, "name");
        this.setString(pn, "description");
        this.setString(pn, "sku");
        this.setString(pn, "supplierProductId");
        this.setString(pn, "uom");
        this.setFloat(pn, "quantityNeeded");
        this.setFloat(pn, "quantityOrdered");
        this.setFloat(pn, "estimatedUnitCost");
        this.setFloat(pn, "actualUnitCost");
        this.setString(pn, "type");
        this.setString(pn, "vendorId");
        this.setString(pn, "refLineItemId");
        this.setString(pn, "refSalesOrderId");
        this.setString(pn, "vendor");
        this.setString(pn, "customer");
        this.setString(pn, "customerId");
        this.setString(pn, "status");
        this.setFloat(pn, "countProduct");
        this.setString(pn, "refDesignId");
        this.setString(pn, "refSalesOrderNo");
        this.setString(pn, "color");
        this.setString(pn, "size");
        this.setString(pn, "dueDate");
        this.setString(pn, "inhouseId");
        this.setFloat(pn, "rank");
    }
}
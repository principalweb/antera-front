export class PurchaseNeedFromServer {
    id: number;
    productId: number;
    name: string;
    description: string;
    supplierProductId: string;
    sku: string;
    uom: number;
    quantityNeeded: string;
    quantityOrdered: number;
    estimatedUnitCost: number;
    actualUnitCost: string;
    type: string;
    vendorId: string;
    refLineItemId: string;
    refSalesOrderId: string;
    vendor: string;
    customer: string;
    customerId: string;
    countProduct: number; 
    status: string; 
    parentId: number; 
    refDesignId: string;
    refSalesOrderNo: string;
}
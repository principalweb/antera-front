import { BaseModel } from '../base-model';

export class LineItem extends BaseModel
{
    id: string;
    invoiceId: string;
    parentId: string;
    type: string;
    orderedQuantity: number;
    invoiceQuantity: number;
    backOrderedQuantity: number;
    uom: string;
    description: string;
    unitPrice: number;
    extendedPrice: number;
    tax: boolean;
    taxType: string;
    lineGroup: string;
    refSalesOrderId: string;
    refSalesOrderLineItemId: string;
    imageId: number;
    imageUrl: string;
    itemRef: string;
    status: string;
    matchOrderQty: boolean;
    color: string;
    size: string;
    itemNo: string;
    invoiceNo: string;
    customerName: string;
    customerId: string;
    customerInfo: string;
    productId: string;
    productName: string;
    productInfo: string;
    rollback: number;

    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'parentId');
        this.setString(data, 'invoiceId');
        this.setString(data, 'type');
        this.setFloat(data, 'orderedQuantity');
        this.setFloat(data, 'invoiceQuantity');
        this.setString(data, 'uom');
        this.setString(data, 'description');
        this.setFloat(data, 'unitPrice');
        this.setFloat(data, 'extendedPrice');
        this.setBoolean(data, 'tax');
        this.setString(data, 'taxType');
        this.setString(data, 'lineGroup');
        this.setString(data, 'refSalesOrderId');
        this.setString(data, 'refSalesOrderLineItemId');
        this.setInt(data, 'imageId');
        this.setString(data, 'imageUrl');
        this.setString(data, 'itemRef');
        this.setString(data, 'status');
        this.setBoolean(data, 'matchOrderQty');
        this.setString(data, 'color');
        this.setString(data, 'size');
        this.setString(data, 'itemNo');
        this.setString(data, 'invoiceNo');
        this.setString(data, 'customerName');
        this.setString(data, 'customerId');
        this.setString(data, 'customerInfo');
        this.setString(data, 'producId');
        this.setString(data, 'productName');
        this.setString(data, 'productInfo');
        this.setFloat(data, "rollback")
    }
}
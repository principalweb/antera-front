import { BaseModel } from './base-model';

export class ProductionProductInfo extends BaseModel
{
    orderId: string;
    site: string;
    siteId: Number;
    bin: string;
    binId: Number;
    quantity: Number;
    lineId: Number;
    matrixId: Number;
    color: string;
    size: string;
    sku: string;
    skuId: Number;

    setData(productInfo) {
        this.setString(productInfo, 'orderId');
        this.setString(productInfo, 'site');
        this.setFloat(productInfo, 'siteId');
        this.setString(productInfo, 'bin');
        this.setFloat(productInfo, 'binId');
        this.setFloat(productInfo, 'quantity');
        this.setFloat(productInfo, 'lineId');
        this.setFloat(productInfo, 'matrixId');
        this.setString(productInfo, 'color');
        this.setString(productInfo, 'size');
        this.setString(productInfo, 'sku');
        this.setFloat(productInfo, 'skuId');
    }
}

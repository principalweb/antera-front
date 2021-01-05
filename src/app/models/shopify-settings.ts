import { BaseModel } from './base-model';

export class ShopifySettings extends BaseModel
{

  enableShopify: boolean;
  shopifyApiKey: string;
  shopifySecret: string;
  shopifyToken: string;
  shopifyMd5Key: string;
  shopifyStoreUrl: string;
  shopifyDefaultDecoTypeForArtwork: string;
  shopifyAcceptOrderDateFrom: Date;

  setData(config) {
    this.setBoolean(config, 'enableShopify');
    this.setString(config, 'shopifyApiKey');
    this.setString(config, 'shopifySecret');
    this.setString(config, 'shopifyToken');
    this.setString(config, 'shopifyMd5Key');
    this.setString(config, 'shopifyStoreUrl');
    this.setString(config, 'shopifyDefaultDecoTypeForArtwork');
    //this.setString(config, 'shopifyAcceptOrderDateFrom');
    this.setDate(config, 'shopifyAcceptOrderDateFrom');
  }
  toObject() {
    return {
      ...super.toObject(),
    }
  }
}

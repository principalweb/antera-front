import { BaseModel } from './base-model';

export class VendorDecorationPriceStrategy extends BaseModel {
    id: string;
    accountId: string;
    decoTypeId: string;
    priceStrategy: string;
    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'accountId');
        this.setString(data, 'decoTypeId');
        this.setString(data, 'priceStrategy');
    }

}

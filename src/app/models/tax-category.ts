import { BaseModel } from './base-model';

export class TaxCategory extends BaseModel
{
    id: number;
    name: string;
    productTaxCode: string;
    description: string;

    setData(category) {
        this.setInt(category, 'id');
        this.setString(category, 'name');
        this.setString(category, 'productTaxCode');
        this.setString(category, 'description');
    }
}
import { BaseModel } from './base-model';
import { TaxCategory } from './tax-category';
import { RestMeta } from './rest-meta';

export class TaxCollection extends BaseModel
{
    data: TaxCategory[];
    _links: any[];
    _meta: RestMeta;

    setData(collection) {
        this.setObjectArray(collection.data || [], 'data', TaxCategory);
        this.setObjectArray(collection._links || [], '_links');
        this.setObject(collection._meta || [], '_meta', RestMeta);
    }
}
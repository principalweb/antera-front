import { BaseModel } from '../base-model';
import { Invoice } from './invoice';
import { RestMeta } from '../rest-meta';

export class InvoiceCollection extends BaseModel
{
    data: Invoice[];
    _links: any[];
    _meta: RestMeta;

    setData(collection) {
        this.setObjectArray(collection.data || [], 'data', Invoice);
        this.setObjectArray(collection._links || [], '_links');
        this.setObject(collection._meta || [], '_meta', RestMeta);
    }
}
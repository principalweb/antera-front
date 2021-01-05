import { BaseModel } from './base-model';
export class RestMeta extends BaseModel
{
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;

  setData(meta) {
    this.setFloat(meta, 'totalCount');
    this.setFloat(meta, 'pageCount');
    this.setFloat(meta, 'currentPage');
    this.setFloat(meta, 'perPage');
  }
}

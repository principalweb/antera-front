import { BaseModel } from './base-model';

export class RestParams extends BaseModel {
  page: number;
  perPage: number;
  order: string;
  orient: string;

  setData(params) {
    this.setFloat(params, 'page');
    this.setFloat(params, 'perPage');
    this.setString(params, 'order');
    this.setString(params, 'orient');
  }
}
import { ApiService } from 'app/core/services/api.service';
import { Injectable } from '@angular/core';
import { AnteraSort, AnteraMeta, ApCreditFilter } from 'app/models';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApCreditService {

  constructor(
    private api: ApiService,
  ) { }

  getList(filter: ApCreditFilter, pagination: AnteraMeta, sort: AnteraSort) {
    return this.api.get('/api/v2/ap-credits?expand=account,apCreditLines.order', this.api.createListParams(filter, pagination, sort));
  }

  getVendorCreditList(filter) {
    let params:  HttpParams = new HttpParams();
    params = params.set('expand', 'apCreditLines');
    params = params.set('filter[accountId][like]', filter.vendorId);
    filter.orderIds.forEach((oId, key) => {
      params = params.set('filter[apCreditLines][orderId][' + key + ']', oId);
    });
    return this.api.get('/api/v2/ap-credits', {params});
  }

  getData(id) {
    return this.api.get('/api/v2/ap-credits/' + id + '?expand=account,apCreditLines.order');
  }

  create(data) {
    return this.api.post('/api/v2/ap-credits', data);
  }

  update(id, data) {
    return this.api.put('/api/v2/ap-credits/' + id, data);
  }

  delete(ids) {
    return this.api.delete('/api/v2/ap-credits/mass-delete', this.api.createDeleteParams(ids));
  }

  getVendorAutoComplete(vendorName) {
    let params:  HttpParams = new HttpParams();
    params = params.set('filter[name][like]', vendorName);
    params = params.set('filter[deleted]', 'false');
    params = params.set('filter[accountCstm][partnerType]', 'Vendor');
    return this.api.get('/api/v2/accounts', {params});
  }

  getVendorPoAutoComplete(vendorId, poNumber) {
    return this.api.post('/content/get-vendor-orders', {vendorId: vendorId, orderNumber: poNumber});
  }

  getPo(vendorId, orderId) {
    return this.api.post('/content/get-vouch', {vendorId: vendorId, orders: [orderId], viewPo: 1});
  }
}

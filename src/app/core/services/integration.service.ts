import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BehaviorSubject ,  Subject, Observable } from 'rxjs';

import { TaxCategory } from 'app/models/tax-category';
import { TaxCollection } from 'app/models/tax-collection';

import { map } from 'rxjs/operators';

import { MessageService } from 'app/core/services/message.service';
import { RestParams } from 'app/models/rest-params';

@Injectable()
export class IntegrationService {

  routeParams: any;
  onCompanyListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onCompanyListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onCompanyEndpointChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onCompanyEndpointCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onCompanyCredsChanged: BehaviorSubject<any> = new BehaviorSubject({});
  onPsCompanyUpdated: BehaviorSubject<any> = new BehaviorSubject({});
  onApiCredsChanged: BehaviorSubject<any> = new BehaviorSubject({});
  onApiCredsUpdated: BehaviorSubject<any> = new BehaviorSubject({});
  constructor(
    private msg: MessageService,
    private api: ApiService
  ) {}

  getPsCompanyList(payload)
  {
      return this.api.post('/content/get-ps-companies', payload)
              .subscribe((response: any) => {
                  this.onCompanyListCountChanged.next(response.count);
                  this.onCompanyListChanged.next(response.data);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getPsCompanyDetails(payload)
  {
      return this.api.post('/content/get-ps-company-details', payload)
              .subscribe((response: any) => {
                  this.onCompanyEndpointCountChanged.next(response.count);
                  this.onCompanyEndpointChanged.next(response.endpoints);
                  this.onCompanyCredsChanged.next(response.creds);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  removeShipMethod(id)
  {
      return this.api.post('/content/remove-service-ship-method', {id: id});
  }

  updateShipMethod(payload)
  {
      return this.api.post('/content/update-service-ship-method', payload);
  }

  getPsShipMethods(payload)
  {
      return this.api.post('/content/get-ps-ship-methods', payload);
  }

  updatePsCreds(payload)
  {
      return this.api.post('/content/update-ps-company', payload)
              .subscribe((response: any) => {
                  this.onPsCompanyUpdated.next(response);
                  this.msg.show(response.msg, 'success');
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getApiCreds(payload)
  {
      return this.api.post('/content/get-api-creds', payload)
              .subscribe((response: any) => {
                  this.onApiCredsChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  updateApiCreds(payload)
  {
      return this.api.post('/content/update-api-creds', payload)
              .subscribe((response: any) => {
                  this.onApiCredsUpdated.next(response.api_type);
                  this.msg.show(response.msg, 'success');
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getAsiCreds()
  {
      return this.api.post('/content/asi-get-config', {});
  }

  setAsiCreds(creds)
  {
      return this.api.post('/content/asi-set-config', creds);
  }

  connectorGetConfig(connector, configs)
  {
      return this.api.post('/content/connector-get-config', {connector:connector, configs:configs});
  }

  getDubowConfigs(configs)
  {
      return this.api.post('/content/get-dubow-config', {configs:configs});
  }

  setDubowConfigs(configs)
  {
      return this.api.post('/content/set-dubow-config', configs);
  }

  setConnectorConfigs(connector, configs)
  {
      return this.api.post('/content/set-connector-config', {connector:connector, configs:configs});
  }

  apiEnabled()
  {
      return this.api.integrationApiEnabled().pipe(
        map((res: any) => {
            return res.data;
        })
      );
  }

  enableApi(enable: boolean) {
      return this.api.integrationEnableApi(enable).pipe(
        map((res: any) => {
            return res.data;
        })
      );
  }

  getToken() {
      return this.api.integrationGetToken().pipe(
        map((res: any) => {
            return res.data;
        })
      )
  }

  generateToken() {
      return this.api.integrationGenerateToken().pipe(
        map((res: any) => {
            return res.data;
        })
      )
  }

  importTaxCategories() {
      return this.api.integrationImportTaxCategories().pipe(
          map((res: any) => {
              return res.success;
          })
      ) 
  }

  getTaxCategories(filters, restParams: RestParams): Observable<TaxCollection>{
      return this.api.integrationGetTaxCategories(filters, restParams).pipe(
          map((res: any) => {
              const ret = new TaxCollection(res);
              return ret;
          })
      )
  }

  relateProductTaxCategory(taxCategoryId, productId) {
      return this.api.integrationRelateProductTaxCategory(taxCategoryId, productId);
  }

  relateDecotypeTaxCategory(taxCategoryId, decotypeId) {
      return this.api.integrationRelateDecotypeCategory(taxCategoryId, decotypeId);
  }

  relateChargeTaxCategory(taxCategoryId, chargeId) {
      return this.api.integrationRelateChargeTaxCategory(taxCategoryId, chargeId);
  }

  relateProductCategoryTaxCategory(taxCategoryId, productCategoryId) {
      return this.api.integrationRelateProductTaxCategory(taxCategoryId, productCategoryId);
  }
}
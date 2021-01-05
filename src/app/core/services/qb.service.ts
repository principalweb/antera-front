import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BehaviorSubject ,  Subject } from 'rxjs';

@Injectable()
export class QbService implements Resolve<any>{

  routeParams: any;
  qbEnabled: any;
  backDateProcessing: boolean = false;
  onQbActiveChanged: BehaviorSubject<any> = new BehaviorSubject(true);
  constructor(
    private api: ApiService
  ) {
    this.getQbEnabled();
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any>{
    this.routeParams = route.queryParams;
    return;
  }

  getQbEnabled()
  {
      this.api.post('/content/qb-enabled', {})
          .subscribe((response: any) => {
              this.qbEnabled = response;
              this.onQbActiveChanged.next(true);
          });
  }

  getActiveConnector()
  {
      if(this.qbEnabled != null  && this.qbEnabled.enabled != null) {
          return this.qbEnabled.enabled;
      }
      return "";
  }

  qbActive()
  {
      if(this.qbEnabled != undefined && this.qbEnabled.enabled != "") {
          return true;
      }
      return false;
  }

  /*
   * This function fetches the QB push status for the following entities
   * PurchseOrder - orderId, vendorId
   * Contact - contactId, accountId
   * Invoice - orderId
   * Item - productId
   * Account - accountId
   */
  entityStatus(entity, id, relatedId = ''): Promise<any>
  {
    return new Promise((resolve, reject) => {
        this.api.post("/content/qb-entity-status", {entity:entity,id:id,relatedId:relatedId})
          .subscribe((response) => {
            resolve(response);
          },(err) => {
            reject(err);
          });
    });
  }

  orderPoStatus(id): Promise<any>
  {
    return new Promise((resolve, reject) => {
      this.api.post('/content/qb-check-po-status', {orderId: id})
        .subscribe((response) => {
          resolve(response);
        }, (err) => {
          reject(err);
        });
    });
  }

  /*
   * This function updates any of the following entities to QuickBooks
   * Invoice - orderId
   */
  voidEntity(entity, id, relatedId = ''): Promise<any>
  {
    return new Promise((resolve, reject) => {
        this.api.post('/content/qb-void', {entity: entity, id: id, relatedId: relatedId})
          .subscribe((response) => {
            resolve(response);
          }, (err) => {
            reject(err);
          });
    });
  }

  /*
   * This function updates any of the following entities to QuickBooks
   * PurchaseOrder - orderId, vendorId
   * Contact - contactId, accountId
   * Invoice - orderId
   * CreditMemo - orderId
   * Item - productId
   * Account - accountId
   * Vendor - accountId
   */
  pushEntity(entity, id, relatedId = ''): Promise<any>
  {
    return new Promise((resolve, reject) => {
        this.api.post("/content/qb-push", {entity:entity,id:id,relatedId:relatedId})
          .subscribe((response) => {
            resolve(response);
          },(err) => {
            reject(err);
          });
    });
  }

  qboProcessBackDate(entity, ids, relatedId = '', invoiceDate): Promise<any>
  {
    this.backDateProcessing = true;
    return new Promise((resolve, reject) => {
        this.api.post("/content/qbo-process-back-date", {entity:entity,ids:ids,relatedId:relatedId, invoiceDate: invoiceDate})
          .subscribe((response) => {
            this.backDateProcessing = false;
            resolve(response);
          },(err) => {
            reject(err);
          });
    });
  }


  pushEntityMap(entity, id, relatedId = '')
  {
    return this.api.post('/content/qb-push', {entity: entity, id: id, relatedId: relatedId});
  }

  qbDisconnect(connector)
  {
     return this.api.post('/content/accounting-disconnect', {connector: connector});
  }

  qbImport()
  {
     return this.api.post('/content/accounting-import', {});
  }

  getXeroConfig(payload)
  {
      return this.api.post('/content/xero-get-config', payload);
  }

  getQboConfig(payload)
  {
      return this.api.post('/content/qbo-get-config', payload);
  }

  getFinancialAccoounts()
  {
      return this.api.post('/content/get-financial-accounts', {});
  }

  getCustomFields(connector)
  {
      return this.api.post('/content/get-custom-fields', {connector:connector});
  }

  setXeroConfig(payload)
  {
      return this.api.post('/content/xero-set-config', payload);
  }

  setQboConfig(payload)
  {
      return this.api.post('/content/qbo-set-config', payload);
  }

  getLocalCreditTerms()
  {
      return this.api.post('/content/get-dropdowns', {dropdown:['sys_credit_terms_list']});
  }

  getTaxRates(connector)
  {
      return this.api.post('/content/qb-get-tax-rates', {connector: connector});
  }

  getCreditTerms(connector)
  {
      return this.api.post('/content/qb-get-terms', {connector: connector});
  }

  getClass(connector)
  {
      return this.api.post('/content/qb-get-class', {connector: connector});
  }
  qboCleanEntity(entity, id, relatedId = ''){
      return this.api.post('/content/qbo-clean-entity', {entity:entity, id:id, relatedId:relatedId});
  }
}

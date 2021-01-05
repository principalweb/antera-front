import { Injectable } from '@angular/core';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { VouchingDetails } from 'app/models/vouching';
import { MessageService } from 'app/core/services/message.service';
import { Observable, BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class VouchingsService {

  onOpenPOsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
  onOpenPOsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
  onListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onGstTaxStatusChanged: BehaviorSubject<any> = new BehaviorSubject(false);
  onDataUpdated: Subject<any> = new Subject();
  onDataChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onDataRemoved: Subject<any> = new Subject();

  params = {
    offset: 0,
    limit: 50,
    order: 'poNumber',
    orient: 'desc',
    term: {
      poNumber: '',
      vendor: '',
      vendorPhone: '',
      vendorEmail: '',
      inhouse: '',
      vouchingStatus: 'Pending',
      createdBy: '',
      excludeMerged: '1',
      poType: 'DropShip',
      dateCreated: ''
    }
  };

  isVouching: boolean = false;

  constructor(
    private api: ApiService,
    private msg: MessageService,
    private selection: SelectionService
  ) {

  }

  /**
   * The Contacts App Main Resolver
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
  {
     if (route.queryParams) {
       this.params.term.poNumber = route.queryParams.poNumber;
       this.params.term.vendor = route.queryParams.vendor;
     }
    if(state.url == "/vouchings") {
        this.isVouching = true;
    }
    return this.getOpenPOsAndCount();
  }

  getOpenPOsAndCount()
  {
    return forkJoin([
      this.getOpenPOs(),
      this.getOpenPOsCount()
    ]);
  }

  getOpenPOs()
  {
    if(this.isVouching) {
        this.params.term.inhouse = "0";
        this.params.term.excludeMerged = "1";
    }
    return this.api.getWorkflowList(this.params).pipe(
      map((response: any) => {
        this.onOpenPOsChanged.next(response.rows);
        return response;
      })
    );
  }

  getOpenPOsCount()
  {
    if(this.isVouching) {
        this.params.term.inhouse = "0";
        this.params.term.excludeMerged = "1";
    }
    return this.api.getWorkflowListCount(this.params).pipe(
      map((response: any) => {
        this.onOpenPOsCountChanged.next(response.count);
        return response;
      })
    );
  }

  createVouching(vouchingDetail: VouchingDetails)
  {
    return this.api.createVouching(vouchingDetail.toObject()).pipe(
      switchMap(() => this.getOpenPOs())
    );
  }

  filter(term) {
    this.params.term = term;
    return this.getOpenPOsAndCount();
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;
    return this.getOpenPOs();
  }

  sort(se) {
    this.params.order = se.active;
    this.params.orient = se.direction;
    return this.getOpenPOs();
  }

  getCount(payload)
  {
      return this.api.post('/content/get-vouch-count', payload)
              .subscribe((response: any) => {
                  this.onListCountChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getList(payload)
  {
      return this.api.post('/content/get-vouch-list', payload)
              .subscribe((response: any) => {
                  this.onListChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getLocalApInvoice(orderId, vendorId)
  {
      return this.api.post('/content/get-apinvoice-po', {vendorId: vendorId, salesOrderNumber: orderId});
  }

  searchApinvoice(data)
  {
      return this.api.post('/content/search-apinvoice', data);
  }

  getApInvoice(data)
  {
      return this.api.post('/content/get-ap-invoice', data);
  }

  getVouchingData(id)
  {
    return this.api.get('/api/v1/vouching/' + id);
  }

  getInvoiceData(id)
  {
      return this.api.get('/api/v2/vouchings/' + id + '?expand=vouchingLines.order,vouchingPos,apCreditAllocationLogs');
  }

  getData(data)
  {
      return this.api.post('/content/get-vouch', data)
              .subscribe((response: any) => {
                  if(response && response.msg) {
                      this.msg.show(response.msg, 'error');
                      this.onDataChanged.next([]);
                  } else if(response) {
                      this.onDataChanged.next(response);
                  } else {
                      this.onDataChanged.next(response);
                  }
              }, err => {
                  this.onDataChanged.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  poGstEnabled()
  {
      return this.api.post('/content/po-gst-enabled', {})
              .subscribe((response: any) => {
                  this.onGstTaxStatusChanged.next(response);
              }, err => {
                  this.onGstTaxStatusChanged.next({enabled: false});
                  this.msg.show(err.message, 'error');
              });
  }

  updateData(data)
  {
      return this.api.post('/content/save-category', data)
              .subscribe((response: any) => {
                  this.onDataUpdated.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onDataUpdated.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  removeData(id)
  {
      return this.api.delete('/api/v1/vouchings/mass-delete', this.api.createDeleteParams(id))
        .subscribe((response: any) => {
          this.onDataRemoved.next(true);
          if (response.status && response.status == 'success') {
            this.msg.show('Records removed', 'success');
          } else {
            this.msg.show('An error occured!', 'error');
          }
        }, err => {
          this.onDataRemoved.next(false);
          if (err.error && err.error.data) {
            this.msg.show(err.error.data, 'error');
          } else {
            this.msg.show('An error occured!', 'error');
          }
        });
  }

  getOrderVouchedLines(oId) {
      return this.api.post('/content/get-order-vouched-info', {orderId: oId});
  }
}

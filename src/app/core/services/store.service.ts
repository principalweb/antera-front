import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BehaviorSubject ,  Subject } from 'rxjs';

import { MessageService } from 'app/core/services/message.service';

@Injectable()
export class StoreService {

  routeParams: any;
  onStoreListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onStoreListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onStoreUpdated: BehaviorSubject<any> = new BehaviorSubject([]);
  onStoreChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onRemoved: BehaviorSubject<any> = new BehaviorSubject([]);
  constructor(
    private msg: MessageService,
    private api: ApiService
  ) {}

  getStoreCount(payload)
  {
      return this.api.post('/content/get-webstore-count', payload)
              .subscribe((response: any) => {
                  this.onStoreListCountChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getStoreList(payload)
  {
      return this.api.post('/content/get-webstore-list', payload)
              .subscribe((response: any) => {
                  this.onStoreListChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  updateStore(data,dialog)
  {
      return this.api.post('/content/save-webstore', data)
              .subscribe((response: any) => {
                    if(response.err === 'success') {
                        dialog.close()
                    }
                  this.onStoreUpdated.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onStoreUpdated.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  removeStores(data)
  {
      return this.api.post('/content/remove-webstore', data)
              .subscribe((response: any) => {
                  this.onRemoved.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onRemoved.next(err);
                  this.msg.show(err.message, 'error');
              });
  }
}

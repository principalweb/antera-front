import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { BehaviorSubject ,  Subject } from 'rxjs';

import { MessageService } from 'app/core/services/message.service';

@Injectable()
export class PartnerService {
  onListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onDataUpdated: Subject<any> = new Subject();
  onDataChanged: Subject<any> = new Subject();
  onDataRemoved: Subject<any> = new Subject();

  constructor(
    private msg: MessageService,
    private api: ApiService
  ) {}

  getCount(payload)
  {
      return this.api.post('/content/get-partner-count', payload)
              .subscribe((response: any) => {
                  this.onListCountChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getList(payload)
  {
      return this.api.post('/content/get-partner-list', payload)
              .subscribe((response: any) => {
                  this.onListChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getData(data)
  {
      return this.api.post('/content/get-partner', {id:data})
              .subscribe((response: any) => {
                  if(response.msg) {
                      this.msg.show(response.msg, 'error');
                  }
                  this.onDataChanged.next(response);
              }, err => {
                  this.onDataChanged.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  updateData(data)
  {
      return this.api.post('/content/save-partner', data)
              .subscribe((response: any) => {
                  this.onDataUpdated.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onDataUpdated.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  removeData(data)
  {
      return this.api.post('/content/remove-partner', data)
              .subscribe((response: any) => {
                  this.onDataRemoved.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onDataRemoved.next(err);
                  this.msg.show(err.message, 'error');
              });
  }
  
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { BehaviorSubject ,  Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { MessageService } from 'app/core/services/message.service';

@Injectable()
export class TagService {

  routeParams: any;
  onTagListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onTagListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onTagUpdated: BehaviorSubject<any> = new BehaviorSubject([]);
  onTagChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onRemoved: BehaviorSubject<any> = new BehaviorSubject([]);
  tagType = 'Module Tag';
  constructor(
    private msg: MessageService,
    private api: ApiService,
    private auth: AuthService
  ) {}

  getTagCount(payload)
  {
        Object.assign(payload.term,{tagType: this.tagType})
        return this.api.post('/content/get-tags-count', payload)
              .subscribe((response: any) => {
                  this.onTagListCountChanged.next(response.count);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getTagList(payload)
  {
      Object.assign(payload.term,{tagType: this.tagType})
      return this.api.post('/content/get-tags-list', payload)
              .subscribe((response: any) => {
                  console.log("getTagList response",response)
                  this.onTagListChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  updateTag(data,dialog)
  {     
      Object.assign(data,{assignedSalesRepId:this.auth.getCurrentUser().userId})
      return this.api.post('/content/update-tags', data)
              .subscribe((response: any) => {
                    if(response.status === 'success') {
                        dialog.close()
                    }
                  this.onTagUpdated.next(response);
                  this.msg.show(response.msg, response.status);
              }, err => {
                  this.onTagUpdated.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  removeTags(data)
  {
        return this.api.post('/content/delete-tags', {ids:data})
  }

  createTag(data,dialog) {
      Object.assign(data,{assignedSalesRepId:this.auth.getCurrentUser().userId})
        return this.api.post('/content/create-tags', data)
            .subscribe((response: any) => {
                if(response.status === 'success') {
                    dialog.close()
                }
                this.onRemoved.next(response);
                this.msg.show(response.msg, response.err);
                
            }, err => {
                this.onRemoved.next(err);
                this.msg.show(err.message, 'error');
            });
  }
}

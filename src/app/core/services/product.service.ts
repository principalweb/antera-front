import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { BehaviorSubject ,  Subject } from 'rxjs';
import { MessageService } from 'app/core/services/message.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  onLabelListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onLabelListCountChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onLabelsDataRemoved: Subject<any> = new Subject();
  onLabelsDataUpdated: Subject<any> = new Subject();
  onLabelsDataChanged: Subject<any> = new Subject();

  constructor(
    private api: ApiService,
    private msg: MessageService
  ) {
  }

  getAttributeValues(attributeType)
  {
      return this.api.post('/content/get-product-attribute-values', {type: attributeType});
  }

  updateAttributeRank(v)
  {
      return this.api.post('/content/set-product-attribute-rank', {data: v});
  }

  getLabelsListAll()
  {
    return this.api.post('/content/get-product-attribute-labels-all', {});
  }

  getLabelsList(data)
  {
      return new Promise((resolve, reject) => {
        this.api.post('/content/get-product-attribute-labels', data)
          .subscribe((list: any[]) => {
              this.onLabelListChanged.next(list);
              resolve(list);
          }, reject);
      });
  }

  getLabelsListCount(data)
  {
      return new Promise((resolve, reject) => {
        this.api.post('/content/get-product-attribute-labels-count', data)
          .subscribe((response: any) => {
              this.onLabelListCountChanged.next(response);
              resolve(response);
          }, reject);
      });
  }

  updateLabelsData(data)
  {
      return this.api.post('/content/save-product-attribute-label', data)
              .subscribe((response: any) => {
                  this.onLabelsDataUpdated.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onLabelsDataUpdated.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  removeLabelsData(data)
  {
      return this.api.post('/content/remove-product-attribute-label', data)
              .subscribe((response: any) => {
                  this.onLabelsDataRemoved.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onLabelsDataRemoved.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  getLabelsData(data)
  {
      return this.api.post('/content/get-product-attribute-label', {id: data})
              .subscribe((response: any) => {
                  if (response.msg) {
                      this.msg.show(response.msg, 'error');
                  }
                  this.onLabelsDataChanged.next(response);
              }, err => {
                  this.onLabelsDataChanged.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

}

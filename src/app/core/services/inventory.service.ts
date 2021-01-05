import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { BehaviorSubject ,  Subject } from 'rxjs';

import { MessageService } from 'app/core/services/message.service';
import { HttpParams, HttpUrlEncodingCodec } from '@angular/common/http';

@Injectable()
export class InventoryService{

  onInventoryListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onInventoryListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onInventoryItemListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onInventoryItemListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onInventoryAdjustListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onInventoryAdjustListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onInventoryTransferListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onInventoryTransferListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onInventoryValueChanged: BehaviorSubject<any> = new BehaviorSubject({});
  onInventoryReserveChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onInventoryReserveCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onSiteListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onSiteListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onBinListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onBinListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  onSiteDataUpdated: Subject<any> = new Subject();
  onSiteDataChanged: Subject<any> = new Subject();
  onSiteDataRemoved: Subject<any> = new Subject();
  onBinDataUpdated: Subject<any> = new Subject();
  onBinDataChanged: Subject<any> = new Subject();
  onBinDataRemoved: Subject<any> = new Subject();
  onFobChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  // transfer not through order
  onInventoryTransferSaveChanged: Subject<any> = new Subject();
  // transfer through order
  onInventoryTransferItemsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  transferItems: any[];
  transferred:any = {message:''};
  transferChanged: BehaviorSubject<any> = new BehaviorSubject([]);
  onInventoryItemChanged: BehaviorSubject<any> = new BehaviorSubject({});
  onProductChanged: BehaviorSubject<any> = new BehaviorSubject(0);
  private id:number;
  constructor(
    private api: ApiService,
    private msg: MessageService
  ) {
  }

  getInventoryReserve(payload)
  {
    this.api.post('/content/get-product-inventory-reserve', payload)
          .subscribe((response: any) => {
                        this.onInventoryReserveChanged.next(response);
                      }, (err: any) => {
                          this.msg.show("Error fetching Reserved Inventory!", 'error');
                      });
  }

  getInventoryReserveCount(payload)
  {
    this.api.post('/content/get-product-inventory-reserve-count', payload)
            .subscribe((response: any) => {
                            this.onInventoryReserveCountChanged.next(response.count);
                        }, (err: any) => {
                            this.msg.show("Error fetching Reserved Inventory Count!", 'error');
                        });
  }

  getInventoryItemList(productId, payload)
  {
    let params: HttpParams = new HttpParams();
    // tslint:disable-next-line: forin
    for (const p in payload) {
      params = params.set(p, payload[p]);
    }
    this.api.get('/api/v1/products/' + productId + '/inventory', {params})
      .subscribe((response: any) => {
        this.onInventoryItemListChanged.next(response.data);
        this.onInventoryItemListCountChanged.next(response.meta.total_count);
      }, (err: any) => {
        this.msg.show('Error fetching Inventory !', 'error');
      });
  }

  getInventoryAdjustList(payload)
  {
    this.api.post('/content/get-product-inventory-adjust-list', payload)
        .subscribe((response: any) => {
            console.log('response from get end point ', response);
                    this.onInventoryAdjustListChanged.next(response);
                    }, (err:any) => {
                        this.msg.show("Error fetching Inventory !", 'error');
                    });
  }
  

  getInventoryAdjustListCount(payload)
  {
    this.api.post('/content/get-product-inventory-adjust-list-count', payload)
        .subscribe((response: any) => {
                    this.onInventoryAdjustListCountChanged.next(response.count);
                    }, (err:any) => {
                        this.msg.show("Error fetching Inventory!", 'error');
                    });
  }

  getInventoryTransferList(payload)
  {
    this.api.post('/content/get-product-inventory-transfer-list', payload)
        .subscribe((response: any) => {
                    this.onInventoryTransferListChanged.next(response);
                    }, (err:any) => {
                        this.msg.show("Error fetching Inventory!", 'error');
                    });
  }

  getInventoryTransferListCount(payload)
  {
    this.api.post('/content/get-product-inventory-transfer-list-count', payload)
        .subscribe((response: any) => {
                    this.onInventoryTransferListCountChanged.next(response.count);
                    }, (err:any) => {
                        this.msg.show("Error fetching Inventory!", 'error');
                    });
  }

  getInventoryList(payload)
  {
    this.api.post('/content/get-product-inventory-list', payload)
        .subscribe((response: any) => {
                    this.onInventoryListChanged.next(response);
                    }, (err:any) => {
                        this.msg.show("Error fetching Inventory!", 'error');
                    });
  }

  getInventoryListCount(payload)
  {
    this.api.post('/content/get-product-inventory-list-count', payload)
        .subscribe((response: any) => {
                    this.onInventoryListCountChanged.next(response.count);
                    }, (err:any) => {
                        this.msg.show("Error fetching Inventory!", 'error');
                    });
  }

  getAccountFob(payload) {
      this.api.post('/content/get-account-fob-bins', payload)
          .subscribe((response: any) => {
              this.onFobChanged.next(response);
          }, (err:any) => {
              this.msg.show("Error fetching FOB!", 'error');
          });
  }

  getFob(payload = {}) {
      this.api.post('/content/get-fob-bins', payload)
          .subscribe((response: any) => {
              this.onFobChanged.next(response);
          }, (err:any) => {
              this.msg.show("Error fetching FOB!", 'error');
          });
  }

  // transfer inventory (direct transfer not through order)
  saveTransferInventory(p)
  {
      return this.api.post('/content/save-inventory-transfers', p);
  }

  saveAdjustInventory(p)
  {
      return this.api.post('/content/save-inventory-adjustments', p);
  }
  saveMinMaxInventory(p)
  {
      return this.api.post('/content/save-minmax-inventory', p);
  }
  getSiteCount(payload)
  {
      return this.api.post('/content/get-site-count', payload)
              .subscribe((response: any) => {
                  this.onSiteListCountChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getSiteList(payload)
  {
      return this.api.post('/content/get-site-list', payload)
              .subscribe((response: any) => {
                  this.onSiteListChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getBinCount(payload)
  {
      return this.api.post('/content/get-bin-count', payload)
              .subscribe((response: any) => {
                  this.onBinListCountChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  getBinList(payload)
  {
      return this.api.post('/content/get-bin-list', payload)
              .subscribe((response: any) => {
                  this.onBinListChanged.next(response);
              }, err => {
                  this.msg.show(err.message, 'error');
              });
  }

  updateSiteData(data)
  {
      return this.api.post('/content/save-site', data)
              .subscribe((response: any) => {
                  this.onSiteDataUpdated.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onSiteDataUpdated.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  removeSiteData(data)
  {
      return this.api.post('/content/remove-site', data)
              .subscribe((response: any) => {
                  this.onSiteDataRemoved.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onSiteDataRemoved.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  updateBinData(data,dialogRef)
  {
      return this.api.post('/content/save-bin', data)
              .subscribe((response: any) => {
                  if(response.err === false) {
                    dialogRef.close()
                  }
                  this.onBinDataUpdated.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onSiteDataUpdated.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  removeBinData(data)
  {
      return this.api.post('/content/remove-bin', data)
              .subscribe((response: any) => {
                  this.onBinDataRemoved.next(response);
                  this.msg.show(response.msg, response.err);
              }, err => {
                  this.onBinDataRemoved.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  getSiteData(data)
  {
      return this.api.post('/content/get-site', {id:data})
              .subscribe((response: any) => {
                  if(response.msg) {
                      this.msg.show(response.msg, 'error');
                  }
                  this.onSiteDataChanged.next(response);
              }, err => {
                  this.onSiteDataChanged.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  getBinData(data)
  {
      return this.api.post('/content/get-bin', {id:data})
              .subscribe((response: any) => {
                  if(response.msg) {
                      this.msg.show(response.msg, 'error');
                  }
                  this.onBinDataChanged.next(response);
              }, err => {
                  this.onBinDataChanged.next(err);
                  this.msg.show(err.message, 'error');
              });
  }

  updateSiteDefault(data)
  {
      return this.api.post('/content/update-site-default', {id:data});
  }

  // transfer inventory (transfer through order)
    getTransferInventoryProducts(orderId, accountType): Promise<any>
    {
        return new Promise((resolve, reject) => {
            resolve([]);
            this.api.post('/content/get-products-to-transfer', {orderId:orderId, accountType:accountType})
                .subscribe((response: any) => {
                    this.transferItems = response;
                    this.onInventoryTransferItemsChanged.next(this.transferItems);
                    resolve(response);
                }, reject);
        });
    }

  // transfer inventory (transfer through order)
    transfer(items)
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/inventory-transfer', {items:items})
                .subscribe(response => {
                    this.transferred = response;
                    this.transferChanged.next(response);
                    resolve(response);
                });
        });
    }

  checkTransferInventory(accountId, orderId)
  {
      return this.api.post('/content/check-transfer-inventory', {accountId:accountId, orderId:orderId});
  }

  getProductInventoryBinAmount(params = {})
  {
      return this.api.post('/content/get-product-inventory-bin-price', params);
  }

  cancelReserve(trackIds)
  {
      return this.api.post('/content/cancel-inventory-reserve', {trackIds:trackIds});
  }

  getProductInventoryBinQty(params = {})
  {
      return this.api.post('/content/get-product-inventory-bin-qty', params);
  }

  getProductInventoryValue()
  {
      this.api.post('/content/get-product-inventory-value', {})
          .subscribe((response: any) => {
                this.onInventoryValueChanged.next(response);
                }, (err:any) => {
                    this.msg.show("Error fetching Reserved Inventory Value!", 'error');
                });
  }

  // transfer inventory (transfer through order)
  emitInventoryItem(item:any)
  {
      this.onInventoryItemChanged.next(item);
  }

  // transfer inventory (transfer through order)
  emitProduct(item:any)
  {
    this.onProductChanged.next(item);
  }
}

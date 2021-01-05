import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription, Observable } from 'rxjs';
import { each, find } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { MessageService } from 'app/core/services/message.service';
import { InventoryService } from 'app/core/services/inventory.service';

import { OriginBinPipe } from '../inventory-transfer/inventory-transfer.component';

import { InventoryAdjustItem, Site, Bin } from 'app/models';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'inventory-item-transfer',
  templateUrl: './inventory-item-transfer.component.html',
  styleUrls: ['./inventory-item-transfer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class InventoryItemTransferComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: InventoryListDataSource | null;
  displayedClumns = ['color', 'size', 'site', 'bin', 'minQty', 'max', 'reserved', 'quantity', 'quantityEdit', 'newSite', 'newBin', 'save'];

  itemForm: FormGroup;

  item: InventoryAdjustItem;

  adjustQty: number = 0;
  price: number = 0;

  fob: Site[] = [];
  bins: any[] = [];
  itemList: any[] = [];
  loading: boolean = false;

    filterForm: FormGroup;
    af: FormGroup;

    payload = {
        "offset": 0,
        "limit": 50,
        "order": "productId",
        "orient": "desc",
        "id": "",
        "term": {
            "productId": "",
            "productName": "",
            "inhouseId": "",
            "site": "",
            "bin": "",
            "sku": "",
            "color": "",
            "size": "",
            "quantity": "",
            "reserved": "",
            "min": "",
            "max": ""
        },
        "type": true,
        "completed": false
    };

    paginationTotal: number = 0;

  onFobChangedSubscription: Subscription;
  onInventoryListChangedSubscription: Subscription;
  onProductChangedSubscription: Subscription;

  constructor(
      private fb: FormBuilder,
      private inventoryService: InventoryService,
      private msg: MessageService
  ) {
    this.payload.id = "";
    this.filterForm = this.fb.group(this.payload.term);
    this.af = this.fb.group({});
      this.onFobChangedSubscription = this.inventoryService.onFobChanged.subscribe((response) => {
          this.fob = response;
          this.bins = [];
          this.bins[''] = [];
          each(this.fob, (f) => {
            this.bins[f.fobId] = f.bins;
          })
      });
      this.onProductChangedSubscription = this.inventoryService.onProductChanged.subscribe((item) => {
        if (item) {
            this.payload.id = item.id;
            this.item = item;
            this.loadData();
        }
      });
        this.onInventoryListChangedSubscription =
            this.inventoryService.onInventoryTransferListChanged
            .subscribe(list => {
                this.itemList = list;
                this.initAf();
                this.loading = false;
            });
  }

  ngOnInit() {
      this.inventoryService.getFob();
      this.dataSource = new InventoryListDataSource(
          this.inventoryService
      );
  }

  loadData() {
      this.payload.term = this.filterForm.value;
      this.loading = true;
      this.inventoryService.getInventoryTransferList({...this.payload});
      this.inventoryService.getInventoryTransferListCount({...this.payload});
  }

  initAf()
  {
    this.af = this.fb.group({});
    each(this.itemList, (item) => {
        this.af.addControl(item.binId + '_' + item.sku, new FormControl('0'));
        let siteId = '';
        let binId = '';
        const ff = this.fob.find(f => f.fobId == item.siteId);
        if (ff) {
          each(ff.bins, (b) => {
            if (binId != '' && b.binId != item.binId) {
              siteId = ff.fobId;
              binId = b.binId;
            }
          });
        }
        if(binId == '') {
          each(this.fob, (f) => {
            each(f.bins, (b) => {
              if(binId == '' && b.binId != item.binId) {
                siteId = f.fobId;
                binId = b.binId;
                return;
              }
            });
            if (binId != '') {
              return;
            }
          });
        }
        this.af.addControl(item.binId + '_' + item.sku + '_siteId', new FormControl(''));
        this.af.addControl(item.binId + '_' + item.sku + '_binId', new FormControl(''));
    });
  }

    compareFob(obj1: Site, obj2: string)
    {
        return obj1.fobId === obj2;
    }

    compareBin(obj1: Bin, obj2: string)
    {
        return obj1.binId === obj2;
    }


  getProductInventoryBinAmount() {
      /*this.inventoryService.getProductInventoryBinAmount({productId:this.item.id, sku:this.item.sku, binId:this.item.binId, siteId:this.item.siteId})
          .subscribe((response: any) => {
            this.price = response.price;
            this.initItemForm();
            this.getAdjust();
          }, (err:any) => {
              this.msg.show("Error fetching price for inventory!", 'error');
          });*/
  }

  initItemForm() {
      this.itemForm = this.fb.group({
      });
  }

  calculateChange(binId, sku) {
      const qty = Number(this.af.value[binId + '_' + sku]);
      if (qty > 0) {
          const item = find(this.itemList, {binId: binId, sku: sku});
          if (item) {
            item.quantityChange = qty - item.quantity;
          }
      }
  }

  getAdjust() {
      this.getFobBins();
      if (Number(this.itemForm.get('newQuantity').value) < 0) {
        this.adjustQty = 0;
      } else {
          // this.adjustQty = (Number(this.itemForm.get('newQuantity').value) - Number(this.item.quantity));
      }
  }

  getFobBins() {
      if (this.fob) {
          const result = this.fob.find(site => site.fobId == this.itemForm.get('site').value);
          if (result) {
              return result.bins;
          }
      }
      return [];
  }

  transferAll() {
    const asa: any[] = [];
    each(this.itemList, (item) => {
      if (this.af.value[item.binId + '_' + item.sku] != 0) {
        asa.push({
                  tq: this.af.value[item.binId + '_' + item.sku],
                  sku: item.sku,
                  bin: item.binId,
                  site: item.siteId,
                  dBin: this.af.value[item.binId + '_' + item.sku + '_binId'],
                  dSite: this.af.value[item.binId + '_' + item.sku + '_siteId'],
                });
      }
    });
    if (asa.length == 0 ) {
      this.msg.show('No transfer required', 'error');
      return;
    }
    this.loading = true;
    const p = {'p': this.item, 'as': asa};
    this.inventoryService.saveTransferInventory(p)
          .subscribe((response: any) => {
            if (response.error == '1') {
              this.msg.show(response.msg, 'error');
              this.loading = false;
            } else {
              this.msg.show(response.msg, 'success');
              this.inventoryService.emitProduct(this.item);
            }
          }, (err: any) => {
              this.msg.show('Error saving inventory transfer!', 'error');
              this.loading = false;
          });
  }

  transfer(item) {
    const qty = this.af.value[item.binId + '_' + item.sku];
    const dSite = this.af.value[item.binId + '_' + item.sku + '_siteId'];
    const dBin = this.af.value[item.binId + '_' + item.sku + '_binId'];
    if ( Number( qty ) > Number(item.quantity)) {
      this.msg.show('Provided quantity is more than what is available!', 'error');
      return;
    }
    this.loading = true;
    const p = {'p': this.item, 'as': [{ tq: qty, sku: item.sku, bin: item.binId, site: item.siteId, dSite: dSite, dBin: dBin }]};
    this.inventoryService.saveTransferInventory(p)
          .subscribe((response: any) => {
            if (response.error == '1') {
              this.msg.show(response.msg, 'error');
              this.loading = false;
            } else {
              this.msg.show(response.msg, 'success');
              this.inventoryService.emitProduct(this.item);
            }
          }, (err: any) => {
              this.msg.show('Error saving inventory transfer!', 'error');
              this.loading = false;
          });
  }

  sortChange(ev) {
      this.payload.order = ev.active;
      this.payload.orient = ev.direction;
      if(ev.direction == '') {
          this.payload.order = 'sku';
          this.payload.orient = 'asc';
      }
      this.loadData();
  }

  paginate(ev) {
      this.payload.offset = ev.pageIndex;
      this.payload.limit = ev.pageSize;
      this.loadData();
  }

  ngOnDestroy() {
      this.onFobChangedSubscription.unsubscribe();
      this.onProductChangedSubscription.unsubscribe();
      this.onInventoryListChangedSubscription.unsubscribe();
  }
}

export class InventoryListDataSource extends DataSource<any>
{
    onTotalCountChanged: Subscription;
    total = 0;
    index = 0;

    constructor(
        private inventoryService: InventoryService
    )
    {
        super();
    }

    connect(): Observable<any[]>
    {
        this.onTotalCountChanged =
            this.inventoryService.onInventoryTransferListCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.total = total;
            });

        return this.inventoryService.onInventoryTransferListChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
    }
}

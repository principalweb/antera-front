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

import { InventoryItemList } from 'app/models';
import { delay } from 'rxjs/operators';


@Component({
  selector: 'inventory-item-list',
  templateUrl: './inventory-item-list.component.html',
  styleUrls: ['./inventory-item-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class InventoryItemListComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: InventoryListDataSource | null;
  displayedClumns = ['sku', 'color', 'size', 'min', 'max', 'reserved', 'quantity','save'];

  itemForm: FormGroup;

  item: InventoryItemList;

  price = 0;

  itemList: any[] = [];
  loading = false;

  filterForm: FormGroup;
  af: FormGroup;

  payload = {
      'offset': 0,
      'limit': 50,
      'order': 'productId',
      'orient': 'desc',
      'id': '',
      'term': {
          'sku': '',
          'color': '',
          'size': '',
          'quantity': '',
          'reserved': '',
          'min': '',
          'max': ''
      },
      'type': true,
      'completed': false
  };

  paginationTotal = 0;

  onInventoryListChangedSubscription: Subscription;
  onProductChangedSubscription: Subscription;

  constructor(
      private fb: FormBuilder,
      private inventoryService: InventoryService,
      private msg: MessageService
  ) {
    this.payload.id = '';
    this.filterForm = this.fb.group(this.payload.term);
    this.af = this.fb.group({});
      this.onProductChangedSubscription = this.inventoryService.onProductChanged.subscribe((item) => {
        if (item) {
            this.payload.id = item.id;
            this.item = item;
            this.loadData();
        }
      });
        this.onInventoryListChangedSubscription =
            this.inventoryService.onInventoryItemListChanged
            .subscribe(list => {
                this.itemList = list;
                this.initAf();
                this.loading = false;
            });
  }
  initAf()
  {
    this.af = this.fb.group({});
    each(this.itemList, (item) => {
        // this.af.addControl(item.binId+'_'+item.sku, new FormControl(0));
        this.af.addControl(item.binId+'_'+item.sku+'min', new FormControl(item.min));
        this.af.addControl(item.binId+'_'+item.sku+'max', new FormControl(item.max));
    });
  }
  ngOnInit() {
      this.inventoryService.getFob();
      this.dataSource = new InventoryListDataSource(
          this.inventoryService
      );
  }
  adjustSave(item) {
    const minqty = this.af.value[item.binId + '_' + item.sku+'min'];
    const maxqty = this.af.value[item.binId + '_' + item.sku+'max'];
    const price = this.af.value[item.binId + '_' + item.sku + '_price'];
    if (Number(maxqty) <0 || Number(minqty) < 0) {
      this.msg.show('Cannot set negative!', 'error');
      return;
    }
    this.loading = true;
    const p = {
      'p': this.item,
      'as': [
        {
          min:minqty,
          max:maxqty,
          sku: item.sku,
          bin: item.binId,
          site: item.siteId,           
          glaccount: this.af.value[item.binId + '_' + item.sku + '_gl']
        }
      ]
    };
    this.inventoryService.saveMinMaxInventory(p)
          .subscribe((response: any) => {
            if (response.error == '1') {
              this.msg.show(response.msg, 'error');
              this.loading = false;
            } else {
              this.msg.show(response.msg, 'success');
              this.inventoryService.emitProduct(this.item);
            }
          }, (err: any) => {
              this.msg.show('Error on saving!', 'error');
              this.loading = false;
          });
  }
  loadData() {
      this.loading = true;
      const payload = Object.assign({...this.payload}, this.filterForm.value);
      delete payload.term;
      this.payload.term = this.filterForm.value;
      this.inventoryService.getInventoryItemList(this.payload.id, payload);
  }

  initItemForm() {
    this.itemForm = this.fb.group({
    });
  }

  calculateChange(binId, sku,type) {
    const item = find(this.itemList, { binId: binId, sku: sku});
    let qty=0;
      if(type=="min"){
          qty = Number(this.af.value[binId + '_' + sku+'min']);
      }else{
          qty = Number(this.af.value[binId + '_' + sku]+'max');
      }
      if (item) {
        if(type=="min"){             
            item.min = qty;
        }else{
            item.max = qty;            
        }
        item.newQuantity = Number(item.quantity) + Number(qty);
       }
    }

  sortChange(ev) {
      this.payload.order = ev.active;
      this.payload.orient = ev.direction;
      if (ev.direction == '') {
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
            this.inventoryService.onInventoryItemListCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.total = total;
            });

        return this.inventoryService.onInventoryItemListChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
    }
}

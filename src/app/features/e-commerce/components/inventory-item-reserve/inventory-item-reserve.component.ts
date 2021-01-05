import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription ,  Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

import { fuseAnimations } from '@fuse/animations';

import { MessageService } from 'app/core/services/message.service';
import { InventoryService } from 'app/core/services/inventory.service';

import { InventoryAdjustItem, Site, Bin } from 'app/models';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'inventory-item-reserve',
  templateUrl: './inventory-item-reserve.component.html',
  styleUrls: ['./inventory-item-reserve.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class InventoryItemReserveComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  item: InventoryAdjustItem;
  onInventoryItemChangedSubscription: Subscription;
  onTotalCountChangedSubscription: Subscription;
  dataSource: InventoryReserveDataSource | null;

  filterForm: FormGroup;
  displayedColumns: string[] = ['sku', 'color', 'size', 'accountName', 'orderNo', 'reserved', 'reserveDate', 'remove'];

  payload = {
      "offset": 0,
      "limit": 50,
      "order": "orderNo",
      "orient": "asc",
      "term": {
          "id": "",
          "sku": "",
          "color": "",
          "size": "",
          "siteId": "",
          "binId": "",
          "orderNo": "",
          "accountName": "",
          "reserved": ""
      },
      "type": true,
      "completed": false
  };

  reserveList: any[]  = [];

  paginationTotal: number = 0;
  loading: boolean = false;

  constructor(
      private inventoryService: InventoryService,
      private fb: FormBuilder,
      private msg: MessageService
  ) {
    this.onInventoryItemChangedSubscription = this.inventoryService.onProductChanged.subscribe((item) => {
        if (item) {
            this.item = item;
            this.payload.term.id = this.item.id;
            this.filterForm = this.fb.group(this.payload.term);
            this.loadData();
        }
      });
      this.onTotalCountChangedSubscription =
          this.inventoryService.onInventoryReserveChanged
          .subscribe(list => {
            this.reserveList = list;
            this.selection.clear();
            this.loading = false;
          });
  }

  ngOnInit() {
    this.dataSource = new InventoryReserveDataSource(
        this.inventoryService
    );
  }

  loadData() {
      this.loading = true;
      this.payload.term = this.filterForm.value;
      this.inventoryService.getInventoryReserveCount({...this.payload});
      this.inventoryService.getInventoryReserve({...this.payload});
  }

  cancelReservations() {
    this.loading = true;
    const i = this.reserveList.map(t => t.trackId);
    this.inventoryService.cancelReserve(i)
      .subscribe((response: any) => {
        if (response.error == 1) {
          this.loading = false;
          this.msg.show(response.msg, 'error');
        } else {
          this.msg.show(response.msg, 'success');
          this.inventoryService.emitProduct(this.item);
        }
      }, (err:any) => {
        this.loading = false;
        this.msg.show('Error!', 'error');
      });
  }

  cancelReservation(e, item) {
    e.stopPropagation();
    this.loading = true;
    this.inventoryService.cancelReserve([item.trackId])
      .subscribe((response: any) => {
        if (response.error == 1) {
          this.loading = false;
          this.msg.show(response.msg, 'error');
        } else {
          this.msg.show(response.msg, 'success');
          this.inventoryService.emitProduct(this.item);
        }
      }, (err:any) => {
        this.loading = false;
        this.msg.show('Error!', 'error');
      });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  sortChange(ev) {
      this.payload.order = ev.active;
      this.payload.orient = ev.direction;
      if(ev.direction == '') {
          this.payload.order = 'orderNo';
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
    this.onInventoryItemChangedSubscription.unsubscribe();
    this.onTotalCountChangedSubscription.unsubscribe();
  }

}

export class InventoryReserveDataSource extends DataSource<any>
{
    onTotalCountChanged: Subscription;
    onListChanged: Subscription;
    total = 0;
    index = 0;
    data: any;

    constructor(
        private inventoryService: InventoryService
    )
    {
        super();
    }

    connect(): Observable<any[]>
    {
        this.onTotalCountChanged =
            this.inventoryService.onInventoryReserveCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.total = total;
            });

        this.onListChanged =
            this.inventoryService.onInventoryReserveChanged
                .subscribe(response => {
                    this.data = response;
                });

        return this.inventoryService.onInventoryReserveChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
        this.onListChanged.unsubscribe();
    }
}

import { Component, OnChanges, ViewEncapsulation, Input, ViewChild, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute, Params } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription,  Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { InventoryItemDetailsComponent } from '../inventory-item-details/inventory-item-details.component';
import { InventoryService } from 'app/core/services/inventory.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class InventoryListComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: InventoryListDataSource | null;
  dialogRef: MatDialogRef<InventoryItemDetailsComponent>;

    onIdChangedSubscription: Subscription;
    onInventoryListChanged: Subscription;

    filterForm: FormGroup;

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
            "quantity": "",
            "reserved": "",
            "min": "",
            "max": "",
            "inventoryDateAdded":''
        },
        "type": true,
        "completed": false
    };

    paginationTotal: number = 0;
    loading: boolean = false;

  constructor(
                private dialog: MatDialog,
                private inventoryService:InventoryService,
                private fb: FormBuilder,
                private activatedRoute: ActivatedRoute
                ) {
    this.payload.id = "";
    this.filterForm = this.fb.group(this.payload.term);
  }

  ngOnInit() {
      this.onIdChangedSubscription = this.activatedRoute.params.subscribe((params:Params) => {
          if(params['id']) {
              this.payload.id = params['id'];
          }
      });
      this.onInventoryListChanged = this.inventoryService.onInventoryListChanged.subscribe((res) => {
          this.loading = false;
      });
      this.loadData();
      this.dataSource = new InventoryListDataSource(
          this.inventoryService
      );
  }

  ngOnChanges(changes) {
    if (changes.data) {
      //this.dataSource.data = changes.data.currentValue;
    }
  }

  ngAfterViewInit() {
  }

  openDetialsDialog(item) {

    this.dialogRef = this.dialog.open(InventoryItemDetailsComponent, {
      panelClass: 'inventory-item-details-dialog',
      data: item ,
      width: '100vw',
      height: '90vh',
    });
    this.dialogRef.afterClosed()
        .subscribe((response: FormGroup) => {
            this.loadData();
        });

  }

  getDisplayedClumns() {
      return ['productId', 'inhouseId', 'productName', 'min', 'max', 'quantity', 'reserved','inventoryDateAdded'];
  }

  loadData() {
      this.payload.term = this.filterForm.value;
      this.loading = true;
      this.inventoryService.getInventoryListCount({...this.payload});
      this.inventoryService.getInventoryList({...this.payload});
      this.inventoryService.getProductInventoryValue();
  }

  sortChange(ev) {
      this.payload.order = ev.active;
      this.payload.orient = ev.direction;
      if(ev.direction == "") {
          this.payload.order = "productId";
          this.payload.orient = "asc";
      }
      this.loadData();
  }

  paginate(ev) {
      this.payload.offset = ev.pageIndex;
      this.payload.limit = ev.pageSize;
      this.loadData();
  }

  ngOnDestroy() {
    this.onIdChangedSubscription.unsubscribe();
    this.onInventoryListChanged.unsubscribe();
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
            this.inventoryService.onInventoryListCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.total = total;
            });

        return this.inventoryService.onInventoryListChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
    }
}

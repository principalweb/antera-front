import { Component, OnChanges, ViewEncapsulation, Input, ViewChild, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription,  Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { InventoryItemDetailsComponent } from '../inventory-item-details/inventory-item-details.component';
import { delay } from 'rxjs/operators';
import { EcommerceProductService } from '../../product/product.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-product-sales-order-history',
  templateUrl: './product-sales-order-history.component.html',
  styleUrls: ['./product-sales-order-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProductSalesOrderHistoryComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource:  ProductSalesOrderHistoryListDataSource | null;
  dialogRef: MatDialogRef<InventoryItemDetailsComponent>;

    onIdChangedSubscription: Subscription;
    onInventoryListChanged: Subscription;
    onProductSalesOrderHistoryListChanged: Subscription;

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
                private productService: EcommerceProductService,
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
      this.onProductSalesOrderHistoryListChanged = this.productService.onProductSalesOrderHistoryListChanged.subscribe((res) => {
          this.loading = false;
      });
      this.loadData();
      this.dataSource = new ProductSalesOrderHistoryListDataSource(
          this.productService
      );
      console.log("this.dataSource",this.dataSource)
  }

  ngOnChanges(changes) {
    if (changes.data) {
     // this.dataSource.data = changes.data.currentValue;
    }
  }

  ngAfterViewInit() {
  }

  getDisplayedClumns() {
      return ['orderNumber', 'orderDate', 'status', 'accountName', 'quantity', 'reservedQty', 'backorderQty','shipDate'];
  }

  loadData() {
      this.payload.term = this.filterForm.value;
      this.loading = true;
      this.productService.getProductSalesOrderHistoryCount({...this.payload});
      this.productService.getProductSalesOrderHistory({...this.payload});
      //this.inventoryService.getProductInventoryValue();
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
    this.onProductSalesOrderHistoryListChanged.unsubscribe();
  }

}

export class ProductSalesOrderHistoryListDataSource extends DataSource<any>
{
    onTotalCountChanged: Subscription;
    total = 0;
    index = 0;

    constructor(
        private productService: EcommerceProductService
    )
    {
        super();
    }

    connect(): Observable<any[]>
    {
        this.onTotalCountChanged =
            this.productService.onProductSalesOrderHistoryListCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.total = total;
            });

        return this.productService.onProductSalesOrderHistoryListChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
    }
}

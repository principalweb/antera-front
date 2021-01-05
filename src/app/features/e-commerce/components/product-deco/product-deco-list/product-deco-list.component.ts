import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';

import { ArtworksService } from 'app/core/services/artworks.service';
import { ProductDecoDesigns } from 'app/models';
import { EcommerceProductService } from 'app/features/e-commerce/product/product.service';
import { ProductDecoFormComponent } from '../product-deco-form/product-deco-form.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-product-deco-list',
  templateUrl: './product-deco-list.component.html',
  styleUrls: ['./product-deco-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class ProductDecoListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['select', 'customerName', 'designName', 'storeName', 'autoAttach'];

  dataSource: ListDataSource | null;
  filterForm: FormGroup;
  loading: boolean = false;
    
  dialogRef: MatDialogRef<ProductDecoFormComponent>;
    
  onTotalCountChanged: Subscription;
  onDataRemoved: Subscription;
  onProductChanged: Subscription;
  selection = new SelectionModel<ProductDecoDesigns>(true, []);
  dataId: string = '0';

  payload = {
        "offset": 0,
        "limit": 50,
        "order": "customerName",
        "orient": "asc",
        "id": "",
        "term": {
            "productId": "",
            "customerName": "",
            "storeName": "",
            "autoAttach": "",
            "designName": ""
        }
  };
  enabled = [
    {name:"All",value:""},
    {name:"Yes",value:"1"},
    {name:"No",value:"0"},
  ];

  constructor(
              private dataService: ArtworksService,
              private fb: FormBuilder,
              private productService: EcommerceProductService,
              public dialog: MatDialog
              ) {
    this.filterForm = this.fb.group(this.payload.term);

    this.onTotalCountChanged =
        this.dataService.onProductDecoListCountChanged
            .subscribe(total => {
                this.selection.clear();
                this.loading = false;
            });

    this.onDataRemoved =
        this.dataService.onProductDecoDataRemoved
            .subscribe(total => {
                this.loading = false;
                this.loadData();
            });
      this.onProductChanged =
        this.productService.onProductChanged
            .subscribe((data:any) => {
                this.dataId = data.id;
                this.payload.term.productId = this.dataId;
            });
    this.loadData();
  }

  ngOnInit() {
        this.dataSource = new ListDataSource(
            this.dataService
        );
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

  deleteSelected() {
      const selectedId = this.selection.selected.map(obj => { return {id:obj.id};});
      if(selectedId.length > 0) {
        this.loading = true;
        this.dataService.removeProductDecoData(selectedId);
      }
  }

  clearFilters() {
    this.filterForm = this.fb.group(
                                    {
                                    "customerName": "",
                                    "designName": "",
                                    "storeName": "",
                                    "autoAttach": "",
                                    "productId": this.dataId
                                    }
                                );
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.payload.term = this.filterForm.value;
    this.payload.term.productId = this.dataId;
    this.dataService.getProductDecoCount({...this.payload});
    this.dataService.getProductDecoList({...this.payload});
  }

  sortChange(ev) {
      this.payload.order = ev.active;
      this.payload.orient = ev.direction;
      if(ev.direction == "") {
          this.payload.order = "customerName";
          this.payload.orient = "asc";
      }
      this.loadData();
  }

  paginate(ev) {
      this.payload.offset = ev.pageIndex;
      this.payload.limit = ev.pageSize;
      this.loadData();
  }

  showDetail(data) {
        this.dialogRef = this.dialog.open(ProductDecoFormComponent, {
            panelClass: 'app-product-deco-form',
            data: data 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.loadData();
            });
  }

  ngOnDestroy() {
      this.onTotalCountChanged.unsubscribe();
      this.onProductChanged.unsubscribe();
  }

}

export class ListDataSource extends DataSource<any>
{
    total = 0;
    data:any;

    onTotalCountChanged: Subscription;
    onListChanged: Subscription;

    constructor(
        private dataService: ArtworksService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<ProductDecoDesigns[]>
    {
        const displayDataChanges = [
            this.dataService.onProductDecoListChanged
        ];

        this.onTotalCountChanged =
            this.dataService.onProductDecoListCountChanged.pipe(
                delay(100),
            ).subscribe((total:any) => {
                this.total = total.count;
            });

        this.onListChanged =
            this.dataService.onProductDecoListChanged
                .subscribe(response => {
                    this.data = response;
                });

        return this.dataService.onProductDecoListChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
        this.onListChanged.unsubscribe();
    }
}

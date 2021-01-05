import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';

import { StoreService } from 'app/core/services/store.service';
import { StoreFormComponent } from 'app/features/store/store-form/store-form.component';
import { Store } from 'app/models';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class StoreListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['select', 'name', 'url', 'enabled'];

  dataSource: StoreDataSource | null;
  filterForm: FormGroup;
  loading: boolean = false;
    
  dialogRef: MatDialogRef<StoreFormComponent>;
    
  onTotalCountChanged: Subscription;
  onRemoved: Subscription;
  selection = new SelectionModel<Store>(true, []);

  payload = {
        "offset": 0,
        "limit": 50,
        "order": "name",
        "orient": "asc",
        "id": "",
        "term": {
            "name": "",
            "url": "",
            "enabled": ""
        }
  };
  enabled = [
            {name:"All",value:""},
            {name:"Enabled",value:"1"},
            {name:"Disabled",value:"0"},
            ];

  constructor(
              private storeService: StoreService,
              private fb: FormBuilder,
              public dialog: MatDialog
              ) {
    this.filterForm = this.fb.group(this.payload.term);

    this.onTotalCountChanged =
        this.storeService.onStoreListCountChanged
            .subscribe(total => {
                this.selection.clear();
                this.loading = false;
            });

    this.onRemoved =
        this.storeService.onRemoved
            .subscribe(total => {
                this.loading = false;
                this.loadData();
            });
    this.loadData();
  }

  ngOnInit() {
        this.dataSource = new StoreDataSource(
            this.storeService
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
        this.storeService.removeStores(selectedId);
      }
  }

  clearFilters() {
    this.filterForm = this.fb.group(
                                    {
                                    "name": "",
                                    "url": "",
                                    "enabled": ""
                                    }
                                );
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.payload.term = this.filterForm.value;
    this.storeService.getStoreCount({...this.payload});
    this.storeService.getStoreList({...this.payload});
  }

  sortChange(ev) {
      this.payload.order = ev.active;
      this.payload.orient = ev.direction;
      if(ev.direction == "") {
          this.payload.order = "name";
          this.payload.orient = "asc";
      }
      this.loadData();
  }

  paginate(ev) {
      this.payload.offset = ev.pageIndex;
      this.payload.limit = ev.pageSize;
      this.loadData();
  }

  showStoreDetail(store) {
        this.dialogRef = this.dialog.open(StoreFormComponent, {
            panelClass: 'app-store-form',
            data: store 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.loadData();
            });
  }

  ngOnDestroy() {
        this.onTotalCountChanged.unsubscribe();
  }

}

export class StoreDataSource extends DataSource<any>
{
    total = 0;
    data:any;

    onTotalCountChanged: Subscription;
    onListChanged: Subscription;

    constructor(
        private storeService: StoreService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Store[]>
    {
        const displayDataChanges = [
            this.storeService.onStoreListChanged
        ];

        this.onTotalCountChanged =
            this.storeService.onStoreListCountChanged.pipe(
                delay(100)
            ).subscribe(total => {
                this.total = total;
            });

        this.onListChanged =
            this.storeService.onStoreListChanged
                .subscribe(response => {
                    this.data = response;
                });

        return this.storeService.onStoreListChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
        this.onListChanged.unsubscribe();
    }
}

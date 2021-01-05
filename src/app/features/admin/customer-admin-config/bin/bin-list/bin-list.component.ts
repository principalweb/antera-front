import { Component, OnInit, OnDestroy, Input, ViewEncapsulation, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';

import { InventoryService } from 'app/core/services/inventory.service';
import { LocalBin } from 'app/models';
import { BinFormComponent } from '../bin-form/bin-form.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-bin-list',
  templateUrl: './bin-list.component.html',
  styleUrls: ['./bin-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class BinListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() siteId: string;
  displayedColumns: string[] = ['select', 'name'];

  dataSource: ListDataSource | null;
  filterForm: FormGroup;
  loading: boolean = false;
    
  dialogRef: MatDialogRef<BinFormComponent>;
    
  onTotalCountChanged: Subscription;
  onDataRemoved: Subscription;
  selection = new SelectionModel<LocalBin>(true, []);

  payload = {
        "offset": 0,
        "limit": 10,
        "order": "name",
        "orient": "asc",
        "id": "",
        "term": {
            "name": "",
            "siteId": ""
        }
  };

  constructor(
              private dataService: InventoryService,
              private fb: FormBuilder,
              public dialog: MatDialog
              ) {
    this.filterForm = this.fb.group(this.payload.term);

    this.onTotalCountChanged =
        this.dataService.onBinListCountChanged
            .subscribe(total => {
                this.selection.clear();
                this.loading = false;
            });

    this.onDataRemoved =
        this.dataService.onBinDataRemoved
            .subscribe(total => {
                this.loading = false;
                this.loadData();
            });
    this.loadData();
  }

  ngOnInit() {
    this.payload.term.siteId = this.siteId;
    this.filterForm = this.fb.group(this.payload.term);
    this.loadData();
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
        this.dataService.removeBinData(selectedId);
      }
  }

  clearFilters() {
    this.filterForm = this.fb.group(
                                    {
                                    "name": "",
                                    "siteId": this.siteId
                                    }
                                );
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.payload.term = this.filterForm.value;
    this.dataService.getBinCount({...this.payload});
    this.dataService.getBinList({...this.payload});
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

  showDetail(data) {
        this.dialogRef = this.dialog.open(BinFormComponent, {
            panelClass: 'app-bin-form',
            data: data 
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

export class ListDataSource extends DataSource<any>
{
    total = 0;
    data:any;

    onTotalCountChanged: Subscription;
    onListChanged: Subscription;

    constructor(
        private dataService: InventoryService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<LocalBin[]>
    {
        const displayDataChanges = [
            this.dataService.onBinListChanged
        ];

        this.onTotalCountChanged =
            this.dataService.onBinListCountChanged.pipe(
                delay(100),
            ).subscribe((total:any) => {
                this.total = total.count;
            });

        this.onListChanged =
            this.dataService.onBinListChanged
                .subscribe(response => {
                    this.data = response;
                });

        return this.dataService.onBinListChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
        this.onListChanged.unsubscribe();
    }
}

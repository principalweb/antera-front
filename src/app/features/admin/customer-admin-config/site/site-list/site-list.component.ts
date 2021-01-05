import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';

import { InventoryService } from 'app/core/services/inventory.service';
import { LocalSite } from 'app/models';
import { SiteFormComponent } from '../site-form/site-form.component';
import { BinComponent } from '../../bin/bin.component';
import { delay } from 'rxjs/operators';

import { MessageService } from 'app/core/services/message.service';


@Component({
  selector: 'app-site-list',
  templateUrl: './site-list.component.html',
  styleUrls: ['./site-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class SiteListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['select', 'name', 'defaultSite', 'bin'];

  dataSource: ListDataSource | null;
  filterForm: FormGroup;
  loading: boolean = false;
    
  dialogRef: MatDialogRef<SiteFormComponent>;
  dialogRefBin: MatDialogRef<BinComponent>;
    
  onTotalCountChanged: Subscription;
  onDataRemoved: Subscription;
  selection = new SelectionModel<LocalSite>(true, []);

  payload = {
        "offset": 0,
        "limit": 50,
        "order": "name",
        "orient": "asc",
        "id": "",
        "term": {
            "name": ""
        }
  };

  constructor(
              private dataService: InventoryService,
              private fb: FormBuilder,
              public dialog: MatDialog,
              private msg: MessageService
              ) {
    this.filterForm = this.fb.group(this.payload.term);

    this.onTotalCountChanged =
        this.dataService.onSiteListCountChanged
            .subscribe(total => {
                this.selection.clear();
                this.loading = false;
            });

    this.onDataRemoved =
        this.dataService.onSiteDataRemoved
            .subscribe(total => {
                this.loading = false;
                this.loadData();
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
        this.dataService.removeSiteData(selectedId);
      }
  }

  clearFilters() {
    this.filterForm = this.fb.group(
                                    {
                                    "name": ""
                                    }
                                );
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.payload.term = this.filterForm.value;
    this.dataService.getSiteCount({...this.payload});
    this.dataService.getSiteList({...this.payload});
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
        Object.assign(data, {title: 'Edit Site'});
        this.dialogRef = this.dialog.open(SiteFormComponent, {
            panelClass: 'app-site-form',
            data: data 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.loadData();
            });
  }

  showBins(e, data) {
      e.stopPropagation();
        this.dialogRefBin = this.dialog.open(BinComponent, {
            panelClass: 'app-bin',
            data: data,
            height: '85vh'
        });
        this.dialogRefBin.afterClosed()
            .subscribe((response) => {
                //this.loadData();
            });
  }

  updateDefault(e, id) {
      e.stopPropagation();
      this.dataService.updateSiteDefault(id)
        .subscribe((response:any) => {
            if(response.msg) {
              this.msg.show(response.msg, 'error');
            }
            this.loadData();
        }, err => {
          this.msg.show(err.message, 'error');
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
    connect(): Observable<LocalSite[]>
    {
        const displayDataChanges = [
            this.dataService.onSiteListChanged
        ];

        this.onTotalCountChanged =
            this.dataService.onSiteListCountChanged.pipe(
                delay(100),
            ).subscribe((total:any) => {
                this.total = total.count;
            });

        this.onListChanged =
            this.dataService.onSiteListChanged
                .subscribe(response => {
                    this.data = response;
                });

        return this.dataService.onSiteListChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
        this.onListChanged.unsubscribe();
    }
}

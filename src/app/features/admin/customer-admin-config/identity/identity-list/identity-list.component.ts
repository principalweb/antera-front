import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';

import { IdentityService } from 'app/core/services/identity.service';
import { Identity } from 'app/models';
import { IdentityFormComponent } from '../identity-form/identity-form.component';
import { delay } from 'rxjs/operators';


@Component({
  selector: 'app-identity-list',
  templateUrl: './identity-list.component.html',
  styleUrls: ['./identity-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class IdentityListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['select', 'name'];

  dataSource: ListDataSource | null;
  filterForm: FormGroup;
  loading: boolean = false;
    
  dialogRef: MatDialogRef<IdentityFormComponent>;
    
  onTotalCountChanged: Subscription;
  onDataRemoved: Subscription;
  selection = new SelectionModel<Identity>(true, []);

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
              private dataService: IdentityService,
              private fb: FormBuilder,
              public dialog: MatDialog
              ) {
    this.filterForm = this.fb.group(this.payload.term);

    this.onTotalCountChanged =
        this.dataService.onListCountChanged
            .subscribe(total => {
                this.selection.clear();
                this.loading = false;
            });

    this.onDataRemoved =
        this.dataService.onDataRemoved
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
        this.dataService.removeData(selectedId);
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
    this.dataService.getCount({...this.payload});
    this.dataService.getList({...this.payload});
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
        Object.assign(data,{title: 'Edit Partner'})
        this.dialogRef = this.dialog.open(IdentityFormComponent, {
            panelClass: 'app-identity-form',
            data: data 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.loadData();
            });
  }

  ngOnDestroy() {
        this.onTotalCountChanged.unsubscribe();
        this.onDataRemoved.unsubscribe();
  }

}

export class ListDataSource extends DataSource<any>
{
    total = 0;
    data:any;

    onTotalCountChanged: Subscription;
    onListChanged: Subscription;

    constructor(
        private dataService: IdentityService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Identity[]>
    {
        const displayDataChanges = [
            this.dataService.onListChanged
        ];

        this.onTotalCountChanged =
            this.dataService.onListCountChanged.pipe(
                delay(100)
            ).subscribe((total:any) => {
                this.total = total.count;
            });

        this.onListChanged =
            this.dataService.onListChanged
                .subscribe(response => {
                    this.data = response;
                });

        return this.dataService.onListChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
        this.onListChanged.unsubscribe();
    }
}

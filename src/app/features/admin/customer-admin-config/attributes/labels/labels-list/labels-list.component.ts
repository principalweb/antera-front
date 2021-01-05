import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { ProductService } from 'app/core/services/product.service';

import { SizeLabel } from 'app/models';
import { delay } from 'rxjs/operators';
import { LabelsFormComponent } from '../labels-form/labels-form.component';

@Component({
  selector: 'labels-list',
  templateUrl: './labels-list.component.html',
  styleUrls: ['./labels-list.component.scss'],
  animations   : fuseAnimations
})
export class LabelsListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['select', 'name'];

  dataSource: LabelsDataSource | null;
  filterForm: FormGroup;
  loading: boolean = false;

  dialogRef: MatDialogRef<LabelsFormComponent>;

  onTotalCountChanged: Subscription;
  onDataRemoved: Subscription;
  selection = new SelectionModel<SizeLabel>(true, []);

  payload = {
      'offset': 0,
      'limit': 50,
      'order': 'name',
      'orient': 'asc',
      'id': '',
      'term': {
          'name': '',
      }
  };

  constructor(
    private fb: FormBuilder,
    private dataService: ProductService,
    public dialog: MatDialog
  ) {
    this.filterForm = this.fb.group(this.payload.term);
    this.onTotalCountChanged =
        this.dataService.onLabelListCountChanged
          .subscribe(total => {
            this.selection.clear();
            this.loading = false;
        });

    this.onDataRemoved =
        this.dataService.onLabelsDataRemoved
            .subscribe(total => {
                this.loading = false;
                this.loadData();
            });
  }

  ngOnInit() {
    this.dataSource = new LabelsDataSource(
      this.dataService
    );
    this.loadData();
  }

  loadData() {
      this.loading = true;
      this.payload.term = this.filterForm.value;
      this.dataService.getLabelsList({...this.payload});
      this.dataService.getLabelsListCount({...this.payload});
  }

  sortChange(ev) {
      this.payload.order = ev.active;
      this.payload.orient = ev.direction;
      if (ev.direction == '') {
          this.payload.order = 'name';
          this.payload.orient = 'asc';
      }
      this.loadData();
  }

  paginate(ev) {
      this.payload.offset = ev.pageIndex;
      this.payload.limit = ev.pageSize;
      this.loadData();
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
      const selectedId = this.selection.selected.map(obj => {
        return { id: obj.id};
      });
      if (selectedId.length > 0) {
        this.loading = true;
        this.dataService.removeLabelsData(selectedId);
      }
  }

  clearFilters() {
    this.filterForm = this.fb.group(
                                    {
                                    'name': ''
                                    }
                                );
    this.loadData();
  }

  showDetail(data) {
        this.dialogRef = this.dialog.open(LabelsFormComponent, {
          panelClass: 'antera-details-dialog',
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

export class LabelsDataSource extends DataSource<any>
{
    total = 0;
    data: SizeLabel[];

    onTotalCountChanged: Subscription;
    onListChanged: Subscription;

    constructor(
        private dataService: ProductService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<SizeLabel[]>
    {
        const displayDataChanges = [
            this.dataService.onLabelListChanged
        ];

        this.onTotalCountChanged =
            this.dataService.onLabelListCountChanged.pipe(
                delay(100)
            ).subscribe(total => {
                this.total = total.count;
            });

        this.onListChanged =
            this.dataService.onLabelListChanged
                .subscribe(response => {
                    this.data = response;
                });

        return this.dataService.onLabelListChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
    }
}

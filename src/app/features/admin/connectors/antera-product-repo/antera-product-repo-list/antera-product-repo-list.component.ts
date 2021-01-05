import { MatDialog } from '@angular/material/dialog';
import { AnteraProductRepoFormComponent } from './../antera-product-repo-form/antera-product-repo-form.component';
import { AnteraProductRepo, AnteraProductRepoFilter, AnteraSort, AnteraMeta } from 'app/models';
import { Store, select } from '@ngrx/store';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { fuseAnimations } from '@fuse/animations';

import * as fromAnteraProductRepo from '../store/antera-product-repo.reducer';
import * as AnteraProductRepoActions from '../store/antera-product-repo.actions';
import { MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'antera-product-repo-list',
  templateUrl: './antera-product-repo-list.component.html',
  styleUrls: ['./antera-product-repo-list.component.scss'],
  animations: fuseAnimations,
})
export class AnteraProductRepoListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['select', 'name', 'url', 'enabled'];

  dataSource: MatTableDataSource<AnteraProductRepo> | null;
  filterForm: FormGroup;

  dialogRef: MatDialogRef<AnteraProductRepoFormComponent>;

  selection = new SelectionModel<AnteraProductRepo>(true, []);

  payload: {
    filter: AnteraProductRepoFilter,
    sort: AnteraSort,
    meta: AnteraMeta,
  } = {
    filter: {...fromAnteraProductRepo.initialState.filter},
    sort: {...fromAnteraProductRepo.initialState.sort},
    meta: {...fromAnteraProductRepo.initialState.meta},
  };

  constructor(
    private store: Store<any>,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({});
    // TODO test state is working fine
      this.store.pipe(select('anteraProductRepo'))
      .subscribe((state) => {
        this.payload.filter = {...state.filter};
        this.payload.sort = {...state.sort};
        this.payload.meta = {...state.meta};
        this.filterForm = this.fb.group(this.payload.filter.terms);
        this.dataSource = new MatTableDataSource([...state.list]);
     });
  }

  ngOnInit() {
    //this.dataSource = new ListDataSource(this.store);
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
      // const selectedId = this.selection.selected.map(obj => { return {id:obj.id};});
      // if(selectedId.length > 0) {
      //   this.loading = true;
      //   this.dataService.removeData(selectedId);
      // }
  }

  clearFilters() {
    this.payload.sort = {...fromAnteraProductRepo.initialState.sort};
    this.payload.meta = {...fromAnteraProductRepo.initialState.meta};
    this.payload.filter = {...fromAnteraProductRepo.initialState.filter};
    this.filterForm = this.fb.group(this.payload.filter.terms);
    this.loadData();
  }

  loadData() {
    this.store.dispatch(new AnteraProductRepoActions.LoadList({filter: {terms: this.filterForm.value}, meta: this.payload.meta, sort: this.payload.sort}));
  }

  sortChange(ev) {
    this.payload.sort.order = ev.active;
    this.payload.sort.orient = ev.direction;
    if (ev.direction === '') {
      this.payload.sort.order = 'name';
      this.payload.sort.orient = 'asc';
    }
    this.loadData();
  }

  paginate(ev) {
    this.payload.meta.currentPage = ev.pageIndex;
    this.payload.meta.perPage = ev.pageSize;
    this.loadData();
  }

  showDetail(data) {
    this.store.dispatch(new AnteraProductRepoActions.EditStart(data.id));
  }
}

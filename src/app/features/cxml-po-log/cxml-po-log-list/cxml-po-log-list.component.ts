import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Store, select } from '@ngrx/store';
import { SelectionModel } from '@angular/cdk/collections';
import { FormGroup, FormBuilder } from '@angular/forms';

import { AnteraSort, AnteraMeta } from 'app/models';
import { CxmlPoLog, CxmlPoLogFilter, CxmlPoStatusList } from '../models/cxml-po-log';

import * as fromCxmlPoLog from '../store/cxml-po-log.reducer';
import * as CxmlPoLogActions from '../store/cxml-po-log.actions';

@Component({
  selector: 'cxml-po-log-list',
  templateUrl: './cxml-po-log-list.component.html',
  styleUrls: ['./cxml-po-log-list.component.scss']
})
export class CxmlPoLogListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['poNo', 'errors', 'createdDate', 'status'];

  dataSource: MatTableDataSource<CxmlPoLog> | null;
  filterForm: FormGroup;

  selection = new SelectionModel<CxmlPoLog>(true, []);

  payload: {
    filter: CxmlPoLogFilter,
    sort: AnteraSort,
    meta: AnteraMeta,
  } = {
    filter: {...fromCxmlPoLog.initialState.filter},
    sort: {...fromCxmlPoLog.initialState.sort},
    meta: {...fromCxmlPoLog.initialState.meta},
  };

  statusList: CxmlPoStatusList[] = [
    {
      id: false,
      value: 'Not Processed'
    },
    {
      id: true,
      value: 'Processed'
    },
  ];

  constructor(
    private store: Store<fromCxmlPoLog.State>,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({});
    // TODO test state is working fine
    this.store.pipe(select((state: fromCxmlPoLog.State) => state))
      .subscribe((state: fromCxmlPoLog.State) => {
        this.payload.filter = {...state.filter};
        this.payload.sort = {...state.sort};
        this.payload.meta = {...state.meta};
        this.filterForm = this.fb.group(this.payload.filter.terms);
        this.dataSource = new MatTableDataSource([...state.list]);
      });
  }

  ngOnInit() {
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
    this.payload.sort = {...fromCxmlPoLog.initialState.sort};
    this.payload.meta = {...fromCxmlPoLog.initialState.meta};
    this.payload.filter = {...fromCxmlPoLog.initialState.filter};
    this.filterForm = this.fb.group(this.payload.filter.terms);
    this.loadData();
  }

  loadData() {
    const terms = this.filterForm.value;
    this.store.dispatch(new CxmlPoLogActions.LoadList({filter: {terms: terms, operator: this.payload.filter.operator}, meta: this.payload.meta, sort: this.payload.sort}));
  }

  sortChange(ev) {
    this.payload.sort.order = ev.active;
    this.payload.sort.orient = ev.direction;
    if (ev.direction === '') {
      this.payload.sort.order = 'createdDate';
      this.payload.sort.orient = 'desc';
    }
    this.loadData();
  }

  paginate(ev) {
    this.payload.meta.currentPage = ev.pageIndex;
    this.payload.meta.perPage = ev.pageSize;
    this.loadData();
  }

  showForm(data) {
    this.store.dispatch(new CxmlPoLogActions.EditStart(data.id));
  }

  process(id) {
    this.store.dispatch(new CxmlPoLogActions.Process(id));
  }
}

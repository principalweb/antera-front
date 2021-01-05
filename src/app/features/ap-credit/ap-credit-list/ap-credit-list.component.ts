import { Store, select } from '@ngrx/store';
import { SelectionModel } from '@angular/cdk/collections';
import { ApCredit, ApCreditFilter, AnteraSort, AnteraMeta } from 'app/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import * as fromApCredit from '../store/ap-credit.reducer';
import * as ApCreditActions from '../store/ap-credit.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'ap-credit-list',
  templateUrl: './ap-credit-list.component.html',
  styleUrls: ['./ap-credit-list.component.scss']
})
export class ApCreditListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() vendorId = '';

  displayedColumns: string[] = ['select', 'reference', 'account', 'pos', 'notes', 'amount', 'balance', 'created'];

  dataSource: MatTableDataSource<ApCredit> | null;
  filterForm: FormGroup;

  selection = new SelectionModel<ApCredit>(true, []);

  payload: {
    filter: ApCreditFilter,
    sort: AnteraSort,
    meta: AnteraMeta,
  } = {
    filter: {...fromApCredit.initialState.filter},
    sort: {...fromApCredit.initialState.sort},
    meta: {...fromApCredit.initialState.meta},
  };

  constructor(
    private store: Store<any>,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.filterForm = this.fb.group({});
    // TODO test state is working fine
    this.store.pipe(select('apCredit'))
      .subscribe(state => {
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
    const selectedId = this.selection.selected.map(obj => {
      return obj.id;
    });
    if (selectedId.length > 0) {
      this.store.dispatch(new ApCreditActions.DeleteData(selectedId));
    }
  }

  clearFilters() {
    this.payload.sort = {...fromApCredit.initialState.sort};
    this.payload.meta = {...fromApCredit.initialState.meta};
    this.payload.filter = {...fromApCredit.initialState.filter};
    this.filterForm = this.fb.group(this.payload.filter.terms);
    this.loadData();
  }

  loadData() {
    const terms = this.filterForm.value;
    terms.accountId = this.vendorId;
    this.store.dispatch(new ApCreditActions.LoadList({filter: {terms: terms}, meta: this.payload.meta, sort: this.payload.sort}));
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

  showForm(data) {
    this.router.navigate(['/ap-credit/update/' + data.id]);
    // this.store.dispatch(new ApCreditActions.EditStart(data.id));
  }

  getUniqueOrderNumber(lines) {
    const pos = [];
    lines.forEach( e =>
      pos.indexOf(e.order.number) < 0  && pos.push(e.order.number)
    );
    return pos.join(', ');
  }
}

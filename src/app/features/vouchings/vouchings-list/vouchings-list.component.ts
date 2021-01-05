import { GlobalConfigService } from 'app/core/services/global.service';
import { MessageService } from 'app/core/services/message.service';
import { QbService } from 'app/core/services/qb.service';
import { Component, OnInit, Input, OnDestroy, ViewEncapsulation, ViewChild, Output, EventEmitter } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';

import { VouchingsService } from '../vouchings.service';
import { VouchingList } from 'app/models';
import { VouchingFormComponent } from '../vouching-form/vouching-form.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-vouchings-list',
  templateUrl: './vouchings-list.component.html',
  styleUrls: ['./vouchings-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class VouchingsListComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['select', 'invoiceNumber', 'vouchedDate', 'paidAmount', 'invoiceCredit', 'invoiceTotal'];
  @Input() vendorId = '';
  @Input() orders: any[] = [];
  @Input() vcMode: boolean;
  @Output() reload = new EventEmitter<boolean>();
  @Output() viewInvoice = new EventEmitter<string>();

  dataSource: ListDataSource | null;
  filterForm: FormGroup;
  loading = false;

  dialogRef: MatDialogRef<VouchingFormComponent>;

  onTotalCountChanged: Subscription;
  onDataRemoved: Subscription;
  selection = new SelectionModel<VouchingList>(true, []);

  payload = {
        'offset': 0,
        'limit': 50,
        'order': 'invoiceNumber',
        'orient': 'asc',
        'id': '',
        'term': {
            'invoiceNumber': '',
            'totalTaxOnPo': '',
            'vendorId': '',
            'orders': [],
        }
  };
  onGstTaxStatusChanged: Subscription;
  onQbActiveChanged: Subscription;
  qbEnabled = '';

  decimalConfig: string;

  constructor(
              private dataService: VouchingsService,
              private fb: FormBuilder,
              private qb: QbService,
              private msg: MessageService,
              public globalConfig: GlobalConfigService,
              public dialog: MatDialog
              ) {
    this.onQbActiveChanged = this.qb.onQbActiveChanged
            .subscribe(response => {
              this.qbEnabled = this.qb.getActiveConnector();
              if (this.qbEnabled !== '') {
                this.displayedColumns.push('qbsync');
              }
            });
    this.onGstTaxStatusChanged =
        this.dataService.onGstTaxStatusChanged
            .subscribe(status => {
              if (status.enabled) {
                this.displayedColumns.push('totalTaxOnPo');
              }
            });
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
                this.reload.emit(true);
            });
  }

  ngOnInit() {
    this.decimalConfig = '1.2-' + this.globalConfig.config.sysconfigOrderFormCostDecimalUpto;
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
      const selectedId = this.selection.selected.map(obj => {
        return obj.id;
      });
      if (selectedId.length > 0) {
        this.loading = true;
        this.dataService.removeData(selectedId);
      }
  }

  clearFilters() {
    this.filterForm = this.fb.group(
                                    {
                                    "categoryName": ""
                                    }
                                );
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.payload.term = this.filterForm.value;
    this.payload.term.vendorId = this.vendorId;
    this.payload.term.orders = this.orders;
    this.dataService.getCount({...this.payload});
    this.dataService.getList({...this.payload});
  }

  sortChange(ev) {
      this.payload.order = ev.active;
      this.payload.orient = ev.direction;
      if(ev.direction == "") {
          this.payload.order = "catName";
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
    this.viewInvoice.emit(data.id);
  }

  qbPush(e, id) {
    e.stopPropagation();
    this.loading = true;
    this.qb.pushEntity('Vouching', id)
      .then((res: any) => {
        if (res.code && res.code === "200") {
          this.msg.show(res.msg, 'success');
        } else if (res.code) {
          this.msg.show(res.msg, 'error');
        } else {
          this.msg.show('Update completed', 'success');
        }
        this.loading = false;
        this.loadData();
      }).catch((err) => {
        this.loading = false;
        this.msg.show(err.message, 'error');
      });
  }

  ngOnDestroy() {
    this.onQbActiveChanged.unsubscribe();
    this.onTotalCountChanged.unsubscribe();
    this.onGstTaxStatusChanged.unsubscribe();
  }

}

export class ListDataSource extends DataSource<any>
{
    total = 0;
    data:any;

    onTotalCountChanged: Subscription;
    onListChanged: Subscription;

    constructor(
        private dataService: VouchingsService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<VouchingList[]>
    {
        const displayDataChanges = [
            this.dataService.onListChanged
        ];

        this.onTotalCountChanged =
            this.dataService.onListCountChanged.pipe(
                delay(100),
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

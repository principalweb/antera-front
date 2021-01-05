import { fx2Str } from 'app/utils/utils';
import { Store, select } from '@ngrx/store';
import { GlobalConfigService } from './../../../core/services/global.service';
import { MessageService } from './../../../core/services/message.service';
import { ApCredit, PoLines, ApCreditDataLines, ApCreditDataAccount } from './../../../models/ap-credit';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { PoLinesComponent } from '../po-lines/po-lines.component';
import * as fromApCredit from '../store/ap-credit.reducer';
import * as ApCreditActions from '../store/ap-credit.actions';

@Component({
  selector: 'ap-credit-form-items',
  templateUrl: './ap-credit-form-items.component.html',
  styleUrls: ['./ap-credit-form-items.component.scss']
})
export class ApCreditFormItemsComponent implements OnInit {

  @Input() dataForm: FormGroup;
  @Output() totalAmount = new EventEmitter<number>();

  displayedColumns: string[] = ['image', 'poNo', 'details', 'quantity', 'price', 'total', 'buttons'];
  total: any = 0;
  tax: any = 0;
  loading = false;

  filterForm: FormGroup;

  dataSource: MatTableDataSource<ApCreditDataLines> | null;

  selection = new SelectionModel<ApCreditDataLines>(true, []);

  creditLines: ApCreditDataLines[] = [];

  formGroup: FormGroup;

  constructor(
    private store: Store<any>,
    private fb: FormBuilder,
    private msg: MessageService,
    public dialogRefPoLines: MatDialog,
    public globalConfig: GlobalConfigService,
  ) {
    // TODO test state is working fine
    this.store.pipe(select('apCredit'))
      .subscribe(state => {
        if (state.errorInfo !== '' || state.reloadData) {
        } else if (!state.saving) {
          this.creditLines = [];
          if (state.data.apCreditLines) {
            state.data.apCreditLines.forEach(r => {
              this.creditLines.push({...r});
            });
          }
          this.initLines();
        }
      });
  }

  ngOnInit() {
  }

  initLines() {
    this.formGroup = this.fb.group({});
    this.creditLines.forEach(line => {
      if (line.id) {
        this.formGroup.addControl('qty_' + line.id, new FormControl(line.quantity));
        this.formGroup.addControl('price_' + line.id, new FormControl(line.price));
      } else {
        this.formGroup.addControl('qty_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId, new FormControl(line.quantity));
        this.formGroup.addControl('price_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId, new FormControl(line.price));
      }
    }, this);
    this.calculateTotal();
    this.dataSource = new MatTableDataSource(this.creditLines);
  }

  calculateTotal() {
    this.total = 0;
    this.tax = 0;
    this.creditLines.forEach(line => {
      if (line.id) {
        line.quantity = this.formGroup.value['qty_' + line.id];
        line.price = this.formGroup.value['price_' + line.id];
      } else {
        line.quantity = this.formGroup.value['qty_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId];
        line.price = this.formGroup.value['price_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId];
      }
      line.total = (Number(line.quantity) * Number(this.formatNumber(line.price))).toFixed(2);
      if (Number(line.taxRate) > 0) {
          line.tax = (Number(line.total) * (Number(line.tax) / 100)).toFixed(2);
          this.tax += Number(line.tax);
      }
      this.total += Number(Number(Number(line.quantity) * Number(this.formatNumber(line.price))).toFixed(2));
    }, this);
    this.total = this.total.toFixed(2);
    this.totalAmount.emit(this.total);
    // this.vouchingForm.controls.totalTaxOnPo.setValue(fx2Str(this.tax));
  }

  formatNumber(value) {
    return Number(value).toFixed(this.globalConfig.config.sysconfigOrderFormCostDecimalUpto);
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

  loadData() {
  }

  addLines() {
    const dialogRefSearch = this.dialogRefPoLines.open(PoLinesComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        vendorId: this.dataForm.value.accountId,
      },
      maxWidth: '95vw'
    });

    dialogRefSearch.afterClosed().subscribe((res) => {
      if (res && res.length && res.length > 0) {
        res.forEach(r => {
          const found = this.creditLines.find((e) => {
            return e.lineId == r.lineId && e.recordId == r.recordId;
          });
          if (found) {
            return;
          }
          r.order = { id: r.orderId, number: r.poNo};
          this.creditLines.push(r);
        });
      }
      this.initLines();
    });
  }

  removeLines(data) {
    if (this.creditLines.length == 1) {
      this.msg.show('Atleast one line item is required!', 'error');
      return;
    }
    this.creditLines.splice(data, 1);
    this.initLines();
  }

  getLines() {
    return this.creditLines;
  }

  clearLines() {
    this.creditLines = [];
    this.initLines();
  }

  fx2StrCopy(value) {
      return fx2Str(value);
  }

}

import { ApCreditService } from './../../../core/services/ap-credit.service';
import { GlobalConfigService } from './../../../core/services/global.service';
import { Component, OnInit, Input, ViewEncapsulation, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Observable ,  Subscription } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';

import { fx2Str } from 'app/utils/utils';
import { MessageService } from 'app/core/services/message.service';
import { VouchingsService } from '../vouchings.service';
import { VouchingLines } from 'app/models/vouching';

@Component({
  selector: 'app-vouching-lines-form',
  templateUrl: './vouching-lines-form.component.html',
  styleUrls: ['./vouching-lines-form.component.scss'],
  animations   : fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class VouchingLinesFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() vouchingForm: FormGroup;
  @Output() totalAmount = new EventEmitter<number>();
  @Output() viewPo = new EventEmitter<string>();
  @Output() currency = new EventEmitter<object>();
  formGroup: FormGroup;
  displayedColumns: string[] = ['image', 'poNo', 'details', 'quantity', 'price', 'total', 'creditAvail', 'creditApplied', 'lineAmount', 'buttons'];
  dataSource: ListDataSource | null;
  onDataChanged: Subscription;
  vouchingLines: any[];
  total: any = 0;
  tax: any = 0;
  loading = false;
  vendorId = '';

  creditAvailable = [];

  fromCurrency = "";
  toCurrency = "";
  exchangeRate = 1;

  constructor(
    private dataService: VouchingsService,
    private msg: MessageService,
    private formBuilder: FormBuilder,
    public globalConfig: GlobalConfigService,
    private apCredit: ApCreditService,
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.dataSource = new ListDataSource(
        this.dataService
    );
    this.formGroup = this.formBuilder.group({});

    this.onDataChanged =
      this.dataService.onDataChanged
          .subscribe((data: any) => {
            console.log("data for vouching lines", data);
              if (data) {
                  this.vouchingLines = data;
                  if(this.vouchingLines[0] && this.vouchingLines[0].toCurrency && this.vouchingLines[0].toCurrency != this.vouchingLines[0].fromCurrency) {
                    this.fromCurrency = this.vouchingLines[0].fromCurrency;
                    this.toCurrency = this.vouchingLines[0].toCurrency;
                    this.exchangeRate = this.vouchingLines[0].exchangeRate;
                    if(this.exchangeRate == 0) {
                      this.exchangeRate = 1;
                    }
                    this.displayedColumns = ['image', 
                    'poNo', 
                    'details', 
                    'quantity', 
                    //'price', 
                    'toCurrencyPrice', 
                    //'total', 
                    'toCurrencyTotal', 
                    //'creditAvail', 
                    'toCurrencyCreditAvail', 
                    //'creditApplied', 
                    'toCurrencyCreditApplied', 
                    //'lineAmount', 
                    'toCurrencyLineAmount', 
                    'buttons'];
                  } else {
                    this.fromCurrency = '';
                    this.toCurrency = '';
                    this.exchangeRate = 1;
                    this.displayedColumns = ['image', 'poNo', 'details', 'quantity', 'price', 'total', 'creditAvail', 'creditApplied', 'lineAmount', 'buttons'];
                  }
                  this.currency.emit({fromCurrency: this.fromCurrency, toCurrency: this.toCurrency, exchangeRate: this.exchangeRate});
                  this.initLines();
                  this.loading = false;
              }
          });
  }

  creditAppliedChanged(id) {
    this.formGroup.controls['to_credit_' + id].setValue(this.formGroup.value['credit_' + id] * this.exchangeRate);
    this.calculateTotal(true);
  }

  creditAppliedToCurrencyChanged(id) {
    this.formGroup.controls['credit_' + id].setValue(this.formGroup.value['to_credit_' + id] / this.exchangeRate);
    this.calculateTotal(true);
  }

  unitPriceChanged(id) {
    this.formGroup.controls['to_price_' + id].setValue(this.formGroup.value['price_' + id] * this.exchangeRate);
    this.calculateTotal();
  }

  unitPriceToCurrencyChanged(id) {
    this.formGroup.controls['price_' + id].setValue(this.formGroup.value['to_price_' + id] / this.exchangeRate);
    this.calculateTotal();
  }

  initLines() {
    this.formGroup = this.formBuilder.group({});
    this.vouchingLines.forEach(line => {
      line.creditAvailable = 0;
    });
    this.creditAvailable.forEach(ca => {
      this.vouchingLines.forEach(line => {
        if (line.type === ca.type && Number(line.lineId) === Number(ca.lineId) && line.recordId === ca.recordId ) {
          line.creditAvailable = Number(line.creditAvailable) + Number(ca.balance);
        }
      });
    });
    this.vouchingLines.forEach(line => {
      if (line.id) {
        this.formGroup.addControl('qty_' + line.id, new FormControl(line.quantity));
        this.formGroup.addControl('price_' + line.id, new FormControl(line.price));
        this.formGroup.addControl('to_price_' + line.id, new FormControl(line.price * this.exchangeRate));
        this.formGroup.addControl('credit_' + line.id, new FormControl(line.credit));
        this.formGroup.addControl('to_credit_' + line.id, new FormControl(line.credit * this.exchangeRate));
        line.creditAvailable = Number(line.creditAvailable) + Number(line.credit);
      } else {
        this.formGroup.addControl('qty_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId, new FormControl(line.quantity));
        this.formGroup.addControl('price_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId, new FormControl(line.price));
        this.formGroup.addControl('to_price_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId, new FormControl(line.price * this.exchangeRate));
        this.formGroup.addControl('credit_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId, new FormControl(line.credit));
        this.formGroup.addControl('to_credit_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId, new FormControl(line.credit * this.exchangeRate));
      }
    }, this);
    this.calculateTotal();
  }

  loadVendorCreditList(orders) {
    this.apCredit.getVendorCreditList({vendorId: this.vendorId, orderIds: orders})
      .subscribe((res: any) => {
        if (res.data && res.data[0]) {
          this.creditAvailable = [];
          res.data.forEach(d => {
            d.apCreditLines.forEach(l => {
              this.creditAvailable.push(l);
            });
          });
        } else {
          this.creditAvailable = [];
        }
        this.initLines();
      },
      err => {
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.vouchingForm) {
      this.loadVendorCreditList(changes.vouchingForm.currentValue.value.orders);
      if (changes.vouchingForm.currentValue.value.vendorId && changes.vouchingForm.currentValue.value.vendorId !== this.vendorId) {
        this.vendorId = changes.vouchingForm.currentValue.value.vendorId;
      }
      if (this.formGroup) {
        if (changes.vouchingForm.currentValue.value.id !== '') {
          this.formGroup.disable();
          this.vouchingLines.forEach(line => {
            if (line.id) {
              this.formGroup.controls['credit_' + line.id].enable();
            } else {
              this.formGroup.controls['credit_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId].enable();
            }
          }, this);
        } else {
          this.formGroup.enable();
        }
        this.initLines();
      }
    }
  }

  removeLines(data) {
      if(this.vouchingLines.length == 1) {
          this.msg.show('Atleast one line item is required!', 'error');
          return;
      }
      this.vouchingLines.splice(data, 1);
      this.dataService.onDataChanged.next(this.vouchingLines);
  }

  formatNumber(value) {
    return Number(value).toFixed(this.globalConfig.config.sysconfigOrderFormCostDecimalUpto);
  }

  toNumber(value) {
    return Number(value);
  }

  getCreditLines() {
    return [];
  }

  calculateTotal(change = false) {
      this.total = 0;
      this.tax = 0;
      let creditAmount = 0;
      this.vouchingLines.forEach(line => {
        if (line.id) {
          if (!change) {
            this.formGroup.controls['credit_' + line.id].setValue(Number(this.formGroup.value['credit_' + line.id]).toFixed(2));
          }
          // line.quantity = this.formGroup.value['qty_' + line.id];
          // line.price = this.formGroup.value['price_' + line.id];
          line.credit = this.formGroup.value['credit_' + line.id];
        } else {
          if (!change) {
            this.formGroup.controls['credit_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId].setValue(
              Number(this.formGroup.value['credit_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId]).toFixed(2)
            );
          }
          line.quantity = this.formGroup.value['qty_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId];
          line.price = this.formGroup.value['price_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId];
          line.credit = this.formGroup.value['credit_' + line.type + '_' + line.productId + '_' + line.lineId + '_' + line.recordId];
        }
        line.total = (Number(line.quantity) * Number(this.formatNumber(line.price)));
        line.total = Number(line.total).toFixed(2);
        if (Number(line.taxRateOnPo) > 0) {
            line.taxTotalOnPo = (Number(line.total) * (Number(line.taxRateOnPo) / 100));
            line.taxTotalOnPo = Number(line.taxTotalOnPo).toFixed(2);
            this.tax += Number(line.taxTotalOnPo);
        }
        if (Number(line.creditAvailable) < Number(line.credit)) {
          this.msg.show('Please provide credit amount less than credit available!', 'error');
        }
        if (Number(line.total) < Number(line.credit)) {
          this.msg.show('Please provide credit amount less than total!', 'error');
        }
        creditAmount += Number(line.credit);
        this.total += Number(Number(Number(line.quantity) * Number(this.formatNumber(line.price))).toFixed(2));
      }, this);
      this.totalAmount.emit(this.total);
      this.vouchingForm.controls.paidAmount.setValue(fx2Str(this.total));
      this.vouchingForm.controls.creditAmount.setValue(fx2Str(creditAmount));
      this.vouchingForm.controls.totalTaxOnPo.setValue(fx2Str(this.tax));
  }

  viewPoInfo(orderId) {
    this.viewPo.emit(orderId);
  }

  ngOnDestroy() {
      this.onDataChanged.unsubscribe();
  }

    fx2StrCopy(value) {
        return fx2Str(value);
    }

}

export class ListDataSource extends DataSource<any>
{
    data:VouchingLines[];

    onListChanged: Subscription;

    constructor(
        private dataService: VouchingsService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<VouchingLines[]>
    {
        const displayDataChanges = [
            this.dataService.onDataChanged
        ];
        this.onListChanged =
            this.dataService.onDataChanged
                .subscribe((response:VouchingLines[]) => {
                    this.data = response;
                });

        return this.dataService.onDataChanged;
    }

    disconnect()
    {
        this.onListChanged.unsubscribe();
    }
}

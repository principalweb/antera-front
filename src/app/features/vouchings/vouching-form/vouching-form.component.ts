import { VouchingCreditsComponent } from './../vouching-credits/vouching-credits.component';
import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { QbService } from 'app/core/services/qb.service';
import { VouchingDetails, VouchingLines } from 'app/models/vouching';
import { ApiService } from 'app/core/services/api.service';
import { displayName, fx2N, fx2Str } from 'app/utils/utils';
import { switchMap, distinctUntilChanged, debounceTime } from 'rxjs/operators';

import { VouchingsService } from '../vouchings.service';
import { VouchingLinesFormComponent } from '../vouching-lines-form/vouching-lines-form.component';
import { VouchingsListComponent } from '../vouchings-list/vouchings-list.component';
import { ApinvoiceSearchComponent } from '../apinvoice-search/apinvoice-search.component';

import * as moment from 'moment';

@Component({
  selector: 'app-vouching-form',
  templateUrl: './vouching-form.component.html',
  styleUrls: ['./vouching-form.component.scss'],
})
export class VouchingFormComponent implements OnInit, OnDestroy {
  @ViewChild(VouchingLinesFormComponent)
  linesComponent: VouchingLinesFormComponent;
  @ViewChild(VouchingsListComponent)
  vouchListComponent: VouchingsListComponent;
  @ViewChild(VouchingCreditsComponent)
  vouchCreditsComponent: VouchingCreditsComponent;

  dialogTitle: string;
  vouchingForm: FormGroup;

  vouchingDetail: VouchingDetails;
  vouchingLines: any[];
  loading = false;
  statusList = ['Partial', 'Pending', 'Done'];
  filteredVendors: any;

  displayName = displayName;
  fx2N = fx2N;
  fx2Str = fx2Str;
  alreadyPaidAmount = 0;
  taxEnabled = false;
  onGstTaxStatusChanged: Subscription;

  apInvoice: any = {};
  showApInvoice = false;

  totalCredit = 0;
  totalInvoice = 0;
  totalTax = 0;

  amountDue = 0;

  vcMode = false;

  data: any;

  creditAllocationLogs = [];

  currency = {
    fromCurrency: '',
    toCurrency: '',
    exchangeRate: 1
  };

  constructor(
    private dataService: VouchingsService,
    public dialogRef: MatDialogRef<VouchingFormComponent>,
    public dialogRefSearch: MatDialog,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private api: ApiService,
    private qbService: QbService,
  )
  {
    this.data = data;
    this.onGstTaxStatusChanged =
        this.dataService.onGstTaxStatusChanged
            .subscribe(status => {
              this.taxEnabled = status.enabled;
            });
    this.dialogTitle = 'Create Voucher';
    this.vouchingDetail = new VouchingDetails();
    this.vouchingDetail.poAmount = fx2N(this.data.poData.poAmount);
    this.vouchingDetail.orders = this.data.poData.orders;
    this.vouchingDetail.vendorName = this.data.poData.vendor;
    this.vouchingDetail.vendorId = this.data.poData.vendorId;

    this.vouchingDetail.createdById = this.auth.getCurrentUser().userId;
    this.vouchingDetail.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;

    this.vouchingForm = this.createVouchingForm();
  }

  loadRemainingPo()
  {
    this.vouchingDetail = new VouchingDetails();
    this.vouchingDetail.poAmount = fx2N(this.data.poData.poAmount);
    this.vouchingDetail.orders = this.data.poData.orders;
    this.vouchingDetail.vendorName = this.data.poData.vendor;
    this.vouchingDetail.vendorId = this.data.poData.vendorId;

    this.vouchingDetail.createdById = this.auth.getCurrentUser().userId;
    this.vouchingDetail.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;

    this.vouchingForm = this.createVouchingForm();
    this.loadData();

  }

  createVouchingForm()
  {
    const formGroup = this.formBuilder.group({
      id           : [this.vouchingDetail.id],
      invoiceNo           : [this.vouchingDetail.invoiceNo, Validators.required],

      vendorId            : [this.vouchingDetail.vendorId, Validators.required],
      vendorName          : [{value: this.vouchingDetail.vendorName, disabled: true}, Validators.required],
      dueDate             : [new Date(this.vouchingDetail.dueDate) ],
      invoiceDate         : [new Date(this.vouchingDetail.invoiceDate) ],

      paidAmount          : [{value: fx2Str(this.vouchingDetail.balanceAmount), disabled: true}, Validators.required],
      creditAmount          : [{value: fx2Str(this.vouchingDetail.creditAmount), disabled: true}, Validators.required],
      balanceAmount       : [this.vouchingDetail.balanceAmount],
      poAmount            : [this.vouchingDetail.poAmount],
      totalTaxOnPo        : [ {value: '', disabled: true} ],

      notes               : [this.vouchingDetail.notes],

      orders             : [this.vouchingDetail.orders],

      createdById         : [this.vouchingDetail.createdById],
      createdByName       : [this.vouchingDetail.createdByName],
      modifiedById        : [this.vouchingDetail.modifiedById],
      modifiedByName      : [this.vouchingDetail.modifiedByName]
    });
    if (this.vouchingDetail.id !== '') {
      formGroup.disable();
    } else {
      formGroup.enable();
      formGroup.controls.paidAmount.disable();
      formGroup.controls.totalTaxOnPo.disable();
      formGroup.controls.creditAmount.disable();
    }
    return formGroup;
  }

  loadData() {
    this.creditAllocationLogs = [];
    this.vouchingDetail = new VouchingDetails();
    this.vouchingDetail.vendorId = '';
    this.vouchingDetail.poAmount = fx2N(this.data.poData.poAmount);
    this.vouchingDetail.orders = this.data.poData.orders;
    this.vouchingDetail.vendorName = this.data.poData.vendor;
    this.vouchingDetail.vendorId = this.data.poData.vendorId;

    this.vouchingDetail.createdById = this.auth.getCurrentUser().userId;
    this.vouchingDetail.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;

    this.vouchingForm = this.createVouchingForm();
    this.dataService.getData({vendorId: this.vouchingDetail.vendorId, orders: this.vouchingDetail.orders});
  }

  ngOnInit()
  {
    this.loadData();
    this.filteredVendors =
      this.vouchingForm.get('vendorName')
          .valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(keyword =>
                this.api.getVendorAutocomplete(keyword)
            )
          );
  }

  viewPo()
  {
    this.dataService.getData({vendorId: this.vouchingDetail.vendorId, orders: this.vouchingDetail.orders, viewPo: 1});
  }

  viewInvoice(id)
  {
    this.dataService.getInvoiceData(id)
      .subscribe((response: any) => {
          if (response.data && response.data[0] && response.data[0].id) {
            const vendorName = this.vouchingDetail.vendorName;
            this.vouchingDetail = new VouchingDetails();
            this.vouchingDetail.poAmount = 0;
            this.vouchingDetail.orders = [];
            response.data[0].vouchingPos.forEach(e => {
              this.vouchingDetail.orders.push(e.orderId);
            });
            this.vouchingDetail.vendorName = vendorName;
            this.vouchingDetail.id = response.data[0].id;
            this.vouchingDetail.vendorId = response.data[0].vendorId;
            this.vouchingDetail.invoiceNo = response.data[0].invoiceId;

            this.vouchingDetail.dueDate = response.data[0].dueDate;
            this.vouchingDetail.invoiceDate = response.data[0].invoiceDate;
            this.vouchingDetail.balanceAmount = response.data[0].amountDue;
            this.vouchingDetail.totalTaxOnPo = response.data[0].tax;
            this.vouchingDetail.notes = response.data[0].notes;
            this.vouchingDetail.modifiedById = this.auth.getCurrentUser().userId;
            this.vouchingDetail.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;

            this.vouchingForm = this.createVouchingForm();
            this.linesComponent.loadVendorCreditList(this.vouchingDetail.orders);
            const lines = [];
            response.data[0].vouchingLines.forEach(e => {
              lines.push({
                id: e.id,
                quantity: e.quantity,
                price: e.price,
                credit: e.credit,
                name: e.name,
                total: e.total,
                type: e.type,
                lineId: e.lineId,
                parentId: e.parentId,
                recordId: e.recordId,
                productId: e.productId,
                sku: e.sku,
                color: e.color,
                size: e.size,
                image: e.image,
                taxRateOnPo: e.taxRate,
                taxTotalOnPo: e.tax,
                matrixUpdatedIds: [],
                poNo: e.order.number,
                fromCurrency: e.fromCurrency,
                toCurrency: e.toCurrency,
                exchangeRate: e.exchangeRate,
                orderId: e.order.id,
              });
            });
            this.dataService.onDataChanged.next(lines);
            this.creditAllocationLogs = response.data && response.data[0] && response.data[0].apCreditAllocationLogs ? response.data[0].apCreditAllocationLogs : [];
          } else {
              this.msg.show(response.msg, 'error');
          }
      }, err => {
          this.msg.show(err.message, 'error');
      });
  }

  save(done: number = 0) {
    if (this.vouchingForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    if (fx2N(this.vouchingForm.get('paidAmount').value) < 0) {
      this.msg.show('Invoice Amount should be 0 or more', 'error');
      return;
    }
    this.updateValues(this.vouchingForm.get('paidAmount').value);
    const detail = this.vouchingForm.getRawValue();
    detail.lines = this.linesComponent.vouchingLines;
    if (!detail.lines || detail.lines.length <= 0 ) {
      this.msg.show('Not products added for vouching!', 'error');
      return;
    }
    // detail.credits = this.vouchCreditsComponent.getAppliedCreditLines();
    // if (detail.credits.error) {
    //   return ;
    // }
    detail.invoiceDate = moment(detail.invoiceDate).format('YYYY-MM-DDThh:mm:ss');
    detail.dueDate = moment(detail.dueDate).format('YYYY-MM-DDThh:mm:ss');
    this.vouchingDetail.setData(detail);
    this.loading = true;
    this.api.createVouching({...this.vouchingDetail, setCompleted: done})
        .subscribe((res: any) => {
            this.msg.show(res.msg, 'success');
            this.loading = false;
            this.vouchingDetail.invoiceNo = "";
            this.vouchingForm = this.createVouchingForm();
            this.loadData();
            this.vouchListComponent.loadData();
            this.linesComponent.loadVendorCreditList(this.vouchingDetail.orders);
        }, (err) => {
            this.msg.show('Server error.', 'error');
            this.loading = false;
        });
  }

  updateValues(paidAmount) {
    const balanceAmount = this.vouchingDetail.balanceAmount - fx2N(this.totalInvoice);
    this.vouchingForm.patchValue({
      balanceAmount: balanceAmount,
      status: balanceAmount <= 0 ? 'Done' : 'Partial',
      complete: balanceAmount <= 0 ? true : false
    });
  }

  pushtoQb (orderId,vendorId) {
      if (this.qbService.qbActive()){
          this.qbService.pushEntity('PurchaseOrder', orderId, vendorId)
          .then((res: any) => {
              if (res.error == true)
              {
                this.msg.show(res.msg, 'error');
              }
              else {
                this.msg.show(res.msg, 'success');
              }
          }).catch((err) => {
            this.msg.show(err.message, 'error');
          });
      }
      else {
          this.msg.show('QB is not active.','error');
      }
  }

  viewPurchaseOrder(orderId) {
    this.dialogRef.close({action: 'Preview', data: {orderId: orderId, vendorId: this.vouchingDetail.vendorId, vendorName: this.vouchingDetail.vendorName}});
  }

  viewApInvoice() {
    const dialogRefSearch = this.dialogRefSearch.open(ApinvoiceSearchComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        vendorId: this.vouchingDetail.vendorId,
        orderId: '',
        poNumber: ''
      },
    });

    dialogRefSearch.afterClosed().subscribe((res) => {
      this.showApInvoice = false;
      if (res && res.number) {
        this.apInvoice = res;
        this.showApInvoice = true;
      }
    });
  }

  selectVendor(ev){
    const vendor = ev.option.value;
    this.vouchingForm.patchValue({
        vendorName: vendor.name,
        vendorId: vendor.id
    });
  }

  updateTotalAmount(totalInvoice) {
    this.totalInvoice = totalInvoice;
    this.vouchingForm.patchValue({'paidAmount': fx2Str(this.totalInvoice)});
    this.amountDue = this.totalInvoice - this.totalCredit;
  }

  deleteSelectedVouchings() {
    this.vouchListComponent.deleteSelected();
  }

  setExchangeRate(currency) {
    this.currency = currency;
  }

  ngOnDestroy() {
    this.onGstTaxStatusChanged.unsubscribe();
  }
}

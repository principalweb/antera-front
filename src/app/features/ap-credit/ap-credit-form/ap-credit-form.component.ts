import { ApCreditFormItemsComponent } from './../ap-credit-form-items/ap-credit-form-items.component';
import { MessageService } from 'app/core/services/message.service';
import { QbService } from 'app/core/services/qb.service';
import { Store, select } from '@ngrx/store';
import { FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';

import * as fromApCredit from '../store/ap-credit.reducer';
import * as ApCreditActions from '../store/ap-credit.actions';
import { Reason } from 'app/models';
import { ReasonService } from 'app/core/services/reason.service';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { ApCreditService } from 'app/core/services/ap-credit.service';

import { AuthService } from 'app/core/services/auth.service';

@Component({
  selector: 'ap-credit-form',
  templateUrl: './ap-credit-form.component.html',
  styleUrls: ['./ap-credit-form.component.scss']
})
export class ApCreditFormComponent implements OnInit, OnChanges {
  @ViewChild(ApCreditFormItemsComponent) linesComponent: ApCreditFormItemsComponent;
  @Input() vendorId = '';
  @Input() itemCredit = false;
  @Input() amount = 0;

  @Output() updated = new EventEmitter<boolean>();

  dataForm: FormGroup;

  creditReason: Reason[] = [];
  financialAccounts = {allAccounts: []};

  // vendor auto complete
  vendorName: FormControl;
  vendorLoading = false;
  autoCompleteVendor = {};
  filteredVendors = [];

  constructor(
    private store: Store<any>,
    private fb: FormBuilder,
    private reasonService: ReasonService,
    private qbService: QbService,
    private apCreditService: ApCreditService,
    private msg: MessageService,
    private auth: AuthService,
  ) {
    this.vendorName = new FormControl('', [RequireMatch]);
    this.dataForm = this.fb.group({});
    this.qbService.getFinancialAccoounts()
      .subscribe((response: any) => {
        if (response && response.allAccounts) {
          this.financialAccounts.allAccounts = response.allAccounts.filter(aa => aa.type.indexOf('Asset:Accounts Receivable:') === -1);
        }
      });
    this.reasonService.getFullList()
      .subscribe((response: any) => {
        if (response.data) {
          this.creditReason = response.data;
        }
      });
    this.store.pipe(select('apCredit'))
      .subscribe(state => {
        // TODO Correct type of state
        if (state.errorInfo !== '') {
          if (state.errorInfo.error && state.errorInfo.error.message) {
            this.msg.show(state.errorInfo.error.message, 'error');
          } else if (state.errorInfo.error && state.errorInfo.error.errors) {
            this.msg.show(state.errorInfo.error.errors, 'error');
          } else {
            this.msg.show('An error occured, please try again', 'error');
            console.log(state.errorInfo);
          }
        } else if (state.reloadData) {
          this.store.dispatch(new ApCreditActions.EditStart(state.data.id));
        } else if (!state.saving) {
          this.dataForm = this.fb.group({...state.data});
          if (state.data.account && state.data.account.name !== '') {
            this.vendorName.setValue(state.data.account);
          }
        }
        this.dataForm.get('amount').disable();
      });
  }

  ngOnInit() {
    this.vendorName.valueChanges
    .pipe(
      debounceTime(300),
      tap(() => {
        this.vendorLoading = true;
      }),
      switchMap(searchName => this.apCreditService.getVendorAutoComplete(searchName)
      .pipe(
        finalize(() => {
          this.vendorLoading = false;
        }),
        )
      )
    )
    .subscribe((vendors: any) => this.filteredVendors = vendors.data);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.amount && changes.amount.currentValue !== changes.amount.previousValue) {
      this.dataForm.patchValue({amount: changes.amount.currentValue});
      this.dataForm.get('amount').disable();
    }
  }

  updateTotalAmount(amount) {
    this.dataForm.controls.amount.setValue(amount);
    this.dataForm.get('amount').disable();
  }

  save() {
    const data = this.dataForm.getRawValue();
    if (data.advanceReasonId === '') {
      this.msg.show('Please provide reason for credit!', 'error');
      return;
    }
    if (data.reference === '') {
      this.msg.show('Please provide Reference!', 'error');
      return;
    }
    if (Number(data.amount) <= 0) {
      this.msg.show('Please enter a credit amount more than 0!', 'error');
      return;
    }
    const apCreditLines = [];
    const lines = this.linesComponent.getLines();
    if (lines.length == 0) {
      this.msg.show('Please select PO lines for credit!', 'error');
      return;
    }
    lines.forEach((e) => {
      if (Number(e.quantity) <= 0) {
        this.msg.show('Please enter a quantity more than 0!', 'error');
        return;
      }
      if (Number(e.price) <= 0) {
        this.msg.show('Please enter a quantity more than 0!', 'error');
        return;
      }
      apCreditLines.push({
        id: e.id,
        orderId: e.orderId,
        vendorId: e.vendorId,
        quantity: e.quantity,
        price: e.price,
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
        tax: e.tax,
        taxRate: e.taxRate,
      });
    });
    data.apCreditLines = apCreditLines;
    delete(data.account);
    if (data.id === '') {
      data.userId = this.auth.getCurrentUser().userId;
    }
    if (data.id !== '') {
      this.store.dispatch(new ApCreditActions.Update(data));
    } else {
      this.store.dispatch(new ApCreditActions.Create(data));
    }
  }

  vendorDisplay(vendor) {
    if (vendor) {
      if (this.dataForm.value.accountId !== vendor.id && this.linesComponent) {
        this.linesComponent.clearLines();
      }
      this.dataForm.controls.accountId.setValue(vendor.id);
      this.autoCompleteVendor = vendor;
      return vendor.name;
    }
  }

}

export function RequireMatch(control: AbstractControl) {
  const selection: any = control.value;
  if (typeof selection === 'string') {
      return { incorrect: true };
  }
  return null;
}

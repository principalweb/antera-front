import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, SimpleChanges } from '@angular/core';
import { Account, CreditInfo } from 'app/models';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ApiService } from 'app/core/services/api.service';
import { formatInteger } from 'app/utils/helper';
import { Subscription } from 'rxjs';
import { AccountsService } from '../../accounts.service';
import { find, filter } from 'lodash';
import { fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';

@Component({
  selector: 'account-balance-info',
  templateUrl: './balance-info.component.html',
  styleUrls: ['./balance-info.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class BalanceInfoComponent implements OnInit {
  @Input() account: Account;
  @Input() tabName = '';
  @Output() edit = new EventEmitter();

  filteredReasons : any;
  editingInfo = false;
  credit: CreditInfo;
  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;
  creditList : any;
  loading = false;
  fields = [];

  balanceInfoForm: FormGroup;
  onModuleFieldsChangedSubscription: Subscription;
  onReasonChanged: Subscription;
  onCreditChanged: Subscription;
  onCurrentCreditChanged: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private accountsService: AccountsService,
    private authService: AuthService,
    private msg: MessageService
  ) { }


  ngOnInit() {
    this.onModuleFieldsChangedSubscription =
        this.accountsService.onModuleFieldsChanged
            .subscribe((fields: any[]) => {
              this.fields = fields;
            });

    this.onReasonChanged =
            this.api.getReasons().subscribe(reason => {
                     this.filteredReasons = reason;
                 });


    this.credit = new CreditInfo();
    this.balanceInfoForm = this.createForm();
    this.getCreditPerAccount();
    this.getCurrentCreditAmount();
  }

  ngOnDestory() {
    this.onReasonChanged.unsubscribe();
    this.onCreditChanged.unsubscribe();
    this.onCurrentCreditChanged.unsubscribe();
    if (this.onModuleFieldsChangedSubscription) this.onModuleFieldsChangedSubscription.unsubscribe();
  }

  getCreditPerAccount() {
    this.onCreditChanged =
            this.api.getCreditPerAccount({ accountId: this.account.id}).subscribe(credit => {
                     this.creditList = credit;
                 });

  }

  getCurrentCreditAmount() {
    this.onCurrentCreditChanged =
        this.api.getCurrentCreditAmount({ accountId: this.account.id}).subscribe((credit: number) => {
            this.credit.creditAmount = (credit) > 0 ?  credit : Math.abs(credit);
            if(credit > 0 ) {
                this.credit.precredit = '(';
                this.credit.procredit = ')';
            } else {
                this.credit.precredit = '';
                this.credit.procredit = '';
            }
        });
  }

  saveBalanceInfo() {
    this.editBalanceInfo();
    this.edit.emit({type: 'BalanceInfo', dataForm: this.balanceInfoForm});
//    this.getCreditPerAccount();
//    this.getCurrentCreditAmount();

  }

  editBalanceInfo() {
    this.editingInfo = !this.editingInfo;
  }

  selectReason(ev) {
        const rea = this.filteredReasons.find(filteredReasons => filteredReasons.id == ev.value);
        this.balanceInfoForm.patchValue({
            reason: rea.reason,
            reasonId: rea.id
        });
  }

  createForm() {
    return this.formBuilder.group({
        id                   : requiredField('id', this.fields) ? [this.account.id] : [this.account.id],
        creditAmount         : requiredField('creditAmount', this.fields) ? [this.credit.creditAmount] : [this.credit.creditAmount],
        reason               : requiredField('reason', this.fields) ? [this.credit.reason] : [this.credit.reason],
        creditNotes          : requiredField('creditNotes', this.fields) ? [this.credit.notes] : [this.credit.notes],
        reasonId             : requiredField('reasonId', this.fields) ? [this.credit.reasonId] : [this.credit.reasonId],
        userId               : this.authService.getCurrentUser().userId,
        salesRep             : this.account.salesRep,
        salesRepId           : this.account.salesRepId,

    });
  }
}

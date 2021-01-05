import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { ApiService } from 'app/core/services/api.service';
import { QbService } from 'app/core/services/qb.service';
import { MessageService } from 'app/core/services/message.service';

import { XeroCreds } from 'app/models';

@Component({
  selector: 'xerocustomer',
  templateUrl: './xerocustomer.component.html',
  styleUrls: ['./xerocustomer.component.scss']
})
export class XerocustomerComponent implements OnInit {
  loading: boolean = false;
  credsForm: FormGroup;
  creditForm: FormGroup;
  invoiceCustomFieldForm: FormGroup;
  invoiceCustomFields = [];
  poCustomFieldForm: FormGroup;
  poCustomFields = [];
  showCustomFields:boolean = false;
  creds: XeroCreds = {
                       InvItemExpenseAccountId: '', InvItemIncomeAccountId: '',
                       SrvItemExpenseAccountId: '', SrvItemIncomeAccountId: '',
                       NonInvItemExpenseAccountId: '', NonInvItemIncomeAccountId: '',
                       aiDebit: '', aiCredit: '',
                       rDebit: '', rCredit: '',
                       vDebit: '', vCredit: '',
                       adDebit: '', adCredit: '',
                       sDebit: '', sCredit: '',
                       IncludeOrderIdInPurchaseOrderMemo: false, NoZeroAmountItemsInPO: false, BillRollAddCharge: false,
                       PurchaseLineDescForProductMatrix: '', PurchaseLineDescForAddCharge: '',
                       IncludeSalesRepEmailToInvoice: false, NoZeroAmountItemsInInvoice: false,
                       SalesLineDescForProductMatrix: '', SalesLineDescForAddCharge: '',
                       PaymentReceiveAccount: '',
                       CreditPaymentReceiveAccount: '',
                       RefundFromAccount: '',
                        numberDecimalValue: '',
                        enableGST: false,
                        enableIndependentPayments: false,
                        disableRolling: false,
  };

  financialAccounts = {allAccounts: [],
                        incomeAccounts: [],
                        expenseAccounts: [],
                        assetAccounts: [],
                        paymentAccounts: [],
                        liabilityAccounts: [],
                        payableAccounts: [],
                        receivableAccounts: []
                        };
  gstRates = [
              {code: 'gst_GST', name: 'GST', label: 'GST'},
              {code: 'gst_GSTFREE', name: 'GSTFREE', label: 'GST Free'},
              {code: 'gst_GSTPO', name: 'GSTPO', label: 'GST on Purchase'},
              {code: 'gst_GSTFREEPO', name: 'GSTFREEPO', label: 'GST Free Purchase'},
              ];
  taxRates = [];

  constructor(
                private qbService: QbService,
                private msg: MessageService,
                private api: ApiService,
                private fb: FormBuilder
                ) {
    this.credsForm = new FormGroup({});
    this.qbService.getTaxRates('XERO')
      .subscribe((response: any) => {
          this.taxRates = [{anteraId: '', id: '', qbEntity: 'TaxCode', qbExtra: '', qbFullname: '', qbId: '', qbName: ''}];
          this.taxRates = this.taxRates.concat(response);
      });
  }

  ngOnInit() {
    const credsCopy = {...this.creds};
    this.gstRates.forEach(r => {
      credsCopy[r.code] = '';
    });
    this.credsForm =  this.fb.group(credsCopy);
    this.creditForm = this.fb.group({});
    this.getFinancialAccounts();
    this.loadConfig();
  }

  importData() {
      this.loading = true;
      this.qbService.qbImport()
          .subscribe((response:any) => {
              this.msg.show(response.msg, 'error');
              this.loading = false;
              this.loadTaxConfig();
              //this.getCustomFields();
              this.loadConfig();
              this.getFinancialAccounts();
          });
  }

  loadTaxConfig() {
      this.qbService.getTaxRates('XERO')
        .subscribe((response: any) => {
            this.taxRates = [{anteraId: '', id: '', qbEntity: 'TaxCode', qbExtra: '', qbFullname: '', qbId: '', qbName: ''}];
            this.taxRates = this.taxRates.concat(response);
        });
  }

  getFinancialAccounts() {
      this.qbService.getFinancialAccoounts()
          .subscribe((response: any) => {
              this.financialAccounts.allAccounts = response.allAccounts.filter(aa => aa.type.indexOf('Asset:Accounts Receivable:') === -1);
              this.financialAccounts.incomeAccounts = response.incomeAccounts;
              this.financialAccounts.expenseAccounts = response.expenseAccounts;
              this.financialAccounts.assetAccounts = response.assetAccounts;
              this.financialAccounts.paymentAccounts = response.paymentAccounts;
              this.financialAccounts.liabilityAccounts = response.liabilityAccounts;
              this.financialAccounts.payableAccounts = response.payableAccounts;
              this.financialAccounts.receivableAccounts = response.receivableAccounts;
          });
  }

  loadConfig() {
      this.loading = true;
      /*this.qbService.getCreditTerms('QBO')
        .subscribe((response:any) => {
            this.qboCreditTerms = response;
            const creditGroup:any = {};
            this.qboCreditTerms.forEach(qbTerm => {
                creditGroup[qbTerm.qbId] = new FormControl(qbTerm.anteraId);
            });
            this.creditForm = this.fb.group(creditGroup);
        });*/
      const credsCopy = {...this.creds};
      this.gstRates.forEach(r => {
        credsCopy[r.code] = '';
      });
      this.qbService.getXeroConfig(credsCopy)
        .subscribe((response: any) => {
            this.creds.InvItemExpenseAccountId = response.InvItemExpenseAccountId ? response.InvItemExpenseAccountId : '';
            this.creds.InvItemIncomeAccountId = response.InvItemIncomeAccountId ? response.InvItemIncomeAccountId : '';
            this.creds.aiDebit = response.aiDebit ? response.aiDebit : '';
            this.creds.aiCredit = response.aiCredit ? response.aiCredit : '';
            this.creds.rDebit = response.rDebit ? response.rDebit : '';
            this.creds.rCredit = response.rCredit ? response.rCredit : '';
            this.creds.vDebit = response.vDebit ? response.vDebit : '';
            this.creds.vCredit = response.vCredit ? response.vCredit : '';
            this.creds.adDebit = response.adDebit ? response.adDebit : '';
            this.creds.adCredit = response.adCredit ? response.adCredit : '';
            this.creds.sDebit = response.sDebit ? response.sDebit : '';
            this.creds.sCredit = response.sCredit ? response.sCredit : '';
            this.creds.SrvItemExpenseAccountId = response.SrvItemExpenseAccountId ? response.SrvItemExpenseAccountId : '';
            this.creds.SrvItemIncomeAccountId = response.SrvItemIncomeAccountId ? response.SrvItemIncomeAccountId : '';
            this.creds.NonInvItemExpenseAccountId = response.NonInvItemExpenseAccountId ? response.NonInvItemExpenseAccountId : '';
            this.creds.NonInvItemIncomeAccountId = response.NonInvItemIncomeAccountId ? response.NonInvItemIncomeAccountId : '';
            this.creds.IncludeOrderIdInPurchaseOrderMemo = response.IncludeOrderIdInPurchaseOrderMemo == 1 ? true : false;
            this.creds.NoZeroAmountItemsInPO = response.NoZeroAmountItemsInPO == 1 ? true : false;
            this.creds.BillRollAddCharge = response.BillRollAddCharge == 1 ? true : false;
            this.creds.PurchaseLineDescForProductMatrix = response.PurchaseLineDescForProductMatrix ? response.PurchaseLineDescForProductMatrix : '';
            this.creds.PurchaseLineDescForAddCharge = response.PurchaseLineDescForAddCharge ? response.PurchaseLineDescForAddCharge : '';
            this.creds.IncludeSalesRepEmailToInvoice = response.IncludeSalesRepEmailToInvoice == 1 ? true : false;
            this.creds.NoZeroAmountItemsInInvoice = response.NoZeroAmountItemsInInvoice == 1 ? true : false;
            this.creds.SalesLineDescForProductMatrix = response.SalesLineDescForProductMatrix ? response.SalesLineDescForProductMatrix : '';
            this.creds.SalesLineDescForAddCharge = response.SalesLineDescForAddCharge ? response.SalesLineDescForAddCharge : '';
            this.creds.PaymentReceiveAccount = response.PaymentReceiveAccount ? response.PaymentReceiveAccount : '';
            this.creds.CreditPaymentReceiveAccount = response.CreditPaymentReceiveAccount ? response.CreditPaymentReceiveAccount : '';
            this.creds.RefundFromAccount = response.RefundFromAccount ? response.RefundFromAccount : '';
            this.creds.numberDecimalValue = response.numberDecimalValue ? response.numberDecimalValue : '';
            this.creds.enableGST = response.enableGST == '1' ? true : false;
            this.creds.enableIndependentPayments = response.enableIndependentPayments == '1' ? true : false;
            this.creds.disableRolling = response.disableRolling == '1' ? true : false;
            const credsCopy = {...this.creds};
            this.gstRates.forEach(r => {
              credsCopy[r.code] = new FormControl(response[r.code] ? response[r.code] : '');
            });
            this.credsForm = this.fb.group(credsCopy);

            this.loading = false;
        });
  }

  saveConfig() {
      this.loading = true;
      const creds = { ...this.credsForm.value};
      console.log(creds);
      creds.IncludeOrderIdInPurchaseOrderMemo = creds.IncludeOrderIdInPurchaseOrderMemo ? 1 : 0;
      creds.NoZeroAmountItemsInPO = creds.NoZeroAmountItemsInPO ? 1 : 0;
      creds.BillRollAddCharge = creds.BillRollAddCharge ? 1 : 0;
      creds.IncludeSalesRepEmailToInvoice = creds.IncludeSalesRepEmailToInvoice ? 1 : 0;
      creds.NoZeroAmountItemsInInvoice = creds.NoZeroAmountItemsInInvoice ? 1 : 0;
      creds.EnableAnteraUserToQboDepartment = creds.EnableAnteraUserToQboDepartment ? 1 : 0;
      creds.enableGST = creds.enableGST ? 1 : 0;
      creds.enableIndependentPayments = creds.enableIndependentPayments ? 1 : 0;
      creds.disableRolling = creds.disableRolling ? 1 : 0;
      //creds.terms = this.creditForm.value;
      this.qbService.setXeroConfig(creds)
        .subscribe((response: any) => {
            this.msg.show(response.msg, 'error');
            this.loading = false;
            this.qbService.getQbEnabled();
            this.loadConfig();
        });

  }

  disconnect() {
      this.loading = true;
      this.qbService.qbDisconnect('XERO')
          .subscribe((response: any) => {
              this.msg.show(response.msg, 'error');
              this.loading = false;
              this.loadTaxConfig();
              //this.getCustomFields();
              this.loadConfig();
              this.getFinancialAccounts();
          });
  }

}

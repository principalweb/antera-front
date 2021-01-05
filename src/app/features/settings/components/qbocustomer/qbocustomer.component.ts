import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { ApiService } from 'app/core/services/api.service';
import { QbService } from 'app/core/services/qb.service';
import { MessageService } from 'app/core/services/message.service';

import { QboCreds } from 'app/models';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-qbocustomer',
  templateUrl: './qbocustomer.component.html',
  styleUrls: ['./qbocustomer.component.scss']
})
export class QbocustomerComponent implements OnInit {
  loading: boolean = false;
  credsForm: FormGroup;
  creditForm: FormGroup;
  invoiceCustomFieldForm: FormGroup;
  invoiceCustomFields = [];
  poCustomFieldForm: FormGroup;
  poCustomFields = [];
  showCustomFields = false;
  creds: QboCreds = {
                       EnableAnteraContactToQboCustomer: false,
                       ItemIdentifierProperty1: '',
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
                       IncludeSalesRepEmailToInvoice: false, NoZeroAmountItemsInInvoice: false, EnableAnteraUserToQboDepartment: false,
                       SalesLineDescForProductMatrix: '', SalesLineDescForAddCharge: '',
                       PaymentReceiveAccount: '',
                       CreditPaymentReceiveAccount: '',
                       RefundFromAccount: '',
                       ContinueOnPaymentLinkingError: false,
                        qboNumberDecimalValue: '',
                        enableGST: false,
                        enableGSTUsa: false,
                        gstGl: '',
                        hstGl: '',
                        pstGl: '',
                        pstbcGl: '',
                        qstGl: '',
                        rstGl: '',
                        enableQbTax: false,
                        enableIndependentPayments: false,
                        disableRolling: false,
                       vouchingTemporaryCostAccount: '',
                       billBankAccount: '',
                       };
  itemIdentifiers = [
                        {value: 'itemId', label: 'Antera ID'},
                        {value: 'itemNo', label: 'Item #'},
                        {value: 'itemCode', label: 'SPC/ASI'},
                        {value: 'inhouseId', label: 'In-house ID'},
                    ];
  financialAccounts = {allAccounts: [],
                        incomeAccounts: [],
                        expenseAccounts: [],
                        assetAccounts: [],
                        paymentAccounts: [],
                        liabilityAccounts: [],
                        payableAccounts: [],
                        bankAccounts: [],
                        receivableAccounts: []
                        };
  customFields = [
					{value:'orderIdentity',label:'Order Identity'},
					{value:'inhandby',label:'In-Hand By Date'},
					{value:'assignedUser',label:'Sales Person'},
					{value:'csrUser',label:'CSR Name'},
					{value:'scheduledShippingDate',label:'Scheduled Ship Date'},
					{value:'actualShippingDate',label:'Actual Ship Date'},
					{value:'expectedArrivalDate',label:'Expected Arrival Date'},
					{value:'trackingNumber',label:'Tracking Number'},
					{value:'shippingMethod',label:'Ship Via'},
					{value:'customPO',label:'Customer PO'},
                  ];
  decimalNumbers = [
                        {value: '2', label: '2'},
                        {value: '3', label: '3'},
                        {value: '4', label: '4'},
                    ];
  creditTerms:any;
  qboCreditTerms:any;

  showTaxMap = false;
  taxCountry = '';
  qboTaxRates = [];
  provinceGstLoaded = false;
  requireConfigLoad = false;
  gstRates = [
              {code: 'gst_GST', name: 'GST', label: 'GST'},
              {code: 'gst_GSTFREE', name: 'GSTFREE', label: 'GST Free'},
              {code: 'gst_GSTPO', name: 'GSTPO', label: 'GST on Purchase'},
              {code: 'gst_GSTFREEPO', name: 'GSTFREEPO', label: 'GST Free Purchase'},
              ];

  action = 'setting';

  constructor(
                private qbService: QbService,
                private msg: MessageService,
                private api: ApiService,
                private fb: FormBuilder
                ) {
      this.loadTaxConfig();
  }

  loadTaxConfig() {
      this.api.getAdvanceSystemConfig({setting: 'localeCountry', module: 'system'})
        .subscribe((response: any) => {
          this.showTaxMap = false;
          if (response && response.value && (response.value == 'AUS' || response.value == 'CAN')) {
            this.taxCountry = response.value;
            this.showTaxMap = true;
            this.qbService.getTaxRates('QBO')
              .subscribe((response: any) => {
                  this.qboTaxRates = [{anteraId: '', id: '', qbEntity: 'TaxCode', qbExtra: '', qbFullname: '', qbId: '', qbName: ''}];
                  this.qboTaxRates = this.qboTaxRates.concat(response);
              });
          }
        });
      this.api.getProvinceTaxRates()
        .subscribe((response: any) => {
          if (response) {
            if (this.taxCountry == 'CAN') {
              response.forEach(t => {
                this.gstRates.push({code: 'gst_' + t.id, name: t.id, label: t.province + ' ' + t.taxRateType});
              });
            }
            if (this.requireConfigLoad) {
              this.loadConfig();
            }
            this.requireConfigLoad = false;
            this.provinceGstLoaded = true;
          }
        });
  }

  loadConfig() {
      this.loading = true;
      this.qbService.getCreditTerms('QBO')
        .subscribe((response:any) => {
            this.qboCreditTerms = response;
            const creditGroup:any = {};
            this.qboCreditTerms.forEach(qbTerm => {
                creditGroup[qbTerm.qbId] = new FormControl(qbTerm.anteraId);
            });
            this.creditForm = this.fb.group(creditGroup);
        });
      const credsCopy = {...this.creds};
      if (this.showTaxMap) {
        this.gstRates.forEach(r => {
          credsCopy[r.code] = '';
        });
      }
      this.qbService.getQboConfig(credsCopy)
        .subscribe((response:any) => {
            this.creds.EnableAnteraContactToQboCustomer = response.EnableAnteraContactToQboCustomer == 1? true: false;
            this.creds.ItemIdentifierProperty1 = response.ItemIdentifierProperty1? response.ItemIdentifierProperty1: "";
            this.creds.InvItemExpenseAccountId = response.InvItemExpenseAccountId? response.InvItemExpenseAccountId: "";
            this.creds.InvItemIncomeAccountId = response.InvItemIncomeAccountId? response.InvItemIncomeAccountId: "";
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
            this.creds.SrvItemExpenseAccountId = response.SrvItemExpenseAccountId ? response.SrvItemExpenseAccountId: "";
            this.creds.SrvItemIncomeAccountId = response.SrvItemIncomeAccountId? response.SrvItemIncomeAccountId: "";
            this.creds.NonInvItemExpenseAccountId = response.NonInvItemExpenseAccountId ? response.NonInvItemExpenseAccountId: "";
            this.creds.NonInvItemIncomeAccountId = response.NonInvItemIncomeAccountId? response.NonInvItemIncomeAccountId: "";
            this.creds.IncludeOrderIdInPurchaseOrderMemo = response.IncludeOrderIdInPurchaseOrderMemo == 1? true: false;
            this.creds.NoZeroAmountItemsInPO = response.NoZeroAmountItemsInPO == 1 ? true : false;
            this.creds.BillRollAddCharge = response.BillRollAddCharge == 1? true : false;
            this.creds.PurchaseLineDescForProductMatrix = response.PurchaseLineDescForProductMatrix? response.PurchaseLineDescForProductMatrix: "";
            this.creds.PurchaseLineDescForAddCharge = response.PurchaseLineDescForAddCharge? response.PurchaseLineDescForAddCharge: "";
            this.creds.IncludeSalesRepEmailToInvoice = response.IncludeSalesRepEmailToInvoice == 1? true: false;
            this.creds.NoZeroAmountItemsInInvoice = response.NoZeroAmountItemsInInvoice == 1? true : false;
            this.creds.EnableAnteraUserToQboDepartment = response.EnableAnteraUserToQboDepartment == 1? true : false;
            this.creds.SalesLineDescForProductMatrix = response.SalesLineDescForProductMatrix? response.SalesLineDescForProductMatrix: "";
            this.creds.SalesLineDescForAddCharge = response.SalesLineDescForAddCharge? response.SalesLineDescForAddCharge: "";
            this.creds.PaymentReceiveAccount = response.PaymentReceiveAccount ? response.PaymentReceiveAccount : '';
            this.creds.CreditPaymentReceiveAccount = response.CreditPaymentReceiveAccount ? response.CreditPaymentReceiveAccount : '';
            this.creds.RefundFromAccount = response.RefundFromAccount ? response.RefundFromAccount : '';
            this.creds.ContinueOnPaymentLinkingError = response.ContinueOnPaymentLinkingError === '1' ? true : false;
            this.creds.qboNumberDecimalValue = response.qboNumberDecimalValue? response.qboNumberDecimalValue: "";
            this.creds.enableGST = response.enableGST == "1"? true: false;
            this.creds.enableGSTUsa = response.enableGSTUsa == "1"? true: false;
            this.creds.gstGl = response.gstGl;
            this.creds.hstGl = response.hstGl;
            this.creds.pstGl = response.pstGl;
            this.creds.pstbcGl = response.pstbcGl;
            this.creds.rstGl = response.rstGl;
            this.creds.qstGl = response.qstGl;
            this.creds.enableQbTax = response.enableQbTax == "1"? true: false;
            this.creds.enableIndependentPayments = response.enableIndependentPayments == "1"? true: false;
            this.creds.disableRolling = response.disableRolling == "1"? true: false;
            this.creds.vouchingTemporaryCostAccount = response.vouchingTemporaryCostAccount ? response.vouchingTemporaryCostAccount : '';
            this.creds.billBankAccount = response.billBankAccount ? response.billBankAccount : '';
            const credsCopy = {...this.creds};
            if (this.showTaxMap) {
              this.gstRates.forEach(r => {
                credsCopy[r.code] = new FormControl(response[r.code] ? response[r.code] : '');
              });
            }
            this.credsForm = this.fb.group(credsCopy);

            this.loading = false;
        });
  }

  ngOnInit() {
    this.creditForm = this.fb.group({});
    this.qbService.getLocalCreditTerms()
      .subscribe(response => {
          this.creditTerms = response;
      });
    this.getCustomFields();
    this.credsForm = this.fb.group(this.creds);
    if (this.provinceGstLoaded) {
      this.requireConfigLoad = false;
      this.loadConfig();
    } else {
      this.requireConfigLoad = true;
    }
    this.getFinancialAccounts();
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
              this.financialAccounts.bankAccounts = response.bankAccounts;
          });
  }

  getCustomFields() {
      this.qbService.getCustomFields('QBO')
          .subscribe((response: any) => {
            this.poCustomFields = response.purchaseOrder;
            const poGroup: any = {};
            this.poCustomFields.forEach(customField => {
                poGroup[customField.qbId] = new FormControl(customField.anteraId);
            });
            this.poCustomFieldForm = new FormGroup(poGroup);
            this.invoiceCustomFields = response.invoice;
            const invoiceGroup: any = {};
            this.invoiceCustomFields.forEach(customField => {
                invoiceGroup[customField.qbId] = new FormControl(customField.anteraId);
            });
            this.invoiceCustomFieldForm = new FormGroup(invoiceGroup);
            this.showCustomFields = true;
          });
  }

  saveConfig() {
      this.loading = true;
      const creds = { ...this.credsForm.value};
      creds.EnableAnteraContactToQboCustomer = creds.EnableAnteraContactToQboCustomer ? 1 : 0;
      creds.customFields = {purchaseOrder: this.poCustomFieldForm.value, invoice: this.invoiceCustomFieldForm.value};
      creds.IncludeOrderIdInPurchaseOrderMemo = creds.IncludeOrderIdInPurchaseOrderMemo ? 1 : 0;
      creds.NoZeroAmountItemsInPO = creds.NoZeroAmountItemsInPO ? 1 : 0;
      creds.BillRollAddCharge = creds.BillRollAddCharge ? 1 : 0;
      creds.IncludeSalesRepEmailToInvoice = creds.IncludeSalesRepEmailToInvoice ? 1 : 0;
      creds.NoZeroAmountItemsInInvoice = creds.NoZeroAmountItemsInInvoice ? 1 : 0;
      creds.EnableAnteraUserToQboDepartment = creds.EnableAnteraUserToQboDepartment ? 1 : 0;
      creds.enableGST = creds.enableGST ? 1 : 0;
      creds.enableGSTUsa = creds.enableGST ? 0 : (creds.enableGSTUsa ? 1 : 0);
      creds.enableQbTax = creds.enableQbTax ? 1 : 0;
      creds.enableIndependentPayments = creds.enableIndependentPayments ? 1 : 0;
      creds.disableRolling = creds.disableRolling ? 1 : 0;
      creds.ContinueOnPaymentLinkingError = creds.ContinueOnPaymentLinkingError ? 1 : 0;
      creds.terms = this.creditForm.value;
      this.qbService.setQboConfig(creds)
        .subscribe((response: any) => {
            this.msg.show(response.msg, 'error');
            this.loading = false;
            this.qbService.getQbEnabled();
            this.loadConfig();
        });

  }

  disconnect() {
      this.loading = true;
      this.qbService.qbDisconnect('QBO')
          .subscribe((response: any) => {
              this.msg.show(response.msg, 'error');
              this.loading = false;
              this.loadTaxConfig();
              this.getCustomFields();
              this.loadConfig();
              this.getFinancialAccounts();
          });
  }

  importData() {
      this.loading = true;
      this.qbService.qbImport()
          .subscribe((response:any) => {
              this.msg.show(response.msg, 'error');
              this.loading = false;
              this.loadTaxConfig();
              this.getCustomFields();
              this.loadConfig();
              this.getFinancialAccounts();
          });
  }

}

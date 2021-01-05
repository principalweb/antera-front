import { Component, Input, Inject,ViewEncapsulation, OnInit, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Account } from 'app/models';
import { displayName, fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { find, filter } from 'lodash';

import { AuthService } from 'app/core/services/auth.service';
import { ModuleField } from 'app/models/module-field';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';

@Component({
    selector: 'app-account-form',
    templateUrl: './account-form.component.html',
    styleUrls: ['./account-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AccountFormComponent implements OnInit{
    @Input() account: Account;
    @Input() action = 'new';
    @Output() onSave = new EventEmitter();
    @Input() dropdowns = [];

    accountForm: FormGroup;
    dialogTitle: string;
    service: any;
    filteredUsers = [];
    filteredAccounts = [];
    loading = false ;
    ratings = [];
    pTypes = [];
    accTypes = [];
    industries = [];
    leadSources = [];
    shipAccTypes = [];
    creditTerms = [];
    timezones = [];
    currenyList = [];
    displayName = displayName;

    logoUrl: any;
    fields = [];

    fieldLabel = fieldLabel;
    visibleField = visibleField;
    requiredField = requiredField ;
    identityEnabled: boolean;
    corporateIdentities: any[];
    defaultIdentity = '';
    commissionGroups: any[];
    commissionEnabled: boolean;
    formValidationDlgRef: MatDialogRef<FormValidationComponent>;
    excludeInvalidControls = ['corporateIdentityId', 'commissionGroupId', 'parentAccountId', 'salesRepId', 'salesManagerName', 'csrEmbroideryUserId', 'csrScreenprintUserId'];

  leadsChannels = [];
  selectedLeadsChannels = [];

  adminFeeEnabled: boolean = false;
  baseCurrency = '';

  @ViewChild('leadsChannelsList') leadsChannelsList: ElementRef;
  leadsChannelsListInputCtrl = new FormControl();

    constructor(
        private formBuilder: FormBuilder,
        private api: ApiService,
        public dialogRef: MatDialogRef<AccountFormComponent>,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private authService: AuthService,
        private msg: MessageService
    ) {
        this.action = data.action;
        this.service = data.service;

        if ( this.action === 'edit' )
        {
            this.dialogTitle = 'Edit Account';
            this.account = new Account(data.contact);
        }
        else
        {
            this.dialogTitle = 'Add Account';
            this.account= new Account({});
        }

     }

    ngOnInit() {
        
        this.logoUrl = this.account.logo;

        this.configureCommissions();

        this.api.getCurrencyListForDropDownDOnly()
        .subscribe((res: any) => {
              //this.currencyList = res;
              this.currenyList = res;
              //console.log("res",res)
        }, (err => {
        }));
        this.api
            .getCurrencyConfiguration()
            .subscribe((res: any) => {
                
                if(res.settings) {
                    this.baseCurrency = res.settings.baseCurrency;
                }
                
                
        //this.currencyService.currencySettings.next(res.settings);
        // this.enable = res.settings.enableCurrency === "0" ? false : true;
        // this.autoUpdate =
        //   res.settings.this.accountForm === "0" ? false : true;
        // this.baseCurrency = res.settings.baseCurrency;
        // this.loadedCurrency = res.settings.baseCurrency;
        // this.padding = res.settings.ratePadding;
        // this.loadedPadding = res.settings.ratePadding;
             });
        this.configureCorporateIdentity();

        const ratingDropdown = find(this.dropdowns[0], {name: 'sys_acctrating_list'});
        this.ratings = ratingDropdown.options;

        const creditTermDropdown = find(this.dropdowns[0], {name: 'sys_credit_terms_list'});
        this.creditTerms = creditTermDropdown.options;

        const leadSourceDropdown = find(this.dropdowns[0], {name: 'lead_source_dom'});
        this.leadSources = leadSourceDropdown.options;

        const industryDropdown = find(this.dropdowns[0], {name: 'industry_dom'});
        this.industries = industryDropdown.options;

        const shipAccTypesDropdown = find(this.dropdowns[0], {name: 'sys_shippacct_list'});
        this.shipAccTypes = shipAccTypesDropdown.options;

        const partnerDropdown = find(this.dropdowns[0], {name: 'businesspartner_list'});
        this.pTypes = partnerDropdown.options;

        const accountTypeDropdown = find(this.dropdowns[0], {name: 'account_type_dom'});
        this.accTypes = accountTypeDropdown.options;

        const multiTaxRateDropdown = find(this.dropdowns[0], {name: 'multi_tax_rate_list'});
        const defaultMultiTaxRate = find(multiTaxRateDropdown.options, { isDefault: 1});

        const leadChannelsDropdown = find(this.dropdowns[0], {name: 'sys_leads_channel_list'});
        
        this.leadsChannels = leadChannelsDropdown.options;
  
        this.leadsChannels.forEach((item) => {
  	  if(this.account.leadsChannel.indexOf(item.value) !== -1){
  	      this.selectedLeadsChannels.push(item.value);    
	  }
        });


        if (defaultMultiTaxRate) {
            this.account.multiTaxRate = defaultMultiTaxRate.value;
        }

        this.timezones = filter(this.dropdowns[1], {status: '1'});
        const defaultTimezone = find(this.timezones, {isDefault: '1'});
        if (defaultTimezone) {
            this.account.timeZone = defaultTimezone.timeZone;
        } else {
            this.account.timeZone = '';
        }

        const accountModuleFieldParams = 
        {
            offset: 0,
            limit: 200,
            order: 'module',
            orient: 'asc',
            term: { module : 'Accounts' }
        }
        this.loading = true;
        this.api.getFieldsList(accountModuleFieldParams)
            .subscribe((res: any[]) => {
                this.fields = res.map(moduleField => new ModuleField(moduleField));
                this.loading = false;
                this.accountForm = this.createForm();
                this.accountForm.get('defaultCurrency').setValue(this.baseCurrency);
                this.accountForm.get('salesRep').valueChanges.pipe(
                    debounceTime(400),
                    distinctUntilChanged(),
                ).subscribe(keyword => {
                        if (keyword && keyword.length >=3 ) {
                            this.service.autocompleteUsers(keyword).subscribe(res => {
                                this.filteredUsers = res;
                            });
                        }
                    });
    
                this.accountForm.get('csr').valueChanges.pipe(
                    debounceTime(400),
                    distinctUntilChanged(),
                ).subscribe(keyword => {
                        if (keyword && keyword.length === 0) {
                           this.clearCsr();
                        }
                        if (keyword && keyword.length >=3 ) {
                            this.service.autocompleteUsers(keyword).subscribe(res => {
                                this.filteredUsers = res;
                            });
                        }
                    });

                this.accountForm.get('parentAccount').valueChanges.pipe(
                    debounceTime(400),
                    distinctUntilChanged(),
                ).subscribe(val => {
                        if (val.length >= 3) {
                            this.api.getAccountAutocomplete(val).subscribe((res: any[]) => {
                                this.filteredAccounts = res;
                            });
                        }
                    });
            },() => {this.loading = true;});
    }

  selectCorporateIdentity(ev) {
    const identity = ev.option.value;
    this.accountForm.get('corporateIdentityName').setValue(identity.name);
    this.accountForm.get('corporateIdentityId').setValue(identity.id);
  }

  selectCommissionGroups(ev) {
    const group = ev.option.value;
    this.accountForm.get('commissionGroupName').setValue(group.name);
    this.accountForm.get('commissionGroupId').setValue(group.id);
  }

  clearCorporateIdentity() {
    this.accountForm.patchValue({
      corporateIdentityName: '',
      corporateIdentityId: ''
    });
  }
  clearCommissionGroups() {
    this.accountForm.patchValue({
      commissionGroupName: '',
      commissionGroupId: ''
    });
  }

    clearCsr() {
        this.accountForm.patchValue({
            csrId: null,
            csr: null,
        });
    }

    private configureCommissions() {
        const params = {
            offset: 0,
            limit: 50,
            order: "name",
            orient: "asc",
            term: {
                name: '',
                description: '',
                modifiedByName: '',
            }
        };
        this.api.getCommissionGroupsList(params).subscribe((res: any[]) => {
            this.commissionGroups = res;
            if (this.commissionGroups.length > 0) {
                this.commissionEnabled = true;
            } 
        });
    }

    ngAfterViewInit() {

    }

    private configureCorporateIdentity() {
        this.api.getAdvanceSystemConfig({ module: 'Orders', setting: 'identityEnabled' }).subscribe((res: any) => {
            if (res.value && res.value != 1) {
                return;
            }
            this.api.getIdentityList().subscribe((res: any[]) => {
                this.identityEnabled = true;
                this.corporateIdentities = res;
            });
        });
    }

    createForm() {
        const user = this.authService.getCurrentUser();

        if (!this.account.corporateIdentityId && user.corpIdentity) {
          this.account.corporateIdentityId = user.corpIdentity;
        }
        if (!this.account.corporateIdentityName && user.corporateIdentityName) {
            this.account.corporateIdentityName = user.corporateIdentityName;
          }
        if (!this.account.commissionGroupId && user.commissionGroupId) {
            this.account.commissionGroupId = user.commissionGroupId;
          }
          if (!this.account.commissionGroupName && user.commissionGroupName) {
            this.account.commissionGroupName = user.commissionGroupName;
          }
          
        return this.formBuilder.group({
            accountName          : [this.account.accountName, Validators.required],
            corporateIdentityId  : requiredField('corporateIdentityName',this.fields) ? [this.account.corporateIdentityId, Validators.required] : [this.account.corporateIdentityId],
            corporateIdentityName: requiredField('corporateIdentityName',this.fields) ? [this.account.corporateIdentityName, Validators.required] : [this.account.corporateIdentityName],
            parentAccount        : requiredField('parentAccount',this.fields) ? [this.account.parentAccount, Validators.required] : [this.account.parentAccount],
            parentAccountId      : requiredField('parentAccountId',this.fields) ? [this.account.parentAccountId, Validators.required] : [this.account.parentAccountId],
            rating               : requiredField('rating',this.fields) ? [this.account.rating, Validators.required] : [this.account.rating],
            partnerType          : requiredField('partnerType',this.fields) ? [this.account.partnerType, Validators.required] : [this.account.partnerType],
            timeZone             : requiredField('timeZone',this.fields) ? [this.account.timeZone, Validators.required] : [this.account.timeZone],
            industry             : requiredField('industry',this.fields) ? [this.account.industry, Validators.required] : [this.account.industry],
            accountExtension     : requiredField('accountExtension',this.fields) ? [this.account.accountExtension, Validators.required] : [this.account.accountExtension],
            website              : requiredField('website',this.fields) ? [this.account.website, Validators.required] : [this.account.website],
            shipAddress1         : requiredField('shipAddress1', this.fields) ? [this.account.shipAddress1, Validators.required] : [this.account.shipAddress1],
            shipAddress2         : requiredField('shipAddress2', this.fields) ? [this.account.shipAddress2, Validators.required] : [this.account.shipAddress2],
            shipCity             : requiredField('shipCity', this.fields) ? [this.account.shipCity, Validators.required] : [this.account.shipCity],
            shipState            : requiredField('shipState', this.fields) ? [this.account.shipState, Validators.required] : [this.account.shipState],
            shipPostalcode       : requiredField('shipPostalcode', this.fields) ? [this.account.shipPostalcode, Validators.required] : [this.account.shipPostalcode],
            shipCountry          : requiredField('shipCountry', this.fields) ? [this.account.shipCountry, Validators.required] : [this.account.shipCountry],
            salesRepId           : [this.account.salesRepId == '' ? user.userId : this.account.salesRepId, Validators.required],
            salesRep             : [this.account.salesRep == '' ? `${user.firstName} ${user.lastName}` : this.account.salesRep, Validators.required],
            csr                  : requiredField('csr',this.fields) ? [this.account.csr, Validators.required] :[this.account.csr],
            csrId                : requiredField('csrId',this.fields) ? [this.account.csrId, Validators.required] : [this.account.csrId],
            phone                : requiredField('phone',this.fields) ? [this.account.phone, Validators.required] : [this.account.phone],
            fax                  : requiredField('fax',this.fields) ? [this.account.fax, Validators.required] : [this.account.fax],
            leadSource           : requiredField('leadSource',this.fields) ? [this.account.leadSource, Validators.required] : [this.account.leadSource],
            priorSalesRep        : requiredField('priorSalesRep',this.fields) ? [this.account.priorSalesRep, Validators.required] : [this.account.priorSalesRep],
            accountType          : [this.account.accountType, Validators.required],
            shippingAccountNo    : requiredField('shippingAccountNo',this.fields) ? [this.account.shippingAccountNo, Validators.required] : [this.account.shippingAccountNo],
            shippingAccountType  : requiredField('shippingAccountType',this.fields) ? [this.account.shippingAccountType, Validators.required] : [this.account.shippingAccountType],
            billAddress1         : requiredField('billAddress1',this.fields) ? [this.account.billAddress1, Validators.required] : [this.account.billAddress1],
            billAddress2         : requiredField('billAddress2',this.fields) ? [this.account.billAddress2, Validators.required] : [this.account.billAddress2],
            billCity             : requiredField('billCity',this.fields) ? [this.account.billCity, Validators.required] : [this.account.billCity],
            billState            : requiredField('billState',this.fields) ? [this.account.billState, Validators.required] : [this.account.billState],
            billPostalcode       : requiredField('billPostalcode',this.fields) ? [this.account.billPostalcode, Validators.required] : [this.account.billPostalcode],
            billCountry          : requiredField('billCountry',this.fields) ? [this.account.billCountry, Validators.required] : [this.account.billCountry],
            generalInfo          : requiredField('generalInfo',this.fields) ? [this.account.generalInfo, Validators.required] : [this.account.generalInfo],
            creditTerms          : requiredField('creditTerms',this.fields) ? [this.account.creditTerms, Validators.required] : [this.account.creditTerms],
            taxStatus            : requiredField('taxStatus',this.fields) ? [this.account.taxStatus == '1' ? true : false, Validators.required] : [this.account.taxStatus == '1' ? true : false],
            taxExemptNo          : requiredField('taxExemptNo',this.fields) ? [this.account.taxExemptNo, Validators.required] : [this.account.taxExemptNo],
            taxExempt            : requiredField('taxExempt',this.fields) ? [this.account.taxExempt == '1' ? true : false, Validators.required] : [this.account.taxExempt == '1' ? true : false],
            vipDiscountsForOrders: requiredField('vipDiscountsForOrders',this.fields) ? [this.account.vipDiscountsForOrders, Validators.required] : [this.account.vipDiscountsForOrders],
            ytdSales             : requiredField('ytdSales',this.fields) ? [this.account.ytdSales, [Validators.min(0), Validators.maxLength(11), Validators.required]] : [this.account.ytdSales,[Validators.min(0), Validators.maxLength(11)]],
            lastYearSales        : requiredField('lastYearSales',this.fields) ? [this.account.lastYearSales, Validators.required] : [this.account.lastYearSales],
            highCreditLimit      : requiredField('highCreditLimit',this.fields) ? [this.account.highCreditLimit, Validators.required] : [this.account.highCreditLimit],
            defaultTaxRate       : requiredField('defaultTaxRate',this.fields) ? [this.account.defaultTaxRate, Validators.required] : [this.account.defaultTaxRate],
            webstoreUrl          : requiredField('webstoreUrl',this.fields) ? [this.account.webstoreUrl, Validators.required] : [this.account.webstoreUrl],
            eqp                  : requiredField('eqp',this.fields) ? [this.account.eqp == '1' ? true : false, Validators.required] : [this.account.eqp == '1' ? true : false],
            artContactName       : requiredField('artContactName',this.fields) ? [this.account.artContactName, Validators.required] : [this.account.artContactName],
            artContactEmail      : requiredField('artContactEmail',this.fields) ? [this.account.artContactEmail, Validators.required] : [this.account.artContactEmail],
            csRepName            : requiredField('csRepName',this.fields) ? [this.account.csRepName, Validators.required] : [this.account.csRepName],
            csRepEmail           : requiredField('csRepEmail',this.fields) ? [this.account.csRepEmail, Validators.required] : [this.account.csRepEmail],
            salesRepEmail        : requiredField('salesRepEmail',this.fields) ? [this.account.salesRepEmail, Validators.required] : [this.account.salesRepEmail],
            sampleEmail          : requiredField('sampleEmail',this.fields) ? [this.account.sampleEmail, Validators.required] : [this.account.sampleEmail],
            multiTaxRate         : requiredField('multiTaxRate',this.fields) ? [this.account.multiTaxRate, Validators.required] : [this.account.multiTaxRate],
            defaultCurrency         : requiredField('defaultCurrency',this.fields) ? [this.account.defaultCurrency, Validators.required] : [this.account.defaultCurrency],
            alternateAccountNumber : requiredField('alternateAccountNumber',this.fields) ? [this.account.alternateAccountNumber, Validators.required] : [this.account.alternateAccountNumber],
            commissionGroupId    : requiredField('commissionGroupName',this.fields) ? [this.account.commissionGroupId, Validators.required] : [this.account.commissionGroupId],
            commissionGroupName  : requiredField('commissionGroupName',this.fields) ? [this.account.commissionGroupName, Validators.required] : [this.account.commissionGroupName],
            leadsChannel  : requiredField('leadsChannel',this.fields) ? [this.account.leadsChannel, Validators.required] : [this.account.leadsChannel],
        });
    }

    save(form) {

        if(this.accountForm.get('csr').value == null || this.accountForm.get('csr').value == '' || this.accountForm.get('csrId').value == null || this.accountForm.get('csrId').value == ''){
            this.accountForm.patchValue({
              csr: '',
              csrId: ''
            });        
        }

        if(this.accountForm.get('salesRep').value == null || this.accountForm.get('salesRep').value == '' || this.accountForm.get('salesRepId').value == null || this.accountForm.get('salesRepId').value == ''){
        this.accountForm.patchValue({
          salesRep: '',
          salesRepId: ''
        });        
        }

        if(this.accountForm.get('parentAccount').value == null || this.accountForm.get('parentAccount').value == '' || this.accountForm.get('parentAccountId').value == null || this.accountForm.get('parentAccountId').value == ''){
        this.accountForm.patchValue({
          parentAccount: '',
          parentAccountId: ''
        });        
        }

        if(this.accountForm.get('corporateIdentityName').value == null || this.accountForm.get('corporateIdentityName').value == '' || this.accountForm.get('corporateIdentityId').value == null || this.accountForm.get('corporateIdentityId').value == ''){
        this.accountForm.patchValue({
          corporateIdentityName: '',
          corporateIdentityId: ''
        });        
        }

        if(this.accountForm.get('commissionGroupName').value == null || this.accountForm.get('commissionGroupName').value == '' || this.accountForm.get('commissionGroupId').value == null || this.accountForm.get('commissionGroupId').value == ''){
        this.accountForm.patchValue({
          commissionGroupName: '',
          commissionGroupId: ''
        });        
        }
        this.accountForm.get('leadsChannel').setValue(this.selectedLeadsChannels);
        if (this.accountForm.invalid) {
            //this.msg.show('Please complete the form first', 'error');
            this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
              panelClass: 'app-form-validation',
              data: {
                action: 'new',
                moduleForm: this.accountForm,
                fields: this.fields,
                excludeInvalidControls: this.excludeInvalidControls
              }
            });

            this.formValidationDlgRef.afterClosed().subscribe(data => {
              if (data) {
                data.invalidControls.forEach((control) => {
                  this.accountForm.get(control).markAsTouched();
                });
              }
              this.formValidationDlgRef = null;
            });
            return;
        }
        const data = {
            ...this.account,
            ...form.getRawValue(),
            logo: this.logoUrl
        };
        this.onSave.emit(data);
    }

    selectAssignee(ev) {
        const assignee = ev.option.value;
        this.accountForm.get('salesRep').setValue(assignee.name);
        this.accountForm.get('salesRepId').setValue(assignee.id);
    }

    clearAssignee() {
      this.accountForm.patchValue({
        salesRep: '',
        salesRepId: ''
      });
    }


    selectCSR(ev) {
        const csr = ev.option.value;
        this.accountForm.get('csr').setValue(csr.name);
        this.accountForm.get('csrId').setValue(csr.id);
    }

    selectParentAccount(ev) {
        const acc = ev.option.value;
        this.accountForm.get('parentAccount').setValue(acc.name);
        this.accountForm.get('parentAccountId').setValue(acc.id);
    }
    clearParentAccount() {
        this.accountForm.patchValue({
            parentAccount: '',
            parentAccountId: '',
        });
    }


    update() {
        if (!this.accountForm.valid) return;
        this.service.updateAccount({
            ...this.account,
            ...this.accountForm.value,
        })
        .subscribe(() => {
            this.dialogRef.close('saved');
        }, () => {
            this.dialogRef.close();
        });
    }

    onFileChange(event) {
        if(event.target.files.length > 0) {
            let file = event.target.files[0];
            this.uploadAccountLogoImage(file);
        }
    }

    uploadAccountLogoImage(file) {
        if (!file) return;
        const data = new FormData();
        data.append('File', file);
        this.api.uploadAccountLogo(data)
            .subscribe((res: any) => {
                this.logoUrl = res.msg;
            }, (err => {
            }));
    }

    copyBillingAddress(ev) {
        const accountFormData = this.accountForm.value;
        if (ev.checked) {
            this.accountForm.get('shipAddress1').setValue(accountFormData.billAddress1);
            this.accountForm.get('shipAddress2').setValue(accountFormData.billAddress2);
            this.accountForm.get('shipCity').setValue(accountFormData.billCity);
            this.accountForm.get('shipState').setValue(accountFormData.billState);
            this.accountForm.get('shipPostalcode').setValue(accountFormData.billPostalcode);
            this.accountForm.get('shipCountry').setValue(accountFormData.billCountry);
        }
        else {

        }
    }
    

  leadsChannelSelected(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.value.value);
    if (event.option.value.value) {
      this.selectedLeadsChannels.push(event.option.value.value);
      this.leadsChannelsListInputCtrl.setValue(null);
    }
  }

  leadsChannelLabel(value) {
      const term = this.leadsChannels.find(item => item.value == value);
      if(term.label){
          return term.label;
      }
      return '';
  }

  removeLeadsChannels(id) {
    const index = this.selectedLeadsChannels.indexOf(id);
    if (index >= 0) {
      this.selectedLeadsChannels.splice(index, 1);
    }
  }
    
}

import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { Account } from 'app/models';
import { fuseAnimations } from '@fuse/animations';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';
import { formatInteger } from 'app/utils/helper';
import { Subscription } from 'rxjs';
import { AccountsService } from '../../accounts.service';
import { find, filter } from 'lodash';
import { fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { MessageService } from 'app/core/services/message.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';

@Component({
  selector: 'account-additional-info',
  templateUrl: './additional-info.component.html',
  styleUrls: ['./additional-info.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AdditionalInfoComponent implements OnInit {
  @Input() account: Account;
  @Input() tabName = '';
  @Output() edit = new EventEmitter();

  editingInfo = false;

  ratings = [];
  timezones = [];
  industries = [];
  leadSources = [];
  shipAccTypes = [];
  multiTaxRates = [];
  fields = [];
  accTaxExemptionReasonTypes = [];
  accBrandAffiliationTypes = [];
  accAnnualBudgetTypes = [];
  vendorPaymentTerms = [];
  selectedVendorPaymentTerms: string[] = [];
  filteredUsers = [];
  filteredCsrEmb = [];
  filteredCsrScr = [];
  leadsChannels = [];
  selectedLeadsChannels = [];
  currencyList = [];
  pricingMethodsList = [];

  @ViewChild('vendorPaymentTermsInput') vendorPaymentTermsInput: ElementRef;
  vendorPaymentTermsInputCtrl = new FormControl();

  @ViewChild('leadsChannelsList') leadsChannelsList: ElementRef;
  leadsChannelsListInputCtrl = new FormControl();
  
  timezone = '';
  additionInfoForm: FormGroup;
  logoUrl: any;
  loading = false;
  displayInteger = formatInteger;
  onDropdownOptionsForAccountChangedSubscription: Subscription;
  onTimezonesDropdownChangedSubscription: Subscription;
  onModuleFieldsChangedSubscription: Subscription;
  
  formValidationDlgRef: MatDialogRef<FormValidationComponent>;
  excludeInvalidControls = ['corporateIdentityId', 'commissionGroupId', 'parentAccountId', 'salesRepId', 'salesManagerName', 'csrEmbroideryUserId', 'csrScreenprintUserId'];

  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;

  adminFeeEnabled: boolean = false;

  constructor(    
    private formBuilder: FormBuilder,
    private api: ApiService,
    private accountsService: AccountsService,
    private msg: MessageService,
    private dialog: MatDialog,
  ) { }

  saveAdditionalInfo() {
    // this.edit.emit();
        if(this.tabName == 'Customer Info'){
            if(this.additionInfoForm.get('csrEmbroideryUserName').value == null 
            || this.additionInfoForm.get('csrEmbroideryUserName').value == '' 
            || this.additionInfoForm.get('csrEmbroideryUserId').value == null 
            || this.additionInfoForm.get('csrEmbroideryUserId').value == ''){
                this.additionInfoForm.patchValue({
                  csrEmbroideryUserName: '',
                  csrEmbroideryUserId: ''
                });        
            }

            if(this.additionInfoForm.get('csrScreenprintUserName').value == null 
            || this.additionInfoForm.get('csrScreenprintUserName').value == '' 
            || this.additionInfoForm.get('csrScreenprintUserId').value == null 
            || this.additionInfoForm.get('csrScreenprintUserId').value == ''){
                this.additionInfoForm.patchValue({
                  csrScreenprintUserName: '',
                  csrScreenprintUserId: ''
                });        
            }

            if(this.additionInfoForm.get('salesManagerName').value == null 
            || this.additionInfoForm.get('salesManagerName').value == '' 
            || this.additionInfoForm.get('salesManagerId').value == null 
            || this.additionInfoForm.get('salesManagerId').value == ''){
                this.additionInfoForm.patchValue({
                  salesManagerName: '',
                  salesManagerId: ''
                });        
            }
        }

    if (this.additionInfoForm.invalid) {
      //this.msg.show('Please complete the form first', 'error');
            this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
              panelClass: 'app-form-validation',
              data: {
                action: 'new',
                moduleForm: this.additionInfoForm,
                fields: this.fields,
                excludeInvalidControls: this.excludeInvalidControls
              }
            });

            this.formValidationDlgRef.afterClosed().subscribe(data => {
              if (data) {
                data.invalidControls.forEach((control) => {
                  this.additionInfoForm.get(control).markAsTouched();
                });
              }
              this.formValidationDlgRef = null;
            });

      return;
    }
    if(this.tabName == 'Vendor Info'){
        this.additionInfoForm.get('vendorPaymentTerms').setValue(this.selectedVendorPaymentTerms);
    }
    if(this.tabName == 'Additional Info'){
        this.additionInfoForm.get('leadsChannel').setValue(this.selectedLeadsChannels);
    }

    this.editAdditionalInfo();
    console.log('additionInfoForm', this.additionInfoForm.getRawValue());
    this.edit.emit({type: 'AdditionalInfo', dataForm: this.additionInfoForm, logo: this.logoUrl});
  }

  ngOnInit() {
    this.onDropdownOptionsForAccountChangedSubscription =
      this.accountsService.onDropdownOptionsForAccountChanged
          .subscribe((res: any[]) => {
              if (!res) return;
              const ratingDropdown = find(res, {name: 'sys_acctrating_list'});
              this.ratings = ratingDropdown && ratingDropdown.options;

              const leadSourceDropdown = find(res, {name: 'lead_source_dom'});
              this.leadSources = leadSourceDropdown && leadSourceDropdown.options;

              const industryDropdown = find(res, {name: 'industry_dom'});
              this.industries = industryDropdown && industryDropdown.options;

              const shipAccTypesDropdown = find(res, {name: 'sys_shippacct_list'});
              this.shipAccTypes = shipAccTypesDropdown && shipAccTypesDropdown.options;

              const multiTaxDropdown = find(res, {name: 'multi_tax_rate_list'});
              this.multiTaxRates = multiTaxDropdown && multiTaxDropdown.options;

              const accountTaxExemptionReasonDropdown = find(res, {name: 'sys_tax_exemption_reason_id_list'});
              this.accTaxExemptionReasonTypes = accountTaxExemptionReasonDropdown && accountTaxExemptionReasonDropdown.options;              

              const accountBrandAffiliationDropdown = find(res, {name: 'sys_brand_affiliation_list'});
              this.accBrandAffiliationTypes = accountBrandAffiliationDropdown && accountBrandAffiliationDropdown.options;              

              const accountAnnualBudgetDropdown = find(res, {name: 'sys_annual_budget_list'});
              this.accAnnualBudgetTypes = accountAnnualBudgetDropdown && accountAnnualBudgetDropdown.options;              

              const vendorPaymentTermsDropdown = find(res, {name: 'sys_vendor_payment_terms_list'});
              this.vendorPaymentTerms = vendorPaymentTermsDropdown && vendorPaymentTermsDropdown.options;              

              if(this.vendorPaymentTerms && this.vendorPaymentTerms.length > 0){
                      this.vendorPaymentTerms.forEach((item) => {
                          if(this.account.vendorPaymentTerms.indexOf(item.id) !== -1){
                              this.selectedVendorPaymentTerms.push(item.id);    
                          }
                      });              
              }

              const leadChannelsDropdown = find(res, {name: 'sys_leads_channel_list'});
              this.leadsChannels = leadChannelsDropdown.options;
   
              this.leadsChannels.forEach((item) => {
                  if(this.account.leadsChannel.indexOf(item.value) !== -1){
                      this.selectedLeadsChannels.push(item.value);    
                  }
              });


              /*
              this.selectedVendorPaymentTerms = this.vendorPaymentTerms.filter((item) => {
                return this.account.vendorPaymentTerms.indexOf(item.id) !== -1;
              });
              */
              const defaultMultiTaxRate = find(this.multiTaxRates, { isDefault: 1});

              if (defaultMultiTaxRate) {
                  this.account.multiTaxRate = defaultMultiTaxRate.value;
              }
          });

    this.onTimezonesDropdownChangedSubscription = 
      this.accountsService.onTimezonesDropdownChanged
          .subscribe((res: any[]) => {
            if (!res) return;
            this.timezones = filter(res, {status: '1'});
            if (this.account.timeZone && this.account.timeZone != '')
            {
              const timezone = find(this.timezones, {timeZone: this.account.timeZone});
              if (timezone)
                this.timezone = `${timezone.timeZone} ${timezone.gmtOffset}`;
            }
          });
    
    this.onModuleFieldsChangedSubscription = 
        this.accountsService.onModuleFieldsChanged
            .subscribe((fields: any[]) => {
              this.fields = fields;
            });

    this.additionInfoForm = this.createForm();
    this.logoUrl = this.account.logo;
    if(this.tabName == 'Customer Info'){
       this.taxExemptValidation();

            this.additionInfoForm.get('salesManagerName').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            ).subscribe(keyword => {
                if (keyword && keyword.length >=3 ) {
                this.accountsService.autocompleteUsers(keyword).subscribe((res: any[]) => {
                    this.filteredUsers = res;
                });
                }
            });

            this.additionInfoForm.get('csrEmbroideryUserName').valueChanges.pipe(
              debounceTime(400),
              distinctUntilChanged(),
            )
            .subscribe(keyword => {
            if (keyword && keyword.length === 0) {
              this.clearCsrEmb();
            }
            if (keyword && keyword.length > 3) {
              this.accountsService.autocompleteUsers(keyword).subscribe((res: any[]) => {
                  this.filteredCsrEmb = res;
              });
            }
            });

            this.additionInfoForm.get('csrScreenprintUserName').valueChanges.pipe(
              debounceTime(400),
              distinctUntilChanged(),
            )
            .subscribe(keyword => {
            if (keyword && keyword.length === 0) {
              this.clearCsrScr();
            }
            if (keyword && keyword.length > 3) {
              this.accountsService.autocompleteUsers(keyword).subscribe((res: any[]) => {
                  this.filteredCsrScr = res;
              });
            }
            });

    }
    if(this.tabName == 'Vendor Info'){
    /*
        this.vendorPaymentTermsInputCtrl.valueChanges.pipe(
            map(val => displayName(val).trim().toLowerCase()),
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(keyword => {
            if (keyword.length >= 3) {
                this.service.autocompleteAccounts(keyword).subscribe(res => {
                    this.filteredAccounts = res;
                });
            }
        });    
        */
    }

    this.api.getAdvanceSystemConfig({module: 'Orders', setting: 'enableAdminFee' }).subscribe((res: any) => {
        if (res.value && res.value == 1) {
            this.adminFeeEnabled = true;
        }
    })


//get getCurrencyListForDropDownDOnly


    this.api.getCurrencyListForDropDownDOnly()
        .subscribe((res: any) => {
          this.currencyList = res;
        }, (err => {
    }));

    this.api.getPricingMethodsListForAccount()
        .subscribe((res: any) => {
          this.pricingMethodsList = res;
        }, (err => {
    }));
        
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.account.timeZone && this.account.timeZone != '')
    {
      const timezone = find(this.timezones, {timeZone: this.account.timeZone});
      if (timezone)
        this.timezone = `${timezone.timeZone} ${timezone.gmtOffset}`;
    }
  }

  ngOnDestory() {
    this.onDropdownOptionsForAccountChangedSubscription.unsubscribe();
    if (this.onModuleFieldsChangedSubscription) this.onModuleFieldsChangedSubscription.unsubscribe();  
  }
  
  editAdditionalInfo() {
    this.editingInfo = !this.editingInfo;
    // if (this.editingInfo)
    //   this.additionInfoForm = this.createForm();
  }

  displayTaxExemptionReason(value) {
    const accTaxExemptionReasonType = find(this.accTaxExemptionReasonTypes, {value: value});
    if (!accTaxExemptionReasonType) return '';
    return accTaxExemptionReasonType.label;
  }

  taxExemptValidation() {
     const taxExemptControl = this.additionInfoForm.get('taxExempt');
     const taxExemptionReasonIdControl = this.additionInfoForm.get('taxExemptionReasonId');
    
     this.additionInfoForm.get('taxExempt').valueChanges
       .subscribe(taxExempt => {
         if (taxExempt) {
           this.additionInfoForm.get('taxExemptionReasonId').setValidators([Validators.required, Validators.min(1)]);
           this.account.taxExempt = '1';
         }else{
           this.account.taxExempt = '0';
           taxExemptionReasonIdControl.setValue('19');
           this.additionInfoForm.get('taxExemptionReasonId').setValidators(null);
         }
         this.additionInfoForm.get('taxExemptionReasonId').updateValueAndValidity();
      });
  }  

  createForm() {
    switch(this.tabName){
        case 'Additional Info':
            return this.formBuilder.group({

                timeZone              : requiredField('timeZone',this.fields) ? [this.account.timeZone, Validators.required] : [this.account.timeZone],
                accountExtension      : requiredField('accountExtension',this.fields) ? [this.account.accountExtension, Validators.required] : [this.account.accountExtension],
                website               : requiredField('website',this.fields) ? [this.account.website, Validators.required] : [this.account.website],
                fax                   : requiredField('fax',this.fields) ? [this.account.fax, Validators.required] : [this.account.fax],
                priorSalesRep         : requiredField('priorSalesRep',this.fields) ? [this.account.priorSalesRep, Validators.required] : [this.account.priorSalesRep],
                generalInfo           : requiredField('generalInfo',this.fields) ? [this.account.generalInfo, Validators.required] : [this.account.generalInfo],
                webstoreUrl           : requiredField('webstoreUrl',this.fields) ? [this.account.webstoreUrl, Validators.required] : [this.account.webstoreUrl],
                leadsChannel          : requiredField('leadsChannel',this.fields) ? [this.account.leadsChannel, Validators.required] : [this.account.leadsChannel],
                defaultCurrency       : requiredField('defaultCurrency',this.fields) ? [this.account.defaultCurrency, Validators.required] : [this.account.defaultCurrency],
                popupNotes            : requiredField('popupNotes',this.fields) ? [this.account.popupNotes, Validators.required] : [this.account.popupNotes],
                popupNotes_show_order   : [this.account.popupNotes_show_order=='0'?false:true],
                popupNotes_show_order_accview   : [this.account.popupNotes_show_order_accview=="0"?false:true]
            });
        case 'Customer Info':
            return this.formBuilder.group({

                annualBudget          : requiredField('annualBudget',this.fields) ? [this.account.annualBudget, Validators.required] : [this.account.annualBudget],
                brandAffiliation      : requiredField('brandAffiliation',this.fields) ? [this.account.brandAffiliation, Validators.required] : [this.account.brandAffiliation],
                csrEmbroideryUserId   : requiredField('csrEmbroideryUserName',this.fields) ? [this.account.csrEmbroideryUserId, Validators.required] : [this.account.csrEmbroideryUserId],
                csrEmbroideryUserName : requiredField('csrEmbroideryUserName',this.fields) ? [this.account.csrEmbroideryUserName, Validators.required] : [this.account.csrEmbroideryUserName],
                csrScreenprintUserId  : requiredField('csrScreenprintUserName',this.fields) ? [this.account.csrScreenprintUserId, Validators.required] : [this.account.csrScreenprintUserId],
                csrScreenprintUserName: requiredField('csrScreenprintUserName',this.fields) ? [this.account.csrScreenprintUserName, Validators.required] : [this.account.csrScreenprintUserName],
                customerOrderNote     : requiredField('customerOrderNote',this.fields) ? [this.account.customerOrderNote, Validators.required] : [this.account.customerOrderNote],
                defaultTaxRate        : requiredField('defaultTaxRate',this.fields) ? [this.account.defaultTaxRate, Validators.required] : [this.account.defaultTaxRate],
                firstOrderDate        : requiredField('firstOrderDate',this.fields) ? [this.account.firstOrderDate, Validators.required] : [this.account.firstOrderDate],
                franchiseVendor       : requiredField('franchiseVendor',this.fields) ? [this.account.franchiseVendor == '1' ? true : false, Validators.required] : [this.account.franchiseVendor == '1' ? true : false],
                adminFeeRate          : (this.account.adminFeeRate) ? [this.account.adminFeeRate] : 0,
                adminFeeType          : (this.account.adminFeeType) ? [this.account.adminFeeType] : "PERCENT",
                highCreditLimit       : requiredField('highCreditLimit',this.fields) ? [this.account.highCreditLimit, Validators.required] : [this.account.highCreditLimit],
                industry              : requiredField('industry',this.fields) ? [this.account.industry, Validators.required] : [this.account.industry],
                inhouseCustomer       : requiredField('inhouseCustomer',this.fields) ? [this.account.inhouseCustomer == '1' ? true : false, Validators.required] : [this.account.inhouseCustomer == '1' ? true : false],
                doNotSendToShipStation: requiredField('doNotSendToShipStation',this.fields) ? [this.account.doNotSendToShipStation == '1' ? true : false, Validators.required] : [this.account.doNotSendToShipStation == '1' ? true : false],
                customerPO: requiredField('customerPO',this.fields) ? [this.account.customerPO == '1' ? true : false, Validators.required] : [this.account.customerPO == '1' ? true : false],
                useStoreCostPrice     : requiredField('useStoreCostPrice',this.fields) ? [this.account.useStoreCostPrice == '1' ? true : false, Validators.required] : [this.account.useStoreCostPrice == '1' ? true : false],
                useStorePrice         : requiredField('useStorePrice',this.fields) ? [this.account.useStorePrice == '1' ? true : false, Validators.required] : [this.account.useStorePrice == '1' ? true : false],
                useShipCost           : requiredField('useShipCost',this.fields) ? [this.account.useShipCost == '1' ? true : false, Validators.required] : [this.account.useShipCost == '1' ? true : false],
                useShipCostPriceMargin: requiredField('useShipCostPriceMargin',this.fields) ? [this.account.useShipCostPriceMargin == '1' ? true : false, Validators.required] : [this.account.useShipCostPriceMargin == '1' ? true : false],
                bookingOrderNotSentShipStation: requiredField('bookingOrderNotSentShipStation',this.fields) ? [this.account.bookingOrderNotSentShipStation == '1' ? true : false, Validators.required] : [this.account.bookingOrderNotSentShipStation == '1' ? true : false],
                lastYearSales         : requiredField('lastYearSales',this.fields) ? [this.account.lastYearSales, Validators.required] : [this.account.lastYearSales],
                leadSource            : requiredField('leadSource',this.fields) ? [this.account.leadSource, Validators.required] : [this.account.leadSource],
                multiTaxRate          : requiredField('multiTaxRate',this.fields) ? [this.account.multiTaxRate, Validators.required] : [this.account.multiTaxRate],
                rating                : requiredField('rating',this.fields) ? [this.account.rating, Validators.required] : [this.account.rating],
                salesManagerId        : requiredField('salesManagerId',this.fields) ? [this.account.salesManagerId, Validators.required] : [this.account.salesManagerId],
                salesManagerName      : requiredField('salesManagerId',this.fields) ? [this.account.salesManagerName, Validators.required] : [this.account.salesManagerName],
                shippingAccountNo     : requiredField('shippingAccountNo',this.fields) ? [this.account.shippingAccountNo, Validators.required] : [this.account.shippingAccountNo],
                shippingAccountType   : requiredField('shippingAccountType',this.fields) ? [this.account.shippingAccountType, Validators.required] : [this.account.shippingAccountType],
                taxExempt             : requiredField('taxExempt',this.fields) ? [this.account.taxExempt == '1' ? true : false, Validators.required] : [this.account.taxExempt == '1' ? true : false],
                taxExemptionReasonId  : (this.account.taxExempt == '1') ? [this.account.taxExemptionReasonId, [Validators.required, Validators.min(1)]] : [this.account.taxExemptionReasonId],
                taxExemptNo           : requiredField('taxExemptNo',this.fields) ? [this.account.taxExemptNo, Validators.required] : [this.account.taxExemptNo],
                vipDiscountsForOrders : requiredField('vipDiscountsForOrders',this.fields) ? [this.account.vipDiscountsForOrders, Validators.required] : [this.account.vipDiscountsForOrders],
                ytdSales              : requiredField('ytdSales',this.fields) ? [this.account.ytdSales, [Validators.min(0), Validators.maxLength(60), Validators.required]] : [this.account.ytdSales,[Validators.min(0), Validators.maxLength(60)]],
                pricingMethods         : requiredField('pricingMethods',this.fields) ? [this.account.pricingMethods, Validators.required] : [this.account.pricingMethods],
                

            });
        case 'Vendor Info':
            return this.formBuilder.group({

                artContactEmail       : requiredField('artContactEmail',this.fields) ? [this.account.artContactEmail, Validators.required] : [this.account.artContactEmail],
                artContactName        : requiredField('artContactName',this.fields) ? [this.account.artContactName, Validators.required] : [this.account.artContactName],
                csRepEmail            : requiredField('csRepEmail',this.fields) ? [this.account.csRepEmail, Validators.required] : [this.account.csRepEmail],
                csRepName             : requiredField('csRepName',this.fields) ? [this.account.csRepName, Validators.required] : [this.account.csRepName],
                doNotSendToShipStation: requiredField('doNotSendToShipStation',this.fields) ? [this.account.doNotSendToShipStation == '1' ? true : false, Validators.required] : [this.account.doNotSendToShipStation == '1' ? true : false],
                importVendor          : requiredField('importVendor',this.fields) ? [this.account.importVendor == '1' ? true : false, Validators.required] : [this.account.importVendor == '1' ? true : false],
                eqp                   : requiredField('eqp',this.fields) ? [this.account.eqp == '1' ? true : false, Validators.required] : [this.account.eqp == '1' ? true : false],
                gstCountryTaxRateOnPo : requiredField('gstCountryTaxRateOnPo',this.fields) ? [this.account.gstCountryTaxRateOnPo, Validators.required] : [this.account.gstCountryTaxRateOnPo],
                gstTaxRateOnPo        : requiredField('gstTaxRateOnPo',this.fields) ? [this.account.gstTaxRateOnPo, Validators.required] : [this.account.gstTaxRateOnPo],
                hstTaxRateOnPo        : requiredField('hstTaxRateOnPo',this.fields) ? [this.account.hstTaxRateOnPo, Validators.required] : [this.account.hstTaxRateOnPo],
                industry              : requiredField('industry',this.fields) ? [this.account.industry, Validators.required] : [this.account.industry],
                inhouseVendor         : requiredField('inhouseVendor',this.fields) ? [this.account.inhouseVendor == '1' ? true : false, Validators.required] : [this.account.inhouseVendor == '1' ? true : false],
                preferredVendor       : requiredField('preferredVendor',this.fields) ? [this.account.preferredVendor == '1' ? true : false, Validators.required] : [this.account.preferredVendor == '1' ? true : false],
                pstTaxRateOnPo        : requiredField('pstTaxRateOnPo',this.fields) ? [this.account.pstTaxRateOnPo, Validators.required] : [this.account.pstTaxRateOnPo],
                sampleEmail         : requiredField('sampleEmail',this.fields) ? [this.account.sampleEmail, Validators.required] : [this.account.sampleEmail],
                vendorPoNotes         : requiredField('vendorPoNotes',this.fields) ? [this.account.vendorPoNotes, Validators.required] : [this.account.vendorPoNotes],
                vendorProductNotes    : requiredField('vendorProductNotes',this.fields) ? [this.account.vendorProductNotes, Validators.required] : [this.account.vendorProductNotes],
                vendorPaymentTerms    : requiredField('vendorPaymentTerms',this.fields) ? [this.account.vendorPaymentTerms, Validators.required] : [this.account.vendorPaymentTerms],
                doNotIssuePo: requiredField('doNotIssuePo',this.fields) ? [this.account.doNotIssuePo == '1' ? true : false, Validators.required] : [this.account.doNotIssuePo == '1' ? true : false],
                required1099: requiredField('required1099',this.fields) ? [this.account.required1099 == '1' ? true : false, Validators.required] : [this.account.required1099 == '1' ? true : false],
            });
    }

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
    this.loading = true;
    this.api.uploadAccountLogo(data)
        .subscribe((res: any) => {
          this.logoUrl = res.msg;
          this.loading = false;
        }, (err => {
          this.loading = false;
    }));
  }

  processYtdDetails() {
    this.loading = true;
    this.api.processYtdDetails(this.account.id)
        .subscribe((res: any) => {
          if(res.status == 'success'){
              this.account.ytdSales = res.ytdSales;
          }
          this.loading = false;
        }, (err => {
          this.loading = false;
    }));
  }
  
  selectSalesManager(ev) {
    const assignee = ev.option.value;
    this.additionInfoForm.get('salesManagerName').setValue(assignee.name);
    this.additionInfoForm.get('salesManagerId').setValue(assignee.id);
  }

  selectCsrEmbroidery(ev) {
    const assignee = ev.option.value;
    this.additionInfoForm.get('csrEmbroideryUserName').setValue(assignee.name);
    this.additionInfoForm.get('csrEmbroideryUserId').setValue(assignee.id);
  }
  
  selectCsrScreenprint(ev) {
    const assignee = ev.option.value;
    this.additionInfoForm.get('csrScreenprintUserName').setValue(assignee.name);
    this.additionInfoForm.get('csrScreenprintUserId').setValue(assignee.id);
  }
  
  
  clearCsrEmb() {
    this.additionInfoForm.patchValue({
      csrEmbroideryUserId: '',
      csrEmbroideryUserName: '',
    });
  }

  clearCsrScr() {
    this.additionInfoForm.patchValue({
      csrScreenprintUserId: '',
      csrScreenprintUserName: '',
    });
  }

  isUrl(str)
  {
    const regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        if (regexp.test(str)){
          return true;
        }else{
          return false;
        }
  }

  vendorPaymentTermsSelected(event: MatAutocompleteSelectedEvent): void {

    if (event.option.value.id) {
      this.selectedVendorPaymentTerms.push(event.option.value.id);
      this.vendorPaymentTermsInputCtrl.setValue(null);
    }
  }
  vendorPaymentTermsLabel(id) {
      const term = this.vendorPaymentTerms.find(item => item.id == id);
      if(term.label){
          return term.label;
      }
      return '';
  }
  removeVendorPaymentTerms(id) {
    const index = this.selectedVendorPaymentTerms.indexOf(id);
    if (index >= 0) {
      this.selectedVendorPaymentTerms.splice(index, 1);
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

    getDefaultCurrency(currencyId){
       if (currencyId === undefined || currencyId === null) return '';
      const currencyDetails = this.currencyList.find(item => item.id == currencyId);
      if (currencyDetails === undefined || currencyDetails === null) return "";
      if(currencyDetails.currency !== 'undefined' && currencyDetails.code !== 'undefined' && currencyDetails.symbol !== 'undefined'){
          return currencyDetails.currency+ ' '+ currencyDetails.code + ' '+currencyDetails.symbol;
      }
      return '';
    }
    getPricingMethod(pricingMethodId){
      if (pricingMethodId === undefined || pricingMethodId === null) return '';
      const pricingMethodDetails = this.pricingMethodsList.find(item => item.id == pricingMethodId);
      if (pricingMethodDetails === undefined || pricingMethodDetails === null) return "";
      if(pricingMethodDetails.name !== 'undefined'){
          return pricingMethodDetails.name;
      }
      return '';
    }
}

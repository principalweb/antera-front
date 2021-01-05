import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';

import { Account, Contact } from 'app/models';
import { displayName } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { find } from 'lodash';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector     : 'convert-lead-form-dialog',
    templateUrl  : './convert-lead-form.component.html',
    styleUrls    : ['./convert-lead-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ConvertLeadFormComponent
{
    event: CalendarEvent;
    dialogTitle: string;
    loading = false;
    isEmailExist = false;

    contact: Contact;
    account: Account;

    contactForm: FormGroup;
    accountForm: FormGroup;

    filteredUsers = [];
    filteredContacts = [];
    leadSources = [];
    shipAccTypes = [];
    filteredAccounts = [];
    ratings = [];
    pTypes = [];
    accTypes = [];
    industries = [];
    creditTerms = [];
    timezones = [];
    corporateIdentities: any[];

    displayName = displayName;
    identityEnabled: boolean;

    constructor(
        public dialogRef: MatDialogRef<ConvertLeadFormComponent>,
        @Inject(MAT_DIALOG_DATA) data: any,
        private auth: AuthService,
        private api: ApiService,
        private formBuilder: FormBuilder,
        private msg: MessageService,
    )
    {
        this.dialogTitle = 'Convert Lead';
        this.contact = data.contact;
        this.account = data.account;
        this.isEmailExist = data.isEmailExist;

        this.contactForm = this.createContactForm();
        this.accountForm = this.createAccountForm();

        this.api.getTimeZonesDropdown()
            .subscribe((response: any[]) => {
                this.timezones = response;
            });
    }

    createContactForm()
    {
        const user = this.auth.getCurrentUser();

        return this.formBuilder.group({
            firstName         : [this.contact.firstName],
            lastName          : [this.contact.lastName],
            title             : [this.contact.title],
            department        : [this.contact.department],
            reportsTo         : [this.contact.reportsTo],
            reportsToId       : [this.contact.reportsToId],
            shippingType      : [this.contact.shippingType],
            shippingAcctNumber: [this.contact.shippingAcctNumber],
            salesRep          : [this.contact.salesRep == '' ? `${user.firstName} ${user.lastName}` : this.contact.salesRep, Validators.required],
            salesRepId        : [this.contact.salesRepId == '' ? user.userId : this.contact.salesRepId, Validators.required],
            phone             : [this.contact.phone, Validators.required],
            phoneMobile       : [this.contact.phoneMobile],
            fax               : [this.contact.fax],
            generalInfo       : [this.contact.generalInfo],
            shipAddress1      : [this.contact.shipAddress1],
            shipAddress2      : [this.contact.shipAddress2],
            shipCity          : [this.contact.shipCity],
            shipState         : [this.contact.shipState],
            shipPostalcode    : [this.contact.shipPostalcode],
            shipCountry       : [this.contact.shipCountry],
            billAddress1      : [this.contact.billAddress1],
            billAddress2      : [this.contact.billAddress2],
            billCity          : [this.contact.billCity],
            billState         : [this.contact.billState],
            billPostalcode    : [this.contact.billPostalcode],
            billCountry       : [this.contact.billCountry],
            email             : [this.contact.email, [Validators.required, Validators.email]],
            leadSource        : [this.contact.leadSource]
        });
    }

    createAccountForm()
    {
        const user = this.auth.getCurrentUser();

        return this.formBuilder.group({
            accountName          : [this.account.accountName, Validators.required],
            parentAccount        : [this.account.parentAccount],
            rating               : [this.account.rating],
            partnerType          : [this.account.partnerType],
            timeZone             : [this.account.timeZone == '' ? "Central America Standard Time" : this.account.timeZone],
            industry             : [this.account.industry],
            accountExtension     : [this.account.accountExtension],
            website              : [this.account.website],
            shipAddress1         : [this.account.shipAddress1],
            shipAddress2         : [this.account.shipAddress2],
            shipCity             : [this.account.shipCity],
            shipState            : [this.account.shipState],
            shipPostalcode       : [this.account.shipPostalcode],
            shipCountry          : [this.account.shipCountry],
            salesRepId           : [this.account.salesRepId == '' ? user.userId : this.account.salesRepId, Validators.required],
            salesRep             : [this.account.salesRep == '' ? `${user.firstName} ${user.lastName}` : this.account.salesRep, Validators.required],
            csr                  : [this.account.csr],
            csrId                : [this.account.csrId],
            phone                : [this.account.phone, Validators.required],
            fax                  : [this.account.fax],
            leadSource           : [this.account.leadSource],
            priorSalesRep        : [this.account.priorSalesRep],
            accountType          : [this.account.accountType, Validators.required],
            shippingAccountNo    : [this.account.shippingAccountNo],
            shippingAccountType  : [this.account.shippingAccountType],
            billAddress1         : [this.account.billAddress1],
            billAddress2         : [this.account.billAddress2],
            billCity             : [this.account.billCity],
            billState            : [this.account.billState],
            billPostalcode       : [this.account.billPostalcode],
            billCountry          : [this.account.billCountry],
            generalInfo          : [this.account.generalInfo],
            creditTerms          : [this.account.creditTerms],
            taxStatus            : [this.account.taxStatus],
            taxExemptNo          : [this.account.taxExemptNo],
            taxExempt            : [this.account.taxExempt],
            vipDiscountsForOrders: [this.account.vipDiscountsForOrders],
            ytdSales             : [this.account.ytdSales],
            lastYearSales        : [this.account.lastYearSales],
            highCreditLimit      : [this.account.highCreditLimit],
            defaultTaxRate       : [this.account.defaultTaxRate],
            webstoreUrl          : [this.account.webstoreUrl],
            eqp                  : [this.account.eqp],
            artContactName       : [this.account.artContactName],
            artContactEmail      : [this.account.artContactEmail],
            csRepName            : [this.account.csRepName],
            csRepEmail           : [this.account.csRepEmail],
            salesRepEmail        : [this.account.salesRepEmail],
            sampleEmail          : [this.account.sampleEmail],
            corporateIdentityId  : [this.account.corporateIdentityId],
        });
    }

    ngOnInit()
    {
        this.contactForm.get('salesRep').valueChanges.pipe(
            map(val => displayName(val).trim().toLowerCase()),
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(keyword => {
            if (keyword.length >= 3) {
                this.api.getUserAutocomplete(keyword).subscribe((res: any[]) => {
                    this.filteredUsers = res;
                });
            }
        });
        
        this.contactForm.get('reportsTo').valueChanges.pipe(
            map(val => displayName(val).trim().toLowerCase()),
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(keyword => {
            if (keyword.length >= 3) {
                this.api.getContactAutocomplete(keyword).subscribe((res: any[]) => {
                    this.filteredContacts = res;
                });
            }
        });
        
        
        this.accountForm.get('salesRep').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(keyword => {
            if(keyword.length >=3 ) {
                this.api.getUserAutocomplete(keyword).subscribe((res: any[]) => {
                    this.filteredUsers = res;
                });
            }
        });

        this.accountForm.get('csr').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(keyword => {
            if(keyword.length >=3 ) {
                this.api.getUserAutocomplete(keyword).subscribe((res: any[]) => {
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

        this.contactForm.get('email').valueChanges.pipe(
            debounceTime(800),
            distinctUntilChanged(),
        ).subscribe(val => {
            if (val.length === 0) {
                this.isEmailExist = false;
            }else{
                if(this.validateEmail(val)){
                    this.api.checkContactEmail(val).subscribe((res: any) => {
                        console.log(res,'resres')
		            if (res.id && res.id != '') {
		                this.isEmailExist = true;
		            } else {
                        this.isEmailExist = false;
                    }
                    });   
                }
            }
        });


        this.api.getDropdownOptions({dropdown: [
            'lead_source_dom', 
            'sys_shippacct_list',
            'sys_acctrating_list',
            'sys_credit_terms_list',
            'industry_dom',
            'businesspartner_list',
            'account_type_dom'
        ]}).subscribe((res: any[]) => {
            const leadSourceDropdown = find(res, {name: 'lead_source_dom'});
            this.leadSources = leadSourceDropdown.options;

            const shipAccTypesDropdown = find(res, {name: 'sys_shippacct_list'});
            this.shipAccTypes = shipAccTypesDropdown.options;

            const ratingDropdown = find(res, {name: 'sys_acctrating_list'});
            this.ratings = ratingDropdown.options;
    
            const creditTermDropdown = find(res, {name: 'sys_credit_terms_list'});
            this.creditTerms = creditTermDropdown.options;

            const industryDropdown = find(res, {name: 'industry_dom'});
            this.industries = industryDropdown.options;
    
            const partnerDropdown = find(res, {name: 'businesspartner_list'});
            this.pTypes = partnerDropdown.options;
    
            const accountTypeDropdown = find(res, {name: 'account_type_dom'});
            this.accTypes = accountTypeDropdown.options;
        });
        this.configureCorporateIdentity();
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
    convert() {

        if (this.contactForm.invalid || this.accountForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        const data = {
            contactToCreate: this.contactForm.getRawValue(),
            accountToCreate: this.accountForm.getRawValue()
        }

        this.dialogRef.close(data);
    }

    selectAssignee(ev) {
        const assignee = ev.option.value;
        this.contactForm.get('salesRepId').setValue(assignee.id);
    }

    selectAccountAssignee(ev) {
        const assignee = ev.option.value;
        this.accountForm.get('salesRepId').setValue(assignee.id);
    }

    selectReporter(ev) {
        const reporter = ev.option.value;
        this.contactForm.get('reportsToId').setValue(reporter.id);
    }

    selectCSR(ev) {
        const csr = ev.option.value;
        this.accountForm.get('csr').setValue(csr.name);
        this.accountForm.get('csrId').setValue(csr.id);
    }

    selectParentAccount(ev) {
        const acc = ev.option.value;
        this.accountForm.get('parentAccount').setValue(acc.name);
    }
    
    copyBillingAddress(ev) {
        const contactFormData = this.contactForm.value;
        if (ev.checked) {
            this.contactForm.get('shipAddress1').setValue(contactFormData.billAddress1);
            this.contactForm.get('shipAddress2').setValue(contactFormData.billAddress2);
            this.contactForm.get('shipCity').setValue(contactFormData.billCity);
            this.contactForm.get('shipState').setValue(contactFormData.billState);
            this.contactForm.get('shipPostalcode').setValue(contactFormData.billPostalcode);
            this.contactForm.get('shipCountry').setValue(contactFormData.billCountry);
        }
        else {

        }
    }

    copyAccountBillingAddress(ev) {
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
    validateEmail(email){
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;    
        if (reg.test(email) == false) 
        {
           return false;
        }    
        return true;
    }
}

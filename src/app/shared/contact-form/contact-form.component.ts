import { Component, Inject, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';
import { Contact, Account } from '../../models';
import { displayName, fieldLabel, visibleField, requiredField } from '../../utils/utils';
import { ApiService } from '../../core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from '../../core/services/auth.service';
import { remove, find } from 'lodash';
import { ModuleField } from 'app/models/module-field';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';

@Component({
    selector     : 'contact-form-dialog',
    templateUrl  : './contact-form.component.html',
    styleUrls    : ['./contact-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ContactFormDialogComponent
{
    event: CalendarEvent;
    dialogTitle: string;
    contactForm: FormGroup;
    action: string;
    service: any;
    contact: Contact;
    account: Account;

    loading = false;
    filteredUsers = [];
    filteredContacts = [];
    filteredAccounts = [];

    displayName = displayName;
    relatedAccounts: Account[] = [];
    leadSources = [];
    shipAccTypes = [];

    @ViewChild('relatedAccountInput') relatedAccountInput: ElementRef;
    relatedAccountInputCtrl = new FormControl();

    fields = [];

    fieldLabel = fieldLabel;
    visibleField = visibleField;
    requiredField = requiredField;
    commissionGroups: any[];
    commissionEnabled: boolean;
    error: any;
    formValidationDlgRef: MatDialogRef<FormValidationComponent>;
    excludeInvalidControls = ['salesManagerId', 'salesRepId', 'reportsToId'];
    conSalutationTypes = [];
    merchandiseInterests = [];
    selectedMerchandiseInterests = [];
    contactTypes = [];
    selectedContactTypes = [];

    @ViewChild('merchandiseInterestsList') merchandiseInterestsList: ElementRef;
    merchandiseInterestsListInputCtrl = new FormControl();

    @ViewChild('contactTypesList') contactTypesList: ElementRef;
    contactTypesListInputCtrl = new FormControl();

    constructor(
        public dialogRef: MatDialogRef<ContactFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private api: ApiService,
        private msg: MessageService,
        private authService: AuthService,
        public dialog: MatDialog,
    )
    {
        this.action = data.action;
        this.service = data.service;
        this.account = data.account;
        if ( this.action === 'edit' )
        {
            this.dialogTitle = 'Edit Contact';
            this.contact = new Contact(data.contact);
        }
        else
        {
            this.dialogTitle = 'Add Contact';
            this.contact = new Contact({});
        }

    }

    ngOnInit()
    {
        if (this.action == 'edit') {
            this.reloadRelatedAccounts();
        }
        else {
            if (this.account) {
                this.relatedAccounts.push(this.account);
            }
        }

        this.service.getDropdownOptionsForContact([
	      'lead_source_dom', 
	      'sys_shippacct_list',
	      'sys_brand_affiliation_list',
	      'sys_annual_budget_list',
	      'sys_contact_salutation_list',
	      'sys_leads_merchandise_interest_list',
	      'sys_leads_contact_type_list'
        ]).then((res) => {
            const leadSourceDropdown = find(res, {name: 'lead_source_dom'});
            this.leadSources = leadSourceDropdown.options;
            const shipAccTypesDropdown = find(res, {name: 'sys_shippacct_list'});
            this.shipAccTypes = shipAccTypesDropdown.options;

	    const merchandiseInterestsDropdown = find(res, {name: 'sys_leads_merchandise_interest_list'});
	    this.merchandiseInterests = merchandiseInterestsDropdown.options;

	    const contactTypesDropdown = find(res, {name: 'sys_leads_contact_type_list'});
        this.contactTypes = contactTypesDropdown.options;
        
        const contactSalutationDropdown = find(res, {name: 'sys_contact_salutation_list'});
        this.conSalutationTypes = contactSalutationDropdown && contactSalutationDropdown.options;   
        
        }).catch((err) => {});

        

        const contactModuleFieldParams = 
        {
            offset: 0,
            limit: 200,
            order: 'module',
            orient: 'asc',
            term: { module : 'Contacts' }
        }
        this.loading = true;
        this.api.getFieldsList(contactModuleFieldParams)
            .subscribe((res: any[])=> {
                this.fields = res.map(moduleField => new ModuleField(moduleField));
                this.loading = false;
                this.contactForm = this.createContactForm();
                this.initForm();
                if(this.contact.leadsMerchandiseInterest){
		    this.merchandiseInterests.forEach((item) => {
			  if(this.contact.leadsMerchandiseInterest.indexOf(item.value) !== -1){
			      this.selectedMerchandiseInterests.push(item.value);    
			  }
		    });
                
                }
                if(this.contact.leadsContactType){
		    this.contactTypes.forEach((item) => {
			  if(this.contact.leadsContactType.indexOf(item.value) !== -1){
			      this.selectedContactTypes.push(item.value);    
			  }
		    });                
                }

            },() => {this.loading = false;});
    }

    initForm() 
    {
        this.configureCommissions();
        this.contactForm.get('salesRep').valueChanges.pipe(
            map(val => displayName(val).trim().toLowerCase()),
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(keyword => {
            if (keyword.length >= 3) {
                this.service.autocompleteUsers(keyword).subscribe(res => {
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
                this.service.autocompleteContacts(keyword).subscribe(res => {
                    this.filteredContacts = res;
                });
            }
        });
        
        this.relatedAccountInputCtrl.valueChanges.pipe(
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
        
    }

    ngOnDestroy()
    {

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

    createContactForm()
    {
        const user = this.authService.getCurrentUser();

        return this.formBuilder.group({
            salutation        : requiredField('salutation',this.fields) ? [this.contact.salutation, Validators.required] : [this.contact.salutation], //added
            firstName         : [this.contact.firstName, Validators.required],
            lastName          : [this.contact.lastName, Validators.required],
            title             : requiredField('title',this.fields) ? [this.contact.title, Validators.required] : [this.contact.title],
            department        : requiredField('department',this.fields) ? [this.contact.department, Validators.required] : [this.contact.department],
            reportsTo         : requiredField('reportsTo',this.fields) ? [this.contact.reportsTo, Validators.required] : [this.contact.reportsTo],
            reportsToId       : requiredField('reportsToId',this.fields) ? [this.contact.reportsToId, Validators.required] : [this.contact.reportsToId],
            shippingType      : requiredField('shippingType',this.fields) ? [this.contact.shippingType, Validators.required] : [this.contact.shippingType],
            shippingAcctNumber: requiredField('shippingAcctNumber',this.fields) ? [this.contact.shippingAcctNumber, Validators.required] : [this.contact.shippingAcctNumber],
            salesRep          : [this.contact.salesRep == '' ? `${user.firstName} ${user.lastName}` : this.contact.salesRep, Validators.required],
            salesRepId        : [this.contact.salesRepId == '' ? user.userId : this.contact.salesRepId, Validators.required],
            phone             : requiredField('phone', this.fields) ? [this.contact.phone, Validators.required] : [this.contact.phone],
            phoneMobile       : requiredField('phoneMobile',this.fields) ? [this.contact.phoneMobile, Validators.required] : [this.contact.phoneMobile],
            fax               : requiredField('fax',this.fields) ? [this.contact.fax, Validators.required] : [this.contact.fax],
            generalInfo       : requiredField('generalInfo', this.fields) ? [this.contact.generalInfo, Validators.required] : [this.contact.generalInfo],
            shipAddress1      : requiredField('shipAddress1', this.fields) ? [this.contact.shipAddress1, Validators.required] : [this.contact.shipAddress1],
            shipAddress2      : requiredField('shipAddress2', this.fields) ? [this.contact.shipAddress2, Validators.required] : [this.contact.shipAddress2],
            shipCity          : requiredField('shipCity', this.fields) ? [this.contact.shipCity, Validators.required] : [this.contact.shipCity],
            shipState         : requiredField('shipState', this.fields) ? [this.contact.shipState, Validators.required] : [this.contact.shipState],
            shipPostalcode    : requiredField('shipPostalcode', this.fields) ?  [this.contact.shipPostalcode, Validators.required] : [this.contact.shipPostalcode],
            shipCountry       : requiredField('shipCountry', this.fields) ? [this.contact.shipCountry, Validators.required] : [this.contact.shipCountry],
            billAddress1      : requiredField('billAddress1', this.fields) ? [this.contact.billAddress1, Validators.required] : [this.contact.billAddress1],
            billAddress2      : requiredField('billAddress2',this.fields) ? [this.contact.billAddress2, Validators.required] : [this.contact.billAddress2],
            billCity          : requiredField('billCity', this.fields) ? [this.contact.billCity, Validators.required] : [this.contact.billCity],
            billState         : requiredField('billState', this.fields) ? [this.contact.billState, Validators.required] : [this.contact.billState],
            billPostalcode    : requiredField('billPostalcode', this.fields) ? [this.contact.billPostalcode, Validators.required] : [this.contact.billPostalcode],
            billCountry       : requiredField('billCountry', this.fields) ? [this.contact.billCountry, Validators.required] : [this.contact.billCountry],
            email             : [this.contact.email, [Validators.required, Validators.email]],
            leadSource        : requiredField('leadSource',this.fields) ? [this.contact.leadSource, Validators.required] : [this.contact.leadSource],
            commissionGroupId : [this.contact.commissionGroupId],
            commissionGroupName : [this.contact.commissionGroupId],
            leadsMerchandiseInterest : requiredField('leadsMerchandiseInterest',this.fields) ? [this.contact.leadsMerchandiseInterest, Validators.required] : [this.contact.leadsMerchandiseInterest],
            leadsContactType         : requiredField('leadsContactType',this.fields) ? [this.contact.leadsContactType, Validators.required] : [this.contact.leadsContactType],

        });
    }

    selectAssignee(ev) {
        const assignee = ev.option.value;
        this.contactForm.get('salesRep').setValue(assignee.name);
        this.contactForm.get('salesRepId').setValue(assignee.id);
    }

    clearAssignee() {
      this.contactForm.patchValue({
        salesRep: '',
        salesRepId: ''
      });
    }
  
    selectReporter(ev) {
        const reporter = ev.option.value;
        this.contactForm.get('reportsTo').setValue(reporter.name);
        this.contactForm.get('reportsToId').setValue(reporter.id);
    }

    clearReporter() {
      this.contactForm.patchValue({
        reportsTo: '',
        reportsToId: ''
      });
    }
  
    copyAccountAddress(ev) {
        if (ev.checked) {
            this.contactForm.patchValue({
                billAddress1        : this.account.billAddress1,
                billAddress2        : this.account.billAddress2,
                billCity            : this.account.billCity,
                billState           : this.account.billState,
                billPostalcode      : this.account.billPostalcode,
                billCountry         : this.account.billCountry
            });
        }
        else {
            this.contactForm.patchValue({
                billAddress1        : this.contact.billAddress1,
                billAddress2        : this.contact.billAddress2,
                billCity            : this.contact.billCity,
                billState           : this.contact.billState,
                billPostalcode      : this.contact.billPostalcode,
                billCountry         : this.contact.billCountry
            });
        }
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

    selectSalutation(ev) {
        const salutations = ev.option.value;
        this.contactForm.get('salutation').setValue(salutations.value);
    
    }

    clearSalutation() {
        this.contactForm.patchValue({
          salutation: ''
        });
    }  

    create() {

        if(this.contactForm.get('salesRep').value == null || this.contactForm.get('salesRep').value == '' || this.contactForm.get('salesRepId').value == null || this.contactForm.get('salesRepId').value == ''){
            this.contactForm.patchValue({
              salesRep: '',
              salesRepId: ''
            });        
        }

        if(this.contactForm.get('reportsTo').value == null || this.contactForm.get('reportsTo').value == '' || this.contactForm.get('reportsToId').value == null || this.contactForm.get('reportsToId').value == ''){
            this.contactForm.patchValue({
              reportsTo: '',
              reportsToId: ''
            });        
        }

       this.contactForm.get('leadsMerchandiseInterest').setValue(this.selectedMerchandiseInterests);
       this.contactForm.get('leadsContactType').setValue(this.selectedContactTypes);


        if (this.contactForm.invalid) {
          //this.msg.show('Please complete the form first', 'error');
            this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
              panelClass: 'app-form-validation',
              data: {
                action: 'new',
                moduleForm: this.contactForm,
                fields: this.fields,
                excludeInvalidControls: this.excludeInvalidControls
              }
            });

            this.formValidationDlgRef.afterClosed().subscribe(data => {
              if (data) {
                data.invalidControls.forEach((control) => {
                  this.contactForm.get(control).markAsTouched();
                });
              }
              this.formValidationDlgRef = null;
            });    
          return;
        }
        this.loading = true;
        const saleseRepName = this.contactForm.get('salesRep').value.name ? this.contactForm.get('salesRep').value.name : this.contactForm.get('salesRep').value;
        const reporterName = this.contactForm.get('reportsTo').value.name ? this.contactForm.get('reportsTo').value.name : this.contactForm.get('reportsTo').value;

        this.service.createContact({
                ...this.contactForm.value,
                salesRep: saleseRepName,
                reportsTo: reporterName
            })
            .subscribe(data => {
                this.loading = false;
                if (data && data.status === 'error') {
                    this.error = data;

                    if (this.error.msg.startsWith('Email address')) {
                        this.contactForm.get('email').setErrors({'emailExists': true});
                    }
                } else {
                    this.dialogRef.close({contact: data, relatedAccounts: this.relatedAccounts});
                }
            }, err => {
                this.loading = false;
                this.error = err;
            });
    }

    update() {

        if(this.contactForm.get('salesRep').value == null || this.contactForm.get('salesRep').value == '' || this.contactForm.get('salesRepId').value == null || this.contactForm.get('salesRepId').value == ''){
            this.contactForm.patchValue({
              salesRep: '',
              salesRepId: ''
            });        
        }

        if(this.contactForm.get('reportsTo').value == null || this.contactForm.get('reportsTo').value == '' || this.contactForm.get('reportsToId').value == null || this.contactForm.get('reportsToId').value == ''){
            this.contactForm.patchValue({
              reportsTo: '',
              reportsToId: ''
            });        
        }
       this.contactForm.get('leadsMerchandiseInterest').setValue(this.selectedMerchandiseInterests);
       this.contactForm.get('leadsContactType').setValue(this.selectedContactTypes);
        if (this.contactForm.invalid) {
          //this.msg.show('Please complete the form first', 'error');
            this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
              panelClass: 'app-form-validation',
              data: {
                action: 'update',
                moduleForm: this.contactForm,
                fields: this.fields,
                excludeInvalidControls: this.excludeInvalidControls
              }
            });

            this.formValidationDlgRef.afterClosed().subscribe(data => {
              if (data) {
                data.invalidControls.forEach((control) => {
                  this.contactForm.get(control).markAsTouched();
                });
              }
              this.formValidationDlgRef = null;
            });    
          return;
        }
        this.loading = true;

        const saleseRepName = this.contactForm.get('salesRep').value.name ? this.contactForm.get('salesRep').value.name : this.contactForm.get('salesRep').value;
        const reporterName = this.contactForm.get('reportsTo').value.name ? this.contactForm.get('reportsTo').value.name : this.contactForm.get('reportsTo').value;

        this.service.updateContact({
            ...this.contact,
            ...this.contactForm.value,
            salesRep: saleseRepName,
            reportsTo: reporterName
        })
        .subscribe((data) => {
            this.loading = false;
            this.dialogRef.close(data);
        }, () => {
            this.dialogRef.close();
        });
    }

    reloadRelatedAccounts(){
        this.loading = true;
        this.service.getRelatedAccounts(this.contact.id)
            .then((response: Account[]) =>{
                this.loading = false;
                this.relatedAccounts = response;
            }).catch((err) => {
                this.loading = false;
            });
    }

    accountSelected(event: MatAutocompleteSelectedEvent): void {
        this.relatedAccountInput.nativeElement.value = '';
        if (this.action == 'edit')
        {
            this.loading = true;
            this.api.linkAccountContact(event.option.value.id, this.contact.id)
              .subscribe((res) => {
                this.reloadRelatedAccounts();
            }, (err) => {
                this.loading = false;
                this.dialogRef = null;
                this.msg.show('Linking account & contact failed', 'error');
              });
        }
        else {
            this.relatedAccounts.push(event.option.value);
        }

    }

    removeAccount(account) {
        if (this.action == 'edit'){
            this.loading = true;
            this.api.removeLinkAccountContact(account.id, this.contact.id)
                .subscribe((response: any) => {
                    this.msg.show(response.msg, 'success');
                    if(response.status === 'Success') {
                        this.reloadRelatedAccounts();
                    }
                }, (err) => {
                    this.loading = false;
                    this.msg.show('Removing related account & contact failed', 'error');
                });
        }
        else {
            remove(this.relatedAccounts,{'id': account.id});
        }
    }

  merchandiseInterestSelected(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.value.value);
    if (event.option.value.value) {
      this.selectedMerchandiseInterests.push(event.option.value.value);
      this.merchandiseInterestsListInputCtrl.setValue(null);
    }
  }

  merchandiseInterestLabel(value) {
      const term = this.merchandiseInterests.find(item => item.value == value);
      if(term.label){
          return term.label;
      }
      return '';
  }

  removeMerchandiseInterests(id) {
    const index = this.selectedMerchandiseInterests.indexOf(id);
    if (index >= 0) {
      this.selectedMerchandiseInterests.splice(index, 1);
    }
  }
  contactTypeSelected(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.value.value);
    if (event.option.value.value) {
      this.selectedContactTypes.push(event.option.value.value);
      this.contactTypesListInputCtrl.setValue(null);
    }
  }

  contactTypeLabel(value) {
      const term = this.contactTypes.find(item => item.value == value);
      if(term.label){
          return term.label;
      }
      return '';
  }

  removeContactTypes(id) {
    const index = this.selectedContactTypes.indexOf(id);
    if (index >= 0) {
      this.selectedContactTypes.splice(index, 1);
    }
  }

}

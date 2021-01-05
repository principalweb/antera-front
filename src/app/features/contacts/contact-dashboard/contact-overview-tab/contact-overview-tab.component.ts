import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subscription } from 'rxjs';
import { ContactsService } from 'app/core/services/contacts.service';
import { find } from 'lodash';
import { Contact } from 'app/models';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'app/core/services/auth.service';
import { displayName, requiredField, visibleField, fieldLabel } from 'app/utils/utils';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { Router } from '@angular/router';
import * as shape from 'd3-shape';
import { SourceFormComponent } from 'app/features/e-commerce/sources/source-form/source-form.component';
import { SourceDetails } from 'app/models/source';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { OpportunityFormDialogComponent } from 'app/features/opportunities/opportunity-form/opportunity-form.component';
import { OrderFormDialogComponent } from 'app/shared/order-form-dialog/order-form-dialog.component';
import { PermissionService } from 'app/core/services/permission.service';
import { distinctUntilChanged, debounceTime, map } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail, Attachment } from 'app/models/mail';
import { RelatedAccountsDialogComponent } from 'app/shared/related-accounts-dialog/related-accounts-dialog.component';
@Component({
  selector: 'contact-overview-tab',
  templateUrl: './contact-overview-tab.component.html',
  styleUrls: ['./contact-overview-tab.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ContactOverviewTabComponent implements OnInit {

  @Input() contact: Contact;
  @Output() edit = new EventEmitter();

  onDisplayMenuChanged: Subscription;
  onDropdownOptionsForContactChangedSubscription: Subscription;
  onContactStatsChangedSubscription: Subscription;
  onModuleFieldsChangedSubscription: Subscription;

  sourceEnabled = true;
  loading = false;
  editingContact = false;
  isShippingEditDisabled = false;
  menuVisible = false;
  permissionsEnabled: boolean;
  enablePortalInvitation = false;
  contactForm: FormGroup;

  displayName = displayName;

  filteredUsers = [];
  filteredContacts = [];
  filteredAccounts = [];

  leadSources = [];
  shipAccTypes = [];
  leadsChannels = [];
  selectedLeadsChannels = [];
  relatedAccounts: Account[] = [];

  @ViewChild('relatedAccountInput') relatedAccountInput: ElementRef;
  relatedAccountInputCtrl = new FormControl();

  @ViewChild('leadsChannelsList') leadsChannelsList: ElementRef;
  leadsChannelsListInputCtrl = new FormControl();

  contactStats: any = {};

  widgetData: any;
  widget5: any = {};

  dialogRef: any;
  fields = [];
  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;
  commissionGroups: any[];
  commissionEnabled: boolean;
  conBrandAffiliationTypes = [];
  conAnnualBudgetTypes = [];
  conSalutationTypes = [];

  merchandiseInterests = [];
  selectedMerchandiseInterests = [];
  contactTypes = [];
  selectedContactTypes = [];

  @ViewChild('merchandiseInterestsList') merchandiseInterestsList: ElementRef;
  merchandiseInterestsListInputCtrl = new FormControl();

  @ViewChild('contactTypesList') contactTypesList: ElementRef;
  contactTypesListInputCtrl = new FormControl();

  formValidationDlgRef: MatDialogRef<FormValidationComponent>;
  excludeInvalidControls = ['salesManagerId', 'salesRepId', 'reportsToId'];
  dialogRefMailCompose: MatDialogRef<FuseMailComposeDialogComponent>;
  dialogRefMailComposePortalUser: MatDialogRef<FuseMailComposeDialogComponent>;
  constructor(
    private contactsService: ContactsService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private msg: MessageService,
    private router: Router,    
    public dialog: MatDialog,
    private permService: PermissionService
  ) { }


  ngOnInit() {

    this.createContactForm();

    this.onContactStatsChangedSubscription = 
      this.contactsService.onContactStatsChanged
          .subscribe((res: any) => {
            console.log("contact stats", res);
            this.contactStats = res;
            this.widgetData = res.widgetData;
          });

    this.onDropdownOptionsForContactChangedSubscription =
      this.contactsService.onDropdownOptionsForContactChanged
          .subscribe((res: any[]) => {
              if (!res) return;
              const leadSourceDropdown = find(res, {name: 'lead_source_dom'});
              this.leadSources = leadSourceDropdown.options;
              const shipAccTypesDropdown = find(res, {name: 'sys_shippacct_list'});
              this.shipAccTypes = shipAccTypesDropdown.options;

              const contactBrandAffiliationDropdown = find(res, {name: 'sys_brand_affiliation_list'});
              this.conBrandAffiliationTypes = contactBrandAffiliationDropdown && contactBrandAffiliationDropdown.options;              

              const contactAnnualBudgetDropdown = find(res, {name: 'sys_annual_budget_list'});
              this.conAnnualBudgetTypes = contactAnnualBudgetDropdown && contactAnnualBudgetDropdown.options;              

              const contactSalutationDropdown = find(res, {name: 'sys_contact_salutation_list'});
              this.conSalutationTypes = contactSalutationDropdown && contactSalutationDropdown.options;              

	      const merchandiseInterestsDropdown = find(res, {name: 'sys_leads_merchandise_interest_list'});
	      this.merchandiseInterests = merchandiseInterestsDropdown.options;
	      this.merchandiseInterests.forEach((item) => {
		  if(this.contact.leadsMerchandiseInterest.indexOf(item.value) !== -1){
		      this.selectedMerchandiseInterests.push(item.value);    
		  }
	      });

	      const contactTypesDropdown = find(res, {name: 'sys_leads_contact_type_list'});
	      this.contactTypes = contactTypesDropdown.options;

	      this.contactTypes.forEach((item) => {
		  if(this.contact.leadsContactType.indexOf(item.value) !== -1){
		      this.selectedContactTypes.push(item.value);    
		  }
	      });

	      const leadChannelsDropdown = find(res, {name: 'sys_leads_channel_list'});
	      this.leadsChannels = leadChannelsDropdown.options;
   
	      this.leadsChannels.forEach((item) => {
		  if(this.contact.leadsChannel.indexOf(item.value) !== -1){
		      this.selectedLeadsChannels.push(item.value);    
		  }
	      });


          });

    this.onDisplayMenuChanged =
      this.contactsService.onDisplayMenuChanged
          .subscribe((list: any[]) => {
            const sourceItem = find(list, {name: 'order.sourcing'});
            if (sourceItem) {
                this.sourceEnabled = sourceItem.display == '1' ? true : false;
            }
          });
    
          
    this.onModuleFieldsChangedSubscription = 
      this.contactsService.onModuleFieldsChanged
          .subscribe((fields: any[]) => {
            this.fields = fields;
          });


    this.relatedAccountInputCtrl.valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
          if (keyword && keyword.length >= 3) {
              this.contactsService.autocompleteAccounts(keyword).subscribe((res: any[]) => {
                  this.filteredAccounts = res;
              });
          }
      });

    this.reloadRelatedAccounts();

    // this.api.post('/widget/get-widgets', { userId: this.contact.id })
    // .subscribe((response: any) => {
    //     this.widgetData = response;
    // });

    this.widget5 = {
      currentRange: '2W',
      xAxis: true,
      yAxis: true,
      gradient: false,
      legend: false,
      showXAxisLabel: false,
      xAxisLabel: 'Days',
      showYAxisLabel: false,
      yAxisLabel: 'Isues',
      scheme: {
        domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
      },
      onSelect: (ev) => {
        console.log(ev);
      },
      supporting: {
        currentRange: '',
        xAxis: false,
        yAxis: false,
        gradient: false,
        legend: false,
        showXAxisLabel: false,
        xAxisLabel: 'Days',
        showYAxisLabel: false,
        yAxisLabel: 'Isues',
        scheme: {
          domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
        },
        curve: shape.curveBasis
      }
    };

    this.permService.getPermissionStatus().subscribe((res: any) => {
        if (res == '0' || res == 0 || res == false) {
            res = false
        } else {
            res = true;
        }

        this.permissionsEnabled = res;
    });

    this.api.getAdvanceSystemConfigAll({ module: 'Portal' }).subscribe((config: any) => {
      if(config.settings.enablePortalInvitation && config.settings.enablePortalInvitation == '1'){
          this.enablePortalInvitation = true;
      }
    });
  }

  ngOnDestroy() {
    this.onDisplayMenuChanged.unsubscribe();
    this.onDropdownOptionsForContactChangedSubscription.unsubscribe();
    this.onContactStatsChangedSubscription.unsubscribe();
    this.onModuleFieldsChangedSubscription.unsubscribe();
  }

  createForm() {

    const user = this.authService.getCurrentUser();

    return this.formBuilder.group({
        salutation         : requiredField('salutation',this.fields) ? [this.contact.salutation, Validators.required] : [this.contact.salutation],
        firstName            : [this.contact.firstName, Validators.required],
        lastName             : [this.contact.lastName, Validators.required],
        phone                : requiredField('phone',this.fields) ? [this.contact.phone, Validators.required] : [this.contact.phone],
        salesRepId           : [this.contact.salesRepId == '' ? user.userId : this.contact.salesRepId, Validators.required],
        salesRep             : [this.contact.salesRep == '' ? `${user.firstName} ${user.lastName}` : this.contact.salesRep, Validators.required],               
        email                : [this.contact.email, [Validators.required, Validators.email]],
        additionalEmail1     : requiredField('additionalEmail1',this.fields) ? [this.contact.additionalEmail1, [Validators.required, Validators.email]] : [this.contact.additionalEmail1],
        additionalEmail2     : requiredField('additionalEmail2',this.fields) ? [this.contact.additionalEmail2, [Validators.required, Validators.email]] : [this.contact.additionalEmail2],
        title                : requiredField('title',this.fields) ? [this.contact.title, Validators.required] : [this.contact.title],
        department           : requiredField('department',this.fields) ? [this.contact.department, Validators.required] : [this.contact.department],
        reportsTo            : requiredField('reportsTo',this.fields) ? [this.contact.reportsTo, Validators.required] : [this.contact.reportsTo],
        reportsToId          : requiredField('reportsToId',this.fields) ? [this.contact.reportsToId, Validators.required] : [this.contact.reportsToId],
        shippingType         : requiredField('shippingType',this.fields) ? [this.contact.shippingType, Validators.required] : [this.contact.shippingType],
        shippingAcctNumber   : requiredField('shippingAcctNumber',this.fields) ? [this.contact.shippingAcctNumber, Validators.required] : [this.contact.shippingAcctNumber],
        phoneMobile          : requiredField('phoneMobile',this.fields) ? [this.contact.phoneMobile, Validators.required] : [this.contact.phoneMobile],
        fax                  : requiredField('fax',this.fields) ? [this.contact.fax, Validators.required] : [this.contact.fax],
        leadSource           : requiredField('leadSource',this.fields) ? [this.contact.leadSource, Validators.required] : [this.contact.leadSource],
        generalInfo          : requiredField('generalInfo',this.fields) ? [this.contact.generalInfo, Validators.required] : [this.contact.generalInfo],

        shipAddress1         : requiredField('shipAddress1',this.fields) ? [{value: this.contact.shipAddress1, disabled: this.isShippingEditDisabled}, Validators.required] : [{value: this.contact.shipAddress1, disabled: this.isShippingEditDisabled}],
        shipAddress2         : requiredField('shipAddress2',this.fields) ? [{value: this.contact.shipAddress2, disabled: this.isShippingEditDisabled}, Validators.required] : [{value: this.contact.shipAddress2, disabled: this.isShippingEditDisabled}],
        shipCity             : requiredField('shipCity',this.fields) ? [{value: this.contact.shipCity, disabled: this.isShippingEditDisabled}, Validators.required] : [{value: this.contact.shipCity, disabled: this.isShippingEditDisabled}],
        shipState            : requiredField('shipState',this.fields) ? [{value: this.contact.shipState, disabled: this.isShippingEditDisabled}, Validators.required] : [{value: this.contact.shipState, disabled: this.isShippingEditDisabled}],
        shipPostalcode       : requiredField('shipPostalcode',this.fields) ? [{value: this.contact.shipPostalcode, disabled: this.isShippingEditDisabled}, Validators.required] : [{value: this.contact.shipPostalcode, disabled: this.isShippingEditDisabled}],
        shipCountry          : requiredField('shipCountry',this.fields) ? [{value: this.contact.shipCountry, disabled: this.isShippingEditDisabled}, Validators.required] : [{value: this.contact.shipCountry, disabled: this.isShippingEditDisabled}],

        billAddress1         : requiredField('billAddress1',this.fields) ? [this.contact.billAddress1, Validators.required] : [this.contact.billAddress1],
        billAddress2         : requiredField('billAddress2',this.fields) ? [this.contact.billAddress2, Validators.required] : [this.contact.billAddress2],
        billCity             : requiredField('billCity',this.fields) ? [this.contact.billCity, Validators.required] : [this.contact.billCity],
        billState            : requiredField('billState',this.fields) ? [this.contact.billState, Validators.required] : [this.contact.billState],
        billPostalcode       : requiredField('billPostalcode',this.fields) ? [this.contact.billPostalcode, Validators.required] : [this.contact.billPostalcode],
        billCountry          : requiredField('billCountry',this.fields) ? [this.contact.billCountry, Validators.required] : [this.contact.billCountry],
        commissionGroupId    : [this.contact.commissionGroupId],
        commissionGroupName  : [this.contact.commissionGroupName],
        brandAffiliation     : requiredField('brandAffiliation',this.fields) ? [this.contact.brandAffiliation, Validators.required] : [this.contact.brandAffiliation],
        salesManagerId       : requiredField('salesManagerId',this.fields) ? [this.contact.salesManagerId, Validators.required] : [this.contact.salesManagerId],
        salesManagerName     : requiredField('salesManagerId',this.fields) ? [this.contact.salesManagerName, Validators.required] : [this.contact.salesManagerName],
        annualBudget         : requiredField('annualBudget',this.fields) ? [this.contact.annualBudget, Validators.required] : [this.contact.annualBudget],
        leadsMerchandiseInterest : requiredField('leadsMerchandiseInterest',this.fields) ? [this.contact.leadsMerchandiseInterest, Validators.required] : [this.contact.leadsMerchandiseInterest],
        leadsContactType         : requiredField('leadsContactType',this.fields) ? [this.contact.leadsContactType, Validators.required] : [this.contact.leadsContactType],
        leadsChannel         : requiredField('leadsChannel',this.fields) ? [this.contact.leadsChannel, Validators.required] : [this.contact.leadsChannel],
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

  createContactForm() {
    if (this.contactForm) {
      this.contactForm = null;
    }

    this.configureCommissions();
    this.contactForm = this.createForm();

    this.contactForm.get('salesRep').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
          if (keyword && keyword.length >= 3) {
              this.contactsService.autocompleteUsers(keyword).subscribe((res: any[]) => {
                  this.filteredUsers = res;
              });
          }
      });

  this.contactForm.get('reportsTo').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
  ).subscribe(keyword => {
          if (keyword && keyword.length >= 3) {
              this.contactsService.autocompleteContacts(keyword).subscribe((res: any[]) => {
                  this.filteredContacts = res;
              });
          }
      });

    this.contactForm.get('salesManagerName').valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
    ).subscribe(keyword => {
            if (keyword && keyword.length >=3 ) {
                this.contactsService.autocompleteUsers(keyword).subscribe((res: any[]) => {
                    this.filteredUsers = res;
                });
            }
        });
        
  }
  goto(link) {
    this.router.navigate([link]);
  }

  editContact() {
    this.editingContact = !this.editingContact;
    if (this.editingContact)
    {
      this.createContactForm();
    }
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  copyBillingAddress(ev) {
    if (ev.checked){
      this.contactForm.patchValue({
        shipAddress1   : this.contactForm.value.billAddress1,
        shipAddress2   : this.contactForm.value.billAddress2,
        shipCity       : this.contactForm.value.billCity,
        shipState      : this.contactForm.value.billState,
        shipPostalcode : this.contactForm.value.billPostalcode,
        shipCountry    : this.contactForm.value.billCountry,
      });
      //this.edit.emit({type: 'Billing', dataForm: this.contactForm});
      this.isShippingEditDisabled = true;
      //this.editingContact = false;
    }
    else{
      this.isShippingEditDisabled = false;
    }
    //this.createContactForm();
  }

  getBillCity(contact) {
    const { billCity, billState, billPostalcode } = contact;
    const city = billCity
      ? `${billCity}, ${billState || ''} ${billPostalcode || ''}`
      : `${billState || ''} ${billPostalcode || ''}`;

    return city;
  }

  getShipCity(contact) {
    const { shipCity, shipState, shipPostalcode } = contact;
    const city = shipCity
      ? `${shipCity}, ${shipState || ''} ${shipPostalcode || ''}`
      : `${shipState || ''} ${shipPostalcode || ''}`;

    return city;
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

  selectSalutation(ev) {
    const salutations = ev.option.value;
    this.contactForm.get('salutation').setValue(salutations.value);

  }

  clearSalutation() {
    this.contactForm.patchValue({
      salutation: ''
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
  
  saveContact() {

    if(this.contactForm.get('salesManagerName').value == null || this.contactForm.get('salesManagerName').value == '' || this.contactForm.get('salesManagerId').value == null || this.contactForm.get('salesManagerId').value == ''){
        this.contactForm.patchValue({
          salesManagerName: '',
          salesManagerId: ''
        });        
    }

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

    this.contactForm.get('leadsMerchandiseInterest').setValue(this.selectedMerchandiseInterests);
    this.contactForm.get('leadsContactType').setValue(this.selectedContactTypes);
    this.contactForm.get('leadsChannel').setValue(this.selectedLeadsChannels);

    this.editContact();
    this.edit.emit({type:'Contact Details',dataForm: this.contactForm});
  }

  reloadRelatedAccounts(){
    this.loading = true;
    this.contactsService.getRelatedAccounts(this.contact.id)
        .then((response: Account[]) =>{
            this.loading = false;
            this.relatedAccounts = response;
        }).catch((err) => {
            this.loading = false;
        });
  }

  accountSelected(event: MatAutocompleteSelectedEvent): void {
      this.relatedAccountInput.nativeElement.value = '';
      this.loading = true;
      this.api.linkAccountContact(event.option.value.id, this.contact.id)
        .subscribe((res) => {
          this.reloadRelatedAccounts();
      }, (err) => {
          this.loading = false;
          this.msg.show('Linking account & contact failed', 'error');
        });
  }

  removeAccount(account) {
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

  onLeadCardSelected(status) {
    this.router.navigate(['/leads'], {queryParams: {status: status, assigned: this.contact.id, refType: 'Contact'}});
  }

  onActivityCardSelected(status) {
    this.router.navigate(['/activities'], {queryParams: {status: status, refId: this.contact.id, refType: 'Contact'}});
  }

  onQuoteCardSelected(status) {
    this.router.navigate(['/e-commerce/quotes'], {queryParams: {status: status, assigned: `${this.contact.firstName} ${this.contact.lastName}`, refType: 'Contact'}});
  }

  onOrderCardSelected(status) {
    this.router.navigate(['/e-commerce/orders'], {queryParams: {ordersOnly: true, status: status, assigned: `${this.contact.firstName} ${this.contact.lastName}`, refType: 'Contact'}});
  }

  onOpportunitiesCardSelected(status) {
    this.router.navigate(['/opportunities'], {queryParams: {status: status, assigned: `${this.contact.firstName} ${this.contact.lastName}`, refType:'Contact'}});
  }

  onAccountSelected(account) {
    
     this.router.navigate([`/accounts/${account.id}`]);
  }

  createSource() {
    this.dialogRef = this.dialog.open(SourceFormComponent, {
        panelClass: 'antera-details-dialog',
        data      : {
            contact: this.contact,
            action : 'new',
        }
    });

    this.dialogRef.afterClosed()
      .subscribe((sourceDetails: SourceDetails) => {
          if (!sourceDetails) return;
          this.loading = true;
          this.api.createSource(sourceDetails.toObject())
              .subscribe(() => {
                  this.loading = false;
                  this.router.navigate(['/e-commerce/sources']);
              }, ()=> {
                  this.loading = false;
              });
        });
  }

  deleteContact() {
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this contact?';

    confirmDialogRef.afterClosed().subscribe(result => {
      if ( result )
      {
        this.loading = true;
        this.contactsService.deleteContact(this.contact.id).pipe(
          map(() => {
            this.loading = false;
            this.router.navigate(['/contacts']);
          }),
        ).subscribe(() => {
          this.loading = false
        });
      }
    });
  }

  createOpportunity() {
    let dialogRef: MatDialogRef<OpportunityFormDialogComponent>
    dialogRef = this.dialog.open(OpportunityFormDialogComponent, {
        panelClass: 'opportunity-form-dialog',
        data      : {
            action: 'new',
            contact: this.contact
        }
    });

    dialogRef.afterClosed()
        .subscribe((response: any) => {
            if ( !response ) return;
            this.loading = true;
            this.api.createOpportunity(response)
                .subscribe(() => {
                  this.loading = false;
                  this.router.navigate(['/opportunities']);
                }, () => {this.loading = false});
        });
  }

  createPortalUser() {
    const contactId = this.contact.id;
    if(this.relatedAccounts.length == 0){
        this.msg.show('No any related account found', 'success');
    }else if(this.relatedAccounts.length == 1){
        this.getEmailTemplateForPortalInvitation(this.relatedAccounts[0].id);
    }else{
        //this.getEmailTemplateForPortalInvitation(this.relatedAccounts[0].id);
        this.msg.show('Multiple related account found', 'success');
        const dlgRef = this.dialog.open(RelatedAccountsDialogComponent, {
            panelClass: 'contacts-select-dialog',
            data: { contactId }
        });
        dlgRef.afterClosed().subscribe(res => {
            if (res) {
                this.getEmailTemplateForPortalInvitation(res.id);
            }
        });
    }

  }
  getEmailTemplateForPortalInvitation(accountId = ''){
    this.loading = true;
    const basicMailData = {
        subject: 'Portal Invitation',
        };  
    let mail = new Mail(basicMailData);
    this.api.processEmailTemplateByName({ templateName: 'Portal Invitation', contactId: this.contact.id, accountId: accountId, currentUserId: this.authService.getCurrentUser().userId }).subscribe((res: any) => {
        this.loading = false;
        mail.subject = res.subject;
        mail.body = res.bodyHtml;
        mail.to.push(this.contact.email);
        this.openMailDialog(mail);
    });
    
  }
  openMailDialog(mail: Mail) {
        this.loading = false;
        this.dialogRefMailComposePortalUser = this.dialog.open(FuseMailComposeDialogComponent, {
            panelClass: 'compose-mail-dialog',
            data: {
                action: 'Send',
                mail: mail,
            }
        });
        this.dialogRefMailComposePortalUser.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                }
                this.loading = true;
                this.dialogRefMailComposePortalUser = null;
                mail = res.mail;
                const data = new FormData();
                const frmData = new FormData();
                data.append('userId', this.authService.getCurrentUser().userId);
                data.append('userName', this.authService.getCurrentUser().firstName + ' ' + this.authService.getCurrentUser().lastName);
                data.append('to', mail.to.join(','));
                data.append('cc', mail.cc.join(','));
                data.append('bcc', mail.bcc.join(','));
                data.append('from', mail.from);
                data.append('subject', mail.subject);
                data.append('body', mail.body);
                
                mail.attachments.forEach((attachment: Attachment) => {
                    data.append('attachment[]', new File([attachment.data], attachment.filename));
                });

                this.api.sendMailSMTP(data)
                    .subscribe(
                        (res: any) => {
                            this.loading = false;
                            this.msg.show('Email sent', 'success');
                        },
                        (err: any) => {
                            this.loading = false;
                            this.msg.show(err.error.msg, 'error');
                            console.log(err);
                        });
            });
        return mail;
  }
  createOrder(type) {
    this.dialogRef = this.dialog.open(OrderFormDialogComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        action: 'new',
        contact: this.contact,
        type: type
      }
    });

    this.dialogRef.afterClosed()
      .subscribe(data => {
        if (data && data.order && data.order.id) {
          if (data.order.orderType == 'Order' || data.order.orderType == 'CreditMemo')
            this.router.navigate(['/e-commerce/orders', data.order.id]);
          else if (data.order.orderType == 'Quote')
            this.router.navigate(['/e-commerce/quotes', data.order.id]);
        }
      });
  }

  selectSalesManager(ev) {
    const assignee = ev.option.value;
    this.contactForm.get('salesManagerName').setValue(assignee.name);
    this.contactForm.get('salesManagerId').setValue(assignee.id);
  }
  
  clearSalesManager(){
    this.contactForm.patchValue({
      salesManagerName: '',
      salesManagerId: ''
    });
  }
  composeDialog(email){
        const basicMailData = {
            subject: '',
        };
    let mail = new Mail(basicMailData);
    mail.to.push(email);
    this.dialogRefMailCompose = this.dialog.open(FuseMailComposeDialogComponent, {
	panelClass: 'compose-mail-dialog',
	data: {
	    action: 'Send',
	    mail: mail
	}
    });
    this.dialogRefMailCompose.afterClosed()
	.subscribe(res => {
	    if (!res) {
		return;
	    }

	    this.dialogRefMailCompose = null;
	    if (!res) {
		return;
	    }
            this.loading = true;
	    mail = res.mail;
	    const data = new FormData();
	    const frmData = new FormData();
	    data.append('userId', this.authService.getCurrentUser().userId);
	    data.append('to', mail.to.join(','));
	    data.append('cc', mail.cc.join(','));
	    data.append('bcc', mail.bcc.join(','));
	    data.append('from', mail.from);
	    data.append('subject', mail.subject);
	    data.append('body', mail.body);

	    mail.attachments.forEach((attachment: Attachment) => {
		data.append('attachment[]', new File([attachment.data], attachment.filename));
		frmData.append('fileUpload[]', new File([attachment.data], attachment.filename));
	    });
	    this.api.sendMailSMTP(data)
		.subscribe(
		    (res: any) => {
		        this.loading = false;
			this.msg.show('Email sent', 'success');
		    },
		    (err: any) => {
			this.loading = false;
			this.msg.show(err.error.msg, 'error');
			console.log(err);
		    }
		);

	});  
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

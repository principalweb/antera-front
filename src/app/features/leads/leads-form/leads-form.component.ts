import { Component, Inject, Input, Output, EventEmitter, ViewEncapsulation, OnInit, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarEvent } from 'angular-calendar';

import { LeadDetails } from 'app/models';
import { displayName, fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { find } from 'lodash';
import { ModuleField } from 'app/models/module-field';
import { PermissionService } from 'app/core/services/permission.service';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';

@Component({
    selector     : 'leads-form-dialog',
    templateUrl  : './leads-form.component.html',
    styleUrls    : ['./leads-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class LeadsFormComponent
{
    event: CalendarEvent;
    dialogTitle: string;
    leadsForm: FormGroup;
    action: string;
    lead: LeadDetails;
    displayName = displayName;

    filteredUsers: any;
    filteredAccounts: any;
    selectedChannels: string[] = [];
    leadSources = [];
    leadStatues = [];
    leadChannels = [];

    merchandiseInterests = [];
    selectedMerchandiseInterests = [];
    contactTypes = [];
    selectedContactTypes = [];

    corporateIdentities: any[];
    loading = false;
    identityEnabled: boolean;
    fields = [];

    fieldLabel = fieldLabel;
    requiredField = requiredField;
    permissionsEnabled: boolean;
    visibleField = (type, fields) => {
        const isVisible = visibleField(type, fields);
        return isVisible;
    }

    formValidationDlgRef: MatDialogRef<FormValidationComponent>;
    excludeInvalidControls = ['accountId', 'salesRepId'];

    @ViewChild('channelsInput') channelsInput: ElementRef;
    channelsInputCtrl = new FormControl();

    @ViewChild('merchandiseInterestsList') merchandiseInterestsList: ElementRef;
    merchandiseInterestsListInputCtrl = new FormControl();

    @ViewChild('contactTypesList') contactTypesList: ElementRef;
    contactTypesListInputCtrl = new FormControl();


    constructor(
        public dialogRef: MatDialogRef<LeadsFormComponent>,
        @Inject(MAT_DIALOG_DATA) data: any,
        public dialog: MatDialog,
        private auth: AuthService,
        private api: ApiService,
        private formBuilder: FormBuilder,
        private msg: MessageService,
        private permService: PermissionService
    )
    {
        this.action = data.action;

        if ( this.action === 'edit' )
        {
            this.dialogTitle = 'Edit Leads';
            this.lead = data.lead;
        }
        else
        {
            this.dialogTitle = 'Create Leads';
            this.lead = new LeadDetails();
            this.lead.status = 'New';
        }

        this.api.getDropdownOptions({dropdown:['lead_source_dom', 'lead_status_dom', 'sys_leads_channel_list', 'sys_leads_merchandise_interest_list', 'sys_leads_contact_type_list']})
                .subscribe((res: any[]) => {
                    const leadSourceDropdown = find(res, {name: 'lead_source_dom'});
                    this.leadSources = leadSourceDropdown.options;

                    const leadStatusDropdown = find(res, {name: 'lead_status_dom'});
                    this.leadStatues = leadStatusDropdown.options;

                    const leadChannelsDropdown = find(res, {name: 'sys_leads_channel_list'});
                    this.leadChannels = leadChannelsDropdown.options;

                    this.leadChannels.forEach((item) => {
                        if(this.lead.channel.indexOf(item.value) !== -1){
                            this.selectedChannels.push(item.value);    
                        }
                    });

		    const merchandiseInterestsDropdown = find(res, {name: 'sys_leads_merchandise_interest_list'});
		    this.merchandiseInterests = merchandiseInterestsDropdown.options;
		    this.merchandiseInterests.forEach((item) => {
			if(this.lead.merchandiseInterest.indexOf(item.value) !== -1){
			    this.selectedMerchandiseInterests.push(item.value);    
			}
		      });

		    const contactTypesDropdown = find(res, {name: 'sys_leads_contact_type_list'});
		    this.contactTypes = contactTypesDropdown.options;

		    this.contactTypes.forEach((item) => {
			if(this.lead.contactType.indexOf(item.value) !== -1){
			    this.selectedContactTypes.push(item.value);    
			}
		      });

                    
                });
    }

    ngOnInit() {

        const leadsModuleFieldParams = 
        {
            offset: 0,
            limit: 200,
            order: 'module',
            orient: 'asc',
            term: { module : 'Leads' }
        }
        this.loading = true;
        this.api.getFieldsList(leadsModuleFieldParams)
            .subscribe((res: any[])=> {
                this.fields = res.map(moduleField => new ModuleField(moduleField));
                this.loading = false;
                this.leadsForm = this.createLeadsForm();

                this.filteredUsers = this.leadsForm.get('salesRep').valueChanges.pipe(
                        debounceTime(400),
                        distinctUntilChanged(),
                    switchMap(keyword => 
                            this.api.getUserAutocomplete(keyword)
                        )
                    );
                
                this.filteredAccounts = this.leadsForm.get('accountName').valueChanges.pipe(
                    debounceTime(400),
                    distinctUntilChanged(),
                    switchMap(keyword => 
                        this.api.getAccountAutocomplete(keyword)
                    ),
                );
            },() => {this.loading = false;});

        this.permService.getPermissionStatus().subscribe((res: any) => {
            if (res == '0' || res == 0 || res == false) {
                res = false
            } else {
                res = true;
            }

            this.permissionsEnabled = res;
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
    
    createLeadsForm()
    {
        return this.formBuilder.group({
            id                      : this.lead.id,
            firstName               : [this.lead.firstName, Validators.required],
            lastName                : [this.lead.lastName, Validators.required],
            title                   : requiredField('title',this.fields) ? [this.lead.title, Validators.required] : [this.lead.title],
            salesRepId              : requiredField('salesRepId', this.fields) ? [this.lead.salesRepId, Validators.required] : [this.lead.salesRepId],
            salesRep                : requiredField('salesRep', this.fields) ? [this.lead.salesRep, Validators.required] : [this.lead.salesRep],
            department              : requiredField('department',this.fields) ? [this.lead.department, Validators.required] : [this.lead.department],
            accountId               : requiredField('accountId', this.fields) ? [this.lead.accountId, Validators.required] : [this.lead.accountId],
            accountName             : requiredField('accountName', this.fields) ? [this.lead.accountName, Validators.required] : [this.lead.accountName],
            email                   : requiredField('email', this.fields) ? [this.lead.email, Validators.required] : [this.lead.email],
            phoneWork               : requiredField('phoneWork', this.fields) ? [this.lead.phoneWork, Validators.required] : [this.lead.phoneWork],
            phoneMobile             : requiredField('phoneMobile', this.fields) ? [this.lead.phoneMobile, Validators.required] : [this.lead.phoneMobile],
            dateCreated             : this.lead.dateCreated,
            notes                   : requiredField('notes', this.fields) ? [this.lead.notes, Validators.required] : [this.lead.notes],
            createdBy               : this.lead.createdBy,
            createdByName           : this.lead.createdByName,
            leadSource              : requiredField('leadSource',this.fields) ? [this.lead.leadSource, Validators.required] : [this.lead.leadSource],
            referedBy               : requiredField('referedBy',this.fields) ? [this.lead.referedBy, Validators.required] : [this.lead.referedBy],
            status                  : [this.lead.status, Validators.required],
            description             : requiredField('description',this.fields) ? [this.lead.description, Validators.required] : [this.lead.description],
            phoneFax                : requiredField('phoneFax',this.fields) ? [this.lead.phoneFax, Validators.required] : [this.lead.phoneFax],
            website                 : requiredField('website',this.fields) ? [this.lead.website, Validators.required] : [this.lead.website],
            corporateIdentityId     : requiredField('corporateIdentityId',this.fields) ? [this.lead.corporateIdentityId, Validators.required] : [this.lead.corporateIdentityId],
            primaryAddressStreet    : requiredField('primaryAddressStreet', this.fields) ? [this.lead.primaryAddressStreet, Validators.required] : [this.lead.primaryAddressStreet],
            primaryAddressStreet2   : requiredField('primaryAddressStreet2', this.fields) ? [this.lead.primaryAddressStreet2, Validators.required] : [this.lead.primaryAddressStreet2],
            primaryAddressCity      : requiredField('primaryAddressCity', this.fields) ? [this.lead.primaryAddressCity, Validators.required] : [this.lead.primaryAddressCity],
            primaryAddressState     : requiredField('primaryAddressState', this.fields) ? [this.lead.primaryAddressState, Validators.required] : [this.lead.primaryAddressState],
            primaryAddressPostalcode: requiredField('primaryAddressPostalcode', this.fields) ? [this.lead.primaryAddressPostalcode, Validators.required] : [this.lead.primaryAddressPostalcode],
            primaryAddressCountry   : requiredField('primaryAddressCountry', this.fields) ? [this.lead.primaryAddressCountry, Validators.required] : [this.lead.primaryAddressCountry],
            altAddressStreet        : requiredField('altAddressStreet', this.fields) ? [this.lead.altAddressStreet, Validators.required] : [this.lead.altAddressStreet],
            altAddressStreet2       : requiredField('altAddressStreet2', this.fields) ? [this.lead.altAddressStreet2, Validators.required] : [this.lead.altAddressStreet2],
            altAddressCity          : requiredField('altAddressCity', this.fields) ? [this.lead.altAddressCity, Validators.required] : [this.lead.altAddressCity],
            altAddressState         : requiredField('altAddressState', this.fields) ? [this.lead.altAddressState, Validators.required] : [this.lead.altAddressState],
            altAddressPostalcode    : requiredField('altAddressPostalcode', this.fields) ? [this.lead.altAddressPostalcode, Validators.required] : [this.lead.altAddressPostalcode],
            altAddressCountry       : requiredField('altAddressCountry', this.fields) ? [this.lead.altAddressCountry, Validators.required] : [this.lead.altAddressCountry],
            rating                  : requiredField('rating', this.fields) ? [this.lead.rating, Validators.required] : [this.lead.rating],
            channel                 : requiredField('channel', this.fields) ? [this.lead.channel, Validators.required] : [this.lead.channel],
            merchandiseInterest     : requiredField('merchandiseInterest', this.fields) ? [this.lead.merchandiseInterest, Validators.required] : [this.lead.merchandiseInterest],
            contactType             : requiredField('contactType', this.fields) ? [this.lead.contactType, Validators.required] : [this.lead.contactType],
        });
    }

    create() {
        this.checkDropdownValidation();
        if (this.leadsForm.invalid) {
            this.showValidation('new');
            //this.msg.show('Please complete the form first', 'error');
            return;
        }
        this.leadsForm.get('channel').setValue(this.selectedChannels);
        this.leadsForm.get('merchandiseInterest').setValue(this.selectedMerchandiseInterests);
        this.leadsForm.get('contactType').setValue(this.selectedContactTypes);
        this.lead.setData(this.leadsForm.value);
        const user = this.auth.getCurrentUser();
        this.lead.userId = user.userId;
        this.lead.modifiedUserId = user.userId;
        this.lead.createdBy = user.userId;
        this.lead.createdByName = user.firstName + ' ' + user.lastName;
        this.dialogRef.close(this.lead);
    }

    update() {
        this.checkDropdownValidation();
        if (this.leadsForm.invalid) {
            //this.msg.show('Please complete the form first', 'error');
            this.showValidation('update');
            return;
        }
        this.leadsForm.get('channel').setValue(this.selectedChannels);
        this.leadsForm.get('merchandiseInterest').setValue(this.selectedMerchandiseInterests);
        this.leadsForm.get('contactType').setValue(this.selectedContactTypes);

        this.lead.setData(this.leadsForm.value);
        const user = this.auth.getCurrentUser();
        this.lead.modifiedUserId = user.userId;
        this.dialogRef.close(['save', this.lead]);
    }
    showValidation(action){
            this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
              panelClass: 'app-form-validation',
              data: {
                action: action,
                moduleForm: this.leadsForm,
                fields: this.fields,
                excludeInvalidControls: this.excludeInvalidControls
              }
            });

            this.formValidationDlgRef.afterClosed().subscribe(data => {
              if (data) {
                data.invalidControls.forEach((control) => {
                  this.leadsForm.get(control).markAsTouched();
                });
              }
              this.formValidationDlgRef = null;
            });    
    }
    checkDropdownValidation(){
	    if(this.leadsForm.get('salesRep').value == null || this.leadsForm.get('salesRep').value == '' || this.leadsForm.get('salesRepId').value == null || this.leadsForm.get('salesRepId').value == ''){
		this.leadsForm.patchValue({
		  salesRep: '',
		  salesRepId: ''
		});        
	    }
/*
	    if(this.leadsForm.get('accountName').value == null || this.leadsForm.get('accountName').value == '' || this.leadsForm.get('accountId').value == null || this.leadsForm.get('accountId').value == ''){
		this.leadsForm.patchValue({
		  accountName: '',
		  accountId: ''
		});        
	    }
	    */
    }
    selectAssignee(ev) {
        const assignee = ev.option.value;
        this.leadsForm.patchValue({
            salesRep: assignee.name,
            salesRepId: assignee.id
        });
    }

    clearAssignee() {
      this.leadsForm.patchValue({
        salesRep: '',
        salesRepId: ''
      });
    }

    selectAccount(ev) {
        const account = ev.option.value;
        this.leadsForm.patchValue({
            accountName: account.name,
            accountId: account.id
        });
    }
    clearAccount() {
      this.leadsForm.patchValue({
        accountName: '',
        accountId: ''
      });
    }
  channelSelected(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.value.value);
    if (event.option.value.value) {
      this.selectedChannels.push(event.option.value.value);
      this.channelsInputCtrl.setValue(null);
    }
  }

  channelLabel(value) {
      const term = this.leadChannels.find(item => item.value == value);
      if(term.label){
          return term.label;
      }
      return '';
  }
  
  removeChannels(id) {
    const index = this.selectedChannels.indexOf(id);
    if (index >= 0) {
      this.selectedChannels.splice(index, 1);
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

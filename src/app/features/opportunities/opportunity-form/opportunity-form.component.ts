import { Component, Inject, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { CalendarEvent } from 'angular-calendar';
import { find } from 'lodash';

import { OpportunityDetails } from '../../../models';
import { ApiService } from '../../../core/services/api.service';

import { RelatedContactsDialogComponent } from 'app/shared/related-contacts-dialog/related-contacts-dialog.component';
import { RelatedAccountsDialogComponent } from 'app/shared/related-accounts-dialog/related-accounts-dialog.component';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { displayName, requiredField, visibleField, fieldLabel } from '../../../utils/utils';
import { MessageService } from 'app/core/services/message.service';
import { ModuleField } from 'app/models/module-field';
import { AwsFileManagerComponent } from 'app/shared/aws-file-manager/aws-file-manager.component';
import { AwsCreateDirComponent } from 'app/shared/aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from 'app/shared/aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from 'app/shared/aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from 'app/shared/aws-rename-dir/aws-rename-dir.component';
import { PermissionService } from 'app/core/services/permission.service';
import { AuthService } from 'app/core/services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';
import { Router } from '@angular/router';
import { ContactFormDialogComponent } from 'app/shared/contact-form/contact-form.component';
import { AccountDetailsDialogComponent } from 'app/features/accounts/components/account-details-dialog/account-details-dialog.component';
import { ContactsService } from 'app/core/services/contacts.service';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { Account } from '../../../models';

@Component({
    selector     : 'opportunity-form-dialog',
    templateUrl  : './opportunity-form.component.html',
    styleUrls    : ['./opportunity-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class OpportunityFormDialogComponent implements AfterViewInit
{
    @ViewChild(AwsFileManagerComponent) awsfilemanager: AwsFileManagerComponent;
    @ViewChild(AwsCreateDirComponent) awscreatedircomponent: AwsCreateDirComponent;
    @ViewChild(AwsDocViewerComponent) awsdocviewercomponent: AwsDocViewerComponent;
    @ViewChild(AwsTaggingComponent) awstaggingcomponent: AwsTaggingComponent;
    @ViewChild(AwsRenameDirComponent) awsrenamedircomponent: AwsRenameDirComponent;
    awsFileManagerType = 'opportunities';
    event: CalendarEvent;
    dialogTitle: string;
    opportunityForm: FormGroup;
    action: string;
    opportunity: OpportunityDetails;
    leadSources = [];
    permissionsEnabled: boolean;

    filteredAccounts: any;
    filteredContacts: any;
    filteredStages: any;
    filteredAssignees: Observable<any[]>;

    campaigns = [];
    inventories = [];
    reasonForLosses = [];
    salesStages: any = [];
    businessTypes: any = [];
    displayName = displayName;
    customerType = 'New';
    isEmailExist = false;

    eventDate: any;
    dateClosed: any;
    inhandsDate: any;
    reasonForLoss = "";

    @ViewChild(MatAutocompleteTrigger) autoAccount: MatAutocompleteTrigger;
    @ViewChild(MatAutocompleteTrigger) autoContact: MatAutocompleteTrigger;

    loading = false;
    fields = [];

    fieldLabel = fieldLabel;
    visibleField = visibleField;
    requiredField = requiredField;
    filteredSourceAssignees: Observable<any[]>;
    formValidationDlgRef: MatDialogRef<FormValidationComponent>;
    excludeInvalidControls = ['salesRepId', 'assignedSourcingRepId', 'accountId', 'contactId'];
    onDropdownOptionsForAccountChangedSubscription: Subscription;
    onTimezonesDropdownChangedSubscription: Subscription;
    dropdownOptions = [];
    timezones = [];

    constructor(
        public dialogRef: MatDialogRef<OpportunityFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private api: ApiService,
        private msg: MessageService,
        private authService: AuthService,
        private permService: PermissionService,
        private router: Router,
        private contactsService: ContactsService,
        private accountService: AccountsService,
    )
    {
        this.action = data.action;

        if ( this.action === 'edit' )
        {
            this.dialogTitle = 'Edit Opportunity';
            this.opportunity = data.opportunity;
        }
        else
        {
            this.dialogTitle = 'New Opportunity';
            this.opportunity = new OpportunityDetails();

            const user = this.authService.getCurrentUser();
            this.opportunity.salesRepId = user.userId;
            this.opportunity.salesRep = user.firstName + ' ' + user.lastName;
            this.opportunity.typeAcct = 'Existing';

            if (data.account){
                this.opportunity.accountId = data.account.id;
                this.opportunity.accountName = data.account.accountName;
                this.opportunity.salesRep = data.account.salesRep;
                this.opportunity.salesRepId = data.account.salesRepId;
                this.opportunity.contactId = data.account.contactId;
                this.opportunity.contactName = data.account.contactName;
                this.opportunity.contactEmail = data.account.contactEmail;
                this.opportunity.leadSource = data.account.leadSource;
            }

            if (data.contact) {
                this.opportunity.contactId = data.contact.id;
                this.opportunity.contactName = `${data.contact.firstName} ${data.contact.lastName}`;
                this.opportunity.contactEmail = data.contact.email;
                this.opportunity.salesRep = data.contact.salesRep;
                this.opportunity.salesRepId = data.contact.salesRepId;
                this.opportunity.leadSource = data.contact.leadSource;
            }
            
        }
        this.customerType = this.opportunity.typeAcct;
        
        this.eventDate = (this.action == 'edit') ? this.opportunity.eventDate : '';
        this.dateClosed = (this.action == 'edit') ? this.opportunity.dateClosed : '';
        this.inhandsDate = (this.action == 'edit') ? this.opportunity.inhandsDate : '';
        
        this.api.getOpportunitiesSalesStage()
            .subscribe(stages=> {
                this.salesStages = stages;
            });

        this.api.getOpportunityBusinessTypes()
            .subscribe(types => {
                this.businessTypes = types;
            });
        
        this.api.getDropdownOptions({dropdown:['lead_source_dom','sys_campaign_type_list', 'sys_opportunity_inventory_type_list', 'sys_reasons_for_loss_list']})
            .subscribe((res: any[]) => {
                const leadSourceDropdown = find(res, {name: 'lead_source_dom'});
                this.leadSources = leadSourceDropdown.options;

                const campaignDropdown = find(res, {name: 'sys_campaign_type_list'});
                this.campaigns = campaignDropdown.options;

                const inventoryDropdown = find(res, {name: 'sys_opportunity_inventory_type_list'});
                this.inventories = inventoryDropdown.options;

                const reasonLossDropdown = find(res, {name: 'sys_reasons_for_loss_list'});
                this.reasonForLosses = reasonLossDropdown.options;
            });
    }

    ngOnInit() {

        const dropdownOptions = [
            'sys_acctrating_list', 
            'businesspartner_list', 
            'account_type_dom', 
            'industry_dom', 
            'lead_source_dom', 
            'sys_credit_terms_list',
            'sys_shippacct_list',
            'multi_tax_rate_list',
            'sys_accounts_group_list',
            'sys_accounts_service_status_list',
            'sys_tax_exemption_reason_id_list',
            'sys_brand_affiliation_list',
            'sys_annual_budget_list',
            'sys_vendor_decoration_price_strategy',
            'sys_leads_channel_list',
          ];
        this.api.getDropdownOptions({ dropdown: dropdownOptions })
        .subscribe((res: any[]) => {
                console.log("res",res)
                if (!res) return;
                this.dropdownOptions = res;
                console.log("dropdownOptions",this.dropdownOptions)
            
            });

        this.onTimezonesDropdownChangedSubscription = 
        this.accountService.onTimezonesDropdownChanged
            .subscribe((res: any[]) => {
                if (!res) return;
                this.timezones = res;
            });

        const opportunityModuleFieldParams = 
        {
            offset: 0,
            limit: 200,
            order: 'module',
            orient: 'asc',
            term: { module : 'Opportunities' }
        }
        this.loading = true;
        this.api.getFieldsList(opportunityModuleFieldParams)
            .subscribe((res: any[])=> {
                this.fields = res.map(moduleField => new ModuleField(moduleField));
                this.loading = false;
                this.opportunityForm = this.createOpportunityForm();

                this.filteredAccounts =
                    this.opportunityForm.get('accountName')
                        .valueChanges.pipe(
                            debounceTime(300),
                            distinctUntilChanged(),
                            switchMap(val => this.api.getCustomerAutocomplete(val))
                        );
            
                this.filteredContacts =
                    this.opportunityForm.get('contactName')
                        .valueChanges.pipe(
                            debounceTime(300),
                            distinctUntilChanged(),
                            switchMap(val => this.api.getContactAutocomplete(val, true))
                        );

                this.filteredAssignees = 
                        this.autoCompleteWith('salesRep', val => 
                        this.api.getUserAutocomplete(val)
                        );

                this.filteredSourceAssignees = 
                        this.autoCompleteWith('assignedSourcingRep', val => 
                        this.api.getUserAutocomplete(val)
                        );

			this.opportunityForm.get('contactName').valueChanges.pipe(
			    debounceTime(800),
			    distinctUntilChanged(),
			    ).subscribe(val => {
			      if (val.length === 0) {
			  	 this.opportunityForm.get('contactId').setValue('');
			      }
			});


			this.opportunityForm.get('contactEmail').valueChanges.pipe(
			    debounceTime(800),
			    distinctUntilChanged(),
			    ).subscribe(val => {
			      if (val.length === 0) {
			  	this.isEmailExist = false;
			      }else{
				if(this.validateEmail(val) && this.opportunityForm.get('contactId').value == ''){
				    this.api.checkContactEmail(val).subscribe((res: any) => {
					    if (res.id && res.id != '') {
						this.isEmailExist = true;
					    }else{
					        this.isEmailExist = false;
					    }
				    });   
				}else{
				   this.isEmailExist = false;
				}
			    }
			});


            },() => {this.loading = false;});

        this.permService.getPermissionStatus().subscribe((res: any) => {
            if (res == '0' || res == 0 || res == false) {
                res = false
            } else {
                res = true;
            }

            this.permissionsEnabled = res;
        });
    }

    ngAfterViewInit() {

    }

    createOpportunityForm()
    {
        return this.formBuilder.group({
            id:                    [this.opportunity.id],
            name:                  [this.opportunity.name, Validators.required],
            opportunityType:       requiredField('opportunityType',this.fields) ? [this.opportunity.opportunityType, Validators.required] : [this.opportunity.opportunityType],
            typeAcct:              requiredField('typeAcct',this.fields) ? [{value: this.opportunity.typeAcct, disabled: true}, Validators.required] : [this.opportunity.typeAcct],
            amount:                requiredField('amount',this.fields) ? [this.opportunity.amount, Validators.required] : [this.opportunity.amount],
            salesStage:            requiredField('salesStage',this.fields) ? [this.opportunity.salesStage, Validators.required] : [this.opportunity.salesStage],
            probability:           requiredField('probability',this.fields) ? [{value: this.opportunity.probability, disabled: true}, Validators.required] : [this.opportunity.probability],
            description:           requiredField('description',this.fields) ? [this.opportunity.description, Validators.required] : [this.opportunity.description],
            accountId:             requiredField('accountId',this.fields) ? [this.opportunity.accountId] : [this.opportunity.accountId],
            accountName:           requiredField('accountName',this.fields) ? [this.opportunity.accountName] : [this.opportunity.accountName],
            accountNameExtra:      requiredField('accountNameExtra',this.fields) ? [this.opportunity.accountNameExtra, Validators.required] : [this.opportunity.accountNameExtra],
            contactId:             requiredField('contactId',this.fields) ? [this.opportunity.contactId] : [this.opportunity.contactId],
            contactName:           requiredField('contactName',this.fields) ? [this.opportunity.contactName] : [this.opportunity.contactName],
            contactEmail:          requiredField('contactEmail',this.fields) ? [this.opportunity.contactEmail, Validators.required] : [this.opportunity.contactEmail],
            leadSource:            requiredField('leadSource',this.fields) ? [this.opportunity.leadSource, Validators.required] : [this.opportunity.leadSource],
            nextStep:              requiredField('nextStep',this.fields) ? [this.opportunity.nextStep, Validators.required] : [this.opportunity.nextStep],
            salesRep:              requiredField('salesRep',this.fields) ? [this.opportunity.salesRep, Validators.required] : [this.opportunity.salesRep],
            salesRepId:            requiredField('salesRepId',this.fields) ? [this.opportunity.salesRepId, Validators.required] : [this.opportunity.salesRepId],
            assignedSourcingRep:   requiredField('assignedSourcingRep',this.fields) ? [this.opportunity.assignedSourcingRep, Validators.required] : [this.opportunity.assignedSourcingRep],
            assignedSourcingRepId: requiredField('assignedSourcingRepId',this.fields) ? [this.opportunity.assignedSourcingRepId, Validators.required] : [this.opportunity.assignedSourcingRepId],
            budget:                requiredField('budget',this.fields) ? [this.opportunity.budget, Validators.required] : [this.opportunity.budget],
            location:              requiredField('location',this.fields) ? [this.opportunity.location, Validators.required] : [this.opportunity.location],
            campaignIdExtra:       requiredField('campaignIdExtra',this.fields) ? [this.opportunity.campaignIdExtra, Validators.required] : [this.opportunity.campaignIdExtra],
            inventory:             requiredField('inventory',this.fields) ? [this.opportunity.inventory, Validators.required] : [this.opportunity.inventory],
            opportunityNo:         requiredField('opportunityNo',this.fields) ? [{value: this.opportunity.opportunityNo, disabled: true}, Validators.required] : [this.opportunity.opportunityNo],
            reasonsForLoss:        requiredField('reasonsForLoss',this.fields) ? [this.opportunity.reasonsForLoss, Validators.required] : [this.opportunity.reasonsForLoss]
        });
    }

    selectAccount(ev) {
        console.log("ev",ev.option.value.id)
        if (ev.option.value.id === 'add') {
            this.opportunityForm.patchValue({
                accountId: "",
                accountName: ""
            });
            // const dlgRef = this.dialog.open(AccountDetailsDialogComponent, {
            //     panelClass: 'antera-details-dialog',
            //     // data: {
            //     //   action: 'new',
            //     //   service: this.contactsService
            //     // }
            //   });
            const dlgRefs = this.dialog.open(AccountDetailsDialogComponent, {
                panelClass: 'account-details-dialog',
                data      : {
                    action: 'new',
                    service : this.accountService,
                    dropdowns: [this.dropdownOptions, this.timezones],
                    type:'opportunity',
                }
            });
            dlgRefs.afterClosed().subscribe(data => {
                console.log(data);
                
                if(data && data.account && data.account.status == 'success') {
                    this.opportunityForm.patchValue({
                        accountId: data.account.extra.id,
                        accountName: data.account.extra.accountName
                    });
                } else {
                    if(data) {
                        this.msg.show('Creating account failed', 'error');
                    }
                    
                }
                
            })
        } else {
            const acc = ev.option.value;
            this.opportunityForm.patchValue({
                accountId: acc.id,
                accountName: acc.name
            });
            this.api.getRelatedContactsCount({
                accountId: acc.id,
                offset: 0,
                limit: 1000,
                permUserId: this.authService.getCurrentUser().userId
            }).subscribe((res: any) => {
                if(res.count > 1) {
                    this.showRelatedContactsDialog(acc.id);
                } else if (res.count === 1) {
                    this.selectRelatedContact(acc.id);
                }
            }, err => {console.log(err)});
        }

    }

    selectContact(ev) {
        
        if (ev.option.value.id === 'add') {
            this.opportunityForm.patchValue({
                contactId: "",
                contactName: "",
                contactEmail: ""
            });
            const dlgRef = this.dialog.open(ContactFormDialogComponent, {
                panelClass: 'antera-details-dialog',
                data: {
                  action: 'new',
                  service: this.contactsService
                }
              });
              dlgRef.afterClosed().subscribe(data => {
                
                if (data && data.contact && data.contact.status == 'success') {
                  //this.dialogRef = null;
                //   this.opportunityForm.patchValue({
                //     contactId: data.contact.extra.id,
                //     contactName: data.contact.extra.firstName+' '+data.contact.extra.lastName,
                //     contactEmail: data.contact.extra.email
                // });
                if (this.opportunityForm.value.accountId) {
                    this.loading = true;
                    this.api.linkAccountContact(this.opportunityForm.value.accountId, data.contact.extra.id)
                      .subscribe(() => {
                        this.loading = false;
                        this.opportunityForm.get('contactId').setValue(data.contact.extra.id);
                        this.opportunityForm.get('contactName').setValue(data.contact.extra.firstName + ' ' + data.contact.extra.lastName);
                      }, (err) => {
                        this.loading = false;
                        this.opportunityForm.get('contactId').setValue('');
                        this.opportunityForm.get('contactName').setValue('');
                        this.msg.show('Linking account & contact failed','error');
                      })
                  } else {
                    this.opportunityForm.get('contactId').setValue(data.contact.extra.id);
                    this.opportunityForm.get('contactName').setValue(data.contact.extra.firstName + ' ' + data.contact.extra.lastName);
                    this.opportunityForm.get('contactEmail').setValue(data.contact.extra.email);
                  }
                //   if (data.relatedAccounts && data.relatedAccounts.length > 0) {
                //     const batch = [];
                //     data.relatedAccounts.forEach((account) => {
                //       batch.push(this.api.linkAccountContact(account.id, data.contact.extra.id));
                //     });
                //     this.loading = true;
                //     forkJoin(...batch)
                //       .subscribe(
                //         (res) => {
                //           this.loading = false;
                //           this.reloadContacts();
                //         }
                //       );
                //   }
                //   else {
                //     this.loading = true;
                //     this.api.linkAccountContact(this.account.id, data.contact.extra.id)
                //       .subscribe(() => {
                //         this.loading = false;
                //         this.reloadContacts();
                //       }, (err) => {
                //         this.loading = false;
                //         this.msg.show('Linking account & contact failed', 'error');
                //       });
                //   }
                } else {
                  //this.dialogRef = null;
                  if(data) {
                    this.msg.show('Creating contact failed', 'error');
                  }
                  
                }
        
              })
        } else {
            const c = ev.option.value;
            this.opportunityForm.patchValue({
                contactId: c.id,
                contactName: c.name,
                contactEmail: c.email
            });
            this.api.getRelatedAccountsCount({
                contactId: c.id,
                permUserId: this.authService.getCurrentUser().userId
            }).subscribe((res: any) => {
                if(res.count > 1) {
                    this.showRelatedAccountsDialog(c.id);
                } else if (res.count === 1) {
                    this.selectRelatedAccount(c.id);
                }
            });
        }
    }

    redirectContact(id) {
        if(id) {
            window.open(`/contacts/${id}`, '_blank');
        }       
    }

    redirectAccount(id) {
        if(id) {
            window.open(`/accounts/${id}`, '_blank');
        }       
    }

    selectCampaign(ev) {
        const campaign = ev.option.value;
        this.opportunityForm.patchValue({
            campaignId: campaign.id,
            campaignIdExtra: campaign.name
        });
    }

    changeProbability(ev) {
        const st = find(this.salesStages, { stageKey: ev.value });
        this.opportunity.salesStage = st.stageKey;
        if(st.stageKey === 'ClosedLost') {
            this.api.getDropdownOptions({dropdown:['sys_reasons_for_loss_list']})
            .subscribe((res: any[]) => {
                const reasonLossDropdown = find(res, {name: 'sys_reasons_for_loss_list'});
                const reasonForLosses = reasonLossDropdown.options;
                let dialogRef = this.dialog.open(ReasonForLossFormDialogComponent, {
                    width: '400px',
                    data: { reasonForLosses: reasonForLosses }
                });
                dialogRef.afterClosed().subscribe(result => {
                    if (!result) {
                      return;
                    }
                    this.reasonForLoss = result;
                });
            });
        }
        if (st.stageKey != 'ClosedLost')
        {
            this.opportunity.reasonsForLoss = '';
            this.opportunity.salesStage = st.stageKey;
        }
        this.opportunityForm.patchValue({
            probability: st.probability
        });
    }

    create() {
        if (this.opportunityForm.invalid) {
            this.showValidation('new');
            //this.msg.show('Please complete the form first', 'error');
            return;
        }

        if (this.customerType == 'New' && this.opportunityForm.get('accountNameExtra').value == '')
        {
            this.msg.show('Valid Account Name is required', 'error');
            return;
        }
        else if (this.customerType == 'Existing' && this.opportunityForm.get('accountId').value == '')
        {
            this.msg.show('Valid Account name is required', 'error');
            return;
        }

        if (this.opportunityForm.value.amount == 0) {
            this.msg.show('Amount should be bigger than 0', 'error');
            return;
        }

        if (requiredField('dateClosed',this.fields) && !moment(this.dateClosed).isValid()) {
            this.msg.show('Please select the '+fieldLabel('dateClosed', this.fields)+'.', 'error');
            return;
        }

        if (requiredField('eventDate',this.fields) && !moment(this.eventDate).isValid()) {
            this.msg.show('Please select the '+fieldLabel('eventDate', this.fields)+'.', 'error');
            return;
        }

        if (requiredField('inhandsDate',this.fields) && !moment(this.inhandsDate).isValid()) {
            this.msg.show('Please select the '+fieldLabel('inhandsDate', this.fields)+'.', 'error');
            return;
        }

        const opportunityData = {
            ...this.opportunityForm.getRawValue(),
            dateClosed: moment(this.dateClosed).format('YYYY-MM-DD'),
            eventDate: moment(this.eventDate).format('YYYY-MM-DD'),
            inhandsDate: moment(this.inhandsDate).format('YYYY-MM-DD')
        };
        this.dialogRef.close(opportunityData);
    }

    update() {
        if (this.opportunityForm.invalid) {
            this.showValidation('update');
            //this.msg.show('Please complete the form first', 'error');
            return;
        }

        if (this.customerType == 'New' && this.opportunityForm.get('accountNameExtra').value == '')
        {
            this.msg.show('Valid Account Name is required', 'error');
            return;
        }
        else if (this.customerType == 'Existing' && this.opportunityForm.get('accountId').value == '')
        {
            this.msg.show('Valid Account name is required, Please choose existing account name', 'error');
            return;
        }

        if (this.opportunityForm.value.amount == 0) {
            this.msg.show('Amount should be bigger than 0', 'error');
            return;
        }

        if (requiredField('dateClosed',this.fields) && !moment(this.dateClosed).isValid()) {
            this.msg.show('Please select the '+fieldLabel('dateClosed', this.fields)+'.', 'error');
            return;
        }

        if (requiredField('eventDate',this.fields) && !moment(this.eventDate).isValid()) {
            this.msg.show('Please select the '+fieldLabel('eventDate', this.fields)+'.', 'error');
            return;
        }

        if (requiredField('inhandsDate',this.fields) && !moment(this.inhandsDate).isValid()) {
            this.msg.show('Please select the '+fieldLabel('inhandsDate', this.fields)+'.', 'error');
            return;
        }

        if(moment(this.inhandsDate).isValid() && moment(this.inhandsDate).isValid() && !moment(this.eventDate).isSameOrAfter(this.inhandsDate)){
            this.msg.show(fieldLabel('eventDate', this.fields)+' should be equal to or after '+fieldLabel('inhandsDate', this.fields), 'error');
            return;
        }
        const opportunityData = {
            ...this.opportunityForm.getRawValue(),
            dateClosed: moment(this.dateClosed).format('YYYY-MM-DD'),
            eventDate: moment(this.eventDate).format('YYYY-MM-DD'),
            inhandsDate: moment(this.inhandsDate).format('YYYY-MM-DD')
        };
        
        if(this.reasonForLoss && this.reasonForLoss !== "") {
            opportunityData.reasonsForLoss = this.reasonForLoss
        }
        
        this.dialogRef.close([
            'save',
            opportunityData
        ]);
    }

    selectAssignee(ev) {
        const assignee = ev.option.value;
        this.opportunityForm.patchValue({
            salesRepId: assignee.id,
            salesRep: assignee.name
        });
    }

    selectAssignedSourcing(ev) {
        const assignee = ev.option.value;
        this.opportunityForm.patchValue({
            assignedSourcingRepId: assignee.id,
            assignedSourcingRep: assignee.name
        });
    }
    
    changeCustomerType(ev) {
        this.customerType = ev.value;
        if(this.customerType == 'New'){
            if(this.opportunityForm.get('accountName').value != ''){
                const accountNameExtra = this.opportunityForm.get('accountName').value;
	        this.opportunityForm.patchValue({
	            accountNameExtra: accountNameExtra
	        });
            }
	    this.opportunityForm.patchValue({
	        accountId: '',
	        accountName: ''
	    });
        }
    }

    private showRelatedAccountsDialog(contactId) {
        const dlgRef = this.dialog.open(RelatedAccountsDialogComponent, {
            panelClass: 'contacts-select-dialog',
            data: { contactId }
        });
        this.autoContact.closePanel();
        dlgRef.afterClosed().subscribe(res => {
            if (res) {
                this.opportunityForm.patchValue({
                    accountId: res.id,
                    accountName: res.accountName
                });
            }
        });
    }

    private selectRelatedAccount(contactId) {
        this.api.getRelatedAccounts({ contactId: contactId, permUserId: this.authService.getCurrentUser().userId })
            .subscribe(res => {
                if (res && res[0]) {
                    this.opportunityForm.patchValue({
                        accountId: res[0].id,
                        accountName: res[0].accountName
                    });
                }
            });
    }

    private showRelatedContactsDialog(accountId) {
        this.autoAccount.closePanel();
        document.getElementById("account_input").blur();
        const dlgRef = this.dialog.open(RelatedContactsDialogComponent, {
            panelClass: 'contacts-select-dialog',
            data: { accountId }
        });

        dlgRef.afterClosed().subscribe(res => {
            this.autoAccount.closePanel();
            if (res) {
                this.opportunityForm.patchValue({
                    contactId: res.id,
                    contactName: res.contactName,
                    contactEmail: res.email
                });
            }
        });
    }

    private selectRelatedContact(accountId) {
        this.api.getRelatedContacts({ accountId: accountId, permUserId: this.authService.getCurrentUser().userId })
            .subscribe(res => {
                if (res && res[0]) {
                    this.opportunityForm.patchValue({
                        contactId: res[0].id,
                        contactName: res[0].contactName,
                        contactEmail: res[0].email
                    });
                }
            });
    }

    private autoCompleteWith(field, func): Observable<any[]> {
        return this.opportunityForm.get(field).valueChanges.pipe(
            map(val => displayName(val).trim().toLowerCase()),
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(func)
        );
    }
    showValidation(action){
            this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
              panelClass: 'app-form-validation',
              data: {
                action: action,
                moduleForm: this.opportunityForm,
                fields: this.fields,
                excludeInvalidControls: this.excludeInvalidControls
              }
            });

            this.formValidationDlgRef.afterClosed().subscribe(data => {
              if (data) {
                data.invalidControls.forEach((control) => {
                  this.opportunityForm.get(control).markAsTouched();
                });
              }
              this.formValidationDlgRef = null;
            });    
    }

    clearAssignee() {
      this.opportunityForm.patchValue({
        salesRep: '',
        salesRepId: ''
      });
    }
    clearAssignedSourcing() {
      this.opportunityForm.patchValue({
        assignedSourcingRep: '',
        assignedSourcingRepId: ''
      });
    }

    clearAccount() {
      this.opportunityForm.patchValue({
        accountName: '',
        accountId: ''
      });
    }

    clearContact() {
      this.opportunityForm.patchValue({
        contactName: '',
        contactId: ''
      });
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

@Component({
    selector: 'dialog-overview-example-dialog',
    template: `
    <div mat-dialog-content>
        <div fxLayout="column">
            <p>Please select the reason for loss.</p>
            <mat-form-field fxFlex>
                <mat-select 
                    [(value)]="reasonForLoss">
                    <mat-option [value]="reasonForLoss.value" *ngFor="let reasonForLoss of reasonForLosses">
                        {{ reasonForLoss.label }}
                    </mat-option>
                </mat-select>
            </mat-form-field>
        </div>
    </div>
    <div mat-dialog-actions>
        <button mat-button (click)="onOkClick()">Ok</button>
    </div>
    `
  })
  export class ReasonForLossFormDialogComponent {
  
    reasonForLosses = [];
    reasonForLoss = '';

    constructor(
      public dialogRef: MatDialogRef<ReasonForLossFormDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { 
          this.reasonForLosses = data.reasonForLosses;
          this.reasonForLoss = this.reasonForLosses[0] && this.reasonForLosses[0].value;
      }
  
    onOkClick(): void {
      this.dialogRef.close(this.reasonForLoss);
    }
  
}

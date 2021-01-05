import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
import { SourceDetails } from 'app/models/source';
import { find } from 'lodash';
import { Observable } from 'rxjs';
import { displayName } from '../../utils';
import * as moment from 'moment';
import { FuseUtils } from '@fuse/utils';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-source-form',
  templateUrl: './source-form.component.html',
  styleUrls: ['./source-form.component.scss'],
})
export class SourceFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  sourceForm: FormGroup;
  
  sourceDetails: SourceDetails;
  loading = false;
  loaded = () => {  
      this.loading = false;
  };

  statuses = [];
  displayName = displayName;
  quoteValidThrough: any;

  filteredAssignees: Observable<any[]>;
  filteredAccounts: Observable<any[]>;
  filteredContacts: Observable<any[]>;
  filteredOpportunities = [];
  filteredSourceAssignees: Observable<any[]>;

  constructor(
    public dialogRef: MatDialogRef<SourceFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private api: ApiService,
  )
  { 
    this.action = data.action;
    if ( this.action === 'edit' )
    {
      this.dialogTitle = 'Edit Source Details';
      this.sourceDetails = data.sourceDetails;
      this.sourceDetails.modifiedById = this.auth.getCurrentUser().userId;
      this.sourceDetails.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.sourceDetails.dateModified = new Date();
    }
    else
    {
      this.dialogTitle = 'Create Source';
      this.sourceDetails = new SourceDetails();
      this.sourceDetails.createdById = this.auth.getCurrentUser().userId;
      this.sourceDetails.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.sourceDetails.dateEntered = new Date();

      if (data.opportunity) {
        this.sourceDetails.gcName = data.opportunity.name;
        this.sourceDetails.gcItemNumber = FuseUtils.generateGUID();
        this.sourceDetails.status = 'New Request';
        this.sourceDetails.specifications = data.opportunity.description;
        this.sourceDetails.accountId = data.opportunity.accountId;
        this.sourceDetails.accountName = data.opportunity.accountName;
        this.sourceDetails.contactId = data.opportunity.contactId;
        this.sourceDetails.contactName = data.opportunity.contactName;
        this.sourceDetails.assignedSalesRep = data.opportunity.salesRep;
        this.sourceDetails.assignedSalesRepId = data.opportunity.salesRepId;
        this.sourceDetails.opportunityId = data.opportunity.id;
        this.sourceDetails.opportunityNo = data.opportunity.opportunityNo;
      }

      if (data.contact) {
        this.sourceDetails.contactId = data.contact.id;
        this.sourceDetails.contactName = `${data.contact.firstName} ${data.contact.lastName}`;
        this.sourceDetails.assignedSalesRep = data.contact.salesRep;
        this.sourceDetails.assignedSalesRepId = data.contact.salesRepId;
      }
    }

    this.quoteValidThrough = (this.action == 'edit') ? this.sourceDetails.quoteValidThrough : '';

    this.sourceForm = this.createSourceDetailsForm();
    this.loading = true;
    this.api.getDropdownOptions({dropdown:['sys_sourcing_status_list']})
      .subscribe((res: any[]) => {
          this.loading = false;
          const sourceDropdown = find(res, {name: 'sys_sourcing_status_list'});
          this.statuses = sourceDropdown.options;
      }, () => {
          this.loading = false;
      });
  }

  createSourceDetailsForm()
  {
    return this.formBuilder.group({
      itemName                  : [this.sourceDetails.itemName],
      itemNumber                : [this.sourceDetails.itemNumber],
      gcName                    : [this.sourceDetails.gcName, Validators.required],
      gcItemNumber              : [this.sourceDetails.gcItemNumber, Validators.required],
      size                      : [this.sourceDetails.size],
      material                  : [this.sourceDetails.material],
      specifications            : [this.sourceDetails.specifications, Validators.required],
      decorationType            : [this.sourceDetails.decorationType],
      testingRequirements       : [this.sourceDetails.testingRequirements],
      artCharge                 : [this.sourceDetails.artCharge],
      toolingCharge             : [this.sourceDetails.toolingCharge],
      toolingTime               : [this.sourceDetails.toolingTime],
      sampleCost                : [this.sourceDetails.sampleCost],
      sampleTime                : [this.sourceDetails.sampleTime],
      productionLeadTime        : [this.sourceDetails.productionLeadTime],
      packaging                 : [this.sourceDetails.packaging],
      masterCartonWidth         : [this.sourceDetails.masterCartonWidth],
      masterCartonHeight        : [this.sourceDetails.masterCartonHeight],
      masterCartonDepth         : [this.sourceDetails.masterCartonDepth],
      masterCartonWeight        : [this.sourceDetails.masterCartonWeight],
      fobChinaPort              : [this.sourceDetails.fobChinaPort],
      factoryTerms              : [this.sourceDetails.factoryTerms],
      factoryRemarks            : [this.sourceDetails.factoryRemarks],
      thirdPartyAudits          : [this.sourceDetails.thirdPartyAudits],
      certificates              : [this.sourceDetails.certificates],
      status                    : [this.sourceDetails.status, Validators.required],
      assignedSalesRep          : [this.sourceDetails.assignedSalesRep, Validators.required],
      assignedSalesRepId        : [this.sourceDetails.assignedSalesRepId, Validators.required],
      assignedSourcingRep       : [this.sourceDetails.assignedSalesRep],
      assignedSourcingRepId     : [this.sourceDetails.assignedSalesRepId],
      dateEntered               : [this.sourceDetails.dateEntered],
      dateModified              : [this.sourceDetails.dateModified],
      createdById               : [this.sourceDetails.createdById],
      createdByName             : [this.sourceDetails.createdByName],
      modifiedById              : [this.sourceDetails.modifiedById],
      modifiedByName            : [this.sourceDetails.modifiedByName],
      // Extended fields
      accountId                 : [this.sourceDetails.accountId, Validators.required],
      accountName               : [this.sourceDetails.accountName, Validators.required],
      contactId                 : [this.sourceDetails.contactId, Validators.required],
      contactName               : [this.sourceDetails.contactName, Validators.required],
      opportunityId             : [this.sourceDetails.opportunityId, Validators.required],
      opportunityNo             : [this.sourceDetails.opportunityNo, Validators.required],
    });
  }

  ngOnInit() 
  {
  }

  ngAfterViewInit() 
  {
    this.filteredAssignees = 
      this.autoCompleteWith('assignedSalesRep', val => 
        this.api.getUserAutocomplete(val)
      );
    
    this.filteredAccounts = 
      this.autoCompleteWith('accountName', val => 
        this.api.getAccountAutocomplete(val)
      );
    
    this.filteredContacts = 
      this.autoCompleteWith('contactName', val => 
        this.api.getContactAutocomplete(val)
      );

    this.filteredSourceAssignees = this.autoCompleteWith('assignedSourcingRep', val => 
        this.api.getUserAutocomplete(val)
      );

    this.sourceForm.get('opportunityNo').valueChanges.pipe(
      map(val => typeof val === 'string' ? val : val.opportunityNo),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
        this.api.getOpportunityAutocomplete(keyword).subscribe((res: any[]) => {
          this.filteredOpportunities = res;
        });
    });
  }

  create() {
    if (this.sourceForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    // if (!moment(this.quoteValidThrough).isValid()) {
    //   this.msg.show('Please select the date for Quote Valid Through.', 'error');
    //   return;
    // }

    const data = {
      ...this.sourceForm.value,
      id: 0,
      quoteValidThrough: moment(this.quoteValidThrough).format('YYYY-MM-DD')
    };

    this.sourceDetails.setData(data);
    this.dialogRef.close(this.sourceDetails);
  }

  update() {
    if (this.sourceForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    // if (!moment(this.quoteValidThrough).isValid()) {
    //   this.msg.show('Please select the date for Quote Valid Through.', 'error');
    //   return;
    // }

    const data = {
      ...this.sourceForm.value,
      id: this.sourceDetails.id,
      // quoteValidThrough: moment(this.quoteValidThrough).format('YYYY-MM-DD')
    }

    this.sourceDetails.setData(data);
    this.dialogRef.close(this.sourceDetails);
  }

  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.sourceForm.patchValue({
      assignedSalesRepId: assignee.id,
      assignedSalesRep: assignee.name
    });
  }

  selectAssignedSourcing(ev) {
    const assignee = ev.option.value;
    this.sourceForm.patchValue({
        assignedSourcingRepId: assignee.id,
        assignedSourcingRep: assignee.name
    });
  }

  selectAccount(ev) {
    const acc = ev.option.value;
    this.sourceForm.patchValue({
      accountId: acc.id,
      accountName: acc.name
    });
  }

  selectContact(ev) {
    const cc = ev.option.value;
    this.sourceForm.patchValue({
      contactId: cc.id,
      contactName: cc.name
    });
  }

  selectOpportunity(ev) {
    const oo = ev.option.value;
    this.sourceForm.patchValue({
      opportunityId: oo.id,
      opportunityNo: oo.opportunityNo,
      itemName: oo.opportunityName
    });
  }

  private autoCompleteWith(field, func): Observable<any[]> {
    return this.sourceForm.get(field).valueChanges.pipe(
        map(val => displayName(val).trim().toLowerCase()),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(func)
    );
  }

  displayOportunityNo = (val: any) => {
    if (!val) {
        return '';
    } else if (typeof val === 'string') {
        return val;
    }
    return val.opportunityNo;
  }
}

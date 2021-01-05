import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { Commission } from 'app/models/commission';
import { Observable } from 'rxjs';
import { displayName } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-commission-form',
  templateUrl: './commission-form.component.html',
  styleUrls: ['./commission-form.component.scss'],
})
export class CommissionFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  commissionForm: FormGroup;
  commissionDetails: Commission;
  loading: false;

  filteredAssignees: Observable<any[]>;
  displayName = displayName;

  constructor(
    public dialogRef: MatDialogRef<CommissionFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private api: ApiService
  )
  { 
    this.action = data.action;
    if ( this.action === 'edit' )
    {
      this.dialogTitle = 'Edit Commission';
      this.commissionDetails = data.commissionDetails;
      this.commissionDetails.modifiedById = this.auth.getCurrentUser().userId;
      this.commissionDetails.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.commissionDetails.dateModified = new Date();
    }
    else
    {
      this.dialogTitle = 'Create Commission';
      this.commissionDetails = new Commission();
      this.commissionDetails.createdById = this.auth.getCurrentUser().userId;
      this.commissionDetails.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.commissionDetails.dateEntered = new Date();
    }

    this.commissionForm = this.createCommissionForm();
  }

  createCommissionForm()
  {
    return this.formBuilder.group({
      name                : [this.commissionDetails.name, Validators.required],
      description         : [this.commissionDetails.description],
      dateEntered         : [this.commissionDetails.dateEntered],
      dateModified        : [this.commissionDetails.dateModified],
      assignedSalesRep    : [this.commissionDetails.assignedSalesRep,  Validators.required],
      assignedSalesRepId  : [this.commissionDetails.assignedSalesRepId,  Validators.required],
      orderGP             : [this.commissionDetails.orderGP],
      profitTarget        : [this.commissionDetails.profitTarget],
      profitPercent       : [this.commissionDetails.profitPercent],
      netProfitPercent    : [this.commissionDetails.netProfitPercent],
      revenue             : [this.commissionDetails.revenue],
      revenueTarget       : [this.commissionDetails.revenueTarget],
      cap                 : [this.commissionDetails.cap],
      calulationType      : [this.commissionDetails.calulationType],
      paidOnPaid          : [this.commissionDetails.paidOnPaid],
      createdByName       : [this.commissionDetails.createdByName],
      createdById         : [this.commissionDetails.createdById],
      modifiedByName      : [this.commissionDetails.modifiedByName],
      modifiedById        : [this.commissionDetails.modifiedById],
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
  }

  create() {
    if (this.commissionForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const data = {
      ...this.commissionForm.value,
    }
    this.commissionDetails.setData(data);
    this.dialogRef.close(this.commissionDetails);
  }

  update() {
    if (this.commissionForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const data = {
      ...this.commissionForm.value,
      id: this.commissionDetails.id
    }
    this.commissionDetails.setData(data);
    this.dialogRef.close(this.commissionDetails);
  }

  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.commissionForm.patchValue({
      assignedSalesRepId: assignee.id,
      assignedSalesRep: assignee.name
    });
  }

  private autoCompleteWith(field, func): Observable<any[]> {
    return this.commissionForm.get(field).valueChanges.pipe(
        map(val => displayName(val).trim().toLowerCase()),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(func),
    )
  }
}

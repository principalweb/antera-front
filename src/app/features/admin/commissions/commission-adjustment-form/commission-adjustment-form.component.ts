import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { Observable ,  forkJoin ,  timer } from 'rxjs';
import { displayName } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { CommissionListComponent } from '../commission-list/commission-list.component';
import { debounce, take, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CommissionAdjustmentService } from '../commission-adjustment.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-commission-adjustment-form',
  templateUrl: './commission-adjustment-form.component.html',
  styleUrls: ['./commission-adjustment-form.component.scss']
})
export class CommissionAdjustmentFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  form: FormGroup;
  group: any;
  loading: false;
  editCommissions: boolean;
  filteredUsers: any;
  displayName = displayName;
  onDropdownOptionsChangedSubscription: Subscription;
  adjustment_type_list: any;

  constructor(
    public dialogRef: MatDialogRef<CommissionAdjustmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private api: ApiService,
    private service: CommissionAdjustmentService
  ) { 
      this.action = data.action;
      
      if (this.action === 'edit') {
        this.dialogTitle = 'Edit Commission Adjustment';
        this.group = data.commissionAdjustment;
      }
      else {
        this.dialogTitle = 'Create Commission Adjustment';
        this.group = {
          createdById: this.auth.getCurrentUser().userId,
          createdByName: this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName,
          dateEntered: new Date(),
          commissions: [],
        };
      }
     this.form = this.createForm();
     /* this.onDropdownOptionsChangedSubscription =
      this.service.onDropdownOptionsChangedSubscription
        .subscribe((res: any[]) => {
            console.log('res', res);
            this.adjustment_type_list = res;
            if (!res) { return; }
            
          }); */
  }

  ngOnInit(): void {
    this.service.getDropdownOptions({dropdown: [
      'commission_adjustment__type_list',
    ]}).subscribe((res:any)=>{
      console.log("res",res);
      if(res && res[0]) {
        this.adjustment_type_list = res[0].options;
      } else {
        this.adjustment_type_list = [];
      }
     
      console.log("this.adjustment_type_list",this.adjustment_type_list)
    })
    this.form.get('salesRep').valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      ).subscribe(keyword => {
          if (keyword && keyword.length >=3 ) {
              this.service.autocompleteUsers(keyword).subscribe(res => {
                  this.filteredUsers = res;
              });
          }
      });
  }

  createForm() {
    return this.formBuilder.group({
      //name: [this.group.name, Validators.required],
      adjustmentType: [this.group.adjustmentType],
      reason: [this.group.reason],
      adjustmentValue: [this.group.adjustmentValue], 
      salesRep: [this.group.salesRep],
      salesRepId: [this.group.salesRepId],
      applicationDate: [this.group.applicationDate], 
    });
  }

  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.form.get('salesRep').setValue(assignee.name);
    this.form.get('salesRepId').setValue(assignee.id);
  }

  create() {
   /*  console.log("hello create");
    console.log("this.form",this.form)
    return; */
    if (this.form.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    if(this.form && this.form.value && this.form.value.applicationDate) {
      this.form.value.applicationDate = this.form.get('applicationDate').value ? moment(this.form.get('applicationDate').value).format('YYYY-MM-DD') : null
    }
    const data = {
      ...this.form.value,
    }
    this.dialogRef.close(data);
  }

  update() {
    if (this.form.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const data = {
      ...this.form.value,
      id: this.group.id
    };
    this.dialogRef.close(data);
  }

}

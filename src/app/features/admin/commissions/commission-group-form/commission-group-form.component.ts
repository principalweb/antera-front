import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { Commission } from 'app/models/commission';
import { Observable ,  forkJoin ,  timer } from 'rxjs';
import { displayName } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { CommissionListComponent } from '../commission-list/commission-list.component';
import { first, debounce, take, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-commission-group-form',
  templateUrl: './commission-group-form.component.html',
  styleUrls: ['./commission-group-form.component.scss'],
})
export class CommissionGroupFormComponent implements OnInit, AfterViewInit {

  dialogTitle: string;
  action: string;
  form: FormGroup;
  displayedColumns = ['commissionName', 'description', 'dateEntered', 'dateModified'];
  group: any;
  loading: false;

  filteredAssignees: Observable<any[]>;
  displayName = displayName;
  @ViewChild(CommissionListComponent) commissionList: CommissionListComponent;
  editCommissions: boolean;
  listSelectionSubscription: any;

  constructor(
    public dialogRef: MatDialogRef<CommissionGroupFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private api: ApiService
  ) {
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle = 'Edit Commission Group';
      this.group = data.commissionGroup;
      this.group.commissions = data.commissions;
      this.group.modifiedById = this.auth.getCurrentUser().userId;
      this.group.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.group.dateModified = new Date();
    }
    else {
      this.dialogTitle = 'Create Commission Group';
      this.group = {
        createdById: this.auth.getCurrentUser().userId,
        createdByName: this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName,
        dateEntered: new Date(),
        commissions: [],
      };
    }

    this.form = this.createForm();
  }

  createForm() {
    return this.formBuilder.group({
      name: [this.group.name, Validators.required],
      description: [this.group.description],
      assignedSalesRep: [this.group.assignedSalesRep],
      assignedSalesRepId: [this.group.assignedSalesRepId],
      dateEntered: [this.group.dateEntered],
      dateModified: [this.group.dateModified],
      createdByName: [this.group.createdByName],
      createdById: [this.group.createdById],
      modifiedByName: [this.group.modifiedByName],
      modifiedById: [this.group.modifiedById],
    });
  }

  updateCommissions() {
    this.api.getCommissionsForGroup(this.group.id).subscribe((res) => {
      this.group.commissions = res;
    });
  }

  toggleEditCommissions() {
    this.editCommissions = true;

    setTimeout(() => {
      this.listSelectionSubscription = this.commissionList.selection.onSelectionChanged.pipe(
        debounce(() => timer(200)),
        take(1),
      ).subscribe((change) => {
        // Ensure that the current commissions are checked
        this.group.commissions.forEach(commission => {
          let isSelected = this.commissionList.selection.selectedIds.includes(commission.commissionId);
          if (!isSelected) {
            this.commissionList.selection.toggle(commission.commissionId);
          }
        });
      });
    }, 200);
  }

  cancelEditCommissions() {
    this.commissionList.selection.init([]);
    this.editCommissions = false;
  }

  saveEditCommissions() {
    // Append unique ids to a list of ids to create
    let selection = this.commissionList.selection.selectedIds;
    console.log('SAVE', selection);

    const requests = [
      this.api.addCommissionsToGroup(this.group.id, selection)
    ];


    const removed = this.group.commissions
      .map((commission) => commission.commissionId)
      .filter((commissionId) => selection.indexOf(commissionId) === -1);


    if (removed.length > 0) {
      requests.push(this.api.removeCommissionsFromGroup(this.group.id, removed));
    }

    forkJoin(requests).subscribe(result => {
      this.updateCommissions();
      this.editCommissions = false;
    });
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
  }

  create() {
    if (this.form.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
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

  selectCommissionPlans(ev) {

  }

  private autoCompleteWith(field, func): Observable<any[]> {
    return this.form.get(field).valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(func),
    );
  }
}

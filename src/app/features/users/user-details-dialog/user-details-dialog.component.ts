import { Component, Inject, Input, ViewEncapsulation, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import { FormBuilder, FormControl, FormGroup,  Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';

//import { User } from '../users.model';
import { User } from 'app/models';
import { UsersService } from '../users.service';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { Subscription , Observable } from 'rxjs';
import { MessageService } from 'app/core/services/message.service';
import { PermissionService } from 'app/core/services/permission.service';
import { PermissionUserGroup } from 'app/models/permission-user-group';
import { fuseAnimations } from '@fuse/animations';
import { Router} from '@angular/router';

export interface UserStatus{
      id: string;
      value: string;
}

export interface UserType{
      id: string;
      value: string;
}

export interface SalesQuotaRange{
      id: string;
      value: string;
}
@Component({
  selector: 'app-user-details-dialog',
  templateUrl: './user-details-dialog.component.html',
  styleUrls: ['./user-details-dialog.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class UserDetailsDialogComponent implements OnInit, OnDestroy
{
    user: User;
    action: string;
    @Output() onSave = new EventEmitter();

    currentGroups: PermissionUserGroup[];
    otherGroups: PermissionUserGroup[];

    onUserGroupChangedSubscription: Subscription;
    onOtherUserGroupChangedSubscription: Subscription;


    userStatus: UserStatus[] = [
      {id: 'Active', value: 'Active'},
      {id: 'Inactive', value: 'Inactive'}
    ];

    userType: UserType[] = [
      {id: 'CustomerAdmin', value: 'Admin'},
      {id: 'User', value: 'User'}
    ];

    salesQuotaRange: SalesQuotaRange[] = [
      {id: 'Monthly', value: 'Monthly'},
      {id: 'Quarterly', value: 'Quarterly'},
      {id: 'Half-Yearly', value: 'Half-Yearly'},
      {id: 'Yearly', value: 'Yearly'}
    ];


    onCorporateIdentityListChanged: Subscription;

    selectedValue: string;
    dialogTitle: string;
    sidenavClicked = false;
    loading = false;
    isEditable = true;
    subscription: any;
    corpIdentities: any;
    service: any;
    isEditMode: boolean = false;

    userForm: FormGroup;
    dubowForm: FormGroup;
    objectiveForm: FormGroup;
    userFormErrors: any;
    dubowSettings: any;
    userObjectives: any;
    commissionGroups: any[];
    emailFormControl = new FormControl('', [
       Validators.required,
       Validators.email,
    ]);
    
    dubowEnabled: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<UserDetailsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public usersService: UsersService,
        private router: Router,
        private authService: AuthService,
        private msg: MessageService,
        private api: ApiService,
        private permService: PermissionService

    ) {
        this.action = data.action;
        this.service = data.service;

        if ( this.action === 'edit' )
        {
            this.isEditMode = true;
            this.dialogTitle = 'Edit User';
            this.user = new User(data.user);
        }
        else
        {
            this.dialogTitle = 'Add User';
            this.user = new User({});
        }

        this.userForm = this.createForm();
        this.dubowForm = this.formBuilder.group({'contactId': ''});
        this.objectiveForm = this.createObjectiveForm();
        this.api.getAdvanceSystemConfig({module: 'Orders', setting:'dubowEnabled'})
            .subscribe((response:any) => {
                if(response.value && response.value == 1) {
                    this.dubowEnabled = true;
                }
            });
    }

    ngOnInit() {
        this.configureCommissions();
         this.usersService.getCorporateIdentity(); 
         this.onCorporateIdentityListChanged =
             this.usersService.onCorporateIdentityChanged.subscribe(corpIdentity => {
                     this.corpIdentities = corpIdentity;
                 });

        //this.usersService.getCorporateIdentity(); 
       /* this.subscription = this.usersService.onCorporateIdentityChanged.subscribe(response => {
          this.corpIdentity = list;
        });*/

        this.onUserGroupChangedSubscription = this.permService.onUserGroupChanged.subscribe((res: PermissionUserGroup[]) => {
            this.currentGroups = res;
        });

        this.onOtherUserGroupChangedSubscription = this.permService.onOtherUserGroupChanged.subscribe((res: PermissionUserGroup[]) => {
            this.otherGroups = res;
        });

        this.permService.getUserGroups(this.user.id).subscribe();

        this.action = this.data.action;
        if ( this.action === 'edit' )
        {
            this.dialogTitle = 'Edit User';
            this.user = new User(this.data.user);
        }
        else
        {
            this.dialogTitle = 'Add User';
            this.user = new User({});
        }

        this.userForm = this.createForm();
        
        if ( this.action === 'edit' )
        {
            this.api.getUserSetting(this.user.id, 'Dubow')
                .subscribe((response:any) => {
                    this.dubowSettings = response;
                    if(this.dubowSettings && this.dubowSettings.length > 0) {
                        this.dubowForm = this.formBuilder.group({});
                        this.dubowSettings.forEach(ds => {
                            this.dubowForm.addControl(ds.setting, new FormControl(ds.value.replace(/["]+/g, '')));
                        });
                    }
                });
             this.api.getUserSetting(this.user.id, 'Objective')
                .subscribe((response:any) => {
                    this.userObjectives = response;
                    if(this.userObjectives && this.userObjectives.length > 0) {
                        this.userObjectives.forEach(obj => {
                            var sqs = JSON.parse(obj.value);
                            this.objectiveForm = this.formBuilder.group({'salesQuota': sqs.salesQuota, 'salesQuotaRange' : sqs.salesQuotaRange});
                        });
                    }

                });

        }
    }

    ngOnDestroy() {
        //this.usersService.onCorporateIdentityChanged.unsubscribe();
        this.onCorporateIdentityListChanged.unsubscribe();
        this.onUserGroupChangedSubscription.unsubscribe();
        this.onOtherUserGroupChangedSubscription.unsubscribe();
    }

   displayCorpIdentity(id: number){
       let cIdentity = this.corpIdentities.find(corpIdentity => corpIdentity.id == id);
       return (cIdentity && cIdentity.name) || '';
    }

    createObjectiveForm() {
        return this.formBuilder.group({
            salesQuota        : [''],
            salesQuotaRange   : [null, Validators.required],
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
            console.log("res",res)
            this.commissionGroups = res;
            /* if (this.commissionGroups.length > 0) {
                this.commissionEnabled = true;
            }  */
        });
    }


    createForm() {
        const cuser = this.authService.getCurrentUser();
        return this.formBuilder.group({
            userName          : (this.isEditMode ? [{value: this.user.userName, disabled: true},''] : [this.user.userName, Validators.required]),
            password          : (this.isEditMode ? ['', ''] : [this.user.password, Validators.required]),
            confirmPass       : (this.isEditMode ? [this.user.confirmPass, Validators.required] : [this.user.confirmPass, '']),
            firstName         : [this.user.firstName, Validators.required],
            lastName          : [this.user.lastName, Validators.required],
            userEmail         : [this.user.userEmail, [Validators.required, Validators.email]],
            phone             : [this.user.phone, Validators.required],
            userStatus        : [this.user.userStatus, Validators.required],
            userType          : [this.user.userType],
            corpIdentity      : [this.user.corpIdentity],
            commissionGroup   : [this.user.commissionGroup],
            corpIdentityId    : [this.user.corpIdentityId],
            createdBy         : [this.user.createdBy == '' ? cuser.userId : this.user.createdBy],
            dateCreated       : [this.user.dateCreated],
        }, {validator: this.checkIfMatchingPasswords('password', 'confirmPass')});
    }

    checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
        return (group: FormGroup) => {
            let passwordInput = group.controls[passwordKey],
            passwordConfirmationInput = group.controls[passwordConfirmationKey];
            if (passwordInput.value !== passwordConfirmationInput.value) {
                return passwordConfirmationInput.setErrors({notEquivalent: true})
            }
            else {
                return passwordConfirmationInput.setErrors(null);
            }
        }
    }

    create() {
        if (this.userForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        this.loading = true;
        this.service.createUser({
                ...this.userForm.value
            })
            .subscribe(data => {
                if (data.status == 'error') {
                    this.msg.show(data.msg, 'error');
                    this.loading = false;
                    return;
                }
                this.loading = false;
                this.dialogRef.close(data);
                this.usersService.getUsersList();
            }, err => {
                this.loading = false;
                this.dialogRef.close();
            });
    }

    clearCorporateIdentity() {
        this.userForm.patchValue({
            corpIdentity: '',
        });
    }

    update() {
        if (this.userForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        this.loading = true;

        this.service.updateUser({
            ...this.user,
            ...this.userForm.value
        })
        .subscribe((data) => {
            this.loading = false;
            this.dialogRef.close(data);
        }, () => {
            this.dialogRef.close();
        });
    }

    add(groupId) {
        this.permService.addUserToGroup({groupId: groupId, userId: this.user.id}).subscribe(res => {
            this.msg.show('User groups updated!', 'info');
            this.permService.getUserGroups(this.user.id).subscribe();
        });
    }

    remove(groupId) {
        this.permService.delUserFromGroup({groupId: groupId, userId: this.user.id}).subscribe(res => {
            this.msg.show('User groups updated!', 'info');
            this.permService.getUserGroups(this.user.id).subscribe();
        });
    }

    saveDubowSetting() {
        this.api.setUserSetting({
            module: 'Dubow',
            userId: this.user.id,
            setting: 'contactId',
            value: this.dubowForm.value.contactId
        }).subscribe(() => {});

    }

    assignObjective() {
        //this.api.setUserObjectiveSetting({
        this.api.setUserSetting({
            module: 'Objective',
            userId: this.user.id,
            setting: 'Sales Quota',
            name: 'Sales Quota',
            group: 'Sales',
            value: { salesQuota : this.objectiveForm.value.salesQuota, salesQuotaRange : this.objectiveForm.value.salesQuotaRange}
        }).subscribe(() => {
            this.msg.show('User Sales Quota Updated!', 'info');
            this.dialogRef.close();
        });
    }
}

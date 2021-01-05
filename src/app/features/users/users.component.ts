import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription ,  Observable, forkJoin } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';




import { UsersService } from './users.service'
import { MessageService } from 'app/core/services/message.service';
import { FuseUserListComponent } from './user-list/user-list.component';
import { UserDetailsDialogComponent } from './user-details-dialog/user-details-dialog.component';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';


@Component({
  selector: 'fuse-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations

})

export class FuseUsersComponent implements OnInit, OnDestroy 
{
    @ViewChild(FuseUserListComponent) userTableComponent: FuseUserListComponent;

    selection: any[];
    searchInput: FormControl;
    onSelectionSubscription: Subscription;
    dialogRef: MatDialogRef<UserDetailsDialogComponent>;

    loading = false;
    progressBar = false;
    userList = "block";
    pPercentage = 0;
    loaded = () => {
        this.loading = false;
    };
    
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(
        private usersService: UsersService,
        private msg: MessageService,
        public dialog: MatDialog
    ) {
        this.searchInput = new FormControl('');
    }

    ngOnInit() 
    {
        this.onSelectionSubscription =
            this.usersService.onSelectedUsersChanged
                .subscribe(selection => {
                    this.selection = selection;
                });

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
                // Prevent search if filter fields are not empty
                if (this.userTableComponent.userName.value != '' || 
                this.userTableComponent.userName.value != '' ||
                this.userTableComponent.fullName.value != '' ||
                this.userTableComponent.userEmail.value != '' ||
                this.userTableComponent.phone.value != '' ||
                this.userTableComponent.userStatus.value != '' )//||
              //  this.userTableComponent.createdBy.value != '' ||
              //  this.userTableComponent.dateCreated.value != '')
                return;
                // Prevent search if keyword is less than 3
                if (searchText.length < 3 && searchText.length > 0)
                    return;
                this.userTableComponent.loading = true;
                this.usersService.onSearchTextChanged.next(searchText);
            });
    }

    ngOnDestroy()
    {
        this.onSelectionSubscription.unsubscribe();
    }

    clearFilters(){
        this.searchInput.setValue('');
        this.userTableComponent.clearFilters();
    }

    clearSearch(){
        if (this.searchInput.value.length > 0)
            this.searchInput.setValue('');    
    }


    newUser() {
        this.dialogRef = this.dialog.open(UserDetailsDialogComponent, {
            panelClass: 'antera-details-dialog-w60',
            data      : {
                action: 'new',
                service: this.usersService,
            }
        });
    }

    deleteSelectedUsers() {

        if (this.selection.length > 0 )
        {
            this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });
    
            this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this user? You cannot undo this action.';
    
            this.confirmDialogRef.afterClosed().subscribe(result => {
                if ( result )
                {
                    this.loading = true;
                    this.usersService.deleteUsers(this.selection)
                        .subscribe(() => {
                            this.msg.show('Selected users deleted successfully', 'success');
                            forkJoin([this.usersService.getUsersList(), this.usersService.getUserCount()])
                                .subscribe(this.loaded, this.loaded);

                        },() => {
                            this.loading = false;
                            this.msg.show('Error occurred while deleting selected users', 'error');
                        });
                }
                this.confirmDialogRef = null;
            });
        }
        else{
            this.msg.show('Please select users to delete.','error');
        }
    }
    cognitoPushUser = async () => {
        this.progressBar = true;
        this.userList = "none";
        this.pPercentage = 0;
        while (this.pPercentage != 100) {
            let data = await this.usersService.cognitoPushUser();
            if (data.status) {
                this.msg.show('Cognito is not enabled.', 'error');
                break;
            }
            this.pPercentage = Math.floor( (data.process.push / data.process.total) *100);
            console.log(this.pPercentage);
        }
        

        this.userList = "block";
        this.progressBar = false;
            

    }
 }

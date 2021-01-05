import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl,FormBuilder,Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { UsersService } from '../users.service';
import { UserListItem } from 'app/models';
//import { User } from '../users.model';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { UserDetailsDialogComponent } from '../user-details-dialog/user-details-dialog.component';


@Component({
    selector: 'fuse-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations

})

export class FuseUserListComponent implements OnInit, OnDestroy
{
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    dataSource: UsersDataSource;
//    displayedColumns = ['checkbox', 'userName', 'dateCreated', 'createdBy'];
    displayedColumns = ['checkbox', 'userName', 'fullName', 'userEmail', 'phone', 'userStatus'];
    selectedUsers: any[];
    checkboxes: {};
    selectedCount = 0;
    loading = false;

    dialogRef: MatDialogRef<UserDetailsDialogComponent>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    //user: User;
    onUsersChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    routeId = '-1';

    userName = new FormControl('');
    fullName = new FormControl('');
    userEmail = new FormControl('');
    phone = new FormControl('');
    userStatus = new FormControl('');
    dateCreated = new FormControl('');
    createdBy = new FormControl('');


    terms = {
        userName: '',
        fullName: '',
        userEmail: '',
        phone: '',
        userStatus: '',
        dateCreated: '',
        createdBy: ''
    };

  constructor(
        private _formBuilder: FormBuilder,
        private usersService: UsersService,
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog

  ) {
        this.onUsersChangedSubscription =
            this.usersService.onUsersChanged.subscribe(users => {
                this.checkboxes = {};
                users.map(user => {
                    this.checkboxes[user.id] = false;
                });
            });

        this.onSelectionChangedSubscription =
            this.usersService.onSelectedUsersChanged.subscribe(selection => {
                for ( const id in this.checkboxes )
                {
                    if (!this.checkboxes.hasOwnProperty(id)) {
                        continue;
                    }

                    this.checkboxes[id] = selection.includes(id);
                }

                this.selectedUsers = selection;
//                this.selectedCount = selection.length;
            });
  }

  ngOnInit() {
        if(localStorage.getItem('users_userName')) {
            this.userName.setValue(localStorage.getItem('users_userName'));
        }
        if(localStorage.getItem('users_fullName')) {
            this.fullName.setValue(localStorage.getItem('users_fullName'));
        }
        if(localStorage.getItem('users_userEmail')) {
            this.userEmail.setValue(localStorage.getItem('users_userEmail'));
        }
        if(localStorage.getItem('users_phone')) {
            this.phone.setValue(localStorage.getItem('users_phone'));
        }
        if(localStorage.getItem('users_userStatus')) {
            this.userStatus.setValue(localStorage.getItem('users_userStatus'));
        }
        
        this.dataSource = new UsersDataSource(this.usersService);
        this.route.paramMap.subscribe(params => {
            this.routeId = params.get('id');
        });

        this.route.data.subscribe(data => {
            if (data.users[2]) {
                setTimeout(() => {
                    this.showInitialDialog(data.users[2]);
                }, 500);
            }
        })

  }
    showInitialDialog(u) {
        this.dialogRef = this.dialog.open(UserDetailsDialogComponent, {
            panelClass: 'antera-details-dialog-w60',
            minHeight: '57%',
            data      : {
                user: u,
                action : 'edit',
                service: this.usersService
            }
        }); 
        
        this.dialogRef.afterClosed()
            .subscribe((data) => {
                if (data){
                    this.loading = true;
                    this.usersService.getUsersList(this.isFilterRequired())
                    .then(data => {
                        this.loading = false;
                    }).catch(err => {
                        console.log(err);
                        this.loading = false;
                    });
                };
            });
    }

  viewUser(user)
  {
        if (this.routeId === user.id) {
            this.loading = true;
            this.usersService.getUserDetails(user.id)
                .then(u => {
                    this.loading = false;
                    this.dialogRef = this.dialog.open(UserDetailsDialogComponent, {
                        panelClass: 'antera-details-dialog',
                        data      : {
                            user: u,
                            action: 'edit',
                            service: this.usersService,
                        }
                    });

                    this.dialogRef.afterClosed()
                        .subscribe((data) => {
                            if (data){
                                this.loading = true;
                                this.usersService.getUsersList(this.isFilterRequired())
                                .then(data => {
                                    this.loading = false;
                                }).catch(err => {
                                    console.log(err);
                                    this.loading = false;
                                });
                            };
                        });
                });
        } else {
            this.router.navigate(['/users', user.id], {replaceUrl: true});
            //this.usersService.getUsersList()
              //  .then(this.loaded, this.loaded);
        }

  }

  ngOnDestroy() {
        this.onUsersChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
  }

    onSelectedChange(userId)
    {
        this.usersService.toggleSelectedUser(userId);
    }

    sortChange(ev) {
        if (!this.loading) {
            this.loading = true;

            this.usersService.sort = ev;

            this.usersService.getUsersList(this.isFilterRequired())
                .then(data => {
                    this.loading = false;
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                });
        }
    }

    paginate(ev) {
        if (!this.loading) {
            this.loading = true;

            this.usersService.page = ev;
            this.usersService.getUsersList(this.isFilterRequired())
                .then(data => {
                    this.loading = false;
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                });
        }
    }

    filterUsers(field, ev, forceFetch = false) {
        localStorage.setItem("users_"+field,ev.target.value)
        if (!this.loading && (forceFetch || this.terms[field] !== ev.target.value)) {
            this.terms[field] = ev.target.value;
            this.loading = true;

            this.usersService.term = this.terms;
            Promise.all([
                this.usersService.getUserCount(true),
                this.usersService.getUsersList(true)
            ])
            .then(data => {
                this.loading = false;
                this.paginator.firstPage();
            });
        }
    }


    clearFilters() {

        localStorage.setItem("users_userName","");
        localStorage.setItem("users_fullName","");
        localStorage.setItem("users_userEmail","");
        localStorage.setItem("users_phone","");
        localStorage.setItem("users_userStatus","");
        localStorage.setItem("users_userName","");

        if (!this.loading){
            this.userName.setValue('');
            this.fullName.setValue('');
            this.userEmail.setValue('');
            this.phone.setValue('');
            this.userStatus.setValue('');
            this.dateCreated.setValue('');
            this.createdBy.setValue('');

            this.loading = true;
            Promise.all([
                this.usersService.getUserCount(),
                this.usersService.getUsersList()
            ])
            .then(data => {
                this.loading = false;
            }).catch((err) => {
                this.loading = false;
            });
        }
    }

    isFilterRequired()
    {
        if (this.userName.value == '' &&
            this.fullName.value == '' &&
            this.userEmail.value == '' &&
            this.phone.value == '' &&
            this.userStatus.value == '' &&
            this.dateCreated.value == '' &&
            this.createdBy.value == '')
            return false;
        return true;
    }

    toggleAll(ev) {
        if (ev) {
            this.usersService.toggleSelectAll();
        }
    }


}
export class UsersDataSource extends DataSource<any>
{
    total = 0;

    private sub1: Subscription;

    constructor(private usersService: UsersService) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<UserListItem[]>
    {
        this.sub1 = this.usersService.onTotalCountChanged
            .subscribe(count => {
                setTimeout(() => {
                    this.total = count;
                });
            })

        return this.usersService.onUsersChanged;
    }

    disconnect()
    {
        this.sub1.unsubscribe();
    }

}

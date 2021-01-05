import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { AccountsService } from '../accounts.service';
import { AccountDetailsDialogComponent } from '../components/account-details-dialog/account-details-dialog.component';
import { FuseAccountTableComponent } from '../components/account-table/account-table.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';
import { SelectionService } from '../../../core/services/selection.service';
import { MessageService } from 'app/core/services/message.service';
import { Account } from '../../../models';
import { cloneDeep,sortBy } from 'lodash';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ModuleTagDialogComponent } from 'app/shared/module-tag-dialog/module-tag-dialog.component'; 
import { ApiService } from 'app/core/services/api.service';

@Component({
    selector     : 'fuse-account-list',
    templateUrl  : './account-list.component.html',
    styleUrls    : ['./account-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseAccountListComponent implements OnInit
{
    @ViewChild(FuseAccountTableComponent) accountTableComponent: FuseAccountTableComponent;

    searchInput: FormControl;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<AccountDetailsDialogComponent>;
    tagDialogRef: MatDialogRef<ModuleTagDialogComponent>; 
    loading = false;
    viewMyItems = false; 

    onDropdownOptionsForAccountChangedSubscription: Subscription;
    onTimezonesDropdownChangedSubscription: Subscription;
    dropdownOptions = [];
    timezones = [];

    constructor(
        private accountsService: AccountsService,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        public selection: SelectionService,
        private msg: MessageService,
        private api: ApiService,
        private router: Router
    )
    {
        this.searchInput = new FormControl('');
        this.route.queryParamMap.subscribe(paramMap => {
            const searchText = paramMap.get('search');
            this.searchInput.setValue(searchText);
        });
    }

    ngOnInit()
    {
        this.onDropdownOptionsForAccountChangedSubscription =
            this.accountsService.onDropdownOptionsForAccountChanged
                .subscribe((res: any[]) => {
                    if (!res) return;
                    this.dropdownOptions = res;
                });
  
        this.onTimezonesDropdownChangedSubscription = 
            this.accountsService.onTimezonesDropdownChanged
                .subscribe((res: any[]) => {
                    if (!res) return;
                    this.timezones = res;
                });
    }

    ngOnDestroy() {
        this.onDropdownOptionsForAccountChangedSubscription.unsubscribe();
        this.onTimezonesDropdownChangedSubscription.unsubscribe();
    }

    ngAfterViewInit() {
        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        )
        .subscribe(searchText => {

            // Prevent search if filter fields are not empty
            if (this.accountsService.payload.term.accountName != '' ||
                this.accountsService.payload.term.salesRep != '' ||
                this.accountsService.payload.term.phone != '' ||
                this.accountsService.payload.term.dateCreated != '' ||
                this.accountsService.payload.term.billState != '' ||
                this.accountsService.payload.term.partnerType != '')
                return;
            if(searchText) {
            // Prevent search if keyword is less than 3
            if (searchText.length < 3 && searchText.length > 0)
               return;
            } 
            this.accountTableComponent.loading = true;
            this.accountsService.onSearchTextChanged.next(searchText);
        });
    }

    newAccount() {
        this.dialogRef = this.dialog.open(AccountDetailsDialogComponent, {
            panelClass: 'account-details-dialog',
            data      : {
                action: 'new',
                service : this.accountsService,
                dropdowns: [this.dropdownOptions, this.timezones]
            }
        });
    }

    deleteSelectedAccounts()
    {
        if(this.selection.selectedCount === 0)
          return;

        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected accounts?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.loading = true;
                this.accountsService.deleteSelectedAccounts()
                    .then((response: any) => {
                        if (response.status.toLowerCase() === "success") {
                            this.msg.show("The items have been moved to the Recycle Bin. If some accounts were not deleted and permissions are enabled please confirm your access level.", 'success');
                            this.loading = true;
                            Promise.all([
                                this.accountsService.getAccounts(),
                                this.accountsService.getAccountsCount()
                            ]).then((res) => {
                                this.loading = false;
                            }).catch((err) => {
                                this.loading = false;
                            });
                        }
                        else{
                            this.loading = false;
                            this.msg.show(response[0].msg, 'error');
                        }
                    }).catch((err) => {
                        this.loading = false;
                        this.msg.show(err.message, 'error');
                    });
            }
            this.confirmDialogRef = null;
        });
    }

    cloneAccount()
    {
        if (this.selection.selectedCount > 1)
            return;
        this.loading = true;
        this.accountsService.getAccountDetail(this.selection.selectedIds[0])
            .then((details: any) => {
                const account = new Account(details);
                const newAcc = cloneDeep(account);
                newAcc.accountName += '(copy)';
                this.accountsService.addAccount(newAcc)
                .subscribe((response: any) => {
                    this.loading = false;
                    if (response.status === 'success') {
                        const id = response.extra.id;
                        this.router.navigate(['/accounts', id]);
                    }
                },(err) => {
                    this.loading = false;
                    this.msg.show(err.message, 'error');
                });
            }).catch(err => {
                this.loading = false;
                this.msg.show(err.message, 'error');
            });
    }

    clearFilters()
    {
        this.viewMyItems = false;
        this.accountTableComponent.viewMyItems = false;
        this.searchInput.setValue('');
        this.accountTableComponent.clearFilters();
    }

    clearSearch()
    {
        if (this.searchInput.value.length > 0)
            this.searchInput.setValue('');
    }

    changeShowMyItems(ev) {
        this.accountTableComponent.viewMyItems = ev;
        this.accountTableComponent.fetchList();
    }

    emailSelected()
    {
        this.dialog.open(ComingSoonComponent);
    }

    massUpdateSelected()
    {
        this.dialog.open(ComingSoonComponent);
    }

    mergeSelected()
    {
        this.dialog.open(ComingSoonComponent);
    }

    addToTargetListSelected()
    {
        this.dialog.open(ComingSoonComponent);
    }

    generateLetterSelected()
    {
        this.dialog.open(ComingSoonComponent);
    }

    changeLog()
    {
        this.dialog.open(ComingSoonComponent);
    }

    openTagDialog() {
        if (this.selection.selectedCount > 0) {
            
            let payload = {
                "term": {
                    "tagType": "Module Tag",
                    "moduleType": "Accounts"
                  }
              };
            this.api.getTagList(payload).pipe(
                map((res: any) => res && res.TagArray ? sortBy(res.TagArray, 'tag' ) : [])
            ).subscribe((tagList: any[]) => {
                  
                    let dialogRef = this.dialog.open(ModuleTagDialogComponent, {
                        panelClass: 'product-tags-dialog',
                        data: tagList
                    });
                    dialogRef.afterClosed()
                        .subscribe(data => {
                            console.log("data",data);
                            if (data && data.selectedTagList && data.selectedTagList.length > 0){
                                console.log("this.selection",this.selection.selectedIds);
                                let selectedAccountList = this.selection.selectedIds;
                                this.api.addModuleTags({
                                    TagArray: data.selectedTagList,
                                    ModuleArray: selectedAccountList,
                                    module: 'Accounts'
                                })
                                .subscribe((res: any) => {
                                    console.log(res);
                                    if (res){
                                        if (res.msg.length > 0) {
                                            this.msg.show(res.msg, 'error');
                                        } else {
                                            this.msg.show('Successfully tagged to tags selected.', 'success');
                                        }
                                    }
                                    else {
                                        this.msg.show('Unknown Error!', 'error');
                                    }
                                }, (err) => {
                                    this.msg.show(err.message, 'error');
                                });
                            }
                            else {
                                this.msg.show('You have not selected any tag to tag accounts.', 'error');
                            }
                        });

                },(err) => {
                    this.msg.show(err.message, 'error');
                });
        } else {
            this.msg.show('Please select accounts.', 'error');
        }        
    }
}

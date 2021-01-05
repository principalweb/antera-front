import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, Subscription, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { AccountsService } from '../../accounts.service';
import { SelectionService } from 'app/core/services/selection.service';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { delay } from 'rxjs/operators';

@Component({
    selector     : 'fuse-account-table',
    templateUrl  : './account-table.component.html',
    styleUrls    : ['./account-table.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseAccountTableComponent implements OnInit, OnDestroy
{
    @ViewChild('dialogContent') dialogContent: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    accounts: any;
    dataSource: AccountsDataSource | null;
    displayedColumns = ['checkbox', 'accountName', 'partnerType', 'billState', 'phone', 'salesRep', 'dateCreated', 'rating', 'buttons'];
    
    checkboxes: any = {};
    loading = false;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    filterForm: FormGroup;
    viewMyItems = false;

    loaded = () => {
        this.loading = false;
    }

    onAccountsChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    constructor(
        private accountsService: AccountsService,
        private router: Router,
        public dialog: MatDialog,
        public selection: SelectionService,
        public msg: MessageService,
        private fb: FormBuilder,
        private auth: AuthService
    )
    {

    }

    ngOnInit()
    {

        if(localStorage.getItem('accounts_accountName') !== null) {
            this.accountsService.payload.term.accountName = localStorage.getItem('accounts_accountName')
        }
        if(localStorage.getItem('accounts_partnerType') !== null) {
            this.accountsService.payload.term.partnerType = localStorage.getItem('accounts_partnerType')
        }
        if(localStorage.getItem('accounts_billState') !== null) {
            this.accountsService.payload.term.billState = localStorage.getItem('accounts_billState')
        }
        if(localStorage.getItem('accounts_phone') !== null) {
            this.accountsService.payload.term.phone = localStorage.getItem('accounts_phone')
        }
        if(localStorage.getItem('accounts_salesRep') !== null) {
            this.accountsService.payload.term.salesRep = localStorage.getItem('accounts_salesRep')
        }
        
        const formObj = this.accountsService.payload.term;
       
        this.filterForm = this.fb.group(formObj);

        this.dataSource = new AccountsDataSource(this.accountsService);
        this.onAccountsChangedSubscription =
            this.accountsService.onAccountsChanged.subscribe(accounts => {
                this.loading = false;
                this.selection.init(accounts);
            });

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged
                .subscribe(selection => {
                    this.checkboxes = selection;
                });
    }

    ngOnDestroy()
    {
        this.onAccountsChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
    }

    onSelectedChange(leadId)
    {
        this.selection.toggle(leadId);
    }
    
    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    fetchList() {
        this.accountsService.payload.term = this.filterForm.value;
        this.accountsService.payload.myViewItems = this.viewMyItems;
        localStorage.setItem('accounts_accountName',this.filterForm.value.accountName)
        localStorage.setItem('accounts_partnerType',this.filterForm.value.partnerType)
        localStorage.setItem('accounts_billState',this.filterForm.value.billState)
        localStorage.setItem('accounts_phone',this.filterForm.value.phone)
        localStorage.setItem('accounts_salesRep',this.filterForm.value.salesRep)
        if (this.viewMyItems) {
            const user = this.auth.getCurrentUser();
            this.accountsService.payload.term.salesRepId = user.userId;
        } else {
            this.accountsService.payload.term.salesRepId = '';
        }

        this.loading = true;
        Promise.all([
            this.accountsService.getAccounts(),
            this.accountsService.getAccountsCount()
        ])
        .then(data => {
            this.loading = false;
            this.paginator.firstPage();
        });
    }

    deleteAccount(account)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false,
            panelClass: 'remove-account-dialog'
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this account?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.loading = true;
                this.accountsService.deleteAccount(account)
                    .then((res: any) => {
                        if (res.status == 'success') {
                            this.msg.show("This item has been moved to the Recycle Bin", 'success');
                            forkJoin([
                                this.accountsService.getAccounts(),
                                this.accountsService.getAccountsCount()
                            ]).subscribe(() => {
                                this.loading = false;
                            });
                        }
                        else {
                            this.loading = false;
                            this.msg.show(res.msg, 'error');
                        }
                    });
            }
            this.confirmDialogRef = null;
        });

    }

    editAccount(account)
    {
        this.router.navigate(['/accounts', account.id]);
    }

    paginate(ev) {
        this.loading = true;
        this.accountsService.payload.offset = ev.pageIndex;
        this.accountsService.payload.limit = ev.pageSize;
        this.accountsService.getAccounts()
            .then((res) => {
                this.loading = false;
            })
            .catch((err) => {
                this.loading = false;
            });
    }

    sortChange(ev) {
        this.loading = true;
        this.accountsService.payload.order = ev.active;
        this.accountsService.payload.orient = ev.direction;
        this.accountsService.getAccounts()
            .then((res) => {
                this.loading = false;
            })
            .catch((err) => {
                this.loading = false;
            });
    }

    clearFilters()
    {
        localStorage.setItem('accounts_accountName',"")
        localStorage.setItem('accounts_partnerType',"")
        localStorage.setItem('accounts_billState',"")
        localStorage.setItem('accounts_phone',"")
        localStorage.setItem('accounts_salesRep',"")
        this.filterForm.reset();
        this.accountsService.clearFilters();
        this.filterForm.setValue(this.accountsService.payload.term);
        this.fetchList();
    }
}

export class AccountsDataSource extends DataSource<any>
{
    onTotalCountChanged: Subscription;
    total = 0;

    constructor(
        private accountsService: AccountsService
    )
    {
        super();
    }

    connect(): Observable<any[]>
    {
        this.onTotalCountChanged =
            this.accountsService.onTotalCountChanged.pipe(
                delay(100)
            ).subscribe(total => {
                this.total = total;
            });

        return this.accountsService.onAccountsChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
    }
}

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AccountsService } from '../../accounts.service';
import { Account } from '../../../../models';
import { fuseAnimations } from '@fuse/animations';
import { Router} from '@angular/router';
@Component({
    selector: 'app-account-details-dialog',
    templateUrl: './account-details-dialog.component.html',
    styleUrls: ['./account-details-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AccountDetailsDialogComponent {

    action: string;
    dialogTitle: string;
    account: Account;
    sidenavClicked = false;
    loading = false;
    dropdowns = [];
    type = "";

    constructor(
        public dialogRef: MatDialogRef<AccountDetailsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private accountsService: AccountsService,
        private router: Router,
        private msg: MessageService
    ) {
        this.action = data.action;
        this.type = data.type;
        this.dropdowns = data.dropdowns;
        if ( this.action === 'edit' )
        {
            this.dialogTitle = 'Edit Account';
            this.account = data.account;
            console.log(this.account);
        }
        else
        {
            this.dialogTitle = 'New Account';
            this.account = new Account({});
        }
    }

    saveAccount(data) {
        this.loading = true;

        if (this.action === 'edit') {
            this.accountsService
                .updateAccount(data)
                .subscribe(() => {
                    this.loading = false;
                    this.dialogRef.close({
                        action: 'updated',
                        account: data
                    });
                }, (err) => {
                    this.loading = false;
                    this.msg.show('Error occured while updating the account','err');
                });

        } else {
            this.accountsService
                .addAccount(data)
                .subscribe((response:any) => {
                    this.dialogRef.close({account: response});
                    this.loading = false;
                    if(this.type !== "opportunity") {
                        this.router.navigate(['/accounts',response.extra.id]);
                    }
                    
                    
                }, err => {
                    this.loading = false;
                    this.msg.show('Error occured while updating the account','err');
                });
        }
    }

}

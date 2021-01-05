import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';



import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { MailService } from './mail.service';
import { locale as english } from './i18n/en';
import { locale as turkish } from './i18n/tr';
import { fuseAnimations } from '@fuse/animations';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail } from 'app/models/mail';
import { FuseMailListComponent } from './mail-list/mail-list.component';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';


@Component({
    selector   : 'fuse-mail',
    templateUrl: './mail.component.html',
    styleUrls  : ['./mail.component.scss'],
    animations : fuseAnimations
})
export class FuseMailComponent implements OnInit, OnDestroy
{
    searchInput: FormControl;
    currentMail: Mail;

    onMailCredentialsChanged: Subscription;
    onCurrentMailChanged: Subscription;

    credentialsDialogRef: MatDialogRef<MailCredentialsDialogComponent>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    @ViewChild(FuseMailListComponent) mailList: FuseMailListComponent;

    searchText = "";
    defaultEmail = "";
    defaultEmailFolder = "inbox";
    haveCredentials : boolean = false;
    isSearching = false;
    loading = false;
    loaded = () => {
        this.loading = false;
    };
    mailCredentialsList: any[] = [];
    
    constructor(
        private mailService: MailService,
        private fuseTranslationLoader: FuseTranslationLoaderService,
        private dialog: MatDialog,
        private api: ApiService,
        private auth: AuthService,
        private _fuseSidebarService: FuseSidebarService,
    )
    {
        this.searchInput = new FormControl('');
        this.fuseTranslationLoader.loadTranslations(english, turkish);
        this.mailCredentialsList = this.mailService.mailCredentialsList;
        const credentials = this.mailCredentialsList.find(mailCredentials => mailCredentials.isPrimary > 0);
        if (credentials){
            this.defaultEmail = credentials.email;
        };          

    }

    ngOnInit()
    {
        this.onMailCredentialsChanged = 
            this.mailService.onMailCredentialsChanged
                .subscribe(status =>{
                    this.haveCredentials = status;
                    if (status) {
                        this.loading = true;
                        this.mailService.params.from = this.defaultEmail;
			this.mailService.params.folder = this.defaultEmailFolder;
                        this.mailService.getEmails()
                            .subscribe(this.loaded, this.loaded);
                    }
                });
        
        this.onCurrentMailChanged =
            this.mailService.onCurrentMailChanged
                .subscribe(currentMail => {
                    if ( !currentMail )
                    {
                        this.currentMail = null;
                    }
                    else
                    {
                        this.currentMail = currentMail;
                    }
                });
        
    }

    ngOnDestroy()
    {
        this.onMailCredentialsChanged.unsubscribe();
        this.onCurrentMailChanged.unsubscribe();
    }

    addMailCredentials() {

        this.credentialsDialogRef = this.dialog.open(MailCredentialsDialogComponent, {
            panelClass: 'mail-credentials-dialog'
        });

        this.credentialsDialogRef.afterClosed()
            .subscribe((res) => {
                this.credentialsDialogRef = null;
                if (res && res == 'saved') {
                    this.haveCredentials = true;
                    this.mailService.getEmails()
                        .subscribe(this.loaded, this.loaded);
                }
            });
    }

    searchMailsByKeyword(){
        this.mailService.params.search = this.searchText;
        this.loading = true;
        this.mailService.getEmails()
            .subscribe(this.loaded, this.loaded);
    }


    refreshMails(clearCache = 0){
        this.searchText = '';
        this.mailService.resetParams();
        this.mailService.params.from = this.defaultEmail;
        this.mailService.params.clearCache = clearCache;
        this.mailService.params.folder = this.defaultEmailFolder;
        if (this.mailList.paginator.pageIndex == 0)
        {
            this.loading = true;
            this.mailService.getEmails().subscribe(this.loaded, this.loaded);
        }
        else 
        {
            this.mailList.paginator.firstPage();
        }
    }

    deSelectCurrentMail()
    {
        this.mailService.onCurrentMailChanged.next(null);
    }
    getInbox(data){
        this.defaultEmail = data.email;
        this.defaultEmailFolder = data.folder
        this.refreshMails(0);
    }
    removeCredentials()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'This will log you out of email and erase your settings.  Do you want to continue?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                const data = {
                    userId: this.auth.getCurrentUser().userId,
                    module: 'Mail',
                    setting: 'MailCredentials',
                    value: {
                        smtpServer: '',
                        smtpPort: '',
                        smtpUser: '',
                        smtpPass: '',
                        imapServer: '',
                        imapPort: '',
                        imapUser: '',
                        imapPass: ''
                    }
                }
                this.loading = true;
                this.api.saveMailCredentials(data).subscribe((res: any) => {
                    this.loading = false;
                    this.haveCredentials = false;
                });
            }
            this.confirmDialogRef = null;
        });
    }

    /**
     * Toggle sidebar
     *
     * @param name
     */
    toggleSidebar(name): void
    {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }
}
    

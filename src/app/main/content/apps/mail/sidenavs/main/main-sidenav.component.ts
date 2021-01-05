import { Component, OnDestroy, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';

import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { b64toBlob } from 'app/utils/utils';
import { Mail, Attachment } from 'app/models/mail';
import { MessageService } from 'app/core/services/message.service';
import { Subscription } from 'rxjs';
import { MailService } from '../../mail.service';
import { find, each } from 'lodash';

@Component({
    selector   : 'fuse-mail-main-sidenav',
    templateUrl: './main-sidenav.component.html',
    styleUrls  : ['./main-sidenav.component.scss'],
    animations : fuseAnimations
})
export class FuseMailMainSidenavComponent implements OnInit, OnDestroy
{
    @Output() removeCredentials = new EventEmitter();
    @Output() getInbox: EventEmitter<any> = new EventEmitter();

    onMailCredentialsChanged: Subscription;

    folders = [
        {
            icon: 'label',
            title: 'Inbox' 
        }
    ];

    labels: any[];
    accounts: object;
    dialogRef: any;
    isLoading :boolean = false;
    b64toBlob = b64toBlob;
    haveCredentials : boolean = false;
    currentEmail = '';
    currentFolder = 'inbox';
    @Input() mailCredentialsList: any[];
    constructor(
        private auth: AuthService,
        public dialog: MatDialog,
        public api:ApiService,
        private msg: MessageService,
        private mailService: MailService,
    )
    {
        //this.getUserEmailSetting();
    }

    ngOnInit()
    {
        const credentials = this.mailCredentialsList.find(mailCredentials => mailCredentials.isPrimary > 0);
        if (credentials){
            this.currentEmail = credentials.email;
        };          
        this.onMailCredentialsChanged = 
            this.mailService.onMailCredentialsChanged
                .subscribe(status =>{
                    this.haveCredentials = status;
                });
    }

    logout()
    {
        this.removeCredentials.emit();
    }

    getMyInbox(email)
    {   
    
        const data = {
            email: email,
            folder: 'inbox'
        };        
        this.currentEmail = email;
        this.currentFolder = 'inbox';
        this.getInbox.emit(data);
    }

    getMySent(email)
    { 
        const data = {
            email: email,
            folder: 'sent'
        };     
        this.currentEmail = email;
        this.currentFolder = 'sent';
        this.getInbox.emit(data);
    }


    ngOnDestroy()
    {

    }
    
    composeDialog()
    {

       this.dialogRef = this.dialog.open(FuseMailComposeDialogComponent, {
            panelClass: 'compose-mail-dialog',
            data      : {
                action: 'New'
            }
        });

        this.dialogRef.afterClosed()
            .subscribe(res => {

                this.dialogRef = null;
                if ( !res )
                    return;

                const mail: Mail = res.mail;
                const data = new FormData();
                data.append('userId', this.auth.getCurrentUser().userId);
                data.append('to', mail.to.join(','));
                data.append('cc', mail.cc.join(','));
                data.append('bcc', mail.bcc.join(','));
                data.append('from', mail.from);
                data.append('subject', mail.subject);
                data.append('body', mail.body);
                mail.attachments.forEach((attachment: Attachment) => {
                    data.append('attachment[]', new File([attachment.data], attachment.filename));
                });
                this.api.sendMailSMTP(data)
                    .subscribe((res: any) => {
                        if (res.status && res.status == 'success') {
                            this.msg.show('Email sent','success');
                        }
                        else{
                            this.msg.show('Failed to send email','error');
                        }
                    }, (err) => {
                        console.log(err);
                    });
            });
            
    }

  getUserEmailSetting() {
      this.api.getUserEmailSetting(this.auth.getCurrentUser().userId).subscribe((res: any) => {
          this.isLoading = false;
          this.mailCredentialsList = res;
      });
    }
}
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription ,  Observable, forkJoin } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { MailService } from '../mail.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import * as FileSaver from 'file-saver';
import { b64toBlob } from 'app/utils/utils';
import { Mail, Attachment } from 'app/models/mail';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { map } from 'rxjs/operators';


@Component({
    selector   : 'fuse-mail-details',
    templateUrl: './mail-details.component.html',
    styleUrls  : ['./mail-details.component.scss'],
    animations : fuseAnimations
})
export class FuseMailDetailsComponent implements OnInit, OnDestroy
{
    mail: Mail;
    showDetails = false;
    paramas : any;
    onCurrentMailChanged: Subscription;
    dialogRef: any;
    link:any;
    confirmDialogRef: MatDialogRef<FuseMailComposeDialogComponent>;
    b64toBlob = b64toBlob;

    constructor(
        private mailService: MailService,
        public dialog: MatDialog,
        private auth: AuthService,
        private api: ApiService,
        private msg: MessageService
    )
    {
        this.paramas = this.mailService.routeParams.folderHandle; 
    }

    ngOnInit()
    {     
        // Subscribe to update the current mail
        this.onCurrentMailChanged =
            this.mailService.onCurrentMailChanged
                .subscribe(currentMail => {
                    this.mail = currentMail;
                });
    }

    ngOnDestroy()
    {
        this.onCurrentMailChanged.unsubscribe();
    }

    replyMessage(mail){
        const data = {
            from: this.auth.getCurrentUser().email,
            to: [mail.from],
            subject: mail.subject
        }
        this.composeDialog(new Mail(data), 'Reply');
    }

    forwardMessage(mail)
    {
        if (mail.attachments.length > 0) {
            const batch = [];
            const attachments = [];
            mail.attachments.forEach((attachment) => {
                batch.push(this.mailService.getAttachmentData(attachment.filename).pipe(
                    map((res: any) => attachments.push(new Attachment(res.data))))
                );
            });
            forkJoin(batch)
                .subscribe(() => {
                    const data = {
                        from: this.auth.getCurrentUser().email,
                        subject: 'Fwd: ' + mail.subject,
                        body: mail.body,
                        attachments: attachments,
                    }
                    this.composeDialog(new Mail(data), 'Forward');
                });
        }
        else {
            const data = {
                from: this.auth.getCurrentUser().email,
                subject: 'Fwd: ' + mail.subject,
                body: mail.body
            }
            this.composeDialog(new Mail(data), 'Forward');
        }
    }

    download(filename)
    {
        this.mailService.getAttachmentData(filename)
            .subscribe((res: any) => {
                let blob = this.b64toBlob(res.data.data, res.data.mimetype, 0);
                FileSaver.saveAs(blob, res.data.filename);
            });
    }

    composeDialog(mail, action)
    {
       this.dialogRef = this.dialog.open(FuseMailComposeDialogComponent, {
            panelClass: 'compose-mail-dialog',
            data      : {
                action: action,
                mail: mail
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

}

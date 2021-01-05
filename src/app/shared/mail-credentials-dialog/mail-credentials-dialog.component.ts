import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MailCredentials } from '../../models/mail-credentials';
import { AuthService } from 'app/core/services/auth.service';
import { MailService } from 'app/main/content/apps/mail/mail.service';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { find, each } from 'lodash';

@Component({
    selector: 'mail-credentials-dialog',
    templateUrl: './mail-credentials-dialog.component.html',
    styleUrls: ['./mail-credentials-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class MailCredentialsDialogComponent implements OnInit {
    dialogTitle: string;
    mailCredentials: MailCredentials;
    mailCredentialsList: any[] = [];
    credentialsForm: FormGroup;
    displayColumns = ['email', 'primary', 'actions'];
    edit = false;
    currentId = '';
    isPrimary = '0';
    loading = false;
    constructor(
        public dialogRef: MatDialogRef<MailCredentialsDialogComponent>,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private msg: MessageService,
        private api: ApiService,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ) {
        this.mailCredentials = new MailCredentials({});
        this.credentialsForm = this.createForm();
    }

    ngOnInit() {
        this.getUserEmailSetting();
    }

    createForm() {
        const user = this.authService.getCurrentUser();
        return this.formBuilder.group({
            userId: [(this.mailCredentials.userId ? this.mailCredentials.userId : user.userId)],
            smtpUser: [this.mailCredentials.smtpUser, Validators.required],
            smtpPass: [null],
            smtpServer: [this.mailCredentials.smtpServer, Validators.required],
            smtpPort: [this.mailCredentials.smtpPort, Validators.required],
            imapUser: [this.mailCredentials.imapUser, Validators.required],
            imapPass: [null],
            imapServer: [this.mailCredentials.imapServer, Validators.required],
            imapPort: [this.mailCredentials.imapPort, Validators.required],
            isPrimary: [this.isPrimary == '1' ? true : false],
        });
    }

    save(form) {

        if (this.credentialsForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }
        if (this.credentialsForm.get('isPrimary').value) {
            this.isPrimary = '1';
        } else {
            this.isPrimary = '0';
        }
        const data = {
            id: this.currentId,
            isPrimary: this.isPrimary,
            userId: this.authService.getCurrentUser().userId,
            module: 'Mail',
            setting: 'MailCredentials',
            credential: {
                ...this.mailCredentials,
                ...form.getRawValue()
            }
        };

        this.api.setUserEmailSetting(data).subscribe((res: any) => {
            this.dialogRef.close('saved');
            this.msg.show('Mail credentials saved', 'success');
        });
    }
    createMailCredentials() {
        //this.mailCredentials = {...this.mailCredentials, ...res};
        //this.credentialsForm = this.createForm();    
        this.edit = true;
        this.currentId = '';
        if (this.mailCredentialsList.length == 0) {
            this.isPrimary = '0';
        }
        this.mailCredentials = new MailCredentials({});
        this.credentialsForm = this.createForm();
    }
    editMailCredentials(id) {
        this.edit = true;
        this.currentId = id;
        const credentials = find(this.mailCredentialsList, { id: id });
        if (!credentials) return '';
        this.mailCredentials = credentials.credential;
        this.isPrimary = credentials.isPrimary;
        this.credentialsForm = this.createForm();
    }
    getUserEmailSetting() {
        this.loading = true;
        this.api.getUserEmailSetting(this.authService.getCurrentUser().userId).subscribe((res: any) => {
            this.loading = false;
            this.mailCredentialsList = res;
        });
    }
    back() {
        this.edit = false;
    }

    removeUserEmailSetting(id) {
        this.loading = true;
        this.api.removeUserEmailSetting(id).subscribe((res: any) => {
            this.api.getUserEmailSetting(this.authService.getCurrentUser().userId).subscribe((res: any) => {
                this.loading = false;
                this.mailCredentialsList = res;
            });
        });
    }
}

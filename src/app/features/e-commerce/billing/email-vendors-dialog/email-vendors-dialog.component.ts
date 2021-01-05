import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Mail, Attachment } from 'app/models/mail';
import { MailService } from 'app/main/content/apps/mail/mail.service';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-email-vendors-dialog',
  templateUrl: './email-vendors-dialog.component.html',
  styleUrls: ['./email-vendors-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmailVendorsDialogComponent implements OnInit {

  showExtraToFields = false;
  mailForm: FormGroup;
  action: string;
  mail: Mail;
  dialogTitle: string;
  dialogRef2: any;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
      public dialogRef: MatDialogRef<EmailVendorsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      public mailService: MailService,
      private msg: MessageService,
      public dialog: MatDialog,
      private fb: FormBuilder,
      private auth: AuthService,
  )
  {
      this.action = data.action;
      this.mail = data.mail;
      
      if ( this.action === 'Reply' )
      {
          this.dialogTitle = 'Reply Message';
      }
      else if ( this.action === 'Forward' )
      {
          this.dialogTitle = 'Forward Message';
      }
      else if (this.action === 'Send') 
      {
          this.dialogTitle = 'New Message';
      }
      else 
      {
          this.dialogTitle = 'New Message';
          this.mail = new Mail();
      }
      this.mail.from = this.auth.getCurrentUser().email;
      this.mailForm = this.createComposeForm();      

  }

  ngOnInit()
  {

  }

  ngOnDestroy()
  {

  }

  createComposeForm()
  {
      console.log(this.mail);
      return this.fb.group({
          from        : [{value: this.mail.from, disabled: true}, Validators.required],
          to          : [this.mail.to],
          subject     : [this.mail.subject, Validators.required],
          body        : [this.mail.body, Validators.required], 
      })
  }
  
  toggleExtraToFields()
  {
      this.showExtraToFields = !this.showExtraToFields;
  }

  onFileChange(event) 
  {        
      if(event.target.files.length > 0) 
      {
          let file = event.target.files[0];
          let reader = new FileReader();               
          reader.readAsDataURL(file);
          reader.onload=()=>{
              const base64str = (reader.result as string).split('base64,')[1];
              this.mail.attachments.push(new Attachment({
                  filename: file.name,
                  size: file.size,
                  data: base64str,
                  mimetype: file.type
              }));
          }

      }
   }

  deleteAttachment(index)
  {
      this.mail.attachments.splice(index, 1);
  }

  send() {
      if (this.mailForm.invalid) {
          this.msg.show('Please complete the form first', 'error');
          return;
      }

      // if (this.mail.to.length == 0)
      // {
      //     this.msg.show('Please specify at least one recipient.', 'error');
      //     return;
      // }
      const data = {
          ...this.mailForm.getRawValue(),
          attachments: this.mail.attachments
      }
      this.mail.setData(data);
      this.dialogRef.close({action: this.action, mail: this.mail});
  }

  addTo(event: MatChipInputEvent): void {
      const input = event.input;
      const value = event.value;
      if ((value || '').trim()) {
          this.mail.to.push(value);
      }
      if (input) {
        input.value = '';
      }
  }
  
  removeTo(to: string): void {
      const index = this.mail.to.indexOf(to);
      if (index >= 0) {
          this.mail.to.splice(index, 1);
      }
  }
}

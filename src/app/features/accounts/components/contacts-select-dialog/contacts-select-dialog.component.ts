import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contact } from '../../../../models';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-contacts-select-dialog',
  templateUrl: './contacts-select-dialog.component.html',
  styleUrls: ['./contacts-select-dialog.component.scss']
})
export class ContactsSelectDialogComponent implements OnInit {

  selectedContact: Contact;
  loading = false;
  currentAccountId: Account;

  action: string;
  service: any;

  constructor(
    private api: ApiService,
    private dialogRef: MatDialogRef<ContactsSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private msg: MessageService
  ) 
  { 
    this.action = data.action;
    this.service = data.service;
    this.currentAccountId = data.data;
  }

  ngOnInit() { }

  selectContact(c) {
    this.selectedContact = c;
    if (this.action !== 'all')
      this.service.orderContact = c;
  }

  create() {
    if (!this.selectedContact) {
      this.msg.show('Please select a contact', 'error');
      return;
    }

    this.loading = true;

    this.service.getContactDetails(this.selectedContact.id)
      .then(c => {
        this.loading = false;
        this.dialogRef.close(c);
      })
      .catch(err => {
        this.loading = false;
        this.dialogRef.close();
      });
  }

  addContactsToAccount() {
    if (!this.selectedContact) {
      this.msg.show('Please select a contact', 'error');
      return;
    }

    this.loading = true;
    this.api.linkAccountContact(this.currentAccountId, this.selectedContact.id)
      .subscribe((data: any) => {
        this.msg.show(data.msg,'success');      
        this.loading = false;
        this.dialogRef.close();
      }, (err) => {
        this.loading = false;
        this.msg.show('Linking account & contact failed','error');
      })
  }
}

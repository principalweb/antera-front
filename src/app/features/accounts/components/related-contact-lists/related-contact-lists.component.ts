import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs';
import { Contact } from '../../../../models';
import { AccountsService } from '../../accounts.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Account } from '../../../../models';
import { fuseAnimations } from '@fuse/animations';
import { FormControl } from '@angular/forms';
import { ContactFormDialogComponent } from 'app/shared/contact-form/contact-form.component';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { ContactDocumentsDialogComponent } from 'app/shared/contact-documents-dialog/contact-documents-dialog.component';
import { map } from 'rxjs/operators';
import { MessageService } from 'app/core/services/message.service';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail, Attachment } from 'app/models/mail';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';
import { ContactsSelectDialogComponent } from 'app/features/accounts/components/contacts-select-dialog/contacts-select-dialog.component';

@Component({
  selector: 'app-related-contact-lists',
  templateUrl: './related-contact-lists.component.html',
  styleUrls: ['./related-contact-lists.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class RelatedContactListsComponent implements OnInit {
  @Input() checkbox = false;
  @Output() selectRow = new EventEmitter();
  @Output() addContact = new EventEmitter();
  @Output() selectContact = new EventEmitter();
  @Output() removeContact = new EventEmitter();
  @Output() reloadContacts = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dialogRefMailCompose: MatDialogRef<FuseMailComposeDialogComponent>;
  dataSource: ContactsDataSource;
  displayColumns = ['contactName', 'title', 'email', 'phone', 'salesRep', 'documents', 'buttons'];
  loading = false;
  account: Account;
  contactsCount = 0;
  selectedRow = -1;

  contactName = new FormControl('');
  phone = new FormControl('');
  email = new FormControl('');
  salesRep = new FormControl('');
  title = new FormControl('');

  terms = {
    contactName: '',
    phone: '',
    email: '',
    salesRep: '',
    title: ''
  };


  constructor(
    private accountsService: AccountsService,
    private dialog: MatDialog,
    private msg: MessageService,
    private authService: AuthService,
    private api: ApiService,
  ) {
    this.dataSource = new ContactsDataSource(this.accountsService);
    this.account = this.accountsService.currentAccount;
    this.accountsService.onContactsCountChanged
      .subscribe((count: number) => {
        this.contactsCount = count;
        this.loading = false;

        //Reset filter form values because 2 places use this component
        this.contactName.setValue(this.accountsService.contactTerm.contactName);
        this.phone.setValue(this.accountsService.contactTerm.phone);
        this.email.setValue(this.accountsService.contactTerm.email);
        this.salesRep.setValue(this.accountsService.contactTerm.salesRep);
        this.title.setValue(this.accountsService.contactTerm.title);
      });
  }

  ngOnInit() {
    if (this.checkbox) {
      this.displayColumns.splice(5, 1);
      this.displayColumns.splice(0, 0, 'checkbox');
    }
  }

  sortChange(ev) {
    if (this.loading) {
        return;
    }

    // let column = ev.active;
    // switch(ev.active) {
    //   case 'name':
    //     column = 'contactName';
    //     break;
    //   case 'sales':
    //     column = 'salesRep';
    //     break;
    // }

    this.loading = true;
    this.accountsService.getContacts(
      this.account.id,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      ev.active,
      ev.direction
    )
     .then(() => this.loading = false)
     .catch(() => this.loading = false);
  }


  paginate(ev) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    this.accountsService
        .getContacts(
          this.account.id,
          ev.pageIndex,
          ev.pageSize
        )
        .then(() => this.loading = false)
        .catch(() => this.loading = false);
  }

  filterContacts(field, ev, forceFetch = false) {
    if (!this.loading && (forceFetch || this.terms[field] !== ev.target.value)) {
        this.terms[field] = ev.target.value;
        this.loading = true;

        this.accountsService.contactTerm = this.terms;
        Promise.all([
            this.accountsService.getContactsCount(this.account.id),
            this.accountsService.getContacts(this.account.id)
        ])
        .then(data => {
            this.loading = false;
            this.paginator.firstPage();
        });
    }
  }

  onSelectedChange(c) {
    this.selectedRow = c.id;
    this.selectRow.next(c);
  }

  closeDialog() {
    this.dialog.openDialogs[0].close()
  }

  newContact() {
    this.addContact.next();
  }

  selectContacts() {
    this.selectContact.next();
  }

  deleteContact(c)
  {
    this.removeContact.next(c);
  }

  editContactDocuments(event, contact) {
    event.preventDefault();
    event.stopPropagation();
    const dialogRef = this.dialog.open(ContactDocumentsDialogComponent, {
      panelClass: 'app-contact-documents-dialog',
      data: {
        contact: contact,
        account: this.account
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.reloadContacts.emit(true);
        return;
      }
    });
  }

  composeDialog(email, ev){
    ev.stopPropagation();
    const basicMailData = {
       subject: '',
    };
    let mail = new Mail(basicMailData);
    mail.to.push(email);
    this.dialogRefMailCompose = this.dialog.open(FuseMailComposeDialogComponent, {
	panelClass: 'compose-mail-dialog',
	data: {
	    action: 'Send',
	    mail: mail
	}
    });
    this.dialogRefMailCompose.afterClosed()
	.subscribe(res => {
	    if (!res) {
		return;
	    }
            
	    this.dialogRefMailCompose = null;
	    if (!res) {
		return;
	    }
            this.loading = true;
	    mail = res.mail;
	    const data = new FormData();
	    const frmData = new FormData();
	    data.append('userId', this.authService.getCurrentUser().userId);
	    data.append('to', mail.to.join(','));
	    data.append('cc', mail.cc.join(','));
	    data.append('bcc', mail.bcc.join(','));
	    data.append('from', mail.from);
	    data.append('subject', mail.subject);
	    data.append('body', mail.body);

	    mail.attachments.forEach((attachment: Attachment) => {
		data.append('attachment[]', new File([attachment.data], attachment.filename));
		frmData.append('fileUpload[]', new File([attachment.data], attachment.filename));
	    });
	    this.api.sendMailSMTP(data)
		.subscribe(
		    (res: any) => {
		        this.loading = false;
			this.msg.show('Email sent', 'success');
		    },
		    (err: any) => {
			this.loading = false;
			this.msg.show(err.error.msg, 'error');
			console.log(err);
		    }
		);

	});  
  }
  
}

export class ContactsDataSource extends DataSource<Contact>
{
  empty = false;

  constructor(private accountsService: AccountsService) {
    super();
  }

  connect(): Observable<Contact[]> {
    return this.accountsService.onContactsChanged.pipe(
      map(contacts => {
        setTimeout(() => {
          if (contacts.length === 0) {
            this.empty = true;
          } else {
            this.empty = false;
          }
        }, 300);
        return contacts;
      })
    );
  }

  disconnect() { }
}

import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ViewEncapsulation, Inject } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { Contact } from '../../models';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Account } from '../../models';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { FormControl } from '@angular/forms';
import { ContactFormDialogComponent } from 'app/shared/contact-form/contact-form.component';
import { ContactDocumentsDialogComponent } from 'app/shared/contact-documents-dialog/contact-documents-dialog.component';
import { SelectionService } from 'app/core/services/selection.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-accounts-related-contact-list',
  templateUrl: './accounts-related-contact-list.component.html',
  styleUrls: ['./accounts-related-contact-list.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None  
})
export class AccountsRelatedContactListComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: ContactsDataSource;
  displayColumns = ['checkbox', 'contactName', 'email', 'documents'];
  loading = false;
  checkbox = true;
  hideColumn = true;
  account: Account;
  contactsCount = 0;
  selectedRow = -1;
  accountId: string;
  orderId: string;
  tagName: string;
  checkboxes: any = {};
  selectedCount = 0;
  onSelectionChangedSubscription: Subscription;
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
    public accRelatedContactsDialogRef: MatDialogRef<AccountsRelatedContactListComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private api: ApiService,  
    private accountsService: AccountsService,
    public selection: SelectionService,
    private msg: MessageService,
  ) {
    this.selection.reset(false);
    this.accountId = data.accountId;
    this.orderId = data.orderId;
    this.tagName = data.tagName;
    this.dataSource = new ContactsDataSource(this.accountsService);
    this.accountsService
      .getAccountDetail(this.accountId)
      .then((details: any) =>
          Promise.all([
            Promise.resolve(details),
            this.accountsService.getContacts(this.accountId),
            this.accountsService.getContactsCount(this.accountId),
          ])
      ).then((data: any) => {
        console.log(data);
        if (data[0] && data[0].id) {
          this.accountsService.setCurrentAccount(data[0]);
		    //this.dataSource = new ContactsDataSource(this.accountsService);                    
		    console.log(this.dataSource.relContacts);
	            this.selection.init(data[1]);
		    this.onSelectionChangedSubscription =
		    this.selection.onSelectionChanged
			.subscribe(selection => {	 	    
			    this.selectedCount = selection.length;
			    console.log('this.selectedCount '+this.selectedCount);
			});

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
      });    
      /*
        this.api.getAccountDetails(this.accountId)
            .subscribe((res: any) => {
                    this.accountsService.currentAccount = res;
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
                
            });
            */
            
  }

  ngOnInit() {
    //this.selection.init(this.dataSource.relContacts);
  }


  sortChange(ev) {
    if (this.loading) {
        return;
    }

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

  refreshContacts() {
        this.loading = true;
        Promise.all([
            this.accountsService.getContactsCount(this.account.id),
            this.accountsService.getContacts(this.account.id)
        ])
        .then(data => {
            this.loading = false;
            this.paginator.firstPage();
        });
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

  onSelectedChange(id) {
    this.selectedRow = id;
    this.selection.toggle(id);
  }
  tagSelectedUsers(){
  //  console.log(this.selection.selectedIds);
  //  console.log(this.selection.selectedIds.length);
    if(this.selection.selectedIds.length > 0){
	      let payload = {
		'recordIds': this.selection.selectedIds,
		'module': 'Contacts',
		'tagName': this.tagName,
		'mailTo' : 'To',
		'parentRecordId': this.account.id,
		'parentModule': 'Accounts'
	      };    
	      this.api.assignTagNameToBulkRecords(payload)
		    .subscribe((res: any) => {
			this.selection.reset(false);
			this.accRelatedContactsDialogRef.close();
		    });    
    }else{
        this.msg.show('Please select contacts', 'error');
    }
  }
    ngOnDestroy()
    {
        //this.onSelectionChangedSubscription.unsubscribe();
    }

    
    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }
    
  newContact() {

  }

  selectContacts() {

  }

  deleteContact(c)
  {

  }

  editContactDocuments(event, contact) {
    event.preventDefault();
    event.stopPropagation();
    this.loading = true;
    const dialogRef = this.dialog.open(ContactDocumentsDialogComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        contact: contact,
        account: this.account
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.loading = false;
        this.refreshContacts();
        return;
      }

      this.loading = false;
    });



  }
}


export class ContactsDataSource extends DataSource<Contact>
{
  empty = false;
  relContacts: any = {};
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
            this.relContacts = contacts
            this.empty = false;
          }
        }, 300);
        return contacts;
      })
    );
  }

  disconnect() { }
}

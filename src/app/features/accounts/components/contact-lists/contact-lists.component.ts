import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataSource } from '@angular/cdk/table';
import { Observable } from 'rxjs';
import { Contact } from 'app/models';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { ContactsService } from 'app/core/services/contacts.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { ContactsSelectDialogComponent } from 'app/features/accounts/components/contacts-select-dialog/contacts-select-dialog.component';
@Component({
  selector: 'app-account-contact-lists',
  templateUrl: './contact-lists.component.html',
  styleUrls: ['./contact-lists.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ContactListsComponent implements OnInit {
  @Input() title = "Contacts";
  @Input() checkbox = false;
  @Output() selectRow = new EventEmitter();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() accountId: string;
  dataSource: ContactsDataSource;
  displayColumns = ['contactName', 'email', 'phone', 'salesRep'];
  loading = false;
  contactsCount = 0;
  selectedRow = -1;

  contactName = new FormControl('');
  phone = new FormControl('');
  email = new FormControl('');
  salesRep = new FormControl('');

  searchInput = new FormControl('');

  terms = {
    contactName: '',
    phone: '',
    email: '',
    salesRep: '',
  };

  constructor(private contactsService: ContactsService,private dialogRef:MatDialogRef<ContactsSelectDialogComponent>) {
    this.dataSource = new ContactsDataSource(this.contactsService);
    this.contactsService.onTotalCountChanged
      .subscribe((count: number) => {
        this.contactsCount = count;
        this.loading = false;
      });
  }

  ngOnInit() {
    
    this.contactsService.select = this.accountId

    if (this.checkbox) {
      this.displayColumns.splice(0, 0, 'checkbox');
    }

    this.searchInput.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(searchText => {
        // Prevent search if filter fields are not empty
        if (this.contactName.value != '' || 
            this.phone.value != '' ||
            this.email.value != '' ||
            this.salesRep.value != '')
        return;
        // Prevent search if keyword is less than 3
        if (searchText.length < 3 && searchText.length > 0)
            return;
        this.loading = true;
        this.contactsService.onSearchTextChanged.next(searchText);
    });
  }

  sortChange(ev) {
    if (!this.loading) {
      this.loading = true;

      this.contactsService.sort = ev;

      this.contactsService.getContacts()
          .then(data => {
              this.loading = false;
          }).catch(err => {
              console.log(err);
              this.loading = false;
          });
  }
  }


  paginate(ev) {
    if (!this.loading) {
      this.loading = true;

      this.contactsService.page = ev;
      this.contactsService.getContacts()
          .then(data => {
              this.loading = false;
          }).catch(err => {
              console.log(err);
              this.loading = false;
          });
    }
  }

  filterContacts(field, ev, forceFetch = false) {
    if (!this.loading && (forceFetch || this.terms[field] !== ev.target.value)) {
        this.terms[field] = ev.target.value;
        this.loading = true;

        this.contactsService.term = this.terms;
        Promise.all([
            this.contactsService.getContactCount(true),
            this.contactsService.getContacts(true)
        ])
        .then(data => {
            this.loading = false;
            this.paginator.firstPage();
        });
    }
  }

  clearSearch(){
    if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');  
  }

  closeDialog() {
    this.dialogRef.close()
  }


  onSelectedChange(c) {
    if (this.selectedRow !== c.id) {
       this.selectedRow = c.id;
       this.selectRow.next(c);
    } else {
       this.selectedRow = -1;
       this.selectRow.next(null);
    }
  }
}

export class ContactsDataSource extends DataSource<Contact>
{
  empty = false;

  constructor(private contactsService: ContactsService) {
    super();
  }

  connect(): Observable<Contact[]> {
    return this.contactsService.onContactsChanged.pipe(
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

import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';



import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { ContactsService } from 'app/core/services/contacts.service';
import { ContactFormDialogComponent } from 'app/shared/contact-form/contact-form.component';
import { ContactListItem } from 'app/models';
import { ContactUtils } from '../contacts-utils';
import { switchMap } from 'rxjs/operators';

@Component({
    selector     : 'fuse-contacts-contact-list',
    templateUrl  : './contact-list.component.html',
    styleUrls    : ['./contact-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseContactsContactListComponent implements OnInit, OnDestroy
{
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    dataSource: ContactsDataSource;
    displayedColumns = ['checkbox', 'contactName', 'title', 'shipCity', 'shipState', 'leadSource', 'phone', 'email', 'salesRep', 'dateCreated', 'dateModified', 'buttons'];
    selectedContacts: any[];
    checkboxes: {};

    onContactsChangedSubscription: Subscription;
    onSelectedContactsChangedSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<ContactFormDialogComponent>;

    contactName = new FormControl('');
    title = new FormControl('');
    city = new FormControl('');
    state = new FormControl('');
    leadSource = new FormControl('');
    phone = new FormControl('');
    email = new FormControl('');
    salesRep = new FormControl('');
    dateCreated = new FormControl('');
    dateModified = new FormControl('');

    loading = false;
    terms = {
        contactName: '',
        title: '',
        city: '',
        state: '',
        leadSource: '',
        phone: '',
        email: '',
        salesRep: '',
        dateCreated: '',
        dateModified: ''
    };
    routeId = '-1';

    constructor(
        private contactsService: ContactsService,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private router: Router,
    )
    {
        this.onContactsChangedSubscription =
            this.contactsService.onContactsChanged.subscribe(contacts => {
                this.loading = false;
                this.checkboxes = {};
                contacts.map(contact => {
                    this.checkboxes[contact.id] = false;
                });
            });

        this.onSelectedContactsChangedSubscription =
            this.contactsService.onSelectedContactsChanged.subscribe(selectedContacts => {
                for ( const id in this.checkboxes )
                {
                    if ( !this.checkboxes.hasOwnProperty(id) )
                    {
                        continue;
                    }

                    this.checkboxes[id] = selectedContacts.includes(id);
                }
                this.selectedContacts = selectedContacts;
            });
    }

    ngOnInit()
    {
        if(localStorage.getItem('contacts_contactName')) {
            this.contactName.setValue(localStorage.getItem('contacts_contactName'));
        }
        if(localStorage.getItem('contacts_title')) {
            this.title.setValue(localStorage.getItem('contacts_title'));
        }
        if(localStorage.getItem('contacts_city')) {
            this.city.setValue(localStorage.getItem('contacts_city'));
        }
        if(localStorage.getItem('contacts_state')) {
            this.state.setValue(localStorage.getItem('contacts_state'));
        }
        if(localStorage.getItem('contacts_leadSource')) {
            this.leadSource.setValue(localStorage.getItem('contacts_leadSource'));
        }
        if(localStorage.getItem('contacts_phone')) {
            this.phone.setValue(localStorage.getItem('contacts_phone'));
        }
        if(localStorage.getItem('contacts_email')) {
            this.email.setValue(localStorage.getItem('contacts_email'));
        }
        if(localStorage.getItem('contacts_salesRep')) {
            this.salesRep.setValue(localStorage.getItem('contacts_salesRep'));
        }
            
        this.dataSource = new ContactsDataSource(this.contactsService);

        this.route.paramMap.subscribe(params => {
            this.routeId = params.get('id');
        });

        this.route.data.subscribe(data => {
            if (data.contacts[2]) {
                setTimeout(() => {
                    this.showInitialDialog(data.contacts[2]);
                }, 500);
            }
        })
    }

    ngOnDestroy()
    {
        this.onContactsChangedSubscription.unsubscribe();
        this.onSelectedContactsChangedSubscription.unsubscribe();
    }

    showInitialDialog(c) {
        this.dialogRef = this.dialog.open(ContactFormDialogComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                contact: c,
                action : 'edit',
                service: this.contactsService
            }
        }); 
        
        this.dialogRef.afterClosed()
            .subscribe((data) => {
                if (data){
                    this.loading = true;
                    this.contactsService.getContacts(this.isFilterRequired())
                    .then(data => {
                        this.loading = false;
                    }).catch(err => {
                        console.log(err);
                        this.loading = false;
                    });
                };
            });
    }

    editContact(contact)
    {
        this.router.navigate(['/contacts', contact.id]);

        // if (this.routeId === contact.id) {
        //     this.loading = true;
        //     this.contactsService.getContactDetails(contact.id)
        //         .then(c => {
        //             this.loading = false;
        //             this.dialogRef = this.dialog.open(ContactFormDialogComponent, {
        //                 panelClass: 'antera-details-dialog',
        //                 data      : {
        //                     contact: c,
        //                     action : 'edit',
        //                     service: this.contactsService
        //                 }
        //             });

        //             this.dialogRef.afterClosed()
        //                 .subscribe((data) => {
        //                     if (data){
        //                         this.loading = true;
        //                         this.contactsService.getContacts(this.isFilterRequired())
        //                         .then(data => {
        //                             this.loading = false;
        //                         }).catch(err => {
        //                             console.log(err);
        //                             this.loading = false;
        //                         });
        //                     };
        //                 });
        //         });
        // } else {
        //     this.router.navigate(['/contacts', contact.id], {replaceUrl: true});
        // }
    }

    onSelectedChange(contactId)
    {
        this.contactsService.toggleSelectedContact(contactId);
    }

    sortChange(ev) {
        if (!this.loading) {
            this.loading = true;

            this.contactsService.sort = ev;

            this.contactsService.getContacts(this.isFilterRequired())
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
            this.contactsService.getContacts(this.isFilterRequired())
                .then(data => {
                    this.loading = false;
                }).catch(err => {
                    console.log(err);
                    this.loading = false;
                });
        }
    }

    filterContacts(field, ev, forceFetch = false) {
        localStorage.setItem("contacts_"+field,ev.target.value)
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

    clearFilters() {

        localStorage.setItem('contacts_contactName','')
        localStorage.setItem('contacts_title','')
        localStorage.setItem('contacts_city','')
        localStorage.setItem('contacts_state','')
        localStorage.setItem('contacts_email','')
        localStorage.setItem('contacts_phone','')
        localStorage.setItem('contacts_leadSource','')
        localStorage.setItem('contacts_salesRep','')
        if (!this.loading){
            this.contactName.setValue('');
            this.title.setValue('');
            this.city.setValue('');
            this.state.setValue('');
            this.leadSource.setValue('');
            this.phone.setValue('');
            this.salesRep.setValue('');
            this.dateCreated.setValue('');
            this.dateModified.setValue('');

            this.terms = ContactUtils.resetValues(this.terms);
            this.contactsService.term = this.terms;
            if (this.contactsService.term.salesRepId) {
                this.contactsService.term.salesRepId = '';
            }
            this.loading = true;
            Promise.all([
                this.contactsService.getContactCount(),
                this.contactsService.getContacts()
            ])
            .then(data => {
                this.loading = false;
            }).catch((err) => {
                this.loading = false;
            });
        }
    }

    isFilterRequired()
    {
        if (this.contactName.value == '' &&
            this.title.value == '' &&
            this.city.value == '' &&
            this.state.value == '' &&
            this.leadSource.value == '' &&
            this.phone.value == '' &&
            this.salesRep.value == '' &&
            this.dateCreated.value == '' &&
            this.dateModified.value == '')
            return false;
        return true;
    }

    deleteContact(c) {

        const dialogRef = this.dialog.open(FuseConfirmDialogComponent);
        dialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this contact?';
        dialogRef.afterClosed()
            .subscribe(result => {
                if (result) {
                    this.loading = true;
                    this.contactsService.deleteContact(c.id).pipe(
                        switchMap(() => {
                            return this.contactsService.getContacts();
                        }),
                    ).subscribe(() => {
                        this.loading = false;
                    });
                }
            });
    }

    toggleAll(ev) {
        if (ev) {
            this.contactsService.toggleSelectAll();
        }
    }
}

export class ContactsDataSource extends DataSource<any>
{
    total = 0;

    private sub1: Subscription;

    constructor(private contactsService: ContactsService) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<ContactListItem[]>
    {
        this.sub1 = this.contactsService.onTotalCountChanged
            .subscribe(count => {
                setTimeout(() => {
                    this.total = count;
                });
            })

        return this.contactsService.onContactsChanged;
    }

    disconnect()
    {
        this.sub1.unsubscribe();
    }
}

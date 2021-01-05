import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';


import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { ContactsService } from 'app/core/services/contacts.service';
import { MessageService } from 'app/core/services/message.service';
import { ContactFormDialogComponent } from 'app/shared/contact-form/contact-form.component';
import { ComingSoonComponent } from 'app/shared/coming-soon/coming-soon.component';
import { FuseContactsContactListComponent } from './contact-list/contact-list.component';
import { Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ModuleTagDialogComponent } from 'app/shared/module-tag-dialog/module-tag-dialog.component'; 
import { sortBy } from 'lodash';

@Component({
    selector     : 'fuse-contacts',
    templateUrl  : './contacts.component.html',
    styleUrls    : ['./contacts.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseContactsComponent implements OnInit, OnDestroy
{
    @ViewChild(FuseContactsContactListComponent) contactTableComponent: FuseContactsContactListComponent;

    searchInput: FormControl;
    dialogRef: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    loading = false;
    tagDialogRef: MatDialogRef<ModuleTagDialogComponent>; 

    constructor(
        public contactsService: ContactsService,
        public dialog: MatDialog,
        private msg: MessageService,
        private api: ApiService,
        private auth: AuthService
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
    }

    ngAfterViewInit() {

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
                // Prevent search if filter fields are not empty
                if (this.contactTableComponent.contactName.value != '' || 
                this.contactTableComponent.title.value != '' ||
                this.contactTableComponent.city.value != '' ||
                this.contactTableComponent.state.value != '' ||
                this.contactTableComponent.leadSource.value != '' ||
                this.contactTableComponent.phone.value != '' ||
                this.contactTableComponent.email.value != '' ||
                this.contactTableComponent.salesRep.value != '' ||
                this.contactTableComponent.dateCreated.value != '' || 
                this.contactTableComponent.dateModified.value != '')
                return;
                // Prevent search if keyword is less than 3
                if (searchText.length < 3 && searchText.length > 0)
                    return;
                this.contactTableComponent.loading = true;
                this.contactsService.onSearchTextChanged.next(searchText);
            });
    }

    ngOnDestroy()
    {
    }

    clearFilters(){
        this.contactsService.viewMyItems = false;
        this.searchInput.setValue('');
        this.contactTableComponent.clearFilters();
    }

    clearSearch(){
        if (this.searchInput.value.length > 0)
            this.searchInput.setValue('');    
    }

    newContact()
    {
        this.dialogRef = this.dialog.open(ContactFormDialogComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'new',
                service: this.contactsService
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((data) => {
                if (data && data.contact && data.contact.status == 'success'){
                    this.msg.show("We have successfully created new Contact", 'success');
                    this.loading = true;
                    if (data.relatedAccounts && data.relatedAccounts.length > 0){
                        const batch = [];
                        data.relatedAccounts.forEach((account) => {
                            batch.push(this.api.linkAccountContact(account.id, data.contact.extra.id));
                        });
                        forkJoin(...batch)
                            .subscribe(
                                (res) => {
                                    Promise.all([
                                        this.contactsService.getContactCount(this.contactTableComponent.isFilterRequired()),
                                        this.contactsService.getContacts(this.contactTableComponent.isFilterRequired())
                                    ]).then((res) => {
                                        this.loading = false;
                                    }).catch((err) => {
                                        this.loading = false;
                                    });
                                }
                            );
                    }
                    else {
                        Promise.all([
                            this.contactsService.getContactCount(this.contactTableComponent.isFilterRequired()),
                            this.contactsService.getContacts(this.contactTableComponent.isFilterRequired())
                        ]).then((res) => {
                            this.loading = false;
                        }).catch((err) => {
                            this.loading = false;
                        });
                    }
                }
            });
    }

    deleteSelectedContacts()
    {
        if (this.contactsService.selectedContacts.length !== 0)
        {
            this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });
    
            this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected contacts?';
    
            this.confirmDialogRef.afterClosed().subscribe(result => {
                if ( result )
                {
                    this.loading = true;
                    this.contactsService.deleteSelectedContacts()
                        .then((response: any) => {
                            if (response.status.toLowerCase() === 'success') {
                                this.msg.show("The items have been moved to the Recycle Bin. If some accounts were not deleted and permissions are enabled please confirm your access level.", 'success');
                                this.loading = true;
                                this.contactsService.deselectContacts();
                                Promise.all([
                                    this.contactsService.getContactCount(this.contactTableComponent.isFilterRequired()),
                                    this.contactsService.getContacts(this.contactTableComponent.isFilterRequired())
                                ]).then((res) => {
                                    this.loading = false;
                                }).catch((err) => {
                                    this.loading = false;
                                });
                            }
                            else {
                                this.loading = false;
                                this.msg.show(response[0].msg, 'error');
                            }
                        }).catch((err) => {
                            this.loading = false;
                            this.msg.show(err.message, 'error');
                        });
                }
                this.confirmDialogRef = null;
            });
        }
        else {
            this.msg.show('Please select contacts to delete.', 'error');
        }
    }

    changeShowMyItems(ev) {
        this.contactTableComponent.loading = true;
        if (this.contactsService.viewMyItems) {
            this.contactsService.term = {
                ...this.contactsService.term,
                salesRepId: this.auth.getCurrentUser().userId
            };
        }
        else 
        {
            this.contactsService.term = {
                ...this.contactsService.term,
                salesRepId: ''
            };
        }

        forkJoin([
            this.contactsService.getContactCount(true),
            this.contactsService.getContacts(true)
        ]);
    }

    addToTargetListSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    generateLetterSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    emailSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    massUpdateSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    mergeSelected(){
        this.dialog.open(ComingSoonComponent);
    }
    
    openTagDialog() {
        /* console.log("this.contactsService.selectedContacts",this.contactsService.selectedContacts);
        return;  */
         if (this.contactsService.selectedContacts.length > 0) {
            
            let payload = {
                "term": {
                    "tagType": "Module Tag",
                    "moduleType": "Contacts"
                  }
              };
            this.api.getTagList(payload).pipe(
                map((res: any) => res && res.TagArray ? sortBy(res.TagArray, 'tag' ) : [])
            ).subscribe((tagList: any[]) => {
                  
                    let dialogRef = this.dialog.open(ModuleTagDialogComponent, {
                        panelClass: 'contact-tags-dialog',
                        data: tagList
                    });
                    dialogRef.afterClosed()
                        .subscribe(data => {
                            console.log("data",data);
                            if (data && data.selectedTagList && data.selectedTagList.length > 0){
                                
                                let selectedContactList = this.contactsService.selectedContacts;
                                this.api.addModuleTags({
                                    TagArray: data.selectedTagList,
                                    ModuleArray: selectedContactList,
                                    module: 'Contacts'
                                })
                                .subscribe((res: any) => {
                                    console.log(res);
                                    if (res){
                                        if (res.msg.length > 0) {
                                            this.msg.show(res.msg, 'error');
                                        } else {
                                            this.msg.show('Successfully tagged to tags selected.', 'success');
                                        }
                                    }
                                    else {
                                        this.msg.show('Unknown Error!', 'error');
                                    }
                                }, (err) => {
                                    this.msg.show(err.message, 'error');
                                });
                            }
                            else {
                                this.msg.show('You have not selected any tag to tag contacts.', 'error');
                            }
                        });

                },(err) => {
                    this.msg.show(err.message, 'error');
                });
        } else {
            this.msg.show('Please select contacts.', 'error');
        }      
    } 
}

import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { take, switchMap } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { LeadDetails, Account, Contact } from '../../models';
import { ComingSoonComponent } from '../../shared/coming-soon/coming-soon.component';
import { MessageService } from '../../core/services/message.service';
import { LeadsFormComponent } from './leads-form/leads-form.component';
import { FuseLeadsListComponent } from './leads-list/leads-list.component';
import { LeadsService } from './leads.service';
import { AuthService } from 'app/core/services/auth.service';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { OpportunityFormDialogComponent } from '../opportunities/opportunity-form/opportunity-form.component';
import { OpportunitiesService } from 'app/core/services/opportunities.service';
import { ConvertLeadFormComponent } from './convert-lead-form/convert-lead-form.component';
import { of } from 'rxjs';


@Component({
    selector: 'fuse-leads',
    templateUrl: './leads.component.html',
    styleUrls: ['./leads.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FuseLeadsComponent implements OnInit, OnDestroy {
    @ViewChild(FuseLeadsListComponent) leadsList: FuseLeadsListComponent;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: any;
    loading = false;
    // Temporaryly removed since it is not being used in template.
    // searchInput: FormControl;
    // subscriptions: Subscription = new Subscription();

    constructor(
        public leadsService: LeadsService,
        public dialog: MatDialog,
        private msg: MessageService,
        private auth: AuthService,
        public selection: SelectionService,
        private api: ApiService,
        private opportunitiesService: OpportunitiesService,
        private router: Router,
    ) {
        // this.searchInput = new FormControl('');
    }

    ngOnInit() {
        // this.subscriptions.add(
        //     this.searchInput.valueChanges.pipe(
        //         debounceTime(300),
        //         distinctUntilChanged(),
        //     ).subscribe(searchText => {
        //         this.leadsService.search(searchText);
        //     })
        // );
    }

    ngOnDestroy() {
        // this.subscriptions.unsubscribe();
    }

    clearSearch() {
        // if (this.searchInput.value.length > 0)
        //     this.searchInput.setValue('');
    }

    clearFilters() {
        this.leadsService.viewMyItems = false;
        if (this.leadsService.params.term.salesRepId) {
            this.leadsService.params.term.salesRepId = '';
        }
        this.leadsList.clearFilters();
    }

    changeShowMyItems(ev) {
        const userId = this.auth.getCurrentUser().userId;
        this.leadsService.filterViewMyItem(userId)
            .pipe(take(1))
            .subscribe();
    }

    emailSelected() {
        this.dialog.open(ComingSoonComponent);
    }

    massUpdateSelected() {
        this.dialog.open(ComingSoonComponent);
    }

    mergeSelected() {
        this.dialog.open(ComingSoonComponent);
    }

    addToTargetListSelected() {
        this.dialog.open(ComingSoonComponent);
    }

    generateLetterSelected() {
        this.dialog.open(ComingSoonComponent);
    }

    newLead() {
        this.dialog.open(LeadsFormComponent, {
            panelClass: 'antera-details-dialog',
            data: { action: 'new' }
        }).afterClosed().pipe(
            switchMap((lead: LeadDetails) => {
                if (!lead) return of(false);

                return this.leadsService.createLead(lead).pipe(take(1))
            })
        ).subscribe(
            created => created !== false ? this.msg.show('Lead created successfully', 'success') : null,
            err => this.msg.show('Error occurred creating a lead', 'erro')
        );

    }

    deleteSelectedLeads() {
        this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false,
            data: {
                confirmMessage: 'Are you sure you want to delete all selected leads?'
            }
        }).afterClosed().pipe(
            switchMap((confirmed: boolean) => {
                if (!confirmed) return of(false);
                return this.leadsService.deleteSelectedLeads().pipe(take(1))
            })
        ).subscribe(
            deleted =>
                (deleted !== false) ? this.msg.show('Attempted to delete selected leads. If some leads were not deleted and permissions are enabled please confirm your access level.', 'success') : null
            ,
            err => this.msg.show('Error occurred while deleting selected leads', 'error')

        );
    }

    openOpportunityFormDialog(lead: any, contact: any) {
        const account = {
            accountId: lead.accountId,
            accountName: lead.accountName,
            salesRep: lead.salesRep,
            salesRepId: lead.salesRepId,
            contactId: contact.id,
            contactName: `${contact.firstName} ${contact.lastName}`,
            contactEmail: contact.email,
            leadSource: lead.leadSource
        };
        return this.dialog.open(OpportunityFormDialogComponent, {
            panelClass: 'opportunity-form-dialog',
            data: {
                action: 'new',
                service: this.opportunitiesService,
                account: account
            }
        }).afterClosed()
    }

    newOpportunity() {
        if (this.selection.selectedCount !== 1) {
            this.msg.show('Please select 1 lead.', 'error');
            return;
        }
        this.loading = true;
        let lead: any;
        let contact: any;
        this.api.getLeadDetails(this.selection.selectedIds[0]).pipe(
            /// Retrieve if contact is existing for given email
            switchMap(data => {
                lead = new LeadDetails(data);
                contact = {
                    firstName: lead.firstName,
                    lastName: lead.lastName,
                    phone: lead.phoneWork,
                    email: lead.email,
                    salesRep: lead.salesRep,
                    salesRepId: lead.salesRepId,
                    leadSource: lead.leadSource
                }
                return this.api.post('/content/get-contact-list', { term: { email: lead.email } }).pipe(take(1))
            }),
            switchMap((res: any[]) => {
                /// Check if a contact record with given email is existing
                if (res && res.length) {
                    /// If existing, return to next Observable
                    contact = new Contact(res[0]);
                    return of(contact);
                } else {
                    /// Else create new Contact and return to next Observable
                    return this.api.post('/content/create-contact', new Contact(contact)).pipe(take(1))
                }
            }),
            /// Open dialog for new oppurtunity
            switchMap((contact: Contact) => {
                this.loading = false;
                return this.openOpportunityFormDialog(lead, contact)
            }),
            /// Test for the users response to the dialog
            switchMap(response => {
                if (!response) {
                    return of(false);
                }
                return this.opportunitiesService.createOpportunity(response).pipe(take(1))
            })
        ).subscribe(
            (response: any) => {
                if (response !== false) {
                    this.router.navigateByUrl('/opportunities');
                }
            },
            error => console.log(error),
            () => console.log('newOpportunity Completed')
        );
    }

    openConvertLeadFormDialog(data: any) {
        return this.dialog.open(ConvertLeadFormComponent, {
            panelClass: 'antera-details-dialog',
            data: {
                account: new Account(data.extra.accountToCreate),
                contact: new Contact(data.extra.contactToCreate),
                isEmailExist: data.isEmailExist,
            }
        }).afterClosed()
    }

    convertLead() {
        if (this.selection.selectedCount !== 1) {
            this.msg.show('Please select 1 lead.', 'error');
            return;
        }
        this.loading = true;
        this.api.initConvertLead(this.selection.selectedIds[0]).pipe(
            take(1),
            switchMap((res: any) => {
                if (res.status == 'error') {
                    this.msg.show(res.msg, 'error');
                    this.loading = false;
                    return of(false)
                }

                this.msg.show(res.msg, 'success');
                return this.openConvertLeadFormDialog(res);
            }),
            switchMap((res: any) => {
                console.log('DIALOG', res);
                if (!res) {
                    return of(false)
                }
                const data = {
                    ...res,
                    id: this.selection.selectedIds[0]
                }

                return this.api.convertLead(data);
            })
        ).subscribe(
            (res: any) => {
                console.log('SUBSCRIBE', res)
                this.loading = false;
                if (res !== false) {
                    this.msg.show(res.msg, 'success');
                }
            },
            error => {
                this.loading = false;
                console.log(error);
                this.msg.show('Server Connection Error', 'error');
            }
        )
    }

}

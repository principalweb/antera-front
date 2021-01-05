import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { AuthService } from 'app/core/services/auth.service';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { LeadDetails } from '../../../models';
import { ApiService } from '../../../core/services/api.service';
import { SelectionService } from '../../../core/services/selection.service';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { LeadsFormComponent } from '../leads-form/leads-form.component';
import { LeadsService } from '../leads.service';
import { delay, filter } from 'rxjs/operators';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail, Attachment } from 'app/models/mail';
import { forEach, find } from 'lodash';

@Component({
    selector: 'fuse-leads-list',
    templateUrl: './leads-list.component.html',
    styleUrls: ['./leads-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FuseLeadsListComponent implements OnInit, OnDestroy {
    @ViewChild('dialogContent') dialogContent: TemplateRef<any>;

    dataSource: LeadsDataSource;
    displayedColumns = ['checkbox', 'name', 'title', 'referedBy', 'status', 'accountName', 'phoneWork', 'email', 'salesRep', 'dateCreated', 'createdByName', 'buttons'];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<LeadsFormComponent>;
    filterForm: FormGroup;
    checkboxes: any = {};
    leadStatues = [];

    // onLeadsChangedSubscription: Subscription;
    // onSelectionChangedSubscription: Subscription;
    // Create a subscription for disposal
    subscriptions: Subscription = new Subscription();
    dialogRefMailCompose: MatDialogRef<FuseMailComposeDialogComponent>;
    loading = false;
    loaded = () => {
        this.loading = false;
    };

    constructor(
        private leadsService: LeadsService,
        private api: ApiService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        public selection: SelectionService,
        private msg: MessageService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.filterForm = this.fb.group(this.leadsService.params.term);

        this.subscriptions.add(
            this.api.getDropdownOptions({ dropdown: ['lead_status_dom'] }).subscribe((res: any[]) => {
                const leadStatusDropdown = find(res, { name: 'lead_status_dom' });
                this.leadStatues = leadStatusDropdown.options;
            })
        );

        this.subscriptions.add(
            this.route.queryParamMap.pipe(
                filter(q => q.has('id'))
            ).subscribe(q => this.editLead({ id: q.get('id') }))
        );
        let leadEditId = this.route.snapshot.paramMap.get('id');
        if(leadEditId){
           this.editLead({ id: leadEditId });
        }
        
    }

    ngOnInit() {
        this.dataSource = new LeadsDataSource(this.leadsService);
        this.subscriptions.add(
            this.leadsService.onLeadsChanged
                .subscribe(leads => {
                    this.selection.init(leads);
                })
        );
        this.subscriptions.add(
            this.selection.onSelectionChanged
                .subscribe(selection => {
                    this.checkboxes = selection;
                })
        );
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    editLead(lead: any) {
        this.api.getLeadDetails(lead.id)
            .subscribe((data: any) => {
                const lead1 = new LeadDetails(data);
                if (this.dialog.openDialogs.length == 0) {
                    this.dialogRef = this.dialog.open(LeadsFormComponent, {
                        panelClass: 'antera-details-dialog',
                        data: {
                            lead: lead1,
                            action: 'edit',
                        }
                    });

                    this.dialogRef.afterClosed()
                        .subscribe(response => {
                            this.router.navigate(['.'], {
                                relativeTo: this.route, preserveQueryParams: false
                            })
                            if (!response) {
                                return;
                            }

                            const actionType: string = response[0];
                            const lead: LeadDetails = response[1];
                            switch (actionType) {
                                case 'save':
                                    this.loading = true;
                                    this.leadsService.updateLead(lead)
                                        .subscribe(this.loaded, this.loaded);
                                    break;
                                case 'delete':
                                    this.deleteLead(lead);
                                    break;
                            }

                        });
                }
            })
    }

    deleteLead(lead) {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.leadsService.deleteLead(lead.id)
                    .subscribe(this.loaded, this.loaded);
            }
            this.confirmDialogRef = null;
        });

    }

    onSelectedChange(leadId) {
        this.selection.toggle(leadId);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterLeads() {
        this.loading = true;
        this.leadsService.filter(this.filterForm.value)
            .subscribe(this.loaded, this.loaded);
    }

    clearFilters() {
        this.filterForm.reset();
        this.filterLeads();
    }

    sort(se) {
        this.leadsService.sort(se)
            .subscribe(this.loaded, this.loaded);
    }

    paginate(pe) {
        this.leadsService.setPagination(pe)
            .subscribe(this.loaded, this.loaded);
    }

    tooltip(lead) {
        return 'Title: ' + lead.title + '\n' +
            'Description: ' + lead.description;
    }

    composeDialog(email, ev) {
        ev.stopPropagation();
        const basicMailData = {
            subject: '',
        };
        let mail = new Mail(basicMailData);
        mail.to.push(email);
        console.log(mail);
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

export class LeadsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private leadsService: LeadsService,
    ) {
        super();
    }

    connect() {
        this.onCountChangedSubscription =
            this.leadsService.onLeadsCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.leadsService.onLeadsChanged;
    }

    disconnect() {
        this.onCountChangedSubscription.unsubscribe();
    }
}

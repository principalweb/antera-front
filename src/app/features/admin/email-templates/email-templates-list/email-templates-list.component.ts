import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Subscription } from 'rxjs';
import { EmailTemplatesService } from '../email-templates.service';
import { SelectionService } from 'app/core/services/selection.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { DecorationChargeDetails } from 'app/models/decoration-charge';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { EmailTemplateFormComponent } from '../email-templates-form/email-template-form.component';
import { EmailTemplate } from 'app/models/email-template';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-email-templates-list',
  templateUrl: './email-templates-list.component.html',
  styleUrls: ['./email-templates-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class EmailTemplatesListComponent implements OnInit {

    onEmailTemplatesChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    filterForm: FormGroup;
    dataSource: EmailTemplatesDataSource;
    checkboxes: any = {};
    displayedColumns = ['checkbox', 'name', 'description', 'dateEntered', 'buttons'];
    dialogRef: MatDialogRef<EmailTemplateFormComponent>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    loading = false;
    loaded = () => {
        this.loading = false;
    };

    constructor(
        private emailTemplatesService: EmailTemplatesService,
        private api: ApiService,
        private fb: FormBuilder,
        private router: Router,
        public selection: SelectionService,
        public dialog: MatDialog,
    ) 
    {
        this.filterForm = this.fb.group(this.emailTemplatesService.params.term);
    }

    ngOnInit() 
    {
        this.dataSource = new EmailTemplatesDataSource(this.emailTemplatesService);
        this.onEmailTemplatesChangedSubscription =
            this.emailTemplatesService.onListChanged
                .subscribe(emailTemplates => {
                    console.log("Deco Charges ->",emailTemplates);
                    this.selection.init(emailTemplates);
                });

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged
                .subscribe(selection => {
                    this.checkboxes = selection;
                });
    }

    ngOnDestroy()
    {
        this.onEmailTemplatesChangedSubscription.unsubscribe();
        this.onEmailTemplatesChangedSubscription.unsubscribe();
    }

    onSelectedChange(leadId)
    {
        this.selection.toggle(leadId);
    }
    
    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterEmailTemplates() {
        this.loading = true;
        this.emailTemplatesService.filter(this.filterForm.value)
        .subscribe(this.loaded, this.loaded);
    }

    clearFilters() {
        this.filterForm.reset();
        this.filterEmailTemplates();
    }

    sort(se) {
        this.loading = true;
        this.emailTemplatesService.sort(se)
            .subscribe(this.loaded, this.loaded);
    }

    paginate(pe) {
        this.loading = true;
        this.emailTemplatesService.setPagination(pe)
            .subscribe(this.loaded, this.loaded);
    }

    editTemplate(template) {
        this.router.navigate(['admin', 'email-templates', template.id]);
    }

    editTemplateDialog(template) {
        this.api.getEmailTemplate(template.id)
            .subscribe((data: any) => {
                const template = new EmailTemplate(data);
                this.dialogRef = this.dialog.open(EmailTemplateFormComponent, {
                    panelClass: 'antera-details-dialog',
                    data: {
                        template: template,
                        action : 'edit',
                    }
                });

                this.dialogRef.afterClosed()
                    .subscribe(response => {
                        if ( !response )
                        {
                            return;
                        }
        
                        const actionType: string = response[0];
                        const _template: EmailTemplate = response[1];
                        switch ( actionType )
                        {
                            case 'save':
                                this.loading = true;
                                this.emailTemplatesService.update(_template)
                                    .subscribe(this.loaded, this.loaded);
                                break;
                            case 'delete':
                                this.deleteEmailTemplate(template);
                                break;
                        }
                    });
            })
    }

    deleteEmailTemplate(emailTemplate)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.loading = true;
                this.emailTemplatesService.delete(emailTemplate.id)
                    .subscribe(this.loaded, this.loaded);
            }
            this.confirmDialogRef = null;
        });
    }
}

export class EmailTemplatesDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private emailTemplatesService: EmailTemplatesService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.emailTemplatesService.onCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.emailTemplatesService.onListChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}

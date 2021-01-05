import { Component, OnInit, ViewChild } from '@angular/core';
import { EmailTemplateFormComponent } from './email-templates-form/email-template-form.component';
import { EmailTemplate } from 'app/models/email-template';
import { EmailTemplatesService } from './email-templates.service';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { EmailTemplatesListComponent } from './email-templates-list/email-templates-list.component';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'app-email-templates',
  templateUrl: './email-templates.component.html',
  styleUrls: ['./email-templates.component.scss'],
  animations: fuseAnimations
})
export class EmailTemplatesComponent implements OnInit {

  searchInput: FormControl;
  @ViewChild(EmailTemplatesListComponent) listView: EmailTemplatesListComponent;
  dialogRef: any;
  enableNewAndDeleteControl = false;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  mergeTags: string[] = [
    '$orderIdentity',
    '$orderNumber',
    '$contactName',
    '$contactFirstName',
    '$accountName',
    '$contactEmail',
    '$department',
    '$primaryAddress',
    '$primaryCityStatePin',
    '$phoneHome',
    '$phoneMobile',
    '$phoneWork',
    '$phoneFax',
    '$currentDate',
    '$clientCompany',
    '$clientWebsite',
    '$clientPhone',
    '$fromUser',
    '$salesPersonName',
    '$salesPersonEmail',
    '$csrEmail',
    '$contactBillingEmail',
    '$contactNoticesEmail',
    '$contactProofsEmail',
    '$vendorEmail',
    '$vendorArtEmail',
    '$vendorName',
    '$scheduledShippingDate',
    '$shippingMethod',
    '$trackingNumber',
    '$actualShippingDate',
    '$expectedArrivalDate',
    '$multipleShipping',
    '$crmUserName',
    '$crmUserEmail',
    '$crmUserPhone',
    '$proofUrl',
    '$customerProofStatusUpdateURLs',
    '$vendorArtworks',
    '$vendorProofs',
    '$expectedPrintDateOrderForm',
    '$factoryShipDateOrderForm',
    '$shipDateOrderForm',
    '$supplierShipDateOrderForm',
    '$dueDateOrderForm',
    '$inHandDateByOrderForm',
    '$orderDateOrderForm',
    '$proofDueDateOrderForm',
    '$supplierInHandsDateOrderForm',
  ];

  constructor(
    private templateService: EmailTemplatesService,
    public dialog: MatDialog,
    private msg: MessageService,
    private router: Router,
  ) {
    this.searchInput = new FormControl('');
  }

  ngOnInit() {
    this.searchInput.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(searchText => {
      this.templateService.search(searchText);
    });
  }

  clearFilters() {
    this.listView.clearFilters();
  }

  clearSearch() {
    if (this.searchInput.value.length > 0) {
      this.searchInput.setValue('');
    }
  }

  newTemplate() {
    this.router.navigate(['admin', 'email-templates', 'new']);

  }

  newTemplateDialog() {
    this.dialogRef = this.dialog.open(EmailTemplateFormComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        action: 'new'
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((template: EmailTemplate) => {
        if (!template) { return; }

        this.listView.loading = true;
        this.templateService.create(template)
          .subscribe(() => {
            this.msg.show('Template created successfully', 'success');
            this.listView.loading = false;
          }, err => {
            this.msg.show('Error occurred creating a Decoration Fee', 'error');
            this.listView.loading = false;
          });
      });
  }

  deleteSelected() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected templates?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.listView.loading = true;
        this.templateService.deleteSelected()
          .subscribe(() => {
            this.msg.show('Selected templates deleted successfully', 'success');
            this.listView.loading = false;
          }, err => {
            this.msg.show('Error occurred while deleting selected templates', 'error');
            this.listView.loading = false;
          });
      }
      this.confirmDialogRef = null;
    });
  }
}

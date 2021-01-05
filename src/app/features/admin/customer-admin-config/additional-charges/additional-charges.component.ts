import { Component, OnInit, ViewChild } from '@angular/core';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { SelectionService } from 'app/core/services/selection.service';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { AdditionalChargeListComponent } from './additional-charge-list/additional-charge-list.component';
import { AdditionalChargesService } from './additional-charges.service';
import { AdditionalChargeFormComponent } from './additional-charge-form/additional-charge-form.component';
import { AdditionalCharge } from 'app/models/additional-charge-extend';

@Component({
  selector: 'app-additional-charges',
  templateUrl: './additional-charges.component.html',
  styleUrls: ['./additional-charges.component.scss'],
  animations   : fuseAnimations
})
export class AdditionalChargesEditComponent implements OnInit {

  @ViewChild(AdditionalChargeListComponent) decoLocationList: AdditionalChargeListComponent;
  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  loading = false;

  constructor(
    public selection: SelectionService,
    public dialog: MatDialog,
    private msg: MessageService,
    private addChargesService: AdditionalChargesService
  ) 
  { 

  }

  ngOnInit() 
  {
    
  }

  newAdditionalCharge() {
    this.dialogRef = this.dialog.open(AdditionalChargeFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new'
      }
    });

    this.dialogRef.afterClosed()
        .subscribe((addChargeDetail: AdditionalCharge) => {
          if ( !addChargeDetail ) return;

          this.loading = true;
          this.addChargesService.createAdditionalCharge(addChargeDetail)
              .subscribe(() => {
                  this.msg.show('Additional Charge created successfully', 'success');
                  this.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a Additional Charge', 'error');
                  this.loading = false;
              });
      });
  }

  clearFilters() {
    this.decoLocationList.clearFilters();
  }

  deleteSelectedAddCharges() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected charges?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
        if ( result )
        {
            this.loading = true;
            this.addChargesService.deleteAdditionalCharges()
                .subscribe(() => {
                    this.msg.show('Selected Additional Charges deleted successfully', 'success');
                    this.loading = false;
                }, err => {
                    this.msg.show('Error occurred while deleting selected charges', 'error');
                    this.loading = false;
                });
        }
        this.confirmDialogRef = null;
  });
  }
}

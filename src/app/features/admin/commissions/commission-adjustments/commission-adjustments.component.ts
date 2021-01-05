import { Component, OnInit, ViewChild  } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommissionAdjustmentFormComponent } from '../commission-adjustment-form/commission-adjustment-form.component';
import { CommissionAdjustmentService } from '../commission-adjustment.service';
import { CommissionAdjustmentListComponent } from '../commission-adjustment-list/commission-adjustment-list.component';

@Component({
  selector: 'app-commission-adjustments',
  templateUrl: './commission-adjustments.component.html',
  styleUrls: ['./commission-adjustments.component.scss'],
  animations   : fuseAnimations
})
export class CommissionAdjustmentsComponent implements OnInit {
  dialogRef: any;
  @ViewChild(CommissionAdjustmentListComponent) commissionList: CommissionAdjustmentListComponent;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  loading = false;
  displayedColumns = ['checkbox', 'adjustmentType', 'adjustmentValue', 'reason', 'salesRep'];
 
  constructor(
    public dialog: MatDialog,
    private msg: MessageService,
    private service: CommissionAdjustmentService
  ) { }

  ngOnInit(): void {
  
  }

  clearFilters() {
    this.commissionList.clearFilters();
  }

  newCommissionAdjustment() {
    this.dialogRef = this.dialog.open(CommissionAdjustmentFormComponent, {
      panelClass: 'antera-details-dialog',
      height: '80%',
      data      : {
          action: 'new'
      }
    });
    this.dialogRef.afterClosed()
        .subscribe((adjustment: any) => {
          if ( !adjustment ) return;

          this.loading = true;
          this.service.create(adjustment)
              .subscribe((res: any) => {
                  console.log("res",res);
                  this.msg.show('Commission adjustment created successfully', 'success');
                  this.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a commission adjustment', 'error');
                  this.loading = false;
              });
      });
  }

  deleteSelected() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected decoration fees?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
        if ( result )
        {
            this.commissionList.loading = true;
            this.service.deleteSelected()
                .subscribe(() => {
                    this.msg.show('Selected commissions deleted successfully', 'success');
                    this.commissionList.loading = false;
                }, err => {
                    this.msg.show('Error occurred while deleting selected commissions', 'error');
                    this.commissionList.loading = false;
                });
        }
        this.confirmDialogRef = null;
    });
  }

}

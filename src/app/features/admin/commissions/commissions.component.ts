import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormControl } from '@angular/forms';
import { CommissionsService } from './commissions.service';
import { CommissionListComponent } from './commission-list/commission-list.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { CommissionFormComponent } from './commission-form/commission-form.component';
import { Commission } from 'app/models/commission';
import { CommissionGroupFormComponent } from './commission-group-form/commission-group-form.component';
import { CommissionGroupsService } from './commission-groups.service';
import { SelectionService } from 'app/core/services/selection.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-commissions',
  templateUrl: './commissions.component.html',
  styleUrls: ['./commissions.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations,
  providers: [
    SelectionService,
    CommissionsService
  ]
})
export class CommissionsComponent implements OnInit {

  searchInput: FormControl;
  @ViewChild(CommissionListComponent) commissionList: CommissionListComponent;
  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  loading = false;

  constructor(
    private commissionsService: CommissionsService,
    private commissionGroupsService: CommissionGroupsService,
    public dialog: MatDialog,
    private msg: MessageService
  ) {
    this.searchInput = new FormControl('');
  }

  ngOnInit() {
    this.searchInput.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(searchText => {
        this.commissionsService.search(searchText);
    });
  }

  clearFilters() {
    this.commissionList.clearFilters();
  }

  clearSearch(){
    if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');
  }

  newCommission() {
    this.dialogRef = this.dialog.open(CommissionFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new'
      }
    });

    this.dialogRef.afterClosed()
        .subscribe((commissionDetails: Commission) => {
          if ( !commissionDetails ) return;

          this.loading = true;
          this.commissionsService.createCommission(commissionDetails)
              .subscribe(() => {
                  this.msg.show('Commission created successfully', 'success');
                  this.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a Commission', 'error');
                  this.loading = false;
              });
      });
  }
  newCommissionGroup() {
    this.dialogRef = this.dialog.open(CommissionGroupFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new'
      }
    });

    this.dialogRef.afterClosed()
        .subscribe((group: any) => {
          if ( !group ) return;

          this.loading = true;
          this.commissionGroupsService.create(group)
              .subscribe(() => {
                  this.msg.show('Commission group created successfully', 'success');
                  this.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a commission group', 'error');
                  this.loading = false;
              });
      });
  }
  deleteSelectedCommissions() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected decoration fees?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
        if ( result )
        {
            this.commissionList.loading = true;
            this.commissionsService.deleteSelectedCommissions()
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

  cloneSelectedCommissions() {
    this.commissionsService.cloneSelectedCommissions()
                .subscribe(() => {
                    this.msg.show('Selected commissions cloned successfully', 'success');
                    this.commissionList.loading = false;
                }, err => {
                    this.msg.show('Error occurred while clone selected commissions', 'error');
                    this.commissionList.loading = false;
                });
  }
}

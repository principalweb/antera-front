import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CommissionListComponent } from '../commission-list/commission-list.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { CommissionsService } from '../commissions.service';
import { CommissionGroupsService } from '../commission-groups.service';
import { MessageService } from 'app/core/services/message.service';
import { CommissionFormComponent } from '../commission-form/commission-form.component';
import { Commission } from 'app/models/commission';
import { CommissionGroupFormComponent } from '../commission-group-form/commission-group-form.component';
import { CommissionGroupListComponent } from '../commission-group-list/commission-group-list.component';
import { fuseAnimations } from '@fuse/animations';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-commission-groups',
  templateUrl: './commission-groups.component.html',
  styleUrls: ['./commission-groups.component.scss'],
  animations   : fuseAnimations
})
export class CommissionGroupsComponent implements OnInit {
  searchInput: FormControl;
  @ViewChild(CommissionGroupListComponent) commissionList: CommissionGroupListComponent;
  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  loading = false;

  constructor(
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
        this.commissionGroupsService.search(searchText);
    });
  }

  clearFilters() {
    this.commissionList.clearFilters();
  }

  clearSearch(){
    if (this.searchInput.value.length > 0) {
      this.searchInput.setValue('');
    }
  }

  newCommissionGroup() {
    this.dialogRef = this.dialog.open(CommissionGroupFormComponent, {
      panelClass: 'antera-details-dialog',
      height: '80%',
      data      : {
          action: 'new'
      }
    });
    this.dialogRef.afterClosed()
        .subscribe((group: any) => {
          if ( !group ) return;

          this.loading = true;
          this.commissionGroupsService.create(group)
              .subscribe((res: any) => {
                  this.msg.show('Commission group created successfully', 'success');
                  this.loading = false;
                  this.commissionList.edit(res.extra.id);
              }, err => {
                  this.msg.show('Error occurred creating a commission group', 'error');
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
            this.commissionGroupsService.deleteSelected()
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
  cloneSelected() {
    this.commissionList.loading = true;
    this.commissionGroupsService.cloneSelected()
      .subscribe(() => {
          this.msg.show('Selected commissions cloned successfully', 'success');
          this.commissionList.loading = false;
      }, err => {
          this.msg.show('Error occurred while clone selected commissions', 'error');
          this.commissionList.loading = false;
      });
  }
}

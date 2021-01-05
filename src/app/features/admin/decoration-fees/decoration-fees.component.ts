import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormControl } from '@angular/forms';
import { DecorationFeesService } from './decoration-fees.service';
import { DecorationFeesListComponent } from './decoration-fees-list/decoration-fees-list.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { DecorationFeeFormComponent } from './decoration-fee-form/decoration-fee-form.component';
import { DecorationChargeDetails } from 'app/models/decoration-charge';
import { MessageService } from 'app/core/services/message.service';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-decoration-fees',
  templateUrl: './decoration-fees.component.html',
  styleUrls: ['./decoration-fees.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class DecorationFeesComponent implements OnInit {

  searchInput: FormControl;
  @ViewChild(DecorationFeesListComponent) decoChargesList: DecorationFeesListComponent;
  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  constructor( 
    private decoChargesService: DecorationFeesService,
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
        this.decoChargesService.search(searchText);
    });
  }

  clearFilters() {
    this.decoChargesList.clearFilters();
  }

  clearSearch(){
    if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');
  }

  newDecoCharge() {
    this.dialogRef = this.dialog.open(DecorationFeeFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new'
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((decoCharge: DecorationChargeDetails) => {
          if ( !decoCharge ) return;

          this.decoChargesList.loading = true;
          this.decoChargesService.createDecoCharge(decoCharge)
              .subscribe(() => {
                  this.msg.show('Decoration Fee created successfully', 'success');
                  this.decoChargesList.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a Decoration Fee', 'error');
                  this.decoChargesList.loading = false;
              });
      });
  }

  deleteSelectedFees() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected decoration fees?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
        if ( result )
        {
            this.decoChargesList.loading = true;
            this.decoChargesService.deleteSelectedDecoCharges()
                .subscribe(() => {
                    this.msg.show('Selected decoration fees deleted successfully', 'success');
                    this.decoChargesList.loading = false;
                }, err => {
                    this.msg.show('Error occurred while deleting selected decoration fees', 'error');
                    this.decoChargesList.loading = false;
                });
        }
        this.confirmDialogRef = null;
    });
  }

  deleteSelectedCharges() {

  }
}

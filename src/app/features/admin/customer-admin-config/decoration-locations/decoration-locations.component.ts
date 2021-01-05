import { Component, OnInit, ViewChild } from '@angular/core';
import { DecorationLocationListComponent } from './decoration-location-list/decoration-location-list.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { SelectionService } from 'app/core/services/selection.service';
import { MessageService } from 'app/core/services/message.service';
import { DecorationLocationsService } from './decoration-locations.service';
import { DecorationLocationFormComponent } from './decoration-location-form/decoration-location-form.component';
import { DecorationLocationDetails } from 'app/models/decoration-location';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-decoration-locations',
  templateUrl: './decoration-locations.component.html',
  styleUrls: ['./decoration-locations.component.scss'],
  animations   : fuseAnimations
})
export class DecorationLocationsComponent implements OnInit {

  @ViewChild(DecorationLocationListComponent, {static: false}) decoLocationList: DecorationLocationListComponent;
  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  loading = false;

  constructor(
    public selection: SelectionService,
    public dialog: MatDialog,
    private msg: MessageService,
    private decoLocationsService: DecorationLocationsService
  ) 
  { 

  }

  ngOnInit() 
  {
    
  }

  newDecoLocation() {
    this.dialogRef = this.dialog.open(DecorationLocationFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new'
      }
    });

    this.dialogRef.afterClosed()
        .subscribe((decoLocationDetails: DecorationLocationDetails) => {
          if ( !decoLocationDetails ) return;

          this.loading = true;
          this.decoLocationsService.createDecorationLocation(decoLocationDetails)
              .subscribe(() => {
                  this.msg.show('Decoration Location created successfully', 'success');
                  this.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a Decoration Location', 'error');
                  this.loading = false;
              });
      });
  }

  clearFilters() {
    this.decoLocationList.clearFilters();
  }

  deleteSelectedDecoLocations() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected locations?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
        if ( result )
        {
            this.loading = true;
            this.decoLocationsService.deleteDecorationLocations()
                .subscribe(() => {
                    this.msg.show('Selected locations deleted successfully', 'success');
                    this.loading = false;
                }, err => {
                    this.msg.show('Error occurred while deleting selected locations', 'error');
                    this.loading = false;
                });
        }
        this.confirmDialogRef = null;
  });
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UomGroupsFormComponent } from './uom-groups-form/uom-groups-form.component';
import { UomGroupsDetails } from 'app/models/uom-groups';
import { UomGroupsListComponent } from './uom-groups-list/uom-groups-list.component';
import { UomGroupsService } from './uom-groups.service';
import { MessageService } from 'app/core/services/message.service';


@Component({
  selector: 'app-uom-groups',
  templateUrl: './uom-groups.component.html',
  styleUrls: ['./uom-groups.component.css']
})
export class UomGroupsComponent implements OnInit {

  dialogRef: any;
  @ViewChild(UomGroupsListComponent) uomGroupsList: UomGroupsListComponent;

  constructor(
    public dialog: MatDialog,
    private uomGroupsService: UomGroupsService,
    private msg: MessageService
  ) 
  { 

  }

  ngOnInit() 
  {
    
  }

  newUomGroups() {
    this.dialogRef = this.dialog.open(UomGroupsFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new'
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((uomGroupsDetails: UomGroupsDetails) => {
          if ( !uomGroupsDetails ) return;

          this.uomGroupsList.loading = true;
          this.uomGroupsService.createUomGroupsDetails(uomGroupsDetails)
              .subscribe(() => {
                  this.msg.show('Uom Group created successfully', 'success');
                  this.uomGroupsList.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a Uom Group ', 'error');
                  this.uomGroupsList.loading = false;
              });
      });
  }

  clearFilters() {
    
  }

}

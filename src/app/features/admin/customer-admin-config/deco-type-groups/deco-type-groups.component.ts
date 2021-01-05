import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DecoTypeGroupsFormComponent } from './deco-type-groups-form/deco-type-groups-form.component';
import { DecoTypeGroupsDetails } from 'app/models/deco-type-groups';
import { DecoTypeGroupsListComponent } from './deco-type-groups-list/deco-type-groups-list.component';
import { DecoTypeGroupsService } from './deco-type-groups.service';
import { MessageService } from 'app/core/services/message.service';


@Component({
  selector: 'app-deco-type-groups',
  templateUrl: './deco-type-groups.component.html',
  styleUrls: ['./deco-type-groups.component.css']
})
export class DecoTypeGroupsComponent implements OnInit {

  dialogRef: any;
  @ViewChild(DecoTypeGroupsListComponent) decoTypeGroupsList: DecoTypeGroupsListComponent;

  constructor(
    public dialog: MatDialog,
    private decoTypeGroupsService: DecoTypeGroupsService,
    private msg: MessageService,
  ) 
  { 

  }

  ngOnInit() 
  {
  }

  newDecoTypeGroups() {
    this.dialogRef = this.dialog.open(DecoTypeGroupsFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new'
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((decoTypeGroupsDetails: DecoTypeGroupsDetails) => {
          if ( !decoTypeGroupsDetails ) return;

          this.decoTypeGroupsList.loading = true;
          this.decoTypeGroupsService.createDecoTypeGroupsDetails(decoTypeGroupsDetails)
              .subscribe(() => {
                  this.msg.show('Deco Type Group created successfully', 'success');
                  this.decoTypeGroupsList.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a Deco Type Group ', 'error');
                  this.decoTypeGroupsList.loading = false;
              });
      });
  }

  clearFilters() {
    
  }

}

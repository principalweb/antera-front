import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UomFormComponent } from './uom-form/uom-form.component';
import { UomDetails } from 'app/models/uom';
import { UomListComponent } from './uom-list/uom-list.component';
import { UomService } from './uom.service';
import { MessageService } from 'app/core/services/message.service';


@Component({
  selector: 'app-uom',
  templateUrl: './uom.component.html',
  styleUrls: ['./uom.component.css']
})
export class UomComponent implements OnInit {

  dialogRef: any;
  @ViewChild(UomListComponent) uomList: UomListComponent;

  constructor(
    public dialog: MatDialog,
    private uomService: UomService,
    private msg: MessageService
  ) 
  { 

  }

  ngOnInit() 
  {
    
  }

  newUom() {
    this.dialogRef = this.dialog.open(UomFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new'
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((uomDetails: UomDetails) => {
          if ( !uomDetails ) return;

          this.uomList.loading = true;
          this.uomService.createUomDetails(uomDetails)
              .subscribe(() => {
                  this.msg.show('Uom created successfully', 'success');
                  this.uomList.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a Uom', 'error');
                  this.uomList.loading = false;
              });
      });
  }

  clearFilters() {
    
  }

}

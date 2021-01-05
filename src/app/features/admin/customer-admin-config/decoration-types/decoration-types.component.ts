import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DecorationTypeFormComponent } from './decoration-type-form/decoration-type-form.component';
import { DecorationTypeDetails } from 'app/models/decoration-type';
import { DecorationTypeListComponent } from './decoration-type-list/decoration-type-list.component';
import { DecorationTypesService } from './decoration-types.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-decoration-types',
  templateUrl: './decoration-types.component.html',
  styleUrls: ['./decoration-types.component.scss']
})
export class DecorationTypesComponent implements OnInit {

  dialogRef: any;
  @ViewChild(DecorationTypeListComponent) decoTypeList: DecorationTypeListComponent;

  constructor(
    public dialog: MatDialog,
    private decoTypesService: DecorationTypesService,
    private msg: MessageService
  ) 
  { 

  }

  ngOnInit() 
  {
    
  }

  newDecoType() {
    this.dialogRef = this.dialog.open(DecorationTypeFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new'
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((decoTypeDetails: DecorationTypeDetails) => {
          if ( !decoTypeDetails ) return;

          this.decoTypeList.loading = true;
          this.decoTypesService.createDecorationTypeDetails(decoTypeDetails)
              .subscribe(() => {
                  this.msg.show('Decoration Type created successfully', 'success');
                  this.decoTypeList.loading = false;
              }, err => {
                  this.msg.show('Error occurred creating a Decoration Type', 'error');
                  this.decoTypeList.loading = false;
              });
      });
  }

  clearFilters() {
    
  }

}

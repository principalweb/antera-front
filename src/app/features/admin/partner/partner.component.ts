import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { fuseAnimations } from '@fuse/animations';

import { PartnerService } from 'app/core/services/partner.service';
import { PartnerListComponent } from './partner-list/partner-list.component';
import { PartnerFormComponent } from './partner-form/partner-form.component';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.scss']
})
export class PartnerComponent implements OnInit {
  @ViewChild(PartnerListComponent) dataList: PartnerListComponent;
  dialogRef: MatDialogRef<PartnerFormComponent>;

  constructor(
              private dataService: PartnerService,
              public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  createData() {
        this.dialogRef = this.dialog.open(PartnerFormComponent, {
            panelClass: 'app-partner-form',
            data: "" 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.dataList.loadData();
            });
  }

  deleteSelectedData() {
    this.dataList.deleteSelected();
  }

  clearFilters() {
    this.dataList.clearFilters();
  }

}

import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { fuseAnimations } from '@fuse/animations';

import { InventoryService } from 'app/core/services/inventory.service';
import { SiteListComponent } from './site-list/site-list.component';
import { SiteFormComponent } from './site-form/site-form.component';


@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit {
  @ViewChild(SiteListComponent) dataList: SiteListComponent;
  dialogRef: MatDialogRef<SiteFormComponent>;

  constructor(
              private dataService: InventoryService,
              public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  createData() {
         this.dialogRef = this.dialog.open(SiteFormComponent, {
            panelClass: 'app-site-form',
            data: {title: 'Add Site'}
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

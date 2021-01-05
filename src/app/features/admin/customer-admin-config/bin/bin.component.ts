import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { fuseAnimations } from '@fuse/animations';

import { InventoryService } from 'app/core/services/inventory.service';
import { BinListComponent } from './bin-list/bin-list.component';
import { BinFormComponent } from './bin-form/bin-form.component';

@Component({
  selector: 'app-bin',
  templateUrl: './bin.component.html',
  styleUrls: ['./bin.component.scss']
})
export class BinComponent implements OnInit {
  @ViewChild(BinListComponent) dataList: BinListComponent;
  dialogRef: MatDialogRef<BinFormComponent>;
  dataId: string = '0';

  constructor(
              private dataService: InventoryService,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.dataId = '0';
      if(this.data.id) {
          this.dataId = this.data.id;
      }
  }

  ngOnInit() {
  }

  createData() {
        this.dialogRef = this.dialog.open(BinFormComponent, {
            panelClass: 'app-bin-form',
            data: {siteId:this.dataId}
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

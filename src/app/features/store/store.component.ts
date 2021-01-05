import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { StoreService } from 'app/core/services/store.service';
import { StoreListComponent } from './store-list/store-list.component';
import { StoreFormComponent } from './store-form/store-form.component';

import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
  animations   : fuseAnimations
})
export class StoreComponent implements OnInit {
  @ViewChild(StoreListComponent) storeList: StoreListComponent;
  dialogRef: MatDialogRef<StoreFormComponent>;

  constructor(
              private storeService: StoreService,
              public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  newWebstore() {
        this.dialogRef = this.dialog.open(StoreFormComponent, {
            panelClass: 'app-store-form',
            data: "" 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.storeList.loadData();
            });
  }

  deleteSelectedWebstores() {
    this.storeList.deleteSelected();
  }

  clearFilters() {
    this.storeList.clearFilters();
  }

}

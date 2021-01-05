import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { fuseAnimations } from '@fuse/animations';

import { IdentityService } from 'app/core/services/identity.service';
import { IdentityListComponent } from './identity-list/identity-list.component';
import { IdentityFormComponent } from './identity-form/identity-form.component';

@Component({
  selector: 'app-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss']
})
export class IdentityComponent implements OnInit {
  @ViewChild(IdentityListComponent) dataList: IdentityListComponent;
  dialogRef: MatDialogRef<IdentityFormComponent>;

  constructor(
              private dataService: IdentityService,
              public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  createData() {
        this.dialogRef = this.dialog.open(IdentityFormComponent, {
            panelClass: 'app-identity-form',
            data: {title: 'Add Partner'}
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

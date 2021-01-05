import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';

import { ProductService } from 'app/core/services/product.service';
import { MessageService } from 'app/core/services/message.service';
import { LabelsListComponent } from './labels-list/labels-list.component';
import { LabelsFormComponent } from './labels-form/labels-form.component';

@Component({
  selector: 'labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss'],
  animations   : fuseAnimations
})
export class LabelsComponent implements OnInit {

  @ViewChild(LabelsListComponent) dataList: LabelsListComponent;
  dialogFormRef: MatDialogRef<LabelsFormComponent>;

  constructor(
    private dataService: ProductService,
    public dialogRef: MatDialogRef<LabelsComponent>,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  createData() {
    this.dialogFormRef = this.dialog.open(LabelsFormComponent, {
      panelClass: 'antera-details-dialog',
      data: ''
    });
    this.dialogFormRef.afterClosed()
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

  close() {
    this.dialogRef.close();
  }

}

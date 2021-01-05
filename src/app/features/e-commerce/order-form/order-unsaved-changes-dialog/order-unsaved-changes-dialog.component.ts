import { Component, OnInit, Optional, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'order-unsaved-changes-dialog',
  templateUrl: './order-unsaved-changes-dialog.component.html',
  styleUrls: ['./order-unsaved-changes-dialog.component.css']
})
export class OrderUnsavedChangesDialogComponent implements OnInit {

  constructor(
    @Optional() public dialogRef: MatDialogRef<OrderUnsavedChangesDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
  ) { }

  ngOnInit() {
  }

  discard() {
    this.dialogRef.close('discard');
  }

  cancel() {
    this.dialogRef.close('cancel');
  }

  save() {
    this.dialogRef.close('save');
  }

}

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'change-vendor-warning-dialog',
  templateUrl: './change-vendor-warning-dialog.component.html',
  styleUrls: ['./change-vendor-warning-dialog.component.scss']
})
export class ChangeVendorWarningDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) private data: any,
    public dialogRef: MatDialogRef<ChangeVendorWarningDialogComponent>,) { }
  handleSave(){
    this.dialogRef.close(true)
  }
  ngOnInit() {
  }

}

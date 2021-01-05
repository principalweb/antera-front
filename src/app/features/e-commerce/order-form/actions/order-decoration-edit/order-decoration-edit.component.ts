import { Component, OnInit, Optional, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-order-decoration-edit',
  templateUrl: './order-decoration-edit.component.html',
  styleUrls: ['./order-decoration-edit.component.scss']
})
export class OrderDecorationEditComponent implements OnInit {

  constructor(
    @Optional() public dialogRef: MatDialogRef<OrderDecorationEditComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit() {
  }

  save() {

    // Create decoration and add it to the order

    const action = {
      type: 'AddNewDecorationToRow',
      payload: {}
    };

    if (this.dialogRef) {
    }
  }

  close() {
    if (this.dialogRef) {
      this.dialogRef.close(false);
    }
  }

}

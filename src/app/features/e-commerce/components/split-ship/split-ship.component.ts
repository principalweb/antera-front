import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { widget } from './widget';

@Component({
  selector: 'app-split-ship',
  templateUrl: './split-ship.component.html',
  styleUrls: ['./split-ship.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SplitShipComponent implements OnInit {

  widget: any;

  constructor(
    public dialogRef: MatDialogRef<SplitShipComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.widget = widget;
  }

  onClose(){
    this.dialogRef.close();
  }

}

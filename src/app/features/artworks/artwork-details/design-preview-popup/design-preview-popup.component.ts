import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-design-preview-popup',
  templateUrl: './design-preview-popup.component.html',
  styleUrls: ['./design-preview-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DesignPreviewPopupComponent implements OnInit {

  fileId: string;

  constructor(
    public dialogRef: MatDialogRef<DesignPreviewPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.fileId = this.data;
  }

  close() {
    this.dialogRef.close();
  }

}

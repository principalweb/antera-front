import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-select-decoration',
  templateUrl: './select-decoration.component.html',
  styleUrls: ['./select-decoration.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectDecorationComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SelectDecorationComponent>,

  ) { 

  }

  ngOnInit() {

  }

  onCreateNewArtworkSelected(){
    this.dialogRef.close({
      type: 'New'
    });
  }

  onModifyExistingDesign(){
    this.dialogRef.close({
      type: 'Modify'
    });
  }

  onSelectExistingDesign() {
    this.dialogRef.close({
      type: 'Select'
    });
  }

  onSelectAttachArtwork() {
    this.dialogRef.close({
      type: 'Attach'
    });
  }
}

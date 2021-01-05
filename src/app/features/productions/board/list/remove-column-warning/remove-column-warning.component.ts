import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'remove-column-warning',
  templateUrl: './remove-column-warning.component.html',
  styleUrls: ['./remove-column-warning.component.scss']
})
export class RemoveColumnWarningComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RemoveColumnWarningComponent>) { }
  handleSave(){
    this.dialogRef.close(true);
  }

  ngOnInit() {
  }

}

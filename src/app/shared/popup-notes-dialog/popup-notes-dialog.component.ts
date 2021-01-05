import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'popup-notes-dialog',
  templateUrl: './popup-notes-dialog.component.html',
  styleUrls: ['./popup-notes-dialog.component.css']
})
export class PopupNotesDialogComponent implements OnInit{
  public accountdata:any;
  constructor(public dialogRef: MatDialogRef<PopupNotesDialogComponent>,@Inject(MAT_DIALOG_DATA) private data: any,) {
    this.accountdata=data;  
    console.log(this.accountdata)
  } 

   ngOnInit() {
  }

}

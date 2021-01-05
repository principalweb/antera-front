import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.css']
})
export class ViewImageComponent implements OnInit {

  public image:any;
  constructor(public dialogRef: MatDialogRef<ViewImageComponent>,@Inject(MAT_DIALOG_DATA) private data: any,) {
    this.image=data;  
    console.log(this.image)
  } 


  ngOnInit() {
  }

}

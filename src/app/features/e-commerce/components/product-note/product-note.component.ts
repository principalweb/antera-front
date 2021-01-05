import { Component, OnInit, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-product-note',
  templateUrl: './product-note.component.html',
  styleUrls: ['./product-note.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductNoteComponent implements OnInit {

  note: FormControl;
  noteType = 'Order Note';
  // permission control
  orderId: any;

  constructor(    
    public dialogRef: MatDialogRef<ProductNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) 
  {
    this.noteType = data.type;
    if (this.noteType == 'Vendor Note')
    {
      this.note = new FormControl(data.vendorPONote);
    }  
    else if (data.type == 'Order Note')
    {
      this.note = new FormControl(data.orderNote);
    }
    else if (data.type == 'Decoration Note')
    {
      this.note = new FormControl(data.decorationNote);
    }

    this.orderId = data.oId;
  }

  ngOnInit() {

  }

  updateNote() {
    this.dialogRef.close(this.note.value);
  }

}

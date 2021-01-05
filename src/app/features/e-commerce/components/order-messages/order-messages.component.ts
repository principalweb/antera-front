import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-order-messages',
  templateUrl: './order-messages.component.html',
  styleUrls: ['./order-messages.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderMessagesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<OrderMessagesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.data = {
      messages: [
        {
          type: "",
          is_default: false,
          description: ""
        }
      ],
      selected_messages: ""
    }
  }

  addMessage(){
    const newMessage = {
      type: "",
      is_default: false,
      description: ""
    };
    this.data.messages.push(newMessage);
  }

  closeMessage(index: number){
    this.data.messages.splice(index, 1);
  }

  close(){
    this.dialogRef.close(this.data);
  }

}

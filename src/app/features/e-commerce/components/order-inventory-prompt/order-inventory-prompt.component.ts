import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-order-inventory-prompt',
  templateUrl: './order-inventory-prompt.component.html',
  styleUrls: ['./order-inventory-prompt.component.scss']
})
export class OrderInventoryPromptComponent implements OnInit {

  dialogTitle = 'Order Inventory Prompt';

  constructor(
    public dialogRef: MatDialogRef<OrderInventoryPromptComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {

  }


  toWarehouse() {
    console.log('SENDING INVENTORY TO WAREHOUSE NEED TO CHOOSE BINS')
    this.dialogRef.close('warehouse');

  }
  toCustomer() {
    console.log('SENDING INVENTORY TO CUSTOMER LOCATION');
    this.dialogRef.close('customer');
  }


  ngOnInit() {
  }

}

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector     : 'order-payment-message-dialog',
    templateUrl  : './order-payment-message-dialog.component.html',
    styleUrls    : ['./order-payment-message-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class OrderPaymentMessageDialogComponent
{
    dialogTitle: string;
    paymentStatus = 'success';
    pData = {};
    constructor(
        public dialogRef: MatDialogRef<OrderPaymentMessageDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
    )
    {
        this.dialogTitle = 'Receive Payment for Order';
        this.paymentStatus = data.paymentStatus;
        this.pData = data.paymentData;
    }

    ngOnInit()
    {

    }

    ngOnDestroy()
    {

    }
    
    onActionButtons(type) {
        this.dialogRef.close({actionType: type});
    }
}

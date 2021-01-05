import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-refund-payment-dialog',
  templateUrl: './refund-payment-dialog.component.html',
  styleUrls: ['./refund-payment-dialog.component.scss']
})
export class RefundPaymentDialogComponent implements OnInit {
  dialogTitle: string;
  paymentValid = true;
  paymentPartial = true;
  form: FormGroup;
  amount: any;
  service: any;
  payment: any;  

  constructor(
      public dialogRef: MatDialogRef<RefundPaymentDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      public api: ApiService,
      private msg: MessageService,
      private authService: AuthService,
      private fb: FormBuilder,

  ) {
        this.dialogTitle = 'Void Payment';
        this.paymentValid = data.paymentValid;
        this.service =  data.service;
        this.payment = data.payment;
        this.amount = data.payment.amount;
        this.form = this.createForm();
  }


  ngOnInit() {
  }

  createForm() {
     return this.fb.group({
         oId : [this.payment.orderId],
         trackId : [this.payment.id],
         amount: [this.amount, Validators.required],
         userId: [this.authService.getCurrentUser().userId]
     });
  }

  refunded() {
            this.service.refundPayment({
                ...this.form.value
            })
            .subscribe((res) => {
                this.msg.show(res.msg, 'success');
                this.dialogRef.close({status: 'success'});
            }, (err) => {
                this.msg.show('Payment Not updated correctly!', 'error');
                this.dialogRef.close({status: 'error'});
            });
  }

}

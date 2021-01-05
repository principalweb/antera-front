import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-void-payment-dialog',
  templateUrl: './void-payment-dialog.component.html',
  styleUrls: ['./void-payment-dialog.component.scss']
})

export class VoidPaymentDialogComponent implements OnInit {
  dialogTitle: string;
  paymentValid = true;
  paymentPartial = true;
  form: FormGroup;
  amount: any;
  service: any;
  payment: any;  
  constructor(
      public dialogRef: MatDialogRef<VoidPaymentDialogComponent>,
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

  voided() {

            this.service.voidPayment({
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

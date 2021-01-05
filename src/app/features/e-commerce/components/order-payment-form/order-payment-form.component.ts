import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import * as moment from 'moment';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
import { fx2N } from 'app/utils/utils';

@Component({
    selector     : 'order-payment-form-dialog',
    templateUrl  : './order-payment-form.component.html',
    styleUrls    : ['./order-payment-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class OrderPaymentFormDialogComponent
{
    dialogTitle: string;

    cashCheckPaymentForm: FormGroup;
    creditCardPaymentForm: FormGroup;
    applyCreditPaymentForm: FormGroup;

    service: any;
    paymentTracks = [];
    order: any;
    loading = false;
    balanceAmount = 0;
    creditAmount : any;
    paymentValid = true;
    paymentResponse = '';
    boltread = [];
    paymentType = 'Cash_Check';
    pMethodList = ['Check', 'Credit_Card', 'ACH', 'Cash', 'Other'];
    pStatusList = ['Unpaid', 'Paid', 'Partial'];
    fx2N = fx2N;

    constructor(
        public dialogRef: MatDialogRef<OrderPaymentFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private msg: MessageService,
        private authService: AuthService,
        private api: ApiService,

    )
    {
        this.dialogTitle = 'Receive Payment for Order';
        this.service = data.service;
        this.paymentTracks = data.paymentTracks;
        this.order = data.order;
        this.paymentType = data.paymentType;
        if (this.paymentType == 'Cash_Check') {
            this.cashCheckPaymentForm = this.createCashCheckPaymentForm();
        } else if (this.paymentType == 'Credit_Card'){
            this.creditCardPaymentForm = this.createCreditCardPaymentForm();
        } else {
            this.getCurrentCreditAmount();
            this.applyCreditPaymentForm = this.createApplyCreditPaymentForm();
        }
        this.paymentValid = fx2N(this.calculateBalanceAmount()) > 0 ? false: true;
        const options = {"dropdown":["payment_methods_list"]};
        this.api.getPaymentMethodsList().subscribe((res: any[]) => {
            this.pMethodList = res
        });
        
    }

    ngOnInit()
    {

    }

    ngOnDestroy()
    {

    }

    //getBoltPayment(oId,amount): Promise<any>
    getBoltPayment(params): Promise<any>
    {
       //let data: any = {oId: oId, paymentAmount: amount, read: this.boltread};
       let data: any = { params, read: this.boltread };
        return new Promise(
            (resolve, reject) => {
                this.api.getBoltPayment(data)
                    .subscribe((response: any) => {
                        console.log(response.msg);
                        this.paymentResponse = response.msg;
                        if(this.paymentResponse === "Approval") {
                            this.loading = false;
                            this.dialogRef.close({paymentType: this.paymentType, status: 'success'});
                        } else {
                           this.loading = false;
                           this.dialogRef.close({paymentType: this.paymentType, status: 'error', data: this.paymentResponse});
                        }
                    }, reject);
            }
        );
    }

    getBoltConnect(oId,amount): Promise<any>
    {
       let data: any = {oId: oId, paymentAmount: amount};
        return new Promise(
            (resolve, reject) => {
                this.api.getBoltConnect(data)
                    .subscribe((response: any) => {
                        this.boltread = response.msg;
            //            console.log(this.boltread.msg);
                    }, reject);
            }
        );
        /*  return this.api.getBoltConnect(data)
            .map((response: any[]) => {
                console.log(response);
                return response;
            });*/
    }

    createCashCheckPaymentForm()
    {
        return this.formBuilder.group({
            oId             :[this.order.id, Validators.required],
            paymentMethod   :['Check', Validators.required],
            paymentAmount   :[fx2N(this.calculateBalanceAmount()), Validators.required],
            referenceNumber :['', Validators.required],
            memo            :[''],
            notes           :[''],
            paymentDate     :[moment().toDate(), Validators.required]
        });
    }

    createCreditCardPaymentForm()
    {
        this.getBoltConnect(this.order.id,fx2N(this.calculateBalanceAmount()));
        return this.formBuilder.group({
            oId             :[this.order.id, Validators.required],
            paymentAmount   :[fx2N(this.calculateBalanceAmount()), Validators.required],
            orderAmount     :[fx2N(this.calculateBalanceAmount()), Validators.required],
            userId          :this.authService.getCurrentUser().userId,
            notes           :[''],
        });
    }

    createApplyCreditPaymentForm()
    {
        return this.formBuilder.group({
            oId            :[this.order.id, Validators.required],
            paymentAmount  :[fx2N(this.calculateBalanceAmount())],
            creditAmount   :['0.00'],//[fx2N(this.calculateBalanceAmount()), Validators.required],
            userId         :[this.authService.getCurrentUser().userId],
            paymentMethod  :['Account Credit'],
            paymentDate    :[moment().toDate(), Validators.required]
        });
    }

    getCurrentCreditAmount() {
        this.api.getCurrentCreditAmount({ accountId: this.order.accountId}).subscribe((credit: number) => {
            this.creditAmount = credit;
            this.paymentValid = (credit) > 0 ?  this.paymentValid : true;
        });
    }

    isDuplicateReference(ref) {
         let isDuplicateRef = false;
        this.api.isDuplicateReference({ ref }).subscribe((ref: boolean) => {
           isDuplicateRef =  ref;
            console.log(isDuplicateRef);
        });
        return isDuplicateRef;
    }

   partial()
   {
        this.getBoltConnect(this.order.id,this.creditCardPaymentForm.value.paymentAmount);
   }

   fullPay()
   {
        this.getBoltConnect(this.order.id,fx2N(this.calculateBalanceAmount()));
   }

    update() {
        if (this.paymentType == 'Cash_Check' && !this.cashCheckPaymentForm.valid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        if (this.paymentType == 'Credit_Card' && !this.creditCardPaymentForm.valid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

/*        if (this.paymentType == 'Cash_Check') {
            if ((fx2N(this.calculateBalanceAmount()) - fx2N(this.cashCheckPaymentForm.get('paymentAmount').value)) <0)
            {
                this.msg.show(`Payment amount should not bigger than current balance amount : ${fx2N(this.calculateBalanceAmount())}`, 'error');
                return;
            } 
        }
        else if (this.paymentType == 'Credit_Card') {
            if ((fx2N(this.calculateBalanceAmount()) - fx2N(this.creditCardPaymentForm.get('paymentAmount').value)) <0)
            {
                this.msg.show(`Payment amount should not bigger than current balance amount : ${fx2N(this.calculateBalanceAmount())}`, 'error');
                return;
            }
        } else {*/
        if(this.paymentType == 'Credit_Memo') {
            if((fx2N(this.creditAmount) - fx2N(this.applyCreditPaymentForm.get('creditAmount').value))  < 0)
            {
                this.msg.show(`Payment amount should not bigger than current credit balance amount : ${fx2N(this.creditAmount)}`, 'error');
                return;
            }
        } 
        /*  else {
                if ((fx2N(this.calculateBalanceAmount()) - fx2N(this.creditCardPaymentForm.get('paymentAmount').value)) <0)
                {
                    this.msg.show(`Payment amount should not bigger than current balance amount : ${fx2N(this.calculateBalanceAmount())}`, 'error');
                    return;
                }
            }
        }*/

        if (this.paymentType == 'Cash_Check') {
            this.loading = true;
            this.service.updatePaymentDetails({
                ...this.cashCheckPaymentForm.value,
                userId: this.authService.getCurrentUser().userId
            })
            .subscribe((res) => {
                this.msg.show('Payment details saved.', 'success');
                this.loading = false;
                this.dialogRef.close({paymentType: this.paymentType, status: 'success'});
            }, (err) => {
                console.log(err);
                this.msg.show('Payment Not updated correctly!', 'error');
                this.loading = false;
                this.dialogRef.close({paymentType: this.paymentType, status: 'error'});
            });
        }
        else if (this.paymentType == 'Credit_Card') {
           this.loading = true;
           this.getBoltPayment(this.creditCardPaymentForm.value);
        } else {
            if(this.paymentType == 'Credit_Memo') {
                this.loading = true;
                this.service.updatePaymentDetails({
                    ...this.applyCreditPaymentForm.value
                })
                .subscribe((res) => {
                    this.msg.show('Payment details saved.', 'success');
                    this.loading = false;
                    this.dialogRef.close({paymentType: this.paymentType, status: 'success'});
                }, (err) => {
                    this.msg.show('Payment Not updated correctly!!!', 'error');
                    this.loading = false;
                    this.dialogRef.close({paymentType: this.paymentType, status: 'error'});
                });
            }
        }
    }

    calculateBalanceAmount() {
        let paymentAmount = 0;
        this.paymentTracks.forEach((payment) => {
            paymentAmount += parseFloat(payment.amount);
        });
        return parseFloat(this.order.finalGrandTotalPrice) - paymentAmount;
    }
}

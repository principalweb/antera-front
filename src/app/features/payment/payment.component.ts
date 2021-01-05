import { Component, OnInit, ViewEncapsulation, Inject, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfigService } from '@fuse/services/config.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'app/core/services/message.service';
import { PaymentService } from 'app/core/services/payment.service';
import { fx2N } from '../../utils/utils';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PaymentComponent implements OnInit {

  pMethod = 'none';
  oId: string;
  loading = false;
  amount = 0; 

  eCheckForm: FormGroup;
  ccForm: FormGroup;
  isSandbox = false;
  fx2N = fx2N;

  onSandboxChangedSubscription: Subscription;

  @ViewChild('token') ccToken: ElementRef;

  constructor(
    private paymentService: PaymentService,
    private formBuilder: FormBuilder,
    private render: Renderer2,
    private msg: MessageService,
    private fuseConfig: FuseConfigService,
  ) { 
    this.render.listen('window','message',(event) => {
      if (event.data){
        try {
          const data = JSON.parse(event.data);
          this.ccToken.nativeElement.value = data.message;
        }
        catch(e){
        }
      }
    });
  }

  ngOnInit() {
    this.pMethod = this.paymentService.routeParams.method;
    this.oId = this.paymentService.routeParams.oId;
    this.amount = fx2N(this.paymentService.routeParams.amount);

    if (this.pMethod == 'none'){
      this.fuseConfig.setConfig({
        layout: {
            navigation: 'none',
            toolbar   : 'none',
            footer    : 'none'
        }
      });
    }

    this.onSandboxChangedSubscription = 
      this.paymentService.onSandboxChanged
          .subscribe((res :string) => {
            if (res == 'Yes')
              this.isSandbox = true;
            else
              this.isSandbox = false;
          });
  }

  ngOnDestory() {
    this.onSandboxChangedSubscription.unsubscribe();
  }

  createCreditCardForm(){
    return this.formBuilder.group({
      oId                :[this.oId, Validators.required],
      accttype           :[this.pMethod, Validators.required],
      paymentAmount      :[this.amount, Validators.required],
      mytoken            :['', Validators.required],
      expDate            :['', Validators.required],
      cvv                :['', Validators.required],
      firstName          :['', Validators.required],
      lastName           :['', Validators.required],
      email              :['', Validators.required],
      phone              :['', Validators.required],
      address            :['', Validators.required],
      city               :['', Validators.required],
      state              :['', Validators.required],
      zipCode            :['', Validators.required],
      country            :['', Validators.required],
    });
  }

  createECheckForm(){
    return this.formBuilder.group({
      oId                :[this.oId, Validators.required],
      accttype           :[this.pMethod, Validators.required],
      paymentAmount      :[this.amount, Validators.required],
      mytoken            :['', Validators.required],
      firstName          :['', Validators.required],
      lastName           :['', Validators.required],
      email              :['', Validators.required],
      phone              :['', Validators.required],
      address            :['', Validators.required],
      city               :['', Validators.required],
      state              :['', Validators.required],
      zipCode            :['', Validators.required],
      country            :['', Validators.required],
    });
  }

  pay(type){
    
    let data; 
    if (type == 'credit'){
      data = {
        ...this.ccForm.getRawValue(),
        mytoken: this.ccToken.nativeElement.value
      };
    }
    else {
      data = {
        ...this.eCheckForm.getRawValue(),
        mytoken: this.ccToken.nativeElement.value
      };
    }
    console.log(data);
    this.loading = true;
    this.paymentService.doPayment(data).then(res => {
      if (res.success == 1){
        this.paymentService.confirmPayment(this.oId)
            .then(res => {
              this.msg.show('You have successfully completed the payment','success');
              this.loading = false;
            }).catch(err => {
              this.loading = false;
              this.msg.show('An error occured while processing payment','error');  
            });
      }
      else {
        console.log(res);
        this.loading = false;
        this.msg.show('An error occured while processing payment','error');  
      }
    }).catch(err => {
      this.loading = false;
    });
  }

  onCreditCardSelected() {
    this.pMethod = "credit";
    this.ccForm = this.createCreditCardForm();
  }

  onECheckSelected(){
    this.pMethod = "ECHK";
    this.eCheckForm = this.createECheckForm();
  }
}

import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { PaymentMethodListComponent } from './payment-method-list/payment-method-list.component';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss']
})
export class PaymentMethodComponent implements OnInit {

 

  constructor() { }

  ngOnInit(): void {
  }

  clearFilters() {
    //this.paymentMethodList.clearFilters();
  }
}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AdminService } from '../admin.service';
import { CurrencyService } from '../currency/currency.service';

@Component({
  selector: 'app-manage-rates',
  templateUrl: './manage-rates.component.html',
  styleUrls: ['./manage-rates.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageRatesComponent implements OnInit {
  fromCurrency = '';
  toCurrency = '';
  rate = '';

  constructor(public admin: AdminService, public currencyService: CurrencyService) { }

  ngOnInit() {
  }

  exchangeRateFull(){
    return !this.fromCurrency.length || !this.toCurrency.length || !this.rate.length;
  }

  addRate() {
    // this.admin.addRate({
    //   from: this.fromCurrency,
    //   to: this.toCurrency,
    //   rate: this.rate
    // });
    this.currencyService.addExchangeRate(this.fromCurrency, this.toCurrency, this.rate);
    this.fromCurrency = '';
    this.toCurrency = '';
    this.rate = '';
  }

}

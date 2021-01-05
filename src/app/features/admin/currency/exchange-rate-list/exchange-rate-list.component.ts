import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CurrencyService } from '../currency.service';

@Component({
  selector: 'exchange-rate-list',
  templateUrl: './exchange-rate-list.component.html',
  styleUrls: ['./exchange-rate-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ExchangeRateListComponent implements OnInit {

  constructor(public currencyService: CurrencyService) { }

  ngOnInit() {
  }

}

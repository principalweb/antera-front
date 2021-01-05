import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';

import { CurrencyItem } from '../currency/interface/interface';
import { CurrencyService } from '../currency/currency.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manage-currency',
  templateUrl: './manage-currency.component.html',
  styleUrls: ['./manage-currency.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ManageCurrencyComponent implements OnInit {
  currencies: CurrencyItem[];
  destroyed$: Subject<boolean> = new Subject<boolean>()
  constructor(public currencyService: CurrencyService) { }

  ngOnInit() {
    this.subscribeToCurrencies();
  }

  ngOnDestroy(){
    this.destroyed$.next(true);
  }

  subscribeToCurrencies(){
    this.currencyService.currencies.pipe(takeUntil(this.destroyed$))
    .subscribe((currencies: CurrencyItem[]) => this.currencies = currencies);
  }

}

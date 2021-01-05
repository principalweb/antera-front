import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';
import { CurrencyService } from './currency.service';
import { take, takeUntil, map } from 'rxjs/operators';
import { CurrencyItem, ConfigResponse } from './interface/interface';
import { Subject } from 'rxjs';
import { ExchangeRate } from 'app/models/exchange-rate';

@Component({
  selector: "app-currency",
  templateUrl: "./currency.component.html",
  styleUrls: ["./currency.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CurrencyComponent implements OnInit {
  enable: boolean = false;
  autoUpdate: boolean = false;
  loading: boolean = false;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  baseCurrency: string;
  loadedCurrency: string;
  padding: string;
  loadedPadding: string;

  constructor(
    private api: ApiService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit() {
    this.subscribeToLoading();
    this.getInitialCurrencyList();
    this.getCurrencyConfig();
    this.getCurrencyCodes();
    this.getExchangeRateList();
  }

  getInitialCurrencyList() {
    this.api
      .getCurrencyListForDropDownDOnly()
      .pipe(take(1))
      .subscribe((currencyList: CurrencyItem[]) => {
        this.currencyService.currencies.next(currencyList);
        console.log("currency list", currencyList);
      });
  }

  getExchangeRateList(){
    this.api.getExchangeRateList()
    .pipe(take(1), map((exchangeRates: any[]) => exchangeRates.map(individualExchangeRate => new ExchangeRate(individualExchangeRate))))
    .subscribe((exchangeRates: ExchangeRate[]) => {
      console.log("exchangeRates initial", exchangeRates);
      this.currencyService.exchangeRates.next(exchangeRates);
    })
  }

  subscribeToLoading() {
    this.currencyService.loading
      .pipe(takeUntil(this.destroyed$))
      .subscribe((loading: boolean) => (this.loading = loading));
  }

  getCurrencyConfig() {
    this.api
      .getCurrencyConfiguration()
      .pipe(take(1))
      .subscribe((res: ConfigResponse) => {
        console.log("currency config response", res);
        this.currencyService.currencySettings.next(res.settings);
        this.enable = res.settings.enableCurrency === "0" ? false : true;
        this.autoUpdate =
          res.settings.autoUpdateCurrency === "0" ? false : true;
        this.baseCurrency = res.settings.baseCurrency;
        this.loadedCurrency = res.settings.baseCurrency;
        this.padding = res.settings.ratePadding;
        this.loadedPadding = res.settings.ratePadding;
      });
  }

  updateEnableSettings(event) {
    const toggle = event.checked ? "1" : "0";
    this.currencyService.updateEnableSettings(toggle);
  }

  updateAutoUpdateSettings(event) {
    const toggle = event.checked ? "1" : "0";
    this.currencyService.updateAutoUpdateSettings(toggle);
  }

  saveCoreCurrency() {
    this.currencyService.changeConfigSettings(
      "baseCurrency",
      this.baseCurrency
    );
    this.loadedCurrency = this.baseCurrency;
  }

  saveRatePadding(){
    this.currencyService.changeConfigSettings("ratePadding", this.padding);
    this.loadedPadding = this.padding;
  }

  getCurrencyCodes(){
    this.api.getCurrencyCodes()
    .pipe(take(1))
    .subscribe((currencyCodes: string[]) => this.currencyService.currencyCodes.next(currencyCodes));
  }
}

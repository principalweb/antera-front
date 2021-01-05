import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { findIndex } from 'lodash';

@Injectable()
export class AdminService {
  currencies = new BehaviorSubject([]);
  uniqueCurrencyId = 1;

  rates = new BehaviorSubject([]);
  uniqueRateId = 1;

  constructor() { }

  addCurrency(data) {
    const currencies = [
      ...this.currencies.value,
      {
        ...data,
        id: this.uniqueCurrencyId
      }
    ];

    this.uniqueCurrencyId ++;

    this.currencies.next(currencies);
  }

  updateCurrency(data) {
    const i = findIndex(this.currencies.value, { id: data.id });
    if (i >= 0) {
      const currencies = this.currencies.value.slice(0);
      currencies.splice(i, 1, data);
      this.currencies.next(currencies);
    }
  }

  addRate(data) {
    const rates = [
      ...this.rates.value,
      {
        ...data,
        id: this.uniqueRateId
      }
    ];

    this.uniqueRateId ++;

    this.rates.next(rates);
  }

  updateRate(data) {
    const i = findIndex(this.rates.value, { id: data.id });
    if (i >= 0) {
      const rates = this.rates.value.slice(0);
      rates.splice(i, 1, data);
      this.rates.next(rates);
    }
  }
}

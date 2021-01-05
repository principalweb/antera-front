import { Injectable } from '@angular/core';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DocumentHelpersService {

  constructor(
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    private decimalPipe: DecimalPipe,
  ) { }

  transformDate(date) {
    if ((date === '0000-00-00') || (date === '0000-00-00 00:00:00')) {
      return null;
    }
    try {
      return this.datePipe.transform(date);
    } catch (e) {
      return null;
    }
  }

  transformDecimal(value, digitsInfo = '1.0-0', locale = 'en_US') {
    try {
      return this.decimalPipe.transform(value, digitsInfo, locale);
    } catch (e) {
      return null;
    }
  }

  transformCurrency(value, currencyCode = 'USD', display = 'symbol', digitsInfo = '1.2-15', locale = 'en_US') {
    if (isNaN(parseFloat(value))) {
      value = 0;
    }

    try {
      return this.currencyPipe.transform(value, currencyCode, display, digitsInfo, locale);
    } catch (e) {
      return '';
    }

  }

}

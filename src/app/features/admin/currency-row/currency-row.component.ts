import { Component, OnInit, Input } from '@angular/core';
import { CurrencyItem } from "../currency/interface/interface";
import { CurrencyService } from '../currency/currency.service';
import { AuthService } from 'app/core/services/auth.service';
import { User } from 'app/models';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-currency-row',
  templateUrl: './currency-row.component.html',
  styleUrls: ['./currency-row.component.scss']
})
export class CurrencyRowComponent implements OnInit {
  @Input() mode = '';
  @Input() data: any = {};
  editing = false;

  constructor(public currencyService: CurrencyService, 
    public authService: AuthService) { }

  ngOnInit() {
    if (this.mode === 'new') {
      this.editing = true;
    }
  }

  edit() {
    this.editing = true;
  }

  save(){
    this.currencyService.updateCurrency(this.data)
    .pipe(take(1))
    .subscribe(val => this.editing = false, 
      (error) => console.log(error));
  }

  addCurrency(){
    const user: User = this.authService.getCurrentUser();
    const currencyItem: CurrencyItem = {
      id: "0",
      currency: this.data.currency,
      symbol: this.data.symbol,
      code: this.data.code,
      dateCreated: new Date(),
      dateModified: new Date(),
      createdById: user.id,
      createdByName: user.fullName,
      modifiedById: user.id,
      modifiedByName: user.fullName
    }
    this.currencyService.addCurrency(currencyItem)
    .pipe(take(1))
    .subscribe((res: string) => {
      this.data.currency = "";
      this.data.code  = "";
      this.data.symbol = ""
    }, error => console.log(error))
    
  }

  delete(currencyId){
    const arrayed = [currencyId];
    this.currencyService.removeCurrencies(arrayed);
  }

  currencyFormInValid(){
    return (this.data["currency"] && !this.data["currency"].length || this.data["code"] && !this.data["code"].length || this.data["symbol"] && !this.data["symbol"].length) ||
    !this.data["currency"] || !this.data["code"] || !this.data["symbol"];
  }

}

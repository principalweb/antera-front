import { BaseModel } from "./base-model";

export class ExchangeRate extends BaseModel {
  id: string;
  fromCurrencyId: string;
  fromCurrencyName: string;
  fromCurrencyCode: string;
  fromCurrencySymbole: string;
  toCurrencyId: string;
  toCurrencyName: string;
  toCurrencyCode: string;
  toCurrencySymbole: string;
  rate: string;
  dateCreated: Date;
  dateModified: Date;
  createdById: string;
  createdByName: string;
  modifiedById: string;
  modifiedByName: string;
  paddingPercent: string;
  rateAfterPadding: string;
  setData(er){
    this.setString(er, "id");
    this.setString(er, "fromCurrencyId");
    this.setString(er, "fromCurrencyName");
    this.setString(er, "fromCurrencyCode");
    this.setString(er, "fromCurrencySymbole");
    this.setString(er, "fromCurrencySymbole");
    this.setString(er, "toCurrencyId");
    this.setString(er, "toCurrencyName");
    this.setString(er, "toCurrencyCode");
    this.setString(er, "toCurrencySymbole");
    this.setString(er, "rate");
    this.setDate(er, "dateCreated");
    this.setDate(er, "dateModified");
    this.setString(er, "createdById");
    this.setString(er, "createdByName");
    this.setString(er, "modifiedById");
    this.setString(er, "modifiedByName");
    this.setString(er, "paddingPercent");
    this.setString(er, "rateAfterPadding");
  }
}
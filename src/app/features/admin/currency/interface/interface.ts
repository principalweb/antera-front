export interface CurrencyItem {
    id: string;
    currency: string;
    symbol: string;
    code: string;
    dateCreated: Date;
    dateModified: Date;
    createdById: string;
    createdByName: string;
    modifiedById: string;
    modifiedByName: string;
}

export interface Settings {
    autoUpdateCurrency: string;
    baseCurrency: string;
    enableCurrency: string;
    ratePadding: string;
}

export interface CurrencyCreateResponse {
    status: string,
    msg: string,
    extra: {
        id: string,
        currency: string,
        symbol: string,
        code: string,
        dateCreated: string,
        dateModified: string,
        createdById: string,
        createdByName: string,
        modifiedById: string,
        modifiedByName: string
    }
}

export interface DeleteCurrencyResponse {
    status: string,
    msg: string,
    extra: {
        ids: string[]
    }
}

export interface ConfigUpdateResponse {
    status: string;
    msg: string;
    extra: {
        module: string;
        settings: Settings
    }
}

export interface ConfigResponse {
    module: string,
    settings: {
        autoUpdateCurrency: string,
        baseCurrency: string,
        enableCurrency: string,
        ratePadding: string
    }
}

export interface ExchangeRate {
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
}

export interface ExchangeRateCreateRequest {
  fromCurrencyId: string;
  toCurrencyId: string;
  rate: string;
  dateCreated: Date;
  dateModified: Date;
  createdById: string;
  createdByName: string;
  modifiedById: string;
  modifiedByName: string;
}

export interface ExchangeRateUpdateResponse {  
status: string,
msg: string,
extra: {
id: string,
fromCurrencyId: string,
toCurrencyId: string,
rate: string,
dateCreated: string,
dateModified: string,
createdById: string,
createdByName: string,
modifiedById: string,
modifiedByName: string
paddingPercent: string,
rateAfterPadding: string
}
}

export interface ExchangeRateCreateResponse {
    status: string,
    msg: string,
    extra: {
        id: string,
        fromCurrencyId: string,
        fromCurrencyName: string,
        fromCurrencyCode: string,
        fromCurrencySymbole: string,
        toCurrencyId: string,
        toCurrencyName: string,
        toCurrencyCode: string,
        toCurrencySymbole: string,
        rate: string,
        dateCreated: string,
        dateModified: string,
        createdById: string,
        createdByName: string,
        modifiedById: string,
        modifiedByName: string,
        paddingPercent: string,
        rateAfterPadding: string
    }
}

export interface DeleteExchangeRateResponse {
    "status": string,
    "msg": string,
    "extra": {
        "ids": string[]
    }
}

export interface SyncExchangeRateIdsResponse {
    "status": string,
    "msg": string,
    "extra": {
        "exchangeRateIds": string
    }
}

export interface SyncAllExchangeRatesResponse {
    "status": string,
    "msg": string,
    "extra": {
        "syncall": string
    }
}
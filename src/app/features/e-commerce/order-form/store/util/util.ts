import { ExchangeRate } from 'app/models/exchange-rate';

export const convertCurrency = (baseCurrency: string, toCurrency: string, exchangeRates: ExchangeRate[], amount: string): number | null => {
   const exchangeRate: ExchangeRate =  exchangeRates.find((exchangeRate: ExchangeRate) => exchangeRate.fromCurrencyCode === toCurrency && exchangeRate.toCurrencyCode === baseCurrency);
   if (!exchangeRate) return null;
   const numberAmount = parseFloat(amount);
   if (isNaN(numberAmount)) return null;
   const convertedAmount = numberAmount * parseFloat(exchangeRate.rate);
   console.log("converted Amount", convertedAmount);
   return convertedAmount;
}

export const convertCurrencyRounded = (baseCurrency: string, toCurrency: string, exchangeRates: ExchangeRate[], amount: string): string => {
    const exchangeRate: ExchangeRate = exchangeRates.find((exchangeRate: ExchangeRate) => exchangeRate.fromCurrencyCode === toCurrency && exchangeRate.toCurrencyCode === baseCurrency);
    if (!exchangeRate) return null;
    const numberAmount = parseFloat(amount);
    if (isNaN(numberAmount)) return null;
    const convertedAmount = numberAmount * parseFloat(exchangeRate.rate);
    console.log("converted Amount", convertedAmount);
    return convertedAmount.toFixed(4);
}

export const currencyMatches = (baseCurrency: string, comparisonCurrency: string) => {
    return baseCurrency.toLowerCase() === comparisonCurrency.toLowerCase();
}
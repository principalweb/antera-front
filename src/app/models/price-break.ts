import { fx2N } from '../utils/utils';

export class PriceBreak {
    minQuantity;
    margin;
    salePrice;
    unitProfit;
    price;
    marginDisabled: boolean;
    decimals;

    constructor(prb: any = {}, public config: any = {}) {
        this.minQuantity = prb.minQuantity || 1;
        this.margin = prb.margin || 0;
        this.salePrice = prb.salePrice || 0;
        this.unitProfit = prb.unitProfit || 0;
        this.price = prb.price || 0;

        this.decimals = this.config.sysconfigOrderFormCostDecimalUpto || 4;
    }

    get totalSalesPrice() {
        return fx2N(this.salePrice * this.minQuantity);
    }

    get totalCost() {
        return fx2N(this.price * this.minQuantity);
    }

    get totalProfit() {
        return fx2N(this.unitProfit * this.minQuantity);
    }

    countDecimals (number) {
      if (Math.floor(number) === number) {
        return 0;
      }
      return number.toString().split('.')[1].length || 0;
    }

    updateSalesPrice(price: number) {
        if (price > 0) {
            this.salePrice = Number(price).toFixed(this.decimals);
            this.unitProfit = Number(this.salePrice - this.price).toFixed(this.decimals);

            if (this.salePrice >= this.price) {
                this.margin = Number(this.unitProfit * 100 / this.salePrice).toFixed(2);
            } else {
                this.margin = 0;
            }
        } else {
            this.salePrice = Number(price).toFixed(this.decimals);
            this.unitProfit = 0;
            this.margin = null;
        }
    }

    updateMargin(margin: number) {
        if (margin >= 100) {
            this.margin = 99;
        }
        if (margin === 0) {
            this.salePrice = this.price;
            return;
        }

        this.margin = Number(margin).toFixed(2);
        this.salePrice = Number(this.price * 100 / (100 - Number(this.margin))).toFixed(this.countDecimals(this.price));
        this.unitProfit = this.salePrice - this.price;
    }

    updatePrice(price: number) {
        if (price < 0) {
            return;
        }

        this.price = price;
        this.unitProfit = this.salePrice - this.price;
        this.margin = Number(this.unitProfit * 100 / this.salePrice).toFixed(2);

        if (this.salePrice >= this.price) {
            this.margin = Number(this.unitProfit * 100 / this.salePrice).toFixed(2);
        } else {
            this.margin = 0;
        }
        Number(this.margin).toFixed(2);
    }

    updateProfit(profit: number) {
        if (this.unitProfit < -this.price) {
            return;
        }

        this.unitProfit = profit;
        this.salePrice = Number(this.price + this.unitProfit).toFixed(this.decimals);
        this.margin = this.unitProfit * 100 / this.salePrice;
    }

    toObject() {
        return {
            minQuantity: this.minQuantity,
            margin: this.margin,
            salePrice: Number(this.salePrice).toFixed(this.decimals),
            unitProfit: Number(this.unitProfit).toFixed(this.decimals),
            price: Number(this.price).toFixed(this.decimals),
        };
    }
}

import { FuseUtils } from "@fuse/utils";
import { PriceBreak } from './price-break';

export class PriceOption {
    partId: string;
    name: string;
    value: string;
    prCode: string;
    color: string;
    priceBreaks: PriceBreak[];
    min: string;
    max: string;
    saleStartDate: string;
    saleEndDate: string;
    priceType: string;
    sku: string;

    constructor(part: any = {}) {
        this.partId = part.partId || FuseUtils.generateGUID();
        this.name = part.name || "Size";
        this.value = (part && (part.ApparelSize && part.ApparelSize.labelSize)) || '';
        this.prCode = "";
        this.color = (part && (part.ColorArray && (part.ColorArray.Color && part.ColorArray.Color.colorName))) || '';
        this.min = part.min || '0';
        this.max = part.max || '0';
        this.priceType = part.priceType || "0";
        this.saleEndDate = part.saleEndDate || null;
        this.sku = part.sku || '';

        this.priceBreaks = [];
        if (part.partPrice && part.partPrice.PartPriceArray){
            part.partPrice.PartPriceArray.PartPrice.forEach(price => {
                let priceBreak = new PriceBreak(price);
                this.priceBreaks.push(priceBreak);
            });
        }
        else {
            this.priceBreaks = [ new PriceBreak() ];
        }
    }
}

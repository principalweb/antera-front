import { Component, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { find } from 'lodash';
import { ApiService } from 'app/core/services/api.service';
import { fieldLabel } from 'app/utils/utils';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


@Component({
    selector: 'antera-multi-quote-modern',
    templateUrl: './multi-quote-modern.component.html',
    styleUrls: ['./multi-quote-modern.component.scss'],
    animations: fuseAnimations
})
export class AnteraMultiQuoteModernComponent {

    @Input() quote: any;
    @Input() docOptions: any[];
    @Input() docDefaultOptions: any[];
    @Input() logoUrl: string;
    @Input() lineItems: any[];
    @Input() docLabels: any;
    @Input() isAdmin = false;
    @Input() creditTerms: any[] = [];
    @Input() sysConfig: any;
    @Input() fields = [];
    @Input() accountFields = [];
    @Input() shipInfoList = [];
    productMap = {};
    products: any[] = [];
    sysconfigOrderFormCostDecimalUpto: string;
    sysconfigOrderFormQtyDecimalUpto: string;
    sysconfigOrderFormTotalDecimalUpto: string;

    primaryLineItems: any;
    fieldLabel = fieldLabel;
    itemsMissingProduct: any = {};

    constructor(private api: ApiService) {

    }

    ngOnInit() {
        this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.sysConfig.sysconfigOrderFormCostDecimalUpto;
        this.sysconfigOrderFormQtyDecimalUpto = '1.0-' + this.sysConfig.sysconfigOrderFormQtyDecimalUpto;
        this.sysconfigOrderFormTotalDecimalUpto = '1.2-2';
        this.fetchQuoteProductDetails();
    }

    get paymentUrl(): string {
        return window.location.origin + `/protected/payment.html?method=none&oId=${this.quote.id}&amount=${this.quote.finalGrandTotalPrice == '' ? '0' : this.quote.finalGrandTotalPrice}`;
    }

    groupSizeQuantity(product) {
        return product.sizeList.map(s => s.quantity + ' ' + s.size).join(', ');
    }
    fetchQuoteProductDetails() {
        let fetches = [];

        this.products = this.lineItems.filter(item => item.lineItem.hideLine != true);

        const items = this.products.map((item) => {
            return {
                itemId: item.lineItem.id,
                skus: item.matrixRows.map((row) => row.itemSku),
                modifiedPriceBreaks: item.lineItem.modifiedPriceBreaks
            }
        });

        items.forEach((item) => {
            fetches.push(this.fetchProductDetails(item));
        });

        forkJoin(fetches).subscribe((res) => {
            this.buildQuoteTable();
        });
    }

    private fetchProductDetails(item: any): any {
        return this.api.getProductDetailsCurrency(item.itemId).pipe(
            map((product: any) => {
                product.matrixSkus = item.skus;
                const parts = product.ProductPartArray.ProductPart;
                if (parts) {
                    product.minQtys = parts.reduce((qtys, part, index) => {
                        let partPrice = part.partPrice.PartPriceArray.PartPrice;
                        for (let i = 0; i < partPrice.length; i++) {
                            let qtyIndex = qtys.indexOf(partPrice[i].minQuantity);
                            if (qtyIndex === -1) {
                                qtys.push(partPrice[i].minQuantity);
                            }
                        }
                        return qtys;
                    }, []);
                    product.priceTableArray = parts.reduce((rows, part, index) => {
                        let partPrice = part.partPrice.PartPriceArray.PartPrice;

                        for (let i = 0; i < partPrice.length; i++) {

                            if (item.modifiedPriceBreaks && item.modifiedPriceBreaks.priceBreaks) {
                                const modified = item.modifiedPriceBreaks.priceBreaks[i];

                                if (modified) {
                                    partPrice[i].margin = modified.margin;
                                    partPrice[i].price = modified.price;
                                    partPrice[i].salePrice = modified.salePrice;
                                }
                            }

                            let sizeIndex = rows.findIndex((row) => row.label === part.ApparelSize.labelSize);
                            if (sizeIndex === -1) {
                                let row = { label: part.ApparelSize.labelSize };
                                row[partPrice[i].minQuantity] = partPrice[i];
                                rows.push(row);
                            } else {
                                rows[sizeIndex][partPrice[i].minQuantity] = partPrice[i];
                            }
                        }
                        return rows;
                    }, []);
                    if (product.priceTableArray && product.priceTableArray.length) {
                        product.priceTableColumns = [
                            'label',
                            ...product.minQtys
                        ];
                    }
                }
                this.productMap[product.id] = product;
                return product;
            }),
            catchError((err) => {
                this.itemsMissingProduct[item.itemId] = item;
                console.log('Error retrieving product', err, item);
                return of({ error: err });
            })
        );
    }

    private buildQuoteTable() {
        // NOOP
    }

    checkValid(value) {
        if (!value) {
            return false;
        }
        if (parseFloat(value) == 0) {
            return false;
        }
        if (parseFloat(value) > 0) {
            return true;
        }
    }

    calculateSubTotal() {
        return this.calculateTotalPrice() -
            parseFloat(this.quote.taxAmount) -
            parseFloat(this.quote.discount)
    }

    checkValidSubtotal() {
        return (parseFloat(this.quote.finalGrandTotalPrice) - this.calculateSubTotal()) > 0;
    }

    calculateTotalPrice() {
        let totalPrice = 0;
        this.lineItems.forEach((product) => {
            totalPrice += parseFloat(product.price) * parseFloat(product.quantity);
            if (product.addonCharges) {
                product.addonCharges.forEach((addonCharge) => {
                    if (addonCharge.matchOrderQty) {
                        totalPrice += parseFloat(addonCharge.price) * parseFloat(product.matchOrderQty);
                    }
                    else {
                        totalPrice += parseFloat(addonCharge.price) * parseFloat(addonCharge.quantity);
                    }
                });
            }

            if (product.decoVendors) {
                product.decoVendors.forEach((decoVendor) => {
                    totalPrice += parseFloat(decoVendor.price) * parseFloat(decoVendor.quantity);
                });
            }
        });
        return totalPrice;
    }

    checkDocOptions() {
        const turnOnOffOptions = [this.docOptions[14].value, this.docOptions[15].value, this.docOptions[16].value];
        let countTrue = 0;
        turnOnOffOptions.forEach((option) => {
            if (option == true) {
                countTrue += 1;
            }
        });
        return countTrue;
    }

    getLabelForFirstColumn() {
        if (this.docOptions[14].value && this.docOptions[15].value) {
            return this.docLabels.image || 'Image';
        }
        if (!this.docOptions[14].value) {
            return this.docLabels.image || 'Image';
        }
        return this.docLabels.item || 'Item';
    }

    hasDecoVendors(product) {
        return product.decoVendors && product.decoVendors.length > 0;
    }

    hasAddonCharges(product) {
        return product.addonCharges && product.addonCharges.length > 0;
    }

    displayCreditTerm(value) {
        const creditTerm = find(this.creditTerms, { value: value });
        if (!creditTerm) { return ''; }
        return creditTerm.label;
    }

    displaydocDefaultOptions(name) {
        const option = find(this.docDefaultOptions, {name: name});
        if (!option) return '';
        return option.description;
    }

}

import { Component, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { find } from 'lodash';
import { fieldLabel } from 'app/utils/utils';

@Component({
    selector   : 'antera-order-confirmation-modern',
    templateUrl: './order-confirmation-modern.component.html',
    styleUrls  : ['./order-confirmation-modern.component.scss'],
    animations : fuseAnimations
})
export class AnteraOrderConfirmationModernComponent
{
    @Input() order: any;
    @Input() docOptions: any[];
    @Input() docDefaultOptions: any[];
    @Input() logoUrl: string;
    @Input() lineItems: any[];
    @Input() docLabels: any;
    @Input() isAdmin = false;
    @Input() paymentList: any[] = [];
    @Input() docSettings: any;
    @Input() creditTerms: any[] = [];
    @Input() sysConfig: any;
    @Input() fields = [];
    @Input() accountFields = [];
    @Input() shipInfoList = [];
    sysconfigOrderFormCostDecimalUpto: string;
    sysconfigOrderFormQtyDecimalUpto: string;
    sysconfigOrderFormTotalDecimalUpto: string;

    fieldLabel = fieldLabel;

    constructor()
    {

    }

    ngOnInit(){
        this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.sysConfig.sysconfigOrderFormCostDecimalUpto;
        this.sysconfigOrderFormQtyDecimalUpto = '1.0-' + this.sysConfig.sysconfigOrderFormQtyDecimalUpto;
        this.sysconfigOrderFormTotalDecimalUpto = '1.2-2';    
    }

    get paymentUrl(): string { 
        return window.location.origin + `/protected/payment.html?method=none&oId=${this.order.id}&amount=${this.order.finalGrandTotalPrice == '' ? '0' : this.order.finalGrandTotalPrice}`;
    }

    groupSizeQuantity(product){
        return product.sizeList.map(s => s.quantity + ' ' + s.size).join(', ');
    }

    checkValid(value){
        if (!value)
            return false;
        if (parseFloat(value) == 0)
            return false; 
        if (parseFloat(value) > 0)
            return true;
    }

    calculateSubTotal(){
        return this.calculateTotalPrice()  - 
               parseFloat(this.order.taxAmount) - 
               parseFloat(this.order.discount)
    }

    checkValidSubtotal(){
        return (parseFloat(this.order.finalGrandTotalPrice) - this.calculateSubTotal()) > 0;
    }

    calculateTotalPrice(){
        let totalPrice = 0;
        this.lineItems.forEach((product) => {
            totalPrice += parseFloat(product.price) * parseFloat(product.quantity);

            if (product.addonCharges) {
                product.addonCharges.forEach((addonCharge) => {
                    if (addonCharge.matchOrderQty)
                        totalPrice += parseFloat(addonCharge.price) * parseFloat(product.matchOrderQty);
                    else 
                        totalPrice += parseFloat(addonCharge.price) * parseFloat(addonCharge.quantity);
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
        const turnOnOffOptions= [this.docOptions[14].value, this.docOptions[15].value, this.docOptions[16].value];
        let countTrue = 0;
        turnOnOffOptions.forEach((option) => {
            if (option == true)
                countTrue += 1;
        });
        return countTrue;
    }

    getLabelForFirstColumn() {
        if (this.docOptions[14].value && this.docOptions[15].value)
            return this.docLabels.image || 'Image';
        if (!this.docOptions[14].value)
            return this.docLabels.image || 'Image';
        return this.docLabels.item || 'Item';
    }

    hasDecoVendors(product) {
        return product.decoVendors && product.decoVendors.length > 0;
    }

    hasAddonCharges(product) {
        return product.addonCharges && product.addonCharges.length > 0;
    }

    calculateBalanceAmount() {
        let paymentAmount = 0;
        this.paymentList.forEach((payment) => {
            paymentAmount += parseFloat(payment.amount);
        });
        return parseFloat(this.order.finalGrandTotalPrice) - paymentAmount;
    }

    displayCreditTerm(value) {
        const creditTerm = find(this.creditTerms, {value: value});
        if (!creditTerm) return '';
        return creditTerm.label;
    }

    displaydocDefaultOptions(name) {
        const option = find(this.docDefaultOptions, {name: name});
        if (!option) return '';
        return option.description;
    }
}

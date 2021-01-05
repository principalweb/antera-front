import { Component, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DocumentsService } from '../../../core/services/documents.service';
import * as moment from 'moment';
import { find } from 'lodash';
import { fieldLabel } from 'app/utils/utils';


@Component({
    selector   : 'antera-invoice-modern',
    templateUrl: './invoice-modern.component.html',
    styleUrls  : ['./invoice-modern.component.scss'],
    animations : fuseAnimations
})
export class AnteraInvoiceModernComponent
{
    @Input() invoice: any;
    @Input() docOptions: any[];
    @Input() docDefaultOptions: any[];
    @Input() logoUrl: string;
    @Input() lineItems: any[];
    @Input() docLabels: any;
    @Input() paymentList: any[] = [];
    @Input() invoiceDate: any;
    @Input() isAdmin = false;
    @Input() creditTerms: any[] = [];
    @Input() sysConfig: any;
    @Input() fields = [];
    @Input() accountFields = [];  
    @Input() shipInfoList = [];
    sysconfigOrderFormCostDecimalUpto: string;
    sysconfigOrderFormQtyDecimalUpto: string;
    sysconfigOrderFormTotalDecimalUpto: string;

    today: number = Date.now();
    loading = false;

    fieldLabel = fieldLabel;

    constructor(
        private documentService: DocumentsService
    )
    {

    }

    ngOnInit(){
        this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.sysConfig.sysconfigOrderFormCostDecimalUpto;
        this.sysconfigOrderFormQtyDecimalUpto = '1.0-' + this.sysConfig.sysconfigOrderFormQtyDecimalUpto;
        this.sysconfigOrderFormTotalDecimalUpto = '1.2-2';  
        console.log(this.sysconfigOrderFormCostDecimalUpto);
        console.log(this.sysconfigOrderFormQtyDecimalUpto);
    }

    get paymentUrl(): string { 
        return window.location.origin + `/protected/payment.html?method=none&oId=${this.invoice.id}&amount=${this.invoice.finalGrandTotalPrice == '' ? '0' : this.invoice.finalGrandTotalPrice}`;
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
        return this.calculateTotalPrice() - 
               parseFloat(this.invoice.taxAmount) - 
               parseFloat(this.invoice.discount)
    }

    checkValidSubtotal(){
        return (this.calculateTotalPrice() - this.calculateSubTotal()) > 0;
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
        return parseFloat(this.invoice.finalGrandTotalPrice) - paymentAmount;
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

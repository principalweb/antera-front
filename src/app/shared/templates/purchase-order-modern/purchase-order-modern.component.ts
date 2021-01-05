import { Component, Input, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { find } from 'lodash';
import { fieldLabel } from 'app/utils/utils';

@Component({
    selector   : 'antera-purchase-order-modern',
    templateUrl: './purchase-order-modern.component.html',
    styleUrls  : ['./purchase-order-modern.component.scss'],
    animations : fuseAnimations

})
export class AnteraPurchaseOrderModernComponent implements OnInit 
{
    @Input() po: any;
    @Input() docOptions: any[];
    @Input() docDefaultOptions: any[];
    @Input() logoUrl: string;
    @Input() lineItems: any[];
    @Input() docLabels: any;
    @Input() isAdmin = false;
    @Input() creditTerms: any[] = [];
    @Input() sysConfig: any;
    @Input() fields = [];

    sysconfigOrderFormCostDecimalUpto: string;
    sysconfigOrderFormQtyDecimalUpto: string;
    sysconfigOrderFormTotalDecimalUpto: string;
    vendorAccountDetails: any;
    gstTaxDetailsOnPo: any;
    fieldLabel = fieldLabel;

    constructor(private api: ApiService)
    {

    }

    ngOnInit() {
        this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.sysConfig.sysconfigOrderFormCostDecimalUpto;
        this.sysconfigOrderFormQtyDecimalUpto = '1.0-' + this.sysConfig.sysconfigOrderFormQtyDecimalUpto;
        this.sysconfigOrderFormTotalDecimalUpto = '1.2-2';    

        this.api.getAccountDetails(this.lineItems[0].lineItem.vendorId)
            .subscribe((res: any) => {
                this.vendorAccountDetails = res;
            });
        this.gstTaxDetailsOnPo = find(this.po.gstTaxDetailsOnPo, {vendorId: this.lineItems[0].lineItem.vendorId});

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

    getTotalCostPO(){
        let totalCost = 0;
        for (const product of this.lineItems) {
            totalCost += parseFloat(product.cost) * parseFloat(product.quantity);
            if (!product.addonCharges) break;  
            product.addonCharges.forEach((addonCharge) => {
                if (addonCharge.matchOrderQty == '1')
                    totalCost += parseFloat(addonCharge.cost) * parseFloat(product.matchOrderQty);
                else 
                    totalCost += parseFloat(addonCharge.cost) * parseFloat(addonCharge.quantity);
            });
        }
        if(this.gstTaxDetailsOnPo.gstTaxTotalOnPo){
            totalCost = totalCost + parseFloat(this.gstTaxDetailsOnPo.gstTaxTotalOnPo);
        }        
        return totalCost;
    }

    calculateSubTotal(){
        return this.getTotalCostPO() - 
               parseFloat(this.po.taxAmount) - 
               parseFloat(this.po.discount)
    }

    checkValidSubtotal(){
        return (this.getTotalCostPO() - this.calculateSubTotal()) > 0;
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

    cellClass(product) {
        return {'first-line': this.hasAddonCharges(product)};
    }

    displayCreditTerm(value) {
        const creditTerm = find(this.creditTerms, {value: value});
        if (!creditTerm) return '';
        return creditTerm.label;
    }

    hasPONotes() {
        for (const lineItem of this.po.lineItems) {       
            if(lineItem.vendorPONote && lineItem.vendorPONote != '' && lineItem.vendorName == this.lineItems[0].lineItem.vendorName){
                return true;               
            }
        }
        return false;
    }


    displaydocDefaultOptions(name) {
        const option = find(this.docDefaultOptions, {name: name});
        if (!option) return '';
        return option.description;
    }

}

import { Component, Input, ViewEncapsulation, Output, EventEmitter, OnInit } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DocumentsService } from '../../../core/services/documents.service';
import { find } from 'lodash';
import * as moment from 'moment';
import { fieldLabel } from 'app/utils/utils';


@Component({
    selector   : 'antera-art-proof-modern',
    templateUrl: './art-proof-modern.component.html',
    styleUrls  : ['./art-proof-modern.component.scss'],
    animations : fuseAnimations
})
export class AnteraArtProofModernComponent implements OnInit
{
    @Input() order: any;
    @Input() docOptions: any[];
    @Input() docDefaultOptions: any[];
    @Input() logoUrl: string;
    @Input() lineItems: any[];
    @Input() isAdmin = false;
    @Input() docSettings: any;
    @Input() fields = [];
    @Input() accountFields = [];
    @Input() shipInfoList = [];
    today: number = Date.now();
    loading = false;
    approveUrl = '';
    approveWithChangesUrl = '';
    declineUrl = '';
    termAndConditions = '';
    fieldLabel = fieldLabel;

    constructor(
        private documentService: DocumentsService
    )
    {

    }

    ngOnInit(){
      this.docSettings = (typeof this.docSettings === 'undefined' ? {artworkProofFax: '', artworkProofEmailAddress: ''} : this.docSettings);
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
               parseFloat(this.order.taxAmount) - 
               parseFloat(this.order.discount)
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

    hasDecoVendors(product) {
        return product.decoVendors && product.decoVendors.length > 0;
    }

    hasAddonCharges(product) {
        return product.addonCharges && product.addonCharges.length > 0;
    }

    groupDecoLocations(vendors) {
        return vendors.map(decoVendor => decoVendor.decoLocation).join(', ');
    }

    isProductIncludeVendors(index) {
        const product = this.lineItems[index];
        if (!product)
            return false;
        return product.decoVendors && product.decoVendors.length > 0;
    }
    displaydocDefaultOptions(name) {
        const option = find(this.docDefaultOptions, {name: name});
        if (!option) return '';
        return option.description;
    }
}

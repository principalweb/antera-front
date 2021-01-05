import { Component, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { MatrixRow } from 'app/models';
import { find, filter } from 'lodash';
import { fieldLabel } from 'app/utils/utils';

@Component({
    selector   : 'antera-work-order-modern',
    templateUrl: './work-order-modern.component.html',
    styleUrls  : ['./work-order-modern.component.scss'],
    animations : fuseAnimations
})
export class AnteraWorkOrderModernComponent
{
    @Input() order: any;
    @Input() logoUrl: string;
    @Input() isAdmin = false;
    @Input() sysConfig: any;
    @Input() docOptions: any[];
    @Input() docDefaultOptions: any[];
    @Input() docLabels: any;
    @Input() decoType = '';
    @Input() fields = [];
    @Input() accountFields = [];
    @Input() shipInfoList = [];
    sysconfigOrderFormCostDecimalUpto: string;
    sysconfigOrderFormQtyDecimalUpto: string;
    sysconfigOrderFormTotalDecimalUpto: string;

    loading = false;

    products = [];
    decoVendors = [];
    decoDescription = '';
    fieldLabel = fieldLabel;

    constructor(private api: ApiService) {

    }

    ngOnInit(){
        this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.sysConfig.sysconfigOrderFormCostDecimalUpto;
        this.sysconfigOrderFormQtyDecimalUpto = '1.0-' + this.sysConfig.sysconfigOrderFormQtyDecimalUpto;
        this.sysconfigOrderFormTotalDecimalUpto = '1.2-2';

        this.fetchProductsDecoratedBySelectedDecoType();
    }

    fetchProductsDecoratedBySelectedDecoType() {
        const products = [];
        this.order.lineItems.forEach((lineItem: any) => {

            if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
                lineItem.matrixRows = [ new MatrixRow({}) ];
            }

            lineItem.matrixRows.forEach(row => {
                const newRow = {
                    productName: lineItem.productName,
                    itemNo: lineItem.itemNo,
                    quantity: row.quantity,
                    color: row.color,
                    size: row.size,
                    productId: lineItem.productId,
                    matrixUpdateId: row.matrixUpdateId,
                }
                products.push(newRow);
            });
        });

        const decoVendors = [];
        this.order.lineItems.forEach((lineItem: any) => {

            if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
                lineItem.matrixRows = [ new MatrixRow({}) ];
            }

            lineItem.decoVendors.forEach(v => {
                const newRow = {
                    designNo: v.designModal,
                    image: v.decorationDetails[0].variationImagesThumbnail[0],
                    threadPms: v.decorationDetails[0].decoDesignVariation.design_color_thread_pms,
                    decoLocation: v.decoLocation,
                    decoType: v.decoType,
                    decoTypeName: v.decoTypeName,
                    quantity: v.quantity,
                    decoVendorId: v.vendorId,
                    decoVendorName: v.vendorName,
                    matrixId: v.decorationDetails[0].matrixId,
                    decoColor: v.decorationDetails[0].decoColor,
                    decoDescription: v.decorationDetails[0].decoDescription,
                    addonCharges: v.addonCharges
                }
                decoVendors.push(newRow);
            });
        });

        this.decoVendors = filter(decoVendors, {decoType: this.decoType});
        products.forEach((row) => {
            for (const v of this.decoVendors) {
                if (row.matrixUpdateId == v.matrixId)
                {
                    this.products.push(row);
                }
            }
        });
    }

    displaydocDefaultOptions(name) {
        const option = find(this.docDefaultOptions, {name: name});
        if (!option) return '';
        return option.description;
    }

}

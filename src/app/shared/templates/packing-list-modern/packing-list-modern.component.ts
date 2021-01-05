import { Component, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { find, each } from 'lodash';
import { ApiService } from 'app/core/services/api.service';
import { MatrixRow } from 'app/models';
import { Observable } from 'rxjs';
import { fieldLabel } from 'app/utils/utils';

@Component({
    selector   : 'antera-packing-list-modern',
    templateUrl: './packing-list-modern.component.html',
    styleUrls  : ['./packing-list-modern.component.scss'],
    animations : fuseAnimations
})
export class AnteraPackingListModernComponent
{
    @Input() order: any;
    @Input() logoUrl: string;
    @Input() lineItems: any[];
    @Input() isAdmin = false;
    @Input() sysConfig: any;
    @Input() docOptions: any[];
    @Input() docDefaultOptions: any[];
    @Input() docLabels: any;
    @Input() fields = [];
    @Input() accountFields = [];
    @Input() shipInfoList = [];
    sysconfigOrderFormCostDecimalUpto: string;
    sysconfigOrderFormQtyDecimalUpto: string;
    sysconfigOrderFormTotalDecimalUpto: string;

    today: number = Date.now();
    loading = false;
    totalQuantiy = 0;

    products = [];
    fieldLabel = fieldLabel;

    constructor(private api: ApiService) {

    }

    ngOnInit(){
        this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.sysConfig.sysconfigOrderFormCostDecimalUpto;
        this.sysconfigOrderFormQtyDecimalUpto = '1.0-' + this.sysConfig.sysconfigOrderFormQtyDecimalUpto;
        this.sysconfigOrderFormTotalDecimalUpto = '1.2-2';

        this.fetchPickListProducts();
    }
    
    fetchPickListProducts() {

        this.products = [];
        this.order.lineItems.forEach((lineItem: any) => {

            if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
                lineItem.matrixRows = [ new MatrixRow({}) ];
            }
            lineItem.matrixRows.forEach(row => {
                if(lineItem.hideLine != '1'){
                    this.totalQuantiy += (row.unitQuantity * 1);
                }
                const newRow = {
                    ...row,
                    productName: lineItem.productName,
                    itemNo: lineItem.itemNo,
                    productId: lineItem.productId,
                    hideLine: lineItem.hideLine,
                    showAttribSize: lineItem.showAttribSize,
                    showAttribColor: lineItem.showAttribColor,
                };
                this.products.push(newRow);
            });
        });
    }  

    displaydocDefaultOptions(name) {
        const option = find(this.docDefaultOptions, {name: name});
        if (!option) return '';
        return option.description;
    }

}

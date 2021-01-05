import { Component, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { find, each } from 'lodash';
import { ApiService } from 'app/core/services/api.service';
import { MatrixRow } from 'app/models';
import { fieldLabel } from 'app/utils/utils';
import { Observable, of } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

@Component({
    selector   : 'antera-pick-list-modern',
    templateUrl: './pick-list-modern.component.html',
    styleUrls  : ['./pick-list-modern.component.scss'],
    animations : fuseAnimations
})
export class AnteraPickListModernComponent
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
            const products = [];
            lineItem.matrixRows.forEach(row => {
                const newRow = {
                    productName: lineItem.productName,
                    itemNo: lineItem.itemNo,
                    quantity: row.quantity,
                    color: row.color,
                    size: row.size,
                    itemSku: row.itemSku,
                    site: '',
                    bin: '',
                    productId: lineItem.productId
                }
                products.push(newRow);
            });

            let data = of(products);
            data.pipe(
                map((row: any) => {
                    const payload = {
                        "offset": 0,
                        "limit": 50,
                        "order": "sku",
                        "orient": "asc",
                        "id": "",
                        "term": {
                            "productId": row.productId,
                            "inhouseId": "",
                            "sku": row.itemSku,
                            "size": row.size,
                            "color": row.color,
                            "site": "",
                            "bin": "",
                            "quantity": row.quantity,
                            "dateModified": "",
                            "min": "",
                            "max": ""
                        },
                        "type": true,
                        "completed": false
                    };
                    return this.api.post('/content/get-product-inventory-list', payload).pipe(
                        map((res: any[]) => {
                            if (res && res.length > 0)
                            {
                                row.site = res[0].site;
                                row.bin = res[0].bin;
                                return row;
                            }
                            return row;
                        })
                    );

                })
            ).subscribe(row => {
                this.products.push(row);
            });
        });
    }  

    displaydocDefaultOptions(name) {
        const option = find(this.docDefaultOptions, {name: name});
        if (!option) return '';
        return option.description;
    }

}

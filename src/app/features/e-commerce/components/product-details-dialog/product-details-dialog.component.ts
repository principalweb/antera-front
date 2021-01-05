import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { ProductDetails } from '../../../../models';

@Component({
    selector: 'app-product-details-dialog',
    templateUrl: './product-details-dialog.component.html',
    styleUrls: ['./product-details-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ProductDetailsDialogComponent {

    dialogTitle: string;
    product: ProductDetails;

    constructor(
        public dialogRef: MatDialogRef<ProductDetailsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        
        this.dialogTitle = 'Product Details';
        this.product = new ProductDetails(data.product);
    }

}

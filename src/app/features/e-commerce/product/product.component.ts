import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';






import { Subscription } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { EcommerceProductService } from './product.service';
import { ProductDetails } from '../../../models';

@Component({
    selector     : 'fuse-e-commerce-product',
    templateUrl  : './product.component.html',
    styleUrls    : ['./product.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseEcommerceProductComponent implements OnInit, OnDestroy
{
    product = new ProductDetails();
    pageType: string;
    loading = false;

    onProductChanged: Subscription;
    isSource = false;

    constructor(
        private productService: EcommerceProductService,
        public dialog: MatDialog,

    ) { }

    ngOnInit()
    {
        // Subscribe to update product on changes
        this.onProductChanged =
            this.productService.onProductChanged
                .subscribe(product => { 
                    this.product = product;
                    if (product.productId) {
                        this.pageType = 'edit';
                    } else {
                        this.pageType = 'new';
                    }
                    this.isSource = this.product.source != '9' ? false : true;
                });
    }

    ngOnDestroy( ){
        this.onProductChanged.unsubscribe();
    }

}

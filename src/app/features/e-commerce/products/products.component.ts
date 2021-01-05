import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { EcommerceProductsService } from './products.service';
import { FormControl } from '@angular/forms';
import { ProductListComponent } from './product-list/product-list.component';
import { Subscription } from 'rxjs';
import { ProductImagesComponent } from './product-images/product-images.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { ProductStoresDialogComponent } from '../components/product-stores-dialog/product-stores-dialog.component';
import { ProductMassUpdateComponent } from '../components/product-mass-update/product-mass-update.component';
import { isEmpty,sortBy } from 'lodash';
import { ProductUniversalSearchComponent } from '../components/product-universal-search/product-universal-search.component';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
    selector   : 'fuse-e-commerce-products',
    templateUrl: './products.component.html',
    styleUrls  : ['./products.component.scss'],
    animations : fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class FuseEcommerceProductsComponent implements OnInit
{
    viewMode = 'product-images';
    searchInput: FormControl;
    onViewChangedSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    @ViewChild(ProductListComponent) productListComponent: ProductListComponent;
    @ViewChild(ProductImagesComponent) productImagesComponent: ProductImagesComponent;

    constructor(
        public productsService: EcommerceProductsService,
        public dialog: MatDialog,
        private msg: MessageService,
        private apiService: ApiService
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
        this.onViewChangedSubscription =
            this.productsService.onViewChanged
                .subscribe(view => {
                    this.viewMode = view;
                    this.clearSearch();
                });
    }

    ngAfterViewInit() {

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
                // Prevent search if keyword is less than 3
                if (searchText.length < 3 && searchText.length > 0)
                    return;

                if (this.viewMode === 'product-list')
                {
                    // Prevent search if filter fields are not empty
                    if (!isEmpty(this.productsService.payload.term))
                        return;

                    this.productListComponent.loading = true;
                }
                else{
                    // Prevent search if filter fields are not empty
                    if (!isEmpty(this.productsService.payload.term))
                        return;
                    this.productImagesComponent.loading = true;
                }
                this.productsService.onSearchTextChanged.next(searchText);
            });
    }

    clearSearch(){

        if (this.searchInput.value.length > 0)
        this.searchInput.setValue('');
    }

    changeView(ev) {
        this.productsService.changeView(ev.value);
    }

    clearFilters(){
        this.searchInput.setValue('');
        if (this.viewMode === 'product-list')
            this.productListComponent.clearFilters();
        else
            this.productImagesComponent.clearFilters();
    }

    massUpdate() {
        if (this.productsService._selection.length > 0 ) {
            let selectedProductList = this.productsService._selection.map(sId => {
                return {id: sId};
            })
            let dialogRef = this.dialog.open(ProductMassUpdateComponent, {
                panelClass: 'app-product-mass-update',
                data: selectedProductList
            });
        } else {
            this.msg.show('Please select products to update.', 'error');
        }
    }

    tagProductsToStores() {
        if (this.productsService._selection.length > 0 ) {
            this.productsService.messageQueue.next({
                type: 'set-loading',
                extra: true
            });

            this.apiService.getStoreList().pipe(
                map((res: any) => res && res.StoreArray ? sortBy(res.StoreArray, 'store' ) : [])
            ).subscribe((storeList: any[]) => {
                    this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                    });
                    let dialogRef = this.dialog.open(ProductStoresDialogComponent, {
                        panelClass: 'product-stores-dialog',
                        data: { storeList: storeList, title: 'Select Tags'}
                    });
                    dialogRef.afterClosed()
                        .subscribe(data => {
                            if (data && data.selectedStoreList && data.selectedStoreList.length > 0){
                                let selectedProductList = this.productsService._selection.map(sId => {
                                    return {id: sId};
                                })
                                this.apiService.tagProductsToStores({
                                    StoreArray: data.selectedStoreList,
                                    ProductArray: selectedProductList
                                })
                                .subscribe((res: any) => {
                                    console.log(res);
                                    if (res){
                                        if (res.msg.length > 0) {
                                            this.msg.show(res.msg[0], 'error');
                                        } else {
                                            this.msg.show('Successfully tagged.', 'success');
                                        }
                                    }
                                    else {
                                        this.msg.show('Unknown Error!', 'error');
                                    }
                                }, (err) => {
                                    this.msg.show(err.message, 'error');
                                });
                            }
                            else {
                                this.msg.show('You have not selected any tag.', 'error');
                            }
                        });

                },(err) => {
                    this.msg.show(err.message, 'error');
                    this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                    });
                });
        } else {
            this.msg.show('Please select the products you want to tag.', 'error');
        }
    }

    pushProductsToStores() {
        if (this.productsService._selection.length > 0 )
        {
            this.productsService.messageQueue.next({
                type: 'set-loading',
                extra: true
            });

            this.apiService.getStoreList().pipe(
                    map((res: any) => res && res.StoreArray ? sortBy(res.StoreArray, 'store' ) : [])
                )
                .subscribe((storeList: any[]) => {
      
                    this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                    });
                    let dialogRef = this.dialog.open(ProductStoresDialogComponent, {
                        panelClass: 'product-stores-dialog',
                        data: { storeList: storeList, title: 'Select Stores'}
                    });
                    dialogRef.afterClosed()
                        .subscribe(data => {
                            if (data && data.selectedStoreList && data.selectedStoreList.length > 0){
                                let selectedProductList = this.productsService._selection.map(sId => {
                                    return {id: sId};
                                })
                                this.apiService.pushProductsToStores({
                                    StoreArray: data.selectedStoreList,
                                    ProductArray: selectedProductList
                                })
                                .subscribe((res: any) => {
                                    console.log(res);
                                    if (res){
                                        if (res.msg.length > 0)
                                            this.msg.show(res.msg[0], 'error');
                                        else
                                            this.msg.show('Successfully assigned to stores selected.', 'success');
                                    }
                                    else {
                                        this.msg.show('Unknown Error!', 'error');
                                    }
                                }, (err) => {
                                    this.msg.show(err.message, 'error');
                                });
                            }
                            else {
                                this.msg.show('You have not selected any stores to push products.', 'error');
                            }
                        });

                },(err) => {
                    this.msg.show(err.message, 'error');
                    this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                    });
                });
        }
        else {
            this.msg.show('Please select products to push to stores.', 'error');
        }
    }

    openAdvanceSearchDialog() {
        let searchRef = this.dialog.open(ProductUniversalSearchComponent, {
            panelClass: 'product-universal-search',
            data: {
                addTo: 'product',
                parent: this
            }
        });
        searchRef.componentInstance.afterFinished.subscribe((res) => {
            if (this.productListComponent) {
                this.productListComponent.fetchList();
            } else if (this.productImagesComponent) {
                this.productImagesComponent.fetchList();
            }
        });
    }

    cloneSelectedProducts(){

        if (this.productsService._selection.length > 0 )
        {
            this.productsService.messageQueue.next({
                type: 'set-loading',
                extra: true
            });
            this.productsService.cloneSelectedProducts()
                .subscribe((res: any) => {
                    if(res.msg) {
                        this.msg.show(res.msg, 'error');
                    } else {
                        this.msg.show('These items has been cloned', 'success');
                    }
                    this.productsService.deselectAll();
                    this.productsService.messageQueue.next({
                        type: 'delete-success'
                    });
                }, (err) => {
                    this.msg.show(err.message, 'error');
                    this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                    });
                });
        }
        else{
            this.msg.show('Please select products to clone.', 'error');
        }
    }

    recoverSelectedProducts() {

        if (this.productsService._selection.length > 0) {

            this.productsService.messageQueue.next({
                type: 'set-loading',
                extra: true
            });

            this.productsService.recoverSelectedProducts()
                .subscribe((res: any) => {
                    this.msg.show('Selected items hase been enabled. If some items were not enabled and permissions are enabled please confirm your access level.', 'success');


                    this.productsService.deselectAll();
                    this.productsService.messageQueue.next({
                        type: 'delete-success'
                    });

                }, (err) => {
                    this.msg.show(err.message, 'error');
                    this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: false
                    });
                });
        }
                
    }

    deleteSelectedProducts(){

        if (this.productsService._selection.length > 0 )
        {
            this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });

            this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to disable all selected Products?';

            this.confirmDialogRef.afterClosed().subscribe(result => {
                if ( result )
                {
                    this.productsService.messageQueue.next({
                        type: 'set-loading',
                        extra: true
                    });

                    this.productsService.deleteSelectedProducts()
                        .subscribe((res: any) => {
                            if (this.productsService.isDeleted) {
                                this.msg.show('The item has been deleted permanently.', 'success');

                            }
                            else {
                                this.msg.show('Items have been disabled. If some items were not disabled and permissions are enabled please confirm your access level or the items are on orders.', 'success');

                            }

                            this.productsService.deselectAll();
                            this.productsService.messageQueue.next({
                                type: 'delete-success'
                            });

                        }, (err) => {
                            this.msg.show(err.message, 'error');
                            this.productsService.messageQueue.next({
                                type: 'set-loading',
                                extra: false
                            });
                        });
                }
                this.confirmDialogRef = null;
            });
        }
        else{
            this.msg.show('Please select activities to delete.', 'error');
        }
    }

    changeEQPorPreferredVendor() {
        if (this.productListComponent) {
            this.productListComponent.fetchList();
        } else if (this.productImagesComponent) {
            this.productImagesComponent.fetchList();
        }
    }
    showProducts(isDeleted) {
        this.productsService.isDeleted = isDeleted;
        this.changeEQPorPreferredVendor();
    }
}

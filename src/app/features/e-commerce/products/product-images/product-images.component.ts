import { Component, OnInit, ViewChild, ViewEncapsulation, Directive, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { EcommerceProductsService } from '../products.service';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { unionBy, find, findIndex } from 'lodash';
import { delay, distinctUntilChanged, switchMap, debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-product-images',
    templateUrl: './product-images.component.html',
    styleUrls: ['./product-images.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ProductImagesComponent implements OnInit, OnDestroy {
    @Input() disableItem = false;
    @Input() loading = false;

    displayedColumns = ['checkbox', 'productId', 'productName', 'inhouseId', 'store', 'vendorName', 'category', 'expirationDate', 'source', 'active', 'dateModified'];
    checkboxes: {};
    selectedCount = 0;
    selectedProducts: any[];
    sources = [];

    totalCount = 0;
    products: any[] = [];
    pageSize = 50;

    onProductsChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;
    onTotalCountChangedSubscription: Subscription;
    messageQueueSubscription: Subscription;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    productId = new FormControl('');
    productName = new FormControl('');
    active = new FormControl('');
    expirationDate = new FormControl('');
    dateCreated = new FormControl('');
    dateModified = new FormControl('');
    inhouseId = new FormControl('');

    stores = [];
    selectedStores = [];
    filteredStores = [];
    storeSearch = new FormControl('');
    vendors = [];
    selectedVendors = [];
    vendorSearch = new FormControl('');
    isLoading = false;
    selectedCategories = [];
    categories = [];
    categorySearch = new FormControl('');

    selectedProductSource = '';

    constructor(
        private productsService: EcommerceProductsService,
        private api: ApiService,
        private router: Router
    ) {

        this.onProductsChangedSubscription =
            this.productsService.onProductsChanged.subscribe(products => {
                this.loading = false;
                this.checkboxes = {};
                this.selectedCount = 0;
                this.products = products;
            });

        this.onTotalCountChangedSubscription =
            this.productsService.onTotalCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.totalCount = total;
            });

        this.onSelectionChangedSubscription =
            this.productsService.onSelectionChanged.subscribe(selection => {
                const cbs = {};
                selection.forEach(id => cbs[id] = true);
                this.checkboxes = cbs;
                this.selectedCount = selection.length;
            });

        this.messageQueueSubscription =
            this.productsService.messageQueue.subscribe(({ type, extra }) => {

                switch(type) {
                    case 'clear-filters':
                        this.clearFilters();
                        break;

                    case 'set-loading':
                        this.loading = extra;
                        break;

                    case 'delete-success':
                        this.loading = false;
                        this.fetchList();
                        break;
                }

            });
    }

    ngOnInit() {
        
        this.productsService.deselectAll();
        const terms = this.productsService.payload.term;
        if(localStorage.getItem("products_productId") !== "null") {
            this.productId = new FormControl(localStorage.getItem("products_productId"));
        } else {
            this.productId = new FormControl(terms.productId);
        }
        if(localStorage.getItem("products_productName") !== "null") {
            this.productName = new FormControl(localStorage.getItem("products_productName"));
        } else {
            this.productName = new FormControl(terms.productName);
        }
        if(localStorage.getItem("products_inhouseId") !== "null") {
            this.inhouseId = new FormControl(localStorage.getItem("products_inhouseId"));
        } else {
            this.inhouseId = new FormControl(terms.productName);
        }
        
        this.active = new FormControl(terms.shell);
        this.dateCreated = new FormControl(terms.datedCreated);
        this.dateModified = new FormControl(terms.dateModified);

        this.sources = this.productsService.sources;
        this.productsService.nonCategory = false;
        this.productsService.nonStore = false;
        this.selectedProductSource = this.productsService.payload.term.source;

        this.tillChanged(this.productId)
            .subscribe(val => {
                localStorage.setItem("products_productId",val);
                this.productsService.payload.term.productId = val;
            });

        this.tillChanged(this.dateCreated)
            .subscribe(val => {
                this.productsService.payload.term.datedCreated = val;
            });

        this.tillChanged(this.dateModified)
            .subscribe(val => {
                this.productsService.payload.term.dateModified = val;
            });

        this.tillChanged(this.productName)
            .subscribe(val => {
                localStorage.setItem("products_productName",val);
                this.productsService.payload.term.productName = val;
            });

        this.tillChanged(this.inhouseId)
            .subscribe(val => {
                localStorage.setItem("products_inhouseId",val);
                this.productsService.payload.term.inhouseId = val;
            });

        this.tillChanged(this.active)
            .subscribe(val => {
                this.productsService.payload.term.shell = val;
                this.fetchList();
            });

        this.tillChanged(this.expirationDate)
            .subscribe(val => {
                this.productsService.payload.term.expirationDate = val;
                this.fetchList();
            });
        this.storeSearch.valueChanges.pipe(
            distinctUntilChanged(),
        ).subscribe(val => {
            this.filteredStores =
                this.stores.filter(store =>
                    store.store.toLowerCase().indexOf(val.toLowerCase()) >=0
                );
        });

        this.vendorSearch.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(searchText => {
                this.isLoading = true;
                return (searchText == '') ? this.api.getVendorAutocomplete('a') : this.api.getVendorAutocomplete(searchText);
            })
        ).subscribe((vendors: any[]) => {
            this.isLoading = false;
            this.vendors = unionBy([
                ...this.selectedVendors,
                ...vendors
            ]);
        });

        this.categorySearch.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(searchText => {
                this.isLoading = true;
                let categoryTerm = {
                    "offset": 0,
                    "limit": "10",
                    "order": "catName",
                    "orient": "asc",
                    "term": {
                        "categoryName": (searchText == '') ? 'a' : searchText
                    },
                    "type": true,
                    "completed": false
                };
                return this.api.getProductCategoryList(categoryTerm)
            })
        ).subscribe((res: any) => {
            this.isLoading = false;
            this.categories = unionBy([
                ...this.selectedCategories,
                ...res.ProductCategoryArray
            ]);
        });
        this.getPreStoreSupplierCategoryList();
        this.fetchList();
    }

    ngOnDestroy() {
        this.onProductsChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
        this.messageQueueSubscription.unsubscribe();
    }

    filterByCategories() {
        localStorage.setItem("products_categories",JSON.stringify(this.selectedCategories))
        let selectedCategories = this.selectedCategories.map(category => {
            if (!category)
                return {};
            return {category: category.category};
        });
        this.productsService.nonCategory = false;
        if(selectedCategories) {
            if(find(selectedCategories.find(c => c.category == 'nonCategory'))) {
                selectedCategories = [];
                this.productsService.nonCategory = true;
            }
        }
        localStorage.setItem("products_categoryName",JSON.stringify(selectedCategories))
        this.productsService.payload.term.categoryName = selectedCategories;
        this.fetchList();
    }

    filterByVendors(){
        localStorage.setItem("products_vendors",JSON.stringify(this.selectedVendors))
        let selectedVendors = this.selectedVendors.map(vendor => {
            if (!vendor)
                return {};
            return {vendor: vendor.name};
        });
        localStorage.setItem("products_vendorNames",JSON.stringify(selectedVendors))
        this.productsService.payload.term.vendorName = selectedVendors;
        this.fetchList();
    }

    filterByStores() {
        localStorage.setItem("products_stores",JSON.stringify(this.selectedStores));
        let selectedStores = this.selectedStores.map(store => {
            if (!store)
                return {}
            return {store: store.store};
        });
        this.productsService.nonStore = false;
        if(selectedStores) {
            if(find(selectedStores.find(c => c == 'nonStore'))) {
                selectedStores = [];
                this.productsService.nonStore = true;
            }
        }
        localStorage.setItem("products_storeNames",JSON.stringify(selectedStores));
        this.productsService.payload.term.storeNames = selectedStores;
        this.fetchList();
    }

    // filterBySource() {
    //     let selectedStores = this.selectedStores.map(store => {
    //         return {store: store};
    //     });
    //     this.productsService.payload.term.storeNames = selectedStores;
    //     this.fetchList();
    // }

    onSelectedChange(productId) {
        this.productsService.toggleSelected(productId);
    }

    toggleAll(ev) {
        if (ev) {
            this.productsService.toggleSelectAll();
        }
    }

    getSourceLabel(sid) {
        const source = find(this.sources, { id: sid });
        if (source) {
            return source.name;
        } else {
            return '';
        }
    }

    paginate(ev) {
        this.productsService.payload.offset = ev.pageIndex;
        this.productsService.payload.limit = ev.pageSize;
        this.pageSize = ev.pageSize;
        this.loading = true;

        this.productsService.getProducts()
            .then(() => { });
    }

    resetPaginator() {
        if(this.paginator) {
            this.paginator.firstPage();
        }
        
        this.productsService.payload.offset = 0;
    }

    sortChange(ev) {
        this.productsService.payload.order = ev.active;
        if (ev.active === 'category')
            this.productsService.payload.order = 'categoryName';
        else if (ev.active === 'store')
            this.productsService.payload.order = 'storeNames';
        else if (ev.active === 'active')
            this.productsService.payload.order = 'disabled';
        this.productsService.payload.orient = ev.direction;
        this.productsService.payload.limit = this.pageSize;
        this.loading = true;

        this.resetPaginator();

        this.productsService.getProducts()
            .then(() => { });
    }


    fetchList() {
        this.loading = true;
        this.productsService.product_view = "product-images";
        this.productsService.payload.limit = this.pageSize;
        this.productsService.payload.term.source = this.selectedProductSource;
        localStorage.setItem("products_source", this.selectedProductSource);
        let isDeleted = "0";
        if (this.productsService.isDeleted)
            isDeleted = "1";

        localStorage.setItem("products_isDeleted", isDeleted);
        
        this.resetPaginator();
        Promise.all([
            this.productsService.getProducts(),
            this.productsService.getProductsCount()
        ]).then(() => {
            this.loading = false;
        });
    }

    tillChanged(ob) {
        return ob.valueChanges.pipe(
            debounceTime(200),
            distinctUntilChanged()
        );
    }


    clearFilters() {
        localStorage.setItem("products_productId","");
        localStorage.setItem("products_productName","");
        localStorage.setItem("products_storeNames","");
        localStorage.setItem("products_vendorNames","");
        localStorage.setItem("products_vendors","");
        localStorage.setItem("products_source","");
        localStorage.setItem("products_categoryName","");
        localStorage.setItem("products_stores","");
        localStorage.setItem("products_categories","");
        
        if (!this.loading && this.isFilterRequired()) {
            this.productId.setValue('');
            this.productName.setValue('');
            this.active.setValue('');
            this.dateCreated.setValue('');
            this.dateModified.setValue('');
            this.active.setValue('0');
            this.inhouseId.setValue('');
            this.selectedStores = [];
            this.selectedVendors = [];
            this.vendors = [];
            this.selectedCategories = [];
            this.categories = [];
            this.selectedStores = [];
            this.selectedProductSource = "";
            this.expirationDate.setValue('');
            this.productsService.resetFilter();
            this.fetchList();
            this.getPreStoreSupplierCategoryList();
        }
    }

    goto(pid) {
        if (!this.disableItem) {
            if (!this.productsService.productSource)
                this.router.navigate(['/e-commerce/products/', pid]);
            else
                this.router.navigate(['/e-commerce/sources/', pid]);
        }
    }

    isFilterRequired() {
        if (this.productId.value == '' &&
            this.productName.value == '' &&
            this.inhouseId.value == '' &&
            this.selectedVendors.length == 0 &&
            this.selectedCategories.length == 0 &&
            this.active.value == '' &&
            this.dateCreated.value == '' &&
            this.dateModified.value == '' &&
            this.selectedStores.length == 0)
            return false;
        return true;
    }

    autoUpdateToggled(ev, product) {
        ev.stopPropagation();
        if (product.shell == '0')
            product.shell = '1';
        else
            product.shell = '0';

        this.loading = true;
        this.api.updateProductShell(product.id, product.shell)
            .subscribe(
                () => { this.loading = false; },
                () => { this.loading = false; }
            )
    }

    clearCategorySearch() {
        this.categorySearch.setValue('');
    }

    clearVendorSearch() {
        this.vendorSearch.setValue('');
    }

    clearStoreSearch() {
        this.storeSearch.setValue('');
    }

    getPreStoreSupplierCategoryList() {
        // Reload pre list afte clering filter
        this.api.getVendorAutocomplete('a')
        .subscribe((vendors: any[]) => {
            this.vendors = vendors;
            if(this.vendors.length > 0) {
                if(localStorage.getItem("products_vendors") !== null && localStorage.getItem("products_vendors") !== "") {
                    const jsonArr = JSON.parse(localStorage.getItem("products_vendors"))
                    var result = this.vendors.filter(function(wendor1){
                        return jsonArr.some(function(wendor2){
                            return wendor1.id === wendor2.id;          // assumes unique id
                        });
                    });
                    this.selectedVendors = result
                }
            }
            
        });

        this.api.getProductCategoryList({
            "offset": 0,
            "limit": "10",
            "order": "catName",
            "orient": "asc",
            "term": {
                "categoryName": "a"
            },
            "type": true,
            "completed": false
        })
            .subscribe((res: any) => {
                this.categories = res.ProductCategoryArray;
                
                if(this.categories.length > 0) {
                    
                   if(localStorage.getItem("products_categories") !== null && localStorage.getItem("products_categories") !== "") {
                    const jsonArr = JSON.parse(localStorage.getItem("products_categories"))
                    
                        var result = this.categories.filter(function(category1){
                            return jsonArr.some(function(category2){
                                return category1.id === category2.id;       
                            });
                        });
                        this.selectedCategories = result
                    }                   
                }
            });

        this.productsService.getProductStoreList()
            .then((stores: any[]) => {
                this.stores = stores;
                this.filteredStores = this.stores;

                if(this.filteredStores.length > 0) {
                    
                    if(localStorage.getItem("products_stores") !== null && localStorage.getItem("products_stores") !== "") {
                        const jsonArr = JSON.parse(localStorage.getItem("products_stores"));
                        var result = this.filteredStores.filter(function(store1){
                            return jsonArr.some(function(store2){
                                return store1.id === store2.id; 
                            });
                        });
                        this.selectedStores = result
                    }
                    
                }
            });
    }
}

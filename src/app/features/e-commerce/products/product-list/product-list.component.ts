import { Component, Input, OnInit, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Subscription, Observable } from 'rxjs';
import { find, unionBy, map } from 'lodash';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { EcommerceProductsService } from '../products.service';
import { distinctUntilChanged, switchMap, delay } from 'rxjs/operators';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ProductListComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() disableRow = false;

    dataSource: ProductsDataSource | null;
    displayedColumns = ['checkbox', 'productId', 'image', 'productName', 'inhouseId', 'store', 'vendorName', 'category', 'expirationDate', 'source', 'active', 'dateModified',"productType"];
    checkboxes: {};
    selectedCount = 0;
    selectedProducts: any[];
    loading = false;
    pageSize = 10;
    sources = [];
    loaded = () => {
        this.loading = false;
    }

    mapField = (field) => (list) => map(list, item => item[field]);
    categorySearch = new FormControl('');
    categories = [];
    vendorSearch = new FormControl('');
    vendors = [];
    filteredStores = [];
    stores = [];
    storeSearch = new FormControl('');
    selectedProductSource = '';

    onProductsChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;
    messageQueueSubscription: Subscription;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    filterForm: FormGroup;
    shell = new FormControl('');
    expirationDate = new FormControl('');
    productType = new FormControl('');

    constructor
        (
            private productsService: EcommerceProductsService,
            private router: Router,
            private fb: FormBuilder,
            private api: ApiService
        ) {

        this.onProductsChangedSubscription =
            this.productsService.onProductsChanged.subscribe(products => {
                if (!products) {
                    return;
                }
                this.loading = false;
                this.checkboxes = {};
                products.map(product => {
                    this.checkboxes[product.id] = false;
                });
            });

        this.onSelectionChangedSubscription =
            this.productsService.onSelectionChanged.subscribe(selection => {
                for (const id in this.checkboxes) {
                    if (!this.checkboxes.hasOwnProperty(id)) {
                        continue;
                    }
                    this.checkboxes[id] = selection.includes(id);
                }
                this.selectedCount = selection.length;
            });

        this.messageQueueSubscription =
            this.productsService.messageQueue.subscribe(({ type, extra }) => {
                switch (type) {
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

        this.sources = this.productsService.sources;
        this.selectedProductSource = this.productsService.payload.term.source;
        this.filterForm = this.fb.group(this.productsService.payload.term);

        this.categorySearch.valueChanges.pipe(
            distinctUntilChanged(),
            switchMap(searchText => {
                this.loading = true;
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
            this.loading = false;
            this.categories = unionBy([
                ...this.filterForm.value.categoryName,
                ...res.ProductCategoryArray.map(category => { return { category: category.category }; })
            ]);
        });

        this.vendorSearch.valueChanges.pipe(
            distinctUntilChanged(),
            switchMap(searchText => {
                this.loading = true;
                return (searchText == '') ? this.api.getVendorAutocomplete('a') : this.api.getVendorAutocomplete(searchText);
            })
        ).subscribe((vendors: any[]) => {
            this.loading = false;
            this.vendors = unionBy([
                ...this.filterForm.value.vendorName,
                ...vendors.map(vendor => { return { vendor: vendor.name }; })
            ]);
        });

        this.storeSearch.valueChanges.pipe(
            distinctUntilChanged(),
        ).subscribe(val => {
            this.filteredStores =
                this.stores.filter(store =>
                    store.store.toLowerCase().indexOf(val.toLowerCase()) >= 0
                );
        });

        this.shell.valueChanges.pipe(
            distinctUntilChanged(),
        ).subscribe(val => {
            this.fetchList();
        });
        this.expirationDate.valueChanges.pipe(
            distinctUntilChanged(),
        ).subscribe(val => {
            this.fetchList();
        });
        this.productType.valueChanges.pipe(
            distinctUntilChanged(),
        ).subscribe(val => {
            this.fetchList();
        });
        this.getPreStoreSupplierCategoryList();
    }

    ngAfterViewInit(){
        this.loading = false;
    }
    ngOnInit() {
        this.productsService.deselectAll();
        this.dataSource = new ProductsDataSource(this.productsService);

        this.productsService.payload = {
            "offset": 0,
            "limit": 50,
            "order": "dateModified",
            "orient": "desc",
            "term": {
                "productId": "",
                "productName": "",
                "shell": "",
                "vendorId": "",
                "vendorName": [],
                "categoryName": [],
                "dateCreated": "",
                "dateModified": "",
                "inhouseId": "",
                "stores": "",
                "storeNames": [],
                "datedCreated": "",
                "source": "",
                "isDeleted":0,
                "productType":0,
                "expirationDate": ""
            },
            "type": true,
            "completed": false
        };
        this.productsService.nonCategory = false;
        this.productsService.nonStore = false;
       
        // this.filterForm.setValue({
        //     productId:  localStorage.getItem("products_productId") !== null ? localStorage.getItem("products_productId"):"",

        // })
        if(localStorage.getItem("products_productId") !== null && localStorage.getItem("products_productId") !== "") {
            this.filterForm.controls['productId'].setValue(localStorage.getItem("products_productId"));
        }
        if(localStorage.getItem("products_productName") !== null && localStorage.getItem("products_productName") !== "") {
            this.filterForm.controls['productName'].setValue(localStorage.getItem("products_productName"));
        }
        if(localStorage.getItem("products_inhouseId") !== null && localStorage.getItem("products_inhouseId") !== "") {
            this.filterForm.controls['inhouseId'].setValue(localStorage.getItem("products_inhouseId"));
        }
        if(localStorage.getItem("products_source") !== null && localStorage.getItem("products_source") !== "") {
            this.filterForm.controls['source'].setValue(localStorage.getItem("products_source"));
        }
        if(localStorage.getItem("productType") !== null && localStorage.getItem("productType") !== "0") {
            this.filterForm.controls['productType'].setValue(localStorage.getItem("productType"));
        }
        //this.filterForm.controls['storeNames'].setValue([{store:"qwe"}]);
        // if(localStorage.getItem("products_productId") !== null && localStorage.getItem("products_productId") !== "") {
        //     th       is.filterForm.controls['productId'].setValue(localStorage.getItem("products_productId"));
        // }
        // if(localStorage.getItem("products_productId") !== null && localStorage.getItem("products_productId") !== "") {
        //     this.filterForm.controls['productId'].setValue(localStorage.getItem("products_productId"));
        // }
       /*  if(term.storeNames.length > 0) {
            localStorage.setItem("product_stores",JSON.stringify(term.storeNames))
        } else if(localStorage.getItem("product_stores") !== null && localStorage.getItem("product_stores") !== "") {
            term.storeNames = JSON.parse(localStorage.getItem("product_stores"));          
        }
        if(term.vendorName.length > 0) {
            localStorage.setItem("product_vendors",JSON.stringify(term.vendorName))
        } else if(localStorage.getItem("product_vendors") !== null && localStorage.getItem("product_vendors") !== "") {
            term.vendorName = JSON.parse(localStorage.getItem("product_vendors"));
        }
        if(term.categoryName.length > 0) {
            localStorage.setItem("product_categories",JSON.stringify(term.categoryName))
        } else  if(localStorage.getItem("product_categories") !== null && localStorage.getItem("product_categories") !== "") {
            term.categoryName = JSON.parse(localStorage.getItem("product_categories"));
        } */
        
        if(localStorage.getItem("product_categories") !== null && localStorage.getItem("product_categories") !== "") {
            this.filterForm.controls['categoryName'].setValue(JSON.parse(localStorage.getItem("product_categories")));        
        }
        if(localStorage.getItem("product_vendors") !== null && localStorage.getItem("product_vendors") !== "") {
            this.filterForm.controls['vendorName'].setValue(JSON.parse(localStorage.getItem("product_vendors")));        
        }
        if(localStorage.getItem("product_stores") !== null && localStorage.getItem("product_stores") !== "") {
            this.filterForm.controls['storeNames'].setValue(JSON.parse(localStorage.getItem("product_stores")));        
        }
        this.selectedProductSource = localStorage.getItem("products_source");
        this.fetchList();
    }

    ngOnDestroy() {
        this.onProductsChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
        this.messageQueueSubscription.unsubscribe();
    }

    getSourceLabel(sid) {
        const source = find(this.sources, { id: sid });
        if (source) {
            return source.name;
        } else {
            return '';
        }
    }

    updateStatus(product, ev) {
        ev.stopPropagation();
        if (product.shell === "0")
            product.shell = "1";
        else
            product.shell = "0";

        this.loading = false;
        this.api.updateProductShell(product.id, product.shell)
            .subscribe(
                this.loaded,
                this.loaded
            );
    }

    onSelectedChange(productId) {
        this.productsService.toggleSelected(productId);
    }

    toggleAll(ev) {
        if (ev) {
            this.productsService.toggleSelectAll();
        }
    }

    paginate(ev) {
        this.productsService.payload.offset = ev.pageIndex;
        this.productsService.payload.limit = ev.pageSize;
        this.pageSize = ev.pageSize;
        this.loading = true;
        this.productsService.getProducts()
            .then(() => {});
    }

    sortChange(ev) {
        this.productsService.payload.order = ev.active;

        this.resetPaginator();

        if (ev.active === 'category')
            this.productsService.payload.order = 'categoryName';
        else if (ev.active === 'store')
            this.productsService.payload.order = 'storeNames';
        else if (ev.active === 'active')
            this.productsService.payload.order = 'disabled';
        this.productsService.payload.orient = ev.direction;
        this.loading = true;

        this.productsService.getProducts()
            .then(() => {
             });
    }

    resetPaginator() {
        if(this.paginator) {
            this.paginator.firstPage();
            this.productsService.payload.offset = 0;
        }       
    }

    fetchList() {
        this.loading = true;
        const term = { ...this.filterForm.value };
        this.productsService.product_view = "product-list";
        localStorage.setItem("products_productId",term.productId)
        localStorage.setItem("products_productName",term.productName)
        localStorage.setItem("products_inhouseId", term.inhouseId)
        let isDeleted = "0";
        if (this.productsService.isDeleted)
            isDeleted = "1";

        localStorage.setItem("products_isDeleted", isDeleted);
        term["isDeleted"] = isDeleted;
        this.resetPaginator();
        
        if (!term.storeNames) {
            term.storeNames = [];
        } else {
            if (find(term.storeNames.find(c => c == 'nonStore'))) {
                term.storeNames = [];
                this.productsService.nonStore = true;
            } else {
                this.productsService.nonStore = false;
            }
        }
        if (!term.categoryName) {
            term.categoryName = [];
        } else {
            if (find(term.categoryName.find(c => c == 'nonCategory'))) {
                term.categoryName = [];
                this.productsService.nonCategory = true;
            } else {
                this.productsService.nonCategory = false;
            }
        }
        if (!term.vendorName) {
            term.vendorName = [];
        }
        
        this.productsService.payload.term = term;
        this.productsService.payload.term.shell = this.shell.value;
        this.productsService.payload.term.expirationDate = this.expirationDate.value;
        this.productsService.payload.term.productType = this.productType.value;
        this.productsService.payload.term.source = this.selectedProductSource;
        if (this.productsService.nonStore) {
            term.storeNames = ['nonStore'];
        }
        if (this.productsService.nonCategory) {
            term.categoryName = ['nonCategory'];
        }
        
        if(term.storeNames.length > 0) {
            localStorage.setItem("product_stores",JSON.stringify(term.storeNames))
        }
        if(term.vendorName.length > 0) {
            localStorage.setItem("product_vendors",JSON.stringify(term.vendorName))
        }
        if(term.categoryName.length > 0) {
            localStorage.setItem("product_categories",JSON.stringify(term.categoryName))
        }
        
        localStorage.setItem("products_source",term.source)

        this.filterForm.setValue(term);
        
        Promise.all([
            this.productsService.getProducts(),
            this.productsService.getProductsCount()
        ]).then(() => { });
    }

    clearFilters() {
        localStorage.setItem("products_productId","")
        localStorage.setItem("products_productName","")
        localStorage.setItem("products_inhouseId","")
        localStorage.setItem("product_stores","")
        localStorage.setItem("product_vendors","")
        localStorage.setItem("product_categories","")
        localStorage.setItem("products_source","")
        if (!this.loading) {
            this.filterForm.reset();
            this.productsService.resetFilter();
            this.fetchList();
            this.getPreStoreSupplierCategoryList();
        }
    }

    goto(pid) {
        if (!this.disableRow) {
            if (!this.productsService.productSource)
                this.router.navigate(['/e-commerce/products/', pid]);
            else
                this.router.navigate(['/e-commerce/sources/', pid]);
        }
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
        this.productsService.getProductStoreList()
            .then((stores: any[]) => {
                this.stores = stores.map(store => { return { store: store.store }; });
                this.filteredStores = this.stores;
                /* if(this.filteredStores.length > 0) {
                    this.filterForm.controls['storeNames'].setValue(this.filteredStores);
                } */
                if(this.filteredStores.length > 0) {
                    if(localStorage.getItem("product_stores") !== null && localStorage.getItem("product_stores") !== "") {
                        const jsonArr = JSON.parse(localStorage.getItem("product_stores"));
                        
                        var result = this.filteredStores.filter(function(store1){
                            return jsonArr.some(function(store2){
                                return store1.store === store2.store; 
                            });
                        });
                        //this.selectedStores = result
                        
                        this.filterForm.controls['storeNames'].setValue(result);
                    }
                    
                }
                
            });

        this.api.getVendorAutocomplete('a')
            .subscribe((vendors: any[]) => {
                this.vendors = vendors.map(vendor => { return { vendor: vendor.name }; });
                if(this.vendors.length > 0) {
                    if(localStorage.getItem("product_vendors") !== null && localStorage.getItem("product_vendors") !== "") {
                        const jsonArr = JSON.parse(localStorage.getItem("product_vendors"));
                        var result = this.vendors.filter(function(vendor1){
                            return jsonArr.some(function(vendor2){
                                return vendor1.vendor === vendor2.vendor; 
                            });
                        });
                        //this.selectedStores = result
                        
                        this.filterForm.controls['vendorName'].setValue(result);
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
                this.categories = res.ProductCategoryArray.map(category => { return { category: category.category }; });
                if(this.categories.length > 0) {
                    if(localStorage.getItem("product_categories") !== null && localStorage.getItem("product_categories") !== "") {
                        const jsonArr = JSON.parse(localStorage.getItem("product_categories"));
                        var result = this.categories.filter(function(category1){
                            return jsonArr.some(function(category2){
                                return category1.category === category2.category; 
                            });
                        });
                        //this.selectedStores = result
                        this.filterForm.controls['categoryName'].setValue(result);
                    }
                    
                }
            });
    }

    filterByCategory(ev, category) {
        this.productsService.payload.term.categoryName = [{ category: category }];
        this.fetchList();
    }
}


export class ProductsDataSource extends DataSource<any>
{
    onTotalCountChanged: Subscription;
    total = 0;

    constructor(
        private ordersService: EcommerceProductsService
    ) {
        super();
    }

    connect(): Observable<any[]> {
        this.onTotalCountChanged =
            this.ordersService.onTotalCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.total = total;
            });

        return this.ordersService.onProductsChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
    }
}

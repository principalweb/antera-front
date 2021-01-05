import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { EcommerceOrderService } from '../order.service';
import { find } from 'lodash';
import { AuthService } from 'app/core/services/auth.service';

@Injectable()
export class EcommerceProductsService implements Resolve<any>
{
    products: any[];
    onProductsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onTotalCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
    onSelectionChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onViewChanged: BehaviorSubject<any> = new BehaviorSubject('product-images');
    onSearchTextChanged: Subject<any> = new Subject();
    onStoreListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);

    messageQueue = new Subject();

    _selection: string[] =[];
    viewMode = 'product-images';
    sources = [];
    defaultSources = [{"id":"1","name":"Manual"},{"id":"2","name":"Sage"},{"id":"3","name":"ASI"},{"id":"4","name":"Webstore"},{"id":"5","name":"ASI Auto"},{"id":"6","name":"CSV"},{"id":"7","name":"Sanmar Direct"},{"id":"8","name":"Promo"},{"id":"9","name":"Source"}];
    payload = {
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
            "isDeleted": 0,
            "productType":0,
            "expirationDate": ""
        },
        "type": true,
        "completed": false
    };

    eqpVendor = false;
    preferredVendor = false;
    nonCategory = false;
    nonStore = false;
    isDeleted = false;

    searchTerm = {
        "offset": 0,
        "limit": 50,
        "order": "dateModified",
        "orient": "desc",
        "search": "",
        "type": true,
        "completed": false,
        "isDeleted": 0,
        "productType":0
    }

    productSource = false;
    product_view = ""

    constructor(
        private api: ApiService,
        private order: EcommerceOrderService,
        private authService: AuthService
    )
    {
        this.onSearchTextChanged.subscribe(searchText => {
            this.searchTerm.search = searchText;
            console.log("Product-Search");
            this.getProducts(true).then(console.log);
            this.getProductsCount(true).then(console.log);
        });
    }

    /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        this.resetFilter();
        
        if(localStorage.getItem("products_productId") !== "null") {
            this.payload.term.productId = localStorage.getItem("products_productId") !== null ? localStorage.getItem("products_productId"):"";
        }
        if(localStorage.getItem("products_productName") !== "null") {
            this.payload.term.productName = localStorage.getItem("products_productName") !== null ? localStorage.getItem("products_productName"):"";
        }
        if(localStorage.getItem("products_inhouseId") !== "null") {
            this.payload.term.inhouseId = localStorage.getItem("products_inhouseId") !== null ? localStorage.getItem("products_inhouseId"):"";
        }
        // this.payload.term.productId = localStorage.getItem("products_productId") !== null ? localStorage.getItem("products_productId"):"";
        // this.payload.term.productName = localStorage.getItem("products_productName") !== null ? localStorage.getItem("products_productName"):"";
        // this.payload.term.inhouseId = localStorage.getItem("products_inhouseId") !== null ? localStorage.getItem("products_inhouseId"):"";
        if(localStorage.getItem("products_storeNames") !== null && localStorage.getItem("products_storeNames") !== "") {
            this.payload.term.storeNames = JSON.parse(localStorage.getItem("products_storeNames"));
        }
        if(localStorage.getItem("products_vendorNames") !== null && localStorage.getItem("products_vendorNames") !== "") {
            this.payload.term.vendorName = localStorage.getItem("products_vendorNames") !== null ? JSON.parse(localStorage.getItem("products_vendorNames")):""
        }
        if(localStorage.getItem("products_categoryName") !== null && localStorage.getItem("products_categoryName") !== "") {
            this.payload.term.categoryName = localStorage.getItem("products_categoryName") !== null ? JSON.parse(localStorage.getItem("products_categoryName")):""
        }
        
        if (route.url[0]) {
            if (route.url[0].path === 'sources') {
               const source = find(this.defaultSources, { name: 'Source' });
               this.payload.term.source = source.id;
               this.productSource = true;
            }
            else {
                //this.payload.term.source = '';
                this.payload.term.source = localStorage.getItem("products_source") !== null ? localStorage.getItem("products_source"):"";
                
                this.productSource = false;
            }
        }
        return Promise.all([
            this.getProductSources(),
            this.order.getUniversalProductAPIs().toPromise()
        ]);
    }

    getProducts(isSearchRequired = false): Promise<any>
    {
        return new Promise((resolve, reject) => {
            if(this.product_view === 'product-images') {
                if(localStorage.getItem("products_productId") !== "null") {
                    this.payload.term.productId = localStorage.getItem("products_productId") !== null ? localStorage.getItem("products_productId"):"";
                } else {
                    this.payload.term.productId = ""
                }
                if(localStorage.getItem("products_productName") !== "null") {
                    this.payload.term.productName = localStorage.getItem("products_productName") !== null ? localStorage.getItem("products_productName"):"";
                } else {
                    this.payload.term.productName = ""
                }
                if(localStorage.getItem("products_inhouseId") !== "null") {
                    this.payload.term.inhouseId = localStorage.getItem("products_inhouseId") !== null ? localStorage.getItem("products_inhouseId"):"";
                } else {
                    this.payload.term.inhouseId = ""
                }
                if(localStorage.getItem("products_storeNames") !== null && localStorage.getItem("products_storeNames") !== "") {
                    this.payload.term.storeNames = JSON.parse(localStorage.getItem("products_storeNames"));
                } else {
                    this.payload.term.storeNames = []
                }
                if(localStorage.getItem("products_vendorNames") !== null && localStorage.getItem("products_vendorNames") !== "") {
                    this.payload.term.vendorName = localStorage.getItem("products_vendorNames") !== null ? JSON.parse(localStorage.getItem("products_vendorNames")):""
                } else {
                    this.payload.term.vendorName = []
                }
                if(localStorage.getItem("products_categoryName") !== null && localStorage.getItem("products_categoryName") !== "") {
                    this.payload.term.categoryName = localStorage.getItem("products_categoryName") !== null ? JSON.parse(localStorage.getItem("products_categoryName")):""
                } else {
                    this.payload.term.categoryName = []
                }
                if (localStorage.getItem("products_isDeleted") !== null && localStorage.getItem("products_isDeleted") !== "") {
                    this.payload.term.isDeleted = localStorage.getItem("products_isDeleted") !== null ? JSON.parse(localStorage.getItem("products_isDeleted")) : "0"
                } else {
                    this.payload.term.isDeleted = 0
                }
                if (localStorage.getItem("productType") !== null && localStorage.getItem("productType") !== "0") {
                    this.payload.term.productType = localStorage.getItem("productType") !== null ? JSON.parse(localStorage.getItem("productType")) : "0"
                } else {
                    this.payload.term.productType = null
                }
            }
            this.api.post('/content/get-product-list', isSearchRequired? this.searchTerm: this.getPayload())
                .subscribe((response: any) => {
                    this.products = response;
                    this.products.map(product => {
                        product.ProductCategoryArray = product.ProductCategoryArray.map(productCategory => {
                            return productCategory.category;
                        });
                        product.MediaContent = product.MediaContent.map(mediaContent => {
                            if (!mediaContent.width || !mediaContent.height) // If width/height is undefined, set default width/height , must be fixed
                            {
                                mediaContent.width = 300;
                                mediaContent.height = 450;
                            }
                            return mediaContent;   
                        });
                        return product;
                    });
                    this.onProductsChanged.next(this.products);
                    resolve(response);
                }, reject);
        });
    }

    getProductsCount(isSearchRequired = false): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-product-count', isSearchRequired? this.searchTerm: this.getPayload())
                .subscribe((response: any) => {
                    this.onTotalCountChanged.next(response.count);
                    resolve(response);
                }, reject);
        });
    }

    getPayload() {
        const newTerms: any = {
            ...this.payload.term
        };
        if (this.preferredVendor) {
            newTerms.preferredVendor = "1";
        } else {
            newTerms.preferredVendor = "";
        }
        if (this.nonCategory) {
            newTerms.nonCategory = "1";
        } else {
            newTerms.nonCategory = "";
        }
        if (this.nonStore) {
            newTerms.nonStore = "1";
        } else {
            newTerms.nonStore = "";
        }

        if (this.eqpVendor) {
            newTerms.eqpVendor = "1";
        } else {
            newTerms.eqpVendor = "";
        }

        if (this.isDeleted) {
            newTerms.isDeleted = "1";
        } else {
            newTerms.isDeleted = "0";
        }

        return {
            ...this.payload,
            term: newTerms,
            permUserId: this.authService.getCurrentUser().userId
        };
    }

    /**
     * Toggle selected product by id
     * @param id
     */
    toggleSelected(id) 
    {
        if ( this._selection.length > 0 )
        {
            const index = this._selection.indexOf(id);

            if ( index !== -1 )
            {
                this._selection.splice(index, 1);
                this.onSelectionChanged.next(this._selection);

                return;
            }
        }

        this._selection.push(id);
        this.onSelectionChanged.next(this._selection);
    }

    toggleSelectAll() 
    {
        if ( this._selection.length === this.products.length) {
            this.deselectAll();
        } else {
            this.selectAll();
        }
    }

    selectAll()
    {
        this._selection = this.products.map(product => product.id);
        this.onSelectionChanged.next(this._selection);
    }

    deselectAll()
    {
        this._selection = [];
        this.onSelectionChanged.next(this._selection);
    }

    recoverSelectedProducts() {
        return this.api.recoverProducts(this._selection);

    }

    deleteSelectedProducts()
    {
        if (this.isDeleted) {
            return this.api.deleteTrashProducts(this._selection);

        }
        else {
            return this.api.deleteProducts(this._selection);
        }
    }

    cloneSelectedProducts()
    {
        return this.api.cloneProducts(this._selection);
    }

    changeView(view){
        this.product_view = view;
        this.onViewChanged.next(view);
    }

    resetFilter() {
        this.payload = {
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
                "source": this.productSource ? '9' : '',
                "isDeleted":0,
                "productType":0,
                "expirationDate": ""
            },
            "type": true,
            "completed": false
        };
    }

    getProductStoreList(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-store-list').subscribe((response: any) => {
                this.onStoreListChanged.next(response.StoreArray);
                resolve(response.StoreArray);
            }, reject);
        });
    }

    massUpdate(params) {
        return this.api.post('/content/product-mass-update', params);
    }

    getProductSources(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.getProductSources()
                .subscribe((res: any) => {
                    this.sources = res;
                    this.sources.splice(0,0,{id:'',name:'All'});
                    resolve(this.sources);
                }, reject);
        })
    }

}

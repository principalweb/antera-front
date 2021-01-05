import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject } from 'rxjs';
import { PriceOption, InventoryItem } from '../../../models';
import { ApiService } from '../../../core/services/api.service';
import { ProductDetails } from '../../../models/product-details';

import { find } from 'lodash';

@Injectable()
export class EcommerceProductService implements Resolve<any>
{
    route: any;
    product: any;
    pageType: string = 'new';
    priceTable: PriceOption[];
    inventory: InventoryItem[];

    onProductChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onInventoryChanged: BehaviorSubject<InventoryItem[]> = new BehaviorSubject([]);

    onFilteredCategoriesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onFilteredLocationsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onStoreListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onPoTypeListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onProductTypeListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onTaxJarCategoriesListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onSourceListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onCountryListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onDivisionListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onUomSetListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onProductFinancialAccountListChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onInventoryListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onProductSalesOrderHistoryListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onProductPurchaseOrderHistoryListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onDropdownOptionsForProductsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onProductSalesOrderHistoryListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
    onProductPurchaseOrderHistoryListCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
    defaultSources = [{"id":"1","name":"Manual"},{"id":"2","name":"Sage"},{"id":"3","name":"ASI"},{"id":"4","name":"Webstore"},{"id":"5","name":"ASI Auto"},{"id":"6","name":"CSV"},{"id":"7","name":"Sanmar Direct"},{"id":"8","name":"Promo"},{"id":"9","name":"Source"}];

    categoryTerm = {
        "offset": 0,
        "limit": "",
        "order": "catName",
        "orient": "asc",
        "term": {
            "categoryName": ""
        },
        "type": true,
        "completed": false
    };

    inventoryPayload = {
        "offset": 0,
        "limit": 50,
        "order": "sku",
        "orient": "asc",
        "id": "",
        "term": {
            "productId": "",
            "sku": "",
            "size": "",
            "color": "",
            "site": "",
            "bin": "",
            "quantity": "",
            "dateModified": "",
            "min": "",
            "max": ""
        },
        "type": true,
        "completed": false
    };

    constructor(
        private http: HttpClient,
        private api: ApiService
    )
    {
    }

    /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {

        this.route = route;
        const dropdowns = [
            'product_prod_status',
            'product_prod_kind'
        ];

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getDropdownOptionsForProducts(dropdowns),
                this.getProductStoreList(),
                this.getProductSourceList(),
                this.getProductPOTypeList(),
                this.getTaxJarCategoriesList(),
                this.getProductTypeList(),
                this.getDivisionList(),
                this.getUomSetList(),
                this.getProduct(),
                this.getProductFinancialAccountList(),
                this.getInventoryList(),
                this.getCountryList(),
                // this.getPricingMethodsList(),
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    getCurrentRoute(){
        if ( this.route){
            return this.route;
        }
    }

    getProduct(): Promise<any>
    {
        this.pageType = 'new';
        if ( this.route.params.id !== 'new' && !isNaN(this.route.params.id)) {
            this.pageType = 'edit';
        }
        return new Promise((resolve, reject) => {
            if ( this.route.params.id === 'new' || isNaN(this.route.params.id) )
            {
                const product = new ProductDetails();
                if (this.route.url[0]){
                    if (this.route.url[0].path === 'sources') {
                        const source = find(this.defaultSources, { name: 'Source' });
                        product.source = source.id;
                    }
                }
                this.onProductChanged.next(product);
                resolve(false);
            }
            else
            {
                let id = this.route.params.id;
                this.api.post('/content/get-product', { id })
                    .subscribe((details: any) => {
                        this.product = details;
                        this.onProductChanged.next(this.product);
                        resolve(this.product);
                    }, reject);
            }
        });
    }

    getInventoryList()
    {
        this.inventoryPayload.id = this.route.params.id;
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-product-inventory-list', this.inventoryPayload)
            .subscribe((response: any) => {
                            this.onInventoryListChanged.next(response);
                            resolve(response);
                        }, (err:any) => {
                            reject(err);
                        });
        });
    }

    saveProduct(product)
    {
        return new Promise((resolve, reject) => {
            // this.http.post('api/e-commerce-products/' + product.id, product)
            //     .subscribe((response: any) => {
            //         resolve(response);
            //     }, reject);
            this.api.saveProduct(product)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    addProduct(product)
    {
        return new Promise((resolve, reject) => {
            this.api.saveProduct(product)
                .subscribe((response: any) => {
                    resolve(response);
                }, reject);
        });
    }

    getProductStoreList() {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-store-list').subscribe((response: any) => {
                this.onStoreListChanged.next(response.StoreArray);
                resolve(response.StoreArray);
            }, reject);
        });
    }

    getAutoDecoLocationList( name: string, vId: string, source: string) {
        return new Promise((resolve, reject) => {
            this.api.post('/content/auto-deco-location-list', {name: name, vId: vId, source: source}).subscribe((response: any) => {
                this.onFilteredLocationsChanged.next(response);
                resolve(response);
            }, reject);
        });
    }

    getProductCategoryList(val) {
        this.categoryTerm.term.categoryName = val;
        return new Promise((resolve, reject) => {
            this.api.getProductCategoryList(this.categoryTerm).subscribe((response: any) => {
                this.onFilteredCategoriesChanged.next(response.ProductCategoryArray);
                resolve(response.ProductCategoryArray);
            }, reject);
        });
    }

    getProductTypeList() {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-product-types').subscribe((list: any[]) => {
                this.onProductTypeListChanged.next(list);
                resolve(list);
            }, reject);
        });
    }

    getTaxJarCategoriesList() {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-tax-jar-categories').subscribe((list: any[]) => {
                this.onTaxJarCategoriesListChanged.next(list);
                resolve(list);
            },reject);
        });
    }

    getProductFinancialAccountList() {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-financial-accounts').subscribe((response: any) => {
                this.onProductFinancialAccountListChanged.next(response);
                resolve(response);
            }, reject);
        });
    }

    getProductPOTypeList() {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-product-po-types').subscribe((list: any[]) => {
                this.onPoTypeListChanged.next(list);
                resolve(list);
            },reject);
        });
    }



    getProductSourceList() {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-product-sources').subscribe((list: any[]) => {
                this.onSourceListChanged.next(list);
                resolve(list);
            },reject)
        });
    }

    getCountryList() {
        console.log("getCountryList")
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-global-country-list').subscribe((list: any[]) => {
                console
                this.onCountryListChanged.next(list);
                resolve(list);
            },reject)
        });
    }

    getDivisionList() {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-product-divisions').subscribe((list: any[]) => {
                this.onDivisionListChanged.next(list);
                resolve(list);
            },reject)
        });
    }

    getUomSetList() {
        return new Promise((resolve, reject) => {
            this.api.getUomGroupsListOnly().subscribe((list: any[]) => {
                this.onUomSetListChanged.next(list);
                resolve(list);
            },reject)
        });
    }

    uploadProductImage(dataImg): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.uploadProductImage(dataImg)
                .subscribe((res: any) => {
                    resolve(res);
                }, reject);
        });
    }

    uploadProductImageUrl(dataImg): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.uploadProductImageUrl(dataImg)
                .subscribe((res: any) => {
                    resolve(res);
                }, reject);
        });
    }

  getProductStores(id) {
    return this.api.post('/content/get-product-stores', {id:id});
  }

  getEnabledProductDescriptions() {
    return this.api.post('/content/get-enabled-product-descriptions', {});
  }

  autocompleteUsers(name){
    return this.api.getUserAutocomplete(name);
  }
  
  getDropdownOptionsForProducts(options) {
    return new Promise((resolve, reject) => {
       
        this.api.getDropdownOptions({dropdown: options})
            .subscribe((response: any[]) => {
                console.log("response",response)
                this.onDropdownOptionsForProductsChanged.next(response);
                resolve(response);
            }, err => reject(err));
    });
  }

    getPricingMethodsList() {
        const methodListingUrl = '/content/get-pricing-methods-list';
        const pricingListOptions = {
            "offset": 0,
            "order": "name",
            "orient": "asc",
            "term": {}
        };
        return this.api.post(methodListingUrl, pricingListOptions);
    }

    getPricingMethodsCount() {
        const baseUrl = '/content/get-pricing-methods-count';
        return this.api.get(baseUrl);
    }

    createPricingMethods(data) {
        const baseUrl = '/content/create-pricing-methods';
        return this.api.post(baseUrl, data);
    }

    updatePricingMethods() {
        const baseUrl = 'content/update-pricing-methods';
        return this.api.get(baseUrl);
    }

    updatePricingPercentages(payload){
        const baseUrl = '/content/update-pricing-methods';
        return this.api.post(baseUrl, payload);
    }

    getPricingMethodsDetails() {
        const baseUrl = '/content/get-pricing-methods-details';
        return this.api.get(baseUrl);
    }

    deletePricingMethods(ids: Array<string>) {
        const baseUrl = '/content/delete-pricing-methods';
        return this.api.post(baseUrl, { "ids": ids});
    }

    getProductSalesOrderHistoryCount(payload)
  {
    this.api.post('/content/get-product-sales-order-history-count', payload)
        .subscribe((response: any) => {
                    this.onProductSalesOrderHistoryListCountChanged.next(response.count);
                    }, (err:any) => {
                        
                    });
  }

   getProductSalesOrderHistory(payload) {
    this.api.post('/content/get-product-sales-order-history', payload)
    .subscribe((response: any) => {
                this.onProductSalesOrderHistoryListChanged.next(response);
                }, (err:any) => {
                    
                });
  }
  getProductPurchaseOrderHistoryCount(payload)
  {
    this.api.post('/content/get-product-purchase-order-history-count', payload)
        .subscribe((response: any) => {
                    this.onProductPurchaseOrderHistoryListCountChanged.next(response.count);
                    }, (err:any) => {
                        //this.msg.show("Error fetching Inventory!", 'error');
                    });
  }

  getProductPurchaseOrderHistory(payload) {
    this.api.post('/content/get-product-purchase-order-history', payload)
    .subscribe((response: any) => {
                this.onProductPurchaseOrderHistoryListChanged.next(response);
                }, (err:any) => {
                    //this.msg.show("Error fetching Inventory!", 'error');
                });
  }
}

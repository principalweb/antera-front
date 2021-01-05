import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { EcommerceProductService } from '../../product/product.service';
import { ProductDetails } from '../../../../models';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ApiService } from 'app/core/services/api.service';
import { displayName } from '../../utils';
import { debounceTime, distinctUntilChanged, debounce, startWith, switchMap, map } from 'rxjs/operators';

import { IntegrationService } from 'app/core/services/integration.service';

import { Observable, interval } from 'rxjs';

import { TaxCategory } from 'app/models/tax-category';
import { RestParams } from 'app/models/rest-params';
import { TaxCollection } from 'app/models/tax-collection';
import { find } from 'lodash';

@Component({
  selector: 'app-product-basic-form',
  templateUrl: './product-basic-form.component.html',
  styleUrls: ['./product-basic-form.component.scss']
})
export class ProductBasicFormComponent implements OnInit {
    @Input() product = new ProductDetails();
    @Input() form: FormGroup;
    // @Input() displayName:any;
    @Input() fieldLabel: any;
    @Input() visibleField: any;
    @Input() requiredField: any;
    @Input() fields;
    poTypeList = [];
    divisionList = [];
    productTypeList = [];
    taxJarCatList: Observable<TaxCategory[]>;
    uomSetList = [];

    onPoTypeListChanged: Subscription;
    onProductTypeListChanged: Subscription;
    onStoreListChanged: Subscription;
    onSourceListchanged: Subscription;
    onCountryListChange: Subscription; 
    onDivisionListChanged: Subscription;
    onUomSetListChanged: Subscription;
    onFilteredCategoriesChanged: Subscription;
    onFilteredLocationsChanged: Subscription;
    onProductFinancialAccountListChanged: Subscription;
    onDropdownOptionsForProductsChangedSubscription: Subscription;
    // Categories/Stores (Chips)
    filteredCategories =  this.productService.onFilteredCategoriesChanged;
    filteredLocations =  this.productService.onFilteredLocationsChanged;
    filteredStores = [];
    filteredVendors = [];
    filteredUsers = [];

    productStoreList = [];
    sourceList = [];

    incomeAccounts = [];
    expenseAccounts = [];
    assetAccounts = [];
    displayName = displayName;
    systemEvents: any[] = [];
    calculatorTypes: any[] = [{id: '0', name: '--'}, {id: '1', name: 'Square Area Calculator'}];

    showTax = false;
    countryList = [];
    prodStatus = [];
    prodKind = [];

    @ViewChild('categoryInput', {static: true}) categoryInput: ElementRef;
    @ViewChild('locationInput', {static: true}) locationInput: ElementRef;
    @ViewChild('storeInput', {static: true}) storeInput: ElementRef;
    
    showExpirationInput = false;

    // need to come up with a way to model rest filters
    filters = {
        terms: {
            name: ''
        },
        operator: {
            name: 'like'
        }
    };


    constructor(
        private productService: EcommerceProductService,
        private render: Renderer2,
        private api: ApiService,
        public integrationService: IntegrationService
    ) {
      this.api.getAdvanceSystemConfigAll({module: 'Products'})
      .subscribe((response: any) => {
        this.showTax = false;
        if (response.settings.showTax === '1') {
          this.showTax = true;
        }
      });
      this.api.getSystemEvents('autopull')
        .subscribe((events: any) => {
          this.systemEvents = events;
        });
    }

    ngOnInit() {
        if (this.product.expirationDate) {
            if (this.product.expirationDate === '0000-00-00') {
                this.showExpirationInput = false;
            } else {
                this.showExpirationInput = true;
            }
        }
        this.onPoTypeListChanged =
            this.productService.onPoTypeListChanged
                .subscribe(poTypeList => {
                    this.poTypeList = poTypeList;
                });

        this.onProductTypeListChanged =
            this.productService.onProductTypeListChanged
                .subscribe(productTypeList => {
                    this.productTypeList = productTypeList;
                });

        this.onStoreListChanged =
            this.productService.onStoreListChanged
                .subscribe(storeList => {
                    this.productStoreList = storeList;
                });

        this.onSourceListchanged =
            this.productService.onSourceListChanged
                .subscribe(sourceList => {
                    this.sourceList = sourceList;
                });
        this.onCountryListChange = 
            this.productService.onCountryListChanged
                .subscribe(countryList => {
                    console.log('countryList', countryList);
                    this.countryList = countryList;
                });
                
        this.onDivisionListChanged =
            this.productService.onDivisionListChanged
                .subscribe(divList => {
                    this.divisionList = divList;
                });

        this.onUomSetListChanged =
            this.productService.onUomSetListChanged
                .subscribe(uomList => {
                    this.uomSetList = uomList;
                });

        this.onProductFinancialAccountListChanged =
            this.productService.onProductFinancialAccountListChanged
                .subscribe((res: any) => {
                    this.incomeAccounts = res.incomeAccounts;
                    this.expenseAccounts = res.expenseAccounts;
                    this.assetAccounts = res.assetAccounts;
                });
        
        this.onDropdownOptionsForProductsChangedSubscription =
            this.productService.onDropdownOptionsForProductsChanged
                .subscribe((res: any[]) => {
                    console.log('res', res);
                    if (!res) { return; }
                    const prodStatus = find(res, { name: 'product_prod_status' });
                    const prodKind = find(res, { name: 'product_prod_kind' });
                    this.prodKind = prodKind ? prodKind.options : [];
                    this.prodStatus = prodStatus ? prodStatus.options : [];
                  });

        if (this.categoryInput){
        this.render.listen(this.categoryInput.nativeElement, 'keyup', (event) => {
            if (this.categoryInput.nativeElement.value.length > 0) {
                this.productService.getProductCategoryList(this.categoryInput.nativeElement.value);
            }
        });

        if(this.locationInput){
                    this.render.listen(this.locationInput.nativeElement, 'keyup', (event) => {
            if (this.locationInput.nativeElement.value.length > 0) {
                console.log('get auto loc ');
                this.productService.getAutoDecoLocationList(this.locationInput.nativeElement.value, this.product.vendorId, this.product.source);
            }
        });
        }

    }

        /*this.render.listen(this.storeInput.nativeElement, 'keyup', (event) => {
            this.filteredStores = this.storeInput.nativeElement.value === '' ? this.productStoreList.slice() : this.filterStore(this.storeInput.nativeElement.value);
        });

        this.render.listen(this.storeInput.nativeElement, 'click', (event) => {
            this.filteredStores = this.productStoreList.slice();
        });*/

        this.form.get('vendorName').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe(val => {
                if (val.length >= 3 ){
                    this.api.getVendorAutocomplete(val).subscribe((res: any[]) => {
                        this.filteredVendors = res;
                    });
                }
            });

        this.form.get('assignedUserName').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe(keyword => {
            if (keyword && keyword.length >= 3 ) {
                this.productService.autocompleteUsers(keyword).subscribe((res: any[]) => {
                    this.filteredUsers = res;
                });
            }
        });

        this.taxJarCatList = this.form.get('taxJarObj').valueChanges.pipe(
        debounce(() => interval(500)),
        startWith<string | TaxCategory>(''),
        switchMap(value => {
            const init = { page: 1, perPage: 20, order: 'name', orient: 'asc' };
            const params = new RestParams(init);
            value = typeof value === 'undefined' ? '' : value;
            this.filters.terms.name = (typeof value === 'string' ? value : value.name);
            return this.integrationService.getTaxCategories(this.filters, params).pipe(
            map((res: TaxCollection) => {
                return res.data;
            })
            );
        }),
        map((res: TaxCategory[]) =>res)
        );
    }

    ngOnDestroy() {
        this.onPoTypeListChanged.unsubscribe();
        this.onProductTypeListChanged.unsubscribe();
        this.onStoreListChanged.unsubscribe();
        this.onSourceListchanged.unsubscribe();
        this.onDivisionListChanged.unsubscribe();
        if (this.onFilteredCategoriesChanged) {
          this.onFilteredCategoriesChanged.unsubscribe();
        }
        if (this.onFilteredLocationsChanged) {
          this.onFilteredLocationsChanged.unsubscribe();
        }
        this.onUomSetListChanged.unsubscribe();
    }

    categorySelected(event: MatAutocompleteSelectedEvent): void {
        this.product.ProductCategoryArray.push({category: event.option.value});
        if (this.categoryInput){
            this.categoryInput.nativeElement.value = '';
        }        
    }

    locationSelected(event: MatAutocompleteSelectedEvent): void {
      const location = event.option.value;
      console.log('this.product.LocationArray.Location');
      console.log(this.product.LocationArray.Location);
      if (!this.product.id){
          this.product.LocationArray.Location = [];
      }
      const pLoc = this.product.LocationArray.Location.find(loc => loc.locationId == location.id);
      if (pLoc && pLoc.locationId) {
        return;
      }
      this.product.LocationArray.Location.push({
                                                locationName: location.locationName,
                                                locationId: location.id,
                                                source: location.source,
                                                defaultLocation: '0',
                                                id: '',
                                                locationRank: '1',
                                                maxDecoration: '',
                                                'minDecoration': '',
                                                sourceId: location.sourceId
                                              });
        if (this.locationInput){
            this.locationInput.nativeElement.value = '';
        }
    }

    storeSelected(event: MatAutocompleteSelectedEvent): void {
        this.product.StoreArray.push(event.option.value);
        if (this.storeInput){
            this.storeInput.nativeElement.value = '';
        }
    }

    selectVendor(event: MatAutocompleteSelectedEvent): void {
        const vendor = event.option.value;
        this.form.patchValue({
            vendorName: vendor.name,
            vendorId: vendor.id
        });
    }

    filterStore(storeName: string){
        return this.productStoreList.filter(store =>
            store.store.toLowerCase().indexOf(storeName.toLowerCase()) === 0);
    }

    displaySource(id: number){
       const pSource = this.sourceList.find(source => source.id == id);
       return (pSource && pSource.name) || '';
    }

    selectAssignee(event: MatAutocompleteSelectedEvent): void {
        const assignee = event.option.value;
        this.form.patchValue({
            assignedUserName: assignee.name,
            assignedUserId: assignee.id
        });
    }

    compareSystemEvent(se1, se2) {
        return se1.id == se2.eventId;
    }

    displayFn(category?: TaxCategory): string | undefined {
        return category ? category.name : undefined;
    }

    onChangeCheckbox(ev) {
        if (ev.checked) {
            this.showExpirationInput = true;
        } else {
            this.showExpirationInput = false;
        }
    }
}

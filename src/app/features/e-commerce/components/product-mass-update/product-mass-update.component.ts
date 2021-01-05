import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { EcommerceProductsService } from 'app/features/e-commerce/products/products.service';

import { Category } from 'app/models';
import { unionBy, sortBy, each, find, findIndex } from 'lodash';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';

import { AdditionalCharge } from 'app/models';

@Component({
    selector: 'app-product-mass-update',
    templateUrl: './product-mass-update.component.html',
    styleUrls: ['./product-mass-update.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ProductMassUpdateComponent implements OnInit, OnDestroy {
    isLoading: boolean = false;
    formData: any = {
                      includeCategory: false,
                      replaceCategory: false,
                      categories: [],
                      categorySearch: 'a',

                      includeCharge: false,
                      replaceCharge: false,
                      charges: [],
                      chargeSearch: ''
                    };
    categories: Category[] = [];
    selectedCategories: Category[] = [];

    productId: any[] = [];

    dataForm: FormGroup;

    additionalCharges: any;
    filteredCharges: any[];
    selectedCharges: any = [];
    chargesDisplayedColumns: any = ['name', 'qty', 'price', 'cost'];

    constructor(
        private msg: MessageService,
        private api: ApiService,
        public dialogRef: MatDialogRef<ProductMassUpdateComponent>,
        private fb: FormBuilder,
        private productsService: EcommerceProductsService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.productId = data;
    }

    ngOnInit() {
      this.dataForm = this.fb.group({
          includeCategory: new FormControl(this.formData.includeCategory),
          replaceCategory: new FormControl(this.formData.replaceCategory),
          categories: new FormControl(this.formData.categories),
          categorySearch: new FormControl(this.formData.categorySearch),

          includeCharge: new FormControl(this.formData.includeCharge),
          replaceCharge: new FormControl(this.formData.replaceCharge),
          charges: new FormControl(this.formData.charges),
          chargeSearch: new FormControl(this.formData.chargeSearch),
      });
      this.api.getAddonCharges({term: {status: '1'}}).subscribe(
        (res: any[]) => {
          this.additionalCharges = res.map(r => AdditionalCharge.fromCharge(r));
          this.filteredCharges = sortBy(this.additionalCharges, 'name');
          this.filteredCharges.forEach(val => {
            this.dataForm.addControl('chargePrice_' + val.id, new FormControl(val.price));
            this.dataForm.addControl('chargeCost_' + val.id, new FormControl(val.cost));
            this.dataForm.addControl('chargeQty_' + val.id, new FormControl(1));
          });
        },
        (err) => {}
      );
      this.dataForm.controls.chargeSearch.valueChanges
        .subscribe((val: any) => {
          if (val !== '') {
            this.filteredCharges =
              this.additionalCharges.filter(charge =>
                charge.name.toLowerCase().indexOf(val.toLowerCase()) >= 0
              );
          } else {
            this.filteredCharges = this.additionalCharges;
          }
          this.filteredCharges = unionBy([
              ...this.selectedCharges,
              ...this.filteredCharges
          ], 'id');
          this.filteredCharges = sortBy(this.filteredCharges, 'name');
        });
      this.dataForm.controls.categorySearch.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(searchText => {
              this.isLoading = true;
              let categoryTerm = {
                  "offset": 0,
                  "limit": "100",
                  "order": "catName",
                  "orient": "asc",
                  "term": {
                      "categoryName": (searchText == '') ? 'a' : searchText
                  },
                  "type": true,
                  "completed": false
              };
              return this.api.getProductCategoryList(categoryTerm);
          })
      ).subscribe((res: any) => {
          this.isLoading = false;
          this.categories = unionBy([
              ...this.selectedCategories,
              ...res.ProductCategoryArray
          ], 'id');
      });
      this.dataForm.controls.categorySearch.setValue('');
    }

    updateCategorySelection() {
        const selectedCategories = this.dataForm.value.categories.map(category => {
            if (!category) {
              return {};
            }
            return category;
        });
        this.selectedCategories = selectedCategories;
    }

    clearCategorySearch() {
        this.dataForm.get('categorySearch').setValue('');
    }


    updateChargesSelection(event) {
        const selectedCharges = this.dataForm.value.charges.map(charge => {
            if (!charge) {
                return {};
            }
            return charge;
        });
        this.selectedCharges = selectedCharges;
    }

    clearChargeSearch() {
        this.dataForm.get('chargeSearch').setValue('');
    }
    save() {
        const data = { ...this.dataForm.value };
        data.productId = this.productId;
        this.isLoading = true;
        this.productsService.massUpdate(data)
            .subscribe((res: any) => {
                this.isLoading = false;
                if (res.error) {
                    this.msg.show(res.msg, 'error');
                } else {
                    this.msg.show(res.msg, 'success');
                }
            });
    }

    ngOnDestroy() {
    }

}

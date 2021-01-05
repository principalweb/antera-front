import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { EcommerceProductsService } from 'app/features/e-commerce/products/products.service';

import { Category } from 'app/models';
import { unionBy,} from 'lodash';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'attach-category',
  templateUrl: './attach-category.component.html',
  styleUrls: ['./attach-category.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AttachCategoryComponent implements OnInit, OnDestroy {
  formData: any = { replaceCategory: false, categories: [], categorySearch: '' };
  categories: Category[] = [];
  selectedCategories: Category[] = [];
  productId: any[] = [];
  isLoading = false;
  dataForm: FormGroup;
  initialSubscription: Subscription;
  secondSubscription: Subscription;
  currentSearch: string;

  constructor(
      private msg: MessageService,
      private api: ApiService,
      public dialogRef: MatDialogRef<AttachCategoryComponent>,
      private fb: FormBuilder,
      private productsService: EcommerceProductsService,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit() {
    this.dataForm = new FormGroup({
        //categories: new FormControl(this.formData.categories),
        categorySearch: new FormControl(this.formData.categorySearch),
    });
    this.initialSubscription = this.dataForm.controls.categorySearch.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(searchText => {
            this.isLoading = true;
            let categoryTerm = {
                "offset": "0",
                "limit": "2000", //previously 10
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
        ], 'id');
    });
    //this.dataForm.controls.categorySearch.setValue('');
  }

  ngOnDestroy(){
    this.initialSubscription.unsubscribe();
  }

  onSelectedChange(e, category: Category){
    if (e.checked){
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories = this.selectedCategories.filter(el => el.id != category.id);
    }
  }

  filterCategories() {
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


  save() {
    if (this.selectedCategories.length > 0) {
      this.dialogRef.close({ ...this.selectedCategories });
    } else {
      this.msg.show('Please select category', 'error');
    }
  }
}

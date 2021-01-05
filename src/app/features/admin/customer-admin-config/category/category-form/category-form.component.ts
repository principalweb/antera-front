import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Subscription , Observable, interval } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { CategoryService } from 'app/core/services/category.service';
import { IntegrationService } from 'app/core/services/integration.service';
import { QbService } from 'app/core/services/qb.service';
import { CategoryLocations, CategoryDetail, Category } from 'app/models';

import { TaxCollection } from 'app/models/tax-collection';
import { TaxCategory } from 'app/models/tax-category';
import { RestParams } from 'app/models/rest-params';

import { map, startWith, debounce, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  onDataChanged: Subscription;
  onDataUpdated: Subscription;
  dataForm: FormGroup;
  formData: CategoryDetail = {id:"",category:"",qbExpenseAccount:"",qbIncomeAccount:"",qbAssetAccount:"",locations:[],taxJarCat:"0", taxJarObj: <TaxCategory>{}, qbClass: ''};
  dataId: string = '0';
  flAccounts: boolean = false;
  financialAccounts = {incomeAccounts:[],
                        expenseAccounts:[],
                        assetAccounts:[],
                        paymentAccounts:[]
                        };
  designLocations:CategoryLocations[] = [];

  // need to come up with a way to model rest filters
  filters = {
    terms: {
      name: ''
    },
    operator: {
      name: 'like'
    }
  }

  categories: Observable<TaxCategory[]>;

  newTaxCat = new FormControl();

  qbClass = [];

  constructor(
                private dataService: CategoryService,
                private qbService: QbService,
                public dialogRef: MatDialogRef<CategoryFormComponent>,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any,
                public integrationService: IntegrationService,
  ) {
      this.dataId = '0';
      if(this.data.id) {
          this.dataId = this.data.id;
      }
      this.dataForm = this.fb.group(this.formData);
      this.qbService.getClass('QBO')
        .subscribe((response: any[]) => {
          this.qbClass = response;
        },
        error => {
        });
  }

  ngAfterViewInit() {
  }

  ngOnInit() {
    this.categories = this.newTaxCat.valueChanges.pipe(
      debounce(() => interval(500)),
      startWith<string | TaxCategory>(''),
      switchMap(value => {
        const init = { page: 1, perPage: 20, order: 'name', orient: 'asc' };
        const params = new RestParams(init);
        this.filters.terms.name = (typeof value == "string" ? value : "");
        return this.integrationService.getTaxCategories(this.filters, params).pipe(
          map((res: TaxCollection) => {
            return res.data;
          })
        )
      }),
      map((res: TaxCategory[]) =>  {return res})
    )

      this.onDataUpdated =
        this.dataService.onDataUpdated
            .subscribe((savedData:any) => {
                this.loading = false;
                if(savedData.id != undefined) {
                    this.dataId = savedData.id;
                    this.loadData();
                }
            });

      this.onDataChanged =
        this.dataService.onDataChanged
            .subscribe((data:any) => {
                if(data && data.category != null) {
                    this.formData = data;
                }
                this.dataForm = this.fb.group({
                    id: new FormControl(this.formData.id),
                    category: new FormControl(this.formData.category),
                    qbExpenseAccount: new FormControl(this.formData.qbExpenseAccount),
                    qbIncomeAccount: new FormControl(this.formData.qbIncomeAccount),
                    qbAssetAccount: new FormControl(this.formData.qbAssetAccount),
                    locations: new FormControl(this.formData.locations),
                    taxJarCat: new FormControl(this.formData.taxJarCat),
                    qbClass: new FormControl(this.formData.qbClass),
                    });
                this.newTaxCat.setValue(this.formData.taxJarObj);
                this.loading = false;
            });

    this.getFinancialAccounts();
    this.loadData();

  }

  loadData() {
    if(this.dataId != '0') {
        this.loading = true;
        this.dataService.getData(this.dataId);
    }
    this.dataService.getLocations()
        .subscribe((response:any) => {
          this.designLocations = response;
        }, err => {
          console.log(err);
        });
  }

  save() {
    this.loading = true;
    // this.newTaxCat.value typeof is returning true even if it's null
    const val = (typeof this.newTaxCat.value === 'object' && this.newTaxCat.value !== null ? this.newTaxCat.value.id : null);
    this.dataForm.patchValue({taxJarCat: val});
    this.dataService.updateData(this.dataForm.value);
  }

  getFinancialAccounts() {
      this.qbService.getFinancialAccoounts()
          .subscribe((response:any) => {
              this.financialAccounts.incomeAccounts = response.incomeAccounts;
              this.financialAccounts.expenseAccounts = response.expenseAccounts;
              this.financialAccounts.assetAccounts = response.assetAccounts;
              this.financialAccounts.paymentAccounts = response.paymentAccounts;
          });
  }

  ngOnDestroy() {
      this.onDataUpdated.unsubscribe();
      this.onDataChanged.unsubscribe();
      this.dataId = '0';
  }

  displayFn(category?: TaxCategory): string | undefined {
    return category ? category.name : undefined;
  }
}

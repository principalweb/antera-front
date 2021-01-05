import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { AdditionalCharge } from 'app/models/additional-charge-extend';
import { Observable, forkJoin, interval } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { DefaultChargeTypes } from 'app/models';

import { IntegrationService } from 'app/core/services/integration.service';

import { debounce, startWith, switchMap, map } from 'rxjs/operators';

import { TaxCategory } from 'app/models/tax-category';
import { RestParams } from 'app/models/rest-params';
import { TaxCollection } from 'app/models/tax-collection';


@Component({
  selector: 'app-additional-charge-form',
  templateUrl: './additional-charge-form.component.html',
  styleUrls: ['./additional-charge-form.component.scss'],
})
export class AdditionalChargeFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  addChargeForm: FormGroup;
  
  addChargeDetails: AdditionalCharge;
  loading = false;
  chargeTypes = DefaultChargeTypes;

  loaded = () => {
      this.loading = false;
  }

  incomeAccounts = [];
  expenseAccounts = [];
  config: any;

  restParams: RestParams;
  categories: Observable<TaxCategory[]>;
  // need to come up with a way to model rest filters
  filters = {
    terms: {
      name: ''
    },
    operator: {
      name: 'like'
    }
  }

  constructor(
    public dialogRef: MatDialogRef<AdditionalChargeFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private api: ApiService,
    private integrationService: IntegrationService,
  )
  { 
    this.action = data.action;
    if ( this.action === 'edit' )
    {
      this.dialogTitle = 'Edit Deco Additional Charge';
      this.addChargeDetails = data.addChargeDetails;
      this.addChargeDetails.modifiedById = this.auth.getCurrentUser().userId;
      this.addChargeDetails.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.addChargeDetails.dateModified = new Date();
    }
    else
    {
      this.dialogTitle = 'Create Deco Additional Charge';
      this.addChargeDetails = new AdditionalCharge();
      this.addChargeDetails.showToCustomer = true;
      this.addChargeDetails.createdById = this.auth.getCurrentUser().userId;
      this.addChargeDetails.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.addChargeDetails.dateCreated = new Date();
    }

    this.addChargeForm = this.createAdditionalChargeForm();

    this.loading = true;
    forkJoin([
        this.api.getFinancialAccountList()])
        .subscribe((res: any) => {
            this.loading = false;
            this.incomeAccounts = res[0].incomeAccounts;
            this.expenseAccounts = res[0].expenseAccounts;
        });
  }

  createAdditionalChargeForm()
  {
    return this.formBuilder.group({
      name                : [this.addChargeDetails.name, Validators.required],
      description         : [this.addChargeDetails.description],
      cost                : [this.addChargeDetails.cost, Validators.required],
      price               : [this.addChargeDetails.price, Validators.required],
      item                : [this.addChargeDetails.item, Validators.required],
      chargeType          : [this.addChargeDetails.chargeType, Validators.required],
      itemCode            : [this.addChargeDetails.itemCode, Validators.required],
      displayOrder        : [this.addChargeDetails.displayOrder],
      showToCustomer      : [this.addChargeDetails.showToCustomer],
      incomeAccount       : [this.addChargeDetails.incomeAccount],
      expenseAccount      : [this.addChargeDetails.expenseAccount],
      taxable             : [this.addChargeDetails.taxable],
      taxJarObj           : [this.addChargeDetails.taxJarObj],
      discountable        : [this.addChargeDetails.discountable],
      rollbackDistributeRows : [this.addChargeDetails.rollbackDistributeRows],
      chargeGstTaxOnPo    : [this.addChargeDetails.chargeGstTaxOnPo],
      commissionable      : [this.addChargeDetails.commissionable],
      dateCreated         : [this.addChargeDetails.dateCreated],
      dateModified        : [this.addChargeDetails.dateModified],
      createdById         : [this.addChargeDetails.createdById],
      createdByName       : [this.addChargeDetails.createdByName],
      modifiedById        : [this.addChargeDetails.modifiedById],
      modifiedByName      : [this.addChargeDetails.modifiedByName],
      status              : [this.addChargeDetails.status],
    });
  }

  ngOnInit() 
  {
    this.api.getAdvanceSystemConfigAll({module: 'Orders'}).subscribe((res: any) => {
      if (res.settings) {
        this.config = res.settings;
      }
    });

    this.categories = this.addChargeForm.get("taxJarObj").valueChanges.pipe(
      debounce(() => interval(500)),
      startWith<string | TaxCategory>(''),
      switchMap(value => {
        const init = { page: 1, perPage: 20, order: 'name', orient: 'asc' }
        const params = new RestParams(init);
        value = typeof value === 'undefined' ? '' : value;
        this.filters.terms.name = (typeof value === 'string' ? value : value.name);
        return this.integrationService.getTaxCategories(this.filters, params).pipe(
          map((res: TaxCollection) => {
            return res.data;
          })
        )
      }),
      map((res: TaxCategory[]) =>  {return res})
    )

  }

  create() {
    if (this.addChargeForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    if (this.addChargeForm.value.cost <= 0 || this.addChargeForm.value.price <= 0) {
      this.msg.show('Cost and Price should be bigger than 0', 'error');
      return;
    }

    const data = {
      ...this.addChargeForm.value,
    }
    this.addChargeDetails.setData(data);
    this.dialogRef.close(this.addChargeDetails);
  }

  update() {
    if (this.addChargeForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const data = {
      ...this.addChargeForm.value,
      id: this.addChargeDetails.id
    }
    this.addChargeDetails.setData(data);
    this.dialogRef.close(this.addChargeDetails);
  }

  displayFn(category?: TaxCategory): string | undefined {
    return category ? category.name : undefined;
  }
}

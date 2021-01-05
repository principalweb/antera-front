import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { ProductPricingMethodService } from 'app/features/e-commerce/products/product-pricing/product-pricing-method.service';
import { Operator, PricingCostRangeInterface, PricingMarginDetailsInterface } from '../models/pricing-methods-interfaces';

@Component({
  selector: "app-new-pricing-method-dialog",
  templateUrl: './new-pricing-method-dialog.component.html',
  styleUrls: ['./new-pricing-method-dialog.component.scss'],
})
export class NewPricingMethodDialogComponent implements OnInit {
  dialogTitle: string;
  action: string;
  pricingLevelForm: FormGroup;
  disableAddPricingMethods = true;
  

  percentage: string = null;
  costMargin: PricingMarginDetailsInterface[] = [{qty: '0', margin: '0'}];
  costRange: PricingCostRangeInterface[] = [ {cost: '0', operator: Operator.LESS_THAN, marginDetails: this.costMargin}];
  quantityRange: Array<string> = [];

  newPricing = {};

  constructor(
    public dialogRef: MatDialogRef<NewPricingMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msg: MessageService,
    private fb: FormBuilder,
    private productPricingMethodService: ProductPricingMethodService
  ) {}

  ngOnInit(): void {
    this.pricingLevelForm = this.fb.group({
      pricingLevel: ['', Validators.required],
      pricingLevelType: ['1', Validators.required],
    });
    if (this.pricingLevelForm) {
      this.pricingLevelForm.valueChanges.subscribe((value) => {
        if (this.pricingLevelForm.valid) {
          this.disableAddPricingMethods = false;
        } else {
          this.disableAddPricingMethods = true;
        }
      });
    }
  }

  addPricingLevelMethod() {
    const pricingName = this.pricingLevelForm.get('pricingLevel').value;
    const pricingType = this.pricingLevelForm.get('pricingLevelType').value;
    const percentage = this.percentage;
    const costRange = this.costRange;
    const quantityRange = this.quantityRange;

    const newPricingLevel = {
      name: pricingName,
      dateEntered: new Date().toLocaleTimeString(),
      dateModified: new Date().toLocaleTimeString(),
      description: '',
      createdByName: '',
      createdById: '',
      modifiedByName: '',
      modifiedById: '',
      type: pricingType,
      percentage: percentage,
      costRange: costRange,
      quantityRange: quantityRange,
    };

    this.productPricingMethodService
      .createPricingMethodsWithPercentage(newPricingLevel)
      .subscribe((newPricing) => {
        console.log(
          'createPricingMethodsWithPercentage pricings.... ', newPricing
        );
        this.newPricing = newPricing;
      });
  }
}

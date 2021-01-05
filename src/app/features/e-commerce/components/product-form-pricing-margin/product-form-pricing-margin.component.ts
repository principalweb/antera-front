import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EcommerceProductService } from '../../product/product.service';

export interface Pricing {
  type: string;
  margin: string;
}

export interface PercentageRangeInterface {
  id: string;
  name: string;
  dateEntered: Date;
  dateModified: Date;
  description: string;
  createdByName: string;
  createdById: string;
  modifiedByName: string;
  modifiedById: string;
  type: string;
  percentage: string;
  costRange: Array<any>;
  quantityRange: Array<any>;
}

@Component({
  selector: "app-product-form-pricing-margin",
  templateUrl: './product-form-pricing-margin.component.html',
  styleUrls: ['./product-form-pricing-margin.component.scss'],
})
export class ProductFormPricingMarginComponent implements OnInit {
  pricingMarginForm: FormGroup;
  @Output() listLenght = new EventEmitter();
  @Input() currentPricingId;
  @Input() pricingName;

  currentMargin = '1';
  pricingMargins: Pricing[] = [
    { type: '1', margin: 'Margin On Cost' },
    { type: '2', margin: 'Margin On Cost Range' },
    { type: '3', margin: 'Percentage On Retail' },
  ];

  valueMargin = 0;
  valuesCost = 0;
  costMarginList = [];
  disableAddMargin = true;
  disableAddPercentage = true;
  disableAddAllMargins = true;

  constructor(
    private fb: FormBuilder,
    private productService: EcommerceProductService
    ) {}

  ngOnInit(): void {
    this.pricingMarginForm = this.fb.group({
      margin: [this.pricingMargins[0].type],
      percentage: ['', Validators.required],
      valueMargin: ['', Validators.required],
      valueCost: ['', Validators.required],
    });

    if (this.pricingMarginForm) {
      this.pricingMarginForm.valueChanges.subscribe((values) => {
        console.log(values);
        this.currentMargin = values.margin;

        if (this.pricingMarginForm.get('percentage').valid) {
          console.log('enable');
          this.disableAddPercentage = false;
        } else {
          console.log('disable');
          this.disableAddPercentage = true;
        }

        this.valueMargin = values.valueMargin;
        this.valuesCost = values.valueCost;
        if (
          this.pricingMarginForm.get('valueMargin').valid &&
          this.pricingMarginForm.get('valueCost').valid
        ) {
          this.disableAddMargin = false;
        } else {
          this.disableAddMargin = true;
        }

        if(this.costMarginList.length > 0){
          this.disableAddAllMargins = false;
        }else {
          this.disableAddAllMargins = true;
        }
      });
    }
  }

  addToCostMarginList() {
    const margin = this.pricingMarginForm.get('valueMargin').value;
    const cost = this.pricingMarginForm.get('valueCost').value;

    this.costMarginList.push({ cost: cost, margin: margin });
    this.calculateListHeight();
    this.pricingMarginForm.get('valueMargin').reset();
    this.pricingMarginForm.get('valueCost').reset();
  }

  removeFromList(index) {
    console.log('index ', index);
    if (index > -1) {
      this.costMarginList.splice(index, 1);
    }
  }

  calculateListHeight() {
    const calcultaedHeight = 250 + this.costMarginList.length * 30;
    const height = calcultaedHeight > 0 ? calcultaedHeight : 250;
    console.log('height to emit', height);
    this.listLenght.emit(height);
  }

  savePercentage() {
    const percentage = this.pricingMarginForm.get('percentage').value;
    
    const pricingPercentages: PercentageRangeInterface = {
      id: this.currentPricingId,
      name: this.currentPricingId,
      dateEntered: new Date(),
      dateModified: new Date(),
      description: '',
      createdByName: 'Antera Support',
      createdById: '100ba87a-cb40-4407-9bef-4fe3a7d8a367',
      modifiedByName: 'Antera Support',
      modifiedById: '100ba87a-cb40-4407-9bef-4fe3a7d8a367',
      type: this.currentMargin,
      percentage: percentage,
      costRange: this.costMarginList,
      quantityRange: this.costMarginList,
    };

    this.pricingMarginForm.get('valueMargin').reset();
    
    this.productService.updatePricingPercentages(pricingPercentages).subscribe( (val) => {
      console.log('val from post ', val);
    });
    this.resetFields();

  }

  savePercentageMargin(event){
    event.preventDefault();
    // const percentage = this.pricingMarginForm.get('percentage').value;
    const pricingPercentages: PercentageRangeInterface = {
      id: this.currentPricingId,
      name: this.currentPricingId,
      dateEntered: new Date(),
      dateModified: new Date(),
      description: '',
      createdByName: 'Antera Support',
      createdById: '100ba87a-cb40-4407-9bef-4fe3a7d8a367',
      modifiedByName: 'Antera Support',
      modifiedById: '100ba87a-cb40-4407-9bef-4fe3a7d8a367',
      type: this.currentMargin,
      percentage: '0',
      costRange: this.costMarginList,
      quantityRange: [],
    };
    //send to api 

    this.productService.updatePricingPercentages(pricingPercentages).subscribe( (val) => {
      console.log('val from post ', val);
    });
    // this.resetFields();
  }

  selectionChange(event){
    console.log('event ... ', event);
    this.resetFields();
  }

  private resetFields() {
    this.pricingMarginForm.get('valueMargin').reset();
    this.pricingMarginForm.get('valueCost').reset();
    this.pricingMarginForm.get('percentage').reset();
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { EcommerceProductService } from 'app/features/e-commerce/product/product.service';
import { ProductPricingMethodService } from 'app/features/e-commerce/products/product-pricing/product-pricing-method.service';
import { MediaDialogComponent } from 'app/shared/media-dialog/media-dialog.component';

export interface Pricing {
  type: string;
  margin: string;
}

export interface CostInterface {
  cost: string;
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

export interface CreatePricingMethodInterface {
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
  costRange: Array<{ any }>;
  quantityRange: Array<string>;
}

export interface PricingMethodInterface {
  costRange: Array<CostInterface>;
  createdById: string;
  createdByName: string;
  dateEntered: Date;
  dateModified: Date;
  description: string;
  id: string;
  modifiedById: string;
  modifiedByName: string;
  name: string;
  percentage: string;
  quantityRange: Array<any>;
  type: string;
}

// "costRange": [{"1":"45"}],

@Component({
  selector: "app-pricing",
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent implements OnInit {
  pricingMarginForm: FormGroup;
  pricingLevelForm: FormGroup;
  // @Output() listLenght = new EventEmitter();
  // @Input() currentPricingId;
  // @Input() pricingName;

  displayedColumns: string[] = [
    'name',
    'percentage',
    'quantityRange',
    'costRange',
  ];

  selected = new FormControl(0);
  pricingLevels: Array<any> = [];
  minlistLenghtHeight = '300';
  currentMargin = '1';
  currentPricingType = '1';
  pricingMargins: Pricing[] = [
    { type: '1', margin: 'Margin On Cost' },
    { type: '2', margin: 'Margin On Cost Range' },
    { type: '3', margin: 'Percentage On Retail' },
  ];

  existingPricingMethods = [];
  editingPricingName: string;
  currentPricingName = '';
  currentPricingId = '';

  valueMargin = 0;
  valuesCost = 0;
  showForm = false;

  costMarginList = [];
  pricingLevelMethodList = [];

  disableAddMargin = true;
  disableAddPercentage = true;
  disableAddAllMargins = true;
  disableAddPricingMethods = true;
  disableSavePricingMethods = true;


  updatingCostRange: string;
  updatingCreatedById: string;
  updatingCreatedByName: string;
  updatingDateEntered: string;
  updatingDateModified: string;
  updatingDescription: string;
  updatingId: string;
  updatingModifiedById: string;
  updatingModifiedByName: string;
  updatingName: string;
  updatingPercentage: string;
  updatingQuantityRange: string;
  updatingType: string;

  loading = false;
  confirmDialogRef: MatDialogRef<any>;
  dialogRef: MatDialogRef<MediaDialogComponent>;
  currentIndex = 0;
  newPricingLevel;
  editPricing = false;

  margin = '';
  percentage = '';
  pricingMethodName = '';

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private productService: EcommerceProductService,
    private productPricingMethodService: ProductPricingMethodService,
    public msg: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPricingMethods();
    // const pricing = this.productPricingMethodService.getPricingMethodList().toPromise();
    this.pricingMarginForm = this.fb.group({
      margin: [this.pricingMargins[0].type],
      percentage: ['', Validators.required],
      percentageRange: ['', Validators.required],
      valueMargin: ['', Validators.required],
      valueCost: ['', Validators.required],
      pricingMethodName: ['default'],
    });

    this.pricingLevelForm = this.fb.group({
      pricingLevel: [],
    });

    if (this.pricingLevelForm) {
      this.pricingLevelForm.valueChanges.subscribe((value) => {
        if (this.pricingLevelForm.get('pricingLevel').valid) {
          console.log('enable');
          this.disableAddPricingMethods = false;
        } else {
          console.log('disable');
          this.disableAddPricingMethods = true;
        }

        if (this.pricingLevelMethodList.length > 0) {
          this.disableSavePricingMethods = false;
        } else {
          this.disableSavePricingMethods = true;
        }
      });
    }

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

        if (this.costMarginList.length > 0) {
          this.disableAddAllMargins = false;
        } else {
          this.disableAddAllMargins = true;
        }
      });
    }

    // this.productPricingMethodService.getProductPricingDetails()
  }

  private loadPricingMethods() {
    this.productPricingMethodService
      .getPricingMethodList()
      .subscribe((pricingMethods: []) => {
        console.log('pricingMethods ', pricingMethods);
        pricingMethods.forEach((pricingMethod) => {
          this.pricingLevelMethodList.push(pricingMethod);
        });
      });
  }

  addToCostMarginList() {
    const margin = this.pricingMarginForm.get('valueMargin').value;
    const cost = this.pricingMarginForm.get('valueCost').value;

    this.costMarginList.push({ cost: cost, margin: margin });
    this.calculateListHeight();
    this.pricingMarginForm.get('valueMargin').reset();
    this.pricingMarginForm.get('valueCost').reset();
  }

  addPricingLevelMethodList() {
    const pricingLevel = this.pricingLevelForm.get('pricingLevel').value;
    const newPricingLevel: PricingMethodInterface = {
      costRange: [],
      createdById: '100ba87a-cb40-4407-9bef-4fe3a7d8a367',
      createdByName: 'Antera Support',
      dateEntered: new Date(),
      dateModified: new Date(),
      description: '',
      id: '',
      modifiedById: '100ba87a-cb40-4407-9bef-4fe3a7d8a367',
      modifiedByName: 'Antera Support',
      name: pricingLevel,
      percentage: '0',
      quantityRange: [],
      type: '',
    };
    this.pricingLevelMethodList.push(newPricingLevel);
    // this.calculateListHeight();
    this.pricingLevelForm.get('pricingLevel').reset();
    this.productPricingMethodService.createPricingMethodsWithPercentage(newPricingLevel).subscribe( (value) => {
      console.log('value ', value);
    });    

  }

  removeFromList(id, index) {

    this.editPricing = false;
    this.productPricingMethodService
      .deletePricingLevelMethods(id)
      .subscribe((response) => {
        console.log('response ', response);
        this.pricingLevelMethodList = [
          ...this.pricingLevelMethodList.splice(index, 0),
        ];
        this.loadPricingMethods();
      });
  }

  edit(pricing) {
    this.updatingCostRange = pricing.costRange;
    this.updatingCreatedById = pricing.createdById;
    this.updatingCreatedByName = pricing.createdByName;
    this.updatingDateEntered = pricing.dateEntered;
    this.updatingDateModified = pricing.dateModified;
    this.updatingDescription = pricing.description;
    this.updatingId = this.currentPricingId = pricing.id; 
    this.updatingModifiedById = pricing.ModifiedById,
    this.updatingModifiedByName = pricing.ModifiedByName,
    this.updatingName = this.currentPricingName = pricing.name;
    this.updatingPercentage = this.percentage = pricing.percentage;
    this.updatingQuantityRange = pricing.quantityRange;
    this.updatingType = this.currentPricingType = pricing.type;

    console.log('pricing ', pricing);
    this.editPricing = true;  
    this.editingPricingName = pricing.name;
    this.currentPricingId = pricing.id;
    this.costMarginList = pricing.costRange;
    const margin = pricing.margin !== undefined ? pricing.margin : '';
    const percentage = pricing.percentage  !== undefined ? pricing.percentage : '';
    const pricingMethodName = pricing.pricingMethodName !== undefined ? pricing.pricingMethodName : '';
    this.currentMargin = '1';
    this.currentPricingId = pricing.id;
    this.currentPricingName = pricing.name;
    this.currentPricingType = pricing.type;
    this.pricingMarginForm.get('margin').patchValue(margin);
    this.pricingMarginForm.get('percentage').patchValue(percentage);
    this.pricingMarginForm.get('pricingMethodName').patchValue(this.editingPricingName);
  }

  calculateListHeight() {
    const calcultaedHeight = 250 + this.costMarginList.length * 30;
    const height = calcultaedHeight > 0 ? calcultaedHeight : 250;
    console.log('height to emit', height);
    // this.listLenght.emit(height);
  }

  savePercentage() {

    const percentage = this.pricingMarginForm.get('percentage').value;

    const pricingUpdate = {
        costRange: this.updatingCostRange,
        createdById:  this.updatingCreatedById,
        createdByName:  this.updatingCreatedByName,
        dateEntered: this.updatingDateEntered ,
        dateModified: new Date(),
        description: this.updatingDescription,
        id: this.updatingId,
        modifiedById: '',
        modifiedByName: '',
        name: this.updatingName,
        percentage: percentage,
        quantityRange: this.updatingQuantityRange,
        type: this.updatingType
    };

    this.pricingMarginForm.get('percentage').reset();

    this.productService
      .updatePricingPercentages(pricingUpdate)
      .subscribe((val) => {
        console.log('val from post ', val);
        this.pricingLevelMethodList = [];
        this.loadPricingMethods();
        this.editPricing = false;
      });
  }


  savePercentageWithPricingLevel() {

    const percentageRange = this.pricingMarginForm.get('percentageRange').value;

    // const percentage = this.pricingMarginForm.get('percentage').value;

    const pricingUpdate = {
      costRange: this.updatingCostRange,
      createdById:  this.updatingCreatedById,
      createdByName:  this.updatingCreatedByName,
      dateEntered: this.updatingDateEntered ,
      dateModified: new Date(),
      description: this.updatingDescription,
      id: this.updatingId,
      modifiedById: '',
      modifiedByName: '',
      name: this.updatingName,
      percentage: this.updatingPercentage,
      quantityRange: [percentageRange],
      type: this.updatingType
    };
    // send to api

    console.log(' pricing uodating with ... ', pricingUpdate);
    this.productService
      .updatePricingPercentages(pricingUpdate)
      .subscribe((val) => {
        console.log('val from post ', val);
        this.pricingLevelMethodList = [];
        this.loadPricingMethods();
        this.editPricing = false;
      });
  }

  savePercentageMargin(event) {
    event.preventDefault();
    const percentage = this.pricingMarginForm.get('percentage').value;
    const pricingPercentages = {
      costRange: this.updatingCostRange,
      createdById:  this.updatingCreatedById,
      createdByName:  this.updatingCreatedByName,
      dateEntered: this.updatingDateEntered ,
      dateModified: new Date(),
      description: this.updatingDescription,
      id: this.updatingId,
      modifiedById: '',
      modifiedByName: '',
      name: this.updatingName,
      percentage: percentage,
      quantityRange: this.updatingQuantityRange,
      type: this.updatingType
    };
    
    console.log('pricingPercentages', pricingPercentages);

    // this.costMarginList;
    // send to api

    this.productService
      .updatePricingPercentages(pricingPercentages)
      .subscribe((val) => {
        console.log('val from post ', val);
        this.pricingLevelMethodList = [];
        this.loadPricingMethods();
      });
    // this.resetFields();
    
  }

  // savePricingLevelMethodList(event) {}

  selectionChange(event) {
    console.log('event ... ', event);
    // this.resetFields();
  }

  private resetFields() {
    this.pricingMarginForm.get('valueMargin').reset();
    this.pricingMarginForm.get('valueCost').reset();
    this.pricingMarginForm.get('percentage').reset();
  }

  selectedTabChanged(changes) {
    this.currentIndex = changes.index;

    // this.loadCurrentProduct();
  }

  toggleNewPricingForm() {
    this.showForm = !this.showForm;
  }

  deletePricingLevel() {
    const pricingId = this.pricingLevels[this.currentIndex].id;
    const pricingName = this.pricingLevels[this.currentIndex].name;

    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false,
    });
    this.confirmDialogRef.componentInstance.confirmMessage = `Are you sure you want to delete " ${pricingName} " pricing method?`;

    this.confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loading = true;
        this.productPricingMethodService
          .deletePricingMethods(pricingId)
          .subscribe((respons) => {
            // this.loadPricingMethods();
          });
        this.productService
          .deletePricingMethods([pricingId.toString()])
          .subscribe(
            (response) => {
              if (response) {
                // this.loadProducts();
                this.loading = false;
              }
            },
            (err) => {
              this.loading = false;
              this.confirmDialogRef = null;
              this.msg.show('Unable to delete pricing method', 'error');
            }
          );
      }
      this.confirmDialogRef = null;
    });
    return;
  }
}

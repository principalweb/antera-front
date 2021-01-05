import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { ProductPricingMethodService } from 'app/features/e-commerce/products/product-pricing/product-pricing-method.service';
import {
  Operator,
  PricingCostRangeInterface,
  PricingMarginDetailsInterface,
  PricingMethodBreaksInterface,
  UpdateCostRangeInterface,
  UpdatePricingMethodBreaksInterface,
} from '../models/pricing-methods-interfaces';
import { NewPricingMethodDialogComponent } from '../new-pricing-method-dialog/new-pricing-method-dialog.component';

export interface UpdatePricingRowInterface {
  id: string;
  methodType: string;
  name: string;
  operator: string;
  range: string;
  type: string;
}
@Component({
  selector: "app-edit-pricing-method-dialog-component",
  templateUrl: './edit-pricing-method-dialog-component.html',
  styleUrls: ['./edit-pricing-method-dialog-component.scss'],
})
export class EditPricingMethodDialogComponent implements OnInit {
  dialogTitle: string;
  action: string;
  pricingLevelForm: FormGroup;
  disableAddPricingMethods = true;

  pricingMethod: UpdatePricingRowInterface;
  pricingMethodPercentage: any;
  pricingMethodMargin: any;
  pricingMethodType = '';
  pricingMethodTypeNumber = '1';
  selectedRange: number;
  numberOfColuns = 1;
  columnContainerWidth = 200;
  editCostRangeMethods = [];

  priceBreaks: string[] = [];
  newPriceBreak: string;

  percentage = '0';
  costMargin: PricingMarginDetailsInterface[] = [{ qty: '0', margin: '0' }];
  costRange: PricingCostRangeInterface[] = [
    { cost: '0', operator: Operator.LESS_THAN, marginDetails: this.costMargin },
  ];
  quantityRange: Array<string> = ['0'];
  rowToEdit: any = [];
  editingPricingId = '';
  editingNameOnly = {};

  operators = {
    less: { icon: 'chevron_left', value: Operator.LESS_THAN, viewValue: '<' },
    greater: {
      icon: 'chevron_right',
      value: Operator.GREATER_THAN,
      viewValue: '>',
    },
    equal: { icon: 'drag_handle', value: Operator.EQUAL, viewValue: '=' },
  };

  operatorOptions = [
    this.operators.less,
    this.operators.greater,
    this.operators.equal,
  ];

  constructor(
    public dialogRef: MatDialogRef<NewPricingMethodDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msg: MessageService,
    private fb: FormBuilder,
    private productPricingMethodService: ProductPricingMethodService
  ) {}

  ngOnInit(): void {
    console.log('data being loaded ... ', this.data);
    this.editingPricingId = this.data.action.id;
    console.log('editing item id ', this.editingPricingId);
    this.editingNameOnly = this.data.action;
    this.editCostRangeMethods = this.data.editCostRangeMethod;
    this.selectedRange = this.data.action.range;
    this.pricingMethodTypeNumber = this.data.pricingMethodTypeNumber;
    this.numberOfColuns = this.data.columns.length;
    this.columnContainerWidth = 200 * this.numberOfColuns;
    this.pricingMethod = this.data.action;
    this.pricingMethodPercentage = this.data.action;
    this.pricingMethodMargin = this.data.action;
    
    this.pricingMethodType = this.pricingMethod.type;
    const rangesPricing = this.data.rangesPricing;

    let quantityRange = 0;
    if (this.data.action) {
      quantityRange = this.data.action.quantityRange;
    }
    this.pricingLevelForm = this.fb.group({
      name: [this.pricingMethod.name, Validators.required],
      rangeOnMarginCost: [quantityRange],
      percentageOfRetail: [this.data.action.percentage],
      pricingLevels: this.fb.array([]),
    });

        this.data.columns.forEach((column) => {
          this.addPricingLevels(rangesPricing, column);
        });

    if (this.pricingLevelForm) {
      this.pricingLevelForm.valueChanges.subscribe((value) => {
        console.log('rangeOnMarginCost ' , value);
        if (this.pricingLevelForm.valid) {
          this.disableAddPricingMethods = false;
        } else {
          this.disableAddPricingMethods = true;
        }
      });
    }
  }

  drop(event: CdkDragDrop<number[]>) {
    moveItemInArray(this.priceBreaks, event.previousIndex, event.currentIndex);
  }

  pushToList(){
    if (this.newPriceBreak) {
      this.priceBreaks.push( this.newPriceBreak.toString());
      this.newPriceBreak = null; 
    }
 }

 remove(priceBreak: string): void {
   const index = this.priceBreaks.indexOf(priceBreak);

   if (index >= 0) {
     this.priceBreaks.splice(index, 1);
   }
 }

  addPricingLevels(pricingLevel, column) {
    const qty = pricingLevel.marginDetailQty;
    const margin = pricingLevel.marginDetailMargin;
    const range = pricingLevel.range;
    const operator = pricingLevel.operator;
    const type = pricingLevel.methodType;

    const percentage = pricingLevel.percentage;
    const quantityRange = pricingLevel.quantityRange;
    const marginOnItem =  pricingLevel[column];

    const levels = this.pricingLevelForm.controls.pricingLevels as FormArray;
    levels.push(
      this.fb.group({
        type: [type],
        range: [range, Validators.required],
        qty: [column],
        margin: [marginOnItem],
        operator: [operator],
        percentage: [percentage],
        quantityRange: [quantityRange],
      })
    );
  }

  updatedefaultMethodName(){
    console.log('editingNameOnly ... ', this.editingNameOnly);
    const name = this.pricingLevelForm.value.name;
     console.log('new name .... ', name); 

  const updatePricingLevel: UpdatePricingMethodBreaksInterface = {
    id: this.pricingMethod.id,
    name: name,
    dateEntered: '',
    dateModified: new Date().toLocaleTimeString(),
    description: '',
    createdByName: '',
    createdById: '',
    modifiedByName: '',
    modifiedById: '',
    type: '',
    percentage: null,
    costRange: null,
    quantityRange: [],
  };


    this.productPricingMethodService
    .updatePricingMethodList(updatePricingLevel)
    .subscribe((updatedPricings) => {
      console.log('updated pricings.... ', updatedPricings);
    });

  }

  trackByFn(index) {
    return index;
  }

  updateOperator(event) {
    console.log('event from operator changing ', event);
  }

  updatePricingLevelMethodList() {
    const name = this.pricingLevelForm.value.name;
    const pricingLevels = this.pricingLevelForm.value.pricingLevels;

    const costRanges: PricingCostRangeInterface[] = [];
    const costRange: PricingCostRangeInterface = {
      cost: '0',
      operator: 'LESS_THAN',
      marginDetails: ([] = []),
    };

    // const marginDetail: PricingMarginDetailsInterface = { qty: '', margin: ''};

    if (pricingLevels) {
      pricingLevels.forEach((element: UpdateCostRangeInterface) => {
        console.log('elemnt to build cost range', element);
        if(costRanges.length > 0 ){

          costRanges.forEach((existingPricing, index) => {
            if(existingPricing.cost === element.range){
              const marginDetail: PricingMarginDetailsInterface = { qty: element.qty, margin: element.margin};
              costRanges[index].marginDetails.push(marginDetail);
            } else {
              const marginDetail: PricingMarginDetailsInterface = { qty: element.qty, margin: element.margin};
              const newCostRange: PricingCostRangeInterface = {
                cost: element.range,
                operator: element.operator,
                marginDetails: [marginDetail]
              };
              console.log('cost ranges ----- ', costRanges);
              if(costRanges.includes(newCostRange)){
                console.log('already included .... ', newCostRange);
              } else {
                console.log('not already included .... ', newCostRange);
                costRanges.push(newCostRange);
              }
            }
          });
        } else {
          const marginDetail: PricingMarginDetailsInterface = { qty: element.qty, margin: element.margin};
          const newCostRange: PricingCostRangeInterface = {
            cost: element.range,
            operator: element.operator,
            marginDetails: [marginDetail]
          };
          costRanges.push(newCostRange);
        }
        // this.calculatePricingCostRange(costRanges, element, costRange);

      });
    }

    console.log('cost ranges ----- for one pricing >', costRanges);

    const originalPricing = this.editCostRangeMethods;
    console.log('original pricing ... ', originalPricing);

   const updatedpricing =  originalPricing.forEach(detail => {
      return costRanges.forEach((costRangeDetail) => {
        console.log('costRangeDetail .... ', costRangeDetail);
        
        detail.costRange.forEach(detailRange => {
          if(detailRange.cost === costRangeDetail.cost){
            console.log('marginDetails ', detailRange);
            console.log('costRangeDetail inner loop.... ', costRangeDetail);
            detailRange.marginDetails = costRangeDetail.marginDetails;
            detailRange.operator = costRangeDetail.operator;
          }

        });
      });
    });
    

    console.log('original pricing after adding ... ', originalPricing);


    // create-pricing-methods
    console.log('upadting cost ranges for saving ', originalPricing[0]);
  
    console.log('updatedpricing ... ', updatedpricing);

  //  const updated = originalPricing[0];
    const updatePricingLevel: UpdatePricingMethodBreaksInterface = {
      id: this.pricingMethod.id,
      name: name,
      dateEntered: '',
      dateModified: new Date().toLocaleTimeString(),
      description: '',
      createdByName: '',
      createdById: '',
      modifiedByName: '',
      modifiedById: '',
      type: this.pricingMethodTypeNumber,
      percentage: null,
      costRange: originalPricing[0].costRange,
      quantityRange: [],
    };

console.log('updatePricingLevel -----> ', updatePricingLevel);
    this.productPricingMethodService
      .updatePricingMethodList(updatePricingLevel)
      .subscribe((updatedPricings) => {
        console.log('updated pricings.... ', updatedPricings);
      });
  }

  private calculatePricingCostRange(costRanges: PricingCostRangeInterface[], element: any, costRange: PricingCostRangeInterface) {
    if (costRanges.length > 0) {
      costRanges.forEach((singleCostRange) => {
        if (singleCostRange.cost === element.range) {
          costRange.operator = element.operator;
          if (element.marginDetails) {
            if (element.marginDetails.length > 0) {
              element.marginDetails.forEach((margin) => {
                console.log('margin ... ', margin);
              });
            }
          } else {
            const marginDetail: PricingMarginDetailsInterface = {
              qty: element.qty,
              margin: element.margin,
            };
            costRange.marginDetails.push(marginDetail);
          }
        } else {
          costRange.cost = element.range;
          costRange.operator = element.operator;
        }
      });
    } else {
      costRange.cost = element.range;
      costRange.operator = element.operator;
      const marginDetail: PricingMarginDetailsInterface = {
        qty: element.qty,
        margin: element.margin,
      };
      costRange.marginDetails.push(marginDetail);
      costRanges.push(costRange);
    }
  }

  updatePricingPercentage() {
    const name = this.pricingLevelForm.get('name').value;
    const percentageOfRetail = this.pricingLevelForm.get('percentageOfRetail')
      .value;

    const updatePricingLevel: UpdatePricingMethodBreaksInterface = {
      id: this.pricingMethod.id,
      name: name,
      dateEntered: '',
      dateModified: new Date().toLocaleTimeString(),
      description: '',
      createdByName: '',
      createdById: '',
      modifiedByName: '',
      modifiedById: '',
      type: this.pricingMethodTypeNumber,
      percentage: percentageOfRetail,
      costRange: [],
      quantityRange: [],
    };

    console.log('updating pricing level ', updatePricingLevel);
    // create-pricing-methods
    this.productPricingMethodService
      .updatePricingMethodList(updatePricingLevel)
      .subscribe((updatedPricings) => {
        console.log('updated pricings.... ', updatedPricings);
      });
  }

  updatePricingRangeOnMarginCost() {

    const name = this.pricingLevelForm.get('name').value;
    const rangeOnMarginCost = this.pricingLevelForm.get('rangeOnMarginCost')
      .value;
      // const rangeOnMarginCost = this.priceBreaks;
    const updatePricingLevel: UpdatePricingMethodBreaksInterface = {
      id: this.pricingMethod.id,
      name: name,
      dateEntered: '',
      dateModified: new Date().toLocaleTimeString(),
      description: '',
      createdByName: '',
      createdById: '',
      modifiedByName: '',
      modifiedById: '',
      type: this.pricingMethodTypeNumber,
      percentage: null,
      costRange: [],
      quantityRange: [rangeOnMarginCost],
    };
    console.log(' updatePricingLevel ', updatePricingLevel);
    // create-pricing-methods
    this.productPricingMethodService
      .updatePricingMethodList(updatePricingLevel)
      .subscribe((updatedPricings) => {
        console.log('updated pricings.... ', updatedPricings);
      });
  }
}

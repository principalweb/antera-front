import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { ProductPricingMethodService } from 'app/features/e-commerce/products/product-pricing/product-pricing-method.service';
import { method, values } from 'lodash';
import { Operator, PricingCostRangeInterface, PricingMarginDetailsInterface, PricingMethodBreaksInterface, UpdatePricingLevelRange } from '../models/pricing-methods-interfaces';

@Component({
  selector: 'app-new-price-range-dialog',
  templateUrl: './new-price-range-dialog.component.html',
  styleUrls: ['./new-price-range-dialog.component.scss']
})
export class NewPriceRangeDialogComponent implements OnInit {
  dialogTitle: string;
  action: string;
  pricingLevelForm: FormGroup;
  disableAddPricingMethods = true;

  priceBreaks: string[] = [];
  initialRangeSet = [];

  newPriceBreak: string;

  percentage: string = null;
  costMargin: PricingMarginDetailsInterface[] = [{qty: '0', margin: '0'}];
  costRange: PricingCostRangeInterface[] = [ {cost: '0', operator: Operator.LESS_THAN, marginDetails: this.costMargin}];
  quantityRange: Array<string> = [];

  newPricing = {};

  constructor(
    public dialogRef: MatDialogRef<NewPriceRangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msg: MessageService,
    private fb: FormBuilder,
    private productPricingMethodService: ProductPricingMethodService
  ) {}

  ngOnInit(): void {
    let methods = [];
    this.pricingLevelForm = this.fb.group({
      pricingLevel: ['', Validators.required],
      pricingLevelType: ['1', Validators.required],
      pricingLevels: this.fb.array([]),
    });
    if (this.pricingLevelForm.controls.pricingLevels) {
      this.pricingLevelForm.controls.pricingLevels.valueChanges.subscribe((value) => {
        this.disableAddPricingMethods = this.pricingLevelForm.controls.pricingLevels.invalid;
      });
    }
    methods = this.data.pricingMethods;
    console.log('loading methods .... ', methods);
    const levels = this.pricingLevelForm.controls.pricingLevels as FormArray;
    methods.forEach((method: any) => {
      console.log('method from pricing methods ... ', method);
      if(method.type === '2'){
        const ranges = [];
        console.log('method type ', method);
        if (method.costRange.length > 0) {
          const existingRangeSet = [];
          method.costRange.forEach((costRange: any) => {
            existingRangeSet.push(costRange.cost);
          console.log('method type cost range  ', costRange);

          });
          console.log('existingRangeSet.... ', existingRangeSet );
          this.initialRangeSet = [... existingRangeSet];
          console.log('with price range value ', method);
          const name = method.name;
          const type = method.type;
          const range = null;
          const rangeSet = [... existingRangeSet];
          const id = method.id;
        const levelPricing = {method: method, name: name, type: type, range: range, rangeSet: rangeSet, id: id};

          ranges.push(levelPricing);
        } else {
          console.log('no price range value ', method);
          const name = method.name;
          const type = method.type;
          // const method = method;
          const range = null;
          const rangeSet = [null];
          const id = method.id;
        const levelPricing = {method: method, name: name, type: type, range: range, rangeSet: rangeSet, id: id};

        // console.log('method type cost range  ', costRange);
        ranges.push(levelPricing);

        }
        ranges.forEach(range => {
          levels.push(
            this.fb.group({
              type: [range.type],
              name: [range.name],
              range: [null],
              rangeSet: [range.rangeSet],
              id: [range.id],
              method: method,
            })
          );
        });
      }
    });
  }

  trackByFn(index) {
    return index;
  }

  updatePricingLevelsRanges(){
    const pricingLevels = this.pricingLevelForm.controls.pricingLevels.value;
    console.log('all vals ', pricingLevels);
    // const marginDetails: PricingMarginDetailsInterface[] = [];
    let pricingMethods: PricingCostRangeInterface[] = [];
    let indexCounter = [];

    pricingLevels.forEach( (level: UpdatePricingLevelRange) => {
      console.log('level of UpdatePricingLevelRange ' , level);
      console.log('initialRangeSet .... ', this.initialRangeSet);
            //  console.log('cost Range .... ', costRange);

      console.log('level range set ', level.rangeSet);
      const removedRanges  = this.initialRangeSet.filter(x => !level.rangeSet.includes(x));
      console.log(' removed ranges', removedRanges);

      console.log('level range set ', level.rangeSet);
      const addedRanges  =  level.rangeSet.filter(x => !this.initialRangeSet.includes(x));
      console.log('added ranges', addedRanges);
      // this.initialRangeSet.forEach((elementNotUpdated) => {
        level.method.costRange.forEach((costRange) => {
          console.log('costRange..... ', costRange);
          // console.log('elementNotUpdated .....', elementNotUpdated);
        // });
      });

      if(removedRanges.length > 0){
        level.rangeSet.forEach((levelRange) => {
          console.log('level range y .... ', levelRange);

          level.method.costRange.forEach((costRange) => {
            console.log('costRange y..... ', costRange);
            console.log('level range y.... ', levelRange);
            if(costRange.cost === levelRange){
              pricingMethods.push(costRange);
            }
          // });
        });

        });
      }

      if(addedRanges.length > 0){

        addedRanges.forEach((newRange) => {
          console.log('level range x .... ', newRange);
          const pricingMethod: PricingCostRangeInterface = {
          cost: newRange,
          operator: Operator.LESS_THAN,
          marginDetails: this.costMargin
        };
        pricingMethods.push(pricingMethod);
        });

        this.initialRangeSet.forEach((notUpdated) => {
          console.log('not updated ...... ', notUpdated);

          level.method.costRange.forEach((existingMethod) => {
            console.log('existing nethod ', existingMethod);
            if (existingMethod.cost === notUpdated) {
              pricingMethods.push(existingMethod);
            }
          });
        });

        //   level.method.costRange.forEach((costRange) => {
        //     console.log('costRange y..... ', costRange);
        //     console.log('level range y.... ', levelRange);
        //     if(costRange.cost === levelRange){
        //       pricingMethods.push(costRange);
        //     }
        //   // });
        // });
      }

      // addedRanges.forEach((updatedRange) => {
      // const pricingMethod: PricingCostRangeInterface = {
      //         cost: updatedRange,
      //         operator: level.operator,
      //         marginDetails: level.marginDetails
      //       };
      //       pricingMethods.push(pricingMethod);
      // });


      // level.rangeSet.forEach((range) => {
      //   console.log('range .... ', range);
      //   console.log('range set to get index ... ', range);
      //  if ( this.initialRangeSet.includes(range) ) {

      //  }
      //   level.method.costRange.forEach( (costRange) => {

      //        console.log('initialRangeSet .... ', this.initialRangeSet);
      //        console.log('cost Range .... ', costRange);
      //       //  if(this.initialRangeSet.includes(range) ){
      //          console.log('existing value range ', range);
      //          console.log(' === costRange ... ', costRange);
      //          console.log(' ==== range ... ', range);
      //          pricingMethods.push(costRange);
      //          indexCounter.push(range);
      //          console.log('indexCounter ', indexCounter);
            //  }
          // if (costRange.cost === range) {
          //   console.log(' === costRange ... ', costRange);
          //   console.log(' ==== range ... ', range);
          //   pricingMethods.push(costRange);
          //   indexCounter.push(range);
          //   console.log('indexCounter ', indexCounter);

          // }
          //  else if(costRange.cost !== range && !indexCounter.includes(range)) {
          //   console.log(' !== costRange ... ', costRange);
          //   console.log(' !=== range ... ', range);
          //   console.log('indexCounter ', indexCounter);
          //   indexCounter.push(range);
          //   const pricingMethod: PricingCostRangeInterface = {
          //     cost: range,
          //     operator: level.operator,
          //     marginDetails: level.marginDetails
          //   };
          //   pricingMethods.push(pricingMethod);
          // }
        // });
          // indexCounter = [];
      // });


      // level.rangeSet.forEach((range) => {
      //   console.log('range set ... ', range);
      //   const pricingMethod: PricingCostRangeInterface = {
      //     cost: range,
      //     operator: level.operator,
      //     marginDetails: level.marginDetails
      //   };
      //   pricingMethods.push(pricingMethod);
      // });

      this.addPricingLevelMethod(pricingMethods, level);
      pricingMethods = [];
    });
  }

  addPricingLevelMethod(pricingMethods, level: UpdatePricingLevelRange) {
    console.log('pricingMethods for update ... ', pricingMethods);
    const id = level.id;
    const pricingName = level.name;
    const pricingType = level.type;
    const percentage = level.percentage;
    const costRange = pricingMethods;
    const quantityRange = level.quantityRange;

    const newPricingLevel = {
      id: id,
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

    console.log(' newPricingLevel ', newPricingLevel);
    this.productPricingMethodService
      .updatePricingMethodList(newPricingLevel)
      .subscribe((newPricing) => {
        console.log(
          'updatePricingMethodList pricings.... ', newPricing
        );
        this.newPricing = newPricing;
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  pushToList(pricingLevel, formGroupName: number){

    console.log('price pricingLevel.rangeSet break to add  ', pricingLevel.rangeSet);
    console.log('price pricingLevel.range break to add  ', pricingLevel.range);

    // // const level = parseInt(pricingLevel.range, 1);
    // // console.log('level ,,, ', level);
    if(pricingLevel.rangeSet){
          if(!pricingLevel.rangeSet.includes(pricingLevel.range) && pricingLevel.range !== null  && pricingLevel.range !== '' && pricingLevel.range !== '0' ){
      pricingLevel.rangeSet.push(pricingLevel.range);
    }
    const nameAsString = formGroupName.toString();
    this.pricingLevelForm.controls.pricingLevels.get(nameAsString).get('range').patchValue('');

  }
    // const grp = this.pricingLevelForm.controls.pricingLevels.get('0').get('range').patchValue(null);
    // // pricingLevel.range = null;
    // }


    // const grp = this.pricingLevelForm.controls.pricingLevels.get('0').get('name').patchValue('33'); //.get(formGroupName).value;
    // this.pricingLevelForm.updateValueAndValidity();
    // console.log('grp ', grp);
    // const ranges = pricingLevel.get('rangeSet').value;
    // console.log('rangeSet ', ranges);
    // const grp = this.pricingLevelForm.controls.pricingLevels.get(formGroupName);
  //   console.log('formGroupName ' , formGroupName);
  //   //controls[0].controls.rangeSet
  //  const grp: any =    this.pricingLevelForm.controls.pricingLevels;
  //  const grp2 = this.pricingLevelForm.controls.pricingLevel.patchValue({'rangeSet': [1,2,3,4,5]});
  //  console.log('from grp 2', grp2);

  //  const vals = grp.controls[formGroupName].controls;

  //  console.log('vals ', vals );
  // //  this.pricingLevelForm.controls.pricingLevels.valueChanges.subscribe( (value) => {
  // //    console.log('value  ', value);
  // //  });
  //   console.log('grp .... ', grp);
  //   //  this.priceBreaks.push( this.newPriceBreak.toString());
  //   //  this.newPriceBreak = null;
  //   // this.pricingLevelForm.controls.pricingLevels.patchValue({'rangeSet')
  //   const grp3 = this.pricingLevelForm.controls.pricingLevel.value;
  //   console.log('grp 3 updated  ', grp3);
  }

  remove(pricingLevel, rangeSet, formGroupName): void {
    console.log('price break to remove  ', pricingLevel);
    console.log('price range set to remove  ', rangeSet);
    console.log('price formgroup name to remove  ', formGroupName);

    // console.log('price pricingLevel.rangeSet break to add  ', pricingLevel.rangeSet);
    // console.log('price pricingLevel.range break to add  ', pricingLevel.range);


    // if(pricingLevel.rangeSet){
    //       if(!pricingLevel.rangeSet.includes(pricingLevel.range) && pricingLevel.range !== null ){
    //   pricingLevel.rangeSet.push(pricingLevel.range);
    // }

    const index = rangeSet.indexOf(pricingLevel);
console.log('index 0f ', index);
    if (index >= 0) {
      rangeSet.splice(index, 1);
    }
  }

  drop(event: CdkDragDrop<number[]>, rangeSet: []) {
    console.log('event ', event);
    moveItemInArray(rangeSet, event.previousIndex, event.currentIndex);
  }
}

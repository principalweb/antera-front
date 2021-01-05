import { Component, OnInit, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription, Subject } from 'rxjs';
import { takeUntil, map, take, distinctUntilChanged } from 'rxjs/operators';
import { Store, select } from "@ngrx/store";
import * as fromPurchaseNeed from "../../../state/purchase-needs.state";
import * as PurchaseNeedsActions from "../../../store/purchase-needs.actions";
import * as PurchaseNeedSelectors from "../../../state/selectors/purchase-needs.selectors";
import { PurchaseNeed } from 'app/models';
import { IEditQuantity } from '../../../store/purchase-needs.actions';
@Component({
  selector: 'quantity-input-container',
  templateUrl: './quantity-input-container.component.html',
  styleUrls: ['./quantity-input-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QuantityInputContainerComponent implements OnInit {
  @Input() quantityOrderedInput;
  @Input() purchaseNeed: PurchaseNeed
  orderedForm: FormGroup;
  formSubscription: Subscription;
  myQuantity: IEditQuantity | null;
  initialQuantity: IEditQuantity;
  unchecking: boolean = false;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(private fb: FormBuilder, private store: Store<fromPurchaseNeed.State>) { }

  ngOnInit() {
    this.createForm();
  }

  subscribeToInitialQuantity(){
    this.store.pipe(take(1), select(PurchaseNeedSelectors.getQuantityOrdered))
    .pipe(map((quantityOrdered: {[key: number]: IEditQuantity}) => quantityOrdered[this.purchaseNeed.id]))
      .subscribe((initialQuantity: IEditQuantity ) => {
        this.initialQuantity = initialQuantity;
      });
  }
  createForm(){
    this.orderedForm = this.fb.group({
      orderQuantity: ['']
    });
    this.subscribeToForm();
    this.subscribeToCleanse();
    this.subscribeToQuantiyOrdered();
    this.subscribeToInitialQuantity();
    this.subscribeToDetailCheckboxes();
  }

  subscribeToQuantiyOrdered(){
    this.store.pipe(takeUntil(this.destroyed$), select(PurchaseNeedSelectors.getQuantityOrdered))
    .pipe(map((quantityOrdered: {[key: number]: IEditQuantity}) => quantityOrdered[this.purchaseNeed.id]))
      .subscribe((myQuantity: IEditQuantity | null) => {
        this.myQuantity = myQuantity;
      });
  }

  subscribeToDetailCheckboxes(){
    this.store.pipe(takeUntil(this.destroyed$), select(PurchaseNeedSelectors.getDetailChexboxes))
    .subscribe((detailChexboxes: {[key: number]: boolean}) => {
      if (!detailChexboxes[this.purchaseNeed.id] && this.initialQuantity && this.orderedForm.dirty){
        this.unchecking = true;
        this.orderedForm.controls.orderQuantity.patchValue(this.initialQuantity.quantity);
        this.orderedForm.controls.orderQuantity.markAsPristine();
        this.store.dispatch(new PurchaseNeedsActions.EditQuantityOrder({
          [this.purchaseNeed.id]: {
            productId: this.purchaseNeed.productId,
            purchaseNeedId: this.purchaseNeed.id,
            purchaseNeed: this.purchaseNeed,
            sku: this.purchaseNeed.sku,
            type: this.purchaseNeed.type,
            quantity: this.initialQuantity.quantity,
            dirty: this.orderedForm.dirty
          }
        }));
      } else if (!detailChexboxes[this.purchaseNeed.id] && this.orderedForm.dirty){
        this.unchecking = true;
        this.orderedForm.controls.orderQuantity.patchValue(this.purchaseNeed.quantityOrdered);
        this.orderedForm.controls.orderQuantity.markAsPristine();
        this.store.dispatch(new PurchaseNeedsActions.EditQuantityOrder({
          [this.purchaseNeed.id]: {
            productId: this.purchaseNeed.productId,
            purchaseNeedId: this.purchaseNeed.id,
            purchaseNeed: this.purchaseNeed,
            sku: this.purchaseNeed.sku,
            type: this.purchaseNeed.type,
            quantity: this.orderedForm.controls.orderQuantity.value,
            dirty: this.orderedForm.dirty
          }
        }));
      }
    });
  }

  subscribeToCleanse(){
    this.store.pipe(takeUntil(this.destroyed$), select(PurchaseNeedSelectors.getCleanseState))
    .subscribe((cleanse: number) => {
      if (this.myQuantity && this.myQuantity.quantity){
        this.orderedForm.controls.orderQuantity.markAsPristine();
        this.store.dispatch(new PurchaseNeedsActions.EditQuantityOrder({
          [this.purchaseNeed.id]: {
            productId: this.purchaseNeed.productId,
            purchaseNeedId: this.purchaseNeed.id,
            purchaseNeed: this.purchaseNeed,
            sku: this.purchaseNeed.sku,
            type: this.purchaseNeed.type,
            quantity: this.myQuantity.quantity,
            dirty: this.orderedForm.dirty
          }
        }));
      }
    });
  }

  ngOnDestroy(){
    this.destroyed$.next(true);
  }

  subscribeToForm(){
    this.formSubscription = this.orderedForm.controls.orderQuantity
    .valueChanges.subscribe(orderQuantity => 
      {
        this.store.dispatch(
          new PurchaseNeedsActions.EditQuantityOrder({
            [this.purchaseNeed.id]: {
              productId: this.purchaseNeed.productId,
              purchaseNeedId: this.purchaseNeed.id,
              purchaseNeed: this.purchaseNeed,
              sku: this.purchaseNeed.sku,
              type: this.purchaseNeed.type,
              quantity: orderQuantity,
              dirty: this.orderedForm.dirty,
            },
          })
        );
        if (!this.initialQuantity && orderQuantity == this.purchaseNeed.quantityOrdered || this.initialQuantity && this.initialQuantity.quantity == orderQuantity){
          this.store.dispatch(new PurchaseNeedsActions.IsDifferentQuantity(false));
        } else {
          this.store.dispatch(new PurchaseNeedsActions.IsDifferentQuantity(true));
        }
        if (this.unchecking){
          this.unchecking = false;
        } else {
          this.store.dispatch(new PurchaseNeedsActions.DetailCheckbox({ [this.purchaseNeed.id]: true }));
          this.store.dispatch(new PurchaseNeedsActions.SelectSingleNeed(this.purchaseNeed));
        }
      });
  }

}

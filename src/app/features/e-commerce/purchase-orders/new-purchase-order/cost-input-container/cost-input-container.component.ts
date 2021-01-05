import { Component, OnInit, ViewEncapsulation, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { Subscription, Subject } from "rxjs";
import { takeUntil, map, take, distinctUntilChanged } from "rxjs/operators";
import { Store, select } from "@ngrx/store";
import * as fromPurchaseNeed from "../../state/purchase-needs.state";
import * as PurchaseNeedsActions from "../../store/purchase-needs.actions";
import * as PurchaseNeedSelectors from "../../state/selectors/purchase-needs.selectors";
import { PurchaseNeed } from "app/models";
@Component({
  selector: "cost-input-container",
  templateUrl: "./cost-input-container.component.html",
  styleUrls: ["./cost-input-container.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CostInputContainerComponent implements OnInit {
  @Input() purchaseNeed: PurchaseNeed;
  orderedForm: FormGroup;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  myOrderCost: string;
  constructor(
    private fb: FormBuilder,
    private store: Store<fromPurchaseNeed.State>
  ) {}

  ngOnInit() {
    this.subscribeToOrderCost();
    this.createForm();
  }

  createForm() {
    this.orderedForm = this.fb.group({
      orderCost: [""],
    });
    this.subscribeToForm();
  }

  subscribeToOrderCost() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(PurchaseNeedSelectors.getOrderCost)
      )
      .subscribe(
        (orderCost: { [key: number]: string }) => {
          if (typeof orderCost[this.purchaseNeed.id] === 'number'){
            this.myOrderCost = orderCost[this.purchaseNeed.id].toString();
            console.log("order cost number", this.myOrderCost);
          } else {
            this.myOrderCost = orderCost[this.purchaseNeed.id];
            console.log("order cost string", this.myOrderCost);
          }
        }
      );
  }

  subscribeToForm() {
    this.orderedForm.controls.orderCost.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((orderCost) => {
        this.store.dispatch(
          new PurchaseNeedsActions.EditCost({
            [this.purchaseNeed.id]: orderCost,
          }, this.purchaseNeed)
        );
      });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
  }
}

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { PurchaseNeed } from 'app/models';
import { PurchaseNeedsService } from '../../services/purchase-needs.service';
import * as fromPurchaseNeed from "../../state/purchase-needs.state";
import * as purchaseNeedSelectors from "../../state/selectors/purchase-needs.selectors";
import { takeUntil, map, tap } from 'rxjs/operators';
import { CreatePurchaseOrderFromNeed } from "../../interface/interface";
import { SummaryNeed } from "../../state/purchase-needs.state";
import * as PurchaseNeedActions from "../../store/purchase-needs.actions";
import { Store, select } from "@ngrx/store";
import { convertToSummaryNeeds, checkFalseNumber } from '../../util/converter';
@Component({
  selector: 'step-three',
  templateUrl: './step-three.component.html',
  styleUrls: ['./step-three.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StepThreeComponent implements OnInit, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  byVendor = {};
  byVendorId = {};
  clicked: boolean = false;
  vendors: string[] = [];
  loading: boolean = false;
  summaryNeeds = {};
  vendorSum = {};
  ngOnDestroy() {
    this.destroyed$.next(true);
  }
  constructor(private store: Store<fromPurchaseNeed.State>,
    public itemService: PurchaseNeedsService) { }

  ngOnInit() {
    this.getSelectedNeedsByVendor();
    this.subscribeToPOCreatedConfirmation();
  }

  subscribeToLoading(){
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedSelectors.getLoadingState)
      )
      .subscribe((loading: boolean) => {
        this.loading = loading;
      });
  }


  subscribeToPOCreatedConfirmation() {
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedSelectors.getConfirmation))
      .subscribe((confirmation: boolean) => {
        if (confirmation) this.itemService.handlePurchaseOrderCreation();
      })
  }

  getSelectedNeedsByVendor() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedSelectors.getSelectedNeedsAndSummaryNeedsUpdate),
        map((states: any[]) => {
          const selectedNeeds: PurchaseNeed[] = states[0];
          const byVendor = {};
          selectedNeeds.forEach((selectedNeed: PurchaseNeed) => {
            if (!byVendor[selectedNeed.vendor]) {
              byVendor[selectedNeed.vendor] = [selectedNeed];
            } else {
              byVendor[selectedNeed.vendor].push(selectedNeed);
            }
            
            this.byVendorId = {};
            selectedNeeds.forEach((selectedNeed: PurchaseNeed) => {
              if (!this.byVendorId[selectedNeed.vendorId]) {
                this.byVendorId[selectedNeed.vendorId] = [selectedNeed];
              } else {
                this.byVendorId[selectedNeed.vendorId].push(selectedNeed);
              }
            });
          });
          if (Object.values(byVendor).length > 0) {
            for (let key in byVendor) {
              const sorted = Object.values(convertToSummaryNeeds(byVendor[key], this.itemService.quantityChanged, this.itemService.orderCost, "summary page"))
                .sort((a: SummaryNeed, b: SummaryNeed) => {
                  if (a.attribute < b.attribute){
                    return -1;
                  } else if (a.attribute > b.attribute){
                    return 1;
                  } else return 0
                  
                });
              this.summaryNeeds[key] = sorted;
            }
          }
          for (let key in byVendor) {
            this.vendorSum[key] = this.itemService.sumNoModifyTotalCost(byVendor[key]);
          }
          console.log("this.summaryNeeds", this.summaryNeeds);
          return byVendor;
        })
      )
      .subscribe((byVendor) => {
        this.byVendor = byVendor;
        this.vendors = Object.keys(byVendor).sort();
      });
  }

  finalizeOrder() {
    this.clicked = true;
    this.store.dispatch(new PurchaseNeedActions.IsLoading(true));
    const po: CreatePurchaseOrderFromNeed[] = [];
    for (let key in this.byVendorId) {
      let singlePo = {
        type: this.byVendorId[key][0].type != "Decoration" ? "Supplier" : "Decorator",
        vendorId: key,
        vendor: this.byVendorId[key][0].vendor,
        poDate: new Date(),
        inhandDate: new Date(),
        lineItems: []
      };
      this.byVendorId[key].forEach((purchaseNeed: PurchaseNeed) => {
        singlePo.lineItems.push({
          needId: purchaseNeed.id,
          productId: purchaseNeed.productId,
          changedQty: this.itemService.quantityChanged &&
            this.itemService.quantityChanged[purchaseNeed.id] ?
            this.itemService.quantityChanged[purchaseNeed.id].quantity : purchaseNeed.quantityOrdered,
          changedCost: this.itemService.orderCost[purchaseNeed.id] != undefined 
          && !checkFalseNumber(this.itemService.orderCost[purchaseNeed.id]) 
          && this.itemService.orderCost[purchaseNeed.id] != null 
          ? parseFloat(this.itemService.orderCost[purchaseNeed.id]) : purchaseNeed.actualUnitCost
        });
      });
      po.push(singlePo);
    }
    this.store.dispatch(new PurchaseNeedActions.IsLoading(true));
    this.store.dispatch(new PurchaseNeedActions.GeneratePurchaseOrder(po));
  }

}

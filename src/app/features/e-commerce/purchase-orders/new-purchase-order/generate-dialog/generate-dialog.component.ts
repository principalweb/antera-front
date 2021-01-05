import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Store, select } from "@ngrx/store";
import * as fromPurchaseNeed from "../../state/purchase-needs.state";
import * as purchaseNeedSelectors from "../../state/selectors/purchase-needs.selectors";
import * as PurchaseNeedActions from "../../store/purchase-needs.actions";
import { takeUntil, map, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PurchaseNeed } from 'app/models';
import { CreatePurchaseOrderFromNeed } from "../../interface/interface";
import { PurchaseNeedsService } from '../../services/purchase-needs.service';
@Component({
  selector: "generate-dialog",
  templateUrl: "./generate-dialog.component.html",
  styleUrls: ["./generate-dialog.component.scss"],
})
export class GenerateDialogComponent implements OnInit, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  byVendor = {};
  byVendorId = {};
  clicked: boolean = false;
  vendors: string[] = [];
  loading: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<GenerateDialogComponent>,
    private store: Store<fromPurchaseNeed.State>,
    private itemService: PurchaseNeedsService,
  ) {}

  ngOnInit() {
    this.getSelectedNeedsByVendor();
    this.subscribeToPOCreatedConfirmation();
    this.subscribeToLoading();
  }

  getSelectedNeedsByVendor() {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(purchaseNeedSelectors.getSelectedNeedSate),
        map((selectedNeeds: PurchaseNeed[]) => {
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
          return byVendor;
        })
      )
      .subscribe((byVendor) => {
        this.byVendor = byVendor;
        this.vendors = Object.keys(byVendor);
      });
  }

  subscribeToLoading(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedSelectors.getDialogLoadingState))
    .subscribe((loading: boolean) => this.loading = loading);
  }

  finalizeOrder(){
    this.clicked = true;
    this.store.dispatch(new PurchaseNeedActions.DialogIsLoading(true));
    const po: CreatePurchaseOrderFromNeed[] = [];
    for (let key in this.byVendorId){
      let singlePo = {
        type: this.byVendorId[key][0].type != "Decoration" ? "Supplier" : "Decorator",
        vendorId: key,
        vendor: this.byVendorId[key][0].vendor,
        poDate: new Date(),
        lineItems: []
      };
      this.byVendorId[key].forEach((purchaseNeed: PurchaseNeed) => {
        singlePo.lineItems.push({
          needId: purchaseNeed.id,
          changedQty: this.itemService.quantityChanged && 
          this.itemService.quantityChanged[purchaseNeed.id] ? 
          this.itemService.quantityChanged[purchaseNeed.id].quantity : purchaseNeed.quantityOrdered,
          changedCost: purchaseNeed.actualUnitCost
        });
      });
      po.push(singlePo);
    }
    this.store.dispatch(new PurchaseNeedActions.GeneratePurchaseOrder(po));
  }

  subscribeToPOCreatedConfirmation(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseNeedSelectors.getConfirmation))
    .subscribe((confirmation: boolean) => {
      if (confirmation) this.dialogRef.close();
    })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
  }
}

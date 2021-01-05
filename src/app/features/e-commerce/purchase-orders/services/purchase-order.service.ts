import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, Params, Resolve, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { Store, select } from '@ngrx/store';
import { tap, delay, takeUntil, take } from 'rxjs/operators';
import { PurchaseOrder, User } from "app/models";
import * as fromPurchaseOrder from "app/features/e-commerce/purchase-orders/state/purchase-orders.state";
import * as PurchaseOrderActions from "app/features/e-commerce/purchase-orders/store/purchase-orders.actions";
import * as purchaseOrderSelectors from "app/features/e-commerce/purchase-orders/state/selectors/purchase-orders.selectors";
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { IsLoading } from '../store/purchase-needs.actions';
@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService implements Resolve<any>, OnDestroy {
  purchaseOrderId: string;
  hasPromoStandards: boolean = false;
  purchaseOrder: PurchaseOrder;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constructor(private api: ApiService, private auth: AuthService, private route: ActivatedRoute, private store: Store<fromPurchaseOrder.State>,
    private messageService: MessageService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
    this.subscribeToStore();
    this.purchaseOrderId = route.params.id;
    return this.api.getPurchaseOrder(this.purchaseOrderId)
    .pipe(tap((purchaseOrder) => {
      console.log("purchaseOrderinservice", purchaseOrder);
      this.purchaseOrder = new PurchaseOrder(purchaseOrder);
      console.log("this.purchaseOrder", this.purchaseOrder)
      this.store.dispatch(new PurchaseOrderActions.ReceiveSelectedPurchaseOrder(this.purchaseOrder));
    }
    ));
  }

  getPurchaseOrderDetail(){
    this.api.getPurchaseOrder(this.purchaseOrderId)
    .pipe(take(1))
    .subscribe(purchaseOrder => {
      console.log("purchase order refreshed", purchaseOrder);
      this.purchaseOrder = new PurchaseOrder(purchaseOrder);
      this.store.dispatch(new PurchaseOrderActions.ReceiveSelectedPurchaseOrder(this.purchaseOrder));
    });
  }

  subscribeToStore(){
    this.store.pipe(takeUntil(this.destroyed$), select(purchaseOrderSelectors.getSelectedPurchaseOrder))
      .subscribe((purchaseOrder: PurchaseOrder) => {
        if (!purchaseOrder){
          this.store.dispatch(new PurchaseOrderActions.ReceiveSelectedPurchaseOrder(this.purchaseOrder));
        }
        else {
          this.purchaseOrder = purchaseOrder;
          this.checkPromoStandards(this.purchaseOrder.vendorId);
        }
      });
  }

  ngOnDestroy(){
    this.destroyed$.next(true);
  }

  submitToPromoStandards(){
    const user: User = this.auth.getCurrentUser();
    const name = `${user.firstName} ${user.lastName}`;
    console.log("user", user);
    this.store.dispatch(new PurchaseOrderActions.IsLoading(true));
    this.api.submitPOUsingPromoStandards(this.purchaseOrderId, name)
    .pipe(take(1))
    .subscribe((res) => {
      console.log("Promo response", res);
      this.store.dispatch(new PurchaseOrderActions.FetchSelectedPurchaseOrder(this.purchaseOrderId))
    }, (error: any) => {
      console.log("Promo Standards Error", error);
      this.messageService.show("ShipVia is missing from the sales order. Please add the ShipVia to the Sales Order and submit the PO directly from the Sales Order", "error");
      this.store.dispatch(new PurchaseOrderActions.IsLoading(false));
    })
  }

  checkIfSubmitted(): boolean{
    return this.purchaseOrder.status.toLowerCase() === "submitted";
  }

  checkPromoStandards(vendorId: string){
    this.api.checkElectronicEndpoint("Purchase Order", vendorId)
    .then((promoStandards: any) => {
      console.log("promo Standards", promoStandards);
      this.hasPromoStandards = promoStandards.enabled;
    });
  }


  subscibeToRouteChanges(){
    this.route.params.subscribe((params: Params) => {
      console.log("params", params);
      this.purchaseOrderId = params.id;
    })
  }
}

export interface PromoStandards {
  data: {
    enabled: boolean;
    endpoint: string;
  }
}

import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from "@ngrx/effects";
import * as PurchaseOrderActions from "./purchase-orders.actions";
import * as PurchaseNeedActions from "./purchase-needs.actions";
import { ApiService } from 'app/core/services/api.service';
import { switchMap, catchError, map, concatMap } from 'rxjs/operators';
import { PurchaseOrder, PurchaseNeed } from 'app/models';
import { PurchaseOrderResponse } from 'app/features/e-commerce/purchase-orders/services/purchaseOrders.service';
import { of } from 'rxjs';
import { PurchaseNeedResponse} from '../services/purchase-needs.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'app/core/services/message.service';
@Injectable()
export class PurchaseOrderEffects {
  constructor(private actions$: Actions, private api: ApiService,private msg: MessageService) {}

  @Effect() 
  fetchPurchaseOrders = this.actions$.pipe(
    ofType(PurchaseOrderActions.FILTER_PURCHASE_ORDERS),
    switchMap((filterData: PurchaseOrderActions.FilterPurchaseOrders) => {
      return this.api
        .getPurchaseOrders(
          filterData.payload.filters,
          filterData.payload.currentPage,
          filterData.payload.perPage
        )
        .pipe(
          switchMap((data: PurchaseOrderResponse) => {
            const purchaseOrders: PurchaseOrder[] = data.data.map(
              (individualPurchaseOrder) =>
                new PurchaseOrder(individualPurchaseOrder)
            );
            return [
              new PurchaseOrderActions.ReceivePurchaseOrders(purchaseOrders),
              new PurchaseOrderActions.UpdateMeta(data._meta),
            ];
          }),
          catchError((error) => {
            if(error && error.error && error.error.errors) {
              this.msg.show(error.error.errors, 'error');
            }
            return of(new PurchaseOrderActions.fetchError());
          })
        );
    })
  );

  @Effect()
  fetchSelectedPurchaseOrder = this.actions$.pipe(
    ofType(PurchaseOrderActions.FETCH_SELECTED_PURCHASE_ORDER),
    switchMap((action: PurchaseOrderActions.FetchSelectedPurchaseOrder) => 
    this.api.getPurchaseOrder(action.payload)
    .pipe(map(purchaseOrder => {
      const formattedPO = new PurchaseOrder(purchaseOrder);
      return new PurchaseOrderActions.ReceiveSelectedPurchaseOrder(formattedPO);
    }))),
    catchError((error) => {
      console.log("single detail", error);
      return of(new PurchaseOrderActions.fetchError());
    })
  );

  @Effect()
  updateSelectedPurchaseOrder = this.actions$.pipe(
    ofType(PurchaseOrderActions.UPDATE_PURCHASE_ORDER),
    switchMap((action: PurchaseOrderActions.UpdatePurchaseOrder) => {
      return this.api.updatePurchaseOrder(action.payload.purchaseOrderId, action.payload.data)
        .pipe(map((data: any) => {
          const formattedPO = new PurchaseOrder(data.data);
          return new PurchaseOrderActions.FetchSelectedPurchaseOrder(formattedPO.id);
        }))
    }
      ),
    catchError((error) => {
      console.log("single detail", error);
      return of(new PurchaseOrderActions.fetchError());
    })
  );

  

  @Effect()
  changePOVendor = this.actions$.pipe(
    ofType(PurchaseOrderActions.CHANGE_VENDOR),
    switchMap((action: PurchaseOrderActions.ChangeVendor) => {
      return this.api.changeVendor(action.payload)
      .pipe(map((data: any) => {
        return new PurchaseOrderActions.FetchSelectedPurchaseOrder(action.payload.id)
      }))
    }),
    catchError((error) => {
      console.log("Change Vendor error", error);
      return of(new PurchaseOrderActions.fetchError());
    })
  )

  @Effect()
  filterPurchaseNeeds = this.actions$.pipe(
    ofType(PurchaseNeedActions.FILTER_PURCHASE_NEEDS),
    switchMap((filterData: PurchaseNeedActions.FilterPurchaseNeeds) => {
      return this.api
        .getPurchaseNeedsByProductIds(
          filterData.payload.productIds,
          filterData.payload.filters,
          filterData.payload.sort
        )
        .pipe(
          switchMap((data: any[]) => {
            const purchaseNeeds: PurchaseNeed[] = data.map(
              (individualPurchaseNeed) =>
                new PurchaseNeed(individualPurchaseNeed)
            );
            return [
              new PurchaseNeedActions.ReceivePurchaseNeeds(purchaseNeeds),
            ];
          }),
          catchError((error: HttpErrorResponse) => {
            console.log("Purchase Need Fetch", error);
            return of(new PurchaseNeedActions.fetchError());
          })
        );
    })
  );



  @Effect()
  fetchPurchaseProductNeeds = this.actions$.pipe(
    ofType(PurchaseNeedActions.FILTER_PURCHASE_PRODUCT_NEEDS),
    concatMap((filterData: PurchaseNeedActions.FilterPurchaseProductNeeds) => {
      return this.api
        .getPurchaseNeedsByProduct(
          filterData.payload.filters
        )
        .pipe(
          concatMap((data: any[]) => {
            console.log("payload", filterData.payload);
            console.log("filtered data", data);
            console.log("filters", filterData.payload.filters);
            const purchaseNeeds: PurchaseNeed[] = data.map(
              (individualPurchaseNeed) =>
                new PurchaseNeed(individualPurchaseNeed)
            );

            return [
              new PurchaseNeedActions.ReceivePurchaseProductNeeds(purchaseNeeds),
            ];
          }),
          catchError((error: HttpErrorResponse) => {
            console.log("Purchase Need Fetch", error);
            return of(new PurchaseNeedActions.fetchError());
          })
        );
    })
  );
  @Effect()
  getPurchaseNeedsByProductIds = this.actions$.pipe(
    ofType(PurchaseNeedActions.FETCH_PURCHASE_NEEDS_BY_PRODUCT_IDS),
    switchMap((action: PurchaseNeedActions.FetchPurchaseNeedsByProductIds) => {
      console.time("Fetch Purchase Needs By ProductIds Received Data");
      console.time("Whole FetchPurchase Needs By Product IDs Effect");
      return this.api
        .getPurchaseNeedsByProductIds(
          action.payload.productIds,
          action.payload.filters,
          action.payload.sort
        )
        .pipe(
          map((data: any[]) => {
            console.timeEnd("Fetch Purchase Needs By ProductIds Received Data");
            
            console.log("DATA RECEIVED FINALLY!!! IN EFFECT", data);
            const purchaseNeeds: PurchaseNeed[] = data.map(
              (individualPurchaseNeed) =>
                new PurchaseNeed(individualPurchaseNeed)
            );
            const detailChexboxes = {};
            purchaseNeeds.forEach((purchaseNeed: PurchaseNeed) => detailChexboxes[purchaseNeed.id] = true);
            console.timeEnd("Whole FetchPurchase Needs By Product IDs Effect");
            
            return new PurchaseNeedActions.ReceivePurchaseNeedsAndSelectedNeeds(purchaseNeeds, detailChexboxes);
          }),
          catchError((error: HttpErrorResponse) => {
            console.log("fetch Error", error);
            return of(new PurchaseNeedActions.fetchError());
          })
        );
    })
  );


  @Effect()
  caclulatePriceBreak = this.actions$.pipe(
    ofType(PurchaseNeedActions.CALCULATE_PRICE_BREAK),
    concatMap((action: PurchaseNeedActions.CalculatePriceBreak) => {
      return this.api
        .calculateCost(action.payload.variation, action.payload.decoration)
        .pipe(
          concatMap((data) => {
            // console.log("The latest data", data);
            // const purchaseNeeds: PurchaseNeed[] = data.data.map(individualPurchaseNeed =>
            //     new PurchaseNeed(individualPurchaseNeed));
            return [
              new PurchaseNeedActions.RefreshList(),
              new PurchaseNeedActions.CleanseForm(),
            ];
          }),
          catchError((error: HttpErrorResponse) => {
            console.log("fetch Error", error);
            return of(new PurchaseNeedActions.RefreshList(), new PurchaseNeedActions.CleanseForm());
          })
        );
    })
  );

  @Effect()
  generatePurchaseOrder = this.actions$.pipe(
    ofType(PurchaseNeedActions.GENERATE_PURCHASE_ORDER),
    concatMap((action: PurchaseNeedActions.GeneratePurchaseOrder) => {
      return this.api.createPurchaseOrders(action.payload).pipe(
        concatMap((data) => {
          return [
            new PurchaseNeedActions.PurchaseOrderGeneratedConfirmation(true),
          ];
        })
      );
    }),
    catchError((error: HttpErrorResponse) => {
      console.log("fetch Error", error);
      return of(new PurchaseNeedActions.fetchError());
    })
  );

  @Effect()
  getTotalSum = this.actions$.pipe(
    ofType(PurchaseNeedActions.GET_PRODUCT_TOTAL),
    concatMap((action: PurchaseNeedActions.GetProductTotal) => {
      return this.api.getProductsTotal(action.payload, action.inventory)
      .pipe(map((data: Total) => {
        return new PurchaseNeedActions.ReceiveTotalSum(data.data.totalAmount);
      }))
    }),
    catchError((error: HttpErrorResponse) => {
      console.log("fetch Error", error);
      return of(new PurchaseNeedActions.fetchError());
    })
  )

  @Effect()
  getNeedSum = this.actions$.pipe(
    ofType(PurchaseNeedActions.NEED_SUM),
    concatMap((action: PurchaseNeedActions.GetNeedSum) => {
      return this.api.getNeedsTotal(action.payload)
        .pipe(map((data: Total) => {
          return new PurchaseNeedActions.ReceiveTotalSum(data.data.totalAmount);
        }));
    }),
    catchError((error: HttpErrorResponse) => {
      console.log("fetch Error", error);
      return of(new PurchaseNeedActions.fetchError());
    })
  )

  // @Effect()
  // showInventory = this.actions$.pipe(
  //   ofType(PurchaseNeedActions.SHOW_INVENTORY),
  //   concatMap((action: PurchaseNeedActions.ShowInventory) => {
  //     return [ new PurchaseNeedActions.FilterPurchaseNeeds({
  //       filters: action.payload.filters,
  //       productIds: action.payload.productIds,
  //       sort: action.payload.sort
  //     })]
  //   })
  // )
}

export interface Total {
  success: boolean;
  data: {
    quantityNeeded: string;
    totalAmount: string;
  }
}

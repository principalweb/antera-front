import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Account as AccountModel } from "app/models";
import { concatMap, switchMap, map, catchError, withLatestFrom, exhaustMap, mergeMap, take, tap, debounceTime } from 'rxjs/operators';
import { EMPTY, of, forkJoin, noop, Observable } from 'rxjs';
import {
  OrderFormActionTypes,
  OrderFormActions,
  LoadOrder,
  LoadOrderSuccess,
  LoadOrderError,
  AddProductsToOrder,
  SaveOrder,
  SaveOrderSuccess,
  SaveOrderError,
  LoadOrderConfig,
  UpdateConfig,
  LoadOrderFields,
  LoadOrderFieldsSuccess,
  AddDecorationSuccess,
  AddDecorationError,
  AddDecoration,
  UpdateDecorationSuccess,
  UpdateDecorationError,
  UpdateDecoration,
  UpdateVendorAndCustomerCurrency,
  UpdateCurrencyEffects,
  PasteDecorations,
  DeleteLineItem,
  DeleteLineItemSuccess,
  DeleteLineItemError,
  DeleteMatrixRow,
  LoadDecorationVendorsForType,
  LoadDecorationVendorsForTypeSuccess,
  DeleteDecorations,
  DeleteMatrixRows,
  DeleteMatrixRowsSuccess,
  DeleteMatrixRowsError,
  DeleteDecorationsSuccess,
  DeleteDecorationsError,
  DuplicateLineItem,
  DeleteCharge,
  DeleteChargeSuccess,
  DeleteChargeError,
  SaveChargeDialog,
  SaveChargeDialogSuccess,
  SaveChargeDialogError,
  LoadOrderPricing,
  LoadOrderPricingSuccess,
  LoadOrderPricingError,
  DuplicateLineItemSuccess,
  DuplicateLineItemError,
  ApplyPriceBreaks,
  ApplyPriceBreaksSuccess,
  FetchVendorCustomerCurrency,
  PasteCharges,
  ChangeDesignVariation,
  ChangeDesignVariationSuccess,
  ChangeDesignVariationError,
  LoadProductInventory,
  LoadProductInventorySuccess,
  LoadProductInventoryError,
  LoadProduct,
  LoadProductSuccess,
  LoadProductError,
  LoadLocalWarehousesSuccess,
  LoadLocalWarehousesError,
  SyncTaxJar,
  SyncTaxJarSuccess,
  SyncTaxJarError,
  SyncShipStation,
  SyncShipStationSuccess,
  SyncShipStationError,
  LoadOrderInventory,
  LoadOrderArtProofs,
  LoadOrderArtProofsError,
  LoadOrderArtProofsSuccess,
  LoadOrderVouchedSuccess,
  UpdateVendorCurrency,
  UpdateCustomerCurrency,
  LoadOrderVouchedError,
  ApplyPriceBreaksError
} from './order-form.actions';
import { ApiService } from 'app/core/services/api.service';
import { SocketService } from 'app/core/services/socket.service';
import { OrderDetails, MatrixRow, ProductDetails, User } from 'app/models';
import * as fromOrderForm from './order-form.reducer';
import { Store, select } from '@ngrx/store';
import { Action } from 'rxjs/internal/scheduler/Action';
import { IDecoVendor, PriceStrategies, CostStrategies } from '../interfaces';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { HttpParams, HttpUrlEncodingCodec, HttpErrorResponse } from '@angular/common/http';
import { DeleteArtProof, ArtProofActionTypes, DeleteArtProofSuccess, DeleteArtProofError } from './actions/art-proof.actions';
import { effects } from 'app/store';
import { currencyMatches, convertCurrency, convertCurrencyRounded } from './util/util';
import { CurrencyService } from 'app/features/admin/currency/currency.service';
import { CurrencyItem } from 'app/models/currency-item';


export class MyCustomHttpUrlEncodingCodec extends HttpUrlEncodingCodec {
  encodeKey(k: string): string {
    return super.encodeKey(k)
      .replace(new RegExp("%5B", "g"), "[")
      .replace(new RegExp("%5D", "g"), "]");
  }
}


@Injectable()
export class OrderFormEffects {

  @Effect()
  loadOrderForms$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrder),
    switchMap((action: LoadOrder) => {
      return this.api.getOrderDetails(action.payload.id).pipe(
        map((res: OrderDetails) => {
          console.log("order details", res);
          return new LoadOrderSuccess(res);
        }),
        catchError(error => of(new LoadOrderError(error)))
      );
    })
  );

  @Effect()
  fetchArtProofs$ = this.actions$.pipe(
    ofType(
      OrderFormActionTypes.LoadOrderSuccess,
      OrderFormActionTypes.SaveOrderSuccess
    ),
    switchMap((action: any) => {
      return of(new LoadOrderArtProofs({ id: action.payload.id }));
    })
  );

  @Effect()
  fetchOrderPricing$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderSuccess),
    switchMap((action: LoadOrderSuccess) => {
      return of(new LoadOrderPricing({ id: action.payload.id }));
    })
  );

  @Effect()
  syncTaxJar$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.SyncTaxJar),
    switchMap((action: SyncTaxJar) => {
      return this.api.post('/content/calculate-tax', { id: action.payload.id }).pipe(
        map((res: any) =>  {
          this.messageService.show(res.msg, 'success');
          return new SyncTaxJarSuccess(res);
        }
        ),
        catchError((httpError: HttpErrorResponse) => {
          if (httpError.error.msg) {
            this.messageService.show(httpError.error.msg, 'error');
          }
          return of(new SyncTaxJarError(httpError.error));
        })
      );
    })
  );

  @Effect()
  syncShipStation$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.SyncShipStation),
    switchMap((action: SyncShipStation) => {
      return this.api.post('/content/ship-station-create-order', { id: action.payload.id }).pipe(
        map((res: any) => new SyncShipStationSuccess(res)),
        catchError(error => of(new SyncShipStationError(error)))
      );
    })
  );

  @Effect()
  fetchOrderProducts$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderSuccess),
    switchMap((action: LoadOrderSuccess) => {

      const productIds = action.payload.lineItems
        .map((item) => item.productId)
        .filter(function (value, index, self) {
          return self.indexOf(value) === index;
        });

      return [...productIds].map((id) => {
        return new LoadProduct(id);
      });
    })
  );

  @Effect()
  loadOrderPricing$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderPricing),
    switchMap((action: LoadOrderPricing) => {
      return this.api.getOrderPricing(action.payload.id).pipe(
        map((res: any) => new LoadOrderPricingSuccess(res)),
        catchError(error => of(new LoadOrderPricingError(error)))
      );
    })
  );

  @Effect()
  analyzePriceBreaks$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderPricingSuccess),
    withLatestFrom(
      this.store$.pipe(select(fromOrderForm.getOrder)),
      this.store$.pipe(select(fromOrderForm.getOrderSettings)
      )),
    switchMap(([action, _order, settings]: [LoadOrderPricingSuccess, OrderDetails, any]) => {
      const lockedStatuses = ['billed', 'void', 'cancelled'];
      const orderStatus = _order.orderStatus.toLowerCase();

      if (!settings || (settings.lockInvoicedOrders == '1' && (lockedStatuses.includes(orderStatus)))) {
        return of({ type: 'NOOP' });
      }

      // Calculate new price
      const costBreaks = {
        products: {},
        decorations: {}
      };
      const priceBreaks = {
        products: {},
        decorations: {}
      };

      const pricing: any = action.payload;
      console.log('---reading payload   --- ', action.payload);
      pricing.products.forEach((productPrice) => {
        console.log("product price", productPrice);
        const productLines = _order.lineItems.filter((item) => item.productId === productPrice.id);
        productLines.forEach((item) => {
          console.log("currency symbol", item.productCurrencySymbol);
          console.log('productPrice ... ', productPrice);
          if(productPrice.priceBreak){
          productPrice.priceBreak.forEach((result) => {
            console.log('result from prod price break ... ', result);
            const row = item.matrixRows.find((row) => row.matrixUpdateId === result.matrixUpdateId);
            // Analyze cost
            
            if (row && row.costStrategy === CostStrategies.PRICE_BREAK && (this.currencyService.currencySettings.value.enableCurrency !== "1")) {
              if (result.cost != row.cost) {
                costBreaks.products[row.matrixUpdateId] = {
                  current: row.cost,
                  suggested: result.cost,
                  currencySymbol: item.productCurrencySymbol,
                  vendorId: item.vendorId,
                  customerId: _order.accountId
                };
              }
            }
            // Analyze price
            if (row && row.priceStrategy === PriceStrategies.PRICE_BREAK && (this.currencyService.currencySettings.value.enableCurrency !== "1")) {
              if (result.price != row.price) {
                priceBreaks.products[row.matrixUpdateId] = {
                  current: row.price,
                  suggested: result.price,
                  currencySymbol: item.productCurrencySymbol,
                  vendorId: item.vendorId,
                  customerId: _order.accountId
                };
              }
            }
            let convertedResultCost;
            let convertedResultPrice; 
            //With currency enabled
            if (row && row.costStrategy === CostStrategies.PRICE_BREAK && (this.currencyService.currencySettings.value.enableCurrency == "1")) {
              if (item.productCurrencySymbol !== this.currencyService.currencySettings.value.baseCurrency){
                convertedResultCost = convertCurrencyRounded(this.currencyService.currencySettings.value.baseCurrency, 
                  item.productCurrencySymbol, this.currencyService.exchangeRates.value, result.cost);
                if (Math.abs(row.cost - parseFloat(convertedResultCost)) > .02) {
                  costBreaks.products[row.matrixUpdateId] = {
                    current: row.cost,
                    suggested: result.cost,
                    currencySymbol: item.productCurrencySymbol,
                    vendorId: item.vendorId,
                    customerId: _order.accountId
                  };
                  console.log("this.currencyService", this.currencyService);
                  this.currencyService.productCurrencies.next({ ...this.currencyService.productCurrencies.value, [row.matrixUpdateId]: item.productCurrencySymbol });
                }
              } else {
                if (result.cost != row.cost) {
                  costBreaks.products[row.matrixUpdateId] = {
                    current: row.cost,
                    suggested: result.cost,
                    currencySymbol: item.productCurrencySymbol,
                    vendorId: item.vendorId,
                    customerId: _order.accountId
                  };
                }
                this.currencyService.productCurrencies.next({ ...this.currencyService.productCurrencies.value, [row.matrixUpdateId]: item.productCurrencySymbol });
              }
              
            }

            if (row && row.priceStrategy === PriceStrategies.PRICE_BREAK && (this.currencyService.currencySettings.value.enableCurrency == "1")) {
              if (item.productCurrencySymbol !== this.currencyService.currencySettings.value.baseCurrency) {
                convertedResultPrice = convertCurrencyRounded(this.currencyService.currencySettings.value.baseCurrency,
                  item.productCurrencySymbol, this.currencyService.exchangeRates.value, result.price);

                if (Math.abs(row.price - parseFloat(convertedResultPrice)) > .02) {
                  priceBreaks.products[row.matrixUpdateId] = {
                    current: row.price,
                    suggested: result.price,
                    currencySymbol: item.productCurrencySymbol,
                    vendorId: item.vendorId,
                    customerId: _order.accountId
                  };
                }
              } else {
                if (result.price != row.price) {
                  priceBreaks.products[row.matrixUpdateId] = {
                    current: row.price,
                    suggested: result.price,
                    currencySymbol: item.productCurrencySymbol,
                    vendorId: item.vendorId,
                    customerId: _order.accountId
                  };
                }
              }
              
            }

          });
        }});
      });

      pricing.decorations.forEach((deco: any) => {
        console.log("deco", deco);
        if (deco.priceBreak && deco.priceBreak.length) {
          const decoVendors = _order.lineItems.reduce((vendors, item) => vendors.concat(item.decoVendors), []);
          deco.priceBreak.forEach(result => {
            const decoVendor = decoVendors.find((vendor) => vendor.decoVendorRecordId === result.decoVendorRecordId);

            if (decoVendor && decoVendor.costStrategy === 'PRICE_BREAK') {
              if (result.itemCost != decoVendor.itemCost) {
                costBreaks.decorations[decoVendor.decoVendorRecordId] = {
                  current: decoVendor.itemCost,
                  suggested: result.itemCost
                };
              }
            }

            if (decoVendor && decoVendor.priceStrategy === 'PRICE_BREAK') {
              if (result.customerPrice != decoVendor.customerPrice) {
                priceBreaks.decorations[decoVendor.decoVendorRecordId] = {
                  current: decoVendor.customerPrice,
                  suggested: result.customerPrice
                };
              }
            }

          });
        }
      });

      const rowCostBreakIds = Object.keys(costBreaks.products);
      const decoCostBreakIds = Object.keys(costBreaks.decorations);

      const rowPriceBreakIds = Object.keys(priceBreaks.products);
      const decoPriceBreakIds = Object.keys(priceBreaks.decorations);


      if (rowCostBreakIds.length || decoCostBreakIds.length || decoPriceBreakIds.length || rowPriceBreakIds.length) {
        return of(new ApplyPriceBreaks({
          costBreaks,
          priceBreaks
        }));
      }
      return of({ type: 'NOOP' });
    })
  );

  //Customer and Vendor can be memoized. It should always be the same customer for the entire order.
  //Vendor can also be stored. Will come back and optimize this.
  //** This should not be done on the frontend. It is producing N + 1 queries. Backend API needs to be created
  //for currency price breaks */

  // @Effect()
  // fetchVendorCustomerCurrencies = this.actions$.pipe(
  //   ofType(OrderFormActionTypes.FetchVendorCustomerCurrency),
  //   switchMap((action: FetchVendorCustomerCurrency) => {
  //     const costBreaks = action.payload.costBreaks;
  //     const priceBreaks = action.payload.priceBreaks;
  //     let queries: any[] = [];
  //     const vendorCurrencies = {};
  //     const customerCurrencies = {};
  //     for (let key in costBreaks.products){
  //       queries.push(this.api.getAccountDetails(costBreaks.products[key].vendorId)
  //         .pipe(take(1), map((accountDetails: any) => {
  //         let vendorCurrencyCode;
  //         const vendorCurrency =
  //           accountDetails.defaultCurrency != null &&
  //             accountDetails.defaultCurrency != "0" &&
  //             accountDetails.defaultCurrency != undefined &&
  //             accountDetails.defaultCurrency != 0
  //             ? accountDetails.defaultCurrency
  //             : this.currencyService.defaultId.value;
  //         const vendorCurrencyItem = this.currencyService.currencies.value.find(
  //           (currencyItem: CurrencyItem) => currencyItem.id === vendorCurrency
  //         );
  //         if (vendorCurrencyItem) vendorCurrencyCode = vendorCurrencyItem.code;
  //         //this.store$.dispatch(new UpdateVendorCurrency({[key]: vendorCurrencyCode}));
  //         vendorCurrencies[key] = vendorCurrencyCode;
  //         return accountDetails;
  //       })));

  //       queries.push(this.api.getAccountDetails(costBreaks.products[key].customerId)
  //       .pipe(take(1), map((accountDetails: any) => {
  //         let customerCurrencyCode;
  //         const customerCurrency =
  //           accountDetails.defaultCurrency != null &&
  //             accountDetails.defaultCurrency != "0" &&
  //             accountDetails.defaultCurrency != undefined &&
  //             accountDetails.defaultCurrency != 0
  //             ? accountDetails.defaultCurrency
  //             : this.currencyService.defaultId.value;

  //         const customerCurrencyItem = this.currencyService.currencies.value.find(
  //           (currencyItem: CurrencyItem) => currencyItem.id === customerCurrency
  //         );
  //         if (customerCurrencyItem) customerCurrencyCode = customerCurrencyItem.code;
  //         //this.store$.dispatch(new UpdateCustomerCurrency({[key]: customerCurrencyCode}));
  //         customerCurrencies[key] = customerCurrencyCode;
  //         return accountDetails;
  //       })));
  //     }

  //     for (let key in priceBreaks.products) {
  //       queries.push(this.api.getAccountDetails(priceBreaks.products[key].vendorId)
  //         .pipe(take(1), map((accountDetails: any) => {
  //           let vendorCurrencyCode;
  //           const vendorCurrency =
  //             accountDetails.defaultCurrency != null &&
  //               accountDetails.defaultCurrency != "0" &&
  //               accountDetails.defaultCurrency != undefined &&
  //               accountDetails.defaultCurrency != 0
  //               ? accountDetails.defaultCurrency
  //               : this.currencyService.defaultId.value;
  //           const vendorCurrencyItem = this.currencyService.currencies.value.find(
  //             (currencyItem: CurrencyItem) => currencyItem.id === vendorCurrency
  //           );
  //           if (vendorCurrencyItem) vendorCurrencyCode = vendorCurrencyItem.code;
  //           //this.store$.dispatch(new UpdateVendorCurrency({ [key]: vendorCurrencyCode }));
  //           vendorCurrencies[key] = vendorCurrencyCode;
  //           return accountDetails;
  //         })));

  //       queries.push(this.api.getAccountDetails(priceBreaks.products[key].customerId)
  //         .pipe(take(1), map((accountDetails: any) => {
  //           let customerCurrencyCode;
  //           const customerCurrency =
  //             accountDetails.defaultCurrency != null &&
  //               accountDetails.defaultCurrency != "0" &&
  //               accountDetails.defaultCurrency != undefined &&
  //               accountDetails.defaultCurrency != 0
  //               ? accountDetails.defaultCurrency
  //               : this.currencyService.defaultId.value;

  //           const customerCurrencyItem = this.currencyService.currencies.value.find(
  //             (currencyItem: CurrencyItem) => currencyItem.id === customerCurrency
  //           );
  //           if (customerCurrencyItem) customerCurrencyCode = customerCurrencyItem.code;
  //           //this.store$.dispatch(new UpdateCustomerCurrency({ [key]: customerCurrencyCode }));
  //           customerCurrencies[key] = customerCurrencyCode;
  //           return accountDetails;
  //         })));
  //     }


  //     return forkJoin(queries).pipe(take(1), switchMap(res => {
  //       return [new UpdateCurrencyEffects({
  //         costBreaks,
  //         priceBreaks,
  //         vendorCurrencies,
  //         customerCurrencies
  //       })]
  //     }))
  //   })
  // );



  @Effect()
  updateCurrencies = this.actions$.pipe(ofType(OrderFormActionTypes.UpdateCurrencyEffects), 
  switchMap((data: UpdateCurrencyEffects) => {
    const { costBreaks, priceBreaks } = data.payload;
    // return [new ApplyPriceBreaks({
    //   costBreaks,
    //   priceBreaks
    //  })]
    return [new ApplyPriceBreaksSuccess({})];
  }));

  @Effect()
  applyPriceBreaks$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.ApplyPriceBreaks),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder)), 
    // this.store$.pipe(select(fromOrderForm.getCurrency)),
    // this.store$.pipe(select(fromOrderForm.getCustomerCurrencies)),
    // this.store$.pipe(select(fromOrderForm.getVendorCurrencies)), 
      this.store$.pipe(select(fromOrderForm.getTimesFetchedCurrency))),
    switchMap(([action, _order, timesFetched ]: [ApplyPriceBreaks, OrderDetails, number]) => {
      const { costBreaks, priceBreaks } = action.payload;
      let noBreak: boolean = false;
      const currencyEnabled = this.currencyService.currencySettings.value.enableCurrency === "1";
      const productCurrencies = this.currencyService.productCurrencies.value;
      console.log("product currencies", productCurrencies);
      const baseCurrency = this.currencyService.currencySettings.value.baseCurrency;
      const exchangeRates = this.currencyService.exchangeRates.value;
      // if (this.currencyService.currencySettings.value.enableCurrency == "1" &&
      //   (Object.keys(costBreaks.products).length &&
      //     !Object.keys(vendorCurrencies).length) ||
      //   (Object.keys(priceBreaks.products).length &&
      //     !Object.keys(customerCurrencies).length)
      // ) {
      //   return [new FetchVendorCustomerCurrency({
      //     costBreaks,
      //     priceBreaks,
      //     currency
      //   })]
      // }
        const order = { ..._order };
      order.lineItems = order.lineItems.map((item) => {
        return {
          ...item,
          matrixRows: item.matrixRows.map((row) => {

            const adjustments: Partial<MatrixRow> = {};

            if (costBreaks.products[row.matrixUpdateId]) {
              if (currencyEnabled && productCurrencies[row.matrixUpdateId]){
                if (productCurrencies[row.matrixUpdateId] && !currencyMatches(baseCurrency, productCurrencies[row.matrixUpdateId])){
                  adjustments.cost = convertCurrency(
                    baseCurrency,
                    productCurrencies[row.matrixUpdateId],
                    exchangeRates,
                    costBreaks.products[row.matrixUpdateId].suggested
                  );
                  adjustments.origCost = convertCurrency(
                    baseCurrency,
                    productCurrencies[row.matrixUpdateId],
                    exchangeRates,
                    adjustments.cost.toString()
                  );
                } 
                // else if (!productCurrencies[row.matrixUpdateId] && timesFetched < 4){
                //   return [new FetchVendorCustomerCurrency({
                //     costBreaks,
                //     priceBreaks,
                //     currency
                //   })]
                // } 
                else {
                  adjustments.cost = costBreaks.products[row.matrixUpdateId].suggested;
                  adjustments.origCost = adjustments.cost;
                }

              } else {
                adjustments.cost = costBreaks.products[row.matrixUpdateId].suggested;
                adjustments.origCost = adjustments.cost;
              }
              
            }
            if (priceBreaks.products[row.matrixUpdateId]) {
              if (currencyEnabled && baseCurrency){
                if (productCurrencies[row.matrixUpdateId] && !currencyMatches(baseCurrency, productCurrencies[row.matrixUpdateId])){
                  adjustments.price = convertCurrency(
                    baseCurrency,
                    productCurrencies[row.matrixUpdateId],
                    exchangeRates,
                    priceBreaks.products[row.matrixUpdateId].suggested
                  );
                  adjustments.origPrice = convertCurrency(
                    baseCurrency,
                    productCurrencies[row.matrixUpdateId],
                    exchangeRates,
                    adjustments.price.toString()
                  );
                } 
                // else if (!productCurrencies[row.matrixUpdateId] && timesFetched < 4) {
                //   return [new FetchVendorCustomerCurrency({
                //     costBreaks,
                //     priceBreaks,
                //     currency
                //   })];
                // }  
                else {
                  adjustments.price = priceBreaks.products[row.matrixUpdateId].current;
                  adjustments.origPrice = row.origPrice;
                  noBreak = true;
                }
              } else {
                adjustments.price = priceBreaks.products[row.matrixUpdateId].suggested;
              adjustments.origPrice = adjustments.price;
              }
            }


            if (adjustments.hasOwnProperty('cost') || adjustments.hasOwnProperty('price')) {
              return { ...row, ...adjustments };
            }

            return row;
          }),
          decoVendors: item.decoVendors.map((vendor) => {
            const adjustments: Partial<IDecoVendor> = {};

            if (costBreaks.decorations[vendor.decoVendorRecordId]) {
              adjustments.itemCost = costBreaks.decorations[vendor.decoVendorRecordId].suggested;
            }
            if (priceBreaks.decorations[vendor.decoVendorRecordId]) {
              adjustments.customerPrice = priceBreaks.decorations[vendor.decoVendorRecordId].suggested;
            }
            if (adjustments.hasOwnProperty('itemCost') || adjustments.hasOwnProperty('customerPrice')) {
              return { ...vendor, ...adjustments };
            }
            return vendor;
          })
        };
      });


      if (noBreak) return of({type: 'NOOP'});
      
      return this.api.updateOrder(order).pipe(
        map((res) => {
          return new ApplyPriceBreaksSuccess(res);
        }),
        //catchError((err) => of({ type: 'NOOP' }))
        catchError((err) => {
          console.log(err.error.msg);
          return of(new ApplyPriceBreaksError(err))
        })
      );

    })
  );

  @Effect()
  loadOrderVouch$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderSuccess),
    switchMap((action: LoadOrderSuccess) => {
      console.log(action.payload.id);
      return this.api.isOrderVouched({id:action.payload.id}).pipe(
        map((res: any) => new LoadOrderVouchedSuccess(res)),
        catchError(error => {
          this.messageService.show(error.error.msg, 'error');
          return of(new LoadOrderVouchedError(error));
        }
        )
      );
    })
  );

  @Effect()
  lockVouchedOrder$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderVouchedSuccess, OrderFormActionTypes.UpdateConfig),
    withLatestFrom(
      this.store$.pipe(select(fromOrderForm.getOrder)),
      this.store$.pipe(select(fromOrderForm.getConfig)),
      this.store$.pipe(select(fromOrderForm.getVouched)),
    ),
    switchMap(([action, order, config, vouched]: [any, any, any, any]) => {

      if (action.options && action.options.skipEffects) {
        return of({ type: 'NOOP - skip effects' });
      }

      if (order && order.orderStatus && config) {
        const status = order.orderStatus.toLowerCase();
        
        
        if(action.payload.vouched)
        { 
          vouched = action.payload.vouched;
          if ((
            config && config.module
            && config.module.settings
            && config.module.settings.lockVouchedOrders == '1'
          ) && vouched && status === 'booked'
          ) {
            if (this.authService.getCurrentUser().userType === 'AnteraAdmin') {
              return of({ type: 'NOOP' });
            }
            return of(new UpdateConfig({ edit: true , vouchedCost: false}, { skipEffects: true }));
          }
        }
      }
      return of({ type: 'NOOP' });
    })
  );


  @Effect()
  lockInvoicedOrder$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderSuccess, OrderFormActionTypes.UpdateConfig),
    withLatestFrom(
      this.store$.pipe(select(fromOrderForm.getOrder)),
      this.store$.pipe(select(fromOrderForm.getConfig)),
    ),
    switchMap(([action, order, config]: [any, any, any]) => {

      if (action.options && action.options.skipEffects) {
        return of({ type: 'NOOP - skip effects' });
      }

      if (order && order.orderStatus && config) {
        const status = order.orderStatus.toLowerCase();

        if ((
          config && config.module
          && config.module.settings
          && config.module.settings.lockInvoicedOrders == '1'
        ) && status === 'billed'
        ) {
          if (this.authService.getCurrentUser().userType === 'AnteraAdmin') {
            return of({ type: 'NOOP' });
          }
          return of(new UpdateConfig({ edit: false }, { skipEffects: true }));
        }
      }
      return of({ type: 'NOOP' });
    })
  );

  @Effect()
  loadOrderConfig$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderConfig),
    switchMap((action: LoadOrderConfig) => {
      const user: User = this.authService.getCurrentUser();
      //console.log(order);
      return forkJoin([
        this.api.getAdvanceSystemConfigAll({ module: 'Orders' }),
        this.api.getSystemConfigs(),
        this.api.getDesignLocations(),
        this.api.post('/content/connector-get-config', { connector: 'TAXJAR', configs: { 0: 'enabled' } }).pipe(map((res: any) => res.enabled)),
        this.api.post('/content/connector-get-config', { connector: 'TAXJAR', configs: { 0: 'autoTaxCalc' } }).pipe(map((res: any) => res.autoTaxCalc)),
        this.api.post('/content/connector-get-config', { connector: 'SHIPSTATION', configs: { 0: 'enabled' } }).pipe(map((res: any) => res.enabled)),
//        this.api.isOrderVouched({id: order.id}).pipe(map((res: any) => res.vouched)),
        this.api.checkUserAction(user.userId, 'restrict_order_sales_pricing'),
      ]).pipe(
        map(([module, system, decoLocations, taxJarEnabled, taxJarAutoTaxCalc, shipStationEnabled, vouched, orderSalesPricing]) => {
          return new UpdateConfig({
            module,
            system,
            decoLocations,
            taxJarEnabled,
            taxJarAutoTaxCalc,
            shipStationEnabled,
  //          vouched,
            permissions: {
              restrict_order_sales_pricing: orderSalesPricing,
            }
          });
        }),
        catchError(error => of(new LoadOrderError(error)))
      );
    })
  );

  @Effect()
  markAsClean$ = this.actions$.pipe(
    ofType(
      OrderFormActionTypes.SaveOrderSuccess,
    ),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrderFormState))),
    switchMap(([action, state]) => {
      return of(new UpdateConfig({ dirty: false }, { skipEffects: true }));
    })
  );

/*
  @Effect()
  orderChanged$ = this.actions$.pipe(
    ofType(
      OrderFormActionTypes.SaveOrderSuccess,
    ),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrderFormState))),
    switchMap(([action, state]) => {
      this.socket.orderChanged({id: state.order.id, data: {username: this.authService.getCurrentUser().userName}});
      return of(new UpdateConfig({ dirty: false }, { skipEffects: true }));
    })
  );
  */


  @Effect()
  markAsDirty$ = this.actions$.pipe(
    ofType(
      OrderFormActionTypes.UpdateMatrixRow,
      OrderFormActionTypes.UpdateLineItem,
      OrderFormActionTypes.UpdateCharge,
      OrderFormActionTypes.ReorderItemDropped,
    ),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrderFormState))),
    switchMap(([action, state]) => {
      return of(new UpdateConfig({ dirty: true }, { skipEffects: true }));
    })
  );


  @Effect()
  saveOrderMutations$ = this.actions$.pipe(
    ofType(
      OrderFormActionTypes.AddProductsToOrder,

    ),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrderFormState))),
    switchMap(([action, state]) => {
      return of(new SaveOrder(state.order));
    })
  );

  @Effect()
  deleteLineItem$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.DeleteLineItem),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    exhaustMap(([action, order]: [DeleteLineItem, OrderDetails]) => {
      return this.api.deleteLineItems(order.id, action.payload).pipe(
        map((res) => {
          if(order.orderStatus == 'Booked') {
            this.api.createPurchaseOrderNeed(order.id).subscribe((response: any) => { });
            this.api.createPendingInvoice({id:order.id}).subscribe((response: any) => { });
          }
          return new DeleteLineItemSuccess(res);
        }),
        catchError((error) => of(new DeleteLineItemError(error))),
      );
    })
  );

  @Effect()
  duplicateLineItem$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.DuplicateLineItem),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    exhaustMap(([action, _order]: [DuplicateLineItem, OrderDetails]) => {

      // Create generic line item
      const decorationsByRowIndex = {};
      const rows = action.payload.item.matrixRows.map((row, index) => {
        decorationsByRowIndex[index] = action.payload.item.decoVendors.reduce((decoVendors, vendor) => {
          const matchingDetails = vendor.decorationDetails.filter((decoDetail) => {
            return decoDetail.matrixId === row.matrixUpdateId;
          });
          if (matchingDetails.length > 0) {
            decoVendors.push({
              ...vendor,
              decorationDetails: matchingDetails
            });
          }
          return decoVendors;
        }, []);

        return {
          ...row,
          matrixUpdateId: '',
        };
      });
      const addons = action.payload.item.addonCharges.map((addon) => {
        return {
          ...addon,
          addonChargeUpdateId: ''
        };
      });

      const sourceItem = {
        ...action.payload.item,
        lineItemUpdateId: '',
        matrixRows: rows,
        sortOrder: _order.lineItems.length + 1,
        addonCharges: addons,
      };

      const orderWithNewLine = {
        ..._order,
        lineItems: [
          ..._order.lineItems,
          sourceItem
        ]
      };

      return this.api.updateOrder(orderWithNewLine).pipe(
        switchMap((res: any) => {
          const order = res.extra;
          const lastLine = order.lineItems[order.lineItems.length - 1];
          const requests = [];
          lastLine.matrixRows.forEach((row, index) => {
            const decorationsToCopy = decorationsByRowIndex[index];
            decorationsToCopy.forEach(deco => {
              const targetDecorations = [];

              const targetDecoration = {
                designId: deco.designId,
                orderId: order.id,
                lineItemId: lastLine.lineItemUpdateId,
                matrixRowIds: [row.matrixUpdateId],
                variationToChooseFrom: {},
              };

              deco.decorationDetails.forEach(decoDetail => {
                targetDecoration.variationToChooseFrom[row.matrixUpdateId] = decoDetail.variationUniqueId;
              });
              targetDecorations.push(targetDecoration);

              requests.push(
                this.api.linkDesignToLineItemWithVariation(
                  targetDecoration.designId,
                  targetDecoration.orderId,
                  targetDecoration.lineItemId,
                  targetDecoration.matrixRowIds,
                  targetDecoration.variationToChooseFrom
                )
              );
            });
            
          });
          if(order.orderStatus == 'Booked') {
            this.api.createPurchaseOrderNeed(order.id).subscribe((response: any) => { });
            this.api.createPendingInvoice({id:order.id}).subscribe((response: any) => { });
          }
          return forkJoin(requests);
        }),
      ).pipe(
        map((res) => new DuplicateLineItemSuccess(res)),
        catchError((error) => of(new DuplicateLineItemError(error))),
      );
    })
  );

  @Effect()
  deleteMatrixRows$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.DeleteMatrixRows),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    exhaustMap(([action, order]: [DeleteMatrixRows, OrderDetails]) => {
      const requests = [];
      const rowsToDelete = [];
      const itemsToDelete = [];

      action.payload.ids.forEach((id) => {
        const itemIndex = order.lineItems.findIndex((item) => item.matrixRows.some((row) => row.matrixUpdateId === id));
        if (itemIndex !== -1) {
          const item = order.lineItems[itemIndex];
          const idsForItem = item.matrixRows.map((row) => row.matrixUpdateId).filter((matrixUpdateId) => {
            return action.payload.ids.includes(matrixUpdateId);
          });
          if (item.matrixRows.length === idsForItem.length) {
            itemsToDelete.push(item.lineItemUpdateId);
          } else {
            rowsToDelete.push(id);
          }
        }
      });

      if (itemsToDelete.length > 0) {
        requests.push(this.api.deleteLineItems(order.id, itemsToDelete));
      }

      if (rowsToDelete.length > 0) {
        requests.push(this.api.deleteLineItemMatrixRows(order.id, 1, rowsToDelete));
      }
      if(order.orderStatus == 'Booked') {
        this.api.createPurchaseOrderNeed(order.id).subscribe((response: any) => { });
        this.api.createPendingInvoice({id:order.id}).subscribe((response: any) => { });
      }
      return forkJoin(requests).pipe(
        map((res) => new DeleteMatrixRowsSuccess(res, action)),
        catchError((error) => of(new DeleteMatrixRowsError(error, action))),
      );
    })
  );

  @Effect()
  reloadAfterSave$ = this.actions$.pipe(
    ofType(
      OrderFormActionTypes.AddDecorationSuccess,
      OrderFormActionTypes.DuplicateLineItemSuccess,
      OrderFormActionTypes.DuplicateLineItemError,
      OrderFormActionTypes.DeleteLineItemSuccess,
      OrderFormActionTypes.DeleteMatrixRowsSuccess,
      OrderFormActionTypes.DeleteDecorationsSuccess,
      OrderFormActionTypes.DeleteChargeSuccess,
      OrderFormActionTypes.UpdateDecorationSuccess,
      OrderFormActionTypes.SaveChargeDialogSuccess,
      OrderFormActionTypes.SaveOrderSuccess,
      OrderFormActionTypes.ApplyPriceBreaksSuccess,
      OrderFormActionTypes.ChangeDesignVariationSuccess,
      OrderFormActionTypes.SyncTaxJarSuccess,
      OrderFormActionTypes.SyncShipStationSuccess,
    ),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrderFormState))),
    switchMap(([action, state]) => {
      this.socket.orderChanged({id: state.order.id, data: {username: this.authService.getCurrentUser().userName}});
      return of(new LoadOrder({ id: state.order.id }));
    })
  );

  @Effect()
  addDecorationToRow$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.AddDecoration),
    switchMap((action: AddDecoration) => {
      return forkJoin(
        action.payload.designsToModify.map(design =>
          this.api.linkDesignToLineItemWithVariation(
            design.designId,
            design.orderId,
            design.lineItemId,
            design.matrixRowIds,
            design.variationToChooseFrom
          )
        )
      ).pipe(
        map((res) => new AddDecorationSuccess(res)),
        catchError((error) => of(new AddDecorationError(error))),
      );

    })
  );

  @Effect()
  deleteDecorations$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.DeleteDecorations),
    mergeMap((action: DeleteDecorations) => {

      const payload = {
        orderId: action.payload.orderId,
        lineItemId: action.payload.lineItemId,
        decoVendorRecordIds: action.payload.ids,
      };

      return this.api.deleteDesignFromLineItem(payload).pipe(
        map((res) => new DeleteDecorationsSuccess(res, action)),
        catchError((err) => of(new DeleteDecorationsError(err, action))),
      );
    })
  );

  @Effect()
  checkPriceType$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.DeleteDecorationsSuccess, OrderFormActionTypes.DeleteMatrixRowsSuccess),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    switchMap(([action, order]: [any, OrderDetails]) => {

      let itemsToCheck = [];
      const parentAction = action.action;

      switch (parentAction.type) {
        case OrderFormActionTypes.DeleteDecorations:
          const item = order.lineItems.find((_item) => _item.id === parentAction.payload.lineItemId);
          itemsToCheck = [item];
          break;
        case OrderFormActionTypes.DeleteMatrixRows:
          const seen = {};
          itemsToCheck = parentAction.payload.ids.reduce((items, matrixUpdateId, index) => {
            const item = order.lineItems.find((_item) => {
              return _item.matrixRows.some(row => row.matrixUpdateId === matrixUpdateId);
            });
            if (!seen[item.lineItemUpdateId]) {
              items.push({
                ...item,
                decoVendors: item.decoVendors.filter((decoVendor) => !parentAction.payload.ids.includes(decoVendor.decorationDetails[0].matrixId))
              });
              seen[item.lineItemUpdateId] = true;
            }
            return items;
          }, []);
          break;
        // itemsToCheck
        case OrderFormActionTypes.UpdateDecoration:
          itemsToCheck = [parentAction.payload.item];
          break;
      }

      // Check to see if the price type is still valid
      // If the price type is no longer applicable, reset it to empty
      const itemsToUpdate = itemsToCheck.reduce((items, item, index) => {
        if (item.priceType) {
          let shouldRemovePriceType = true;
          item.decoVendors.forEach((decoVendor: IDecoVendor) => {
            if (decoVendor.sourceLocationId && decoVendor.sourceLocationId) {
              shouldRemovePriceType = false;
            }
            // need to find a way to get from decoVendor to source key
          });
          if (shouldRemovePriceType) {
            items[item.lineItemUpdateId] = true;
          }
        }
        return items;
      }, {});

      const idsToUpdate = Object.keys(itemsToUpdate);

      if (!idsToUpdate.length) {
        return of({ type: 'NOOP - No items to reset to priceType' });
      }

      const newOrderState = {
        ...order,
        lineItems: order.lineItems.map((item) => {
          if (itemsToUpdate[item.lineItemUpdateId]) {
            return { ...item, priceType: null };
          }
          return item;
        }),
      };

      return of(new SaveOrder(newOrderState));
    }),
  );

  @Effect()
  loadDecorationVendors$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadDecorationVendorsForType),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getDecoVendorsByType))),
    mergeMap(([action, decoVendorsByType]: [LoadDecorationVendorsForType, any]) => {

      const decoType = action.payload.decoType;

      if (decoVendorsByType[decoType]) {
        return of(new LoadDecorationVendorsForTypeSuccess({
          decoType: decoType,
          vendors: decoVendorsByType[decoType]
        }));
      }

      const params = {
        decoType: decoType
      };

      return this.api.getDecoratorVendorsByDecoType(params).pipe(
        map((res: any[]) => new LoadDecorationVendorsForTypeSuccess({
          decoType: decoType,
          vendors: res
        })),
        catchError(error => of({ type: 'uu' }))
      );
    })
  );

  @Effect()
  loadOrderFields$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderFields),
    switchMap((action: LoadOrderFields) => {

      const params = {
        offset: 0,
        limit: 200,
        order: 'module',
        orient: 'asc',
        term: { module: 'Orders' }
      };

      return this.api.getFieldsList(params).pipe(
        map((res: any[]) => new LoadOrderFieldsSuccess(res)),
        catchError(error => of(null))
      );
    })
  );

  // @Effect()
  // updateDecoration$ = this.actions$.pipe(
  //   ofType(OrderFormActionTypes.UpdateDecoration),
  //   withLatestFrom(
  //     this.store$.pipe(select(fromOrderForm.getOrder)),
  //     this.store$.pipe(select(fromOrderForm.getProductMap)),
  //   ),
  //   mergeMap(([action, order, productMap]: [UpdateDecoration, OrderDetails, any]) => {

  //     const data = { ...action.payload.data };
  //     // Temporary cast this here
  //     data.isSupplierDecorated = data.isSupplierDecorated ? '1' : '0';

  //     const lineItemsToUpdate = order.lineItems.reduce((items, item) => {
  //       if (action.payload.item.lineItemUpdateId === item.lineItemUpdateId) {
  //         const product: ProductDetails = productMap[item.productId];
  //         let shouldRemovePriceType = true;
  //         let priceType = null;
  //         const decoVendors = item.decoVendors.map((decoVendor) => {

  //           if (decoVendor.decoVendorRecordId === action.payload.deco.decoVendorRecordId) {
  //             const updatedDecoVendor = { ...decoVendor, ...data };

  //             if (updatedDecoVendor.sourceLocationId && updatedDecoVendor.sourceLocationId) {
  //               shouldRemovePriceType = false;

  //               if (action.payload.sourceLocation && action.payload.sourceDecoration) {
  //                 priceType = action.payload.sourceDecoration.imprintPriceKey;
  //               }
  //             }

  //             return updatedDecoVendor;
  //           }

  //           if (decoVendor.sourceLocationId && decoVendor.sourceLocationId) {
  //             shouldRemovePriceType = false;
  //           }

  //           return decoVendor;
  //         });

  //         const updatedItem = {
  //           ...item,
  //           decoVendors: decoVendors,
  //         };

  //         if (priceType) {
  //           updatedItem.priceType = priceType;
  //         }

  //         if (shouldRemovePriceType) {
  //           updatedItem.priceType = null;
  //         }

  //         items.push(updatedItem);
  //       }
  //       return items;
  //     }, []);

  //     return this.api.updateLineItem(order.id, lineItemsToUpdate).pipe(
  //       map((res: any) => new UpdateDecorationSuccess(res.extra, action)),
  //       catchError(error => of(new UpdateDecorationError(error, action)))
  //     );
  //   })
  // );

  @Effect()
  loadProduct$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadProduct),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getProductMap))),
    mergeMap(([action, productMap]: [LoadProduct, any]) => {

      if (productMap[action.productId]) {
        return of({ type: 'NOOP - Product cache hit' });
      }

      if (!action.productId) {
        return of({ type: 'NOOP - Line item without a product?' });
      }

      return forkJoin(
        this.api.getProductDetailsCurrency(action.productId),
        this.api.getUniversalFob(action.productId).pipe(
          catchError((err) => {
            this.messageService.show('Error fetching product inventory locations', 'error');
            return of([]);
          }),
        ),
      ).pipe(
        map(([product, universalFob]) => {
          return new LoadProductSuccess({ product, universalFob });
        }),
        catchError((err) => {
          return of(new LoadProductError(err));
        }),
      );
    })
  );

  @Effect()
  loadOrderProductInventory$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadProductSuccess),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getInventoryMap))),
    switchMap(([action, inventory]: [LoadProductSuccess, any]) => {
      const { product } = action.payload;

      if (inventory[product.id]) {
        return of({ type: 'NOOP - ' });
      }

      return of(new LoadProductInventory(product));
    })
  );

  @Effect()
  loadLocalWarehouses$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadLocalWarehouses),
    switchMap(() => {
      return this.api.getAnteraFob().pipe(
        map((res) => new LoadLocalWarehousesSuccess(res)),
        catchError((err) => of(new LoadLocalWarehousesError(err)))
      );
    })
  );

  @Effect()
  loadProductInventory$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadProductInventory),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    mergeMap(([action, order]: [LoadProductInventory, OrderDetails]) => {
      return forkJoin([
        this.api.getProductInventory(action.product.id, order.id),
        this.api.getProductLiveInventory(action.product.id, 1, action.color),
      ]).pipe(
        map(([local, universal]) => new LoadProductInventorySuccess([local, universal], action.product)),
        catchError((err) => of(new LoadProductInventoryError(err, action.product))),
      );
    })
  );

  @Effect()
  pasteCharges$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.PasteCharges),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    switchMap(([action, order]: [PasteCharges, OrderDetails]) => {
      const { sourceCharges, targetRows } = action.payload;

      // Gather map of selected line item ids
      const targetItemMap = {};
      targetRows.forEach(row => {
        const targetItem = order.lineItems.find((item) => {
          return item.matrixRows.some((_row) => _row.matrixUpdateId === row.matrixUpdateId);
        });

        if (!targetItemMap[targetItem.lineItemUpdateId]) {
          targetItemMap[targetItem.lineItemUpdateId] = true;
        }
      });

      const lineItems = order.lineItems.map((_item) => {
        if (targetItemMap[_item.lineItemUpdateId]) {
          const addonCharges = sourceCharges.reduce((charges, sourceCharge, index) => {
            let charge = _item.addonCharges.find((_charge) => _charge.code === sourceCharge.code);
            if (charge) {
              // Update charge
              charge = {
                ...charge,
                cost: sourceCharge.cost,
                price: sourceCharge.price,
                matchOrderQty: sourceCharge.matchOrderQty,
              };
              if (sourceCharge.matchOrderQty == '1') {
                charge.quantity = _item.quantity;
              } else {
                charge.quantity = _item.quantity;
              }
            } else {
              // Add new charge
              charge = { ...sourceCharge };
              charge.addonChargeUpdateId = '';
              if (sourceCharge.matchOrderQty == '1') {
                charge.quantity = _item.quantity;
              } else {
                charge.quantity = sourceCharge.quantity;
              }
            }
            charges.push(charge);
            return charges;
          }, []);

          return {
            ..._item,
            addonCharges: addonCharges
          };
        }

        return _item;
      });

      const payload = {
        ...order,
        lineItems: lineItems
      };
      return of(new SaveOrder(payload));
    })
  );

  @Effect()
  changeDesignVariation$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.ChangeDesignVariation),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    switchMap(([action, order]: [ChangeDesignVariation, OrderDetails]) => {

      const { designsToModify, row, item, deco } = action.payload;
      const meta = designsToModify[0];

      return this.api.deleteDesignFromLineItem({
        orderId: order.id,
        lineItemId: item.lineItemUpdateId,
        decoVendorRecordIds: [deco.decoVendorRecordId]
      }).pipe(
        switchMap(() => {
          const variationsToChooseFrom = {};
          const matrixUpdateId = row.matrixUpdateId;
          variationsToChooseFrom[matrixUpdateId] = meta.variationId;
          return this.api.linkDesignToLineItemWithVariation(
            meta.designId,
            order.id,
            item.lineItemUpdateId,
            [row.matrixUpdateId],
            variationsToChooseFrom
          );
        }),
        map((res: any) => new ChangeDesignVariationSuccess(res)),
        catchError(error => of(new ChangeDesignVariationError(error)))
      );
    })
  );

  @Effect()
  loadOrderArtProofs$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.LoadOrderArtProofs),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    switchMap(([action, order]: [LoadOrderArtProofs, OrderDetails]) => {
      let params: HttpParams = new HttpParams({
        encoder: new MyCustomHttpUrlEncodingCodec()
      });
      if (order && order.id) {
      params = params.append('filter[order_id]', order.id);
      }
      params = params.append('expand', 'transitions');

      return this.api.getArtProofs({
        params: params
      }).pipe(
        map((res: any[]) => new LoadOrderArtProofsSuccess(res)),
        catchError(error => of(new LoadOrderArtProofsError(error)))
      );
    })
  );

  @Effect()
  deleteOrderArtProof$ = this.actions$.pipe(
    ofType(ArtProofActionTypes.DeleteArtProof),
    switchMap((action: DeleteArtProof) => {
      return this.api.deleteArtProof(action.payload.id).pipe(
        map((res: any[]) => new DeleteArtProofSuccess(res)),
        catchError(error => of(new DeleteArtProofError(error)))
      );
    })
  );

  @Effect()
  reloadArtProofs$ = this.actions$.pipe(
    ofType(ArtProofActionTypes.DeleteArtProofSuccess),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    switchMap(([action, order]: [DeleteArtProofSuccess, OrderDetails]) => {
      return of(new LoadOrderArtProofs({ id: order.id }));
    })
  );

  @Effect()
  pasteDecorations$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.PasteDecorations),
    withLatestFrom(this.store$.pipe(select(fromOrderForm.getOrder))),
    switchMap(([action, order]: [PasteDecorations, OrderDetails]) => {

      let { sourceItem, sourceRow, decoSelection, itemRowsSelection } = action.payload;

      const sourceDecorations = [...decoSelection];

      const lineItems = itemRowsSelection.reduce((_rows, row, index) => {
        let lineItem;

        // Check if line item has already been found 
        const lineItemIndex = _rows.findIndex((_item) => _item.matrixRows && _item.matrixRows.some((_row) => row.matrixUpdateId === _row.matrixUpdateId));

        if (lineItemIndex === -1) {

          // Find line item that has matching matrix row id 
          const orderLineItemIndex = order.lineItems.findIndex((_item) => _item.matrixRows.some((_row) => row.matrixUpdateId === _row.matrixUpdateId));

          lineItem = {
            ...order.lineItems[orderLineItemIndex],
            decoVendors: order.lineItems[orderLineItemIndex].decoVendors.map(vendor => {
              return {
                ...vendor,
                decorationDetails: [...vendor.decorationDetails],
                addonCharges: [...vendor.addonCharges]
              };
            }),
          };
        } else {
          lineItem = _rows[lineItemIndex];
        }

        // For each matrix row
        sourceDecorations.forEach((source) => {
          // Find the deco vendor
          let decoVendor;
          // Matching matrix update id, deco location, variationUniqueId
          const decoVendorIndex = lineItem.decoVendors.findIndex((vendor) => {
            return vendor.decorationDetails.some((detail) => {
              return detail.matrixId === row.matrixUpdateId
                && source.decoLocation === vendor.decoLocation
                && source.decorationDetails.map(sourceDetail => sourceDetail.variationUniqueId).includes(detail.variationUniqueId);
            });
          });

          // If it exists update it
          if (decoVendorIndex !== -1) {

            decoVendor = {
              ...lineItem.decoVendors[decoVendorIndex],
              decoLocation: source.decoLocation,
              vendorSupplierDecorated: source.vendorSupplierDecorated,
              itemCost: source.itemCost,
              customerPrice: source.customerPrice,
              costStrategy: source.costStrategy,
              priceStrategy: source.priceStrategy,
              quantity: row.quantity,
            };

            decoVendor.decorationDetails = decoVendor.decorationDetails.map(detail => {
              // Support multiple deco details
              // if (detail.variationUniqueId !== source.variationUniqueId && matrixRow.matrixUpdateId !== detail.matrixId) {
              //   return detail;
              // }
              return {
                ...detail,
                decoProductQty: row.quantity,
                decoProductSize: row.size,
                decoProductColor: row.color,
              };
            });
            const addonCharges = source.addonCharges.reduce((charges, sourceCharge, index) => {
              let charge = decoVendor.addonCharges.find((_charge) => _charge.code === sourceCharge.code);
              if (charge) {
                // Update charge
                charge = {
                  ...charge,
                  cost: sourceCharge.cost,
                  price: sourceCharge.price,
                  matchOrderQty: sourceCharge.matchOrderQty,
                };
                if (sourceCharge.matchOrderQty == '1') {
                  charge.quantity = row.quantity;
                } else {
                  charge.quantity = sourceCharge.quantity;
                }
              } else {
                // Add new charge
                charge = { ...sourceCharge };
                charge.decoVendorRecordId = decoVendor.decoVendorRecordId;
                charge.addonChargeUpdateId = '';
                if (sourceCharge.matchOrderQty == '1') {
                  charge.quantity = row.quantity;
                } else {
                  charge.quantity = sourceCharge.quantity;
                }
              }
              charges.push(charge);
              return charges;
            }, []);
            decoVendor.addonCharges = addonCharges;
            // mutatedDecoVendors.push(decoVendor);
            lineItem.decoVendors[decoVendorIndex] = decoVendor;
          } else {
            // make one
            if (row.matrixUpdateId) {
              decoVendor = {
                ...source,
                decorationDetails: [...source.decorationDetails]
              };

              decoVendor.decoLocation = source.decoLocation;
              decoVendor.vendorSupplierDecorated = source.vendorSupplierDecorated;
              decoVendor.itemCost = source.itemCost;
              decoVendor.customerPrice = source.customerPrice;
              decoVendor.quantity = row.quantity;
              decoVendor.decoVendorRecordId = '';
              decoVendor.decorationDetails = decoVendor.decorationDetails.map((detail) => {
                return {
                  ...detail,
                  decoDetailId: '',
                  decoVendorRecordId: '',
                  matrixId: row.matrixUpdateId,
                  decoProductQty: row.quantity,
                  decoProductSize: row.size,
                  decoProductColor: row.color,
                };
              });
              decoVendor.addonCharges = [];

              const addonCharges = source.addonCharges.reduce((charges, sourceCharge, index) => {
                let charge = decoVendor.addonCharges.find((_charge) => _charge.code === sourceCharge.code);
                // Add new charge
                charge = { ...sourceCharge };
                charge.addonChargeUpdateId = ''; // I hope this will still work
                charge.decoVendorRecordId = '';
                if (sourceCharge.matchOrderQty == '1') {
                  charge.quantity = row.quantity;
                  charges.push(charge);
                }

                return charges;
              }, []);

              decoVendor.addonCharges = addonCharges;
              lineItem.decoVendors.push(decoVendor);
            }
          }
        });

        if (lineItemIndex === -1) {
          _rows.push(lineItem);
        } else {
          _rows[lineItemIndex] = lineItem;
        }
        return _rows;
      }, []);

      const payload = {
        ...order,
        lineItems: lineItems
      };

      return of(new SaveOrder(payload));
    })
  );

  @Effect()
  saveChargeDialog$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.SaveChargeDialog),
    switchMap((action: SaveChargeDialog) => {
      const { orderId, lineItemUpdateId, data } = action.payload;

      const requests = [];

      if (action.payload.vendor) {

        const vendor = {
          ...action.payload.vendor,
          addonCharges: data.charges
        };

        requests.push(
          this.api.updateDecoVendors(orderId, lineItemUpdateId, [vendor])
        );
      } else {
        requests.push(
          this.api.updateAddonCharges(orderId, lineItemUpdateId, data.charges)
        );
      }

      if (data.deleted.length > 0) {
        requests.push(
          this.api.deleteAddonCharges(orderId, lineItemUpdateId, data.deleted)
        );
      }

      return forkJoin(requests).pipe(
        map((res: any) => new SaveChargeDialogSuccess(res)),
        catchError(error => of(new SaveChargeDialogError(error)))
      );

    })
  );

  @Effect()
  deleteCharge$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.DeleteCharge),
    exhaustMap((action: DeleteCharge) => {
      const { orderId, lineItemUpdateId, addonChargeUpdateIds } = action.payload;

      return this.api.deleteAddonCharges(orderId, lineItemUpdateId, addonChargeUpdateIds).pipe(
        map((res: any) => new DeleteChargeSuccess(res)),
        catchError(error => of(new DeleteChargeError(error)))
      );

    })
  );

  @Effect()
  saveOrder$ = this.actions$.pipe(
    ofType(OrderFormActionTypes.SaveOrder),
    // withLatestFrom(
    //   this.store$.pipe(select(fromOrderForm.getOrder)),
    //   this.store$.pipe(select(fromOrderForm.getConfig)),
    // ),
    // switchMap(([action, _order, config]: [SaveOrder, OrderDetails, any]) => {
    //   const order = {...action.payload};
    //   const requests = [];

    //   // Delete line items
    //   const itemIdsToDestroy = [];

    //   const items = order.lineItems.reduce((_items, item) => {
    //     if (item._destroy) {
    //       itemIdsToDestroy.push(item.lineItemId);
    //     }

    //     const rowsToDestroy = [];
    //     const rows = item.matrixRows.reduce((_rows, row) => {
    //       if (item._destroy) {
    //         rowsToDestroy.push(item.lineItemId);
    //       } else {
    //         _rows.push(row);
    //       }
    //       return _rows
    //     }, []);

    //     _items.push({
    //       ...item,
    //       matrixRows: rows
    //     });
    //     return _items;
    //   }, []);

    //   if (itemIdsToDestroy.length > 0) {
    //     requests.push(
    //       this.api.deleteLineItems(
    //         order.id,
    //         itemIdsToDestroy.map((item) => item.lineItemId))
    //     );
    //   }
    //   order.lineItems = items
    //   return of(order);
    // }),
    mergeMap((action: SaveOrder) => {
      return this.api.updateOrder(action.payload).pipe(
        map((res: any) =>  {
          if(res.extra.orderStatus == 'Booked') {
            this.api.createPurchaseOrderNeed(action.payload.id).subscribe((response: any) => { });
            this.api.createPendingInvoice({id: action.payload.id}).subscribe((response: any) => { });
          }
          return new SaveOrderSuccess(res.extra);
        }),
        catchError((error) => {
          this.messageService.show(error.error.msg, 'error');
          return of(new SaveOrderError(error));
        }),
      );
    })
  );


  constructor(private actions$: Actions<OrderFormActions>,
    private api: ApiService,
    private store$: Store<fromOrderForm.State>,
    private authService: AuthService,
    private messageService: MessageService,
    private socket: SocketService,
    private currencyService: CurrencyService
  ) { }
}
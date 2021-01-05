import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder, FormArray } from '@angular/forms';
import { IOrder, FobPoint } from './interfaces';
import { Observable, BehaviorSubject, Subject, combineLatest, config } from 'rxjs';
import * as fromOrderForm from '../order-form/store/order-form.reducer';
import { Store, select } from '@ngrx/store';
import { OrderDetails, LineItem, ProductDetails } from 'app/models';
import { LoadOrder, SaveOrder, UpdateConfig, LoadOrderConfig, LoadOrderFields, OrderFormActionTypes, LoadOrderSuccess, LoadOrderArtProofs } from './store/order-form.actions';
import { take, takeUntil } from 'rxjs/operators';
import { CustomerViewService } from 'app/core/services/customer-view.service';
import { CustomerViewState } from 'app/store/reducers/config.reducer';
import { Actions, ofType } from '@ngrx/effects';

@Injectable({
  providedIn: 'root'
})
export class OrderFormService implements OnDestroy {

  config$: Observable<any>;
  order$: Observable<OrderDetails>;
  items$: Observable<LineItem[]>;
  loading$: Observable<fromOrderForm.OrderLoadingState>;
  inventoryMap$: Observable<fromOrderForm.ProductInventoryMapState>;
  decoVendorsByType$: Observable<{ [key: string]: any[]; }>;
  saving$: Observable<boolean>;
  pricing$: Observable<any>;
  productFobMap$: Observable<{ [key: string]: FobPoint[]; }>;
  localFob$: Observable<FobPoint[]>;
  productMap$: Observable<{ [key: string]: ProductDetails; }>;
  destroyed$: Subject<boolean> = new Subject();
  artProofs$: Observable<any>;

  constructor(
    private store: Store<fromOrderForm.State>,
    private customerViewService: CustomerViewService,
    private actions$: Actions,
  ) {
    this.order$ = store.pipe(select(fromOrderForm.getOrder));
    this.artProofs$ = store.pipe(select(fromOrderForm.getOrderArtProofs));
    this.pricing$ = store.pipe(select(fromOrderForm.getOrderPricing));
    this.config$ = store.pipe(select(fromOrderForm.getConfig));
    this.loading$ = store.pipe(select(fromOrderForm.getLoading));
    this.saving$ = store.pipe(select(fromOrderForm.getSaving));
    this.decoVendorsByType$ = store.pipe(select(fromOrderForm.getDecoVendorsByType));
    this.inventoryMap$ = store.pipe(select(fromOrderForm.getInventoryMap));
    this.localFob$ = store.pipe(select(fromOrderForm.getLocalFob));
    this.productFobMap$ = store.pipe(select(fromOrderForm.getProductFobMap));
    this.productMap$ = store.pipe(select(fromOrderForm.getProductMap));

    combineLatest([
      this.customerViewService.state$,
      this.order$,
    ]).pipe(
      takeUntil(this.destroyed$),
    ).subscribe(([state, order]: [CustomerViewState, OrderDetails]) => {
      if (state.enabled) {
        this.store.dispatch(new UpdateConfig({ hideCost: true, hideVendor: true }));
      } else {
        this.store.dispatch(new UpdateConfig({ hideCost: false, hideVendor: false }));
      }
    });

  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  load(id: string) {
    this.loadOrder(id);
    this.store.dispatch(new LoadOrderConfig());
    this.store.dispatch(new LoadOrderFields());
  }

  loadArtProofs(id) {
    this.store.dispatch(new LoadOrderArtProofs({ id: id }));
  }

  setOrder(order: OrderDetails) {
    this.store.dispatch(new LoadOrderSuccess(order));
  }

  loadOrder(id: string) {
    this.store.dispatch(new LoadOrder({ id: id }));
  }

  save() {
    this.order$.pipe(take(1))
      .subscribe((order) => {
        this.store.dispatch(new SaveOrder(order));
      });
  }

  saveIfDirty() {
    return Observable.create((observable) => {

      this.config$.pipe(
        take(1)
      ).subscribe((_config) => {
        // Setup listener the next save response
        if (_config.dirty) {
          this.actions$.pipe(
            ofType(OrderFormActionTypes.SaveOrderSuccess, OrderFormActionTypes.SaveOrderError),
            take(1),
          ).subscribe((action) => {
            observable.next(action);
            return observable.complete();
          });

          // Dispatch
          this.order$.pipe(
            take(1)
          ).subscribe((order) => {
            this.store.dispatch(new SaveOrder(order));
          });

        } else {
          observable.next(false);
          return observable.complete();
        }

      });
    });
  }

  updateConfig(payload) {
    this.store.dispatch(new UpdateConfig(payload));
  }

  toggleEdit() {
    this.config$.pipe(
      take(1)
    ).subscribe((_config) => {
      this.updateConfig({
        edit: _config.edit ? false : true,
      });

    });
  }

}

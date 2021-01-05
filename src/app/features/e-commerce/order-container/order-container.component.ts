import { NoteService } from 'app/main/note.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromOrderForm from '../order-form/store/order-form.reducer';
import { LoadOrder, SaveOrder, OrderFormActionTypes, LoadOrderSuccess, ResetOrderState } from '../order-form/store/order-form.actions';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { OrderDetails, LineItem } from 'app/models';
import { take, skip, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { OrderFormService } from '../order-form/order-form.service';
import { EcommerceOrderService } from '../order.service';
import { AuthService } from 'app/core/services/auth.service';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-order-container',
  templateUrl: './order-container.component.html',
  styleUrls: ['./order-container.component.scss']
})
export class OrderContainerComponent implements OnInit, OnDestroy {
  orderId: string;
  order$: Observable<OrderDetails>;
  config$: Observable<any>;
  loading$: Observable<any>;
  decoVendorsByType$: Observable<{ [key: string]: any[]; }>;
  saving$: Observable<boolean>;
  private destroyed$ = new Subject();
  inventoryMap$: Observable<fromOrderForm.ProductInventoryMapState>;

  constructor(
    private store: Store<fromOrderForm.State>,
    public orderModel: OrderFormService,
    private orderService: EcommerceOrderService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private actions$: Actions,
    public noteService: NoteService,
  ) { }

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('id');
    this.order$ = this.orderModel.order$;
    this.config$ = this.orderModel.config$;
    this.loading$ = this.orderModel.loading$;
    this.inventoryMap$ = this.orderModel.inventoryMap$;
    this.saving$ = this.orderModel.saving$;
    this.orderModel.load(this.orderId);

    this.actions$.pipe(
      ofType(OrderFormActionTypes.LoadOrderSuccess),
      takeUntil(this.destroyed$),
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((action: LoadOrderSuccess) => {
      const order = { ...action.payload };
      this.orderService.onOrderChanged.next({
        ...action.payload
      });
    });
  }

  ngAfterViewInit() {
    const notesNumber = this.noteService.numberOfNotes();
    console.log('note service...... notes number ....  ', notesNumber);
    // if (
    //   this.tabs.selectedIndex != undefined &&
    //   this.tabs.selectedIndex != null
    // )
    //   this.noteService.formatIndex(this.tabs.selectedIndex);
   //** Initialize tab index in notes service */
}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.store.dispatch(new ResetOrderState());
  }

  reload() {
    this.orderModel.load(this.orderId);
  }

  save() {
    this.orderModel.save();
  }

  toggleEdit() {
    this.orderModel.toggleEdit();
  }

}

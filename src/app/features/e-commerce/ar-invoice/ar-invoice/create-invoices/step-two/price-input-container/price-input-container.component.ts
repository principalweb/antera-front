import { Component, OnInit, ViewEncapsulation, Input, OnDestroy } from '@angular/core';
import { ILineItem } from '../../../../interface/interface';
import { Store, select } from "@ngrx/store";
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription, Subject } from 'rxjs';
import * as PendingInvoiceSelectors from "../../../../state/selectors/pendingInvoice.selectors";
import * as fromPendingInvoice from "../../../../state/pendingInvoices.state";
import * as PendingInvoiceActions from "../../../../store/pendingInvoices.actions";
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'price-input-container',
  templateUrl: './price-input-container.component.html',
  styleUrls: ['./price-input-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PriceInputContainerComponent implements OnInit, OnDestroy {
  @Input() lineItem: ILineItem
  orderedForm: FormGroup;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  myPrice: string;
  

  constructor(private fb: FormBuilder,
    private store: Store<fromPendingInvoice.State>) { }

  ngOnInit() {
    this.subscribeToUnitPrice();
    this.createForm();
  }

  createForm() {
    this.orderedForm = this.fb.group({
      unitPrice: ['']
    });
    this.subscribeToForm();
  }

  subscribeToForm() {
    this.orderedForm.controls.unitPrice.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(unitPrice => {
        this.store.dispatch(new PendingInvoiceActions.EditPrice({
          [this.lineItem.id]: unitPrice
        }));
      });
  }

  subscribeToUnitPrice() {
    this.store.pipe(takeUntil(this.destroyed$),
      select(PendingInvoiceSelectors.getUnitPrice))
      .subscribe((unitPrice: { [key: string]: string }) => this.myPrice = unitPrice[this.lineItem.id]);
  }

  ngOnDestroy(){
    this.destroyed$.next(true);
  }
  
}

import { Component, OnInit, ViewEncapsulation, Input, OnDestroy } from '@angular/core';
import { ILineItem } from '../../../../interface/interface';
import { Store, select } from "@ngrx/store";
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import * as fromPendingInvoice from "../../../../state/pendingInvoices.state";
import * as PendingInvoiceActions from "../../../../store/pendingInvoices.actions";
import * as PendingInvoiceSelectors from "../../../../state/selectors/pendingInvoice.selectors";
@Component({
  selector: 'amount-input-container',
  templateUrl: './amount-input-container.component.html',
  styleUrls: ['./amount-input-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AmountInputContainerComponent implements OnInit, OnDestroy {
  @Input() lineItem: ILineItem
  orderedForm: FormGroup;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  quantityInvoiced: string;

  constructor(private fb: FormBuilder,
    private store: Store<fromPendingInvoice.State>) { }

  ngOnInit() {
    this.subscribeToMyQuantity();
    this.createForm();
  }

  ngOnDestroy(){
    this.destroyed$.next(true);
  }


  createForm() {
    this.orderedForm = this.fb.group({
      invoiceAmount: []
    });
    this.subscribeToForm();
  }

  subscribeToForm(){
    this.lineItem.invoiceQuantity
    this.orderedForm.controls.invoiceAmount.valueChanges
    .pipe(takeUntil(this.destroyed$))
    .subscribe(invoiceAmount => {
      this.store.dispatch(new PendingInvoiceActions.EditAmount({
        [this.lineItem.id]: invoiceAmount
      }));
    });
  }

  subscribeToMyQuantity(){
    this.store.pipe(takeUntil(this.destroyed$), 
    select(PendingInvoiceSelectors.getQuantityInvoiced))
    .subscribe((quantityInvoiced: {[key: string]: string }) => this.quantityInvoiced = quantityInvoiced[this.lineItem.id])
  }

}

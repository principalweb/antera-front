import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { PendingInvoicesService } from '../../../services/pending-invoices.service';
import { Store, select } from "@ngrx/store";
import * as fromPendingInvoice from "../../../state/invoices.state";
import * as PendingInvoiceSelectors from "../../../state/selectors/pendingInvoice.selectors";
import * as PendingInvoiceActions from "../../../store/pendingInvoices.actions";
import { ApiService } from 'app/core/services/api.service';
import { take, takeUntil } from 'rxjs/operators';
import { IInvoice, InvoiceResponse, ILineItem } from '../../../interface/interface';
import { Invoice } from 'app/models/ar-invoice';
import { Subject } from 'rxjs/internal/Subject';
@Component({
  selector: 'invoice-step-three',
  templateUrl: './step-three.component.html',
  styleUrls: ['./step-three.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class StepThreeComponent implements OnInit {
  clicked: boolean = false;
  lineItems: ILineItem;

  constructor(public pendingService: PendingInvoicesService, 
    private store: Store<fromPendingInvoice.State>) { }

  ngOnInit() {
    // this.api.get("/api/v1/ar-invoices/pending?expand=shipTo,billTo,lineItems,salesOrders")
    // .pipe(take(1))
    // .subscribe((invoiceResponse: InvoiceResponse) => {
    //  this.invoices = invoiceResponse.data.map(individualInvoice => new Invoice(individualInvoice));
    //   console.log("test invoices", this.invoices);
    // });
  }

  finalizeInvoices(){
    this.clicked = true;
    this.pendingService.finalizeInvoice();
  }


  filterVariation(lineItems: ILineItem[]): ILineItem[]{
    return lineItems.filter((lineItem: ILineItem) => !!lineItem.color && !!lineItem.size && lineItem.type === "Variation");
  }

  filterCharge(lineItems: ILineItem[]): ILineItem[]{
    return lineItems.filter((lineItem: ILineItem) => lineItem.type.toLowerCase() == 'charge');
  }

  filterDecoration(lineItems: ILineItem[]): ILineItem[]{
    return lineItems.filter((lineItem) => lineItem.type.toLocaleLowerCase() == "decoration");
  }

  

}

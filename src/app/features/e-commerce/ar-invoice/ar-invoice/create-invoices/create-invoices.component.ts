import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Params } from '@angular/router';
import { fuseAnimations } from "@fuse/animations";
import { PendingInvoicesService } from '../../services/pending-invoices.service';
import { Store } from "@ngrx/store";
import * as fromPendingInvoice from "../../state/invoices.state";
import * as PendingInvoiceActions from "../../store/pendingInvoices.actions";
@Component({
  selector: "create-invoices",
  templateUrl: "./create-invoices.component.html",
  styleUrls: ["./create-invoices.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class CreateInvoicesComponent implements OnInit {
  orderIds: string[];
  constructor(private route: ActivatedRoute, 
    public pendingService: PendingInvoicesService,
    private store: Store<fromPendingInvoice.State>
    ) {}

  ngOnInit() {
    this.subscribeToQueryParams();
  }

  subscribeToQueryParams() {
    this.route.queryParams.subscribe((queryParams: Params) => {
      this.orderIds = queryParams.orderIds;
      this.getInvoices();
      console.log("orderIds", this.orderIds);
    });
  }

  getInvoices() {
    console.log("get invoices here when routes change");
  }

  manageSteps(event){
    if (event.selectedIndex === 1 && this.pendingService.invoiceSelectionChanged){
      this.store.dispatch(new PendingInvoiceActions.IsLoading(true));
      this.store.dispatch(new PendingInvoiceActions.InvoiceSelectionChanged(false));
      this.pendingService.getLineItems(1, 100);
    } else if (event.selectedIndex === 2){
      this.pendingService.getSummaryInvoices();
    }
  }

  phaseOneComplete(): boolean {
    return true;
  }
}

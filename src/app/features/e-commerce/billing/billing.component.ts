import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, from } from 'rxjs';
import { concatMap, delay, mergeMap } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { OrderFormDialogComponent } from '../../../shared/order-form-dialog/order-form-dialog.component';
import { SelectionService } from 'app/core/services/selection.service';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
import { BillingListComponent } from './billing-list/billing-list.component';
import { EcommerceBillingService } from 'app/core/services/billing.service';

@Component({
    selector     : 'billing-billing',
    templateUrl  : './billing.component.html',
    styleUrls    : ['./billing.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class BillingComponent implements OnInit, OnDestroy
{
    view = 'kanban-condensed';
    loading = false;
    loaded = () => {
        this.loading = false;
    };

    searchInput: FormControl;
    dialogRef: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    onViewChangedSubscription: any;

    @ViewChild(BillingListComponent) billingList: BillingListComponent;

    constructor(
        private billingService: EcommerceBillingService,
        private router: Router,
        public dialog: MatDialog,
        private api: ApiService,
        public selection: SelectionService,
        private auth: AuthService,
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
        this.onViewChangedSubscription =
            this.billingService.onViewChanged
                .subscribe(view => this.view = view);

    }

    ngOnDestroy()
    {
        this.onViewChangedSubscription.unsubscribe();
    }

    newBilling(orderType='Fulfillment')
    {
        const dlgRef = this.dialog.open(OrderFormDialogComponent, {
            panelClass: 'antera-details-dialog',
            data: {
                action: 'new',
                type: orderType
            }
        });

        dlgRef.afterClosed().subscribe((result) => {
            if (result) {
                if (result.action == 'create'){
                    this.router.navigate(['/e-commerce/billing/', result.order.id]);
                }
            }
        });
    }

    deleteBilling(ids) {
        if (this.confirmDialogRef) {
            return;
        }

        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this billing?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.billingService.deleteBilling(ids)
                    .subscribe(() => {})
            }
            this.confirmDialogRef = null;
        });
    }

    deleteSelectedBilling() {
        this.deleteBilling(this.selection.selectedIds);
    }

    clearSearch(){
      if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');
    }

    changeView(ev) {
        this.billingService.onViewChanged.next(ev.value);
    }

    clearFilters() {
        this.searchInput.setValue('');
        this.billingService.resetParams();
        this.billingList.loading = true;
        this.billingService.getBillingWithCount()
            .subscribe((res) => {
                this.billingList.loading = false;
            }, (err) => {
                this.billingList.loading = false;
            });
    }
    cloneFulfillmentOrder()
    {
        this.loading = true;
        const selectedIds = from(this.selection.selectedIds);
        const requests = selectedIds.pipe(concatMap(
	  (val) => {
	  return this.billingService.cloneFulfillment(val);
	  }
	));
	const subscribe = requests.subscribe((val) => {
	  this.loading = false;
	  this.selection.reset(false);
          this.billingService.getBoardBilling()
              .subscribe(() => {});
	  });
	
    }
}


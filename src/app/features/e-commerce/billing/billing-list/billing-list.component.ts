import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable, forkJoin } from 'rxjs';
import { each, find } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { SelectionService } from 'app/core/services/selection.service';
import { EcommerceBillingService } from 'app/core/services/billing.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, delay, map } from 'rxjs/operators';

@Component({
    selector     : 'app-billing-list',
    templateUrl  : './billing-list.component.html',
    styleUrls    : ['./billing-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class BillingListComponent implements OnInit, OnDestroy
{
    @Output() delete = new EventEmitter();
    @ViewChild('dialogContent') dialogContent: TemplateRef<any>;

    dataBilling: BillingDataSource;
    displayedColumns = ['checkbox', 'orderNo', 'orderIdentity', 'contactName', 'salesPerson', 'accountName', 'orderType', 'billingStage', 'orderDate'];

    checkboxes: {};

    onSelectionChangedSubscription: Subscription;
    onBillingChangedSubscription: Subscription;

    dialogRef: any;
    filterForm: FormGroup;
    businessTypes = [];
    
    loading = false;
    loaded = () => {
        this.loading = false;
    };
  
    constructor(
        private billingService: EcommerceBillingService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        public selection: SelectionService,
        private router: Router,
    ) {
        this.selection.reset(false);
        this.filterForm = this.fb.group(this.billingService.params.term);

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged.subscribe(selection => {
                this.checkboxes = selection;
            })

        this.onBillingChangedSubscription =
            this.billingService.onBillingChanged
                .subscribe(billing => {
                    this.checkboxes = {};
                    billing.map(billing => {
                        this.checkboxes[billing.id] = false;
                    });
                    this.selection.init(billing);
                });

        this.dataBilling = new BillingDataSource(billingService);
    }

    ngOnInit()
    {
        const fields = [
            'orderNo', 'orderIdentity', 'contactName', 'salesPerson', 'accountName', 'orderType', 'orderDate'
        ];
        each(fields, f => {
            this.filterForm.get(f).valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
            ).subscribe(() => {
                this.filterBilling();
            })
        });

        this.loading = true;
        this.billingService.getBillingWithCount()
            .subscribe(() => {
                this.loading = false;
            })
    }

    ngOnDestroy()
    {
        this.onBillingChangedSubscription.unsubscribe();
    }

    editBilling(billing)
    {
        this.router.navigate(['/e-commerce/billing', billing.id]);
    }

    updateBilling(billingDetails) {
        this.loading = true;
        //this.billingService.updateBilling(billingDetails)
        //    .subscribe(this.loaded, this.loaded);
    }

    deleteBilling(billing)
    {
        this.delete.emit([billing.id]);
    }

    onSelectedChange(billingId)
    {
        this.selection.toggle(billingId);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterBilling() {
        const filters = this.filterForm.value;
        this.billingService.setFilters(filters);
        
        this.loading = true;
        forkJoin([
            this.billingService.getBilling(),
            this.billingService.getBillingCount()
        ]).subscribe(() => {
            this.loading = false;
        });
    }

    sort(sortEvent) {
        this.billingService.setSortData(sortEvent);

        this.loading = true;
        this.billingService.getBilling()
            .subscribe(() => {
                this.loading = false;
            });
    }

    paginate(pageEvent) {
        this.billingService.setPagination(pageEvent);
        this.loading = true;
        this.billingService.getBilling()
            .subscribe(() => {
                this.loading = false;
            });
    }
}

export class BillingDataSource extends DataSource<any> {
    total = 0;
    totalSubscription: Subscription;

    constructor(private service: EcommerceBillingService) {
        super();
    }

    connect(): Observable<any[]> {
        this.totalSubscription = this.service.onTotalCountChanged.pipe(
            delay(100)
        ).subscribe(total => {
            this.total = total;
        });

        return this.service.onBillingChanged.pipe(
            map(billing => {
                const stages = this.service.onStageChanged.value;
                return billing.map(
                    billing => {
                        const stage = find(stages, {value: billing.billingStage});
                        if (stage) {
                            billing.stage = stage.value;
                        }

                        return billing;
                    }
                );
            }),
        );
    }

    disconnect() {
        this.totalSubscription.unsubscribe();
    }
}

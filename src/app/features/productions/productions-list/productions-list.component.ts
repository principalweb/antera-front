import { Component, OnDestroy, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { ProductionsService } from 'app/core/services/productions.service';
import { SelectionService } from 'app/core/services/selection.service';
import { Production } from 'app/models';
import { delay } from 'rxjs/operators';

@Component({
    selector     : 'fuse-productions-list',
    templateUrl  : './productions-list.component.html',
    styleUrls    : ['./productions-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseProductionsListComponent implements OnInit, OnDestroy
{
    @Input() embedded = false;
    @Input() multiselect = true;

    dataSource: ProductionDataSource | null;
    displayedColumns = [
        'checkbox',
        'customerName',
        'orderName',
        'decoTypeName',
        'productName',
        'machineName',
        'variationName',
        'statusName',
    ];
    checkboxes: any = {};

    onProductionsChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;
    onClearFiltersSubscription: Subscription;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    filterForm: FormGroup;
    loading = false;
    loaded = () => {
        this.loading = false;
    }

    constructor(
        private productionsService: ProductionsService,
        private router: Router,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private selection: SelectionService
    )
    {
        this.onProductionsChangedSubscription =
            this.productionsService.onProductionsChanged.subscribe(productions => {
                this.selection.init(productions);
            });

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged.subscribe(selection => {
                this.checkboxes = selection;
            });

        this.filterForm = this.fb.group(this.productionsService.listColumns);
    }

    ngOnInit()
    {
        this.filterProductions();

        this.dataSource = new ProductionDataSource(
            this.productionsService
        );

        this.onClearFiltersSubscription =
            this.productionsService.onClearFilters
                .subscribe(() => {
                    this.filterForm.reset();
                    this.clearFilters();
                });
    }

    ngOnDestroy()
    {
    /*    this.onProductionsChangedSubscription.unsubscribe();
    */
        this.onSelectionChangedSubscription.unsubscribe();
        this.onClearFiltersSubscription.unsubscribe();
    }

    deleteProduction(production)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.loading = true;
                this.productionsService.deleteProduction(production)
                    .subscribe(this.loaded, this.loaded);
            }

            this.confirmDialogRef = null;
        });

    }

    onSelectedChange(id)
    {
        if (!this.multiselect) {
            this.selection.reset(false);
        }

        this.selection.toggle(id);
    }

    editProduction(production)
    {
        if (this.embedded) {
            this.onSelectedChange(production.id);
            return;
        }

        this.router.navigate(['/productions', production.id]);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    extractProductionColor(color_arrary) {
        if(color_arrary){
            const colors = color_arrary.replace(/\s/g, '').split(',');
            return colors[0];
        }
    }

    filterProductions(){
        if (this.loading) {
            return;
        }

        this.productionsService.payload.term = this.filterForm.value;

        this.loading = true;
        forkJoin([
            this.productionsService.getProductionCount(),
            this.productionsService.getProductions()
        ]).subscribe(
            this.loaded,
            this.loaded
        );
    }

    paginate(ev) {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.productionsService.paginate(ev)
            .subscribe(
                this.loaded,
                this.loaded
            );
    }

    sort(se) {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.productionsService.sort(se)
            .subscribe(
                this.loaded,
                this.loaded
            );
    }

    clearFilters() {
        this.loading = true;
        this.productionsService.selection.reset(false);
        this.productionsService.resetList()
            .subscribe(() => {
                this.loading = false;
            });
    }

    addFilter(ev, fcName) {
        ev.preventDefault();
        ev.stopPropagation();
        this.filterForm.get(fcName).setValue(ev.srcElement.innerText);
        this.filterProductions();
    }
}

export class ProductionDataSource extends DataSource<any>
{
    total = 0;
    totalSubscription: Subscription;

    constructor(
        private productionsService: ProductionsService,
    ) {
        super();
    }

    connect(): Observable<Production[]>
    {
        this.totalSubscription =
            this.productionsService.onTotalCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.productionsService.onProductionsChanged;
    }

    disconnect()
    {
        this.totalSubscription.unsubscribe();
    }
}

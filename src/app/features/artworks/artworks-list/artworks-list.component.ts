import { Component, OnDestroy, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DataSource } from '@angular/cdk/collections';
import { Subscription, Observable, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { OrderDetailDialogComponent } from 'app/shared/order-detail-dialog/order-detail-dialog.component';
import { ArtworksService } from 'app/core/services/artworks.service';
import { SelectionService } from 'app/core/services/selection.service';
import { Artwork } from 'app/models';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'fuse-artworks-list',
    templateUrl: './artworks-list.component.html',
    styleUrls: ['./artworks-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FuseArtworksListComponent implements OnInit, OnDestroy {
    @Input() embedded = false;
    @Input() multiselect = true;
    @Input() customerName = '';
    @ViewChild('paginator') paginator: MatPaginator;
    orderDetailDlgRef: MatDialogRef<OrderDetailDialogComponent>;
    dataSource: ArtworkDataSource | null;
    displayedColumns = [
        'checkbox',
        'customerName',
        'featureImage',
        'designNo',
        'identity',
        'designTypeName',
        'category',
        'statusName',
        'assignee',
        'projectName',
        'relatedOrders'
    ];
    checkboxes: any = {};

    onArtworksChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;
    onClearFiltersSubscription: Subscription;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    filterForm: FormGroup;
    loading = false;
    loaded = () => {
        this.loading = false;
        this.cd.markForCheck();
    }

    constructor(
        private artworksService: ArtworksService,
        private router: Router,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private selection: SelectionService,
        private cd: ChangeDetectorRef,
    ) {
        this.onArtworksChangedSubscription =
            this.artworksService.onArtworksChanged.subscribe(artworks => {
                this.selection.init(artworks);
            });

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged.subscribe(selection => {
                this.checkboxes = selection;
                this.cd.markForCheck();
            });

    }

    ngOnInit() {
        if(this.customerName !=''){
            this.artworksService.changeView('list');
            this.artworksService.payload.term.customerName = this.customerName;
            this.artworksService.payload.limit = 50;
        }
        this.filterForm = this.fb.group(this.artworksService.payload.term);
        this.filterArtworks();

        this.dataSource = new ArtworkDataSource(
            this.artworksService
        );

        // Reset pagination
        this.artworksService.paginate({
            pageIndex: 0,
            pageSize: this.artworksService.payload.limit
        });
        if(this.paginator) {
            this.paginator.firstPage();
        }
            

        this.onClearFiltersSubscription =
            this.artworksService.onClearFilters
                .subscribe(() => {
                    this.filterForm.reset();
                    this.clearFilters();
                });
        this.cd.markForCheck();
    }

    ngOnDestroy() {
        this.onArtworksChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
        this.onClearFiltersSubscription.unsubscribe();
    }

    deleteArtwork(artwork) {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.artworksService.deleteArtwork(artwork)
                    .subscribe(this.loaded, this.loaded);

            }
            this.confirmDialogRef = null;
            this.cd.markForCheck();
        });

    }

    onSelectedChange(id) {
        if (!this.multiselect) {
            this.selection.reset(false);
        }

        this.selection.toggle(id);
    }

    editArtwork(artwork) {
        if (this.embedded) {
            this.onSelectedChange(artwork.id);
            return;
        }

        this.router.navigate(['/artworks', artwork.id]);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    extractArtworkColor(color_arrary) {
        if(color_arrary){
            const colors = color_arrary.replace(/\s/g, '').split(',');
            return colors[0];  
        }
    }

    filterArtworks() {
        if (this.loading) {
            return;
        }

        this.artworksService.payload.term = this.filterForm.value;

        this.artworksService.paginate({
            pageIndex: 0,
            pageSize: this.artworksService.payload.limit
        });
        if(this.paginator) {
            this.paginator.firstPage();
        }

        this.loading = true;
        forkJoin([
            this.artworksService.getArtworkCount('list'),
            this.artworksService.getArtworks('list')
        ]).subscribe(
            this.loaded,
            this.loaded
        );
        this.cd.markForCheck();
    }

    paginate(ev) {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.artworksService.paginate(ev)
            .subscribe(
                this.loaded,
                this.loaded
            );
        this.cd.markForCheck();
    }

    sort(se) {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.artworksService.sort(se)
            .subscribe(
                this.loaded,
                this.loaded
            );
        this.cd.markForCheck();
    }

    getSelectedDesignIds() {
        return this.artworksService.onArtworksChanged.value
            .filter(v => v.design.id && this.checkboxes[v.id])
            .map(v => v.design.id);
    }

    clearFilters() {
        this.loading = true;
        this.artworksService.resetList()
            .subscribe(() => {
                this.loading = false;
                this.cd.markForCheck();
            });
        this.cd.markForCheck();
    }

  openRelatedOrderDetailDialog(orderId, designId) {
    // this.orderDetailDlgRef = this.dialog.open(OrderDetailDialogComponent, {
    //   panelClass: 'antera-details-dialog',
    //   data: {
    //     orderId: orderId,
    //     designId: designId,
    //     showBasicOrderDetails: true,
    //     showBillingShippingDetails: true,
    //     showProducts: true,
    //   }
    // });
    this.router.navigate([`/e-commerce/orders/${orderId}`]);
  }
  
}

export class ArtworkDataSource extends DataSource<any>
{
    total = 0;
    totalSubscription: Subscription;

    constructor(
        private artworksService: ArtworksService,
    ) {
        super();
    }

    connect(): Observable<Artwork[]> {
        this.totalSubscription =
            this.artworksService.onTotalCountChanged.pipe(
                delay(300)
            ).subscribe(c => {
                this.total = c;
            });

        return this.artworksService.onArtworksChanged;
    }

    disconnect() {
        this.totalSubscription.unsubscribe();
    }
}

import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseLocationFormComponent } from '../location-form/location-form.component';

import { LocationsService } from '../locations.service';
import { Location } from '../location.model';
import { delay } from 'rxjs/operators';



@Component({
    selector     : 'fuse-locations-list',
    templateUrl  : './locations-list.component.html',
    styleUrls    : ['./locations-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseLocationsListComponent implements OnInit, OnDestroy
{
    dataSource: LocationDataSource | null;
    displayedColumns = ['checkbox', 'companyName', 'deliveryContact', 'type', 'shipCity', 'shipState', 'phone', 'buttons'];
    checkboxes: {};
    selectedCount = 0;

    onStoresChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;
    onClearFiltersSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseLocationFormComponent>;

    filterForm: FormGroup;

    constructor(
        private locationsService: LocationsService,
        private fb: FormBuilder,
        public dialog: MatDialog
    )
    {
        this.onStoresChangedSubscription =
            this.locationsService.onStoresChanged.subscribe(locations => {
                this.checkboxes = {};
                locations.map(ws => {
                    this.checkboxes[ws.id] = false;
                });
            });

        this.onSelectionChangedSubscription =
            this.locationsService.onSelectionChanged.subscribe(selection => {
                for ( const id in this.checkboxes )
                {
                    if (!this.checkboxes.hasOwnProperty(id)) {
                        continue;
                    }

                    this.checkboxes[id] = selection.includes(id);
                }

                this.selectedCount = selection.length;
            });

        this.onClearFiltersSubscription =
            this.locationsService.onClearFilters.subscribe(() => {
                this.filterForm.reset();
            })

        this.filterForm = this.fb.group(this.locationsService.params.term);
    }

    ngOnInit()
    {
        this.dataSource = new LocationDataSource(
            this.locationsService
        );
    }

    ngOnDestroy()
    {
        this.onStoresChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
        this.onClearFiltersSubscription.unsubscribe();
    }

    deleteLocation(ws)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this location?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.locationsService.deleteLocation(ws);
            }

            this.confirmDialogRef = null;
        });
    }

    onSelectedChange(wsId)
    {
        this.locationsService.toggleSelected(wsId);
    }

    editLocation(location)
    {
        this.dialogRef = this.dialog.open(FuseLocationFormComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'edit',
                location
            }
        });

        this.dialogRef.afterClosed()
            .subscribe(response => {
                if ( !response )
                {
                    return;
                }

                const actionType: string = response[0];

                switch ( actionType )
                {
                    case 'save':
                        this.locationsService.updateLocation(response[1]);
                        break;

                    case 'delete':
                        this.deleteLocation(location);
                        break;
                }
            });
    }

    toggleAll(ev) {
        if (ev) {
            this.locationsService.toggleSelectAll();
        }
    }

    toggleEnable(ws, ev) {
        ev.stopPropagation();

        this.locationsService.updateLocation({
            ...ws,
            enabled: !ws.enabled
        });
    }

    filterLocations() {
        this.locationsService.params.term = this.filterForm.value;
        this.locationsService.filterLocations();
    }

    sortChange(sort) {
        this.locationsService.sort(sort);
    }

    paginate(pe) {
        this.locationsService.paginate(pe);
    }
}

export class LocationDataSource extends DataSource<any>
{
    total = 0;
    onTotalCountChanged: Subscription;

    constructor(private locationsService: LocationsService) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Location[]>
    {
        this.onTotalCountChanged =
            this.locationsService.onTotalCountChanged.pipe(
                delay(100),
            ).subscribe((count: number) => {
                this.total = count;
            });

        return this.locationsService.onStoresChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
    }
}

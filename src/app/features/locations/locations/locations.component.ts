import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { LocationsService } from '../locations.service';
import { FuseLocationFormComponent } from '../location-form/location-form.component';



import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector     : 'fuse-locations',
    templateUrl  : './locations.component.html',
    styleUrls    : ['./locations.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseLocationsComponent implements OnInit, OnDestroy
{
    selectedCount: number;
    searchInput: FormControl;
    onSelectionSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseLocationFormComponent>;

    constructor(
        private locationsService: LocationsService,
        public dialog: MatDialog
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
        this.onSelectionSubscription =
            this.locationsService.onSelectionChanged
                .subscribe(selection => {
                    this.selectedCount = selection.length;
                });

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
            this.locationsService.onSearchTextChanged.next(searchText);
        });
    }

    ngOnDestroy()
    {
        this.onSelectionSubscription.unsubscribe();
    }

    newLocation()
    {
        this.dialogRef = this.dialog.open(FuseLocationFormComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'new'
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: FormGroup) => {
                if ( !response ) {
                    return;
                }

                this.locationsService.updateLocation(response[1]);
            });
    }

    deleteSelectedLocations()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected locations?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.locationsService.deleteSelectedLocations();
            }
            this.confirmDialogRef = null;
        });
    }

    clearSearch(){
      if (this.searchInput.value.length > 0)
        this.searchInput.setValue('');
    }

    clearFilters() {
        this.locationsService.resetFilters();
    }

    emailSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    massUpdateSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    mergeSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    addToTargetListSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    generateLetterSelected(){
        this.dialog.open(ComingSoonComponent);
    }
}

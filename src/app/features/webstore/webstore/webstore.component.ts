import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { WebstoreService } from '../webstore.service';
import { FuseWebstoreFormComponent } from '../webstore-form/webstore-form.component';



import { FuseWebstoreListComponent } from '../webstore-list/webstore-list.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector     : 'fuse-webstore',
    templateUrl  : './webstore.component.html',
    styleUrls    : ['./webstore.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseWebstoreComponent implements OnInit, OnDestroy
{
    @ViewChild(FuseWebstoreListComponent, {static: false}) webstoreTableComponent: FuseWebstoreListComponent;

    selectedCount: number;
    searchInput: FormControl;
    onSelectionSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseWebstoreFormComponent>;

    constructor(
        private webstoreService: WebstoreService,
        public dialog: MatDialog
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
        this.onSelectionSubscription =
            this.webstoreService.onSelectionChanged
                .subscribe(selection => {
                    this.selectedCount = selection.length;
                });

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
            this.webstoreService.onSearchTextChanged.next(searchText);
        });
    }

    ngOnDestroy()
    {
        this.onSelectionSubscription.unsubscribe();
    }

    newWebstore()
    {
        this.dialogRef = this.dialog.open(FuseWebstoreFormComponent, {
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

                this.webstoreService.updateWebstore(response[1]);
            });
    }

    deleteSelectedWebstores()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected webstores?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.webstoreService.deleteSelectedWebstores();
            }
            this.confirmDialogRef = null;
        });
    }

    clearSearch()
    {
      if (this.searchInput.value.length > 0)
        this.searchInput.setValue('');
    }

    clearFilters()
    {
        this.webstoreTableComponent.clearFilters();
    }
}

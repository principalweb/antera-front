import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';


import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { ReceivingsService } from './receivings.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector     : 'fuse-receivings',
    templateUrl  : './receivings.component.html',
    styleUrls    : ['./receivings.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseReceivingsComponent implements OnInit, OnDestroy
{
    hasSelectedReceivings: boolean;
    selectedCount = 0;
    searchInput: FormControl;
    dialogRef: any;
    onSelectedReceivingsChangedSubscription: Subscription;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    received = 0;

    constructor(
        private receivingsService: ReceivingsService,
        public dialog: MatDialog
    )
    {
        this.searchInput = new FormControl('');
        this.received = this.receivingsService.payload.received;
    }

    ngOnInit()
    {
        this.onSelectedReceivingsChangedSubscription =
            this.receivingsService.onSelectedReceivingsChanged
                .subscribe(selectedReceivings => {
                    this.selectedCount = selectedReceivings.length;
                });

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
            this.receivingsService.onSearchTextChanged.next(searchText);
        });
    }

    ngOnDestroy()
    {
        this.onSelectedReceivingsChangedSubscription.unsubscribe();
    }

    clearSearch()
    {
      if (this.searchInput.value.length > 0)
        this.searchInput.setValue('');
    }

    switchReceived()
    {
      this.receivingsService.payload.received = this.receivingsService.payload.received == 0 ? 1 : 0;
      this.received = this.receivingsService.payload.received;
      Promise.all([
        this.receivingsService.getReceivings(),
        this.receivingsService.getReceivingsCount()
      ]).then(() => {});
    }
}

import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { CasesService } from '../cases.service';
import { FuseCaseFormComponent } from '../case-form/case-form.component';



import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
    selector     : 'fuse-cases',
    templateUrl  : './cases.component.html',
    styleUrls    : ['./cases.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseCasesComponent implements OnInit, OnDestroy
{
    selectedCount: number;
    searchInput: FormControl;
    onSelectionSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseCaseFormComponent>;

    constructor(
        private casesService: CasesService,
        public dialog: MatDialog
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
        this.onSelectionSubscription =
            this.casesService.onSelectionChanged
                .subscribe(selection => {
                    this.selectedCount = selection.length;
                });

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
            this.casesService.onSearchTextChanged.next(searchText);
        });
    }

    ngOnDestroy()
    {
        this.onSelectionSubscription.unsubscribe();
    }

    newCase()
    {
        this.dialogRef = this.dialog.open(FuseCaseFormComponent, {
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

                this.casesService.updateCase(response[1]);
            });
    }

    deleteSelectedCases()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected cases?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.casesService.deleteSelectedCases();
            }
            this.confirmDialogRef = null;
        });
    }

    clearSearch(){
      if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');
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

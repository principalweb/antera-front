import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';
import { OpportunitiesService } from 'app/core/services/opportunities.service';

@Component({
    selector   : 'fuse-selected-bar',
    templateUrl: './selected-bar.component.html',
    styleUrls  : ['./selected-bar.component.scss']
})
export class OpportunitiesSelectedBarComponent
{
    selectedOpportunities: string[];
    hasSelectedOpportunities: boolean;
    isIndeterminate: boolean;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(
        private opportunitiesService: OpportunitiesService,
        public dialog: MatDialog
    ) {
        
    }

    selectAll() {
    }

    deselectAll() {
    }

    deleteSelectedOpportunities() {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected contacts?';

        this.confirmDialogRef.afterClosed()
            .subscribe(result => {
                if ( result ) {
                    // Delete selected opportunities
                }
                this.confirmDialogRef = null;
            });
    }

    emailSelected() {
        this.dialog.open(ComingSoonComponent);
    }

    massUpdateSelected() {
        this.dialog.open(ComingSoonComponent);
    }

    mergeSelected() {
        this.dialog.open(ComingSoonComponent);
    }

    addToTargetListSelected()
    {
        this.dialog.open(ComingSoonComponent);
    }

    generateLetterSelected()
    {
        this.dialog.open(ComingSoonComponent);
    }
}

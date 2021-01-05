import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { SelectionService } from 'app/core/services/selection.service';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
import { SourceListComponent } from './source-list/source-list.component';
import { SourceFormComponent } from './source-form/source-form.component';
import { SourceDetails } from 'app/models/source';
import { SourcesService } from 'app/core/services/sources.service';

@Component({
    selector     : 'sources-sources',
    templateUrl  : './sources.component.html',
    styleUrls    : ['./sources.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class SourcesComponent implements OnInit, OnDestroy
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

    @ViewChild(SourceListComponent) sourceList: SourceListComponent;

    constructor(
        private sourcesService: SourcesService,
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
            this.sourcesService.onViewChanged
                .subscribe(view => this.view = view);

    }

    ngOnDestroy()
    {
        this.onViewChangedSubscription.unsubscribe();
    }

    newSource()
    {
        this.dialogRef = this.dialog.open(SourceFormComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action : 'new',
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((sourceDetails: SourceDetails) => {
                if (!sourceDetails) return;
                this.loading = true;
                this.api.createSource(sourceDetails.toObject())
                    .subscribe((res: any) => {
                        this.loading = false;
                        this.router.navigate(['/e-commerce/sources', res.extra.id]);
                    }, this.loaded);
            });
    }

    deleteSources(ids) {
        if (this.confirmDialogRef) {
            return;
        }

        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this source?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.sourcesService.deleteSources(ids)
                    .subscribe(() => {})
            }
            this.confirmDialogRef = null;
        });
    }

    deleteSelectedSources() {
        this.deleteSources(this.selection.selectedIds);
    }

    clearSearch(){
      if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');
    }

    changeView(ev) {
        this.sourcesService.onViewChanged.next(ev.value);
    }

    clearFilters() {
        this.searchInput.setValue('');
        this.sourcesService.resetParams();
        this.sourceList.loading = true;
        this.sourcesService.getSourcesWithCount()
            .subscribe((res) => {
                this.sourceList.loading = false;
            }, (err) => {
                this.sourceList.loading = false;
            });
    }
}

import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Subscription, Observable, merge} from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseCaseFormComponent } from '../case-form/case-form.component';

import { CasesService } from '../cases.service';
import { Case } from '../../../models';
import { map } from 'rxjs/operators';



@Component({
    selector     : 'fuse-cases-list',
    templateUrl  : './cases-list.component.html',
    styleUrls    : ['./cases-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseCasesListComponent implements OnInit, OnDestroy
{
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    dataSource: CaseDataSource | null;
    displayedColumns = ['checkbox', 'number', 'subject', 'accountName', 'priority', 'status', 'salesRep', 'dateCreated', 'buttons'];
    checkboxes: {};
    selectedCount = 0;

    onCasesChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseCaseFormComponent>;

    number = new FormControl('');
    subject = new FormControl('');
    accountName = new FormControl('');
    priority = new FormControl('');
    status = new FormControl('');
    salesRep = new FormControl('');
    dateCreated = new FormControl('');

    constructor(
        private casesService: CasesService,
        private router: Router,
        public dialog: MatDialog
    )
    {
        this.onCasesChangedSubscription =
            this.casesService.onCasesChanged.subscribe(cases => {
                this.checkboxes = {};
                cases.map(ws => {
                    this.checkboxes[ws.id] = false;
                });
            });

        this.onSelectionChangedSubscription =
            this.casesService.onSelectionChanged.subscribe(selection => {
                for ( const id in this.checkboxes )
                {
                    if (!this.checkboxes.hasOwnProperty(id)) {
                        continue;
                    }

                    this.checkboxes[id] = selection.includes(id);
                }

                this.selectedCount = selection.length;
            });

    }

    ngOnInit()
    {
        this.dataSource = new CaseDataSource(
            this.casesService,
            this.paginator,
            this.sort
        );
    }

    ngOnDestroy()
    {
        this.onCasesChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
    }

    deleteCase(ws)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this case?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.casesService.deleteCase(ws);
            }

            this.confirmDialogRef = null;
        });

    }

    onSelectedChange(wsId)
    {
        this.casesService.toggleSelected(wsId);
    }

    editCase(c)
    {
        this.dialogRef = this.dialog.open(FuseCaseFormComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'edit',
                case: c
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
                        this.casesService.updateCase(response[1]);
                        break;

                    case 'delete':
                        this.deleteCase(c);
                        break;
                }
            });
    }

    toggleAll(ev) {
        if (ev) {
            this.casesService.toggleSelectAll();
        }
    }

    toggleEnable(ws, ev) {
        ev.stopPropagation();

        this.casesService.updateCase({
            ...ws,
            enabled: !ws.enabled
        });
    }
}

export class CaseDataSource extends DataSource<any>
{
    total = 0;

    private subscription: Subscription;

    constructor(
        private casesService: CasesService,
        private _paginator: MatPaginator,
        private _sort: MatSort
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Case[]>
    {
        this.subscription = this.casesService.onCasesChanged
            .subscribe(cases => {
                setTimeout(() => {
                    this.total = cases.length;
                });
            });

        const displayDataChanges = [
            this.casesService.onCasesChanged,
            this._paginator.page,
            this._sort.sortChange
        ];

        return merge(...displayDataChanges).pipe(
            map(() => {
                let cases = this.casesService.cases;

                cases = this.sortData(cases);

                const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
                cases = cases.slice(startIndex, startIndex + this._paginator.pageSize);

                return cases;
            })
        );
    }

    sortData(data): Case[] {
        if ( !this._sort.active || this._sort.direction === '' )
        {
            return data;
        }

        return data.sort((a, b) => {
            let valueA = a[this._sort.active];
            let valueB = b[this._sort.active];

            return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
        });
    }

    disconnect()
    {
        this.subscription.unsubscribe();
    }
}

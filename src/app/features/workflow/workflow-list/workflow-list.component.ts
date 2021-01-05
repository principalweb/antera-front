import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable, merge } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseWorkflowFormComponent } from '../workflow-form/workflow-form.component';

import { WorkflowService } from '../workflow.service';
import { Workflow } from '../workflow.model';
import { map } from 'rxjs/operators';



@Component({
    selector     : 'fuse-workflow-list',
    templateUrl  : './workflow-list.component.html',
    styleUrls    : ['./workflow-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseWorkflowListComponent implements OnInit, OnDestroy
{
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    dataSource: WorkflowDataSource | null;
    displayedColumns = ['checkbox', 'orderNumber', 'identity', 'account', 'vendor', 'amount', 'salesRep', 'csr', 'qbSync', 'buttons'];
    checkboxes: {};
    selectedCount = 0;

    onFlowsChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseWorkflowFormComponent>;

    orderNumber = new FormControl('');
    identity = new FormControl('');
    account = new FormControl('');
    vendor = new FormControl('');
    amount = new FormControl('');
    inHands = new FormControl('');
    salesRep = new FormControl('');
    csr = new FormControl('');
    scheduled = new FormControl('');

    constructor(
        private wkService: WorkflowService,
        private router: Router,
        public dialog: MatDialog
    )
    {
        this.onFlowsChangedSubscription =
            this.wkService.onWorkFlowsChanged.subscribe(workflows => {
                this.checkboxes = {};
                workflows.map(wk => {
                    this.checkboxes[wk.id] = false;
                });
            });

        this.onSelectionChangedSubscription =
            this.wkService.onSelectionChanged.subscribe(selection => {
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
        this.dataSource = new WorkflowDataSource(
            this.wkService,
            this.paginator,
            this.sort
        );
    }

    ngOnDestroy()
    {
        this.onFlowsChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
    }

    deleteWorkflow(wk)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.wkService.deleteWorkflow(wk);
            }

            this.confirmDialogRef = null;
        });

    }

    onSelectedChange(wkId)
    {
        this.wkService.toggleSelected(wkId);
    }

    editWorkflow(workflow)
    {
        this.dialogRef = this.dialog.open(FuseWorkflowFormComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'edit',
                workflow
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
                        this.wkService.updateWorkflow(response[1]);
                        break;

                    case 'delete':
                        this.deleteWorkflow(workflow);
                        break;
                }
            });
    }

    toggleAll(ev) {
        if (ev) {
            this.wkService.toggleSelectAll();
        }
    }

    toggleEnable(wk, ev) {
        ev.stopPropagation();

        this.wkService.updateWorkflow({
            ...wk,
            enabled: !wk.enabled
        });
    }
}

export class WorkflowDataSource extends DataSource<any>
{
    total = 0;

    private subscription: Subscription;

    constructor(
        private wkService: WorkflowService,
        private _paginator: MatPaginator,
        private _sort: MatSort
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Workflow[]>
    {
        this.subscription = this.wkService.onWorkFlowsChanged
            .subscribe(workflows => {
                setTimeout(() => {
                    this.total = workflows.length;
                });
            });

        const displayDataChanges = [
            this.wkService.onWorkFlowsChanged,
            this._paginator.page,
            this._sort.sortChange
        ];

        return merge(...displayDataChanges).pipe(
            map(() => {
                let workflows = this.wkService.workflows;

                workflows = this.sortData(workflows);

                const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
                workflows = workflows.slice(startIndex, startIndex + this._paginator.pageSize);

                return workflows;
            })
        );
    }

    sortData(data): Workflow[] {
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

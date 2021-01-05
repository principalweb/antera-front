import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable ,  BehaviorSubject, merge } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseWebstoreFormComponent } from '../webstore-form/webstore-form.component';

import { WebstoreService } from '../webstore.service';
import { Webstore } from '../webstore.model';
import { FuseUtils } from '@fuse/utils';
import { map } from 'rxjs/operators';

@Component({
    selector     : 'fuse-webstore-list',
    templateUrl  : './webstore-list.component.html',
    styleUrls    : ['./webstore-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseWebstoreListComponent implements OnInit, OnDestroy
{
    @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort: MatSort;

    dataSource: WebstoreDataSource | null;
    displayedColumns = ['checkbox', 'clientName', 'hostName', 'points', 'enabled', 'buttons'];
    checkboxes: {};
    selectedCount = 0;

    onStoresChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseWebstoreFormComponent>;

    clientName = new FormControl('');
    hostName = new FormControl('');
    points = new FormControl('');

    constructor(
        private wsService: WebstoreService,
        private router: Router,
        public dialog: MatDialog
    )
    {
        this.onStoresChangedSubscription =
            this.wsService.onStoresChanged.subscribe(webstores => {
                this.checkboxes = {};
                webstores.map(ws => {
                    this.checkboxes[ws.id] = false;
                });
            });

        this.onSelectionChangedSubscription =
            this.wsService.onSelectionChanged.subscribe(selection => {
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
        this.dataSource = new WebstoreDataSource(
            this.wsService,
            this.paginator,
            this.sort
        );
    }

    ngOnDestroy()
    {
        this.onStoresChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
    }

    deleteWebstore(ws)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.wsService.deleteWebstore(ws);
            }

            this.confirmDialogRef = null;
        });

    }

    onSelectedChange(wsId)
    {
        this.wsService.toggleSelected(wsId);
    }

    editWebstore(webstore)
    {
        this.dialogRef = this.dialog.open(FuseWebstoreFormComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'edit',
                webstore
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
                        this.wsService.updateWebstore(response[1]);
                        break;

                    case 'delete':
                        this.deleteWebstore(webstore);
                        break;
                }
            });
    }

    toggleAll(ev) {
        if (ev) {
            this.wsService.toggleSelectAll();
        }
    }

    toggleEnable(ws, ev) {
        ev.stopPropagation();

        this.wsService.updateWebstore({
            ...ws,
            enabled: !ws.enabled
        });
    }


    filterWebstores(){

    }

    filterByCategory(ev, name){
        ev.stopPropagation();
        console.log(name);
        if ( !this.dataSource )
            return;
        this.dataSource.filter = name;
    }

    clearFilters(){
        this.dataSource = new WebstoreDataSource(this.wsService, this.paginator, this.sort);
        this.dataSource.filter = '';
    }
}

export class WebstoreDataSource extends DataSource<any>
{
    total = 0;

    _filterChange = new BehaviorSubject('');
    _filteredDataChange = new BehaviorSubject('');

    get filteredData(): any
    {
        return this._filteredDataChange.value;
    }

    set filteredData(value: any)
    {
        this._filteredDataChange.next(value);
    }

    get filter(): string
    {
        return this._filterChange.value;
    }

    set filter(filter: string)
    {
        this._filterChange.next(filter);
    }

    private subscription: Subscription;

    constructor(
        private wsService: WebstoreService,
        private _paginator: MatPaginator,
        private _sort: MatSort
    ) {
        super();
        this.filteredData = this.wsService.webstores;
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Webstore[]>
    {
        this.subscription = this.wsService.onStoresChanged
            .subscribe(webstores => {
                setTimeout(() => {
                    this.total = webstores.length;
                });
            });

        const displayDataChanges = [
            this.wsService.onStoresChanged,
            this._paginator.page,
            this._sort.sortChange,
            this._filterChange
        ];

        return merge(...displayDataChanges).pipe(
            map(() => {
                let webstores = this.wsService.webstores;

                webstores = this.filterData(webstores);

                this.filteredData = [...webstores];

                webstores = this.sortData(webstores);

                const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
                webstores = webstores.slice(startIndex, startIndex + this._paginator.pageSize);

                return webstores;
            })
        );
    }

    filterData(data)
    {
        if ( !this.filter )
        {
            return data;
        }
        return FuseUtils.filterArrayByString(data, this.filter);
    }

    sortData(data): Webstore[] {
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

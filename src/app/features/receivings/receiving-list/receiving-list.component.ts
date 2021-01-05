import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable ,  BehaviorSubject, merge } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ReceivingItemsDialogComponent } from '../receiving-items/receiving-items.component';

import { ReceivingsService } from '../receivings.service';



import { Receiving } from '../receiving.model';
import { delay, map } from 'rxjs/operators';

@Component({
    selector     : 'fuse-receivings-receiving-list',
    templateUrl  : './receiving-list.component.html',
    styleUrls    : ['./receiving-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseReceivingsReceivingListComponent implements OnInit, OnDestroy
{
    @ViewChild('dialogContent') dialogContent: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    filterForm: FormGroup;

    receivings: any;
    dataSource: ReceivingsDataSource | null;
    displayedColumns = ['identity', 'orderNumber', 'customerPo', 'vendorName', 'customerName', 'orderDate', 'buttons'];
    selectedReceivings: any[];
    checkboxes: {};
    pageSize = 10;

    onReceivingsChangedSubscription: Subscription;
    onSelectedReceivingsChangedSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<ReceivingItemsDialogComponent>;

    orderNumber = new FormControl('');
    customerPo = new FormControl('');
    vendorName = new FormControl('');
    customerName = new FormControl('');
    identity = new FormControl('');
    orderDate = new FormControl('');

    constructor(
        private receivingsService: ReceivingsService,
        private router: Router,
        private fb: FormBuilder,
        public dialog: MatDialog
    )
    {
        this.onReceivingsChangedSubscription =
            this.receivingsService.onReceivingsChanged.subscribe(receivings => {

                this.receivings = receivings;

                this.checkboxes = {};
                receivings.map(receiving => {
                    this.checkboxes[receiving.id] = false;
                });
            });

        this.onSelectedReceivingsChangedSubscription =
            this.receivingsService.onSelectedReceivingsChanged.subscribe(selectedReceivings => {
                for ( const id in this.checkboxes )
                {
                    if ( !this.checkboxes.hasOwnProperty(id) )
                    {
                        continue;
                    }

                    this.checkboxes[id] = selectedReceivings.includes(id);
                }
                this.selectedReceivings = selectedReceivings;
            });
        this.filterForm = this.fb.group(this.receivingsService.payload.term);

    }

    ngOnInit()
    {
        this.dataSource = new ReceivingsDataSource(
            this.receivingsService,
            this.paginator
        );
    }

    ngOnDestroy()
    {
        this.onReceivingsChangedSubscription.unsubscribe();
        this.onSelectedReceivingsChangedSubscription.unsubscribe();
    }

    showReceivingItems(receiving) {
        console.log(receiving);
        this.dialogRef = this.dialog.open(ReceivingItemsDialogComponent, {
            panelClass: 'receiving-items-dialog',
            data: {
                po: receiving,
                received: this.receivingsService.payload.received
            }
        });
    }

    filterRecevings()
    {
        this.receivingsService.payload.term = this.filterForm.value;
        Promise.all([
            this.receivingsService.getReceivings(),
            this.receivingsService.getReceivingsCount()
        ]).then(() => {});
    }

    paginate(ev) {
        this.receivingsService.payload.offset = ev.pageIndex;
        this.receivingsService.payload.limit = ev.pageSize;
        this.pageSize = ev.pageSize;
        Promise.all([
            this.receivingsService.getReceivings(),
            this.receivingsService.getReceivingsCount()
        ]).then(() => {});
    }

    sortChange(ev) {
        this.receivingsService.payload.order = ev.active;
        this.receivingsService.payload.orient = ev.direction;
        if(ev.direction == "") {
            this.receivingsService.payload.order = "orderNumber";
            this.receivingsService.payload.orient = "asc";
        }
        Promise.all([
            this.receivingsService.getReceivings(),
            this.receivingsService.getReceivingsCount()
        ]).then(() => {});
    }
}

export class ReceivingsDataSource extends DataSource<any>
{
    total = 0;

    onTotalCountChanged: Subscription;

    constructor(
        private receivingsService: ReceivingsService,
        private _paginator: MatPaginator,
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Receiving[]>
    {

        this.onTotalCountChanged =
            this.receivingsService.onTotalCountChanged.pipe(
                delay(100)
            ).subscribe(total => {
                this.total = total;
            });

        return this.receivingsService.onReceivingsChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
    }
}

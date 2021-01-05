import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable, merge } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';

import { Receiving, ReceivingItem, Site, Bin } from '../receiving.model';

import { MessageService } from 'app/core/services/message.service';
import { ReceivingsService } from '../receivings.service';
import { delay, map } from 'rxjs/operators';

@Component({
    selector     : 'receiving-items-dialog',
    templateUrl  : './receiving-items.component.html',
    styleUrls    : ['./receiving-items.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})

export class ReceivingItemsDialogComponent
{
    @ViewChild(MatSort) sort: MatSort;

    dialogTitle: string;
    loading = false;
    po: Receiving;
    receivingForm: FormGroup;
    displayedColumns = ['itemNo', 'sku', 'image', 'inhouseid', 'color', 'size', 'site', 'bin', 'poQuantity', 'receivedQuantity', 'qtyInput', 'buttons'];
    sites: Site[];
    defaultsite: Site;
    dataSource: ReceivingsDataItemSource | null;
    onSitesChanged: Subscription;
    receiveChanged: Subscription;
    receiveAllChanged: Subscription;
    received = 0;

    constructor(
        public dialogRef: MatDialogRef<ReceivingItemsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private receivingsService: ReceivingsService,
        private msg: MessageService,
        private formBuilder: FormBuilder
    )
    {
        this.po = this.data.po;
        this.received = this.data.received;
        if(this.received) {
          this.displayedColumns = ['itemNo', 'sku', 'color', 'size'/*, 'siteReceived', 'binReceived'*/, 'poQuantity', 'receivedQuantity', 'remainingQty', 'buttons'];
        }
        this.receivingForm = this.createReceivingForm();
        this.dataSource = new ReceivingsDataItemSource(this.receivingsService);
    }

    ngOnInit()
    {
        this.receivingsService.getFob({type:"Distributor"});
        this.receivingsService.getDefaultFob()
            .subscribe((res: any) => {
                this.defaultsite = res;
            });
        this.onSitesChanged =
            this.receivingsService.onSitesChanged
                .subscribe((res: any) => {
                    this.sites = res;
                });
        this.receivingsService.getPoProducts({...this.po, received: this.received});
        this.dataSource.sort = this.sort;
    }

    createReceivingForm()
    {
        return this.formBuilder.group({
            orderId: [this.po.id],
            vendorId: [this.po.vendorId],
            itemNo: '',
            productId: '',
            matrixId: '',
            lineId: '',
            sku : '',
            color : '',
            size : '',
            quantity : '',
            quantityReceive: '',
            site : '',
            bin : '',
        });
    }

    compareFob(obj1: Site, obj2: Site)
    {
        return obj1.fobId === obj2.fobId;
    }

    compareBin(obj1: Bin, obj2: Bin)
    {
        return obj1.binId === obj2.binId;
    }

    undoReceipt(items)
    {
        this.loading = true;
        this.receivingsService.received.message = "";
        if(this.receiveChanged) {
            this.receiveChanged.unsubscribe();
        }
        this.receiveChanged =
            this.receivingsService.receiveChanged
                .subscribe((res: any) => {
                    if(this.receivingsService.received.message != "") {
                        this.loading = false;
                        this.msg.show(this.receivingsService.received.message, 'success');
                        if(this.receivingsService.received.err != 1) {
                            this.receivingsService.getPoProducts({...this.po, received: this.received});
                        }
                    }
                });
        this.receivingsService.undoReceipt(this.po, items);
    }

    receive(items)
    {
        this.loading = true;
        this.receivingsService.received.message = "";
        if(this.receiveChanged) {
            this.receiveChanged.unsubscribe();
        }
        this.receiveChanged =
            this.receivingsService.receiveChanged
                .subscribe((res: any) => {
                    if(this.receivingsService.received.message != "") {
                        this.loading = false;
                        this.msg.show(this.receivingsService.received.message, 'success');
                        if(this.receivingsService.received.err != 1) {
                          this.receivingsService.getPoProducts({...this.po, received: this.received});
                        }
                    }
                });
        this.receivingsService.receive(this.po, items);
    }

    undoReceiptAll()
    {
        this.loading = true;
        this.receivingsService.received.message = "";
        if(this.receiveChanged) {
            this.receiveChanged.unsubscribe();
        }
        this.receiveChanged =
            this.receivingsService.receiveChanged
                .subscribe((res: any) => {
                    if(this.receivingsService.received.message != "") {
                        this.loading = false;
                        this.msg.show(this.receivingsService.received.message, 'success');
                        if(this.receivingsService.received.err != 1) {
                          this.receivingsService.getPoProducts({...this.po, received: this.received});
                        }
                    }
                });
        this.receivingsService.undoReceipt(this.po, this.receivingsService.receivingItems);
    }

    receiveAll()
    {
        this.loading = true;
        this.receivingsService.received.message = "";
        if(this.receiveChanged) {
            this.receiveChanged.unsubscribe();
        }
        this.receiveChanged =
            this.receivingsService.receiveChanged
                .subscribe((res: any) => {
                    if(this.receivingsService.received.message != "") {
                        this.loading = false;
                        this.msg.show(this.receivingsService.received.message, 'success');
                        if(this.receivingsService.received.err != 1) {
                          this.receivingsService.getPoProducts({...this.po, received: this.received});
                        }
                    }
                });
        this.receivingsService.receive(this.po, this.receivingsService.receivingItems);
    }

    ngOnDestroy()
    {
        if(this.receiveChanged) {
            this.receiveChanged.unsubscribe();
        }
        if(this.onSitesChanged) {
            this.onSitesChanged.unsubscribe();
        }
        this.receivingsService.getReceivingsCount();
        this.receivingsService.getReceivings();
    }
}

export class ReceivingsDataItemSource extends DataSource<any>
{
    total = 0;

    onTotalCountChanged: Subscription;

    sort: MatSort | null;

    constructor(
        private receivingsService: ReceivingsService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<ReceivingItem[]>
    {
        const displayDataChanges = [
            this.receivingsService.onReceivingsItemsChanged
        ];

        this.onTotalCountChanged =
            this.receivingsService.onTotalCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.total = total;
            });

        return merge(...displayDataChanges).pipe(
            map(() => {
                let receivings = this.receivingsService.receivingItems;
                return receivings;
            })
        );
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
    }
}

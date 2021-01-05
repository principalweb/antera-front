import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, Inject, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable, merge } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { MessageService } from 'app/core/services/message.service';

import { InventoryService } from 'app/core/services/inventory.service';
import { Site, Bin } from 'app/models';


@Component({
  selector: 'app-inventory-transfer',
  templateUrl: './inventory-transfer.component.html',
  styleUrls: ['./inventory-transfer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class InventoryTransferComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) sort: MatSort;
    loading = false;
    items: any[];
    transferForm: FormGroup;
    displayedColumns = ['group', 'itemNo', 'color', 'size', 'originSite', 'originBin', 'orignBinQuantity', 'poQuantity', 'site', 'bin', 'qtyInput'];
    sites: Site[] = [];
    defaultsite: any;
    dataSource: TransferDataItemSource | null;
    onSitesChanged: Subscription;
    transferChanged: Subscription;
    receiveAllChanged: Subscription;
    onFobChangedSubscription: Subscription;
    accountType:string = "distributor";

    po: any;

    constructor(
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public dialog: MatDialogRef<InventoryTransferComponent>,
        private inventoryService: InventoryService,
        private msg: MessageService,
        private formBuilder: FormBuilder
    ) {
        this.accountType = this.data.accountType;
        this.dataSource = new TransferDataItemSource(this.inventoryService);
    }

    ngOnInit() {
        this.accountType = this.data.accountType;
        if(this.accountType != "distributorSale") {
            this.displayedColumns = ['group', 'itemNo', 'color', 'size', 'originSite', 'originBin', 'orignBinQuantity', 'poQuantity', 'site', 'bin', 'qtyInput', 'buttons'];
            this.inventoryService.getAccountFob({type:this.accountType});
        } else {
            this.displayedColumns = ['group', 'itemNo', 'color', 'size', 'originSite', 'originBin', 'orignBinQuantity', 'poQuantity', 'site', 'bin', 'qtyInput'];
            this.inventoryService.getAccountFob({accountId:this.data.accountId});
        }
        this.onFobChangedSubscription = this.inventoryService.onFobChanged.subscribe((response) => {
            this.sites = response;
        });
        this.inventoryService.getTransferInventoryProducts(this.data.orderId, this.accountType);
        this.dataSource.sort = this.sort;
    }

    compareFob(obj1: Site, obj2: Site)
    {
        return obj1.fobId === obj2.fobId;
    }

    compareBin(obj1: Bin, obj2: Bin)
    {
        return obj1.binId === obj2.binId;
    }
    
    transfer(item)
    {
        this.transferAll([item]);
    }
    
    transferAll(item:any = false)
    {
        this.loading = true;
        this.inventoryService.transferred.message = "";
        if(this.transferChanged) {
            this.transferChanged.unsubscribe();
        }
        this.transferChanged = 
            this.inventoryService.transferChanged
                .subscribe((res: any) => {
                    if(this.inventoryService.transferred.message != "") {
                        this.loading = false;
                        this.msg.show(this.inventoryService.transferred.message, 'success');
                        if(this.inventoryService.transferred.err != 1) {
                            if(this.accountType == 'distributorSale') {
                                this.dialog.close('Billed');
                            } else {
                                this.inventoryService.getTransferInventoryProducts(this.data.orderId, this.accountType);
                            }
                        }
                    }
                });
        if(!item) {
            this.inventoryService.transfer(this.inventoryService.transferItems);
        } else {
            this.inventoryService.transfer(item);
        }
    }

    ngOnDestroy() {
        this.onFobChangedSubscription.unsubscribe();
        if(this.transferChanged) {
            this.transferChanged.unsubscribe();
        }
    }
}

export class TransferDataItemSource extends DataSource<any>
{
    total = 0;

    onTotalCountChanged: Subscription;

    sort: MatSort | null;

    constructor(
        private inventoryService: InventoryService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<any[]>
    {
        const displayDataChanges = [
            this.inventoryService.onInventoryTransferItemsChanged
        ];

        this.onTotalCountChanged =
            this.inventoryService.onInventoryTransferItemsChanged.pipe(
                delay(100),
            ).subscribe(response => {
                this.total = response.length;
            });

        return merge(...displayDataChanges).pipe(
            map(() => {
                let transferItems = this.inventoryService.transferItems;
                return transferItems;
            })
        );
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
    }
}

@Pipe({
    name: 'originBin',
    pure: false
})
export class OriginBinPipe implements PipeTransform {
    transform(bins: any[], filter: any): any {
        if (!bins || !filter) {
            return bins;
        }
        return bins.filter(bin => bin.binId != filter);
    }
}

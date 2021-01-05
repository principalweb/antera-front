import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { InventoryItemAdjustmentComponent } from '../inventory-item-adjustment/inventory-item-adjustment.component';
import { InventoryItemTransferComponent } from '../inventory-item-transfer/inventory-item-transfer.component';
import { InventoryItemReserveComponent } from '../inventory-item-reserve/inventory-item-reserve.component';
import { InventoryService } from 'app/core/services/inventory.service';

@Component({
    selector: 'inventory-item-details',
    templateUrl: './inventory-item-details.component.html',
    styleUrls: ['./inventory-item-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InventoryItemDetailsComponent implements OnInit, OnDestroy {

  @ViewChild(InventoryItemAdjustmentComponent) ac;
  @ViewChild(InventoryItemTransferComponent) tc;
  @ViewChild(InventoryItemReserveComponent) rc;

    item: any;
    t: number;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        public dialogRef: MatDialogRef<InventoryItemDetailsComponent>,
        private inventoryService: InventoryService,
    ) {
    }

    ngOnInit() {
      this.t = 0;
      this.item = this.data;
      this.inventoryService.emitProduct(this.data);
    }

    st(t) {
      this.t = t;
    }

    asa() {
      this.ac.adjustSaveAll();
    }
    tsa() {
      this.tc.transferAll();
    }
    rsa() {
      this.rc.cancelReservations();
    }

    ngOnDestroy() {
    }

}

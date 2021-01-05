import { MessageService } from 'app/core/services/message.service';
import { QbService } from 'app/core/services/qb.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';
import { Observable, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VouchingFormComponent } from 'app/features/vouchings/vouching-form/vouching-form.component';
@Component({
  selector: 'order-vouching-history',
  templateUrl: './order-vouching-history.component.html',
  styleUrls: ['./order-vouching-history.component.css'],
  animations   : fuseAnimations
})
export class OrderVouchingHistoryComponent implements OnInit, OnDestroy {

  @Input() orderId: string;
  @Input() totalCost: number;

  displayedColumns = ['vendorName', 'invoiceNumber', 'poAmount', 'paidAmount', 'invoiceCredit', 'invoiceTotal', 'vouchedDate', 'status'];
  data: any = [];
  count: any = 0;
  payload = {
    offset: 0,
    limit: 50,
    orient: "asc",
    term : {
      orders: []
    }
  };
  loading = false;

  onQbActiveChanged: Subscription;
  qbEnabled = '';

  dialogRef: MatDialogRef<VouchingFormComponent>;

  deletedItems = [];
  showDeletedLines = false;

  constructor(
    private api: ApiService,
    private qb: QbService,
    private msg: MessageService,
    public dialog: MatDialog,
  ) {
    this.onQbActiveChanged = this.qb.onQbActiveChanged
      .subscribe(response => {
        this.qbEnabled = this.qb.getActiveConnector();
        if (this.qbEnabled !== '') {
          // this.displayedColumns.push('qbsync');
        }
      });
  }

  ngOnInit() {
    this.payload.term.orders.push(this.orderId);
    this.getList().subscribe();
    this.getCount().subscribe();
    this.getDeletedLines();
  }

  undoDelete()
  {
    this.loading = true;
    this.api.post('/content/undo-vouched-deleted-lines', this.deletedItems)
      .subscribe(
        (response: any) => {
          this.loading = false;
          if (response.error === '1') {
            this.msg.show(response.msg, 'error');
          } else {
            this.msg.show(response.msg, 'success');
          }
          this.getDeletedLines();
        },
        error => {
          this.msg.show('An error occured during the update!', 'error');
          this.loading = false;
          this.getDeletedLines();
        }
      );
  }

  getDeletedLines()
  {
      this.api.post('/content/get-vouched-deleted-lines', this.payload)
        .subscribe(
          (response: any) => {
            this.deletedItems = response;
          },
          error => {
          }
        );
  }

  getCount(): Observable<any>
  {
      return this.api.post('/content/get-vouch-count', this.payload).pipe(
        map((res: any) => {
          this.count = res;
        })
      )
  }

  getList(): Observable<any>
  {
    this.loading = true;
    return this.api.get('/content/get-order-vouching-list?orderId=' + this.orderId).pipe(
      map((res: any) => {
        this.data = res.data;
        if (this.data.length == 0) {
          this.data.push({
            vendorName: "No vouching items found",
            invoiceNumber: "",
            paidAmount: "",
            status: ""
          })
        } else {
          let total = 0;

          var i;
          for (i = 0; i < this.data.length; i++) {
            if (!Boolean(this.data[i].deleted) && this.data[i].invoiceNumber !== 'N/A') {
              total += Number(this.data[i].total);
            }
          }

          this.data.push({
            vendorName: "SUM",
            invoiceNumber: "",
            total: total,
            status: ""
          })
        }
        this.loading = false
      }),
      catchError(err => {
        this.msg.show(err.error.msg, 'error');
        this.loading = false;
        return of([]);
      }),
    )
  }

  qbPush(id) {
    this.loading = true;
    this.qb.pushEntity('Vouching', id)
      .then((res: any) => {
        if (res.code && res.code === "200") {
          this.msg.show(res.msg, 'success');
        } else if (res.code) {
          this.msg.show(res.msg, 'error');
        } else {
          this.msg.show('Update completed', 'success');
        }
        this.loading = false;
        this.ngOnInit();
      }).catch((err) => {
        this.loading = false;
        this.ngOnInit();
        this.msg.show(err.message, 'error');
      });
  }

  ngOnDestroy() {
    this.onQbActiveChanged.unsubscribe();
  }

  editVouching(poData) {
    if (!poData.vendorId.length) {
      return;
    }
    poData.orders = [this.orderId];
    poData.vendor = poData.vendorName;
    this.dialogRef = this.dialog.open(VouchingFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
        poData: {...poData},
      },
      maxWidth: '95vw'
    });

    this.dialogRef.afterClosed()
      .subscribe((res) => {
        this.getList().subscribe();
        this.getCount().subscribe();
      });

  }
}

import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EcommerceOrderService } from '../../order.service';
import { ApiService } from 'app/core/services/api.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-lineitem-image-upload-dialog',
  templateUrl: './lineitem-image-upload-dialog.component.html',
  styleUrls: ['./lineitem-image-upload-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LineitemImageUploadDialogComponent implements OnInit {
  imageUrl = '';
  loading = false;
  emitValue: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LineitemImageUploadDialogComponent>,
    private orderService: EcommerceOrderService,
    private api: ApiService,
  ) {
    this.imageUrl = data.row.image;
    if (data.emitValue) {
      this.emitValue = true;
    }
  }

  ngOnInit() {
  }

  onFileUploadEventForAws(event) {
    if (event.target.files.length > 0) {
      this.loading = true;
      let file = event.target.files[0];
      const data = new FormData();
      data.append('File', file);
      this.api.uploadAnyFile(data)
        .subscribe((res: any) => {

          if (this.emitValue) {
            this.dialogRef.close(res);
            return;
          }

          this.imageUrl = res.url;
          this.loading = true;
          if (this.data.row.matrixRows.length === 0 || (
            this.data.row.matrixRows.length === 1 &&
            !this.data.row.matrixRows[0].matrixUpdateId
          )) {
            this.data.row.lineItem.quoteCustomImage = [this.imageUrl];
          } else {
            this.data.row.matrixRows.forEach(row => {
              row.imageUrl = this.imageUrl;
            });
          }

          const order = this.orderService.order;
          this.orderService.updateOrder(order).pipe(
            switchMap(() => this.orderService.getOrder(order.id))
          ).subscribe(() => {
            this.loading = false;
            this.dialogRef.close(false);
          }, (err) => {
            this.loading = false;
          });

        }, (err => {
          this.loading = false;
        }));
    }
  }

}

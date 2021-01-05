import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { ApiService } from 'app/core/services/api.service';
import { IntegrationService } from 'app/core/services/integration.service';
import { MessageService } from 'app/core/services/message.service';

import { PromoShipmapEditComponent } from '../promo-shipmap-edit/promo-shipmap-edit.component';

@Component({
  selector: 'promo-shipmap',
  templateUrl: './promo-shipmap.component.html',
  styleUrls: ['./promo-shipmap.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class PromoShipmapComponent implements OnInit {
  dataSource: any[];
  displayedColumns: string[] = ['carrier', 'service', 'label', 'buttons'];
  loading: boolean = false;

  constructor(
                private integrationService: IntegrationService,
                private api: ApiService,
                private msg: MessageService,
                public dialogRef: MatDialogRef<PromoShipmapEditComponent>,
                public dialog: MatDialog,
                @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.integrationService.getPsShipMethods({code: this.data.code})
      .subscribe((res: any[]) => {
          this.dataSource = res;
          this.loading = false;
      }, () => {
      });
  }

  editShipmethod(data = {}) {
      this.dialogRef = this.dialog.open(PromoShipmapEditComponent, {
          panelClass: 'ps-detail',
          data: {
                  shipData: data,
                  company: this.data
          }
      });
      this.dialogRef.afterClosed()
          .subscribe((response) => {
              this.loadData();
          });
  }

  remove(data) {
    this.integrationService.removeShipMethod(data.id)
      .subscribe((res: any) => {
        if (res.error) {
          this.msg.show(res.msg, 'error');
        } else {
          this.msg.show(res.msg, 'success');
          this.loadData();
        }
      }, () => {
      });
  }

}

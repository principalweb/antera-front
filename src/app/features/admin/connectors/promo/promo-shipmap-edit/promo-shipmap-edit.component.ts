import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { MessageService } from 'app/core/services/message.service';

import { ApiService } from 'app/core/services/api.service';
import { IntegrationService } from 'app/core/services/integration.service';

@Component({
  selector: 'promo-shipmap-edit',
  templateUrl: './promo-shipmap-edit.component.html',
  styleUrls: ['./promo-shipmap-edit.component.css']
})
export class PromoShipmapEditComponent implements OnInit {
  credsForm: FormGroup;

  constructor(
                private integrationService: IntegrationService,
                private api: ApiService,
                public dialogRef: MatDialogRef<PromoShipmapEditComponent>,
                private msg: MessageService,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.credsForm = this.fb.group({
      carrier: new FormControl(this.data.shipData.carrier ? this.data.shipData.carrier : ''),
      service: new FormControl(this.data.shipData.service ? this.data.shipData.service : ''),
      label: new FormControl(this.data.shipData.label ? this.data.shipData.label : ''),
      id: new FormControl(this.data.shipData.id ? this.data.shipData.id : ''),
    });
  }

  save() {
    const data = {...this.credsForm.value};
    data.code = this.data.company.code;
    this.integrationService.updateShipMethod(data)
      .subscribe((res: any) => {
        if (res.error) {
          this.msg.show(res.msg, 'error');
        } else {
          this.msg.show(res.msg, 'success');
          this.dialogRef.close();
        }
      }, () => {
      });
  }

}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { QbService } from 'app/core/services/qb.service';
import { MessageService } from 'app/core/services/message.service';

import { XeroCustomerCreds } from 'app/models';


@Component({
  selector: 'xero',
  templateUrl: './xero.component.html',
  styleUrls: ['./xero.component.scss']
})
export class XeroComponent implements OnInit {
  loading = false;
  credsForm: FormGroup;
  creds: XeroCustomerCreds = {
                              Enabled: false,
                            };

  constructor(
                private qbService: QbService,
                private msg: MessageService,
                private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    this.credsForm = this.fb.group(this.creds);
    this.loadConfig();
  }

  loadConfig() {
      this.loading = true;
      this.qbService.getXeroConfig(this.creds)
        .subscribe((response: any) => {
            this.creds.Enabled = response.Enabled == 1? true: false;
            this.credsForm = this.fb.group(this.creds);
            this.loading = false;
        });
  }

  saveConfig() {
      this.loading = true;
      const creds = this.credsForm.value;
      creds.Enabled = creds.Enabled ? 1 : 0;
      creds.Live = creds.Live ? 1 : 0;
      this.qbService.setXeroConfig(creds)
        .subscribe((response: any) => {
            this.msg.show(response.msg, 'error');
            this.loading = false;
            this.qbService.getQbEnabled();
            this.loadConfig();
        });
  }

}

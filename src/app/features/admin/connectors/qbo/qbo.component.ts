import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { QbService } from 'app/core/services/qb.service';
import { MessageService } from 'app/core/services/message.service';

import { QboCustomerCreds } from 'app/models';

@Component({
  selector: 'app-qbo',
  templateUrl: './qbo.component.html',
  styleUrls: ['./qbo.component.scss']
})
export class QboComponent implements OnInit {
  loading: boolean = false;
  credsForm: FormGroup;
  creds: QboCustomerCreds = {
                              Enabled: false,
                              Live: false,
                              EnableGl: false,
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
      this.qbService.getQboConfig(this.creds)
        .subscribe((response:any) => {
            this.creds.Enabled = response.Enabled == 1? true: false;
            this.creds.Live = response.Live == 1? true: false;
            this.creds.EnableGl = response.EnableGl == 1? true: false;
            this.credsForm = this.fb.group(this.creds);
            this.loading = false;
        });
  }

  saveConfig() {
      this.loading = true;
      let creds = this.credsForm.value;
      creds.Enabled = creds.Enabled ? 1 : 0;
      creds.Live = creds.Live ? 1 : 0;
      creds.EnableGl = creds.EnableGl ? 1 : 0;
      this.qbService.setQboConfig(creds)
        .subscribe((response:any) => {
            this.msg.show(response.msg, 'error');
            this.loading = false;
            this.qbService.getQbEnabled();
            this.loadConfig();
        });
  }
}

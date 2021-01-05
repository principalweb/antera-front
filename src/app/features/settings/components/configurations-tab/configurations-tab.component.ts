import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { IntegrationService } from 'app/core/services/integration.service';
import { MessageService } from 'app/core/services/message.service';
import { AsiCreds } from 'app/models';

@Component({
  selector: 'app-configurations-tab',
  templateUrl: './configurations-tab.component.html',
  styleUrls: ['./configurations-tab.component.scss']
})
export class ConfigurationsTabComponent implements OnInit {

  loading: boolean = false;
  enable = true;
  credsForm:FormGroup;
  creds:AsiCreds = {
                    id:"",
                    asi_id:"",
                    clientKey:"",
                    clientSecret:"",
                    enabled:false,
                    isLive:false,
                    username:"",
                    userpass:"",
                  };

  constructor(
              private fb: FormBuilder,
              private msg: MessageService, 
              private integrationService: IntegrationService
  ) { }

  ngOnInit() {
      this.credsForm = this.fb.group(this.creds);
      this.loadCreds();
  }
  loadCreds() {
      this.loading = true;
      this.integrationService.getAsiCreds()
        .subscribe((response:any) => {
            this.creds.id = response.id?response.id:"";
            this.creds.asi_id = response.asi_id?response.asi_id:"";
            this.creds.clientKey = response.clientKey?response.clientKey:"";
            this.creds.clientSecret = response.clientSecret?response.clientSecret:"";
            this.creds.enabled = response.enabled == "1"?true:false;
            this.creds.isLive = response.isLive == "1"?true:false;
            this.creds.username = response.username?response.username:"";
            this.creds.userpass = response.userpass?response.userpass:"";
            this.credsForm = this.fb.group(this.creds);
            this.loading = false;
        });
  }

  saveConfig() {
      this.loading = true;
      let creds = this.credsForm.value;
      creds.enabled = creds.enabled?1:0;
      creds.isLive = creds.isLive?1:0;
      this.integrationService.setAsiCreds(creds)
        .subscribe(
        (response:any) => {
            this.msg.show(response.msg, 'error');
            this.loading = false;
            this.loadCreds();
        },
        (err:any) =>  {
            this.msg.show(err.message, 'error');
            this.loading = false;
        });

  }

}

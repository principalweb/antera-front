import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { IntegrationService } from 'app/core/services/integration.service';
import { MessageService } from 'app/core/services/message.service';
import { TaxjarCreds } from 'app/models';

@Component({
  selector: 'app-taxjar',
  templateUrl: './taxjar.component.html',
  styleUrls: ['./taxjar.component.scss']
})
export class TaxjarComponent implements OnInit {

  loading: boolean = false;
  credsForm:FormGroup;
  creds: TaxjarCreds = {
                                    enabled:false,
                                    createTransaction:false,
                                    autoTaxCalc:false,
                                    apiKey:"",
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
      this.integrationService.connectorGetConfig("TAXJAR", {0:"enabled",1:"createTransaction",2:"autoTaxCalc",3:"apiKey"})
        .subscribe((response:any) => {
            this.creds.enabled = response.enabled == "1"?true:false;
            this.creds.createTransaction = response.createTransaction == "1"?true:false;
            this.creds.autoTaxCalc = response.autoTaxCalc == "1"?true:false;
            this.creds.apiKey = response.apiKey?response.apiKey:"";
            this.credsForm = this.fb.group(this.creds);
            this.loading = false;
        });
  }

  saveConfig() {
      this.loading = true;
      let creds = this.credsForm.value;
      creds.enabled = creds.enabled?1:0;
      creds.createTransaction = creds.createTransaction?1:0;
      creds.autoTaxCalc = creds.autoTaxCalc?1:0;
      this.integrationService.setConnectorConfigs("TAXJAR", creds)
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

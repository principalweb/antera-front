import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { IntegrationService } from 'app/core/services/integration.service';

import { SanmarCreds } from 'app/models';

@Component({
  selector: 'app-sanmar',
  templateUrl: './sanmar.component.html',
  styleUrls: ['./sanmar.component.scss']
})
export class SanmarComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  credsForm: FormGroup;
  creds: SanmarCreds = {extra:"",username:"",pass:"",api_type:"sanmar_web_service",id:"",enableIncentive:false};
  onApiCredsChanged: Subscription;
  onApiCredsUpdated: Subscription;

  constructor(
                private integrationService: IntegrationService,
                private fb: FormBuilder
  ) {

      this.onApiCredsChanged =
        this.integrationService.onApiCredsChanged
            .subscribe(creds => {
                if(creds && creds.username != null && creds.api_type == "sanmar_web_service") {
                    if(creds.enableIncentive == 1) {
                        creds.enableIncentive = true;
                    } else {
                        creds.enableIncentive = false;
                    }
                    this.creds = creds;
                }
                this.credsForm = this.fb.group(this.creds);
            });

      this.onApiCredsUpdated =
        this.integrationService.onApiCredsUpdated
            .subscribe(data => {
                if(data && data.api_type == "sanmar_we_service") {
                    this.loading = false;
                }
            });
  }

  ngOnInit() {
    this.integrationService.getApiCreds({api_type:"sanmar_web_service"});
  }

  cfSubmit() {
    const creds = this.credsForm.value;
    if(creds.enableIncentive) {
        creds.enableIncentive = 1;
    } else {
        creds.enableIncentive = 0;
    }
    this.loading = true;
    this.integrationService.updateApiCreds(creds);
  }

  ngOnDestroy() {
      this.onApiCredsChanged.unsubscribe();
      this.onApiCredsUpdated.unsubscribe();
  }

}

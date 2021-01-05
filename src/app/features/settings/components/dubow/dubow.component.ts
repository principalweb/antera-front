import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';

import { ApiService } from 'app/core/services/api.service';
import { IntegrationService } from 'app/core/services/integration.service';
import { MessageService } from 'app/core/services/message.service';
import { find } from 'lodash';

import { DubowCreds } from 'app/models';

@Component({
  selector: 'app-dubow',
  templateUrl: './dubow.component.html',
  styleUrls: ['./dubow.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class DubowComponent implements OnInit {
  loading: boolean = false;
  credsForm: FormGroup;
  creds: DubowCreds = {
                       live:false,
                       customerNumber:"",
                       userId:"",
                       password:"",
                       poShipMap:[]
                       };
  shipMethods: any[] = [];
  anteraShipMethods: any[] = [];boolean
  constructor(
                private integration: IntegrationService, 
                private api: ApiService, 
                private msg: MessageService, 
                private fb: FormBuilder
                ) {
    this.api.getDropdownOptions({dropdown:['sys_shippacct_list']})
      .subscribe((res: any[]) => {
          const sourceDropdown = find(res, {name: 'sys_shippacct_list'});
          this.anteraShipMethods = sourceDropdown.options;
          this.setPoShipControls();
      }, () => {
      });
    this.integration.getPsShipMethods({code:"CustomDubow"})
      .subscribe((res: any[]) => {
          this.shipMethods = res;
      }, () => {
      });
  }

  ngOnInit() {
    this.credsForm = this.fb.group(this.creds);
    this.loadConfig();
  }

  loadConfig() {
      this.loading = true;
      let creds = { ...this.creds };
      delete creds['poShipMap'];
      this.integration.getDubowConfigs(Object.keys(creds))
        .subscribe((response:any) => {
            this.creds.customerNumber = response.customerNumber? response.customerNumber: "";
            this.creds.userId = response.userId? response.userId: "";
            this.creds.password = response.password? response.password: "";
            this.creds.live = response.live== 1? true: false;
            this.credsForm = this.fb.group(this.creds);
            this.creds.poShipMap = response.poShipMap;
            let poShipMap = this.fb.group([]);
            this.credsForm.addControl('poShipMap',  poShipMap);
            this.setPoShipControls();
            this.loading = false;
        });
  }

  saveConfig() {
      this.loading = true;
      let creds = this.credsForm.value;
      creds.live = creds.live?1:0;
      let poShipMap = creds.poShipMap;
      delete creds['poShipMap'];
      this.integration.setDubowConfigs({connector:"DUBOW", configs:creds, poShipMap:poShipMap})
        .subscribe((response:any) => {
            this.msg.show(response.msg, 'error');
            this.loading = false;
            this.loadConfig();
        });

  }

  setPoShipControls() {
      this.credsForm.removeControl("poShipMap");
        let poShipMap = this.fb.group([]);
        if(this.anteraShipMethods.length > 0) {
          this.anteraShipMethods.forEach(function (asm) {
            let shipMap = this.creds.poShipMap[asm.id]?this.creds.poShipMap[asm.id]:"";
            poShipMap.addControl(asm.id, new FormControl(shipMap));
          }, this);
        }
        this.credsForm.addControl('poShipMap',  poShipMap);
  }

}

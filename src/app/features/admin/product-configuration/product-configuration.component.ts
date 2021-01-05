import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { ProductSettings } from 'app/models';

@Component({
  selector: 'app-product-configuration',
  templateUrl: './product-configuration.component.html',
  styleUrls: ['./product-configuration.component.scss']
})
export class ProductConfigurationComponent implements OnInit {

  loading: boolean = false;
  enable = true;
  credsForm: FormGroup;
  creds: ProductSettings = {
                    defaultPoType: '',
                    sageDesc: false,
                    asiDesc: false,
                    dcDesc: false,
                    inventoryEnabled: false,
                    kitEnabled: false,
                    autoCatEnabled: false,
                    forceCategory: false,
                    showTax: false,
                  };
  poTypes: any[] = [{id: '0', name: 'DropShip'}];

  constructor(
              private fb: FormBuilder,
              private msg: MessageService,
              private api: ApiService
  ) { }

  ngOnInit() {
      this.credsForm = this.fb.group(this.creds);
      this.loadCreds();
  }

  loadCreds() {
      this.loading = true;
      this.api.getAdvanceSystemConfigAll({module: 'Products'})
        .subscribe((response: any) => {
            this.creds.defaultPoType = response.settings && response.settings.defaultPoType?response.settings.defaultPoType:"0";
            this.creds.sageDesc = response.settings.sageDesc == '1' ? true : false;
            this.creds.dcDesc = response.settings.dcDesc == '1' ? true : false;
            this.creds.asiDesc = response.settings.asiDesc == '1' ? true: false;
            this.creds.inventoryEnabled = response.settings.inventoryEnabled == '1' ? true : false;
            this.creds.kitEnabled = response.settings.kitEnabled == '1' ? true : false;
            this.creds.autoCatEnabled = response.settings.autoCatEnabled == '1' ? true : false;
            this.creds.forceCategory = response.settings.forceCategory == '1' ? true : false;
            this.creds.showTax = response.settings.showTax == '1' ? true : false;
            if (this.creds.inventoryEnabled) {
              this.poTypes = [{id: '0', name: 'DropShip'}, {id: '1', name: 'Stock'}];
            } else {
              this.poTypes = [{id: '0', name: 'DropShip'}];
            }
            this.credsForm = this.fb.group(this.creds);
            this.loading = false;
        });
  }

  saveConfig() {
      this.loading = true;
      const creds = this.credsForm.value;
      creds.sageDesc = creds.sageDesc ? 1 : 0;
      creds.asiDesc = creds.asiDesc ? 1 : 0;
      creds.inventoryEnabled = creds.inventoryEnabled ? 1 : 0;
      creds.kitEnabled = creds.kitEnabled ? 1 : 0;
      creds.autoCatEnabled = creds.autoCatEnabled ? 1 : 0;
      creds.forceCategory = creds.forceCategory ? 1 : 0;
      creds.showTax = creds.showTax ? 1 : 0;
      this.api.updateAdvanceSystemConfigAll({module: 'Products', settings: creds, hooks: ['updateInventorySettings']})
        .subscribe(
        (response: any) => {
            this.msg.show(response.msg, 'error');
            this.loading = false;
            this.loadCreds();
        },
        (err: any) =>  {
            this.msg.show(err.message, 'error');
            this.loading = false;
        });

  }

}

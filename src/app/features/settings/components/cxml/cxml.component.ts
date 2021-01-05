import { Subscription } from 'rxjs';
import { InventoryService } from 'app/core/services/inventory.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { IntegrationService } from 'app/core/services/integration.service';
import { MessageService } from 'app/core/services/message.service';

import { CxmlCreds } from 'app/models';

@Component({
  selector: 'app-cxml',
  templateUrl: './cxml.component.html',
  styleUrls: ['./cxml.component.scss']
})
export class CxmlComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  credsForm: FormGroup;
  invoiceCustomFieldForm: FormGroup;
  invoiceCustomFields = [];
  poCustomFieldForm: FormGroup;
  poCustomFields = [];
  showCustomFields = false;
  creds: CxmlCreds = {
                       CrmDomain: '',
                       CrmIdentity: '',
                       CrmAgent: '',
                       CustomerDomain: '',
                       CustomerIdentity: '',
                       SenderDomain: '',
                       SenderIdentity: '',
                       CustomerAgent: '',
                       Secret: '',
                       InvoiceUrl: '',
                       AsnUrl: '',
                       AttachDecoration: false,
                       ZeroDecoration: false,
                       MergeInvoiceDeco: false,
                       SkuToPartId: false,
                       DefaultPOWarehosue: '',
                       };
  action = 'settings';
  onFobChanged: Subscription;
  fobList: any[] = [];

  constructor(
                private integration: IntegrationService,
                private inventorySerive: InventoryService,
                private msg: MessageService,
                private fb: FormBuilder
                ) {
    this.inventorySerive.getFob();
  }

  loadConfig() {
      this.loading = true;
      this.integration.connectorGetConfig("CXML", Object.keys(this.creds))
        .subscribe((response:any) => {
            this.creds.CrmDomain = response.CrmDomain? response.CrmDomain: "";
            this.creds.CrmIdentity = response.CrmIdentity? response.CrmIdentity: "";
            this.creds.CrmAgent = response.CrmAgent? response.CrmAgent: "";
            this.creds.CustomerDomain = response.CustomerDomain? response.CustomerDomain: "";
            this.creds.CustomerIdentity = response.CustomerIdentity? response.CustomerIdentity: "";
            this.creds.SenderDomain = response.SenderDomain? response.SenderDomain: "";
            this.creds.SenderIdentity = response.SenderIdentity? response.SenderIdentity: "";
            this.creds.CustomerAgent = response.CustomerAgent? response.CustomerAgent: "";
            this.creds.Secret = response.Secret? response.Secret: "";
            this.creds.InvoiceUrl = response.InvoiceUrl? response.InvoiceUrl: "";
            this.creds.AsnUrl = response.AsnUrl? response.AsnUrl: "";
            this.creds.AttachDecoration = response.AttachDecoration== 1? true: false;
            this.creds.ZeroDecoration = response.ZeroDecoration== 1? true: false;
            this.creds.MergeInvoiceDeco = response.MergeInvoiceDeco== 1? true: false;
            this.creds.SkuToPartId = response.SkuToPartId== 1? true: false;
            this.creds.DefaultPOWarehosue = response.DefaultPOWarehosue ? response.DefaultPOWarehosue : '';
            this.credsForm = this.fb.group(this.creds);
            this.loading = false;
        });
  }

  ngOnInit() {
      this.onFobChanged = this.inventorySerive.onFobChanged.subscribe((res) => {
        this.fobList = [];
        if (res && res.length > 0) {
          res.forEach(row => {
            if (row.bins && row.bins.length > 0) {
              this.fobList.push(row);
            }
          });
        }
      });
    this.credsForm = this.fb.group(this.creds);
    this.loadConfig();
  }

  saveConfig() {
      this.loading = true;
      let creds = this.credsForm.value;
      creds.AttachDecoration = creds.AttachDecoration?1:0;
      creds.ZeroDecoration = creds.ZeroDecoration?1:0;
      creds.MergeInvoiceDeco = creds.MergeInvoiceDeco?1:0;
      creds.SkuToPartId = creds.SkuToPartId?1:0;
      this.integration.setConnectorConfigs("CXML", creds)
        .subscribe((response:any) => {
            this.msg.show(response.msg, 'error');
            this.loading = false;
            this.loadConfig();
        });

  }

  changeAction(value) {
    this.action = value;
  }

  ngOnDestroy() {
    this.onFobChanged.unsubscribe();
  }

}

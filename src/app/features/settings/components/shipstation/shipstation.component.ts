import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { IntegrationService } from 'app/core/services/integration.service';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { ShipStationCreds } from 'app/models';


@Component({
  selector: 'app-shipstation',
  templateUrl: './shipstation.component.html',
  styleUrls: ['./shipstation.component.scss']
})

export class ShipstationComponent implements OnInit {

  loading: boolean = false;
  credsForm:FormGroup;
  creds: ShipStationCreds = {
        enabled:false,
        apiKey:"",
        apiSecret:"",
        noOfDaysToDelivery:"",
        doNotAddPrice:false,
        bookingOrderNotSentShipStation:false,
  };

  constructor(
              private fb: FormBuilder,
              private msg: MessageService,
              private api: ApiService,
              private integrationService: IntegrationService
  ) { }

  ngOnInit() {
      this.credsForm = this.fb.group(this.creds);
      this.loadCreds();
  }

  loadCreds() {
      this.loading = true;
      this.integrationService.connectorGetConfig("SHIPSTATION", { 0: "enabled", 1:"apiKey", 2:"apiSecret" , 3:"noOfDaysToDelivery",4:"doNotAddPrice",5:"bookingOrderNotSentShipStation"})
        .subscribe((response:any) => {
            this.creds.enabled = response.enabled == "1" ? true : false;
            this.creds.apiKey = response.apiKey?response.apiKey:"";
            this.creds.apiSecret = response.apiSecret?response.apiSecret:"";
            this.creds.noOfDaysToDelivery = response.noOfDaysToDelivery?response.noOfDaysToDelivery:"";
            this.creds.doNotAddPrice = response.doNotAddPrice == "1" ? true : false;
            this.creds.bookingOrderNotSentShipStation = response.bookingOrderNotSentShipStation == "1" ? true : false;
            this.credsForm = this.fb.group(this.creds);
            this.loading = false;
        });
  }

  saveConfig() {
      this.loading = true;
      let creds = this.credsForm.value;
      creds.enabled = creds.enabled?1:0;
      this.integrationService.setConnectorConfigs("SHIPSTATION", creds)
        .subscribe(
        (response:any) => {
            this.msg.show(response.msg, 'error');
            this.loading = false;
            this.loadCreds();
            if(this.creds.enabled)
                this.saveShipStationCarriersAsProduct();
        },
        (err:any) =>  {
            this.msg.show(err.message, 'error');
            this.loading = false;
        });
  }

  saveShipStationCarriersAsProduct() {
      this.api.getShipStationCarriers().subscribe((response:any) => {});
  }

}

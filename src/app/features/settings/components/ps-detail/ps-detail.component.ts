import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { Subscription ,  Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { find } from 'lodash';

import { ApiService } from 'app/core/services/api.service';
import { IntegrationService } from 'app/core/services/integration.service';

import {PsEndpoint, PsCreds} from 'app/models';

@Component({
  selector: 'app-ps-detail',
  templateUrl: './ps-detail.component.html',
  styleUrls: ['./ps-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class PsDetailComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['Code', 'Name', 'Status', 'Version', 'WSDL', 'TestURL', 'URL'];
  dataSource: PsEndpointsDataSource | null;
  loading: boolean = false;
  onEndpointsChanged: Subscription;
  onCredsChanged: Subscription;
  onCredsUpdated: Subscription;
  credsForm: FormGroup;
  creds: PsCreds = {username:"",password:"",enabled:false,poEnabled:false,poLive:false,country:"",poShipMap:[]};
  countries = [{code:"US",country:"US"},{code:"CA",country:"Canada"}];
  endpoints: PsEndpoint[] = [];
  psShipMethods: any[] = [];
  anteraShipMethods: any[] = [];
  poEndpointAvail: boolean = false;

  constructor(
                private integrationService: IntegrationService,
                private api: ApiService,
                public dialogRef: MatDialogRef<PsDetailComponent>,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any
              ) {

      this.onCredsUpdated =
        this.integrationService.onPsCompanyUpdated
            .subscribe(data => {
                this.loading = false;
            });

      this.onCredsChanged =
        this.integrationService.onCompanyCredsChanged
            .subscribe(creds => {
                if(creds && creds.username != null) {
                    this.creds = creds;
                    if(creds.enabled == "1") {
                        this.creds.enabled = true;
                    } else {
                        this.creds.enabled = false;
                    }
                    if(creds.poEnabled == "1") {
                        this.creds.poEnabled = true;
                    } else {
                        this.creds.poEnabled = false;
                    }
                    if(creds.poLive == "1") {
                        this.creds.poLive = true;
                    } else {
                        this.creds.poLive = false;
                    }
                }
                this.credsForm = this.fb.group(this.creds);
                let poShipMap = this.fb.group([]);
                this.credsForm.addControl('poShipMap',  poShipMap);
                this.setPoShipControls();
            });

      this.onEndpointsChanged =
        this.integrationService.onCompanyEndpointChanged
            .subscribe(endpoints => {
                let poEndpoint = find(endpoints, {Service: {ServiceType:{Code:'PO'},Status:'Production'}});
                if(poEndpoint && poEndpoint.Service) {
                    this.poEndpointAvail = true;
                }
                this.endpoints = endpoints;
                this.loading = false;
            });
    this.api.getDropdownOptions({dropdown:['sys_shippacct_list']})
      .subscribe((res: any[]) => {
          const sourceDropdown = find(res, {name: 'sys_shippacct_list'});
          this.anteraShipMethods = sourceDropdown.options;
          this.setPoShipControls();
      }, () => {
      });
  }

  ngOnInit() {
        this.poEndpointAvail = false;
        this.dataSource = new PsEndpointsDataSource(
            this.integrationService
        );
        this.loadData();
  }

  loadData() {
    this.loading = true;
    this.integrationService.getPsCompanyDetails({code:this.data.code});
    this.integrationService.getPsShipMethods({code:this.data.code})
      .subscribe((res: any[]) => {
          this.psShipMethods = res;
      }, () => {
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

  save() {
      this.loading = true;
      this.integrationService.updatePsCreds({creds:this.credsForm.value,company:this.data,endpoints:this.endpoints});
  }

  ngOnDestroy() {
        this.onEndpointsChanged.unsubscribe();
        this.onCredsUpdated.unsubscribe();
  }

  cfSubmit() {
  }
}

export class PsEndpointsDataSource extends DataSource<any>
{
    total = 0;

    onTotalCountChanged: Subscription;

    constructor(
        private integrationService: IntegrationService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<PsEndpoint[]>
    {
        const displayDataChanges = [
            this.integrationService.onCompanyEndpointChanged
        ];

        this.onTotalCountChanged =
            this.integrationService.onCompanyEndpointCountChanged
                .subscribe(total => {
                    this.total = total;
                });

        return this.integrationService.onCompanyEndpointChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
    }
}

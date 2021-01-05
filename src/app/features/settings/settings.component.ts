import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { QbService } from 'app/core/services/qb.service';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SettingsComponent implements OnInit, OnDestroy {
    qboActive = false;
    xeroActive = false;
    onQbActiveChanged: Subscription;
    cxmlEnabled: boolean = false;
    dubowEnabled: boolean = false;

  constructor(
                private qbService: QbService,
                private api: ApiService,
  ) {
        this.onQbActiveChanged =
            this.qbService.onQbActiveChanged
                .subscribe((res: boolean) => {
                    if (res) {
                      this.qboActive = this.qbService.getActiveConnector() == 'QBO' ? true : false;
                      this.xeroActive = this.qbService.getActiveConnector() == 'XERO' ? true : false;
                    }
                });
  }

  ngOnInit() {
      this.api.getAdvanceSystemConfig({module: 'Orders', setting:'cxmlEnabled'})
        .subscribe((response:any) => {
            if(response.value && response.value == 1) {
                this.cxmlEnabled = true;
            }
        });
      this.api.getAdvanceSystemConfig({module: 'Orders', setting:'dubowEnabled'})
        .subscribe((response:any) => {
            if(response.value && response.value == 1) {
                this.dubowEnabled = true;
            }
        });
  }

  ngOnDestroy() {
      this.onQbActiveChanged.unsubscribe();
  }

}

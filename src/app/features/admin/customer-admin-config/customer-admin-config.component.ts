import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { CustomerAdminConfigService } from './customer-admin-config.service';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-customer-admin-config',
  templateUrl: './customer-admin-config.component.html',
  styleUrls: ['./customer-admin-config.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class CustomerAdminConfigComponent implements OnInit {
  inventoryEnabled: boolean = false;
  identityEnabled: boolean = false;

  constructor(public customerAdminConfigService: CustomerAdminConfigService, private api: ApiService) {
      this.api.getAdvanceSystemConfig({module: 'Products', setting:'inventoryEnabled'})

        .subscribe((response:any) => {
            if(response.value && response.value == 1) {
                this.inventoryEnabled = true;
            }
        });
      this.api.getAdvanceSystemConfig({module: 'Orders', setting:'identityEnabled'})

        .subscribe((response:any) => {
            if(response.value && response.value == 1) {
                this.identityEnabled = true;
            }
        });
  }

  ngOnInit() {
  }

}

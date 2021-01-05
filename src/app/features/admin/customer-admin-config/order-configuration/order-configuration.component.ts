import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ProductConfig } from 'app/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { displayName } from 'app/features/e-commerce/utils';
import { fuseAnimations } from '@fuse/animations';
import { distinctUntilChanged, debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-order-configuration',
  templateUrl: './order-configuration.component.html',
  styleUrls: ['./order-configuration.component.scss'],
  animations: fuseAnimations,
})
export class OrderConfigurationComponent implements OnInit {

  configForm: FormGroup;
  loading = true;
  settled = false;
  displayName = displayName;
  filteredAccounts = [];
  inventoryEnabled: Boolean = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private msg: MessageService) { }

  ngOnInit() {
    this.getConfig();
  }

  getConfig() {
    this.loading = true;
    this.api.getAdvanceSystemConfig({module: 'Products', setting: 'inventoryEnabled'})
      .subscribe((response: any) => {
          this.inventoryEnabled = false;
          if (response.value && response.value == 1) {
              this.inventoryEnabled = true;
          }
      });
    this.api.getAdvanceSystemConfigAll({module: 'Orders'})
      .subscribe((res: any) => {
        this.loading = false;
        this.settled = true;
        const config = new ProductConfig(res.settings);
        console.log(config);
        this.configForm = this.fb.group(config);
        this.configForm.get('alternateShipToAccount')
          .valueChanges.pipe(
            map(val => displayName(val).trim().toLowerCase()),
            debounceTime(400),
            distinctUntilChanged(),
          )
          .subscribe(keyword => {
              this.api.getCustomerAutocomplete(keyword)
                .subscribe((res: any[]) => {
                  this.filteredAccounts = res;
                });
          });

      }, () => {
        this.loading = false;
      });
  }

  save() {
    const config = new ProductConfig(this.configForm.value);
    const postData = {
      module: 'Orders',
      settings: {
        ...config.toObject()
      }
    };
    this.loading = true;
    this.api.updateAdvanceSystemConfigAll(postData)
        .subscribe((res: any) => {
          this.loading = false;
          this.msg.show('Order Settings updated', 'success');
        },(err) => {
          this.loading = false;
          this.msg.show(err, 'success');
        });
  }

  selectAccount(ev) {
    const assignee = ev.option.value;
    this.configForm.patchValue({
      alternateShipToAccountId: assignee.id,
      alternateShipToAccount: assignee.name
    });
  }

}

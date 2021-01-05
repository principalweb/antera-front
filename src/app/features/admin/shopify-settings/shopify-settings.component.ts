import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ShopifySettings } from 'app/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { displayName } from 'app/features/e-commerce/utils';
import { fuseAnimations } from '@fuse/animations';
import { distinctUntilChanged, debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-shopify-settings',
  templateUrl: './shopify-settings.component.html',
  styleUrls: ['./shopify-settings.component.css']
})
export class ShopifySettingsComponent implements OnInit {
  configForm: FormGroup;
  loading = true;
  settled = false;
  displayName = displayName;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private msg: MessageService) { }

  ngOnInit() {
    this.getConfig();
  }

  getConfig() {
    this.loading = true;
    this.api.getAdvanceSystemConfigAll({module: 'Shopify'})
      .subscribe((res: any) => {
        this.loading = false;
        this.settled = true;
        const config = new ShopifySettings(res.settings);
        this.configForm = this.fb.group(config);

      }, () => {
        this.loading = false;
      });
  }

  save() {
    const config = new ShopifySettings(this.configForm.value);
    const postData = {
      module: 'Shopify',
      settings: {
        ...config.toObject()
      }
    };
    this.loading = true;
    this.api.updateAdvanceSystemConfigAll(postData)
        .subscribe((res: any) => {
          this.loading = false;
          this.msg.show('Shopify Settings updated', 'success');
        },(err) => {
          this.loading = false;
          this.msg.show(err, 'success');
        });
  }
}

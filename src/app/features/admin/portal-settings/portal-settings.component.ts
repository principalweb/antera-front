import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { PortalSettings } from 'app/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { displayName } from 'app/features/e-commerce/utils';
import { fuseAnimations } from '@fuse/animations';
import { distinctUntilChanged, debounceTime, map } from 'rxjs/operators';



@Component({
  selector: 'app-portal-settings',
  templateUrl: './portal-settings.component.html',
  styleUrls: ['./portal-settings.component.scss'],
  animations: fuseAnimations,
})
export class PortalSettingsComponent implements OnInit {
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
    this.api.getAdvanceSystemConfigAll({module: 'Portal'})
      .subscribe((res: any) => {
        this.loading = false;
        this.settled = true;
        const config = new PortalSettings(res.settings);
        console.log(config);
        this.configForm = this.fb.group(config);

      }, () => {
        this.loading = false;
      });
  }

  save() {
    const config = new PortalSettings(this.configForm.value);
    const postData = {
      module: 'Portal',
      settings: {
        ...config.toObject()
      }
    };
    this.loading = true;
    this.api.updateAdvanceSystemConfigAll(postData)
        .subscribe((res: any) => {
          this.loading = false;
          this.msg.show('Portal Settings updated', 'success');
        },(err) => {
          this.loading = false;
          this.msg.show(err, 'success');
        });
  }
}

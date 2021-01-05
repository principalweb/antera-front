import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DropboxSettings } from 'app/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { displayName } from 'app/features/e-commerce/utils';
import { fuseAnimations } from '@fuse/animations';
import { distinctUntilChanged, debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-dropbox-settings',
  templateUrl: './dropbox-settings.component.html',
  styleUrls: ['./dropbox-settings.component.css']
})
export class DropboxSettingsComponent implements OnInit {
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
    this.api.getAdvanceSystemConfigAll({module: 'Dropbox'})
      .subscribe((res: any) => {
        this.loading = false;
        this.settled = true;
        const config = new DropboxSettings(res.settings);
        this.configForm = this.fb.group(config);

      }, () => {
        this.loading = false;
      });
  }

  save() {
    const config = new DropboxSettings(this.configForm.value);
    const postData = {
      module: 'Dropbox',
      settings: {
        ...config.toObject()
      }
    };
    this.loading = true;
    this.api.updateAdvanceSystemConfigAll(postData)
        .subscribe((res: any) => {
          this.loading = false;
          this.msg.show('Dropbox Settings updated', 'success');
        },(err) => {
          this.loading = false;
          this.msg.show(err, 'success');
        });
  }
  
}

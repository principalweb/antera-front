import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { AmazonS3Settings } from 'app/models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { displayName } from 'app/features/e-commerce/utils';
import { fuseAnimations } from '@fuse/animations';
import { distinctUntilChanged, debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-amazon-s3-settings',
  templateUrl: './amazon-s3-settings.component.html',
  styleUrls: ['./amazon-s3-settings.component.scss'],
  animations: fuseAnimations,
})
export class AmazonS3SettingsComponent implements OnInit {
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
    this.api.getAdvanceSystemConfigAll({module: 'AmazonS3'})
      .subscribe((res: any) => {
        this.loading = false;
        this.settled = true;
        const config = new AmazonS3Settings(res.settings);
        console.log(config);
        this.configForm = this.fb.group(config);

      }, () => {
        this.loading = false;
      });
  }

  save() {
    const config = new AmazonS3Settings(this.configForm.value);
    const postData = {
      module: 'AmazonS3',
      settings: {
        ...config.toObject()
      }
    };
    this.loading = true;
    this.api.updateAdvanceSystemConfigAll(postData)
        .subscribe((res: any) => {
          this.loading = false;
          this.msg.show('Amazon S3 Settings updated', 'success');
        },(err) => {
          this.loading = false;
          this.msg.show(err, 'success');
        });
  }
}

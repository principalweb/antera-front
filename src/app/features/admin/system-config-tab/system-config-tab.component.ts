import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SystemConfig } from 'app/models/system-config';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-system-config-tab',
  templateUrl: './system-config-tab.component.html',
  styleUrls: ['./system-config-tab.component.scss']
})
export class SystemConfigTabComponent implements OnInit {
  configForm: FormGroup;
  config: SystemConfig = new SystemConfig();
  loading = false;

  constructor(private fb: FormBuilder, private api: ApiService) { }

  ngOnInit() {
    this.getConfig();
    this.createForm();
  }

  getConfig() {
    this.loading = true;
    this.api.getSystemConfigs()
      .subscribe(config => {
        console.log(config);
        this.config = new SystemConfig(config);
        this.createForm();
        this.loading = false;
      }, () => {
        this.loading = true;
      });
  }

  createForm() {
    this.configForm = this.fb.group(this.config);
  }

  save() {
    if (!this.config.checksum) {
      return;
    }

    const newConfigs = new SystemConfig({
      ...this.config,
      ...this.configForm.value
    });

    this.loading = true;
    this.api.saveSystemConfigs(newConfigs)
      .subscribe(
        () => {
          this.loading = false;
        },
        () => {
          this.loading = false;
        }
      );
  }

  reset() {
    this.configForm.setValue(this.config);
  }
}

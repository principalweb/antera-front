import { Injectable, Directive } from '@angular/core';
import { SystemConfig } from 'app/models/system-config';
import { ApiService } from './api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { ModuleField } from 'app/models/module-field';
import { map } from 'rxjs/operators';

@Injectable()
export class GlobalConfigService {

    onModuleFieldsChanged: BehaviorSubject<any> = new BehaviorSubject([]);

    config: SystemConfig = new SystemConfig();

    constructor(private api: ApiService) { }

    loadSysConfig(): Promise<any> {
      return new Promise((resolve, reject) => {
        this.api.getSystemConfigs()
        .subscribe(config => {
          this.config = new SystemConfig(config);
          resolve(config);
        }, (err) => {
          console.log("Sys Config not loaded");
          reject(err);
        });
      });
    }

    getSysConfig() {
      return this.config;
    }

    updateSysConfig(configs) {
      this.api.saveSystemConfigs(configs)
      .subscribe(
        () => {
          console.log("Sys Config Updated");
        },
        () => {
          console.log("Sys Config not updated");
        }
      );
    }

    getModuleFields(params)
    {
        return this.api.getFieldsList(params).pipe(
            map((response: any) => {
                this.onModuleFieldsChanged.next(
                    response.map(moduleField => 
                    new ModuleField(moduleField)
                    )
                );
              return response;
            })
        );
    }
}
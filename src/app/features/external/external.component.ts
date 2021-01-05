import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';


import { FuseConfigService } from '@fuse/services/config.service';

@Component({
    selector: 'app-external',
    templateUrl: './external.component.html',
    styleUrls: ['./external.component.scss'],
    animations: fuseAnimations
})
export class ExternalComponent implements OnInit, OnDestroy {


    originalDefaultConfig: any;

    constructor(public config: FuseConfigService, private cd: ChangeDetectorRef) {

    }

    ngOnInit(): void {
        setTimeout(() => {
            this.originalDefaultConfig = this.config.defaultConfig;
            this.config.setConfig({layout: { navigation:'none', toolbar: 'none'}});
            // this.config.defaultConfig = this.config.config;
        }, 0);
    }

    ngOnDestroy(): void {
        setTimeout(() => {
            this.config.setConfig(this.originalDefaultConfig);
            // this.config.defaultConfig = this.config.config;
        }, 0)
    }
}

import { Component, OnInit } from '@angular/core';
import { IntegrationService } from 'app/core/services/integration.service';

@Component({
  selector: 'app-api-token-tab',
  templateUrl: './api-token-tab.component.html',
  styleUrls: ['./api-token-tab.component.scss']
})
export class ApiTokenTabComponent implements OnInit {

    enabled: boolean = false;
    token: any;

    constructor(
        private integrationService: IntegrationService
    ) { }

    ngOnInit() {
        this.checkEnabled();
        this.integrationService.getToken().subscribe((res: any) => {
            this.token = res;
        })
    }

    checkEnabled() {
        this.integrationService.apiEnabled().subscribe((res: boolean) => {
            this.enabled = res;
        });
    }

    toggleEnable() {
        this.enabled = !this.enabled;
        this.integrationService.enableApi(this.enabled).subscribe();
    }

    generateToken() {
        if (confirm('Generating a new token will replace the current token. Continue?')) {
            this.integrationService.generateToken().subscribe((res: any) => {
                this.token = res;
                console.log(res);
            });
        }
    }
}

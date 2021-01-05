import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'app/core/services/message.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { LoginJSONAPIService } from 'app/core/services/loginJSONAPI.service';
import * as jwt_decode from 'jwt-decode';

@Component({
  selector: 'aws',
  templateUrl: './aws.component.html',
  styleUrls: ['./aws.component.scss']
})
export class AwsComponent implements OnInit {
    private urlParameters;
    private url;

    constructor(
        private fuseConfig: FuseConfigService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private msg: MessageService,
        private globalService: GlobalConfigService,
        private loginAPI: LoginJSONAPIService) { }

    ngOnInit() {
        this.fuseConfig.setConfig({
            layout: {
                navigation: 'none',
                toolbar: 'none',
                footer: 'none'
            }
        });
        this.urlParameters = this.getUrlVars();
        //console.log(this.urlParameters["access_token"]);
        this.loadData();
        //console.log(this.urlParameters[this.urlParameters[0]]);
    }
    getUrlVars() { 
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
    login = async function () {

        await this.loginAPI.login({ access_token: this.urlParameters["access_token"], id_token: this.urlParameters[this.urlParameters[0]] })
            .subscribe(async response => {
                if (response.status === "401") {
                    location.href = this.url;
                }

                const token = response && response.token;

                if (token) {
                    const decoded = jwt_decode(token);
                    localStorage.setItem(AuthService.CURRENT_USER_KEY, JSON.stringify(decoded));
                    this.authService.storeJwtToken(token);
                    // Load Sys Config when login 
                    await this.globalService.loadSysConfig();
                    this.router.navigate(['/']);
                } else {
                    location.href = this.url;
                }
               
            },
                error => {
                    this.loading = false;
                    if (error.status === 412) {
                        error = error.error;
                        if (error.logged === "success") { 
                            this.msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                        }
                        else {
                            this.msg.show("The System timed out, please login again.", 'error');
                        }
                    }
                    else {
                       this.router.navigate(['/']);

                    }

                    this.loading = false;
                });

    }
    loadData = async function () {
        await this.loginAPI.get()
            .subscribe(loginJSON => {
                if (!loginJSON["Cognito"].isEnabled) {
                }
                for (let i = 0; i < (loginJSON["Cognito"].properties.length-1); i++) {
                    if (i === 0) {
                        this.url = loginJSON["Cognito"].properties[i].value + "/login?";
                    }
                    else {
                        this.url = this.url + loginJSON["Cognito"].properties[i].id + "=" + loginJSON["Cognito"].properties[i].value + "&"

                    }
                }

                if (this.urlParameters["access_token"] === undefined) {
                    location.href = this.url;
                }
                else {
                    this.login();
                }
            },
                error => {
                    this.loading = false;
                    if (error.status === 400) {
                        error = error.error;
                        if (error.logged === "success") {
                            this.msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                        }
                        else {
                            this.msg.show("The System timed out, please login again", 'error');
                        }
                    }



                    else {
                        this.msg.show('The System timed out, please login again.', 'error');

                    }

                    this.loading = false;
                });

    }

}

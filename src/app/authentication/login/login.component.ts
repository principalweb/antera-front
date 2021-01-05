import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'app/core/services/message.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { LoginJSONAPIService } from 'app/core/services/loginJSONAPI.service';

@Component({
    selector   : 'antera-login-componenet',
    templateUrl: './login.component.html',
    styleUrls  : ['./login.component.scss'],
    animations : fuseAnimations
})
export class AnteraLoginComponent implements OnInit
{
    loginForm: FormGroup;
    loginFormErrors: any;
    loading = false;
    constructor(
        private fuseConfig: FuseConfigService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private msg: MessageService,
        private globalService: GlobalConfigService,
        private loginAPI: LoginJSONAPIService
    )
    {
        this.fuseConfig.setConfig({
            layout: {
                navigation: 'none',
                toolbar   : 'none',
                footer    : 'none'
            }
        });

        this.loginFormErrors = {
            username   : {},
            password: {}
        };
    }

    ngOnInit()
    {
        this.loading = true;
        this.loginAntera();
        this.loadData();
    }
    loadData = async function () {


        await this.loginAPI.get()
            .subscribe(data => {
                this.loginJSON = data;
                if (this.loginJSON["Antera"].isEnabled) {
                    this.loading = false;
                    return;
                }
                for (let key in this.loginJSON) {
                    if (this.loginJSON[key].isEnabled) {
                        let url = "";
                        for (let i = 0; i < (this.loginJSON[key].properties.length-1); i++) {
                            if (i === 0) {
                                url = this.loginJSON[key].properties[i].value + "/logout?";
                            }
                            else {
                                url = url + this.loginJSON[key].properties[i].id+"="+this.loginJSON[key].properties[i].value+"&"

                            }
                        }
                        console.log(url);
                        location.href = url;
                        //location.href = "https://dev-aptera.auth.us-east-1.amazoncognito.com/logout?client_id=5k798ssgbe1bgvmk03ou6eqq3g&response_type=token&scope=email+openid+profile&redirect_uri=http://localhost:4200/aws-login";
                        return;
                    }
                }

                this.creatForm();
                this.loading = false;
            },
                error => {
                    this.loading = false;
                    if (error.status === 400) {
                        error = error.error;
                        if (error.logged === "success") {
                            this.msg.show("Something has gone wrong. Please contact support with Error No. " + error.logged_id, 'error');
                        }
                        else {
                            this.msg.show("The System timed out, please login again.", 'error');
                        }
                    }
                    else {
                        this.msg.show('The System timed out, please login again.', 'error');

                    }

                    this.loading = false;
                });

    }
    loginAntera = function () {
       // this.loading = false;
        this.loginForm = this.formBuilder.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.loginForm.valueChanges.subscribe(() => {
            this.onLoginFormValuesChanged();
        });

    }

    onLoginFormValuesChanged()
    {
        for ( const field in this.loginFormErrors )
        {
            if ( !this.loginFormErrors.hasOwnProperty(field) )
            {
                continue;
            }

            // Clear previous errors
            this.loginFormErrors[field] = {};

            // Get the control
            const control = this.loginForm.get(field);

            if ( control && control.dirty && !control.valid )
            {
                this.loginFormErrors[field] = control.errors;
            }
        }
    }

    signInWithUsernameAndPassword() {
        this.loading = true;
        this.authService.signInWithUsernameAndPassword(this.loginForm.value.username, this.loginForm.value.password).then(() => {
            //this.loading = false;
            localStorage.setItem("alfpass", btoa(this.loginForm.value.password));
            localStorage.setItem("alfuser", this.loginForm.value.username);
            this.router.navigate(['/']);
            // Load Sys Config when login
            this.globalService.loadSysConfig();
        }, (err)=> {
            this.msg.show(err, 'error');
            this.loading = false;
        });
    }

}

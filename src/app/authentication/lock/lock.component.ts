import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/services/auth.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { MessageService } from 'app/core/services/message.service';
import { Router } from '@angular/router';
import { LoginJSONAPIService } from 'app/core/services/loginJSONAPI.service';

@Component({
    selector: 'fuse-lock',
    templateUrl: './lock.component.html',
    styleUrls: ['./lock.component.scss'],
    animations: fuseAnimations
})
export class FuseLockComponent implements OnInit {
    lockForm: FormGroup;
    lockFormErrors: any;
    loading = false;

    private ACCESS_TOKEN;
    private CURRENT_USER_KEY;
    constructor(
        private fuseConfig: FuseConfigService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private globalService: GlobalConfigService,
        private msg: MessageService,
        private router: Router,
        private loginAPI: LoginJSONAPIService
    ) {
        this.fuseConfig.setConfig({
            layout: {
                navigation: 'none',
                toolbar: 'none',
                footer: 'none'
            }
        });

        this.lockFormErrors = {
            username: {},
            password: {}
        };
    }

    ngOnInit() {
        this.loading = true;
        const user = this.authService.getCurrentUser();
        if(user && user.userName){
		this.lockForm = this.formBuilder.group({
		    username: [{ value: user.userName, disabled: true }, Validators.required],
		    password: ['', Validators.required]
		});        
        }else{
		this.lockForm = this.formBuilder.group({
		    username: [{ value: '', disabled: true }, Validators.required],
		    password: ['', Validators.required]
		});        
        }

        this.lockForm.valueChanges.subscribe(() => {
            this.onLockFormValuesChanged();
        });
        this.loadData();
    }
    loadData = async function () {

        this.ACCESS_TOKEN = localStorage.getItem(AuthService.ACCESS_TOKEN);

        localStorage.removeItem(AuthService.ACCESS_TOKEN);


        await this.loginAPI.get()
            .subscribe(data => {
                this.loginJSON = data;
                if (this.loginJSON["Antera"].isEnabled) {
                    localStorage.setItem(AuthService.ACCESS_TOKEN, this.ACCESS_TOKEN);
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
                                url = url + this.loginJSON[key].properties[i].id + "=" + this.loginJSON[key].properties[i].value + "&"

                            }
                        }
                        location.href = url;
                        return;
                    }
                }

                this.loading = false;
            },
                error => {
                    localStorage.setItem(AuthService.ACCESS_TOKEN, this.ACCESS_TOKEN);
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

    unlock() {
        const { username, password } = this.lockForm.getRawValue();
        this.authService.signInWithUsernameAndPassword(username, password).then(() => {
            //this.loading = false;
            this.router.navigate(['/']);
            // Load Sys Config when login
            this.globalService.loadSysConfig();
        }, (err) => {
            this.msg.show(err, 'error');
        });
    }

    onLockFormValuesChanged() {
        for (const field in this.lockFormErrors) {
            if (!this.lockFormErrors.hasOwnProperty(field)) {
                continue;
            }

            // Clear previous errors
            this.lockFormErrors[field] = {};

            // Get the control
            const control = this.lockForm.get(field);

            if (control && control.dirty && !control.valid) {
                this.lockFormErrors[field] = control.errors;
            }
        }
    }
    logout() {
        localStorage.removeItem(AuthService.ACCESS_TOKEN);
        localStorage.removeItem(AuthService.CURRENT_USER_KEY);
        this.router.navigate(['/login']);
    }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { MessageService } from 'app/core/services/message.service';
import { LoginJSONAPIService } from 'app/core/services/loginJSONAPI.service';

//import * as data from "app/authentication/login/login.json";
//var fs = require('fs');


@Component({
    selector: 'app-cognito',
  templateUrl: './cognito.component.html',
  styleUrls: ['./cognito.component.scss']
})
export class CognitoComponent implements OnInit {
  loading = false;
    htmlForm: FormGroup;
    loginJSON: any;
  creds = {
                              Enabled: false,
                            };

  constructor(
                private msg: MessageService,
                private fb: FormBuilder,
                private loginAPI: LoginJSONAPIService
  ) {
  }
    ngOnInit() {
        //if (this.loginJSON === {}) {
            this.loadConfig();
        //}
    //this.loadConfig();

      this.loading = true;
  }

    loadConfig = async function () {


        this.loginAPI.get()
            .subscribe(data => {
                this.loginJSON = data;
                let loginType = "";
                for (let key in this.loginJSON) {
                    if (this.loginJSON[key].isEnabled) {
                        loginType = key;
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
                            this.msg.show("The System timed out, please login again", 'error');
                        }
                    }
                    else {
                        this.msg.show('The System timed out, please login again.', 'error');

                    }

                    this.loading = false;
                });
    }
    creatForm = function () {
        let loginType = "";
        for (let key in this.loginJSON) {
            if (this.loginJSON[key].properties === undefined) {
                continue;
            }
            if (this.loginJSON[key].isEnabled) {
                loginType = key
            }
        }

        let fields = { loginTypes: [loginType, Validators.required] }
        for (let i = 0; i < this.loginJSON[loginType].properties.length; i++) {
            if (this.loginJSON[loginType].properties[i].defaultValue !== "") {
                this.loginJSON[loginType].properties[i].value = this.loginJSON[loginType].properties[i].defaultValue;
            }
            fields[this.loginJSON[loginType].properties[i].id] = [this.loginJSON[loginType].properties[i].value, Validators.required]
        }
        this.htmlForm = this.fb.group(fields);

    }

    changeType = function ($event) {
        for (let key in this.loginJSON) {
            if (this.loginJSON[key].properties === undefined) {
                continue;
            }
            this.loginJSON[key].isEnabled = false;
            if (this.htmlForm.value.loginTypes === key) {
                this.loginJSON[key].isEnabled = true;
            }
        }
        this.creatForm();
    }

    onSubmit() {
        if (!this.htmlForm.valid) {
            return;
        }
        this.loading = true;
        for (let key in this.loginJSON) {
            if (this.loginJSON[key].properties === undefined) {
                continue;
            }
            for (let i = 0; i < this.loginJSON[key].properties.length; i++) {
                this.loginJSON[key].properties[i].value = "";
            }
        }
        for (let i = 0; i < this.loginJSON[this.htmlForm.controls.loginTypes.value].properties.length; i++) {
            this.loginJSON[this.htmlForm.controls.loginTypes.value].properties[i].value = this.htmlForm.controls[this.loginJSON[this.htmlForm.controls.loginTypes.value].properties[i].id].value
        }

        this.loginAPI.update(this.loginJSON)
            .subscribe(data => {
                this.msg.show('Login system updated', 'success');
                
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

}

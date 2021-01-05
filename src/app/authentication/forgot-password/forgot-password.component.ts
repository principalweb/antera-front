import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { ResetAuthService } from 'app/core/services/reset-auth.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { MessageService } from 'app/core/services/message.service';
import { Router } from '@angular/router';

@Component({
    selector   : 'antera-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls  : ['./forgot-password.component.scss'],
    animations : fuseAnimations
})
export class AnteraForgotPasswordComponent implements OnInit
{
    forgotPasswordForm: FormGroup;
    forgotPasswordFormErrors: any;
    forgotPasswordFormErrorsMsg = '';
    loading = false;
    constructor(
        private fuseConfig: FuseConfigService,
        private formBuilder: FormBuilder,
        private authService: ResetAuthService,
        private globalService: GlobalConfigService,
        private msg: MessageService,
        private router: Router,
    )
    {
        this.fuseConfig.setConfig({
            layout: {
                navigation: 'none',
                toolbar   : 'none',
                footer    : 'none'
            }
        });

        this.forgotPasswordFormErrors = {
            email: {}
        };
    }

    ngOnInit()
    {
        this.forgotPasswordForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });

        this.forgotPasswordForm.valueChanges.subscribe(() => {
            this.onForgotPasswordFormValuesChanged();
        });
    }

    onForgotPasswordFormValuesChanged()
    {
        this.forgotPasswordFormErrorsMsg = '';
        for ( const field in this.forgotPasswordFormErrors )
        {
            if ( !this.forgotPasswordFormErrors.hasOwnProperty(field) )
            {
                continue;
            }

            // Clear previous errors
            this.forgotPasswordFormErrors[field] = {};

            // Get the control
            const control = this.forgotPasswordForm.get(field);

            if ( control && control.dirty && !control.valid )
            {
                this.forgotPasswordFormErrors[field] = control.errors;
            }
        }
    }
    sendResetLink() {
        console.log('sendResetLink');
        this.loading = true;
        this.forgotPasswordFormErrorsMsg = '';
        this.authService.sendResetLink(this.forgotPasswordForm.value.email).subscribe((response: any) => {
                   this.loading = false;
                   if(response.status == 'success'){
                       this.msg.show(response.msg, 'success');
                   }else{
                       this.msg.show(response.msg, 'error');
                   }
                   this.forgotPasswordFormErrorsMsg = response.msg;
                }, err => {this.msg.show(err, 'error'); this.loading = false;});
        
    }
}

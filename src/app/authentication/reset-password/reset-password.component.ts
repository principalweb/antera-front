import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { ResetAuthService } from 'app/core/services/reset-auth.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { MessageService } from 'app/core/services/message.service';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';


@Component({
    selector   : 'antera-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls  : ['./reset-password.component.scss'],
    animations : fuseAnimations
})
export class AnteraResetPasswordComponent implements OnInit
{
    resetPasswordForm: FormGroup;
    resetPasswordFormErrors: any;
    loading = false;
    resetPasswordFormErrorsMsg = '';
    resetPasswordFormSuccessMsg = '';
    resetPasswordInvalidToken = '';
    fToken = '';
    constructor(
        private fuseConfig: FuseConfigService,
        private formBuilder: FormBuilder,
        private authService: ResetAuthService,
        private globalService: GlobalConfigService,
        private msg: MessageService,
        private router: Router,
        private route: ActivatedRoute
    )
    {
        this.loading = true;
        this.fuseConfig.setConfig({
            layout: {
                navigation: 'none',
                toolbar   : 'none',
                footer    : 'none'
            }
        });
        this.resetPasswordFormErrors = {
            email          : {},
            password       : {},
            passwordConfirm: {}
        };
        this.route.queryParamMap.subscribe(paramMap => {
            this.fToken = paramMap.get('fToken');
            if(this.fToken && this.fToken !=''){
                this.validateResetPasswordToken()
            }else{
                this.router.navigate(['/forgot-password']);
            }
        });

    }

    ngOnInit()
    {
        this.initResetForm();
    }
    initResetForm(){
        this.resetPasswordForm = this.formBuilder.group({
            email          : ['', [Validators.required, Validators.email]],
            password       : ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPassword]]
        });

        this.resetPasswordForm.valueChanges.subscribe(() => {
            this.onResetPasswordFormValuesChanged();
        });    
    }
    onResetPasswordFormValuesChanged()
    {
        this.resetPasswordInvalidToken = '';
        this.resetPasswordFormErrorsMsg = '';
        this.resetPasswordFormSuccessMsg = '';
        for ( const field in this.resetPasswordFormErrors )
        {
            if ( !this.resetPasswordFormErrors.hasOwnProperty(field) )
            {
                continue;
            }

            // Clear previous errors
            this.resetPasswordFormErrors[field] = {};

            // Get the control
            const control = this.resetPasswordForm.get(field);

            if ( control && control.dirty && !control.valid )
            {
                this.resetPasswordFormErrors[field] = control.errors;
            }
        }
    }

    validateResetPasswordToken() {
        this.loading = true;
        this.resetPasswordInvalidToken = '';
        this.authService.validateResetPasswordToken(this.fToken).subscribe((response: any) => {
                   this.loading = false;
                   if(response.status == 'success'){
                       //this.msg.show(response.msg, 'success');
                   }else{
                       this.msg.show(response.msg, 'error');
                       this.resetPasswordInvalidToken = response.msg;
                   }
                }, err => {this.msg.show(err, 'error'); this.loading = false;});
        
    }
    changePassword(){
        this.loading = true;
        this.resetPasswordFormErrorsMsg = '';
        this.authService.resetPassword(this.resetPasswordForm.value.email, this.resetPasswordForm.value.password, this.fToken).subscribe((response: any) => {
                   this.loading = false;
                   if(response.status == 'success'){
                       this.msg.show(response.msg, 'success');
                       this.resetPasswordFormSuccessMsg = response.msg;
			    setTimeout(() => {
			        this.router.navigate(['/login']);
			    }, 2000);
                   }else{
                       this.msg.show(response.msg, 'error');
                       this.resetPasswordFormErrorsMsg = response.msg;
                       this.initResetForm();
                   }
                }, err => {this.msg.show(err, 'error'); this.loading = false;this.initResetForm();});
    }
}

function confirmPassword(control: AbstractControl)
{
    if ( !control.parent || !control )
    {
        return;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if ( !password || !passwordConfirm )
    {
        return;
    }

    if ( passwordConfirm.value === '' )
    {
        return;
    }

    if ( password.value !== passwordConfirm.value )
    {
        return {
            passwordsNotMatch: true
        };
    }
}

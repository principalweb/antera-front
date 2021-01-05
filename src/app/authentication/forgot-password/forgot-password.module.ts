import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FuseSharedModule } from '@fuse/shared.module';

import { AnteraForgotPasswordComponent } from './forgot-password.component';
import { ResetAuthService } from '../../core/services/reset-auth.service';
const routes = [
    {
        path     : 'forgot-password',
        component: AnteraForgotPasswordComponent
    }
];

@NgModule({
    declarations: [
        AnteraForgotPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FuseSharedModule,
    ],
    providers: [
        ResetAuthService
    ]
})
export class AnteraForgotPasswordModule
{
}

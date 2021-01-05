import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FuseSharedModule } from '@fuse/shared.module';

import { AnteraResetPasswordComponent } from './reset-password.component';
import { ResetAuthService } from '../../core/services/reset-auth.service';
const routes = [
    {
        path     : 'reset-password',
        component: AnteraResetPasswordComponent
    }
];

@NgModule({
    declarations: [
        AnteraResetPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FuseSharedModule
    ],
    providers: [
        ResetAuthService
    ]
})
export class AnteraResetPasswordModule
{
}

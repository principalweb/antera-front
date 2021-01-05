import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FuseSharedModule } from '@fuse/shared.module';

import { AnteraLoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { AuthGuardService } from './auth-guard.service';
import { HttpClientModule } from '@angular/common/http';
import { AwsComponent } from './aws/aws.component';

const routes = [
    {
        path     : 'login',
        component: AnteraLoginComponent
    },
    {
        path: 'aws-login',
        component: AwsComponent
    }

];

@NgModule({
    declarations: [
        AnteraLoginComponent,
        AwsComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        HttpClientModule,
        MatProgressSpinnerModule,
        FuseSharedModule
    ],
    providers: [
        AuthService,
        AuthGuardService
    ]
})
export class AnteraLoginModule
{
}

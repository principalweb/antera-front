import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

import { FuseSharedModule } from '@fuse/shared.module';

import { FuseGuidedSessionsComponent } from './sessions/sessions.component';
import { FuseGuidedSessionComponent } from './session/session.component';
import { GuidedSessionsService } from './sessions.service';
import { GuidedSessionService } from './session.service';

const routes = [
    {
        path     : '',
        component: FuseGuidedSessionsComponent,
        resolve  : {
            academy: GuidedSessionsService
        },
    },
    {
        path     : ':sessionId/:sessionSlug',
        component: FuseGuidedSessionComponent,
        resolve  : {
            academy: GuidedSessionService
        }
    },
    {
        path    : '**',
        redirectTo: ''
    }
];

@NgModule({
    declarations: [
        FuseGuidedSessionsComponent,
        FuseGuidedSessionComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSidenavModule,

        FuseSharedModule
    ],
    providers   : [
        GuidedSessionsService,
        GuidedSessionService
    ]
})
export class FuseGuidedSessionsModule
{
}

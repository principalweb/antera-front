import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { MailService } from './mail.service';
import { FuseMailComponent } from './mail.component';
import { FuseMailMainSidenavComponent } from './sidenavs/main/main-sidenav.component';
import { FuseMailListItemComponent } from './mail-list/mail-list-item/mail-list-item.component';
import { FuseMailListComponent } from './mail-list/mail-list.component';
import { FuseMailDetailsComponent } from './mail-details/mail-details.component';
import { HttpClientModule } from '@angular/common/http';
import { MailBodyComponent, SafeHtmlPipe } from './mail-details/mail-body/mail-body.component';
import { SharedModule } from 'app/shared/shared.module';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { FuseConfirmDialogModule, FuseSidebarModule } from '@fuse/components';

const routes: Routes = [
    {
        path     : '',
        component: FuseMailComponent,
        data: {
            helpModule: 'Mail'
        },
        resolve  : {
            mail: MailService
        }
    }
];

@NgModule({
    declarations   : [
        FuseMailComponent,
        FuseMailListComponent,
        FuseMailListItemComponent,
        FuseMailDetailsComponent,
        FuseMailMainSidenavComponent,
        SafeHtmlPipe,
        MailBodyComponent,
    ],
    imports        : [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatToolbarModule,
        TranslateModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatTooltipModule,
        
        HttpClientModule,
        FuseSidebarModule,
        FuseSharedModule,
        SharedModule,
        FuseConfirmDialogModule
    ],
    providers      : [
        AwsFileManagerService
    ],
    entryComponents: [
        MailCredentialsDialogComponent,
    ]
})
export class FuseMailModule
{
}

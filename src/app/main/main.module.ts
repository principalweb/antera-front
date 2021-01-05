import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseNavigationModule, FuseSearchBarModule, FuseShortcutsModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';

import { FuseContentModule } from './content/content.module';
import { FuseFooterModule } from './footer/footer.module';
import { FuseNavbarModule } from './navbar/navbar.module';
import { FuseQuickPanelModule } from './quick-panel/quick-panel.module';
import { FuseToolbarModule } from './toolbar/toolbar.module';

import { FuseMainComponent } from './main.component';
import { MailService } from './content/apps/mail/mail.service';
import { PermissionService } from 'app/core/services/permission.service';
import { QuickHelpModule } from './quick-help/quick-help.module';
import { MaterialModule } from "app/features/material/material/material.module";
import { ActivitySidenavComponent } from './activity-sidenav/activity-sidenav.component';

@NgModule({
    declarations: [
        FuseMainComponent,
        //ActivitySidenavComponent,
    ],
    imports     : [
        RouterModule,
        MaterialModule,
        MatSidenavModule,
        FuseSharedModule,
        FuseThemeOptionsModule,
        FuseNavigationModule,
        FuseSearchBarModule,
        FuseShortcutsModule,
        FuseSidebarModule,

        FuseContentModule,
        FuseFooterModule,
        FuseNavbarModule,
        FuseQuickPanelModule,
        QuickHelpModule,
        FuseToolbarModule,
    ],
    exports     : [
        FuseMainComponent
    ],
    providers      : [
        MailService,
        PermissionService,
    ],
})
export class FuseMainModule
{
}

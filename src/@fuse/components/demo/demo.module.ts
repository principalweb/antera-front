import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { FuseDemoContentComponent } from './demo-content/demo-content.component';
import { FuseDemoSidenavComponent } from './demo-sidenav/demo-sidenav.component';
import { FuseDemoSidebarComponent } from './demo-sidebar/demo-sidebar.component';

@NgModule({
    declarations: [
        FuseDemoContentComponent,
        FuseDemoSidenavComponent,
        FuseDemoSidebarComponent,
    ],
    imports     : [
        RouterModule,

        MatDividerModule,
        MatListModule
    ],
    exports     : [
        FuseDemoContentComponent,
        FuseDemoSidenavComponent,
        FuseDemoSidebarComponent,
    ]
})
export class FuseDemoModule
{
}

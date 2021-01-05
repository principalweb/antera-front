import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { NgxChartsModule } from '@swimlane/ngx-charts';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';

import { FuseProjectDashboardComponent } from './project.component';
import { ProjectDashboardService } from './project.service';
import { MarketingComponent } from './marketing/marketing.component';
import { FinanceComponent } from './finance/finance.component';
import { SharedModule } from 'app/shared/shared.module';
import { ManagementComponent } from './management/management.component';
import { ArtworkComponent } from './artwork/artwork.component';
import { GroupdashboardComponent } from './groupdashboard/groupdashboard.component';
import {RecevingComponent} from './receiving/receiving.component';
import { ExecutiveComponent } from './executive/executive.component';
import { ArtWorkTypeComponent } from './artwork-type/artwork-type.component';

const routes: Routes = [
    {
        path     : '',
        component: FuseProjectDashboardComponent,
        data: {
            helpModule: 'Home'
        },
        resolve  : {
            data: ProjectDashboardService
        }
    }
];

@NgModule({
    declarations: [
        FuseProjectDashboardComponent,
        MarketingComponent,
        FinanceComponent,
        ManagementComponent,
        ArtworkComponent,
        GroupdashboardComponent,
	RecevingComponent,
        ExecutiveComponent,
        ArtWorkTypeComponent        
    ],
    imports     : [
        RouterModule.forChild(routes),

        CdkTableModule,
        MatButtonModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatSelectModule,
        MatSidenavModule,
        MatTableModule,
        MatTabsModule,

        NgxChartsModule,

        FuseSharedModule,
        FuseWidgetModule,
        SharedModule
    ],
    providers   : [
        ProjectDashboardService
    ]
})
export class FuseProjectDashboardModule
{
}

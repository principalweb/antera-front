import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { NgxDnDModule } from '@swimlane/ngx-dnd';

import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';

import { OpportunitiesComponent } from './opportunities.component';
import { OpportunityListComponent } from './opportunity-list/opportunity-list.component';
import { OpportunitiesSelectedBarComponent } from './selected-bar/selected-bar.component';
import { OpportunitiesMainSidenavComponent } from './opportunity-sidebar/opportunity-sidebar.component';
import { FuseScrumboardBoardComponent } from './board/board.component';
import { FuseScrumboardBoardListComponent, ReasonForLossInputDialogComponent } from './board/list/list.component';
import { FuseScrumboardBoardEditListNameComponent } from './board/list/edit-list-name/edit-list-name.component';
import { FuseScrumboardBoardCardComponent } from './board/list/card/card.component';
import { FuseScrumboardBoardAddListComponent } from './board/add-list/add-list.component';
import { FuseScrumboardEditBoardNameComponent } from './board/edit-board-name/edit-board-name.component';
import { OpportunitiesService } from 'app/core/services/opportunities.service';
import { SourcesService } from 'app/core/services/sources.service';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { PermissionService } from 'app/core/services/permission.service';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { OpportunityFormDialogComponent, ReasonForLossFormDialogComponent } from './opportunity-form/opportunity-form.component';

const routes: Routes = [
    {
        path: '',
        component: OpportunitiesComponent,
        data: {
            helpModule: 'CRM',
        },
        resolve: {
            contacts: OpportunitiesService
        }
    },
    {
        path: ':id',
        component: OpportunitiesComponent,
        data: {
            helpModule: 'CRM',
            shouldReuseRoute: false,
        },
        resolve  : {
            contacts: OpportunitiesService
        }
    }
];

@NgModule({
    declarations   : [
        OpportunitiesComponent,
        OpportunityListComponent,
        OpportunitiesSelectedBarComponent,
        OpportunitiesMainSidenavComponent,
        FuseScrumboardBoardComponent,
        FuseScrumboardBoardListComponent,
        FuseScrumboardBoardEditListNameComponent,
        FuseScrumboardBoardCardComponent,
        FuseScrumboardBoardAddListComponent,
        FuseScrumboardEditBoardNameComponent,
        ReasonForLossInputDialogComponent,
        ReasonForLossFormDialogComponent
    ],
    imports        : [
        RouterModule.forChild(routes),
        CdkTableModule,

        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTabsModule,
        MatOptionModule,
        MatSelectModule,
        ChartsModule,
        NgxChartsModule,
        NgxDnDModule,

        FuseSharedModule,
        SharedModule,
        FuseConfirmDialogModule
    ],
    providers      : [
        OpportunitiesService,
        AwsFileManagerService,
        PermissionService,
        AccountsService
    ],
    entryComponents : [
        ReasonForLossInputDialogComponent,
        ReasonForLossFormDialogComponent
    ]
})
export class OpportunitiesModule
{
}

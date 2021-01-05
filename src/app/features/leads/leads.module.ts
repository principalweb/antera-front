import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
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

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';

import { FuseLeadsComponent } from './leads.component';
import { LeadsService } from './leads.service';
import { LeadsFormComponent } from './leads-form/leads-form.component';
import { FuseLeadsListComponent } from './leads-list/leads-list.component';
import { FuseConfirmDialogModule } from '@fuse/components';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { SharedModule } from 'app/shared/shared.module';
import { OpportunitiesService } from 'app/core/services/opportunities.service';
import { OpportunityFormDialogComponent } from '../opportunities/opportunity-form/opportunity-form.component';
import { ConvertLeadFormComponent } from './convert-lead-form/convert-lead-form.component';
import { PermissionService } from 'app/core/services/permission.service';
import { AwsFileManagerService } from 'app/core/services/aws.service';

const routes: Routes = [
    {
        path: '',
        component: FuseLeadsComponent,
        data: {
            helpModule: 'Leads',
        },
        resolve: {
            data: LeadsService
        }
    },
    {
        path: ':id',
        component: FuseLeadsComponent,
        data: {
            helpModule: 'Leads',
            shouldReuseRoute: false
        },
        resolve: {
            data: LeadsService
        }
    }
];

@NgModule({
    declarations: [
        FuseLeadsComponent,
        LeadsFormComponent,
        ConvertLeadFormComponent,
        FuseLeadsListComponent
    ],
    imports     : [
        RouterModule.forChild(routes),

        CdkTableModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatChipsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatCheckboxModule,
        MatMenuModule,
        MatTooltipModule,
        MatToolbarModule,
        FuseConfirmDialogModule, 
        MatSidenavModule,
        MatProgressSpinnerModule,
        ChartsModule,
        NgxChartsModule,
        
        FuseSharedModule,
        FuseWidgetModule,
        SharedModule
    ],
    providers   : [
        LeadsService,
        OpportunitiesService,
        PermissionService,
        AwsFileManagerService
    ],
    entryComponents: [LeadsFormComponent, OpportunityFormDialogComponent, ConvertLeadFormComponent]
})
export class LeadsModule
{
}

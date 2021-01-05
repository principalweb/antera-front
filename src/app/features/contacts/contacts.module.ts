import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule, FuseWidgetModule } from '@fuse/components';
import { SharedModule } from '../../shared/shared.module';

import { FuseContactsMainSidenavComponent } from './sidenavs/main/main.component';
import { FuseContactsComponent } from './contacts.component';
import { ContactsService } from '../../core/services/contacts.service';
import { FuseContactsContactListComponent } from './contact-list/contact-list.component';
import { FuseContactsSelectedBarComponent } from './selected-bar/selected-bar.component';
import { ContactResolverService } from './contact-resolver.service';
import { ContactDashboardComponent } from './contact-dashboard/contact-dashboard.component';
import { ContactOverviewTabComponent } from './contact-dashboard/contact-overview-tab/contact-overview-tab.component';
import { ContactActivityListComponent } from './contact-dashboard/contact-activity-list/contact-activity-list.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ProjectDashboardService } from '../dashboards/project/project.service';
import { PermissionService } from 'app/core/services/permission.service';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { CustomerPortalSettingsComponent } from './contact-dashboard/customer-portal-settings/customer-portal-settings.component';

import { customerPortalPermissionAPIService } from 'app/core/services/customerPortalPermissionAPI.service';
const routes: Routes = [
    {
        path     : '',
        component: FuseContactsComponent,
        data: {
            helpModule: 'Contacts',
        },
        resolve  : {
            contacts: ContactsService
        }
    },
    {
        path     : ':id',
        component: ContactDashboardComponent,
        data: {
            helpModule: 'Contacts',
            shouldReuseRoute: false,
        },
        resolve  : {
            contacts: ContactResolverService
        }
    }
];

@NgModule({
    declarations   : [
        FuseContactsComponent,
        FuseContactsContactListComponent,
        FuseContactsSelectedBarComponent,
        FuseContactsMainSidenavComponent,
        ContactDashboardComponent,
        ContactOverviewTabComponent,
        ContactActivityListComponent,
        CustomerPortalSettingsComponent
    ],
    imports        : [
        RouterModule.forChild(routes),
        CdkTableModule,

        MatButtonModule,
        MatCheckboxModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatRadioModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatToolbarModule,
        MatTabsModule,
        MatAutocompleteModule,
        MatCardModule,
        MatChipsModule,
        MatSlideToggleModule,

        NgxChartsModule,
        FuseWidgetModule,
        
        FuseSharedModule,
        FuseConfirmDialogModule,
        SharedModule
    ],
    providers      : [
        ContactsService,
        ContactResolverService,
        ProjectDashboardService,
        PermissionService,
        AwsFileManagerService,
        customerPortalPermissionAPIService
    ]
})
export class FuseContactsModule
{
}

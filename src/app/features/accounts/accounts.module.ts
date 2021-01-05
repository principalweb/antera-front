import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { MatTooltipModule } from '@angular/material/tooltip';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';
import { SharedModule } from '../../shared/shared.module';

import { FuseAccountsMainSidenavComponent } from './components/sidenavs/main/main.component';
import { FuseAccountListComponent } from './account-list/account-list.component';
import { FuseAccountTableComponent } from './components/account-table/account-table.component';
import { AccountFormComponent } from './components/account-form/account-form.component';
import { AccountDetailsDialogComponent } from './components/account-details-dialog/account-details-dialog.component';
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { GenericErrorComponent } from './components/generic-error/generic-error.component';

import { NotificationGroupsService } from './notification-groups/notification-groups-resources/notification-groups.service';
import { VendorsService } from './vendor-aliases/vendor-aliases-resources/vendors.service';
import { AccountsService } from './accounts.service';
import { AccountListResolverService } from './account-list-resolver.service';
import { AccountResolverService } from './account-resolver.service';
import { OverviewTabComponent, ContactCreateConfirmComponent } from './components/overview-tab/overview-tab.component';
import { AdditionalInfoComponent } from './components/additional-info/additional-info.component';
import { AdminSettingsComponent } from './components/admin-settings/admin-settings.component';
import { FormatNPipe } from './format-n.pipe';
import { AccountFilesDocViewerComponent } from './components/account-files-doc-viewer/account-files-doc-viewer.component';
import { ContactsSelectDialogComponent } from './components/contacts-select-dialog/contacts-select-dialog.component';
import { ContactListsComponent } from './components/contact-lists/contact-lists.component';
import { ContactsService } from 'app/core/services/contacts.service';
import { RelatedContactListsComponent } from './components/related-contact-lists/related-contact-lists.component';
import { OpportunitiesService } from 'app/core/services/opportunities.service';
import { AccountActivityListComponent } from './components/account-activity-list/account-activity-list.component';
//import { UploadAwsFileService } from './upload-aws-file.service';
//import { AccountAwsFilesComponent } from './components/account-aws-files/account-aws-files.component';
//import { AccountCreateAwsDirComponent } from './components/account-create-aws-dir/account-create-aws-dir.component';
//import { AccountAwsDocViewerComponent } from './components/account-aws-doc-viewer/account-aws-doc-viewer.component';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { PermissionService } from 'app/core/services/permission.service';
import { BalanceInfoComponent } from './components/balance-info/balance-info.component';
import { FuseArtworksListModule } from '../artworks/artworks-list/artworks-list.module';
import { VendorDecorationPriceStrategyComponent } from './components/vendor-decoration-price-strategy/vendor-decoration-price-strategy.component';
import { LocationListComponent } from './components/location-list/location-list.component';
import { LocationsService } from '../locations/locations.service';
import { LocationsSharedModule } from '../locations/locations-shared.module';
import { PopupNotesDialogComponent } from 'app/shared/popup-notes-dialog/popup-notes-dialog.component';
import { VendorAliasesFormComponent } from './vendor-aliases/vendor-aliases-form/vendor-aliases-form.component';
import { VendorAliasesListComponent } from './vendor-aliases/vendor-aliases-list/vendor-aliases-list.component';
import { NotificationGroupsListComponent } from './notification-groups/notification-groups-list/notification-groups-list.component';
import { NotificationGroupsFormComponent } from './notification-groups/notification-groups-form/notification-groups-form.component';

 
const routes: Routes = [
    {
        path: '',
        component: FuseAccountListComponent,
        data: {
            helpModule: 'Accounts',
        },
        resolve  : {
            data: AccountListResolverService
        }
    },
    {
        path: ':account_id',
        component: AccountDashboardComponent,
        data: {
            helpModule: 'Accounts',
            shouldReuseRoute: false,
        },
        resolve: {
            data: AccountResolverService
        }
    },
    {
        path: 'vendor/aliases',
        component: VendorAliasesListComponent,
        data: {
            helpModule: 'Accounts',
            shouldReuseRoute: false,
        }
    },
    {
        path: 'vendor/aliases/success',
        component: VendorAliasesListComponent,
        data: {
            helpModule: 'Accounts',
            shouldReuseRoute: false,
        }
    },
    {
        path: 'vendor/aliases/add',
        component: VendorAliasesFormComponent,
        data: {
            helpModule: 'Accounts',
            shouldReuseRoute: false,
        }
    },
    {
        path: 'vendor/aliases/edit/:name',
        component: VendorAliasesFormComponent,
        data: {
            helpModule: 'Accounts',
            shouldReuseRoute: false,
        }
    },

    {
        path:'notification/groups',
        component: NotificationGroupsListComponent,
        data: {
            helpModule: 'Accounts',
            shouldReuseRoute: false,
        }
    },
    
    {
        path: 'notification/groups/add',
        component: NotificationGroupsFormComponent,
        data: {
            helpModule: 'Accounts',
            shouldReuseRoute: false,
        }
    },
    {
        path: 'notification/groups/edit/:id',
        component: NotificationGroupsFormComponent,
        data: {
            helpModule: 'Accounts',
            shouldReuseRoute: false,
        }
    },
    
    
];

@NgModule({
    declarations   : [
        FuseAccountListComponent,
        FuseAccountTableComponent,
        FuseAccountsMainSidenavComponent,
        //AccountFormComponent,
        //AccountDetailsDialogComponent,
        AccountDashboardComponent,
        OverviewTabComponent,
        AdditionalInfoComponent,
        AdminSettingsComponent,
        FormatNPipe,
        GenericErrorComponent,
        AccountFilesDocViewerComponent,
        ContactsSelectDialogComponent,
        ContactListsComponent,
        RelatedContactListsComponent,
        AccountActivityListComponent,
        ContactCreateConfirmComponent,
        BalanceInfoComponent,
        VendorDecorationPriceStrategyComponent,
        LocationListComponent,
        VendorAliasesFormComponent,
        VendorAliasesListComponent,
        NotificationGroupsListComponent,
        NotificationGroupsFormComponent
        //AccountAwsFilesComponent,
        //AccountCreateAwsDirComponent,
        //AccountAwsDocViewerComponent,
    ],
    imports        : [
        RouterModule.forChild(routes),
        CdkTableModule,
        ChartsModule,
        NgxChartsModule,
        MatAutocompleteModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSortModule,
        MatTabsModule,
        MatTableModule,
        MatToolbarModule,
        MatTooltipModule,
        MatRadioModule,
        NgxDocViewerModule,
        FuseSharedModule,
        FuseConfirmDialogModule,
        FuseArtworksListModule,
        SharedModule,
        LocationsSharedModule,
        MatChipsModule
    ],
    providers      : [
        AccountsService,
        AccountListResolverService,
        AccountResolverService,
        ContactsService,
        OpportunitiesService,
        AwsFileManagerService,
        PermissionService,
        VendorsService,
        NotificationGroupsService
        //UploadAwsFileService
    ],
    entryComponents: [
        //AccountDetailsDialogComponent,
        ContactsSelectDialogComponent,
        ContactCreateConfirmComponent,
        PopupNotesDialogComponent
        //AccountCreateAwsDirComponent,
        //AccountAwsDocViewerComponent,
    ]
})
export class FuseAccountsModule
{
}

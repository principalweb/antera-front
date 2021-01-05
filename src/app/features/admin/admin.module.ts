import { AnteraProductRepoEffects } from './connectors/antera-product-repo/store/antera-product-repo.effects';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {DatePipe} from '@angular/common';

import { FuseSharedModule } from '@fuse/shared.module';
import { ManageMenuComponent } from './manage-menu/manage-menu.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTableModule } from '@angular/cdk/table';
import { ExecutiveComponent } from './executive/executive.component';
import { ManageMenuService } from './manage-menu/manage-menu.service';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { CurrencyComponent } from './currency/currency.component';
import { ManageCurrencyComponent } from './manage-currency/manage-currency.component';
import { CurrencyRowComponent } from './currency-row/currency-row.component';
import { FuseConfirmDialogModule, FuseMaterialColorPickerModule } from '@fuse/components';
import { AdminService } from './admin.service';
import { RoyaltyService } from './royalty/royalty.service';
import { ReportSettingService } from './report-settings/report-settings.service';
import { ManageRatesComponent } from './manage-rates/manage-rates.component';
import { OrdersComponent } from './orders/orders.component';
import { SystemConfigTabComponent } from './system-config-tab/system-config-tab.component';
import { ImportsComponent } from './imports/imports.component';
import { AccountsImportComponent } from './imports/accounts-import/accounts-import.component';
import { ContactsImportComponent } from './imports/contacts-import/contacts-import.component';
import { DecoChargesImportComponent } from './imports/deco-charges-import/deco-charges-import.component';
import { ProductsImportComponent } from './imports/products-import/products-import.component';
import { ConnectorsComponent } from './connectors/connectors.component';
import { QboComponent } from './connectors/qbo/qbo.component';
import { CognitoComponent } from './connectors/cognito/cognito.component';
import { PurgeRecordsComponent } from './purge-records/purge-records.component';
import { ModulesPurgeRecordsComponent } from './purge-records/modules-purge-records/modules-purge-records.component';
import { DocumentConfigComponent } from './document-config/document-config.component';
import { RoyaltyFranchiseComponent } from './royalty/royalty-franchise/royalty-franchise.component';
import { FranchiseListComponent } from './royalty/franchise-list/franchise-list.component';
import { RoyaltyCapsComponent } from './royalty/royalty-caps/royalty-caps.component';
import { RoyaltyComponent } from './royalty/royalty.component';
import { CapDetailsComponent } from './royalty/royalty-caps/cap-details/cap-details.component';
import { CapListComponent } from './royalty/royalty-caps/cap-list/cap-list.component';
import { PartnerComponent } from './partner/partner.component';
import { PartnerFormComponent } from './partner/partner-form/partner-form.component';
import { PartnerListComponent } from './partner/partner-list/partner-list.component';
import { ProductConfigurationComponent } from './product-configuration/product-configuration.component';
import { RoyaltyReportsComponent } from './royalty/royalty-reports/royalty-reports.component';
import { InvoiceReportComponent } from './royalty/royalty-reports/invoice-report/invoice-report.component';
import { OpenOrderReportComponent } from './royalty/royalty-reports/open-order-report/open-order-report.component';
import { SummaryReportComponent } from './royalty/royalty-reports/summary-report/summary-report.component';
import { AdjustedOrderReportComponent } from './royalty/royalty-reports/adjusted-order-report/adjusted-order-report.component';
import { FranchiseVendorReportComponent } from './royalty/royalty-reports/franchise-vendor-report/franchise-vendor-report.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { PermissionsDetailsComponent } from './permissions/permissions-details/permissions-details.component';
import { PermissionsListComponent } from './permissions/permissions-list/permissions-list.component';
import { PermissionResolverService } from './permissions/permission-resolver.service';
import { PermissionModuleResolverService } from './permissions/permission-module-resolver.service';
import { PermissionService } from 'app/core/services/permission.service';
import { PermissionsEntityTypeComponent } from './permissions/permissions-details/permissions-entity-type/permissions-entity-type.component';
import { PermissionsUserComponent } from './permissions/permissions-details/permissions-user/permissions-user.component';
import { PermissionsEntityComponent } from './permissions/permissions-details/permissions-entity/permissions-entity.component';
import { PermissionsActionComponent } from './permissions/permissions-details/permissions-action/permissions-action.component';
import { AddUserDialogComponent } from './permissions/permissions-details/add-user-dialog/add-user-dialog.component';
import { AddGroupDialogComponent } from './permissions/add-group-dialog/add-group-dialog.component';
import { ReportSettingsComponent, EditDialogComponent } from './report-settings/report-settings.component';
import { EditGroupNameDialogComponent } from './permissions/permissions-list/edit-group-name-dialog/edit-group-name-dialog.component';
import { ArtworksImportComponent } from './imports/artworks-import/artworks-import.component';
import { SiteComponent } from './imports/site/site.component';
import { SuperSummaryReportComponent } from './royalty/royalty-reports/super-summary-report/super-summary-report.component';
import { PermissionsModulesComponent } from './permissions/permissions-modules/permissions-modules.component';
import { VoidMinusReportComponent } from './royalty/royalty-reports/void-minus-report/void-minus-report.component';
import { PermissionsHierarchyComponent } from './permissions/permissions-details/permissions-hierarchy/permissions-hierarchy.component';
import { PermissionsModuleOptionsComponent } from './permissions/permissions-module-options/permissions-module-options.component';
import { PermissionsOptionsListComponent } from './permissions/permissions-module-options/permissions-options-list/permissions-options-list.component';
import { DocumentPdfModule } from '../documents/document-pdf/document-pdf.module';
import { PromoComponent } from './connectors/promo/promo.component';
import { PromoShipmapComponent } from './connectors/promo/promo-shipmap/promo-shipmap.component';
import { PromoShipmapEditComponent } from './connectors/promo/promo-shipmap-edit/promo-shipmap-edit.component';
import { XeroComponent } from './connectors/xero/xero.component';
import { LeadsImportComponent } from './imports/leads-import/leads-import.component';
import { AnteraProductRepoComponent } from './connectors/antera-product-repo/antera-product-repo.component';
import { AnteraProductRepoListComponent} from './connectors/antera-product-repo/antera-product-repo-list/antera-product-repo-list.component';
import { AnteraProductRepoFormComponent} from './connectors/antera-product-repo/antera-product-repo-form/antera-product-repo-form.component';
import * as fromAnteraProductRepo from './connectors/antera-product-repo/store/antera-product-repo.reducer';
import { PortalSettingsComponent } from './portal-settings/portal-settings.component';
import { AmazonS3SettingsComponent } from './amazon-s3-settings/amazon-s3-settings.component';
import { ShopifySettingsComponent } from './shopify-settings/shopify-settings.component';
import { DropboxSettingsComponent } from './dropbox-settings/dropbox-settings.component';
import { ExchangeRateListComponent } from './currency/exchange-rate-list/exchange-rate-list.component';
import { AdditionalChargesImportComponent } from './imports/additional-charges-import/additional-charges-import.component';
import { DecoLocationsImportComponent } from './imports/deco-locations-import/deco-locations-import.component';
import { UsersImportComponent } from './imports/users-import/users-import.component';
import { OpportunitiesImportComponent } from './imports/opportunities-import/opportunities-import.component';
import { CommissionPlansImportComponent } from './imports/commission-plans-import/commission-plans-import.component';

const routes = [
    {
        path     : 'manage-menu',
        component: ManageMenuComponent,
        data: {
            helpModule: 'Admin'
        },
        resolve  : {
            data: ManageMenuService
        }
    },
    {
        path     : 'executive',
        component: ExecutiveComponent,
        data: {
            helpModule: 'Admin'
        },
    },
    {
        path        : 'documents',
        loadChildren: () => import('./documents/documents.module').then(m => m.DocumentsModule)
    },
    {
        path     : 'antera-settings',
        component: SettingsComponent,
        data: {
            helpModule: 'Admin'
        },
    },
    {
        path        : 'decoration-fees',
        data: {
            helpModule: 'Decoration Fees',
        },
        loadChildren: () => import('./decoration-fees/decoration-fees.module').then(m => m.DecorationFeesModule)
    },
    {
        path: 'currency',
        component: CurrencyComponent
    },
    {
        path     : 'imports',
        component: ImportsComponent,
        data: {
            helpModule: 'Imports'
        },
    },
    {
        path     : 'purge-records',
        component: PurgeRecordsComponent,
        data: {
            helpModule: 'Admin'
        },
    },
    {
        path     : 'royalty',
        component: RoyaltyComponent,
        data: {
            helpModule: 'Admin'
        },
        resolve  : {
            data: RoyaltyService
        }
    },
    {
        path     : 'royalty/royalty-reports',
//        path     : 'royalty/royalty-reports/:franchiseId/:reportName/:fromDate/:toDate/:createdBy',
        component: RoyaltyReportsComponent,
        data: {
            helpModule: 'Admin'
        },
    },
    {
        path     : 'config',
        data: {
            helpModule: 'Configuration'
        },
        loadChildren: () => import('./customer-admin-config/customer-admin-config.module').then(m => m.CustomerAdminConfigModule)
    },
    {
        path        : 'commissions',
        loadChildren: () => import('./commissions/commissions.module').then(m => m.CommissionsModule)
    },
    {
        path     : 'permissions',
        component: PermissionsComponent,
        data: {
            helpModule: 'Admin'
        },
    },
    {
        path: 'permissions/:id',
        component: PermissionsDetailsComponent,
        data: {
            helpModule: 'Admin'
        },
        resolve: {
            data: PermissionResolverService
        }
    },
    {
        path: 'email-templates',
        loadChildren: () => import('./email-templates/email-templates.module').then(m => m.EmailTemplatesModule)
    },
    {
        path: 'permissions-module-options/:id',
        component: PermissionsModuleOptionsComponent,
        data: {
            helpModule: 'Admin'
        },
        resolve: {
            data: PermissionModuleResolverService
        }
    },

];

@NgModule({
    imports     : [
        FuseSharedModule,
        RouterModule.forChild(routes),
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTabsModule,
        CommonModule,
        MatCardModule,
        MatExpansionModule,
        CdkTableModule,
        FuseConfirmDialogModule,
        FuseMaterialColorPickerModule,
        MatDialogModule,
        MatPaginatorModule,
        MatSortModule,
        MatTableModule,
        MatChipsModule,
        MatMenuModule,
        MatToolbarModule,
        MatTooltipModule,
        DocumentPdfModule,
        /* StoreModule.forRoot({anteraProductRepo: fromAnteraProductRepo.reducer}, { runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true }}),
        EffectsModule.forRoot([AnteraProductRepoEffects]), */
        StoreModule.forFeature('anteraProductRepo', fromAnteraProductRepo.reducer),
        EffectsModule.forFeature([AnteraProductRepoEffects]),        
    ],
    declarations: [
        ManageMenuComponent,
        ExecutiveComponent,
        SettingsComponent,
        CurrencyComponent,
        ManageCurrencyComponent,
        CurrencyRowComponent,
        ManageRatesComponent,
        OrdersComponent,
        SystemConfigTabComponent,
        ImportsComponent,
        AccountsImportComponent,
        ContactsImportComponent,
        DecoChargesImportComponent,
        ProductsImportComponent,
        ConnectorsComponent,
        CognitoComponent,
        QboComponent,
        PurgeRecordsComponent,
        ModulesPurgeRecordsComponent,
        DocumentConfigComponent,
        RoyaltyFranchiseComponent,
        FranchiseListComponent,
        RoyaltyCapsComponent,
        RoyaltyComponent,
        CapDetailsComponent,
        CapListComponent,
        PartnerComponent,
        PartnerFormComponent,
        PartnerListComponent,
        ProductConfigurationComponent,
        RoyaltyReportsComponent,
        InvoiceReportComponent,
        OpenOrderReportComponent,
        SummaryReportComponent,
        AdjustedOrderReportComponent,
        FranchiseVendorReportComponent,
        PermissionsComponent,
        PermissionsDetailsComponent,
        PermissionsListComponent,
        PermissionsEntityTypeComponent,
        PermissionsUserComponent,
        PermissionsEntityComponent,
        PermissionsActionComponent,
        AddUserDialogComponent,
        AddGroupDialogComponent,
        ReportSettingsComponent,
        EditDialogComponent,
        EditGroupNameDialogComponent,
        ArtworksImportComponent,
        SiteComponent,
        SuperSummaryReportComponent,
        PermissionsModulesComponent,
        VoidMinusReportComponent,
        PermissionsHierarchyComponent,
        PermissionsModuleOptionsComponent,
        PermissionsOptionsListComponent,
        PromoComponent,
        PromoShipmapComponent,
        PromoShipmapEditComponent,
        XeroComponent,
        LeadsImportComponent,
        AnteraProductRepoComponent,
        AnteraProductRepoListComponent,
        AnteraProductRepoFormComponent,
        PortalSettingsComponent,
        AmazonS3SettingsComponent,
        ShopifySettingsComponent,
        DropboxSettingsComponent,
        ExchangeRateListComponent,
        AdditionalChargesImportComponent,
        DecoLocationsImportComponent,
        UsersImportComponent,
        OpportunitiesImportComponent,
        CommissionPlansImportComponent,
    ],
    entryComponents: [
        RoyaltyFranchiseComponent,
        RoyaltyCapsComponent,
        CapDetailsComponent,
        CapListComponent,
        PartnerFormComponent,
        RoyaltyReportsComponent,
        InvoiceReportComponent,
        OpenOrderReportComponent,
        SummaryReportComponent,
        AdjustedOrderReportComponent,
        FranchiseVendorReportComponent,
        AddUserDialogComponent,
        AddGroupDialogComponent,
        EditGroupNameDialogComponent,
        EditDialogComponent,
        PromoShipmapComponent,
        PromoShipmapEditComponent,
        AnteraProductRepoFormComponent,
        PortalSettingsComponent,
        AmazonS3SettingsComponent,
        ShopifySettingsComponent,
        DropboxSettingsComponent,
    ],
    providers: [
        DatePipe,
        ManageMenuService,
        RoyaltyService,
        ReportSettingService,
        AdminService,
        PermissionResolverService,
        PermissionModuleResolverService,
        PermissionService
    ]
})
export class AdminModule
{
}

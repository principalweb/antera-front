import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes, RouteReuseStrategy, PreloadAllModules } from '@angular/router';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { CoreModule } from './core/core.module';
import { fuseConfig } from './fuse-config';
import { AppComponent } from './app.component';
import { FuseFakeDbService } from './fuse-fake-db/fuse-fake-db.service';
import { FuseMainModule } from './main/main.module';
import { AppStoreModule } from './store/store.module';
import { FuseMainComponent } from './main/main.component';
import { AnteraLoginModule } from './authentication/login/login.module';
import { AuthGuardService } from './authentication/login/auth-guard.service';
import { RequestCache } from './core/services/request-cache.service';
import { PermissionInterceptor } from './core/services/interceptors/permission-interceptor.service';
import { EmailInterceptor } from './core/services/interceptors/email-interceptor.service';
import { CanDeactivateGuard } from './guards/can-deactivate.guard';
import { AuthInterceptor } from './core/services/auth-interceptor.service';
import { AnteraLockModule } from './authentication/lock/lock.module';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'environments/environment';
import { AnteraForgotPasswordModule } from './authentication/forgot-password/forgot-password.module';
import { AnteraResetPasswordModule } from './authentication/reset-password/reset-password.module';
import { StoreRouterConnectingModule } from '@ngrx/router-store';


const appRoutes: Routes = [
    {
        path: 'kpi',
        loadChildren: () => import('./features/kpi-dashboard/kpi-dashboard.module').then(m => m.KpiDashboardModule)
    },
    {
        path: '',
        component: FuseMainComponent,
        children: [
            {
                path: 'admin',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
            },
            {
                path: 'apps',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./main/content/apps/apps.module').then(m => m.FuseAppsModule)
            },
            {
                path: 'pages',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./main/content/pages/pages.module').then(m => m.FusePagesModule)
            },
            {
                path: 'ui',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./main/content/ui/ui.module').then(m => m.FuseUIModule)
            },
            {
                path: 'services',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./main/content/services/services.module').then(m => m.FuseServicesModule)
            },
            {
                path: 'components',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./main/content/components/components.module').then(m => m.FuseComponentsModule)
            },
            {
                path: 'components-third-party',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./main/content/components-third-party/components-third-party.module').then(m => m.FuseComponentsThirdPartyModule)
            },
            {
                path: 'accounts',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./features/accounts/accounts.module').then(m => m.FuseAccountsModule)
            },
            {
                path: 'contacts',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./features/contacts/contacts.module').then(m => m.FuseContactsModule)
            },
            {
                path: 'leads',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./features/leads/leads.module').then(m => m.LeadsModule)
            },
            {
                path: 'receiving',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./features/receivings/receivings.module').then(m => m.FuseReceivingsModule)
            },
            {
                path: 'team-members',
                canLoad: [AuthGuardService],
                loadChildren: () => import('./features/team-members/team-members.module').then(m => m.TeamMembersModule)
            },
            {
                path: 'webstore',
                loadChildren: () => import('./features/store/store.module').then(m => m.StoreModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'tag',
                loadChildren: () => import('./features/tag/tag.module').then(m => m.TagModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'workflow',
                loadChildren: () => import('./features/workflow/workflow.module').then(m => m.FuseWorkflowModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'reports',
                loadChildren: () => import('./features/reports/report.module').then(m => m.FuseReportModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'users',
                loadChildren: () => import('./features/users/users.module').then(m => m.FuseUsersModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'settings',
                loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'activities',
                loadChildren: () => import('./features/activities/activities.module').then(m => m.ActivitiesModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'file-manager',
                loadChildren: () => import('./features/file-manager/file-manager.module').then(m => m.FileManagerModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'guided-sessions',
                loadChildren: () => import('./features/guided-sessions/guided-sessions.module').then(m => m.FuseGuidedSessionsModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'locations',
                loadChildren: () => import('./features/locations/locations.module').then(m => m.FuseLocationsModule),
                canLoad: [AuthGuardService],

            },
            {
                path: 'projects',
                loadChildren: () => import('./features/projects/projects.module').then(m => m.FuseProjectsModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'cases',
                loadChildren: () => import('./features/cases/cases.module').then(m => m.FuseCasesModule),
                canLoad: [AuthGuardService],
            },
            {
                path: 'dashboard',
                loadChildren: () => import('./features/dashboards/project/project.module').then(m => m.FuseProjectDashboardModule),
                canLoad: [AuthGuardService]
            },
            {
                path: 'artworks',
                loadChildren: () => import('./features/artworks/artworks.module').then(m => m.FuseArtworksModule),
                canLoad: [AuthGuardService]
            },
            {
                path: 'payment',
                loadChildren: () => import('./features/payment/payment.module').then(m => m.FusePaymentModule)
            },
            {
                path: 'opportunities',
                loadChildren: () => import('./features/opportunities/opportunities.module').then(m => m.OpportunitiesModule),
                canLoad: [AuthGuardService]
            },
            {
                path: 'logistics',
                loadChildren: () => import('./features/logistics/logistics.module').then(m => m.LogisticsModule),
                canLoad: [AuthGuardService]
            },
            {
                path: 'e-commerce',
                loadChildren: () => import('./features/e-commerce/e-commerce.module').then(m => m.FuseEcommerceModule),
                canLoad: [AuthGuardService]
            },
            {
                path: 'productions',
                loadChildren: () => import('./features/productions/productions.module').then(m => m.FuseProductionsModule),
                canLoad: [AuthGuardService]
            },
            {
                path: 'faqs',
                loadChildren: () => import('./features/faqs/faq.module').then(m => m.FaqModule),
                canLoad: [AuthGuardService]
            },
            {
                path: 'support-tickets',
                loadChildren: () => import('./features/support-tickets/support-tickets.module').then(m => m.SupportTicketsModule),
                canLoad: [AuthGuardService]
            },
            {
                path: 'external',
                loadChildren: () => import('./features/external/external.module').then(m => m.ExternalModule),
            },
            {
                path: 'vouchings',
                loadChildren: () => import('./features/vouchings/vouchings.module').then(m => m.VouchingsModule),
                canLoad: [AuthGuardService]
            },
            {
                path: 'ap-credit',
                loadChildren: () => import('./features/ap-credit/ap-credit.module').then(m => m.ApCreditModule),
                canLoad: [AuthGuardService]
            },
            {
                path: '**',
                redirectTo: '/dashboard'
            }
        ]
    }
];

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const config: SocketIoConfig = { url: environment.socketAddress, options: {autoConnect: false, path: environment.socketPath}};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        StoreRouterConnectingModule,
        StoreRouterConnectingModule.forRoot(),
        RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules }),
        CoreModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        InMemoryWebApiModule.forRoot(FuseFakeDbService, {
            delay: 0,
            passThruUnknownUrl: true
        }),

        // Fuse Main and Shared modules
        FuseModule.forRoot(fuseConfig),
        FuseSharedModule,
        AnteraLoginModule,
        AnteraLockModule,
        AnteraForgotPasswordModule,
        AnteraResetPasswordModule,
        AppStoreModule,
        FuseMainModule,
        SocketIoModule.forRoot(config),
    ],
    bootstrap: [
        AppComponent
    ],
    providers: [
        RequestCache,
        { provide: HTTP_INTERCEPTORS, useClass: PermissionInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: EmailInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        CurrencyPipe,
        DecimalPipe,
        DatePipe,
        CanDeactivateGuard,
        // { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    ],
})
export class AppModule {
}

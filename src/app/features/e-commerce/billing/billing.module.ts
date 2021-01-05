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
import { FuseEcommerceModule } from '../e-commerce.module';
import { BillingComponent } from './billing.component';
import { BillingListComponent } from './billing-list/billing-list.component';
import { FuseScrumboardBoardListComponent } from './board/list/list.component';
import { FuseScrumboardBoardEditListNameComponent } from './board/list/edit-list-name/edit-list-name.component';
import { FuseScrumboardBoardCardComponent } from './board/list/card/card.component';
import { FuseScrumboardBoardAddListComponent } from './board/add-list/add-list.component';
import { FuseScrumboardEditBoardNameComponent } from './board/edit-board-name/edit-board-name.component';
import { FuseScrumboardBoardComponent } from './board/board.component';
import { SharedModule } from 'app/shared/shared.module';
import { EcommerceBillingService } from 'app/core/services/billing.service';
import { EcommerceOrderService } from '../order.service';
import { BillingDetailsComponent } from './billing-details/billing-details.component';
import { BillingResolverService } from './billing-resolver.service';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { EmailVendorsDialogComponent } from './email-vendors-dialog/email-vendors-dialog.component';
import { CreateFactoryDialogComponent } from './create-factory-dialog/create-factory-dialog.component';

import { BillingRoutingModule } from './billing-routing.module';


@NgModule({
    declarations   : [
        BillingComponent,
        BillingListComponent,
        BillingDetailsComponent,
        FuseScrumboardBoardComponent,
        FuseScrumboardBoardListComponent,
        FuseScrumboardBoardEditListNameComponent,
        FuseScrumboardBoardCardComponent,
        FuseScrumboardBoardAddListComponent,
        FuseScrumboardEditBoardNameComponent,
        EmailVendorsDialogComponent,
        CreateFactoryDialogComponent,

    ],
    imports        : [
        BillingRoutingModule,
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
        MatChipsModule,
        NgxChartsModule,
        NgxDnDModule,

        FuseSharedModule,
        SharedModule,
        FuseEcommerceModule
    ],
    providers      : [
        EcommerceBillingService,
        BillingResolverService,
        AwsFileManagerService,
        EcommerceOrderService
    ],
    entryComponents: [
        EmailVendorsDialogComponent,
        CreateFactoryDialogComponent
    ]
})
export class BillingModule
{
}

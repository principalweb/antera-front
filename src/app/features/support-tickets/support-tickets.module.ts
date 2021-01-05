import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FuseSharedModule } from '@fuse/shared.module';

import { SupportTicketsService } from './support-tickets.service';
import { SupportTicketsComponent } from './support-tickets.component';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FuseConfirmDialogModule } from '@fuse/components';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SupportTicketsListComponent } from './support-tickets-list/support-tickets-list.component';
import { CdkTableModule } from '@angular/cdk/table';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

const routes = [
    {
        path     : '',
        component: SupportTicketsComponent,
        resolve  : {
            supportTickets: SupportTicketsService
        }
    }
];

@NgModule({
    declarations: [
        SupportTicketsComponent,
        SupportTicketsListComponent,
    ],
    imports     : [
        RouterModule.forChild(routes),
        CdkTableModule,
        MatExpansionModule,
        MatIconModule,
        FuseSharedModule,
        MatButtonModule,
        CommonModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        FuseConfirmDialogModule,
        MatDialogModule,
        MatCheckboxModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatTooltipModule,
        MatSelectModule
    ],
    providers   : [
        SupportTicketsService
    ],
    entryComponents: [SupportTicketsComponent]
})
export class SupportTicketsModule
{
}

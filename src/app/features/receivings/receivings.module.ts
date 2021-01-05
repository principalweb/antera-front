import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';

import { FuseReceivingsComponent } from './receivings.component';
import { ReceivingsService } from './receivings.service';
import { FuseReceivingsReceivingListComponent } from './receiving-list/receiving-list.component';
import { ReceivingItemsDialogComponent } from './receiving-items/receiving-items.component';

const routes: Routes = [
    {
        path     : '**',
        component: FuseReceivingsComponent,
        data: {
            helpModule: 'CRM',
        },
        resolve  : {
            receivings: ReceivingsService
        }
    }
];

@NgModule({
    declarations   : [
        FuseReceivingsComponent,
        FuseReceivingsReceivingListComponent,
        ReceivingItemsDialogComponent
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
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSortModule,
        MatTableModule,
        MatToolbarModule,
        MatProgressSpinnerModule,

        FuseSharedModule,
        FuseConfirmDialogModule
    ],
    providers      : [
        ReceivingsService
    ],
    entryComponents: [ReceivingItemsDialogComponent]
})
export class FuseReceivingsModule
{
}

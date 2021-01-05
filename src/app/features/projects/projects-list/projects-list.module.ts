import { NgModule } from '@angular/core';
import { CdkTableModule } from '@angular/cdk/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';

import { FuseProjectsListComponent } from './projects-list.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
    declarations   : [
        FuseProjectsListComponent
    ],
    imports        : [
        CdkTableModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        MatToolbarModule,
        MatTooltipModule,
        MatIconModule,
        SharedModule,

        FuseSharedModule,
        FuseConfirmDialogModule
    ],
    exports: [
        FuseProjectsListComponent
    ]
})
export class FuseProjectsListModule
{
}

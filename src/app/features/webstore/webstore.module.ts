import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
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

import { WebstoreService } from './webstore.service';

import { FuseWebstoreComponent } from './webstore/webstore.component';
import { FuseWebstoreListComponent } from './webstore-list/webstore-list.component';
import { FuseWebstoreFormComponent } from './webstore-form/webstore-form.component';

const routes: Routes = [
    {
        path: '**',
        component: FuseWebstoreComponent,
        data: {
            helpModule: 'Web Stores',
        },
        resolve  : {
            webstore: WebstoreService
        }
    }
];

@NgModule({
    declarations   : [
        FuseWebstoreComponent,
        FuseWebstoreListComponent,
        FuseWebstoreFormComponent,
    ],
    imports        : [
        RouterModule.forChild(routes),
        CdkTableModule,

        MatButtonModule,
        MatCheckboxModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTabsModule,
        MatTableModule,
        MatToolbarModule,
        MatListModule,
        MatChipsModule,
        MatTooltipModule,
        MatAutocompleteModule,
        FuseSharedModule,
        FuseConfirmDialogModule,
        SharedModule
    ],
    providers      : [
        WebstoreService
    ],
    entryComponents: [
        FuseWebstoreFormComponent
    ]
})
export class FuseWebstoreModule
{
}

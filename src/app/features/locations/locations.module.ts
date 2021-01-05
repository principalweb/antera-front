import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';
import { SharedModule } from '../../shared/shared.module';

import { LocationsService } from './locations.service';

import { FuseLocationsComponent } from './locations/locations.component';
import { FuseLocationsListComponent } from './locations-list/locations-list.component';
import { FuseLocationFormComponent } from './location-form/location-form.component';
import { LocationsSharedModule } from './locations-shared.module';

const routes: Routes = [
    {
        path: '**',
        component: FuseLocationsComponent,
        resolve: {
            location: LocationsService
        }
    }
];

@NgModule({
    declarations: [
        FuseLocationsComponent,
        FuseLocationsListComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        CdkTableModule,

        MatButtonModule,
        MatCheckboxModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTabsModule,
        MatTableModule,
        MatToolbarModule,

        FuseSharedModule,
        FuseConfirmDialogModule,
        SharedModule,
        LocationsSharedModule,
    ],
})
export class FuseLocationsModule {
}

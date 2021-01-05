import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';
import { SharedModule } from '../../shared/shared.module';

import { UsersService } from './users.service';

import { FuseUsersComponent } from './users.component';
import { FuseUserListComponent } from './user-list/user-list.component';
import { FuseUserDetailComponent } from './user-detail/user-detail.component';
import { FuseUserDetailService } from './user-detail/user-detail.service';
import { UserDetailsDialogComponent } from './user-details-dialog/user-details-dialog.component';
import { PermissionService } from 'app/core/services/permission.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
const routes: Routes = [
    {
        path: '',
        component: FuseUsersComponent,
        data: {
            helpModule: 'Users',
        },
        resolve  : {
            users: UsersService
        }
    },
    {
        path     : ':id',
        component: FuseUsersComponent,
        data: {
            helpModule: 'Users',
        },
        resolve  : {
            users: UsersService
        }
    }
];

@NgModule({
    declarations   : [
        FuseUsersComponent,
        FuseUserListComponent,
        FuseUserDetailComponent,
        UserDetailsDialogComponent,
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
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSortModule,
        MatSelectModule,
        MatStepperModule,
        MatTabsModule,
        MatTableModule,
        MatToolbarModule,
        MatAutocompleteModule,
        MatDialogModule,
        MatProgressBarModule,
        FuseSharedModule,
        FuseConfirmDialogModule,
        SharedModule
    ],
    providers      : [
        UsersService,
        FuseUserDetailService,
        PermissionService
    ],
    entryComponents: [
        UserDetailsDialogComponent
    ]
})
export class FuseUsersModule
{
}

import { NgModule } from '@angular/core';
import { CommissionListComponent } from './commission-list/commission-list.component';
import { CommissionsComponent } from './commissions.component';
import { Routes, RouterModule } from '@angular/router';
import { CommissionsService } from './commissions.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkTableModule } from '@angular/cdk/table';
import { FuseConfirmDialogModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { CommissionFormComponent } from './commission-form/commission-form.component';
import { CommissionGroupsService } from './commission-groups.service';
import { CommissionGroupFormComponent } from './commission-group-form/commission-group-form.component';
import { CommissionGroupListComponent } from './commission-group-list/commission-group-list.component';
import { CommissionGroupsComponent } from './commission-groups/commission-groups.component';
import { CommissionAdjustmentsComponent } from './commission-adjustments/commission-adjustments.component';
import { CommissionAdjustmentFormComponent } from './commission-adjustment-form/commission-adjustment-form.component';
import { CommissionAdjustmentService } from './commission-adjustment.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommissionAdjustmentListComponent } from './commission-adjustment-list/commission-adjustment-list.component';

const routes: Routes = [
  {
    path: 'plans',
    component: CommissionsComponent,
    data: {
        helpModule: 'Commissions'
    },
    resolve: {
      commissions: CommissionsService
    },
  },
  {
    path: 'groups',
    component: CommissionGroupsComponent,
    data: {
        helpModule: 'Commissions'
    },
  },
  {
    path: 'adjustments',
    component: CommissionAdjustmentsComponent,
    data: {
        helpModule: 'Commissions'
    },
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    MatIconModule,
    MatFormFieldModule,
    MatListModule,
    MatSidenavModule,
    MatMenuModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    CdkTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatToolbarModule,
    FuseConfirmDialogModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSortModule,
    MatDatepickerModule,
    FuseSharedModule,
    SharedModule
  ],
  declarations: [
    CommissionListComponent,
    CommissionsComponent,
    CommissionFormComponent,
    CommissionGroupFormComponent,
    CommissionGroupListComponent,
    CommissionGroupsComponent,
    CommissionAdjustmentsComponent,
    CommissionAdjustmentFormComponent,
    CommissionAdjustmentListComponent,
  ],
  providers: [
    CommissionsService,
    CommissionGroupsService,
    CommissionAdjustmentService
  ],
  entryComponents: [
    CommissionFormComponent,
    CommissionGroupFormComponent
  ]
})
export class CommissionsModule { }

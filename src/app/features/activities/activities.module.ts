import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkTableModule } from '@angular/cdk/table';
import { Routes, RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';

import { ActivitiesService } from '../../core/services/activities.service';
import { SharedModule } from '../../shared/shared.module';

import { ActivitiesComponent } from './activities.component';

const routes: Routes = [
  {
      path: '',
      component: ActivitiesComponent,
      data: {
        helpModule: 'Activities',
      },
      resolve  : {
          data: ActivitiesService
      }
  }
];

@NgModule({

  declarations: [
    ActivitiesComponent
  ],
  imports: [
    RouterModule.forChild(routes),

    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    FormsModule,
    MatInputModule,
    MatListModule,
    MatTableModule,
    MatCheckboxModule,
    CdkTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatToolbarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatAutocompleteModule,

    MatDatepickerModule,
    MatDatetimepickerModule,
    MatNativeDatetimeModule,
    MatTooltipModule,
    
    FuseSharedModule,
    SharedModule,
    FuseConfirmDialogModule
  ],

})
export class ActivitiesModule { }

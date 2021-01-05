import { NgModule } from '@angular/core';
import { DecorationFeesListComponent } from './decoration-fees-list/decoration-fees-list.component';
import { Routes, RouterModule } from '@angular/router';
import { DecorationFeesComponent } from './decoration-fees.component';
import { DecorationFeesService } from './decoration-fees.service';
import { SharedModule } from 'app/shared/shared.module';
import { FuseSharedModule } from '@fuse/shared.module';
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
import { DecorationFeeFormComponent } from './decoration-fee-form/decoration-fee-form.component';
import { FuseConfirmDialogModule } from '@fuse/components';

const routes: Routes = [
  {
    path        : '',
    component  : DecorationFeesComponent,
    data: {
        helpModule: 'Admin'
    },
    resolve     : {
      decoration_fees: DecorationFeesService
    }
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

    FuseSharedModule,
    SharedModule
  ],
  declarations: [
    DecorationFeesListComponent,
    DecorationFeesComponent,
    DecorationFeeFormComponent,
  ],
  providers: [
    DecorationFeesService
  ],
  entryComponents: [DecorationFeeFormComponent]
})
export class DecorationFeesModule { }

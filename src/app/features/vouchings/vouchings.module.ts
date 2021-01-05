import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VouchingsComponent } from './vouchings.component';
import { VouchingsService } from './vouchings.service';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmDialogModule } from '@fuse/components';
import { CdkTableModule } from '@angular/cdk/table';
import { VouchingFormComponent } from './vouching-form/vouching-form.component';
import { OpenPOListComponent } from './open-po-list/open-po-list.component';
import { SharedModule } from 'app/shared/shared.module';
import { MatDatetimepickerModule } from '@mat-datetimepicker/core';
import { VouchingsListComponent } from './vouchings-list/vouchings-list.component';
import { VouchingLinesFormComponent } from './vouching-lines-form/vouching-lines-form.component';
import { ApinvoiceLinesComponent } from './apinvoice-lines/apinvoice-lines.component';
import { ApinvoiceSearchComponent } from './apinvoice-search/apinvoice-search.component';
import { ApinvoiceDetailsComponent } from './apinvoice-details/apinvoice-details.component';
import { ApCreditModule } from 'app/features/ap-credit/ap-credit.module';
import { VouchingCreditsComponent } from './vouching-credits/vouching-credits.component';
import { VouchingCreditsListComponent } from './vouching-credits-list/vouching-credits-list.component';
import { VouchingRoutingModule } from './vouching-routing.module';

const routes: Routes = [
  {
    path        : '',
    component  : VouchingsComponent,
    data: {
        helpModule: 'CRM',
    },
    resolve     : {
      vouchings: VouchingsService
    }
  }
];

@NgModule({
  imports: [
    VouchingRoutingModule,
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
    MatExpansionModule,
    MatCardModule,
    MatRadioModule,
    MatTooltipModule,
    FuseConfirmDialogModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSortModule,
    MatDatepickerModule,
    MatDatetimepickerModule,

    SharedModule,
    ApCreditModule,
    FuseSharedModule,
  ],
  declarations: [
    VouchingsComponent,
    OpenPOListComponent,
    VouchingFormComponent,
    VouchingsListComponent,
    VouchingLinesFormComponent,
    ApinvoiceLinesComponent,
    ApinvoiceSearchComponent,
    ApinvoiceDetailsComponent,
    VouchingCreditsComponent,
    VouchingCreditsListComponent
  ],
  providers: [
    VouchingsService
  ],
  entryComponents: [
    VouchingFormComponent,
    ApinvoiceSearchComponent
  ],
  exports: [
    VouchingFormComponent,
  ]
})
export class VouchingsModule { }

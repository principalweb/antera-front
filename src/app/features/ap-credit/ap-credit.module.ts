import { CdkTableModule } from '@angular/cdk/table';
import { FuseSharedModule } from '@fuse/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApCreditComponent } from './ap-credit.component';
import { ApCreditListComponent } from './ap-credit-list/ap-credit-list.component';
import { ApCreditFormComponent } from './ap-credit-form/ap-credit-form.component';
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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as fromApCredit from './store/ap-credit.reducer';
import { ApCreditEffects } from './store/ap-credit.effects';
import { ApCreditFormItemsComponent } from './ap-credit-form-items/ap-credit-form-items.component';
import { ApCreditRoutingModule } from './ap-credit-routing.module';
import { PoLinesComponent } from './po-lines/po-lines.component';


@NgModule({
  declarations: [ApCreditComponent, ApCreditListComponent, ApCreditFormComponent, ApCreditFormItemsComponent, PoLinesComponent],
  imports: [
    ApCreditRoutingModule,
    FuseSharedModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    CdkTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule,
    MatToolbarModule,
    StoreModule.forFeature('apCredit', fromApCredit.reducer),
    EffectsModule.forFeature([ApCreditEffects]),
    CommonModule,
  ],
  exports: [
    ApCreditComponent,
    ApCreditFormComponent
  ],
  entryComponents: [
    PoLinesComponent
  ]
})
export class ApCreditModule { }

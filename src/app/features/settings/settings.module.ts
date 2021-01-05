import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FuseSharedModule } from '@fuse/shared.module';

import { SettingsComponent } from './settings.component';
import { PaymentsTabComponent } from './components/payments-tab/payments-tab.component';
import { ApiTokenTabComponent } from './components/api-token-tab/api-token-tab.component';
import { AdditionalChargesTabComponent } from './components/additional-charges-tab/additional-charges-tab.component';
import { ConfigurationsTabComponent } from './components/configurations-tab/configurations-tab.component';
import { SearchVendorsTabComponent } from './components/search-vendors-tab/search-vendors-tab.component';
import { PromostandardsComponent } from './components/promostandards/promostandards.component';
import { SanmarComponent } from './components/sanmar/sanmar.component';
import { PsDetailComponent } from './components/ps-detail/ps-detail.component';
import { BoltTabComponent } from './components/bolt-tab/bolt-tab.component';
import { IntegrationsTabComponent } from './components/integrations-tab/integrations-tab.component';
import { QbocustomerComponent } from './components/qbocustomer/qbocustomer.component';
import { TaxjarComponent } from './components/taxjar/taxjar.component';
import { CxmlComponent } from './components/cxml/cxml.component';
import { ShipstationComponent } from './components/shipstation/shipstation.component';
import { DubowComponent } from './components/dubow/dubow.component';
import { XerocustomerComponent } from './components/xerocustomer/xerocustomer.component';

import { CxmlPoLogModule } from 'app/features/cxml-po-log/cxml-po-log.module';
import { CategoryListComponent } from './components/taxjar/category-list/category-list.component';
import { QboModule } from 'app/features/qbo/qbo.module';
import { PricingComponent } from './components/pricing/pricing.component';

const routes: Routes = [
  {
    path: '',
    data: {
      helpModule: 'Integrations'
    },
    component: SettingsComponent
  }
];

@NgModule({
  imports: [
    MatAutocompleteModule,
    CommonModule,
    QboModule,
    RouterModule.forChild(routes),

    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTabsModule,
	MatTableModule,
    MatPaginatorModule,
    MatSortModule,
	CdkTableModule,
    MatToolbarModule,
    MatInputModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatDialogModule,
    FuseSharedModule,
    CxmlPoLogModule,
  ],
  declarations: [
    SettingsComponent,
    PaymentsTabComponent,
    ApiTokenTabComponent,
    AdditionalChargesTabComponent,
    ConfigurationsTabComponent,
    SearchVendorsTabComponent,
    PromostandardsComponent,
    SanmarComponent,
    PsDetailComponent,
    BoltTabComponent,
    IntegrationsTabComponent,
    QbocustomerComponent,
    TaxjarComponent,
    CxmlComponent,
    ShipstationComponent,
    DubowComponent,
    XerocustomerComponent,
    CategoryListComponent,
    PricingComponent,
  ],
  entryComponents: [PsDetailComponent]
})
export class SettingsModule { }

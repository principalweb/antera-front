import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerAdminConfigComponent } from './customer-admin-config.component';
import { Routes, RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule, MatFormFieldControl } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OrderConfigurationComponent } from './order-configuration/order-configuration.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { ModuleFieldsComponent } from './module-fields/module-fields.component';
import { ModuleFieldsListComponent, LabelEditDialogComponent } from './module-fields/module-fields-list/module-fields-list.component';
import { ModuleFieldsService } from './module-fields/module-fields.service';
import { CdkTableModule } from '@angular/cdk/table';
import { CategoryComponent } from './category/category.component';
import { CategoryListComponent } from './category/category-list/category-list.component';
import { CategoryFormComponent } from './category/category-form/category-form.component';
import { DropdownComponent } from './dropdowns/dropdown/dropdown.component';
import { DropdownsService } from './dropdowns/dropdowns.service';
import { DropdownService } from './dropdowns/dropdown.service';
import { DropdownOptionFormComponent } from './dropdowns/dropdown-option-form/dropdown-option-form.component';
import { AdminDropdownComponent } from './dropdowns/dropdowns.component';
import { DropdownListComponent } from './dropdowns/dropdown-list/dropdown-list.component';
import { CustomerAdminConfigService } from './customer-admin-config.service';
import { DecorationTypesComponent } from './decoration-types/decoration-types.component';
import { DecorationTypeListComponent } from './decoration-types/decoration-type-list/decoration-type-list.component';
import { DecorationTypesService } from './decoration-types/decoration-types.service';
import { DecorationTypeFormComponent } from './decoration-types/decoration-type-form/decoration-type-form.component';
import { DecorationLocationsComponent } from './decoration-locations/decoration-locations.component';
import { DecorationLocationListComponent } from './decoration-locations/decoration-location-list/decoration-location-list.component';
import { DecorationLocationsService } from './decoration-locations/decoration-locations.service';
import { DecorationLocationFormComponent } from './decoration-locations/decoration-location-form/decoration-location-form.component';
import { AdditionalChargesEditComponent } from './additional-charges/additional-charges.component';
import { AdditionalChargesService } from './additional-charges/additional-charges.service';
import { AdditionalChargeListComponent } from './additional-charges/additional-charge-list/additional-charge-list.component';
import { AdditionalChargeFormComponent } from './additional-charges/additional-charge-form/additional-charge-form.component';
import { SiteComponent } from './site/site.component';
import { SiteFormComponent } from './site/site-form/site-form.component';
import { SiteListComponent } from './site/site-list/site-list.component';
import { BinComponent } from './bin/bin.component';
import { BinFormComponent } from './bin/bin-form/bin-form.component';
import { BinListComponent } from './bin/bin-list/bin-list.component';
import { TimeZonesComponent } from './time-zones/time-zones.component';
import { TimezonesService } from './time-zones/timezones.service';
import { ReportAdminComponent, EditDialogComponent } from './report-admin/report-admin.component';
import { IdentityComponent } from './identity/identity.component';
import { IdentityFormComponent } from './identity/identity-form/identity-form.component';
import { IdentityListComponent } from './identity/identity-list/identity-list.component';
import { DecoTypeGroupsComponent } from './deco-type-groups/deco-type-groups.component';
import { DecoTypeGroupsFormComponent } from './deco-type-groups/deco-type-groups-form/deco-type-groups-form.component';
import { DecoTypeGroupsListComponent } from './deco-type-groups/deco-type-groups-list/deco-type-groups-list.component';
import { DecoTypeGroupsService } from './deco-type-groups/deco-type-groups.service';
import { UomGroupsComponent } from './uom-groups/uom-groups.component';
import { UomComponent } from './uom/uom.component';
import { UomGroupsFormComponent } from './uom-groups/uom-groups-form/uom-groups-form.component';
import { UomGroupsListComponent } from './uom-groups/uom-groups-list/uom-groups-list.component';
import { UomGroupsService } from './uom-groups/uom-groups.service';
import { UomFormComponent } from './uom/uom-form/uom-form.component';
import { UomListComponent } from './uom/uom-list/uom-list.component';
import { UomService } from './uom/uom.service';
import { AttributesComponent } from './attributes/attributes.component';
import { LabelsComponent } from './attributes/labels/labels.component';
import { LabelsListComponent } from './attributes/labels/labels-list/labels-list.component';
import { LabelsFormComponent } from './attributes/labels/labels-form/labels-form.component';
import { ProductionSettingsComponent } from './production-settings/production-settings.component';
import { PricingComponent } from './pricing/pricing.component';
import { EcommerceProductService } from 'app/features/e-commerce/product/product.service';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProductPricingMethodService } from 'app/features/e-commerce/products/product-pricing/product-pricing-method.service';
import { PricingMethodsComponent } from './pricing-methods/pricing-methods.component';
import { NewPricingMethodDialogComponent } from './pricing-methods/new-pricing-method-dialog/new-pricing-method-dialog.component';
import { PricingMethodsTableComponent } from './pricing-methods/pricing-methods-table/pricing-methods-table.component';
import { EditPricingMethodDialogComponent } from './pricing-methods/edit-pricing-method-dialog-component/edit-pricing-method-dialog-component';
import { PricingMethodsQtyBreaksDialogComponent } from './pricing-methods/pricing-methods-qty-breaks-dialog/pricing-methods-qty-breaks-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { PaymentMethodComponent } from './payment-method/payment-method.component';
import { PaymentMethodListComponent } from './payment-method/payment-method-list/payment-method-list.component';
import { PaymentMethodService } from './payment-method/payment-mehtod.service';
import { PaymentMethodFormComponent } from './payment-method/payment-method-form/payment-method-form.component';
import { NewPriceRangeDialogComponent } from './pricing-methods/new-price-range-dialog/new-price-range-dialog.component';

const routes: Routes = [
  {
    path        : '',
    component  : CustomerAdminConfigComponent,
    data: {
        helpModule: 'Admin'
    },
    resolve : {
      data: CustomerAdminConfigService
    }
  },
  {
    path     : 'dropdowns/:name',
    component: DropdownComponent,
    data: {
        helpModule: 'Admin'
    },
    resolve  : {
        data: DropdownService
    }
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DragDropModule,
    MatIconModule,
    MatExpansionModule,
    MatTabsModule,
    MatCheckboxModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    CdkTableModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule,
    MatToolbarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    FuseSharedModule,
    CommonModule,
    SharedModule,
    MatDividerModule,
    MatListModule,
    MatGridListModule,
    MatChipsModule
  ],
  declarations: [
    CustomerAdminConfigComponent,

    OrderConfigurationComponent,

    ModuleFieldsComponent,
    ModuleFieldsListComponent,
    LabelEditDialogComponent,
    EditDialogComponent,

    CategoryComponent,
    CategoryListComponent,
    CategoryFormComponent,

    DropdownListComponent,
    AdminDropdownComponent,
    DropdownComponent,
    DropdownOptionFormComponent,

    DecorationTypesComponent,
    DecorationTypeListComponent,
    DecorationTypeFormComponent,

    DecorationLocationsComponent,
    DecorationLocationListComponent,
    DecorationLocationFormComponent,

    AdditionalChargesEditComponent,
    AdditionalChargeListComponent,
    AdditionalChargeFormComponent,

    SiteComponent,
    SiteFormComponent,
    SiteListComponent,
    BinComponent,
    BinFormComponent,
    BinListComponent,

    TimeZonesComponent,

    ReportAdminComponent,

    IdentityComponent,

    IdentityFormComponent,

    IdentityListComponent,

    DecoTypeGroupsComponent,

    DecoTypeGroupsFormComponent,

    DecoTypeGroupsListComponent,

    UomGroupsComponent,

    UomComponent,

    UomGroupsFormComponent,

    UomGroupsListComponent,

    UomFormComponent,

    UomListComponent,

    AttributesComponent,

    LabelsComponent,

    LabelsListComponent,

    LabelsFormComponent,

    ProductionSettingsComponent,

    PricingComponent,

    PricingMethodsComponent,

    NewPricingMethodDialogComponent,

    PricingMethodsTableComponent,

    EditPricingMethodDialogComponent,

    PricingMethodsQtyBreaksDialogComponent,
    PaymentMethodComponent,
    PaymentMethodListComponent,
    PaymentMethodFormComponent,
    NewPriceRangeDialogComponent
  ],
  providers: [
    ModuleFieldsService,
    DropdownService,
    DropdownsService,
    CustomerAdminConfigService,
    DecorationTypesService,
    DecoTypeGroupsService,
    UomGroupsService,
    UomService,
    DecorationLocationsService,
    AdditionalChargesService,
    TimezonesService,
    EcommerceProductService,
    ProductPricingMethodService,
    PaymentMethodService
  ],
  entryComponents: [
    LabelEditDialogComponent,
    EditDialogComponent,
    CategoryFormComponent,
    SiteFormComponent,
    BinComponent,
    BinFormComponent,
    DropdownOptionFormComponent,
    DecorationTypeFormComponent,
    DecorationLocationFormComponent,
    DecoTypeGroupsFormComponent,
    UomGroupsFormComponent,
    UomFormComponent,
    IdentityFormComponent,
    LabelsComponent,
    LabelsFormComponent,
    AdditionalChargeFormComponent
  ]
})
export class CustomerAdminConfigModule { }

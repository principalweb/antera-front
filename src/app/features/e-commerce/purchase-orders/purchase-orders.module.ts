import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from "app/shared/shared.module";
import { PurchaseOrdersComponent } from './purchase-orders.component';
import { DetailComponent } from './detail/detail.component';
import { StoreModule } from '@ngrx/store';
import { purchaseOrderReducer } from "./store/purchase-orders.reducer";
import { purchaseNeedsReducer } from "./store/purchase-needs.reducer";
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { CdkTableModule } from '@angular/cdk/table';
import { FuseArtworksListModule } from "app/features/artworks/artworks-list/artworks-list.module";
import { PurchaseOrderEffects } from "./store/purchase-orders.effects";
import { PurchaseOrderService } from './services/purchase-order.service';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DocumentPdfModule } from '../../documents/document-pdf/document-pdf.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule, ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { NewPurchaseOrderComponent } from './new-purchase-order/new-purchase-order.component';
import { PurchaseNeedsService } from './services/purchase-needs.service';
import { PaginatorContainerComponent } from './new-purchase-order/paginatorContainer/paginator-container/paginator-container.component';
import { QuantityInputContainerComponent } from './new-purchase-order/quantityInputContainer/quantity-input-container/quantity-input-container.component';
import { GenerateDialogComponent } from './new-purchase-order/generate-dialog/generate-dialog.component';
import { EditShippingDialogComponent } from './detail/edit-shipping-dialog/edit-shipping-dialog.component';
import { ChangeVendorWarningDialogComponent } from './detail/change-vendor-warning-dialog/change-vendor-warning-dialog.component';
import { StepTwoComponent } from './new-purchase-order/step-two/step-two.component';
import { StepThreeComponent } from './new-purchase-order/step-three/step-three.component';
import { SummaryViewComponent } from './new-purchase-order/step-two/summary-view/summary-view.component';
import { CostInputContainerComponent } from './new-purchase-order/cost-input-container/cost-input-container.component';
const routes : Routes = [
    {
        path: "",
        component: PurchaseOrdersComponent
    },
    {
        path: "purchase_orders/:id",
        component: DetailComponent,
        resolve: {
            data: PurchaseOrderService
        }
    },
    {
        path: "new",
        component: NewPurchaseOrderComponent,
        resolve: {
            data: PurchaseNeedsService
        }
    }
];
@NgModule({
    declarations: [PurchaseOrdersComponent, DetailComponent, NewPurchaseOrderComponent, PaginatorContainerComponent, QuantityInputContainerComponent, GenerateDialogComponent, EditShippingDialogComponent, ChangeVendorWarningDialogComponent, StepThreeComponent, StepTwoComponent, SummaryViewComponent, CostInputContainerComponent],
    entryComponents: [GenerateDialogComponent, EditShippingDialogComponent, ChangeVendorWarningDialogComponent],
    providers: [{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
    imports: [
        RouterModule.forChild(routes),
        SharedModule,
        StoreModule.forFeature('purchaseOrders', purchaseOrderReducer),
        StoreModule.forFeature('purchaseNeeds', purchaseNeedsReducer),
        //StoreModule.forFeature('purchaseOrderModuleState', fromPurchaseModuleState.rootReducer),
        EffectsModule.forFeature([PurchaseOrderEffects]),
        MatButtonModule,
        MatTreeModule,
        MatCardModule,
        MatCheckboxModule,
        CdkTableModule,
        MatChipsModule,
        FuseArtworksListModule,
        MatDialogModule,
        MatFormFieldModule,
        FuseWidgetModule,
        FuseSharedModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatProgressBarModule,
        CdkTreeModule,
        MatPaginatorModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatMenuModule,
        MatAutocompleteModule,
        MatStepperModule,
        MatTooltipModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        MatExpansionModule,
        DocumentPdfModule
    ]
})
export class PurchaseOrdersModule { }
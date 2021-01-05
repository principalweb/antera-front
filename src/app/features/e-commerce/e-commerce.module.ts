import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
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

import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { SharedModule } from 'app/shared/shared.module';
import { FuseArtworksListModule } from '../artworks/artworks-list/artworks-list.module';
import { ArtworksDetailsModule } from '../artworks/artwork-details/artwork-details.module';

import { FuseEcommerceDashboardComponent } from './dashboard/dashboard.component';
import { FuseEcommerceProductsComponent } from './products/products.component';
import { FuseEcommerceProductComponent } from './product/product.component';
import { FuseEcommerceOrdersComponent } from './orders/orders.component';
import { FuseEcommerceOrderComponent } from './order/order.component';
import { TransferCustomerInventoryDialogComponent } from './order/order.component';
import { FuseEcommerceQuotesComponent } from './quotes/quotes.component';
import { FuseEcommerceQuoteComponent } from './quote/quote.component';
import { ProductPricesComponent, ColorInputDialogComponent } from './components/product-prices/product-prices.component';
import { InventoryListComponent } from './components/inventory-list/inventory-list.component';
import { InventoryItemDetailsComponent } from './components/inventory-item-details/inventory-item-details.component';
import { OrderBottomSheetComponent } from './components/order-bottom-sheet/order-bottom-sheet.component';
import { SalesInputComponent } from './components/sales-input/sales-input.component';
import { ProfitSheetComponent } from './components/profit-sheet/profit-sheet.component';
import { ProductsListComponent } from './components/products-list/products-list.component';
import { ProductStepComponent } from './components/product-step/product-step.component';
import { ProductDescriptionComponent } from './components/product-description/product-description.component';
import { OrderMessagesComponent } from './components/order-messages/order-messages.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductImagesComponent } from './products/product-images/product-images.component';
import { ProductAddWidgetComponent } from './components/product-add-widget/product-add-widget.component';
import { PricingInventoryComponent } from './components/pricing-inventory/pricing-inventory.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { SplitShipComponent } from './components/split-ship/split-ship.component';
import { AdditionalChargesComponent } from './components/additional-charges/additional-charges.component';
import { DecorationChargesComponent } from './components/decoration-charges/decoration-charges.component';
import { EditChargeComponent } from './components/edit-charge/edit-charge.component';
import { ProductDetailFormComponent } from './components/product-detail-form/product-detail-form.component';
import { ProductDetailsDialogComponent } from './components/product-details-dialog/product-details-dialog.component';
import { ProductUniversalSearchComponent } from './components/product-universal-search/product-universal-search.component';
import { HistoryComponent } from './components/history/history.component';
import { ProductBasicFormComponent } from './components/product-basic-form/product-basic-form.component';
import { ProductManualEntryComponent } from './components/product-manual-entry/product-manual-entry.component';
import { FuseConfirmDialogModule } from '@fuse/components';
import { OrderDetailsOverviewComponent } from './components/order-details-overview/order-details-overview.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { UrlFixPipe } from './url-fix.pipe';
import { MathFloorFixPipe } from './math-floor-fix.pipe';
import { SelectDecorationComponent } from './components/select-decoration/select-decoration.component';
import { ProductConfigDialogComponent } from './components/product-config-dialog/product-config-dialog.component';
import { PriceOverrideComponent } from './components/price-overrride/price-override.component';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { EcommerceDashboardService } from './dashboard/dashboard.service';
import { EcommerceProductsService } from './products/products.service';
import { EcommerceProductService } from './product/product.service';
import { EcommerceOrdersService } from './orders.service';
import { EcommerceOrderService } from './order.service';
import { PurchaseOrdersService } from "./purchase-orders/services/purchaseOrders.service";
import { HistoryService } from './components/history/history.service';
import { ProductImageGalleryComponent } from './components/product-image-gallery/product-image-gallery.component';
import { ProductImageUploadComponent } from './components/product-image-upload/product-image-upload.component';
import { ProductStoresDialogComponent } from './components/product-stores-dialog/product-stores-dialog.component';
import { DecorationsListComponent } from './components/decorations-list/decorations-list.component';
import { PaymentService } from 'app/core/services/payment.service';
import { DecorationVariationSelectComponent } from './components/decoration-variation-select/decoration-variation-select.component';
import { AttachDesignDialogComponent } from './components/attach-design-dialog/attach-design-dialog.component';
import { ItemTypeDialogComponent } from './components/item-type-dialog/item-type-dialog.component';
import { InventoryComponent } from './inventory/inventory.component';
import { LineitemImageUploadDialogComponent } from './components/lineitem-image-upload-dialog/lineitem-image-upload-dialog.component';
import { OrderPaymentFormDialogComponent } from './components/order-payment-form/order-payment-form.component';
import { OrderPaymentMessageDialogComponent } from './components/order-payment-message-dialog/order-payment-message-dialog.component';
import { OrderActivityListComponent } from './components/order-activity-list/order-activity-list.component';
import { ProductChargesComponent } from './components/product-charges/product-charges.component';
import { ProductDecoComponent } from './components/product-deco/product-deco.component';
import { ProductDecoListComponent } from './components/product-deco/product-deco-list/product-deco-list.component';
import { ProductDecoFormComponent } from './components/product-deco/product-deco-form/product-deco-form.component';
import { ProductNoteComponent } from './components/product-note/product-note.component';
import { ProductSupplierDescriptionComponent } from './components/product-supplier-description/product-supplier-description.component';
import { OrderBatchPaymentFormDialogComponent } from './components/order-batch-payment-form/order-batch-payment-form.component';
import { PermissionService } from 'app/core/services/permission.service';
import { OrderInventoryPromptComponent } from './components/order-inventory-prompt/order-inventory-prompt.component';
import { ProductKitsComponent } from './components/product-kits/product-kits.component';
import { KitListComponent } from './components/product-kits/kit-list/kit-list.component';
import { ProductVariationEditorComponent } from './components/product-variation-editor/product-variation-editor.component';
import { UpdateSkuDialogComponent } from './components/product-variation-editor/update-sku-dialog/update-sku-dialog.component';
import { ProductStoresComponent } from './components/product-stores/product-stores.component';
import { StoresListComponent } from './components/product-stores/stores-list/stores-list.component';
import { StoresFormComponent } from './components/product-stores/stores-form/stores-form.component';
import { ProductKitsQtyDialogComponent } from './components/product-kits-qty-dialog/product-kits-qty-dialog.component';
import { ProductLogoBlockDialogComponent } from './components/product-logo-block-dialog/product-logo-block-dialog.component';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { ProductMassUpdateComponent } from './components/product-mass-update/product-mass-update.component';
import { VoidPaymentDialogComponent } from './order/void-payment-dialog/void-payment-dialog.component';
import { RefundPaymentDialogComponent } from './order/refund-payment-dialog/refund-payment-dialog.component';
import { InventoryTransferComponent, OriginBinPipe } from './components/inventory-transfer/inventory-transfer.component';
import { OrderFormComponent } from './order-form/order-form.component';
import { OrderDetailsComponent } from './order-form/order-details/order-details.component';
import { OrderItemComponent } from './order-form/order-item/order-item.component';
import { OrderItemListComponent } from './order-form/order-item-list/order-item-list.component';
import { OrderItemDecoComponent } from './order-form/order-item-deco/order-item-deco.component';
import { OrderItemAddonComponent } from './order-form/order-item-addon/order-item-addon.component';
import { OrderItemFormComponent } from './order-form/order-item/order-item-form/order-item-form.component';
import { NumericDirective } from 'app/directives/numeric.directive';
import { OrderItemRowComponent } from './order-form/order-item/order-item-row/order-item-row.component';
import { QuickProductDialogComponent } from './order-form/quick-product-dialog/quick-product-dialog.component';
import { OrderAddItemComponent } from './order-form/order-add-item/order-add-item.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OrderContainerComponent } from './order-container/order-container.component';
import { OrderStepDialogComponent } from './order-form/order-step-dialog/order-step-dialog.component';
import { PortalModule } from '@angular/cdk/portal';
import { OrderFindProductsComponent } from './order-form/order-find-products/order-find-products.component';
import { OrderDecorationSelectComponent } from './order-form/actions/order-decoration-select/order-decoration-select.component';
import { OrderDecorationNewComponent } from './order-form/actions/order-decoration-new/order-decoration-new.component';
import { OrderDecorationEditComponent } from './order-form/actions/order-decoration-edit/order-decoration-edit.component';
import { OrderDecorationAttachComponent } from './order-form/actions/order-decoration-attach/order-decoration-attach.component';
import { StoreModule } from '@ngrx/store';
import {SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import * as fromOrderForm from './order-form/store/order-form.reducer';
import { EffectsModule } from '@ngrx/effects';
import { OrderFormEffects } from './order-form/store/order-form.effects';
import { PricingInventoryNewComponent, AlternateReplaceWarningDialog } from './components/pricing-inventory-new/pricing-inventory-new.component';
import { InventoryItemAdjustmentComponent } from './components/inventory-item-adjustment/inventory-item-adjustment.component';
import { InventoryItemTransferComponent } from './components/inventory-item-transfer/inventory-item-transfer.component';
import { InventoryItemReserveComponent } from './components/inventory-item-reserve/inventory-item-reserve.component';
import { ItemNotesDialogComponent } from './order-form/item-notes-dialog/item-notes-dialog.component';
import { ProductDecoChargesComponent } from './components/product-deco/product-deco-charges/product-deco-charges.component';
import { ProductDecoChargePriceComponent } from './components/product-deco/product-deco-charge-price/product-deco-charge-price.component';
import { OrderCreateProductDialogComponent } from './order-form/order-add-item/order-create-product-dialog/order-create-product-dialog.component';
import { OrderDecorationSupplierComponent } from './order-form/actions/order-decoration-supplier/order-decoration-supplier.component';
import { SupplierDecorationDialogComponent } from './components/supplier-decoration-dialog/supplier-decoration-dialog.component';
import { SupplierAddonPricingTableComponent } from './components/supplier-addon-pricing-table/supplier-addon-pricing-table.component';
import { CalculatorAreaComponent } from './order-form/calculator-area/calculator-area.component';
import { AttachCategoryComponent } from './components/product-universal-search/attach-category/attach-category.component';
import { ConfigureVendorComponent } from './components/product-universal-search/configure-vendor/configure-vendor.component';
import { VendorsService } from './components/product-universal-search/configure-vendor/vendors.service';
import { ProductChargePriceComponent } from './components/product-charges/product-charge-price/product-charge-price.component';
import { DocumentPdfModule } from '../documents/document-pdf/document-pdf.module';
import { CurrencyPipe } from '@angular/common';
import { CanDeactivateGuard } from 'app/guards/can-deactivate.guard';
import { ArtworksService } from 'app/core/services/artworks.service';
import { OrderArtProofComponent } from './order-form/order-art-proof/order-art-proof.component';
import { OrderUnsavedChangesDialogComponent } from './order-form/order-unsaved-changes-dialog/order-unsaved-changes-dialog.component';
import { RelatedProductComponent } from './components/related-product/related-product.component';
import { RelatedProductListComponent } from './components/related-product-list/related-product-list.component';
import { InventoryItemListComponent } from './components/inventory-item-list/inventory-item-list.component';
import { OrderVouchingHistoryComponent } from './components/order-vouching-history/order-vouching-history.component';
import { VouchingFormComponent } from 'app/features/vouchings/vouching-form/vouching-form.component';
import { VouchingsModule } from 'app/features/vouchings/vouchings.module';

import { PersonalizationComponent } from './components/personalization/personalization.component';
import { PersonalizationService } from 'app/core/services/personalization.service';
import { EditPersonalizationComponent } from './components/edit-personalization/edit-personalization.component';
import { EditableComponent } from './components/personalization/editable/editable.component';
import { ViewModeDirective } from './components/personalization/editable/view-mode.directive';
import { EditModeDirective } from './components/personalization/editable/edit-mode.directive';
import { FocusableDirective } from './components/personalization/focusable.directive';
import { EditableOnEnterDirective } from './components/personalization/editable/edit-on-enter.directive';
import { PoSyncComponent } from './order-form/po-sync/po-sync.component';
import { ProductImportDetailComponent } from './components/product-universal-search/product-import-detail/product-import-detail.component';
import { ArInvoiceService } from './ar-invoice/services/ar-invoice.service';
import { CurrencyService } from '../admin/currency/currency.service';
import { NoteService } from 'app/main/note.service';
import { ActivitySidenavComponent } from "app/main/activity-sidenav/activity-sidenav.component";
import { SimpleQuoteContentEditorComponent } from './components/simple-quote-content-editor/simple-quote-content-editor.component';
import { BoxLabelQuantityEditorComponent } from './components/box-label-quantity-editor/box-label-quantity-editor.component';
import { PackingListQuantityEditorComponent } from './components/packing-list-quantity-editor/packing-list-quantity-editor.component';
import { PopupNotesDialogComponent } from 'app/shared/popup-notes-dialog/popup-notes-dialog.component';
import { InventoryAdjustmentNotesComponent } from './components/inventory-adjustment-notes/inventory-adjustment-notes.component';
import { ProductAttributesEditorComponent } from './components/product-attributes-editor/product-attributes-editor.component';
import { ProductPricingEditorComponent } from './components/product-pricing-editor/product-pricing-editor.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProductFormPricingLevelComponent } from './components/product-form-pricing-level/product-form-pricing-level.component';
import { ProductPricingMethodService } from './products/product-pricing/product-pricing-method.service';
import {ProductCustomersMarginComponent} from './components/product-customers-margin/product-customers-margin.component';
import {ProductSalesOrderHistoryComponent} from './components/product-sales-order-history/product-sales-order-history.component';
import {ProductPurchaseOrderHistoryComponent} from './components/product-purchase-order-history/product-purchase-order-history.component';
import { ProductFormPricingMarginComponent } from './components/product-form-pricing-margin/product-form-pricing-margin.component';

const routes: Routes = [
  {
    path: "products",
    component: FuseEcommerceProductsComponent,
    data: {
      helpModule: "Products",
    },
    resolve: {
      data: EcommerceProductsService,
    },
  },
  {
    path: "products/:id",
    data: {
      helpModule: "Products",
      shouldReuseRoute: false,
    },
    component: FuseEcommerceProductComponent,
    resolve: {
      data: EcommerceProductService,
    },
  },
  {
    path: "orders",
    data: {
      helpModule: "Orders",
    },
    component: FuseEcommerceOrdersComponent,
    runGuardsAndResolvers: "always",
    resolve: {
      currency: CurrencyService,
      data: EcommerceOrdersService
    },
  },
  {
    path: "order/:id",
    data: {
      helpModule: "Orders",
      shouldReuseRoute: false,
      refType: 'Order'
    },
    runGuardsAndResolvers: "always",
    component: OrderContainerComponent,
    resolve: {
      data: CurrencyService,
      notes: NoteService
    }
  },
  {
    path: "purchase_orders",
    runGuardsAndResolvers: "always",
    data: {
      helpModule: "Purchase Orders",
      shouldReuseRoute: false,
    },
    loadChildren:
      () => import('./purchase-orders/purchase-orders.module').then(m => m.PurchaseOrdersModule),
    resolve: {
      data: PurchaseOrdersService,
    },
  },
  {
    path: "invoicing",
    runGuardsAndResolvers: "always",
    data: {
      helpModule: "Invoicing",
      shouldReuseRoute: false,
    },
    loadChildren: () => import('./ar-invoice/ar-invoice/ar-invoice.module').then(m => m.ArInvoiceModule),
    resolve: {
      data: ArInvoiceService
    }
  },
  {
    path: "orders/:id",
    data: {
      helpModule: "Orders",
      shouldReuseRoute: false,
      refType: 'Order'
    },
    component: FuseEcommerceOrderComponent,
    runGuardsAndResolvers: "always",
    canDeactivate: [CanDeactivateGuard],
    resolve: {
      currency: CurrencyService,
      data: EcommerceOrderService,
      notes: NoteService
    },
  },
  {
    path: "quotes",
    data: {
      helpModule: "Quotes",
    },
    component: FuseEcommerceQuotesComponent,
    resolve: {
      data: EcommerceOrdersService,
    },
  },
  {
    path: "quotes/:id",
    data: {
      helpModule: "Quotes",
      shouldReuseRoute: false,
      refType: 'Quote'
    },
    component: FuseEcommerceQuoteComponent,
    resolve: {
      currency: CurrencyService,
      data: EcommerceOrderService,
      notes: NoteService
    },
  },
  {
    path: "inventory",
    data: {
      helpModule: "Inventory",
    },
    component: InventoryComponent,
    resolve: {},
  },
  {
    path: "sources",
    data: {
      helpModule: "Sourcing",
    },
    loadChildren: () => import('./sources/sources.module').then(m => m.SourcesModule),
  },
  {
    path: "billing",
    data: {
      helpModule: "Billing",
    },
    loadChildren: () => import('./billing/billing.module').then(m => m.BillingModule),
  },
];

const config: SocketIoConfig = { url: 'localhost:3000', options: {}};

@NgModule({
    declarations: [
        FuseEcommerceDashboardComponent,
        ActivitySidenavComponent,
        TransferCustomerInventoryDialogComponent,
        FuseEcommerceProductsComponent,
        FuseEcommerceProductComponent,
        FuseEcommerceOrdersComponent,
        FuseEcommerceOrderComponent,
        FuseEcommerceQuotesComponent,
        FuseEcommerceQuoteComponent,
        ProductPricesComponent,
        InventoryListComponent,
        InventoryItemDetailsComponent,
        OriginBinPipe,
        OrderBottomSheetComponent,
        SalesInputComponent,
        ProfitSheetComponent,
        ProductsListComponent,
        ProductStepComponent,
        ProductDescriptionComponent,
        OrderMessagesComponent,
        PricingInventoryComponent,
        ProductListComponent,
        ProductImagesComponent,
        ProductAddWidgetComponent,
        DocumentsComponent,
        SplitShipComponent,
        AdditionalChargesComponent,
        DecorationChargesComponent,
        EditChargeComponent,
        ProductDetailFormComponent,
        ProductDetailsDialogComponent,
        ProductUniversalSearchComponent,
        HistoryComponent,
        ProductBasicFormComponent,
        ProductManualEntryComponent,
        ColorInputDialogComponent,
        OrderDetailsOverviewComponent,
        ProductFormComponent,
        UrlFixPipe,
        MathFloorFixPipe,
        SelectDecorationComponent,
        ProductConfigDialogComponent,
        OrderPaymentFormDialogComponent,
        OrderBatchPaymentFormDialogComponent,
        ProductImageGalleryComponent,
        ProductCustomersMarginComponent,
        ProductImageUploadComponent,
        ProductStoresDialogComponent,
        DecorationsListComponent,
        DecorationVariationSelectComponent,
        AttachDesignDialogComponent,
        ItemTypeDialogComponent,
        InventoryComponent,
        LineitemImageUploadDialogComponent,
        OrderPaymentMessageDialogComponent,
        OrderActivityListComponent,
        ProductChargesComponent,
        ProductDecoComponent,
        ProductDecoListComponent,
        ProductDecoFormComponent,
        PriceOverrideComponent,
        ProductNoteComponent,
        ProductSupplierDescriptionComponent,
        OrderInventoryPromptComponent,
        ProductKitsComponent,
        KitListComponent,
        ProductVariationEditorComponent,
        UpdateSkuDialogComponent,
        ProductStoresComponent,
        StoresListComponent,
        StoresFormComponent,
        ProductKitsQtyDialogComponent,
        ProductLogoBlockDialogComponent,
        ProductMassUpdateComponent,
        VoidPaymentDialogComponent,
        RefundPaymentDialogComponent,
        InventoryTransferComponent,

        OrderFormComponent,
        OrderDetailsComponent,
        OrderItemComponent,
        OrderItemListComponent,
        OrderItemDecoComponent,
        OrderItemAddonComponent,
        OrderItemFormComponent,
        NumericDirective,
        OrderItemRowComponent,
        QuickProductDialogComponent,
        OrderAddItemComponent,
        OrderContainerComponent,
        OrderStepDialogComponent,
        OrderFindProductsComponent,
        OrderDecorationSelectComponent,
        OrderDecorationNewComponent,
        OrderDecorationEditComponent,
        OrderDecorationAttachComponent,
        PricingInventoryNewComponent,
        AlternateReplaceWarningDialog,
        InventoryItemAdjustmentComponent,
        InventoryItemTransferComponent,
        InventoryItemReserveComponent,
        ItemNotesDialogComponent,
        ProductDecoChargesComponent,
        ProductDecoChargePriceComponent,
        OrderCreateProductDialogComponent,
        OrderDecorationSupplierComponent,
        SupplierDecorationDialogComponent,
        SupplierAddonPricingTableComponent,
        CalculatorAreaComponent,
        AttachCategoryComponent,
        ConfigureVendorComponent,
        ProductChargePriceComponent,
        OrderArtProofComponent,
        OrderUnsavedChangesDialogComponent,
        RelatedProductComponent,
        RelatedProductListComponent,
        InventoryItemListComponent,
        OrderVouchingHistoryComponent,
        PersonalizationComponent,
        EditPersonalizationComponent,
        EditableComponent,
        ViewModeDirective,
        EditModeDirective,
        FocusableDirective,
        EditableOnEnterDirective,
        PoSyncComponent,
        ProductImportDetailComponent,
        SimpleQuoteContentEditorComponent,
        BoxLabelQuantityEditorComponent,
        PackingListQuantityEditorComponent,
        InventoryAdjustmentNotesComponent,
        ProductAttributesEditorComponent,
        ProductPricingEditorComponent,
        ProductFormPricingLevelComponent,
        ProductSalesOrderHistoryComponent,
	ProductPurchaseOrderHistoryComponent,
	ProductFormPricingMarginComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        DocumentPdfModule,
        CdkTableModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatProgressBarModule,
        MatPaginatorModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatMenuModule,
        MatAutocompleteModule,
        MatTooltipModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatButtonToggleModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        MatMomentDateModule,
        NgxChartsModule,
        FuseSharedModule,
        FuseWidgetModule,
        SharedModule,
        FuseConfirmDialogModule,
        ArtworksDetailsModule,
        FuseArtworksListModule,
        DragDropModule,
        MatExpansionModule,
        PortalModule,
        StoreModule.forFeature('orderForm', fromOrderForm.reducer),
        EffectsModule.forFeature([OrderFormEffects]),
        SocketIoModule.forRoot(config),
        VouchingsModule,
        CKEditorModule,
        MatGridListModule
    ],
    providers   : [
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
        EcommerceDashboardService,
        EcommerceProductsService,
        EcommerceProductService,
        EcommerceOrdersService,
        EcommerceOrderService,
        ProductPricingMethodService,
        PaymentService,
        HistoryService,
        PermissionService,
        AccountsService,
        CurrencyPipe,
        ArtworksService,
        PersonalizationService,
        VendorsService
    ],
    entryComponents: [
        InventoryItemDetailsComponent,
        TransferCustomerInventoryDialogComponent,
        AttachCategoryComponent,
        ConfigureVendorComponent,
        InventoryTransferComponent,
        OrderBottomSheetComponent,
        ProductDescriptionComponent,
        OrderMessagesComponent,
        PricingInventoryComponent,
        PricingInventoryNewComponent,
        SplitShipComponent,
        AdditionalChargesComponent,
        DecorationChargesComponent,
        EditChargeComponent,
        ProductDetailsDialogComponent,
        ProductDetailFormComponent,
        ProductUniversalSearchComponent,
        ProductManualEntryComponent,
        ColorInputDialogComponent,
        SelectDecorationComponent,
        ProductConfigDialogComponent,
        OrderPaymentFormDialogComponent,
        OrderBatchPaymentFormDialogComponent,
        ProductImageUploadComponent,
        ProductStoresDialogComponent,
        ProductMassUpdateComponent,
        StoresFormComponent,
        DecorationsListComponent,
        AttachDesignDialogComponent,
        ItemTypeDialogComponent,
        ProductDecoFormComponent,
        OrderPaymentMessageDialogComponent,
        LineitemImageUploadDialogComponent,
        PriceOverrideComponent,
        ProductNoteComponent,
        UpdateSkuDialogComponent,
        ProductKitsQtyDialogComponent,
        ProductLogoBlockDialogComponent,
        VoidPaymentDialogComponent,
        RefundPaymentDialogComponent,
        OrderStepDialogComponent,
        // Order Form Dependencies
        OrderItemFormComponent,
        OrderFindProductsComponent,
        OrderDecorationSelectComponent,
        OrderDecorationNewComponent,
        ItemNotesDialogComponent,
        ProductDecoChargePriceComponent,
        ProductChargePriceComponent,
        OrderCreateProductDialogComponent,
        SupplierDecorationDialogComponent,
        CalculatorAreaComponent,
        OrderArtProofComponent,
        OrderUnsavedChangesDialogComponent,
        AlternateReplaceWarningDialog,
        PersonalizationComponent,
        EditPersonalizationComponent,
        VouchingFormComponent,
        PoSyncComponent,
        SimpleQuoteContentEditorComponent,
        BoxLabelQuantityEditorComponent,
        PackingListQuantityEditorComponent,
        PopupNotesDialogComponent,
        InventoryAdjustmentNotesComponent
    ],
   exports: [
     OrderDetailsOverviewComponent,
     ProductStepComponent,
     OrderContainerComponent,
     DocumentsComponent,
     OrderActivityListComponent,
     HistoryComponent,
     TransferCustomerInventoryDialogComponent,
     OrderVouchingHistoryComponent,

   ]
})
export class FuseEcommerceModule
{
}

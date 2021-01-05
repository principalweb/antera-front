import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table'
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FuseSharedModule } from '@fuse/shared.module';
import {DatePipe} from '@angular/common';
import { ErrorComponent } from './error/error.component';
import { MediaDialogComponent } from './media-dialog/media-dialog.component';
import { ContactFormDialogComponent } from './contact-form/contact-form.component';
import { ActivityFormDialogComponent, CleanHtmlPipe } from './activity-form/activity-form.component';
import { CapitalizeFirstPipe } from '../features/activities/capitalizefirst.pipe';
import { FormsModule } from '@angular/forms';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';
import { AnteraInvoiceModernComponent } from './templates/invoice-modern/invoice-modern.component';
import { RemoveDecimalPipe } from './pipes/remove-decimal.pipe';
import { AnteraOrderConfirmationModernComponent } from './templates/order-confirmation-modern/order-confirmation-modern.component';
import { AnteraPurchaseOrderModernComponent } from './templates/purchase-order-modern/purchase-order-modern.component';
import { AnteraQuoteModernComponent } from './templates/quote-modern/quote-modern.component';
import { AnteraMultiQuoteModernComponent } from './templates/multi-quote-modern/multi-quote-modern.component';
import { IsCheckedAllPipe } from './pipes/is-checked-all.pipe';
import { IsCheckedAnyPipe } from './pipes/is-checked-any.pipe';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { RoundStringPipe } from './pipes/round-string.pipe';
import { CommaSeparatorPipe } from './pipes/comma-separator.pipe';
import { OrderFormDialogComponent } from './order-form-dialog/order-form-dialog.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { ProductImagePipe } from './pipes/product-image.pipe';
import { DefaultImage } from './directives/default-image';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { AddFileDialogComponent } from './add-file-dialog/add-file-dialog.component';
import { UrlFixPipe } from './pipes/url-fix.pipe';
import { SelectPaymentDialogComponent } from './select-payment-dialog/select-payment-dialog.component';
import { RelatedContactsDialogComponent } from './related-contacts-dialog/related-contacts-dialog.component';
import { RelatedAccountsDialogComponent } from './related-accounts-dialog/related-accounts-dialog.component';
import { AnteraPurchaseOrderDecorationModernComponent } from './templates/purchase-order-decoration-modern/purchase-order-decoration-modern.component';
import { MailAccountDialogComponent } from '../shared/account-form/account-form.component';
import { FuseMailComposeDialogComponent } from '../shared/compose/compose.component';
import { EmbeddedPurchaseOrderDecorationModernComponent } from './templates/embedded-purchase-order-decoration-modern/embedded-purchase-order-decoration-modern.component';
import { SavedSearchComponent } from './saved-search/saved-search.component';
import { DisableControlDirective } from './directives/disable-control';
import { SavedSearchButtonComponent } from './saved-search-button/saved-search-button.component';
import { SavedSearchFilterComponent } from './saved-search-filter/saved-search-filter.component';
import { IntegerPipe } from './pipes/integer.pipe';
import { OpportunityFormDialogComponent } from '../features/opportunities/opportunity-form/opportunity-form.component';
import { PreviewComponent } from './preview/preview.component';
import { AnteraArtProofModernComponent } from './templates/art-proof-modern/art-proof-modern.component';
import { ActivitiesListComponent } from './activities-list/activities-list.component';
import { MailCredentialsDialogComponent } from './mail-credentials-dialog/mail-credentials-dialog.component';
import { ShippingFormDialogComponent } from './shipping-form/shipping-form.component';
import { EquipmentFormComponent } from './equipment-form/equipment-form.component';
import { SourceFormComponent } from 'app/features/e-commerce/sources/source-form/source-form.component';
import { FormatNPipe } from './pipes/format-n.pipe';
import { AwsFileManagerComponent } from './aws-file-manager/aws-file-manager.component';
import { AwsCreateDirComponent } from './aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from './aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from './aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from './aws-rename-dir/aws-rename-dir.component';
import { AnteraOrderRecapModernComponent } from './templates/order-recap-modern/order-recap-modern.component';
import { AnteraCreditMemoModernComponent } from './templates/credit-memo-modern/credit-memo-modern.component';
import { AnteraPickListModernComponent } from './templates/pick-list-modern/pick-list-modern.component';
import { AnteraPackingListModernComponent } from './templates/packing-list-modern/packing-list-modern.component';
import { AnteraWorkOrderModernComponent } from './templates/work-order-modern/work-order-modern.component';
import { MatFormFieldRequiredDirective } from './directives/mat-form-field-required.directive';
import { SourceFactoryResponseComponent } from './templates/source-factory-response/source-factory-response.component';
import { PermissionCtrlDirective } from './directives/permission-ctrl.directive';
import { PermissionEntityGroupDialogComponent } from './permission-entity-group-dialog/permission-entity-group-dialog.component';
import { EntityGroupDialogComponent } from './permission-entity-group-dialog/entity-group-dialog/entity-group-dialog.component';
import { ContactDocumentsDialogComponent } from './contact-documents-dialog/contact-documents-dialog.component';
import { LogisticFormDialogComponent } from 'app/features/logistics/logistics-form/logistics-form.component';
import { AnteraGcPoConfirmationComponent } from './templates/gc-po-confirmation/gc-po-confirmation.component';
import { SourceFactoryFormComponent } from './source-factory-form/source-factory-form.component';
import { FuseKnowledgeBaseArticleComponent } from 'app/main/content/pages/knowledge-base/dialogs/article/article.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AccountsRelatedContactListComponent } from './accounts-related-contact-list/accounts-related-contact-list.component';
import { AnteraInvoiceProformaComponent } from './templates/invoice-proforma/invoice-proforma.component';
import { ContactsListDialogComponent } from './contacts-list-dialog/contacts-list-dialog.component';
import { PermissionActionCtrlDirective } from './directives/permission-action-ctrl.directive';
import { ReportDepartmentComponent } from './report-department/report-department.component';
import { OrderDetailDialogComponent } from './order-detail-dialog/order-detail-dialog.component';
import { LocationFormComponent } from './location-form/location-form.component';
import { PreviewProductComponent } from './preview-product/preview-product.component';
import { PortalModule } from '@angular/cdk/portal';
import { PreviewDecorationComponent } from './preview-decoration/preview-decoration.component';
import { DebounceClickDirective } from './directives/debounce-click';
import { FormValidationComponent } from './form-validation/form-validation.component';
import { AwsFileManagerDialogComponent } from './aws-file-manager-dialog/aws-file-manager-dialog.component';
import { SimpleChatDialogComponent } from './simple-chat-dialog/simple-chat-dialog.component';
import { AwsBasicDetailsComponent } from './aws-basic-details/aws-basic-details.component';
import { PopupNotesDialogComponent } from './popup-notes-dialog/popup-notes-dialog.component';
import { AccountFormComponent } from 'app/features/accounts/components/account-form/account-form.component';
import { AccountDetailsDialogComponent } from 'app/features/accounts/components/account-details-dialog/account-details-dialog.component';
import { ModuleTagDialogComponent } from './module-tag-dialog/module-tag-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    CdkTableModule,
  
    FuseSharedModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatToolbarModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatCardModule,
    FormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatDatetimepickerModule,
    MatNativeDatetimeModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatTabsModule,
    MatStepperModule,
    MatTooltipModule,
    NgxDocViewerModule,
    MatProgressBarModule,
    CKEditorModule,
    PortalModule,
  ],
  declarations: [
    AccountFormComponent,
    AccountDetailsDialogComponent,
    ErrorComponent,
    MediaDialogComponent,
    ContactFormDialogComponent,
    AddFileDialogComponent,
    ActivityFormDialogComponent,
    OrderFormDialogComponent,
    OrderDetailDialogComponent,
    SelectPaymentDialogComponent,
    OpportunityFormDialogComponent,
    SourceFormComponent,
    LogisticFormDialogComponent,
    EllipsisPipe,
    RoundStringPipe,
    CommaSeparatorPipe,
    CapitalizeFirstPipe,
    RemoveDecimalPipe,
    IsCheckedAllPipe,
    IsCheckedAnyPipe,
    SafeHtmlPipe,
    UrlFixPipe,
    IntegerPipe,
    CleanHtmlPipe,
    FormatNPipe,

    DefaultImage,
    MatFormFieldRequiredDirective,
    DisableControlDirective,
    DebounceClickDirective,
    AnteraGcPoConfirmationComponent,
    AnteraInvoiceModernComponent,
    AnteraInvoiceProformaComponent,
    AnteraOrderConfirmationModernComponent,
    AnteraPurchaseOrderModernComponent,
    AnteraQuoteModernComponent,
    AnteraMultiQuoteModernComponent,
    AnteraPurchaseOrderDecorationModernComponent,
    EmbeddedPurchaseOrderDecorationModernComponent,
    AnteraArtProofModernComponent,
    AnteraOrderRecapModernComponent,
    AnteraCreditMemoModernComponent,
    AnteraPickListModernComponent,
    AnteraPackingListModernComponent,
    AnteraWorkOrderModernComponent,
    AnteraQuoteModernComponent,
    
    ActivitiesListComponent,

    ProductImagePipe,
    ComingSoonComponent,
    RelatedContactsDialogComponent,
    RelatedAccountsDialogComponent,
    MailAccountDialogComponent,
    FuseMailComposeDialogComponent,
    SavedSearchComponent,
    SavedSearchButtonComponent,
    SavedSearchFilterComponent,
    PreviewComponent,
    MailCredentialsDialogComponent,
    ShippingFormDialogComponent,
    EquipmentFormComponent,
    AwsFileManagerComponent,
    AwsCreateDirComponent,
    AwsDocViewerComponent,
    AwsTaggingComponent,
    AwsRenameDirComponent,
    SourceFactoryResponseComponent,
    PermissionCtrlDirective,
    PermissionEntityGroupDialogComponent,
    EntityGroupDialogComponent,
    ContactDocumentsDialogComponent,
    SourceFactoryFormComponent,
    FuseKnowledgeBaseArticleComponent,
    AccountsRelatedContactListComponent,
    ContactsListDialogComponent,
    PermissionActionCtrlDirective,
    ReportDepartmentComponent,
    OrderDetailDialogComponent,
    LocationFormComponent,
    PreviewProductComponent,
    PreviewDecorationComponent,
    FormValidationComponent,
    AwsFileManagerDialogComponent,
    SimpleChatDialogComponent,
    AwsBasicDetailsComponent,
    PopupNotesDialogComponent,
    ModuleTagDialogComponent,
  ],
  exports: [
    ErrorComponent,
    MediaDialogComponent,
    ContactFormDialogComponent,
    AddFileDialogComponent,
    ActivityFormDialogComponent,
    ShippingFormDialogComponent,
    OrderFormDialogComponent,
    OrderDetailDialogComponent,
    ComingSoonComponent,
    SelectPaymentDialogComponent,
    EllipsisPipe,
    RoundStringPipe,
    CommaSeparatorPipe,
    CapitalizeFirstPipe,
    RemoveDecimalPipe,
    IsCheckedAllPipe,
    IsCheckedAnyPipe,
    SafeHtmlPipe,
    CleanHtmlPipe,
    UrlFixPipe,
    IntegerPipe,
    FormatNPipe,

    AnteraGcPoConfirmationComponent,
    AnteraInvoiceModernComponent,
    AnteraInvoiceProformaComponent,
    AnteraOrderConfirmationModernComponent,
    AnteraPurchaseOrderModernComponent,
    AnteraQuoteModernComponent,
    AnteraMultiQuoteModernComponent,
    AnteraPurchaseOrderDecorationModernComponent,
    EmbeddedPurchaseOrderDecorationModernComponent,
    AnteraArtProofModernComponent,
    AnteraOrderRecapModernComponent,
    AnteraCreditMemoModernComponent,
    AnteraPickListModernComponent,
    AnteraPackingListModernComponent,
    AnteraWorkOrderModernComponent,
    AnteraMultiQuoteModernComponent,
    
    ActivitiesListComponent,

    ProductImagePipe,
    DefaultImage,
    MatFormFieldRequiredDirective,
    DisableControlDirective,
    DebounceClickDirective,

    RelatedContactsDialogComponent,
    RelatedAccountsDialogComponent,
    SavedSearchComponent,
    SavedSearchButtonComponent,
    SavedSearchFilterComponent,
    MailCredentialsDialogComponent,
    EquipmentFormComponent,
    AwsFileManagerComponent,
    AwsCreateDirComponent,
    AwsDocViewerComponent,
    AwsTaggingComponent,
    AwsRenameDirComponent,
    SourceFactoryResponseComponent,
    PermissionCtrlDirective,
    PermissionEntityGroupDialogComponent,
    EntityGroupDialogComponent,
    SourceFactoryFormComponent,
    AccountsRelatedContactListComponent,
    ContactsListDialogComponent,
    PermissionActionCtrlDirective,
    LocationFormComponent,
    AwsFileManagerDialogComponent,
  ],
  entryComponents: [
    AccountDetailsDialogComponent,
    MediaDialogComponent,
    ContactFormDialogComponent,
    ContactDocumentsDialogComponent,
    AddFileDialogComponent,
    ActivityFormDialogComponent,
    OrderFormDialogComponent,
    OrderDetailDialogComponent,
    ComingSoonComponent,
    SelectPaymentDialogComponent,
    RelatedContactsDialogComponent,
    RelatedAccountsDialogComponent,
    FuseMailComposeDialogComponent,
    MailAccountDialogComponent,
    OpportunityFormDialogComponent,
    MailCredentialsDialogComponent,
    ShippingFormDialogComponent,
    PreviewComponent,
    EquipmentFormComponent,
    SourceFormComponent,
    AwsCreateDirComponent,
    AwsDocViewerComponent,
    AwsTaggingComponent,
    AwsRenameDirComponent,
    EntityGroupDialogComponent,
    LogisticFormDialogComponent,
    FuseKnowledgeBaseArticleComponent,
    AccountsRelatedContactListComponent,
    ContactsListDialogComponent,
    ReportDepartmentComponent,
    LocationFormComponent,
    PreviewProductComponent,
    PreviewDecorationComponent,
    FormValidationComponent,
    AwsFileManagerDialogComponent,
    SimpleChatDialogComponent,
    ModuleTagDialogComponent
  ],
  providers: [
    DatePipe
  ]
})
export class SharedModule { }

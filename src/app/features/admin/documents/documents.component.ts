import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { AnteraInvoiceModernComponent } from '../../../shared/templates/invoice-modern/invoice-modern.component';
import { AnteraOrderConfirmationModernComponent } from '../../../shared/templates/order-confirmation-modern/order-confirmation-modern.component';
import { AnteraPurchaseOrderModernComponent } from '../../../shared/templates/purchase-order-modern/purchase-order-modern.component';
import { AnteraQuoteModernComponent } from '../../../shared/templates/quote-modern/quote-modern.component';
import { Subscription, of, forkJoin } from 'rxjs';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DocumentsService } from '../../../core/services/documents.service';
import { orderDetail, defaultDocLabels, MockAccount, MockProducts } from './documents';
import { AddFileDialogComponent } from '../../../shared/add-file-dialog/add-file-dialog.component';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
import { MatrixRow } from '../../../models';
import { MessageService } from 'app/core/services/message.service';
import { fx2Str, exportImageUrlForPDF } from 'app/utils/utils';
import { MailAccountDialogComponent } from '../../../shared/account-form/account-form.component';
import * as moment from 'moment';
import { MailService } from 'app/main/content/apps/mail/mail.service';
import { ApiService } from 'app/core/services/api.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { AnteraOrderRecapModernComponent } from 'app/shared/templates/order-recap-modern/order-recap-modern.component';
import { AnteraCreditMemoModernComponent } from 'app/shared/templates/credit-memo-modern/credit-memo-modern.component';
import { AnteraMultiQuoteModernComponent } from 'app/shared/templates/multi-quote-modern/multi-quote-modern.component';
import { ModuleField } from 'app/models/module-field';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { AnteraInvoiceProformaComponent } from 'app/shared/templates/invoice-proforma/invoice-proforma.component';
import { PurchaseOrderDecorationsDocument } from 'app/features/documents/templates/purchase-order-decorations.document';
import { InvoiceDocument } from 'app/features/documents/templates/invoice.document';
import { OrderConfirmationDocument } from 'app/features/documents/templates/order-confirmation.document';
import { QuoteDocument } from 'app/features/documents/templates/quote.document';
import { PackingListDocument } from 'app/features/documents/templates/packing-list.document';
import { ArtProofDocument } from 'app/features/documents/templates/art-proof.document';
import { PurchaseOrderDocument } from 'app/features/documents/templates/purchase-order.document';
import { DocumentHelpersService } from 'app/features/documents/document-helpers.service';
import { OrderRecapDocument } from 'app/features/documents/templates/order-recap.document';
import { MultiQuoteDocument } from 'app/features/documents/templates/multi-quote.document';
import { InvoiceProformaDocument } from 'app/features/documents/templates';
import { WorkOrderDocument } from 'app/features/documents/templates/work-order.document';
import { CreditMemoDocument } from 'app/features/documents/templates/credit-memo.document';
import { PickListDocument } from 'app/features/documents/templates/pick-list.document';
import { take, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-admin-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class DocumentsComponent implements OnInit {

    order: any;
    currentTemplate = {
        'id': 1,
        'url': 'assets/images/templates/template1.png',
        'name': 'Template 1'
    };

    currentDocument = "Invoice";

    @ViewChild(AnteraInvoiceModernComponent) modernInvoiceComponent: AnteraInvoiceModernComponent;
    @ViewChild(AnteraInvoiceProformaComponent) invoiceProformaComponent: AnteraInvoiceModernComponent;
    @ViewChild(AnteraOrderConfirmationModernComponent) modernOrderConfirmationComponent: AnteraOrderConfirmationModernComponent;
    @ViewChild(AnteraPurchaseOrderModernComponent) modernPurchaseOrderComponent: AnteraPurchaseOrderModernComponent;
    @ViewChild(AnteraQuoteModernComponent) modernQuoteComponent: AnteraQuoteModernComponent;
    @ViewChild(AnteraMultiQuoteModernComponent) modernMultiQuoteComponent: AnteraQuoteModernComponent;
    @ViewChild(AnteraOrderRecapModernComponent) modernOrderRecapComponent: AnteraOrderRecapModernComponent;
    @ViewChild(AnteraCreditMemoModernComponent) modernCreditMemoComponent: AnteraCreditMemoModernComponent;

    onDocumentOptionsChanged: Subscription;
    onSetLogoChangedSubscription: Subscription;
    onGetLogoChangedSubscription: Subscription;

    onSetAddonLogoChangedSubscription: Subscription;
    onGetAddonLogoChangedSubscription: Subscription;

    docOptions = [];
    docDefaultOptions = [];
    dialogRef: MatDialogRef<AddFileDialogComponent>;
    dialogRef2: MatDialogRef<MailAccountDialogComponent>;

    sysConfig: any;
    loading = false;
    logoUrl = "";
    addonLogoUrl = "";
    productData = [];
    docLabels: any;
    dynamicDocumentLabels = [];
    defaultDocLabels = defaultDocLabels;
    isLoggedIn = false;
    invoiceDate: any = { date: moment(new Date()).format('YYYY-MM-DD') };
    isAdmin = true;
    creditTerms = [];
    selectedDecoType = 'Embroidery';
    fields: ModuleField[];
    savedDocumentFieldsLabels: ModuleField[];
    document: any;
    documentDefinition: any;
    decoLocationsList = [];
    ordersConfig = [];
    constructor(
        private documentService: DocumentsService,
        private msg: MessageService,
        public dialog: MatDialog,
        private api: ApiService,
        private globalService: GlobalConfigService,
        private _fuseSidebarService: FuseSidebarService,
        private documentFormatter: DocumentHelpersService,
    ) {
        this.onDocumentOptionsChanged =
            this.documentService.documentOptionsChanged
                .subscribe((docOptions) => {
                    this.docOptions = docOptions;
                    this.getDocAllDefaultOptions();
                    this.makePdf();
                });

        this.onGetLogoChangedSubscription =
            this.documentService.onGetLogoChanged
                .subscribe((res) => {
                    this.logoUrl = res.url;
                });

        this.onGetAddonLogoChangedSubscription =
            this.documentService.onGetAddonLogoChanged
                .subscribe((res) => {
                    this.addonLogoUrl = res.url;
                });


        this.api.getDropdownOptions({
            dropdown: [
                'sys_credit_terms_list'
            ]
        }).subscribe((res: any[]) => {
            if (!res) return;
            const creditTermDropdown = find(res, { name: 'sys_credit_terms_list' });
            this.creditTerms = creditTermDropdown.options;
        });
    }

    ngOnInit() {
        this.order = orderDetail;
        this.productData = this.groupProductsGrouppedByColorsSizes(this.order.lineItems);
        this.docLabels = this.defaultDocLabels[this.currentDocument];
        this.globalService.loadSysConfig().then(() => {
            this.sysConfig = this.globalService.getSysConfig();
        });
        this.getDecoLocationsList();
        this.getModuleFields();
        this.getSavedDocumentFieldsLabels();
        this.makePdf();
    }

    ngOnDestroy() {
        this.onDocumentOptionsChanged.unsubscribe();
        this.onGetLogoChangedSubscription.unsubscribe();
        this.onGetAddonLogoChangedSubscription.unsubscribe();
    }

    getSavedDocumentFieldsLabels() {
        const opts =
        {
            offset: 0,
            limit: 1000,
            order: 'moduleSection',
            orient: 'asc',
            term: { module: 'Documents' }
        }

        return this.api.getFieldsList(opts).subscribe((response: ModuleField[]) => {
            this.savedDocumentFieldsLabels = response;
            this.groupSavedDocumentFieldsLabels();
        });
    }
    getModuleFields() {
        const opts =
        {
            offset: 0,
            limit: 200,
            order: 'module',
            orient: 'asc',
            term: { module: 'Orders' }
        }

        return this.api.getFieldsList(opts).subscribe((response: ModuleField[]) => {
            this.fields = response;
        });
    }
    groupSavedDocumentFieldsLabels() {
        let savedDocumentFieldsLabels = groupBy(this.savedDocumentFieldsLabels, 'moduleSection');
        each(keys(savedDocumentFieldsLabels), key => {
            let docs = savedDocumentFieldsLabels[key];
            this.dynamicDocumentLabels[key] = [];
                docs.forEach((doc: any) => {
                    if (doc.fieldName && doc.labelName) {
                        console.log(doc.fieldName);
                        var obj = {};
                        obj[doc.fieldName] = doc.labelName;
                        this.dynamicDocumentLabels[key].push(obj);
                    }
                });
            
        });
    }
    templateChange(template) {
        this.currentTemplate = template;
        this.documentService.onTemplateChanged.next(this.currentTemplate.id);
    }

    optionChanged(docOptions) {
        this.documentService.updateDocumentOptions(docOptions)
            .then((res) => {
                this.msg.show(`Option updated status: ${res}`, 'success');
            });

        this.docOptions = docOptions;
        this.makePdf();
    }



    makePdf() {
        if (!this.order) {
            return;
        }    
        const defaultConfig = {
            fields: this.fields,
            dynamicDocumentLabels: this.dynamicDocumentLabels[this.currentDocument],
            logoUrl: this.logoUrl,
            docLabels: this.docLabels,
            docOptions: this.docOptions,
            defaultDocOptions: this.docOptions,
            docDefaultOptions: this.docDefaultOptions,
            creditTerms: this.creditTerms,
            decoTypes: Object.keys({'Embroidery' : this.selectedDecoType, 'Die_Cut' : 'Die Cut'}),
            selectedDecoVendor: 'Embroidery Vendor DUbow',
            selectedDecoDesigns: 'D000376',            
            selectedDecoVariation: '5ce84543eedab',
            selectedDecoLocation: 'Front - Left Chest',
            selectedWorkDataMatrixIds : ['21738'],
            selectedWorkOrderCnt: '001',
            totalWorkOrderCnt: '001',
            ordersConfig: this.ordersConfig,
            personalizations: []
        };

        this.documentDefinition = undefined;

        switch (this.currentDocument) {
            case 'Invoice':
                this.document = new InvoiceDocument({
                    ...defaultConfig,
                    order: this.order,
                    invoiceDate: this.invoiceDate,
                });
                break;
            case 'CreditMemo':
                this.document = new CreditMemoDocument({
                    ...defaultConfig,
                    order: this.order,
                    invoiceDate: this.invoiceDate,
                });
                break;
            case 'Proforma Invoice':
                this.document = new InvoiceProformaDocument({
                    ...defaultConfig,
                    order: this.order,
                    invoiceDate: this.invoiceDate,
                });
                break;
            case 'Order Recap':
                this.document = new OrderRecapDocument({
                    ...defaultConfig,
                    order: this.order,
                    invoiceDate: this.invoiceDate,
                });
                break;
            case 'Order Confirmation':
                this.document = new OrderConfirmationDocument({
                    ...defaultConfig,
                    order: this.order,
                    decoLocationsList : this.decoLocationsList,
                    invoiceDate: this.invoiceDate,
                });
                break;
            case 'Quote':
                this.document = new QuoteDocument({
                    ...defaultConfig,
                    order: this.order,
                });
                break;
            case 'Credit Memo':
                this.document = new CreditMemoDocument({
                    ...defaultConfig,
                    order: this.order,
                });
                break;
            case 'Multi Quote':
                this.document = new MultiQuoteDocument({
                    ...defaultConfig,
                    order: this.order,
                    resolve: MockProducts
                });

                break;
            case 'Packing List':
                let packingListTempQuantity = [];
                this.document = new PackingListDocument({
                    ...defaultConfig,
                    order: this.order,
                    vendorId: '',
                    updatedpackingListTempQuantity: false,
                    packingListTempQuantity: packingListTempQuantity,

                });
                break;

            case 'Pick List':
                this.document = new PickListDocument({
                    ...defaultConfig,
                    order: this.order
                });
                break;

            case 'Art Proof':
                this.document = new ArtProofDocument({
                    ...defaultConfig,
                    order: this.order
                });
            case 'Decoration Po':
                this.document = new PurchaseOrderDecorationsDocument({
                    ...defaultConfig,
                    order: this.order,
                    vendorId: this.order.lineItems[0].vendorId,
                });
                break;
            case 'Purchase Order':
                this.document = new PurchaseOrderDocument({
                    ...defaultConfig,
                    order: this.order,
                    resolve: MockAccount,
                    vendorId: this.order.lineItems[0].vendorId,
                });
                break;
            case 'Work Order':
                this.document = new WorkOrderDocument({
                    ...defaultConfig,
                    order: this.order,
                    resolve: MockAccount,
                    decoLocationsList : this.decoLocationsList,
                    vendorId: this.order.lineItems[0].vendorId,
                });
                break;
            default: {
                this.document = undefined;
            }
        }

        if (this.document) {
            this.document.setFormatter(this.documentFormatter);
            this.document.getDocumentDefinition().subscribe((definition) => {
                this.documentDefinition = definition;
            });
        }
    }


    documentChanged(document) {
        this.currentDocument = document;
        this.docOptions = [];
        this.documentService.onDocumentChanged.next(this.currentDocument);
        this.docLabels = this.defaultDocLabels[this.currentDocument];
    }

    uploadLogo() {

        this.dialogRef = this.dialog.open(AddFileDialogComponent, {
            panelClass: 'add-file-popup',
            data: {
                addonLogo: false
            }
        });

        this.dialogRef.afterClosed()
            .subscribe(result => {
                if (result) {
                    this.logoUrl = result;
                    // this.dialogRef = null;
                    // this.loading = true;
                    // this.documentService.getLogo().then(() => {
                    //     this.loading = false;
                    // });
                }
            });
    }

    uploadAddonLogo() {

        this.dialogRef = this.dialog.open(AddFileDialogComponent, {
            panelClass: 'add-file-popup',
            data: {
                addonLogo: true
            }
        });

        this.dialogRef.afterClosed()
            .subscribe(result => {
                if (result) {
                    this.addonLogoUrl = result;
                }
            });
    }
    getDocAllDefaultOptions() {
        this.docDefaultOptions = [];
        var data = [];
        each(this.docOptions, row => {
            if (row.value) {
                data.push(row.name);
            }
        });
        this.api.getDocsAllDefaultOptions({ names: data, type: this.currentDocument })
            .subscribe((res: any) => {
                if (res) {
                    this.docDefaultOptions = res;
                }
            });
    }

    groupProductsGrouppedByColorsSizes(lineItems) {
        const productData = [];

        let poShippingBillingDetails = lineItems[0].poShippingBillingDetails;
        if (!poShippingBillingDetails)
            poShippingBillingDetails = {};

        lineItems.forEach((lineItem: any) => {

            if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
                lineItem.matrixRows = [new MatrixRow({})];
            }

            let totalCount = sum(
                lineItem.matrixRows.map(row => Number(row.quantity))
            );

            lineItem.matrixRows.forEach((row: any) => {
                const defaultImage = (lineItem.quoteCustomImage && lineItem.quoteCustomImage[0]) || 'assets/images/ecommerce/product-image-placeholder.png';

                const newRow = {
                    productName: lineItem.productName,
                    productId: lineItem.itemNo,
                    inhouseId: lineItem.inhouseId,
                    image: exportImageUrlForPDF(row.imageUrl || defaultImage),
                    quantity: +row.quantity,
                    price: row.price,
                    cost: row.cost,
                    color: row.color,
                    size: row.size,
                    matrixRows: [row],
                    matrixUpdateId: row.matrixUpdateId,
                    customerDescription: lineItem.customerDescription,
                    vendorDescription: lineItem.vendorDescription,
                    sizeList: [{ size: row.size, quantity: row.quantity }],
                    addonCharges: (findIndex(productData, { productId: lineItem.itemNo }) < 0) ? lineItem.addonCharges : [],
                    lineItem: lineItem,
                    matchOrderQty: totalCount,
                    poShippingBillingDetails: !lineItem.poShippingBillingDetails ? {} : lineItem.poShippingBillingDetails
                };
                productData.push(newRow);
            });
        });

        productData.forEach(row => {
            let decoVendors = [];

            for (const v of row.lineItem.decoVendors) {
                // let q = 0;
                // v.decorationDetails.forEach(decoDetail => {
                //     const mrow = find(row.matrixRows, { matrixUpdateId: decoDetail.matrixId });
                //     if (mrow) {
                //         q += Number(mrow.quantity);
                //     }
                // });

                // if (q === 0) {
                //     break;
                // }

                if (!v.decorationDetails[0])
                    break;

                if (row.matrixUpdateId == v.decorationDetails[0].matrixId) {
                    decoVendors.push({
                        id: v.decoVendorRecordId,
                        designNo: v.designModal,
                        image: v.decorationDetails[0].variationImages[0],
                        name: v.designName,
                        decoLocation: v.decoLocation,
                        decoType: v.decoType,
                        decoTypeName: v.decoTypeName,
                        quantity: row.quantity,
                        price: fx2Str(v.customerPrice),
                        itemCost: fx2Str(v.itemCost),
                        decoVendorId: v.vendorId,
                        decoVendorName: v.vendorName,
                        decorationDetails: v.decorationDetails,
                        addonCharges: v.addonCharges,
                        poShippingBillingDetails: v.poShippingBillingDetails
                    });
                }
            }
            row.decoVendors = decoVendors;
        });

        return productData;
    }

    /**
    * Toggle sidebar
    *
    * @param name
    */
    toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

    getDecoLocationsList() {

        const opts = {
            offset: 0,
            limit: 1000,
            order:"locationName",
            orient:"asc",
            imageOnly:"1",
            term: {
            }
          };

        return this.api.getDecorationLocationsList(opts).subscribe((response: any) => {
            this.decoLocationsList = response;
        });
    }
    

}

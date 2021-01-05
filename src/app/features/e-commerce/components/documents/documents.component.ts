import { CxmlService, CxmlEnabled } from 'app/core/services/cxml.service';
import { Component, OnInit, ViewEncapsulation, Input, SecurityContext, NgZone, ViewChild, AfterViewInit, Output, EventEmitter  } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DocumentsService } from 'app/core/services/documents.service';
import { EcommerceOrderService } from '../../order.service';
import * as html2pdf from 'html2pdf.js';
import { MatrixRow, Account } from 'app/models';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
import { defaultDocLabels } from '../../../admin/documents/documents';
import { MessageService } from 'app/core/services/message.service';
import { fx2Str, exportImageUrlForPDF, b64toBlob, fx2N } from 'app/utils/utils';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { MailAccountDialogComponent } from 'app/shared/account-form/account-form.component';
import { ApiService } from 'app/core/services/api.service';
import * as moment from 'moment';
import { AuthService } from 'app/core/services/auth.service';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail, Attachment } from 'app/models/mail';
import { PsService } from 'app/core/services/ps.service';
import { FeaturesService } from 'app/core/services/features.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { Subscription, forkJoin, of, Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { AccountsRelatedContactListComponent } from 'app/shared/accounts-related-contact-list/accounts-related-contact-list.component';
import { ModuleField } from 'app/models/module-field';
import { IDocument } from 'app/features/documents/document.interface';
import { PurchaseOrderDocument } from 'app/features/documents/templates/purchase-order.document';
import { PurchaseOrderDecorationsDocument } from 'app/features/documents/templates/purchase-order-decorations.document';
import { DocumentHelpersService } from 'app/features/documents/document-helpers.service';
import { DocumentPdfComponent } from 'app/features/documents/document-pdf/document-pdf.component';
import { OrderConfirmationDocument } from 'app/features/documents/templates/order-confirmation.document';
import { CreditMemoDocument } from 'app/features/documents/templates/credit-memo.document';
import { InvoiceDocument } from 'app/features/documents/templates/invoice.document';
import { QuoteDocument } from 'app/features/documents/templates/quote.document';
import { PackingListDocument } from 'app/features/documents/templates/packing-list.document';
import { ArtProofDocument } from 'app/features/documents/templates/art-proof.document';
import { InvoiceProformaDocument } from 'app/features/documents/templates';
import { MultiQuoteDocument } from 'app/features/documents/templates/multi-quote.document';
import { SimpleQuoteDocument } from 'app/features/documents/templates/simple-quote.document';
import { OrderRecapDocument } from 'app/features/documents/templates/order-recap.document';
import { WorkOrderDocument } from 'app/features/documents/templates/work-order.document';
import { BoxLabelsDocument } from 'app/features/documents/templates/box-labels.document';
import { flatMap, map, take, switchMap } from 'rxjs/operators';
import { PickListDocument } from 'app/features/documents/templates/pick-list.document';
import { ActivatedRoute } from '@angular/router';
import { OrderFormService } from '../../order-form/order-form.service';
import { OrderArtProofComponent } from '../../order-form/order-art-proof/order-art-proof.component';
import { VouchingsService } from 'app/features/vouchings/vouchings.service';
import { NoteService } from 'app/main/note.service';
import { SimpleQuoteContentEditorComponent } from '../simple-quote-content-editor/simple-quote-content-editor.component';
import { BoxLabelQuantityEditorComponent } from '../box-label-quantity-editor/box-label-quantity-editor.component';
import { PackingListQuantityEditorComponent } from '../packing-list-quantity-editor/packing-list-quantity-editor.component';
@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class DocumentsComponent implements OnInit {

    @Input() paymentList = [];
    @Input() artProofs = [];
    @Input() fields = [];
    @Input() ordersConfig = {};
    @Input() documentsToUpload = '';
    @Output() removeDocumentsToUpload = new EventEmitter();

    onDocumentOptionsChanged: Subscription;
    onGetLogoChangedSubscription: Subscription;
    onGetDocumentLabelsChangedSubscription: Subscription;
    onOrderPerDocumentsChangedSubscription: Subscription;
    onOrderchangedSubscription: Subscription;
    onPaymentTracksChangedSubscription: Subscription;
    onDropdownOptionsForOrdersChangedSubscription: Subscription;

    orderDetails: any;
    filename = '';
    selectedDocument = '';
    selectedCurrentDocumentKey = '';
    selectedPoVendor = '';
    selectedPLVendor = '';
    selectedDecoType = '';
    selectedDecoVendor = '';
    selectedDecoDesigns = '';
    selectedDecoVariation = '';
    selectedDecoLocation = '';
    selectedWorkDataMatrixIds: any;
    selectedWorkOrderCnt = '';
    totalWorkOrderCnt = 0;
    docOptions = [];
    docDefaultOptions = [];
    personalizations = [];
    documentList = ['Order Confirmation',
        'Credit Memo',
        'Packing List',
        'Quote',
        'Multi Quote',
        'Simple Quote'
    ];
    internalDocuments = ['Order Recap', 'Pick List'];
    lineItemGroupByVendors: any = [];
    packingListGroupByVendors: any = [];
    packingListGroupByVendorsCnt = 0;
    packingListTempQuantity: any = [];
    packingListTempBoxNotes: any = [];
    customPLNote = '';
    boxNotesPLColumn = '';
    updatedpackingListTempQuantity = false;
    decoDataGroupByDecoVendors: any = [];
    // TODO find correct type of workDataGroupByDecoTypes
    workDataGroupByDecoTypes: any = [];
    decoDataGroupByDecoVendorsExcludeingVendors: any = [];
    workDataGroupByDesigns = [];
    workDataGroupByVendorsAndDesigns = [];
    workDataGroupByVendorsAndDesignsSorted = [];
    workDataGroupByVendorsAndDesignsSortedV = [];
    workDataGroupByVendorsAndDesignsSortedVariation = [];
    workDataGroupByVendorsAndDesignsSortedLocation = [];
    workDataMatrixIds = [];
    workDataForProduction = [];
    matrixGroupByDecoration = [];
    matrixToLineItemsIds = [];
    orderDataGroupByDecoTypes = [];
    workDataDecoDesignStrings = [];
    workDataDecoDesignStringsArray = [];
    workDataDecoDesignStringsByVariationAndLocation = [];
    uniqueVariationsGroup = [];
    totalUniqueDecoTypes = 0;
    productData = [];
    poDecoVendorData = [];
    poSummaryList = [];
    shipInfoList = [];
    logoUrl = '';
    docLabels: any;
    dynamicDocumentLabels = [];
    allDocumentLabels: any;
    defaultDocLabels = defaultDocLabels;
    loading = false;
    documentLoading = false;
    isLoggedIn = false;
    mailToType = 'customer';
    creditTerms = [];
    emailFound = false;
    getBoxLabelDoc = false;
    cuser = '';
    dialogRef2: MatDialogRef<MailAccountDialogComponent>;
    dialogRef3: MatDialogRef<FuseMailComposeDialogComponent>;
    dialogRef: MatDialogRef<MailAccountDialogComponent>;
    credentialsDialogRef: MatDialogRef<MailCredentialsDialogComponent>

    @ViewChild('documentRenderer') documentRenderer: DocumentPdfComponent;

    invoiceDate: any = { date: moment(new Date()).format('YYYY-MM-DD') };
    accountFields: ModuleField[];
    savedDocumentFieldsLabels: ModuleField[];
    decoLocationsList = [];
    defaultDocOptions = [
        {
            'Total Due': 1
        },
        {
            'Order Date': 1
        },
        {
            'In Hands Date': 1
        },
        {
            'Ship Via': 1
        },
        {
            'Due Date': 1
        },
        {
            'Shipping Date': 1
        },
        {
            'Customer PO #': 1
        },
        {
            'Payment Terms': 1
        },
        {
            'Salesperson Name': 1
        },
        {
            'Salesperson Phone': 1
        },
        {
            'Salesperson Email': 1
        },
        {
            'CSR Name': 1
        },
        {
            'CSR Phone': 1
        },
        {
            'CSR Email': 1
        },
        {
            'Item Number': 1
        },
        {
            'Product Image': 1
        },
        {
            'Product Unit': 1
        },
        {
            'Description': 1
        },
        {
            'Show Decimal': 1
        },
        {
            'Payment Button': 1
        },
        {
            'Decoration Image': 1
        },
        {
            'Size': 1
        },
        {
            'Color': 1
        }
    ];
    isAdmin = false;
    docSettings: any;

    b64toBlob = b64toBlob;
    psEnabled = false;
    electronicEndpoint = 'PS';
    generateWorkOrderBy = 'variation';

    sysConfig: any;
    showDecoDocs: boolean = true;
    showPODocs: boolean = true;
    showWorkOrderDocs: boolean = true;
    showPackigListByVendor: boolean = false;
    showPackigListByAllVendors: boolean = false;
    showPoConfirmation: boolean = false;
    logisticsSubscription: Subscription;
    psVendors: Object = {};
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    hideEmailButton: boolean = false;
    docGridView: boolean = false;
    hideQuoteTotal: boolean = false;
    docGridViewGroupByVariation: boolean = false;
    document: IDocument;

    cxmlStatus: Subscription;
    cxmlInvoiceEnabled = false;

    documentDefinition: any;
    proformaDate: any;
    quotesAllProducts = [];

    vouchedInfo: any;
    constructor(private documentService: DocumentsService,
        private orderService: EcommerceOrderService,
        public noteService: NoteService,
        private msg: MessageService,
        public dialog: MatDialog,
        private api: ApiService,
        private auth: AuthService,
        private ps: PsService,
        private zone: NgZone,
        private globalService: GlobalConfigService,
        private featureService: FeaturesService,
        private cxmlService: CxmlService,
        private vouchService: VouchingsService,
        private domSanitizer: DomSanitizer,
        private documentHelper: DocumentHelpersService,
        public orderFormService: OrderFormService,
        private route: ActivatedRoute,
    ) {
        this.cxmlStatus = this.cxmlService.cxmlStatus
        .subscribe((response: CxmlEnabled) => {
          this.cxmlInvoiceEnabled = response.invoice;
        });
        this.cuser = this.auth.getCurrentUser().userId;
        this.docOptions = this.defaultDocOptions.map(option => Object.keys(option).map(key => ({ name: key, value: option[key] == 1 ? true : false })).pop());

        this.document = undefined;
        this.documentDefinition = undefined;
        route.params.subscribe((routeParams) => {
            if (this.orderDetails && routeParams.id !== this.orderDetails.id) {
                this.document = undefined;
                this.documentDefinition = undefined;
            }
        });
    }

    ngOnInit() {
        this.sysConfig = this.globalService.getSysConfig();
        if(typeof this.ordersConfig['settings'] !=='undefined'  && typeof this.ordersConfig['settings']['enableDefaultGridView'] !=='undefined' && this.ordersConfig['settings']['enableDefaultGridView'] == '1'){
            this.docGridView = true;
        }
        if(typeof this.ordersConfig['settings'] !=='undefined'  && typeof this.ordersConfig['settings']['showPackigListByVendor'] !=='undefined' && this.ordersConfig['settings']['showPackigListByVendor'] == '1'){
            this.showPackigListByVendor = true;
            this.showPackigListByAllVendors = true;
        }
        if(typeof this.ordersConfig['settings'] !=='undefined'  && typeof this.ordersConfig['settings']['generateWorkOrderBy'] !=='undefined' && this.ordersConfig['settings']['generateWorkOrderBy'] != ''){
            this.generateWorkOrderBy = this.ordersConfig['settings']['generateWorkOrderBy'];
            this.generateWorkOrderBy = 'variation';
        }
        
        /*
        if(typeof this.ordersConfig['settings'] !=='undefined'  && typeof this.ordersConfig['settings']['showPackigListByAllVendors'] !=='undefined' && this.ordersConfig['settings']['showPackigListByAllVendors'] == '1'){
           this.showPackigListByAllVendors = true;
        }*/
        if(this.showPackigListByVendor){
                let PLIndex = this.documentList.indexOf('Packing List');
                if(PLIndex > -1){
                    this.documentList.splice(PLIndex, 1); 
                }
        }
        this.getSavedDocumentFieldsLabels();
        this.getAccountFields();
        this.getDecoLocationsList();
        this.api.getPromoStandardsVendors().subscribe((res: any[]) => {
            this.psVendors = res.reduce((vendors, vendor) => {
                vendors[vendor.name] = vendor;
                return vendors;
            }, {});
        });

        this.onOrderchangedSubscription =
            this.orderService.onOrderChanged.subscribe((order: any) => {
                if (!order.id) {
                    return;
                }

                this.vouchService.getOrderVouchedLines(order.id)
                  .subscribe(response => {
                    this.vouchedInfo = response;
                  },
                  error => {
                    this.vouchedInfo = [];
                  });

                this.orderDetails = order;
                this.proformaDate = moment(order.proformaDate).format('YYYY-MM-DD');
                this.orderDetails.shipVia = this.domSanitizer.sanitize(SecurityContext.HTML, order.shipVia);
                this.configureLogisticsIfEnabled();
                this.filename = `${this.documentService.document}.${this.orderDetails.orderNo}.pdf`;
                if(this.selectedDocument === 'Work Order'){
                     if(this.getBoxLabelDoc){
                         this.filename = `Box Label.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
                     }else{
                         this.filename = `${this.documentService.document}.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
                     }
                }
                // Find Vendors for PO
                // this.lineItemGroupByVendors = groupBy(order.lineItems, 'vendorName');

                const vendorLineItems = order.lineItems.filter((item) => {
                    return (item.lineType != '4' && item.doNotIssuePo != '1') && (
                        item.matrixRows.some((row) => {
                            return row.poType == 'DropShip' || row.fulfillments.some((fulfillment) => fulfillment.type === 'DropShip');
                        })
                    );
                });

                this.lineItemGroupByVendors = groupBy(vendorLineItems, 'vendorName');

            const vendorLineItemsForPL = order.lineItems.filter((item) => {
            return (item.lineType != '4' && item.lineType != '3' && item.hideLine != '1') && (
                item.matrixRows.some((row) => {
                return row.matrixUpdateId > 0 ;
               })
            );
            });

            this.packingListGroupByVendors = groupBy(vendorLineItemsForPL, 'vendorName');
            this.packingListGroupByVendorsCnt = Object.keys(this.packingListGroupByVendors).length;


                this.productData = this.generateProductDataByColorsSizes(order.lineItems);
                this.decoDataGroupByDecoVendors = this.groupDecoDataByDecoVendors(this.productData, true);                
                this.decoDataGroupByDecoVendorsExcludeingVendors = this.groupDecoDataByDecoVendors(this.productData, false); 
                this.workDataGroupByDesigns = this.groupDecoDataByDecoDesigns(Object.keys(this.decoDataGroupByDecoVendorsExcludeingVendors),this.productData);
                console.log('this.workDataGroupByDesigns');
                console.log(this.workDataGroupByDesigns);

                this.workDataGroupByVendorsAndDesigns = this.groupDecoDataByVendorsAndDecoDesigns(Object.keys(this.decoDataGroupByDecoVendorsExcludeingVendors), this.workDataGroupByDesigns,this.productData);
                

                console.log('this.workDataGroupByVendorsAndDesigns');
                console.log(this.workDataGroupByVendorsAndDesigns);

                // Find Decoration Types for Work Order
                this.workDataGroupByDecoTypes = this.groupDataByDecoTypes(this.productData);
                this.orderDataGroupByDecoTypes = this.workDataGroupByDecoTypes;
                this.totalUniqueDecoTypes = Object.keys(this.workDataGroupByDecoTypes).length
                this.orderService.getOrderPerDocType(order.id, 'invoice').subscribe(console.log);
                if (this.orderService.selectedDocument === 'Purchase Order') {
                    this.selectedDocument = 'Purchase Order';
                    this.documentService.document = 'Purchase Order';
                    this.selectedPoVendor = this.orderService.selectedPoVendor;
                    this.orderService.getOrderPerDocType(order.id, 'po').subscribe(console.log);
                } else if (this.orderService.selectedDocument === 'Decoration PO') {
                    this.selectedDocument = 'Purchase Order';
                    this.documentService.document = 'Purchase Order';
                    this.selectedPoVendor = this.orderService.selectedPoVendor;
                    this.orderService.getOrderPerDocType(order.id, 'po').subscribe(console.log);
                    //  } else if (this.orderService.selectedDocument === 'Art Proof') {
                    //     this.selectedDocument = 'Art Proof';
                    //     this.onDocumentSelected('Art Proof');
                    //   this.orderService.getOrderPerDocType(order.id, 'po').subscribe(console.log);
                }

                if ((order.orderType == 'Order' || order.orderType == 'StoreOrder' || order.orderType == 'WebStore') && (order.orderStatus == 'Billed')) {
                    this.selectedDocument = 'Invoice';
                    this.documentService.document = 'Invoice';
                    if (!this.documentList.includes('Invoice')) {
                        this.documentList.splice(0, 0, 'Invoice');
                    }
                } else {
                    this.selectedDocument = 'Order Confirmation';
                    this.documentService.document = 'Order Confirmation';
                    if (this.documentList.includes('Invoice')) {
                        this.documentList.splice(0, 1);
                    }
                    if (!this.documentList.includes('Proforma Invoice')) {
                        this.documentList.push('Proforma Invoice');
                    }
                }
                if (order.orderType === 'Quote') {
                    this.documentList = [
                        'Quote',
                        'Multi Quote',
                        'Simple Quote'
                    ];

                    this.internalDocuments = ['Quote Recap', 'Pick List'];
                    this.selectedDocument = 'Quote';
                    this.documentService.document = 'Quote';
                    this.showDecoDocs = false;
                    this.showPODocs = false;
                    this.showWorkOrderDocs = false;
                }
                // Add artwork proof if there are decorations
                const orderHasArtwork = order.lineItems.some((item) => {
                    return item.decoVendors.length > 0;
                });
                if (orderHasArtwork) {
                    if (!this.documentList.includes('Art Proof')) {
                        this.documentList.push('Art Proof');
                    }
                }

                if (order.orderType === 'CreditMemo') {
                    this.documentList = ['Credit Memo'];
                    this.selectedDocument = 'Credit Memo';
                    this.documentService.document = 'Credit Memo';
                    this.showDecoDocs = false;
                    this.showPODocs = false;
                    this.showWorkOrderDocs = false;
                } else {
                    this.documentList = this.documentList.filter((doc) => {
                        return doc !== 'Credit Memo';
                    });
                }
                this.updateEmailButtonVisibility();
                this.getShippingAllInfo();
                setTimeout(() => {
                    this.documentLoading = false;
                }, 2000);
                // Get payment term
                // this.api.getAccountDetails(this.orderDetails.accountId)
                //     .subscribe((account: Account) => {
                //         if (!account) {
                //             return;
                //         }
                //         this.paymentTerm = account.creditTerms;
                //     });

            });

        this.onOrderPerDocumentsChangedSubscription =
            this.orderService.onOrderPerDocumentsChanged.subscribe((order: any) => {
                if (!order.id) {
                    return;
                }
                this.orderDetails = order;
                this.orderDetails.shipVia = this.domSanitizer.sanitize(SecurityContext.HTML, order.shipVia);
                this.configureLogisticsIfEnabled();
                /* if (this.orderService.selectedDocument === 'Purchase Order') {
                     this.selectedDocument = 'Purchase Order';
                 }*/
                this.filename = `${this.documentService.document}.${this.orderDetails.orderNo}.pdf`;
                if(this.selectedDocument === 'Work Order'){
                     if(this.getBoxLabelDoc){
                         this.filename = `Box Label.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
                     }else{
                         this.filename = `${this.documentService.document}.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
                     }
                }
                this.updateEmailButtonVisibility();

                if (this.selectedDocument == 'Purchase Order') {

                    const vendorLineItems = order.lineItems.filter((item) => {
                        return (item.lineType != '4' && item.doNotIssuePo != '1') && (
                            item.matrixRows.some((row) => {
                                return row.poType == 'DropShip' || row.fulfillments.some((fulfillment) => fulfillment.type === 'DropShip');
                            })
                        );
                    });

                    this.lineItemGroupByVendors = groupBy(vendorLineItems, 'vendorName');
                    console.log(this.lineItemGroupByVendors);
                    

                    let lineItemsByVendor = this.lineItemGroupByVendors[this.selectedPoVendor];
                    console.log(this.selectedPoVendor);
                    console.log(lineItemsByVendor);
                    lineItemsByVendor = lineItemsByVendor.map((lineItem: any) => {
                        let matrixRows = filter(lineItem.matrixRows, { 'poType': 'DropShip' });
                        lineItem.matrixRows = matrixRows;
                        // lineItem.decoVendors = lineItem.decoVendors.filter((vendor) => {
                        //     return matrixRows
                        //         .map(row => row.matrixUpdateId)
                        //         .includes(vendor.matrixId);
                        // });
                        return lineItem;
                    });
                    this.productData = this.generateProductDataByColorsSizes(lineItemsByVendor);
                }
                else if (this.selectedDocument == 'Decoration PO') {
                    const productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems);
                    this.decoDataGroupByDecoVendors = this.groupDecoDataByDecoVendors(productData, true);
                    const decoDataByVendor = this.decoDataGroupByDecoVendors[this.selectedPoVendor];
                    console.log('this.selectedPoVendor');
                    console.log(this.selectedPoVendor);
                    console.log(decoDataByVendor);
                    this.poDecoVendorData = this.generatePODataByDecoVendors(decoDataByVendor);
                }
                else if (this.selectedDocument == 'Work Order') {

                }
                else if (this.selectedDocument == 'Invoice' || this.selectedDocument == 'Credit Memo') {
                    this.invoiceDate.date = this.orderDetails.invoiceDate == '' ? moment(new Date()).format('YYYY-MM-DD') : this.orderDetails.invoiceDate;
                    this.productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems);
                }
                else if (this.selectedDocument == 'Order Recap') {
                    this.invoiceDate.date = this.orderDetails.invoiceDate == '' ? moment(new Date()).format('YYYY-MM-DD') : this.orderDetails.invoiceDate;
                    this.productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems);

                    this.poSummaryList = [];

                    // Product Vendors
                    const lineItemGroupByVendors = groupBy(this.orderDetails.lineItems, 'vendorName');
                    each(keys(lineItemGroupByVendors), key => {
                        let lineItemsByVendor = lineItemGroupByVendors[key];
                        lineItemsByVendor = lineItemsByVendor.map((lineItem: any) => {
                            let matrixRows = filter(lineItem.matrixRows, { 'poType': 'DropShip' });
                            lineItem.matrixRows = matrixRows;
                            return lineItem;
                        });
                        const productLineItems = this.generateProductDataByColorsSizes(lineItemsByVendor);
                        // Calculate Total cost, QTY, Cost per QTY
                        let totalCost = 0;
                        let qty = 0;
                        each(productLineItems, product => {
                            totalCost += parseFloat(product.cost) * parseFloat(product.quantity);
                            qty += product.quantity;
                            if (product.addonCharges) {
                                product.addonCharges.forEach((addonCharge) => {
                                    if (addonCharge.matchOrderQty == '1') {
                                        totalCost += parseFloat(addonCharge.cost) * parseFloat(product.matchOrderQty);
                                    }
                                    else {
                                        totalCost += parseFloat(addonCharge.cost) * parseFloat(addonCharge.quantity);
                                    }
                                });
                            }
                        });

                        this.poSummaryList.push({
                            vendorName: key,
                            totalCost: totalCost,
                            totalQty: qty,
                            costPerQty: qty != 0 ? (totalCost / qty) : 0
                        });

                    });
                    // Decoration Vendors
                    const productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems);
                    const decoDataGroupByDecoVendors = this.groupDecoDataByDecoVendors(productData, true);
                    each(keys(decoDataGroupByDecoVendors), key => {
                        const decoDataByVendors = decoDataGroupByDecoVendors[key];
                        // Calculate Total cost, QTY, Cost per QTY
                        let totalCost = 0;
                        let qty = 0;
                        each(decoDataByVendors, decoData => {
                            qty += decoData.quantity;
                            totalCost += parseFloat(decoData.itemCost) * parseFloat(decoData.quantity);
                            if (decoData.addonCharges) {
                                decoData.addonCharges.forEach((addonCharge) => {
                                    totalCost += parseFloat(addonCharge.cost) * parseFloat(addonCharge.quantity);
                                });
                            }
                        });
                        this.poSummaryList.push({
                            vendorName: key,
                            totalCost: totalCost,
                            totalQty: qty,
                            costPerQty: qty != 0 ? (totalCost / qty) : 0
                        });
                    });
                }else if (this.selectedDocument == 'Packing List' && this.showPackigListByVendor  && this.selectedPLVendor !='') {

                    if(this.selectedPLVendor == 'All'){
                        this.productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems);
                    }else{
                            const vendorLineItems = order.lineItems.filter((item) => {
                                return (item.lineType != '4' && item.lineType != '3' && item.hideLine != '1') && (
                                    item.matrixRows.some((row) => {
                                        return row.matrixUpdateId > 0 ;
                                    })
                                );
                            });
                            this.packingListGroupByVendors = groupBy(vendorLineItems, 'vendorName');
                            this.packingListGroupByVendorsCnt = Object.keys(this.packingListGroupByVendors).length;

                            let lineItemsByVendor = this.packingListGroupByVendors[this.selectedPLVendor];
                            this.productData = this.generateProductDataByColorsSizes(lineItemsByVendor);                
                    }
                }else if (this.selectedDocument == 'Packing List' && this.showPackigListByVendor && this.showPackigListByAllVendors && this.selectedPLVendor == '') {
                    this.productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems);
                }else {
                    this.productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems);
                }

                setTimeout(() => {
                    this.makePdf();
                }, 500);
                setTimeout(() => {
                    this.documentLoading = false;
                }, 2000);
            });

        this.documentService.getAdvanceSystemConfigAll('Documents')
            .then((res: any) => {
                this.docSettings = res.settings;

            }).catch((err) => {
                console.log(err);
            });

        this.onGetLogoChangedSubscription =
            this.orderService.onGetLogoChanged
                .subscribe((response) => {
                    this.logoUrl = exportImageUrlForPDF(response.url);
                });

        this.onGetDocumentLabelsChangedSubscription =
            this.orderService.onGetDocumentLabelsChanged
                .subscribe((response) => {
                    this.allDocumentLabels = this.defaultDocLabels;
                    this.allDocumentLabels = { ...this.allDocumentLabels, ...response };

                    if (this.selectedDocument == 'Credit Memo') {
                        this.docLabels = this.allDocumentLabels['Invoice'];
                    } else {
                        this.docLabels = this.allDocumentLabels[this.selectedDocument];
                    }
                    if (this.orderService.selectedDocument === 'Purchase Order') {
                        this.selectedDocument = 'Purchase Order';
                        this.onPODocumentSelected(this.orderService.selectedPoVendor, false);
                    } else if (this.orderService.selectedDocument === 'Decoration PO') {
                        this.selectedDocument = 'Purchase Order';
                        this.onPODecorationVendorSelected(this.orderService.selectedPoVendor, false);
                    } else if (this.orderService.selectedDocument === 'Art Proof') {
                        this.selectedDocument = 'Art Proof';
                        //                    this.onDocumentSelected('Art Proof');
                    }
                });

        this.documentService.getDocumentOptions().then((docOptions) => {
            this.docOptions = docOptions;
            this.getDocAllDefaultOptions();
        }).catch((err) => {
        });

        this.onPaymentTracksChangedSubscription =
            this.orderService.onPaymentTracksChanged
                .subscribe((list: any) => {
                    this.paymentList = list.payments;
                });

        this.onDropdownOptionsForOrdersChangedSubscription =
            this.orderService.onDropdownOptionsForOrdersChanged
                .subscribe((res: any[]) => {
                    if (!res) { return; }
                    const creditTermDropdown = find(res, { name: 'sys_credit_terms_list' });
                    this.creditTerms = creditTermDropdown.options;
                });


    } //ngOnInit Ends

    getShippingAllInfo() {
        this.api.getShippingAllInfo({ orderId: this.orderDetails.id })
            .subscribe((shipping: any) => {
                if (shipping) {
                    this.shipInfoList = shipping;
                    return this.shipInfoList;
                }
            });
    }

    getDocAllDefaultOptions() {
    /*
        this.docDefaultOptions = [];
        var data = [];
        each(this.docOptions, row => {
            if (row.value) {
                data.push(row.name);
            }
        });
        this.api.getDocsAllDefaultOptions({ names: data, type: this.selectedDocument })
            .subscribe((res: any) => {
                if (res) {
                    this.docDefaultOptions = res;
                }
            });
            */
        if(this.docOptions && this.docOptions[41] && this.docOptions[41].value && this.personalizations.length === 0){
            this.getPersonalizations();
        }
    }
    getPersonalizations(){
            this.api.getQuoteOrderPersonalizations(this.orderDetails.id, 0).subscribe(
              (res: any[]) => {
                      this.personalizations = res;
              },
              (err) => { 
              }
            );    
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
            console.log('this.dynamicDocumentLabels');
            console.log(this.dynamicDocumentLabels);
        });
    }

    getAccountFields() {
        const opts =
        {
            offset: 0,
            limit: 1000,
            order: 'module',
            orient: 'asc',
            term: { module: 'Accounts' }
        }

        return this.api.getFieldsList(opts).subscribe((response: ModuleField[]) => {
            this.accountFields = response;
        });
    }


    private updateEmailButtonVisibility() {
        if (['Order Recap', 'Quote Recap'].includes(this.selectedDocument)) {
            this.hideEmailButton = true;
        } else {
            this.hideEmailButton = false;
        }
    }

    private configureLogisticsIfEnabled() {
        this.logisticsSubscription = this.featureService.isLogisticsEnabled().subscribe((enabled) => {
            if (enabled) {
                const sourceParams = {
                    'limit': 50,
                    'offset': 0,
                    'order': 'dateEntered',
                    'orient': 'desc',
                    'term': {
                        'quoteId': this.orderDetails.id
                    }
                };
                this.api.getSourcingSubmissionsList(sourceParams).subscribe((res: any[]) => {
                    if (!res.length) {
                        this.showPoConfirmation = false;
                        return;
                    }
                    this.showPoConfirmation = true;
                });
            }
        });
    }

    ngOnDestroy() {
        this.cxmlStatus.unsubscribe();
        this.onGetLogoChangedSubscription.unsubscribe();
        this.onGetDocumentLabelsChangedSubscription.unsubscribe();
        this.onOrderchangedSubscription.unsubscribe();
        this.onOrderPerDocumentsChangedSubscription.unsubscribe();
        this.onPaymentTracksChangedSubscription.unsubscribe();
        this.onDropdownOptionsForOrdersChangedSubscription.unsubscribe();
        this.logisticsSubscription.unsubscribe();


        // Reset order service
        this.orderService.onOrderPerDocumentsChanged.next({});
        /*
                if (this.onGetLogoChangedSubscription) this.onGetLogoChangedSubscription.unsubscribe();
                if (this.onGetDocumentLabelsChangedSubscription) this.onGetDocumentLabelsChangedSubscription.unsubscribe();
                if (this.onOrderchangedSubscription) this.onOrderchangedSubscription.unsubscribe();
                if (this.onOrderPerDocumentsChangedSubscription) this.onOrderPerDocumentsChangedSubscription.unsubscribe();
                if (this.onPaymentTracksChangedSubscription) this.onPaymentTracksChangedSubscription.unsubscribe();
                */
    }

    getPdfDocument() {

    }

    fetchPicklist() {
        return this.api.getOrderPicklist(this.orderDetails.id);
    }
    fetchVendorAccount(vendorId: string) {
        return this.api.getAccountDetails(vendorId);
    }

    makePdf() {
        this.loading = true;

        let logoUrl = this.logoUrl;

        if (this.orderDetails.corporateIdentity && this.orderDetails.corporateIdentity.logo) {
            logoUrl = this.orderDetails.corporateIdentity.logo;
        }

        this.docDefaultOptions = [];
        var data = [];
        each(this.docOptions, row => {
            if (row.value) {
                data.push(row.name);
            }
        });
        this.api.getDocsAllDefaultOptions({ names: data, type: this.selectedDocument })
            .subscribe((res: any) => {
                if (res) {
                    this.docDefaultOptions = res;
                }
            
        const defaultConfig = {
            fields: this.fields,
            dynamicDocumentLabels: this.dynamicDocumentLabels[this.selectedDocument],
            logoUrl: logoUrl,
            accountFields: this.accountFields,
            docLabels: this.docLabels,
            docOptions: this.docOptions,
            docSettings: this.docSettings,
            defaultDocOptions: this.defaultDocOptions,
            docDefaultOptions: this.docDefaultOptions,
            creditTerms: this.creditTerms,
            ordersConfig: this.ordersConfig,
            shipInfoList: this.shipInfoList,
            sysConfig: this.sysConfig,
            personalizations: this.personalizations
            
        };

        let resolver;

        switch (this.selectedDocument) {
            case 'Invoice':
            this.document = new InvoiceDocument({
                ...defaultConfig,
                order: this.orderDetails,
                invoiceDate: this.invoiceDate,
                paymentList: this.paymentList,
                docGridView: this.docGridView,
                docGridViewGroupByVariation: this.docGridViewGroupByVariation,
                hideQuoteTotal: false
            });
            break;
            case 'Order Recap':
            case 'Quote Recap':
            this.document = new OrderRecapDocument({
                ...defaultConfig,
                order: this.orderDetails,
                invoiceDate: this.invoiceDate,
                paymentList: this.paymentList,
                docTitle: this.selectedDocument,
                vouchedInfo: this.vouchedInfo,
                docGridView: this.docGridView,
                docGridViewGroupByVariation: this.docGridViewGroupByVariation,
                hideQuoteTotal: false
            });
            break;
            case 'Proforma Invoice':
            this.document = new InvoiceProformaDocument({
                ...defaultConfig,
                order: this.orderDetails,
                paymentList: this.paymentList,
                docGridView: this.docGridView,
                docGridViewGroupByVariation: this.docGridViewGroupByVariation,
                hideQuoteTotal: false
            });
            break;
            case 'Order Confirmation':
            this.document = new OrderConfirmationDocument({
                ...defaultConfig,
                order: this.orderDetails,
                paymentList: this.paymentList,
                decoTypes: Object.keys(this.orderDataGroupByDecoTypes),
                decoLocationsList : this.decoLocationsList,
                docGridView: this.docGridView,
                docGridViewGroupByVariation: this.docGridViewGroupByVariation,
                hideQuoteTotal: false,
                generateWorkOrderBy: this.generateWorkOrderBy,
            });
            break;
            case 'Quote':
            this.document = new QuoteDocument({
                ...defaultConfig,
                order: this.orderDetails,
                paymentList: this.paymentList,
                docGridView: this.docGridView,
                docGridViewGroupByVariation: this.docGridViewGroupByVariation,
                hideQuoteTotal: this.hideQuoteTotal
            });
            break;
            case 'Multi Quote':
            resolver = this.fetchAllProducts();
            this.document = new MultiQuoteDocument({
                ...defaultConfig,
                order: this.orderDetails,
                hideQuoteTotal: false,
            });
            break;
            case 'Simple Quote':
            resolver = this.fetchAllProducts();
            this.document = new SimpleQuoteDocument({
                ...defaultConfig,
                order: this.orderDetails,
                hideQuoteTotal: false,
            });
            break;
            case 'Pick List':
            resolver = this.fetchPicklist();
            this.document = new PickListDocument({
                ...defaultConfig,
                order: this.orderDetails,      
                hideQuoteTotal: false,
            });
            break;
            case 'Packing List':
            this.document = new PackingListDocument({
                ...defaultConfig,
                order: this.orderDetails,
                docGridView: this.docGridView,
                vendorId: this.getSelectedPLVendorId(),
                updatedpackingListTempQuantity: this.updatedpackingListTempQuantity,
                packingListTempQuantity: this.packingListTempQuantity,
                packingListTempBoxNotes: this.packingListTempBoxNotes,
                customPLNote: this.customPLNote,
                boxNotesPLColumn: this.boxNotesPLColumn,
                hideQuoteTotal: false,
            });
            break;
            case 'Art Proof':
            resolver = this.fetchArtProofs();
            this.document = new ArtProofDocument({
                ...defaultConfig,
                order: this.orderDetails,
                resolver: resolver,
            });
            break;
            case 'Work Order':
            if(this.getBoxLabelDoc){
                    this.document = new BoxLabelsDocument({
                        ...defaultConfig,
                        decoTypes: Object.keys(this.workDataGroupByDecoTypes),
                        selectedDecoVendor: this.selectedDecoVendor,
                        selectedDecoDesigns: this.selectedDecoDesigns,
                        selectedDecoVariation: this.selectedDecoVariation,
                        selectedDecoLocation: this.selectedDecoLocation,
                        selectedWorkDataMatrixIds : this.selectedWorkDataMatrixIds,
                        selectedWorkOrderCnt : this.selectedWorkOrderCnt,
                        totalWorkOrderCnt: this.totalWorkOrderCnt,
                        decoLocationsList : this.decoLocationsList,
                        order: this.orderDetails
                    });
            }else{
                    this.document = new WorkOrderDocument({
                        ...defaultConfig,
                        decoTypes: Object.keys(this.workDataGroupByDecoTypes),
                        selectedDecoVendor: this.selectedDecoVendor,
                        selectedDecoDesigns: this.selectedDecoDesigns,
                        selectedDecoVariation: this.selectedDecoVariation,
                        selectedDecoLocation: this.selectedDecoLocation,
                        selectedWorkDataMatrixIds : this.selectedWorkDataMatrixIds,
                        selectedWorkOrderCnt : this.selectedWorkOrderCnt,
                        totalWorkOrderCnt: this.totalWorkOrderCnt,
                        decoLocationsList : this.decoLocationsList,
                        order: this.orderDetails
                    });            
            }

            break;
            case 'Decoration PO':
            resolver = this.fetchVendorAccount(this.getSelectedDecoVendorId());
            this.document = new PurchaseOrderDecorationsDocument({
                ...defaultConfig,
                order: this.orderDetails,
                vendorId: this.getSelectedDecoVendorId(),
                docGridView: this.docGridView,
                docGridViewGroupByVariation: this.docGridViewGroupByVariation,
                vendorName: this.getSelectedDecoVendorName(),
                hideQuoteTotal: false,
            });
            break;
            case 'Purchase Order':
            resolver = this.fetchVendorAccount(this.getSelectedVendorId());
            this.document = new PurchaseOrderDocument({
                ...defaultConfig,
                order: this.orderDetails,
                vendorId: this.getSelectedVendorId(),
                docGridView: this.docGridView,
                docGridViewGroupByVariation: this.docGridViewGroupByVariation,
                hideQuoteTotal: false,
            });
            break;
            case 'Credit Memo':
            this.document = new CreditMemoDocument({
                ...defaultConfig,
                order: this.orderDetails,
                paymentList: this.paymentList,
                decoTypes: Object.keys(this.orderDataGroupByDecoTypes),
                decoLocationsList : this.decoLocationsList,
                hideQuoteTotal: false,
            });
            break;
            default: {
            this.document = undefined;
            }
        }

        if (resolver) {
            resolver.subscribe((res) => {
            this.document.config.resolve = res;
            if(this.selectedDocument == 'Simple Quote'){
                this.quotesAllProducts = res;
            }
            this.getDocumentDefinition();
            });
        } else {
            this.getDocumentDefinition();
        }

                
            });


    }
    fetchAllProducts(): any {
        return this.orderFormService.order$.pipe(
            take(1),
            switchMap((order) => {
                const ids = order.lineItems.reduce((productIds, item) => {
                    if (productIds.indexOf(item.productId) === -1) {
                        productIds.push(item.productId);
                    }
                    return productIds;
                }, []);
                return forkJoin(ids.map((id) => this.api.getProductDetailsCurrency(id)));
            }),
        );
    }

    fetchArtProofs(): any {
        return this.orderFormService.artProofs$.pipe();
    }

    getDocumentDefinition() {
        if (this.document) {
            this.document.setFormatter(this.documentHelper);
            this.document.getDocumentDefinition().subscribe((definition) => {
                this.documentDefinition = definition;
                this.loading = false;
            });
        } else {
            this.documentDefinition = undefined;
            this.loading = false;
        }
    }

    onDocumentSelected(doc, isDocClicked = false) {
        this.loading = true;
        this.selectedCurrentDocumentKey = doc;
        this.noteService.getOrderDocumentActivities(doc);
        if (doc == 'Shipping') {
            this.msg.show('Document not available at this time.', 'error');
            return;
        }
        this.documentLoading = true;
        if (doc !== 'Purchase Order' && doc !== 'Decoration PO') {
           this.selectedPoVendor = '';
        }
        if(isDocClicked){
           this.selectedPLVendor = '';
           this.updatedpackingListTempQuantity = false;
           this.packingListTempQuantity = [];
           this.packingListTempBoxNotes = [];
           this.customPLNote = '';
           this.boxNotesPLColumn = '';
        }        
        if (doc !== 'Packing List') {           
           this.updatedpackingListTempQuantity = false;
           this.packingListTempQuantity = [];
           this.packingListTempBoxNotes = [];
           this.customPLNote = '';
           this.boxNotesPLColumn = '';
        }
        if(doc == 'Packing List' && this.showPackigListByVendor && this.showPackigListByAllVendors){
           //this.selectedPLVendor = '';
           //this.updatedpackingListTempQuantity = false;
           //this.packingListTempQuantity = [];
           //this.packingListTempBoxNotes = [];
           //this.customPLNote = '';
        }
        this.selectedDocument = doc;
        this.documentService.document = this.selectedDocument;

        this.updateEmailButtonVisibility();

        if (this.selectedDocument == 'Art Proof') {
            this.docOptions = this.defaultDocOptions.map(option => Object.keys(option).map(key => ({ name: key, value: option[key] == 1 ? true : false })).pop());
            this.getDocAllDefaultOptions();
        }
        else {
            this.documentService.getDocumentOptions().then((docOptions) => {
                this.docOptions = docOptions;
                this.getDocAllDefaultOptions();
            }).catch((err) => {

            });
        }

        if (this.selectedDocument == 'Credit Memo' || this.selectedDocument == 'Pick List' || this.selectedDocument == 'Packing List') {
            this.docLabels = this.allDocumentLabels['Invoice'];
        }
        else if (this.selectedDocument == 'Quote Recap') {
            this.docLabels = this.allDocumentLabels['Order Recap'];
        }
        else {
            this.docLabels = this.allDocumentLabels[this.selectedDocument];
        }

        if (doc == 'Order Recap' || doc == 'Quote Recap') {
            this.orderService.getOrderPerDocType(this.orderDetails.id, '').subscribe(console.log);
        }
        else {
            this.orderService.getOrderPerDocType(this.orderDetails.id, 'invoice').subscribe(console.log);
        }
    }

    onPODocumentSelected(key, notwf = true) {
        this.documentLoading = true;
        this.selectedCurrentDocumentKey = key;
        this.loading = true;
        this.selectedDocument = 'Purchase Order';
        this.documentService.document = this.selectedDocument;
        this.selectedPoVendor = key;
        this.documentService.getDocumentOptions().then((docOptions) => {
            this.docOptions = docOptions;
            this.getDocAllDefaultOptions();
        });
        this.docLabels = this.allDocumentLabels['Purchase Order'];
        if (notwf) {
            this.orderService.getOrderPerDocType(this.orderDetails.id, 'po').subscribe(console.log);
        }

        const vendorId = this.getSelectedVendorId();

        this.electronicEndpoint = 'PS';
        this.api.checkElectronicEndpoint('Purchase Order', vendorId)
            .then((res: any) => {
                this.psEnabled = res.enabled;
                this.electronicEndpoint = res.endpoint;
            }).catch((err) => {
                console.log(err);
            });
    }

    onPODecorationVendorSelected(key, notwf = true) {
        this.documentLoading = true;
        this.selectedCurrentDocumentKey = key;
        this.loading = true;
        this.selectedDocument = 'Decoration PO';
        this.documentService.document = 'Purchase Order';
        this.selectedPoVendor = key;
        this.documentService.getDocumentOptions().then((docOptions) => {
            this.docOptions = docOptions;
            this.getDocAllDefaultOptions();
        });
        this.docLabels = this.allDocumentLabels['Purchase Order'];
        if (notwf) {
            this.orderService.getOrderPerDocType(this.orderDetails.id, 'po').subscribe(console.log);
        }

        let vendorId = this.getSelectedDecoVendorId();

        this.electronicEndpoint = 'PS';
        this.api.checkElectronicEndpoint('Purchase Order', vendorId)
            .then((res: any) => {
                this.psEnabled = res.enabled;
                this.electronicEndpoint = res.endpoint;
            }).catch((err) => {
                console.log(err);
            });
    }

    onWorkOrderSelected(key = 'temp', SortCount, boxLabel = false) {
        this.loading = true;
        this.selectedCurrentDocumentKey = key;
        if(boxLabel){
            this.getBoxLabelDoc = true;
        }else{
            this.getBoxLabelDoc = false;
        }
        this.documentLoading = true;
        this.selectedDocument = 'Work Order';
        this.documentService.document = 'Work Order';
        this.selectedDecoType = key;
        this.selectedDecoVendor = this.workDataGroupByVendorsAndDesignsSortedV[SortCount];
        this.selectedDecoDesigns = this.workDataGroupByVendorsAndDesignsSorted[SortCount];
        this.selectedWorkDataMatrixIds = this.workDataMatrixIds[this.selectedDecoDesigns];
        console.log('this.selectedWorkDataMatrixIds');
        console.log(this.selectedWorkDataMatrixIds);
        
        this.selectedWorkOrderCnt = SortCount;
        let designKeys = Object.keys(this.workDataGroupByVendorsAndDesignsSorted);
        this.totalWorkOrderCnt = designKeys.length;


        this.documentService.getDocumentOptions().then((docOptions) => {
            this.docOptions = docOptions;
            this.getDocAllDefaultOptions();
        });
        this.docLabels = this.allDocumentLabels['Work Order'];
        this.orderService.getOrderPerDocType(this.orderDetails.id, '').subscribe(console.log);
    }

    onPackingListSelected(key, isDocClicked = false) {
        this.documentLoading = true;
        this.loading = true;
        this.selectedCurrentDocumentKey = key;
        this.selectedDocument = 'Packing List';
        this.documentService.document = this.selectedDocument;
        this.selectedPLVendor = key;
        if(isDocClicked){
           this.updatedpackingListTempQuantity = false;
           this.packingListTempQuantity = [];
           this.packingListTempBoxNotes = [];
           this.customPLNote = '';
           this.boxNotesPLColumn = '';
        }
        this.documentService.getDocumentOptions().then((docOptions) => {
            this.docOptions = docOptions;
            this.getDocAllDefaultOptions();
        });
        this.docLabels = this.allDocumentLabels['Packing List'];
        const vendorId = this.getSelectedPLVendorId();
        this.orderService.getOrderPerDocType(this.orderDetails.id, '').subscribe(console.log);
    }
    
    
    generateProductDataByColorsSizes(lineItems) {
        const productData = [];

        lineItems.forEach((_lineItem: any) => {

            const lineItem = { ..._lineItem };

            if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
                lineItem.matrixRows = [new MatrixRow({})];
            }

            const totalCount = sum(
                lineItem.matrixRows.map(row => Number(row.quantity))
            );

            lineItem.matrixRows.forEach((row: any) => {
                if (!row) { return; }

                const defaultImage = (lineItem.quoteCustomImage && lineItem.quoteCustomImage[0]) || 'assets/images/ecommerce/product-image-placeholder.png';

                // TODO: Need to add unit cost / unit price based on conversion value

                this.matrixToLineItemsIds[row.matrixUpdateId] = lineItem.lineItemUpdateId;
                if(typeof row.decoDesigns != 'undefined' && row.decoDesigns.length > 0){
                    row.decoDesigns.forEach((design: any) => {
                        if(design.designs){
                            const designString = design.designs.split(' ').sort().join(' ');
                            if(this.workDataDecoDesignStrings.indexOf(designString) < 0){
                                this.workDataDecoDesignStrings.push(designString);
                                this.workDataDecoDesignStringsByVariationAndLocation[designString] = [];
                                this.workDataMatrixIds[designString] = [];
                            }
                        }

                    });
                }
                const newRow = {
                    productName: lineItem.productName,
                    productId: lineItem.itemNo,
                    inhouseId: lineItem.inhouseId,
                    image: exportImageUrlForPDF(row.imageUrl || defaultImage),
                    quantity: +row.quantity,
                    unitQuantity: +row.unitQuantity,
                    price: row.price,
                    totalMatrixPrice: row.totalPrice,
                    cost: row.cost,
                    color: row.color,
                    size: row.size,
                    matrixRows: [row],
                    matrixUpdateId: row.matrixUpdateId,
                    lineItemUpdateId: lineItem.lineItemUpdateId,
                    customerDescription: lineItem.customerDescription,
                    vendorDescription: lineItem.vendorDescription,
                    sizeList: [{ size: row.size, quantity: row.quantity }],
                    addonCharges: (findIndex(productData, { lineItemUpdateId: lineItem.lineItemUpdateId }) < 0) ? lineItem.addonCharges : [],
                    lineItem: lineItem,
                    uomConversionRatio: row.uomConversionRatio,
                    uomAbbreviation: row.uomAbbreviation,
                    matchOrderQty: totalCount,
                    poShippingBillingDetails: !lineItem.poShippingBillingDetails ? {} : lineItem.poShippingBillingDetails,
                    calculatorData: row.calculatorData,
                };
                productData.push(newRow);
            });
        });

        productData.forEach(row => {
            let decoVendors = [];

            if (!row.lineItem.decoVendors) {
                return;
            }

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

                if (!v.decorationDetails[0]) {
                    break;
                }
                if (row.matrixUpdateId == v.decorationDetails[0].matrixId) {

                    let decoColors = '';
                    if (v.decorationDetails[0].decoDesignVariation && v.decorationDetails[0].decoDesignVariation.design_color_thread_pms) {
                        const colors = v.decorationDetails[0].decoDesignVariation.design_color_thread_pms;
                        each(colors, color => {
                            decoColors += `Color ${color.No} ${color.Color} ${color.ThreadPMS} ${color.Description}`;
                            if (findIndex(colors, { No: color.No }) != (colors.length - 1)) { decoColors += ' , '; }
                        });
                    }

                    const vendor: any = {
                        id: v.decoVendorRecordId,
                        designId: v.designId,
                        designCustomerId: v.designCustomerId,
                        designNo: v.designModal,
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
                        poShippingBillingDetails: v.poShippingBillingDetails,
                        decorationNotes: v.decorationNotes,
                        decoColors: decoColors,
                        decoDescription: v.decorationDetails[0].decoDescription,
                        vendorSupplierDecorated: v.vendorSupplierDecorated,
                        doNotIssuePo: v.doNotIssuePo,
                        designDynamicNotes: v.designDynamicNotes,
                    };

                    if (v.decorationDetails[0] && v.decorationDetails[0].variationImagesThumbnail && v.decorationDetails[0].variationImagesThumbnail[0]) {
                        vendor.image = v.decorationDetails[0].variationImagesThumbnail[0];
                    } else {
                        vendor.image = v.decorationDetails[0].variationImages[0];
                    }
                    decoVendors.push(vendor);
                }

            }

            row.decoVendors = decoVendors;
        });
        return productData;
    }

    groupDecoDataByDecoVendors(productData, chkDoNotIssuePo = true) {
        const totalDecoVendors = [];
        productData.forEach((product: any) => {
            if (product.decoVendors) {
                product.decoVendors.forEach((decoVendor: any) => {
                    const isSupplierDecorated = +decoVendor.vendorSupplierDecorated;
                    if (!isSupplierDecorated) {
                        if(chkDoNotIssuePo){
                            if(decoVendor.doNotIssuePo != '1'){
                                totalDecoVendors.push(decoVendor);
                            }                            
                        }else{
                            totalDecoVendors.push(decoVendor);
                        }
                    }
                });
            }
        });
        return groupBy(totalDecoVendors, 'decoVendorName');
    }

    groupSavedDocumentFieldsLabels() {

        let savedDocumentFieldsLabels = groupBy(this.savedDocumentFieldsLabels, 'moduleSection');
        each(keys(savedDocumentFieldsLabels), key => {
            let docs = savedDocumentFieldsLabels[key];
        this.dynamicDocumentLabels[key] = [];
        docs.forEach((doc: any) => {
            if (doc.fieldName && doc.labelName) {
            this.dynamicDocumentLabels[key][doc.fieldName] = doc.labelName;
            }
        });

        });
    }

  perm(xs) {
  let ret = [];

  for (let i = 0; i < xs.length; i = i + 1) {
    let rest = this.perm(xs.slice(0, i).concat(xs.slice(i + 1)));

    if(!rest.length) {
      ret.push([xs[i]])
    } else {
      for(let j = 0; j < rest.length; j = j + 1) {
        ret.push([xs[i]].concat(rest[j]))
      }
    }
  }
  return ret;
  }

    designCombinationString(text) {
        var wordList = text.split(' ');
        var keywordsList = [];
        while (wordList.length > 0) {
            keywordsList = keywordsList.concat(this.combinations(wordList));
            wordList.shift();
        }
        return keywordsList;
    }


    combinations(wordsList) {
        var res = [wordsList.join(' ')];
        if (wordsList.length > 1) {
            return res.concat(this.combinations(wordsList.slice(0, -1)));
        } else {
            return res;
        }
    }

    groupDecoDataByVendorsAndDecoDesigns(decoVendorKeys, decoVendors, productData){
        const totalDecoVendorsWithGroup = [];
        var decoVarInc = 1;
        decoVendorKeys.forEach((decoVendorName) => {
            each(keys(this.uniqueVariationsGroup[decoVendorName]), variationString => {
                this.workDataGroupByVendorsAndDesignsSorted[String(decoVarInc).padStart(3, '0')] = [];
                this.workDataGroupByVendorsAndDesignsSorted[String(decoVarInc).padStart(3, '0')] = variationString;
                this.workDataGroupByVendorsAndDesignsSortedV[String(decoVarInc).padStart(3, '0')] = [];
                this.workDataGroupByVendorsAndDesignsSortedV[String(decoVarInc).padStart(3, '0')] = decoVendorName;                        
                if(typeof this.workDataMatrixIds[variationString] === 'undefined'){
                this.workDataMatrixIds[variationString] = [];
                }
                this.workDataMatrixIds[variationString] = this.uniqueVariationsGroup[decoVendorName][variationString];
                this.workDataForProduction[String(decoVarInc).padStart(3, '0')] = [];
                const currentworkOrderData = [];
                this.uniqueVariationsGroup[decoVendorName][variationString].forEach((choosenMatrixId) => {        
                        this.matrixGroupByDecoration[decoVendorName].forEach((matrixRows) => {
                            each(keys(matrixRows), matrixId => {
                                if(choosenMatrixId == matrixId){
                                        matrixRows[matrixId].forEach((matrixRow) => {
						let variationLocationComboString = matrixRow.variationUniqueId;
						switch(this.generateWorkOrderBy){
						    case 'location':
							variationLocationComboString = matrixRow.variationUniqueId+''+matrixRow.decoLocation.replace(/[^a-zA-Z ]/g, "");
						    break;
						    case 'variation':
							variationLocationComboString = matrixRow.variationUniqueId;
						    break;
						}
                                                if(variationString.indexOf(variationLocationComboString) > -1){
                                                    const newRow = {
                                                        decoDetailId: matrixRow.decoDetailId,
                                                        matrixId: matrixRow.matrixId,
                                                        decoVendorRecordId: matrixRow.decoVendorRecordId,
                                                        decoProductItemCode: matrixRow.decoProductItemCode,
                                                        decoProductItemNo: matrixRow.decoProductItemNo,
                                                        variationUniqueId: variationLocationComboString,
                                                        decoImprints: matrixRow.decoImprints,
                                                        designVariationTitle: matrixRow.decoDesignVariation.design_variation_title,
                                                        workOrderNumber: `${this.orderDetails.orderNo}w${String(decoVarInc).padStart(3, '0')}`,
                                                    };
                                                    
                                                    currentworkOrderData.push(newRow);
                                                }
                                        });                        
                                }
                            });        
                        });
                });
                currentworkOrderData.forEach((woRow) => {
                    this.workDataForProduction[String(decoVarInc).padStart(3, '0')].push(woRow);
                });
                decoVarInc++;
            });
            /*
            totalDecoVendorsWithGroup[decoVendorName] = [];
        let designKeys = Object.keys(decoVendors[decoVendorName]);
            this.workDataDecoDesignStrings.forEach((row) => {
                let matrixRows = productData.filter((items) => {
                return (items.lineType != '4') && (
                    items.matrixRows.some((item) => {
                        if (typeof item.decoDesigns == 'undefined') {
                            return false;
                        } else {
                            return item.decoDesigns.some((design) => (design.vendor === decoVendorName && JSON.stringify(design.designs.split(' ').sort()) === JSON.stringify(row.split(' ').sort())));
                        }
                    })
                );
                });
                if(matrixRows.length > 0){
                            const designString = row.split(' ').sort().join(' ');
                this.workDataGroupByVendorsAndDesignsSorted[String(decoVarInc).padStart(3, '0')] = [];
                this.workDataGroupByVendorsAndDesignsSorted[String(decoVarInc).padStart(3, '0')] = designString;
                this.workDataGroupByVendorsAndDesignsSortedV[String(decoVarInc).padStart(3, '0')] = [];
                this.workDataGroupByVendorsAndDesignsSortedV[String(decoVarInc).padStart(3, '0')] = decoVendorName;                        
                
                decoVarInc++;
                matrixRows.forEach((product: any) => {
                    if (product.decoVendors) {
                    product.decoVendors.forEach((decoVendor: any) => {
                        if(typeof this.workDataMatrixIds[designString] === 'undefined'){
                            this.workDataMatrixIds[designString] = [];
                        }
                        if(this.workDataMatrixIds[designString].indexOf(decoVendor.decorationDetails[0].matrixId) < 0){
                            this.workDataMatrixIds[designString].push(decoVendor.decorationDetails[0].matrixId);
                        }    
                    });
                    }
                });
                }
                    });
           */
        });

                //console.log('this.workDataForProduction');
                //console.log(this.orderDetails.orderStatus);
                //console.log(this.workDataForProduction.length);
                //console.log(JSON.stringify(this.orderDetails.workOrderDetails));
                //console.log(JSON.stringify(this.workDataForProduction));
                if(this.orderDetails.orderStatus == 'Booked' && this.workDataForProduction.length > 0 && JSON.stringify(this.orderDetails.workOrderDetails) == JSON.stringify(this.workDataForProduction)){
                    console.log('workDataForProduction matched');
                }
                    if(this.orderDetails.orderStatus == 'Booked'){
                        console.log('this.workDataForProduction');
                        console.log(this.workDataForProduction);
                        
                        const data = {"id": this.orderDetails.id, "workOrderDetails" : Object.assign({}, this.workDataForProduction)};
                        this.api.updateWorkOrderDetails(data)
                        .subscribe((res) => {

                        }, (err) => {

                        });                
                    }
        
        return totalDecoVendorsWithGroup;
    }
    groupDecoDataByDecoDesigns(decoVendors, productData) {
        const totalDecoVendorsWithGroup = [];
        this.uniqueVariationsGroup = [];
        this.matrixGroupByDecoration = [];
        
        decoVendors.forEach((decoVendorName) => {
                let totalDecoVendors = [];
                this.matrixGroupByDecoration[decoVendorName] = [];
                this.uniqueVariationsGroup[decoVendorName] = [];
        productData.forEach((product: any) => {
            if (product.decoVendors) {
                const uniqueVariationsKeys = [];
            product.decoVendors.forEach((decoVendor: any) => {
                const isSupplierDecorated = +decoVendor.vendorSupplierDecorated;
                if (!isSupplierDecorated && decoVendor.decoVendorName == decoVendorName) {
                totalDecoVendors.push(decoVendor);
                uniqueVariationsKeys.push({...decoVendor.decorationDetails[0], decoLocation:decoVendor.decoLocation});
                }
            });
            if(uniqueVariationsKeys.length > 0){
                this.matrixGroupByDecoration[decoVendorName].push(groupBy(uniqueVariationsKeys, 'matrixId'));
            }
            }
        });
        totalDecoVendorsWithGroup[decoVendorName] = [];
        totalDecoVendorsWithGroup[decoVendorName] = groupBy(totalDecoVendors, 'designNo');
        //let designKeys = Object.keys(totalDecoVendorsWithGroup[decoVendorName]);

console.log('matrixGroupByDecoration');
console.log(this.matrixGroupByDecoration[decoVendorName]);
        this.matrixGroupByDecoration[decoVendorName].forEach((matrixRows) => {
            each(keys(matrixRows), matrixId => {
                let variationStringArray = [];
                let variationString = '';

                matrixRows[matrixId].forEach((matrixRow) => {
                let variationLocationComboString = matrixRow.variationUniqueId;
                switch(this.generateWorkOrderBy){
                    case 'location':
                        variationLocationComboString = matrixRow.variationUniqueId+''+matrixRow.decoLocation.replace(/[^a-zA-Z ]/g, "");
                    break;
                    case 'variation':
                        variationLocationComboString = matrixRow.variationUniqueId;
                    break;
                }
                if(variationStringArray.indexOf(variationLocationComboString) < 0){
                    variationStringArray.push(variationLocationComboString);
                }
                });
                if(variationStringArray.length>0){
                variationString = variationStringArray.sort().join('-');
                }
                if(variationString !=''){
                if(typeof this.uniqueVariationsGroup[decoVendorName][variationString] === 'undefined'){
                    this.uniqueVariationsGroup[decoVendorName][variationString] = [];
                }
                this.uniqueVariationsGroup[decoVendorName][variationString].push(matrixId);
                }
            });        
        })

        });

        console.log('this.uniqueVariationsGroup');
        console.log(this.uniqueVariationsGroup);
        return totalDecoVendorsWithGroup;
    }

    groupDataByDecoTypes(productData) {
        const totalDecoVendors = [];
        productData.forEach((product: any) => {
            if (product.decoVendors) {
                product.decoVendors.forEach((decoVendor: any) => {
                    if (decoVendor.decoType != 'Supplier_Decorated') {
                        totalDecoVendors.push(decoVendor);
                    }
                });
            }
        });
        return groupBy(totalDecoVendors, 'decoType');
    }

    generatePODataByDecoVendors(decoDataPerDecoVendor) {
        let decoPOData = [];
        this.productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems); // Reset product data
        for (const decoVendor of decoDataPerDecoVendor) {
            if (!decoVendor.decorationDetails[0]) {
                break;
            }

            const product = find(this.productData, {
                matrixUpdateId: decoVendor.decorationDetails[0].matrixId
            });
            if (product) {
                const decoData = {
                    productDetails: product,
                    decoData: decoVendor
                }
                decoPOData.push(decoData);
            }
            else {
                console.log('Product Not Found ', decoVendor.decorationDetails[0].matrixId);
            }
        }
        return decoPOData;
    }

    generateWorkDataByDecoTypes(workDataPerDecoType) {

        let workOrderData = [];
        this.productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems); // Reset product data
        for (const decoVendor of workDataPerDecoType) {
            if (!decoVendor.decorationDetails[0]) {
                break;
            }

            const product = find(this.productData, {
                matrixUpdateId: decoVendor.decorationDetails[0].matrixId
            });
            if (product) {
                console.log(product);
                workOrderData.push(product);
            }
            else {
                console.log('Product Not Found ', decoVendor.decorationDetails[0].matrixId);
            }
        }
        return workOrderData;
    }

    downloadPDF() {
        if (this.productData.length == 0) {
            this.msg.show('Please add a product to this order first.', 'error');
            return;
        }

        this.loading = true;

        // var element = document.getElementById('document');
        let filename = `${this.documentService.document}.${this.orderDetails.orderNo}.pdf`;
        if(this.selectedDocument === 'Work Order'){
             if(this.getBoxLabelDoc){
                 filename = `Box Label.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
             }else{
                 filename = `${this.documentService.document}.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
             }
        }
        this.documentRenderer.download({ filename: filename });

        const blob = this.documentRenderer.blob;
        const frmData = new FormData();
        frmData.append('fileUpload[]', new File([blob], filename));
        frmData.append('orderNo', this.orderDetails.orderNo);
        frmData.append('orderId', this.orderDetails.id);
        frmData.append('orderType', this.orderDetails.orderType);
        frmData.append('accountId', this.orderDetails.accountId);
        frmData.append('selectedDocument', this.selectedDocument);
        this.api.uploadOrderDocsToCloud(frmData)
            .subscribe((res: any) => {
                console.log(res);
                this.msg.show(`Succesfully uploaded ${filename}`, 'success');
                this.loading = false;
            }, (err => {
                this.loading = false;
            }));
    }

    printPDF() {
        if (this.productData.length == 0) {
            this.msg.show('Please add a product to this order first.', 'error');
            return;
        }

        this.loading = true;
        this.documentRenderer.print();
        // var element = document.getElementById('document');
        let filename = `${this.documentService.document}.${this.orderDetails.orderNo}.pdf`;
        if(this.selectedDocument === 'Work Order'){
             if(this.getBoxLabelDoc){
                 filename = `Box Label.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
             }else{
                 filename = `${this.documentService.document}.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
             }
        }
        //this.documentRenderer.download({ filename: filename });

        const blob = this.documentRenderer.blob;
        const frmData = new FormData();
        frmData.append('fileUpload[]', new File([blob], filename));
        frmData.append('orderNo', this.orderDetails.orderNo);
        frmData.append('orderId', this.orderDetails.id);
        frmData.append('orderType', this.orderDetails.orderType);
        frmData.append('accountId', this.orderDetails.accountId);
        frmData.append('selectedDocument', this.selectedDocument);
        this.api.uploadOrderDocsToCloud(frmData)
            .subscribe((res: any) => {
                console.log(res);
                this.msg.show(`Succesfully uploaded ${filename}`, 'success');
                this.loading = false;
            }, (err => {
                this.loading = false;
            }));

    }
    refresh() {
        this.orderService.getOrder(this.orderDetails.id);
    }

    sendEmail(mailToType) {
        this.mailToType = mailToType;
        if (this.productData.length == 0) {
            this.msg.show('Please add a product to this order first.', 'error');
            return;
        }

        this.loading = true;
        const userId = this.auth.getCurrentUser().userId;
        this.api.getMailCredentials(userId)
            .subscribe((res) => {
                this.loading = false;
                if (!res || (res && (res.smtpPass == '' || res.smtpPort == '' || res.smtpServer == '' || res.smtpUser == ''))) {
                    this.credentialsDialogRef = this.dialog.open(MailCredentialsDialogComponent, {
                        panelClass: 'mail-credentials-dialog'
                    });
                    this.credentialsDialogRef.afterClosed()
                        .subscribe((res) => {
                            this.dialogRef = null;
                            if (res && res == 'saved') {
                                this.sendEmail(mailToType);
                            }
                        });
                    return;
                }
                this.generatePDF();

            }, (err) => {
                this.loading = false;
                console.log(err);
            });
    }

    autoUploadToCloud() {

    if(this.documentsToUpload != '' && this.documentsToUpload == 'Invoice'){
        if(this.selectedDocument == 'Invoice'){
        if (this.productData.length == 0) {
            this.msg.show('Please add a product to this order first.', 'error');
            return;
        }

        this.loading = true;
                let filename = `${this.documentService.document}.${this.orderDetails.orderNo}.pdf`;
        this.loading = true;
        const blob = this.documentRenderer.blob;
        const frmData = new FormData();
        frmData.append('fileUpload[]', new File([blob], filename));
        frmData.append('orderNo', this.orderDetails.orderNo);
        frmData.append('orderId', this.orderDetails.id);
        frmData.append('orderType', this.orderDetails.orderType);
        frmData.append('accountId', this.orderDetails.accountId);
        frmData.append('selectedDocument', this.selectedDocument);
        this.api.uploadOrderDocsToCloud(frmData)
            .subscribe((res: any) => {
            console.log(res);
            this.msg.show(`Succesfully uploaded ${filename}`, 'success');
            this.loading = false;
                        this.documentsToUpload = '';
                        this.removeDocumentsToUpload.emit();
            }, (err => {
            this.loading = false;
            }));
        }else{
            this.onDocumentSelected('Invoice');
        }
    }

    }

    uploadToCloud() {

        if (this.productData.length == 0) {
            this.msg.show('Please add a product to this order first.', 'error');
            return;
        }

        this.loading = true;
        let filename = `${this.documentService.document}.${this.orderDetails.orderNo}.pdf`;
        if(this.selectedDocument === 'Work Order'){
             if(this.getBoxLabelDoc){
                 filename = `Box Label.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
             }else{
                 filename = `${this.documentService.document}.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
             }
        }
        this.loading = true;
        const blob = this.documentRenderer.blob;
        const frmData = new FormData();
        frmData.append('fileUpload[]', new File([blob], filename));
        frmData.append('orderNo', this.orderDetails.orderNo);
        frmData.append('orderId', this.orderDetails.id);
        frmData.append('orderType', this.orderDetails.orderType);
        frmData.append('accountId', this.orderDetails.accountId);
        frmData.append('selectedDocument', this.selectedDocument);
        this.api.uploadOrderDocsToCloud(frmData)
            .subscribe((res: any) => {
                console.log(res);
                this.msg.show(`Succesfully uploaded ${filename}`, 'success');
                this.loading = false;
            }, (err => {
                this.loading = false;
            }));
    }

    generatePDF() {
        if (this.productData.length == 0) {
            this.msg.show('Please add a product to this order first.', 'error');
            return;
        }
        this.loading = true;
        let filename = `${this.documentService.document}.${this.orderDetails.orderNo}.pdf`;
        if(this.selectedDocument === 'Work Order'){
             if(this.getBoxLabelDoc){
                 filename = `Box Label.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
             }else{
                 filename = `${this.documentService.document}.${this.orderDetails.orderNo}.${this.selectedWorkOrderCnt}.pdf`;
             }
        }
        this.composeDialog(filename, this.documentRenderer.blob);
    }

    composeDialog(filename, blob) {
        this.loading = true;
        const basicMailData = {
            subject: this.selectedDocument,
            attachments: [{ filename: filename, type: 'blob', data: blob, mimetype: 'application/pdf' }]
        };

        let mail = new Mail(basicMailData);

        if (this.mailToType == 'customer') {
            let templateName;
            let docTypeSentEmailStatus;
            let tagName;
            templateName = 'Order Confirmation';
            tagName = 'Order Confirmation';
            switch (this.selectedDocument) {
                case 'Invoice':
                    templateName = 'Invoice';
                    tagName = 'Invoice';
                    break;
                case 'Proforma Invoice':
                    templateName = 'Proforma Invoice';
                    tagName = 'Proforma Invoice';
                    break;
                case 'Pick List':
                    templateName = 'Pick List';
                    tagName = 'Pick List';
                    break;
                case 'Order Confirmation':
                    templateName = 'Order Confirmation';
                    tagName = 'Order Confirmation';
                    break;
                case 'Credit Memo':
                    templateName = 'Credit Memo';
                    tagName = 'Credit Memo';
                    break;
                case 'Multi Quote':
                    templateName = 'Multi-Quote';
                    tagName = 'Multi-Quote';
                    break;
                case 'Simple Quote':
                    templateName = 'Simple Quote';
                    tagName = 'Simple Quote';
                    break;
                case 'Quote':
                    templateName = 'Quote PDF';
                    tagName = 'Quote PDF';
                    break;
                case 'Packing List':
                    templateName = 'Packing List';
                    tagName = 'Packing List';
                    break;
                case 'Art Proof':
                    templateName = 'Art Proof Electronic';
                    tagName = 'Art Proof Electronic';
                    break;
                case 'Art Proof':
                    templateName = 'Art Proof Electronic';
                    tagName = 'Art Proof Electronic';
                    break;
                case 'Work Order':
                     if(this.getBoxLabelDoc){
                        templateName = 'Box Label';
                        tagName = 'Box Label';
                     }else{
                        templateName = 'Work Order';
                        tagName = 'Work Order';
                     }
                    break;
                default:
                    templateName = '';
                    tagName = 'Order Confirmation';
                    break;
            }
            docTypeSentEmailStatus = this.selectedDocument;
            this.api.processEmailTemplateByName({ templateName: templateName, orderId: this.orderDetails.id, currentUserId: this.cuser, workOrderCount : this.selectedWorkOrderCnt }).subscribe((res: any) => {
                mail.subject = res.subject;
                mail.body = res.bodyHtml;
                mail.bccEmail = res.bccEmail;
                mail.ccEmail = res.ccEmail;
                this.api.getTaggedEmails(this.orderDetails.id, tagName).subscribe((res: any) => {
                    this.emailFound = false;
                    if (res.status !== undefined && res.status == 'success') {
                        res.accounts.forEach((emailEntry) => {
                            if (mail.to.indexOf(emailEntry.email) < 0) {
                                mail.to.push(emailEntry.email);
                            }
                        });
                        res.contacts.forEach((emailEntry) => {
                            switch (emailEntry.mailTo) {
                                case 'To':
                                    if (mail.to.indexOf(emailEntry.email) < 0) {
                                        mail.to.push(emailEntry.email);
                                        this.emailFound = true;
                                    }
                                    break;
                                case 'Cc':
                                    if (mail.cc.indexOf(emailEntry.email) < 0) {
                                        mail.cc.push(emailEntry.email);
                                        this.emailFound = true;
                                    }
                                    break;
                                case 'Bcc':
                                    if (mail.bcc.indexOf(emailEntry.email) < 0) {
                                        mail.bcc.push(emailEntry.email);
                                        this.emailFound = true;
                                    }
                                    break;
                                default:
                                    if (mail.to.indexOf(emailEntry.email) < 0) {
                                        mail.to.push(emailEntry.email);
                                        this.emailFound = true;
                                    }
                                    break;
                            }
                        });
                    }

                    let artworkResponses = [];
                    let requests = [];
                    requests.push('test');
                    //mail.to = [res.email];

                    // Unique designs
                    let uniqueDecoDesigns = this.orderDetails.lineItems.flatMap(item => item.decoVendors)
                        .reduce((vendors, vendor, index) => {
                            let vendorIndex = vendors.findIndex((_vendor) => {
                                return vendor.designId === _vendor.designId;
                            });
                            if (vendorIndex === -1) {
                                vendors.push(vendor);
                            }
                            return vendors;
                        }, []);


                    uniqueDecoDesigns.forEach((vendor) => {
                        // Group same artwork variations before pushing new requests
                        if (!vendor.designNo && vendor.designModal) {
                            vendor.designNo = vendor.designModal;
                        }
                        requests.push(
                            this.api.getAwsFilesByTag({
                                accountId: vendor.designCustomerId,
                                folderType: 'Artwork',
                                designNumber: vendor.designNo,
                                tags: ['Customer Info', 'Customer Proof']
                            })
                        );
                    });
                    if (1) {
                        this.loading = true;
                        // Which tag goes to which document can be determined by
                        forkJoin(requests).subscribe((responses: Array<any>) => {
                            const hasAttachments = responses.some(response => response.results && response.results.length > 0);

                            if (hasAttachments) {
                                artworkResponses = responses;
                            }

                            if (!this.emailFound) {
                                this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                                    disableClose: false
                                });
                                this.confirmDialogRef.componentInstance.confirmButtonText = 'Confirmation : no linked contact with document';
                                this.confirmDialogRef.componentInstance.confirmMessage = 'There are no contacts linked to this document, would you like to link them now?';
                                this.confirmDialogRef.componentInstance.confirmNote = 'Tag: ' + tagName
                                this.confirmDialogRef.componentInstance.confirmButtonText = 'Add now';
                                this.confirmDialogRef.componentInstance.cancelButtonText = 'May be later';
                                this.confirmDialogRef.afterClosed().subscribe(result => {
                                    if (result) {
                                        let arclRef = this.dialog.open(AccountsRelatedContactListComponent, {
                                            panelClass: 'accounts-related-contact-list',
                                            data: {
                                                orderId: this.orderDetails.id,
                                                accountId: this.orderDetails.accountId,
                                                tagName: tagName,
                                            }
                                        });
                                        arclRef.afterClosed()
                                            .subscribe(contact => {
                                                this.loading = false;
                                                this.api.getTaggedEmails(this.orderDetails.id, tagName).subscribe((res: any) => {
                                                    this.loading = true;
                                                    if (res.status !== undefined && res.status == 'success') {
                                                        res.accounts.forEach((emailEntry) => {
                                                            if (mail.to.indexOf(emailEntry.email) < 0) {
                                                                //this.emailFound = true;
                                                                mail.to.push(emailEntry.email);
                                                            }
                                                        });
                                                        res.contacts.forEach((emailEntry) => {
                                                            switch (emailEntry.mailTo) {
                                                                case 'To':
                                                                    if (mail.to.indexOf(emailEntry.email) < 0) {
                                                                        mail.to.push(emailEntry.email);
                                                                        this.emailFound = true;
                                                                    }
                                                                    break;
                                                                case 'Cc':
                                                                    if (mail.cc.indexOf(emailEntry.email) < 0) {
                                                                        mail.cc.push(emailEntry.email);
                                                                        this.emailFound = true;
                                                                    }
                                                                    break;
                                                                case 'Bcc':
                                                                    if (mail.bcc.indexOf(emailEntry.email) < 0) {
                                                                        mail.bcc.push(emailEntry.email);
                                                                        this.emailFound = true;
                                                                    }
                                                                    break;
                                                                default:
                                                                    if (mail.to.indexOf(emailEntry.email) < 0) {
                                                                        mail.to.push(emailEntry.email);
                                                                        this.emailFound = true;
                                                                    }
                                                                    break;
                                                            }
                                                        });
                                                    }
                                                    this.openMailDialog(mail, artworkResponses, templateName, this.orderDetails.accountId, docTypeSentEmailStatus);
                                                });
                                            });
                                    } else {
                                        this.openMailDialog(mail, artworkResponses, templateName, this.orderDetails.accountId, docTypeSentEmailStatus);
                                    }
                                    this.confirmDialogRef = null;
                                });
                            } else {
                                this.openMailDialog(mail, artworkResponses, templateName, this.orderDetails.accountId, docTypeSentEmailStatus);
                            }
                        });
                    }
                });
            });
        } else if (this.mailToType == 'vendor') {
            let vendorId;
            let tagName;
            let templateName;
            let docTypeSentEmailStatus;
            let uniqueDecoDesigns = [];
            if (this.selectedDocument === 'Decoration PO') {
                if (this.orderDetails.isRushOrder == 'Yes') {
                    tagName = 'Rush Order PO Decorator';
                } else {
                    tagName = 'Purchase Order Decorator';
                }
                templateName = 'Purchase Order Decorator';
                vendorId = this.orderDetails.lineItems.reduce((vendors, item, idx) => {
                    for (let i = 0; i < item.decoVendors.length; i++) {
                        vendors.push(item.decoVendors[i]);
                    }
                    return vendors;
                }, []).find(x => x.vendorName == this.selectedPoVendor).vendorId;

                // Unique designs
                uniqueDecoDesigns = this.decoDataGroupByDecoVendors[this.selectedPoVendor]
                    .reduce((vendors, vendor, index) => {
                        let vendorIndex = vendors.findIndex((_vendor) => {
                            return vendor.designId === _vendor.designId;
                        });
                        if (vendorIndex === -1) {
                            vendors.push(vendor);
                        }
                        return vendors;
                    }, []);

            } else {
                tagName = 'Purchase Order Supplier';
                if (this.orderDetails.isRushOrder == 'Yes') {
                    tagName = 'Rush Order PO Supplier';
                } else {
                    tagName = 'Purchase Order Supplier';
                }
                templateName = 'Purchase Order Supplier';
                vendorId = this.lineItemGroupByVendors[this.selectedPoVendor][0].vendorId;
                // Unique designs
                uniqueDecoDesigns = this.lineItemGroupByVendors[this.selectedPoVendor]
                    .flatMap((line) => line.decoVendors)
                    .reduce((vendors, vendor, index) => {
                        let vendorIndex = vendors.findIndex((_vendor) => {
                            return vendor.designId === _vendor.designId;
                        });
                        if (vendorIndex === -1) {
                            vendors.push(vendor);
                        }
                        return vendors;
                    }, []);
            }
            docTypeSentEmailStatus = this.selectedDocument+': '+this.selectedPoVendor;
            this.api.processEmailTemplateByName({ templateName: templateName, orderId: this.orderDetails.id, vendorId: vendorId, currentUserId: this.cuser }).subscribe((res: any) => {
                mail.subject = res.subject;
                mail.body = res.bodyHtml;
                mail.bccEmail = res.bccEmail;
                mail.ccEmail = res.ccEmail;
                this.api.getPoEmails(this.orderDetails.id, vendorId, tagName).subscribe((res: any) => {
                    this.emailFound = false;
                    if (res.status !== undefined && res.status == 'success') {
                        res.vendors.forEach((emailEntry) => {
                            if (mail.to.indexOf(emailEntry.email) < 0) {
                                mail.to.push(emailEntry.email);
                            }
                        });
                        res.contacts.forEach((emailEntry) => {
                            switch (emailEntry.mailTo) {
                                case 'To':
                                    if (mail.to.indexOf(emailEntry.email) < 0) {
                                        mail.to.push(emailEntry.email);
                                        this.emailFound = true;
                                    }
                                    break;
                                case 'Cc':
                                    if (mail.cc.indexOf(emailEntry.email) < 0) {
                                        mail.cc.push(emailEntry.email);
                                        this.emailFound = true;
                                    }
                                    break;
                                case 'Bcc':
                                    if (mail.bcc.indexOf(emailEntry.email) < 0) {
                                        mail.bcc.push(emailEntry.email);
                                        this.emailFound = true;
                                    }
                                    break;
                                default:
                                    if (mail.to.indexOf(emailEntry.email) < 0) {
                                        mail.to.push(emailEntry.email);
                                        this.emailFound = true;
                                    }
                                    break;
                            }
                        });
                    }
                    //mail.to = [res];
                    const requests = [];
                    requests.push('test');
                    let artworkResponses = [];

                    uniqueDecoDesigns.forEach((vendor) => {
                        // Group same artwork variations before pushing new requests
                        if (!vendor.designNo && vendor.designModal) {
                            vendor.designNo = vendor.designModal;
                        }
                        requests.push(
                            this.api.getAwsFilesByTag({
                                accountId: vendor.designCustomerId,
                                folderType: 'Artwork',
                                designNumber: vendor.designNo,
                                tags: ['Vendor Info', 'Vendor Proof']
                            })
                        );
                    });

                    if (1) {
                        // Which tag goes to which document can be determined by
                        this.loading = true;
                        forkJoin(requests).subscribe((responses: any[]) => {

                            const hasAttachments = responses.some(response => response.results && response.results.length > 0);
                            if (hasAttachments) {
                                artworkResponses = responses;
                            }

                            if (!this.emailFound) {
                                this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                                    disableClose: false
                                });
                                this.confirmDialogRef.componentInstance.confirmButtonText = 'Confirmation : no linked contact with document';
                                this.confirmDialogRef.componentInstance.confirmMessage = 'There are no contacts linked to this document, would you like to link them now?';
                                this.confirmDialogRef.componentInstance.confirmNote = 'Tag: ' + tagName
                                this.confirmDialogRef.componentInstance.confirmButtonText = 'Add now';
                                this.confirmDialogRef.componentInstance.cancelButtonText = 'May be later';
                                this.confirmDialogRef.afterClosed().subscribe(result => {
                                    if (result) {
                                        let arclRef = this.dialog.open(AccountsRelatedContactListComponent, {
                                            panelClass: 'accounts-related-contact-list',
                                            data: {
                                                orderId: this.orderDetails.id,
                                                accountId: vendorId,
                                                tagName: tagName,
                                            }
                                        });
                                        arclRef.afterClosed()
                                            .subscribe(contact => {
                                                this.loading = false;
                                                this.api.getPoEmails(this.orderDetails.id, vendorId, tagName).subscribe((res: any) => {
                                                    this.loading = true;
                                                    if (res.status !== undefined && res.status == 'success') {
                                                        res.vendors.forEach((emailEntry) => {
                                                            if (mail.to.indexOf(emailEntry.email) < 0) {
                                                                //this.emailFound = true;
                                                                mail.to.push(emailEntry.email);
                                                            }
                                                        });

                                                        res.contacts.forEach((emailEntry) => {
                                                            switch (emailEntry.mailTo) {
                                                                case 'To':
                                                                    if (mail.to.indexOf(emailEntry.email) < 0) {
                                                                        mail.to.push(emailEntry.email);
                                                                    }
                                                                    break;
                                                                case 'Cc':
                                                                    if (mail.cc.indexOf(emailEntry.email) < 0) {
                                                                        mail.cc.push(emailEntry.email);
                                                                    }
                                                                    break;
                                                                case 'Bcc':
                                                                    if (mail.bcc.indexOf(emailEntry.email) < 0) {
                                                                        mail.bcc.push(emailEntry.email);
                                                                    }
                                                                    break;
                                                                default:
                                                                    if (mail.to.indexOf(emailEntry.email) < 0) {
                                                                        mail.to.push(emailEntry.email);
                                                                    }
                                                                    break;
                                                            }
                                                        });
                                                    }
                                                    this.openMailDialog(mail, artworkResponses, templateName, this.orderDetails.accountId, docTypeSentEmailStatus);
                                                });
                                            });
                                    } else {
                                        this.openMailDialog(mail, artworkResponses, templateName, this.orderDetails.accountId, docTypeSentEmailStatus);
                                    }
                                    this.confirmDialogRef = null;
                                });
                            } else {
                                this.openMailDialog(mail, artworkResponses, templateName, this.orderDetails.accountId, docTypeSentEmailStatus);
                            }
                            //this.openMailDialog(mail, artworkResponses);
                        });
                    }
                });
            });
        } else {
            let vendorId = this.getSelectedVendorId();
            if (!vendorId) {
                vendorId = this.getSelectedDecoVendorId();
            }

            this.dialogRef3 = this.dialog.open(FuseMailComposeDialogComponent, {
                panelClass: 'compose-mail-dialog',
                data: {
                    action: 'Send',
                    mail: mail
                }
            });
            this.dialogRef3.afterClosed()
                .subscribe(res => {
                    if (!res) {
                        return;
                    }

                    this.dialogRef = null;
                    if (!res) {
                        return;
                    }

                    mail = res.mail;
                    const data = new FormData();
                    const frmData = new FormData();
                    data.append('userId', this.auth.getCurrentUser().userId);
                    data.append('to', mail.to.join(','));
                    data.append('cc', mail.cc.join(','));
                    data.append('bcc', mail.bcc.join(','));
                    data.append('from', mail.from);
                    data.append('subject', mail.subject);
                    data.append('body', mail.body);
                    frmData.append('orderNo', this.orderDetails.orderNo);
                    frmData.append('orderId', this.orderDetails.id);
                    frmData.append('orderType', this.orderDetails.orderType);
                    frmData.append('accountId', this.orderDetails.accountId);
                    frmData.append('selectedDocument', this.selectedDocument);

                    mail.attachments.forEach((attachment: Attachment) => {
                        data.append('attachment[]', new File([attachment.data], attachment.filename));
                        frmData.append('fileUpload[]', new File([attachment.data], attachment.filename));
                    });

                    this.api.sendMailSMTP(data)
                        .subscribe(
                            (res: any) => {
                                if (this.selectedDocument == 'Purchase Order' || this.selectedDocument == 'Decoration PO') {
                                    // this.orderDetails.lineItems.forEach((lineItem: any) => {
                                    this.api.updateWorkflowEvent(this.orderDetails.id, vendorId, 1, 2);
                                    this.api.updatePONeedsStatus(this.orderDetails.id, vendorId);
                                    // });
                                }

                                this.api.uploadOrderDocsToCloud(frmData)
                                    .subscribe((res: any) => {
                                        this.msg.show(`Succesfully uploaded to cloud`, 'success');
                                        this.loading = false;
                                    }, (err => {
                                        this.loading = false;
                                    }));


                                this.msg.show('Email sent', 'success');
                            },
                            (err: any) => {
                                this.loading = false;
                                this.msg.show(err.error.msg, 'error');
                                console.log(err);
                            }
                        );

                });
        }
    }

    private openMailDialog(mail: Mail, artworkResponses = [], docType = '', accountId = '', docTypeSentEmailStatus = '') {
        this.loading = false;
        let vendorId = this.getSelectedVendorId();
        if (!vendorId) {
            vendorId = this.getSelectedDecoVendorId();
        }

        this.dialogRef3 = this.dialog.open(FuseMailComposeDialogComponent, {
            panelClass: 'compose-mail-dialog',
            data: {
                action: 'Send',
                mail: mail,
                artworkResponses: artworkResponses,
                docType: docType,
                docTypeSentEmailStatus: docTypeSentEmailStatus,
                orderId: this.orderDetails.id,
                accountId: accountId,
                enableContacts: true
            }
        });
        this.dialogRef3.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                }
                this.loading = true;
                this.dialogRef = null;
                mail = res.mail;
                const data = new FormData();
                const frmData = new FormData();
                data.append('userId', this.auth.getCurrentUser().userId);
                data.append('userName', this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName);
                data.append('to', mail.to.join(','));
                data.append('cc', mail.cc.join(','));
                data.append('bcc', mail.bcc.join(','));
                data.append('from', mail.from);
                data.append('subject', mail.subject);
                data.append('body', mail.body);
                data.append('orderNo', this.orderDetails.orderNo);
                data.append('orderId', this.orderDetails.id);
                data.append('accountId', this.orderDetails.accountId);
                data.append('selectedDocument', this.selectedDocument);
                data.append('docTypeSentEmailStatus', docTypeSentEmailStatus);

                frmData.append('orderNo', this.orderDetails.orderNo);
                frmData.append('orderId', this.orderDetails.id);
                frmData.append('orderType', this.orderDetails.orderType);
                frmData.append('accountId', this.orderDetails.accountId);
                frmData.append('selectedDocument', this.selectedDocument);
                frmData.append('docTypeSentEmailStatus', docTypeSentEmailStatus);

                mail.attachments.forEach((attachment: Attachment) => {
                    data.append('attachment[]', new File([attachment.data], attachment.filename));
                    frmData.append('fileUpload[]', new File([attachment.data], attachment.filename));
                });

                this.api.sendMailSMTP(data)
                    .subscribe(
                        (res: any) => {
                            if (this.selectedDocument == 'Purchase Order' || this.selectedDocument == 'Decoration PO') {
                                //  this.orderDetails.lineItems.forEach((lineItem: any) => {
                                this.api.updateWorkflowEvent(this.orderDetails.id, vendorId, 1, 2);
                                this.api.updatePONeedsStatus(this.orderDetails.id, vendorId);
                                // });
                            }
                if (this.orderDetails.emailSentStatus && this.orderDetails.emailSentStatus.indexOf(docTypeSentEmailStatus) === -1) {
                this.orderDetails.emailSentStatus.push(docTypeSentEmailStatus);
                }
                            this.api.uploadOrderDocsToCloud(frmData)
                                .subscribe((res: any) => {
                                    this.msg.show(`Succesfully uploaded to cloud`, 'success');
                                    this.loading = false;
                                }, (err => {
                                    this.loading = false;
                                }));
                            this.msg.show('Email sent', 'success');
                        },
                        (err: any) => {
                            this.loading = false;
                            this.msg.show(err.error.msg, 'error');
                            console.log(err);
                        });
            });
        return mail;
    }

    getSelectedVendorId() {
        let vendorId;
        if (this.selectedPoVendor
            && this.lineItemGroupByVendors[this.selectedPoVendor]
            && this.lineItemGroupByVendors[this.selectedPoVendor][0]
        ) {
            vendorId = this.lineItemGroupByVendors[this.selectedPoVendor][0].vendorId;
        }
        return vendorId;
    }

    getSelectedDecoVendorId() {
        let vendorId;
        if (this.selectedPoVendor
            && this.decoDataGroupByDecoVendors[this.selectedPoVendor]
            && this.decoDataGroupByDecoVendors[this.selectedPoVendor][0]
        ) {
            vendorId = this.decoDataGroupByDecoVendors[this.selectedPoVendor][0].decoVendorId;
        }
        return vendorId;
    }

    getSelectedDecoVendorName() {
        let vendorName;
        if (this.selectedPoVendor
            && this.decoDataGroupByDecoVendors[this.selectedPoVendor]
            && this.decoDataGroupByDecoVendors[this.selectedPoVendor][0]
        ) {
            vendorName = this.decoDataGroupByDecoVendors[this.selectedPoVendor][0].vendorName;
        }
        return vendorName;
    }

    getSelectedPLVendorId() {
        let vendorId;
        if(this.selectedPLVendor == 'All'){
            vendorId = 'All';
        }else{
                if (this.selectedPLVendor
                    && this.packingListGroupByVendors[this.selectedPLVendor]
                    && this.packingListGroupByVendors[this.selectedPLVendor][0]
                ) {
                    vendorId = this.packingListGroupByVendors[this.selectedPLVendor][0].vendorId;
                }else{
                    vendorId = '';
                }
        }

        return vendorId;
    }
    
    pushPsEntity() {
        let vendorId = this.getSelectedVendorId();
        if (!vendorId) {
            vendorId = this.getSelectedDecoVendorId();
        }

        if (vendorId) {
            this.api.pushElectronicEntity(this.electronicEndpoint, 'Purchase Order', vendorId, this.orderDetails.id)
                .then((res: any) => {
                    this.api.updatePONeedsStatus(this.orderDetails.id, vendorId);
                    this.msg.show(res.msg, 'success');
                }).catch((err) => {
                    console.log(err);
                });
        }
    }

    createProof(proof) {
        this.orderFormService.order$.pipe(
            take(1)
        ).subscribe((order) => {
            const dialog = this.dialog.open(OrderArtProofComponent, {
                data: {
                    order: order,
                    model: {
                        order_id: order.id,
                        account_id: order.accountId,
                        ...proof
                    }
                }
            });
            dialog.afterClosed().subscribe((res) => {
                this.orderFormService.loadArtProofs(order.id);
            });
        });

    }

    editProof(proof) {
        this.orderFormService.order$.pipe(
            take(1)
        ).subscribe((order) => {
            const dialog = this.dialog.open(OrderArtProofComponent, {
                data: {
                    order: order,
                    model: proof,
                }
            });
            dialog.afterClosed().subscribe((res) => {
                this.orderFormService.loadArtProofs(order.id);
            });

        });
    }




    proformaDateChange(event) {
        this.proformaDate = moment(event.value).format('YYYY-MM-DD');
        this.orderDetails.proformaDate = this.proformaDate;
        this.documentService.updateProformaDate({ order_id: this.orderDetails.id, date: this.proformaDate })
            .subscribe((res) => {
                this.makePdf();
            }, (err) => {
                this.loading = false;
            });
    }

    sendCxmlInvoice() {
      this.cxmlService.sendInvoice(this.orderDetails.id)
      .subscribe((res: any) => {
        if (res.msg) {
          this.msg.show(res.msg, 'success');
          this.loading = false;
        } else {
          this.msg.show('An error occured, please try again', 'error');
          this.loading = false;
        }
      }, (err) => {
        this.msg.show(err.error.msg, 'error');
        this.loading = false;
      });
    }
    isDocSent() {
    let mySelectedDocument = this.selectedDocument;
    if(mySelectedDocument === 'Purchase Order' || mySelectedDocument === 'Decoration PO'){
        mySelectedDocument = this.selectedDocument+': '+this.selectedPoVendor;
    }
    if (this.orderDetails.emailSentStatus && this.orderDetails.emailSentStatus.indexOf(mySelectedDocument) > -1) {
    return true;
    }
    return false;
    }
    sliderDocGridViewToggled(ev){
        this.docGridView = ev.checked;
        if(!this.docGridView){
            this.docGridViewGroupByVariation = false;
        }

        switch (this.selectedDocument) {
            case 'Invoice':
            case 'Order Recap':
            case 'Quote Recap':
            case 'Proforma Invoice':
            case 'Order Confirmation':
            case 'Quote':
            case 'Multi Quote':
            case 'Simple Quote':
            case 'Pick List':
            case 'Art Proof':
            case 'Credit Memo':
                this.onDocumentSelected(this.selectedDocument);
            break;
            case 'Packing List':
                if(this.showPackigListByVendor && !this.showPackigListByAllVendors && this.selectedPLVendor !=''){
                    this.onPackingListSelected(this.selectedCurrentDocumentKey);
                }else if(this.showPackigListByVendor && this.showPackigListByAllVendors && this.selectedPLVendor !=''){
                    this.onPackingListSelected(this.selectedCurrentDocumentKey);
                }else if(this.showPackigListByVendor && this.showPackigListByAllVendors && this.selectedPLVendor ==''){
                    this.onDocumentSelected(this.selectedDocument);
                }else{
                    this.onDocumentSelected(this.selectedDocument);
                }
            break;
            case 'Work Order':
                this.onWorkOrderSelected('temp', this.selectedCurrentDocumentKey);
            break;
            case 'Decoration PO':
                this.onPODecorationVendorSelected(this.selectedCurrentDocumentKey);
            break;
            case 'Purchase Order':
                this.onPODocumentSelected(this.selectedCurrentDocumentKey);
            break;
            default: 
                this.onDocumentSelected(this.selectedDocument)
        }
        
        
    }    

    sliderHideQuoteTotalToggled(ev){
        this.hideQuoteTotal = ev.checked;
        this.onDocumentSelected(this.selectedDocument);        
    }    

    sliderDocGridViewGroupByVariationToggled(ev){
        this.docGridViewGroupByVariation = ev.checked;
        this.onDocumentSelected(this.selectedDocument)
    }

    editBoxLabelQty(){
        let selectedBoxLabelQuantity = [];
        if (typeof this.orderDetails.workOrderBoxLabel[this.selectedWorkOrderCnt] !=='undefined') {
            selectedBoxLabelQuantity = this.orderDetails.workOrderBoxLabel[this.selectedWorkOrderCnt];
        }else{
            selectedBoxLabelQuantity.push({"boxNo":"1","totalBox":"1","qty":"0","totalQty":"0","shipDate":""});
        }
        const dialog = this.dialog.open(BoxLabelQuantityEditorComponent, {
        data: {
            selectedBoxLabelQuantity: selectedBoxLabelQuantity
        }
        });
        dialog.afterClosed().subscribe((res) => {
        if (!res) { return; }
        
        if(res.boxLabelQuantity){
            if (typeof this.orderDetails.workOrderBoxLabel[this.selectedWorkOrderCnt] !=='undefined') {
               this.orderDetails.workOrderBoxLabel[this.selectedWorkOrderCnt] = [];
            }
            this.orderDetails.workOrderBoxLabel[this.selectedWorkOrderCnt] = res.boxLabelQuantity;
            this.loading = true;
            const data = {"id": this.orderDetails.id, "workOrderBoxLabelsDetails" : Object.assign({}, this.orderDetails.workOrderBoxLabel)};
            this.api.updateWorkOrderBoxLabels(data)
            .subscribe((res) => {
                this.onWorkOrderSelected('temp', this.selectedWorkOrderCnt, true);
            }, (err) => {
            this.loading = false;
            });                
        }
        

        });    
    }
    editSimpleQuote() {
        const dialog = this.dialog.open(SimpleQuoteContentEditorComponent, {
        data: {
            order: this.orderDetails,
            quotesAllProducts: this.quotesAllProducts,
        }
        });
        dialog.afterClosed().subscribe((res) => {
        if (!res) { return; }
        if(res.simpleQuoteContent){
            this.loading = true;
            this.api.updateSimpleQuoteContents(res.simpleQuoteContent)
            .subscribe((res) => {
            ////this.makePdf();
            this.onDocumentSelected('Simple Quote');
            }, (err) => {
            this.loading = false;
            });                
        }

        });
    }

    editPackingListQty(){

        const dialog = this.dialog.open(PackingListQuantityEditorComponent, {
        data: {
            order: this.orderDetails,
            vendorId: this.getSelectedPLVendorId(),
        }
        });
        dialog.afterClosed().subscribe((res) => {
        if (!res) { return; }
        
        if(res.packingListQuantity){            
            console.log(res);
            console.log(res.customPLNote);
            res.packingListQuantity.forEach((row) => {
                this.packingListTempQuantity[row.matrixUpdateId] = row.quantity;
                this.packingListTempBoxNotes[row.matrixUpdateId] = row.boxNotes;
            });
            if(res.customPLNote){
                this.customPLNote = res.customPLNote;
            }
            if(res.boxNotesPLColumn){
                this.boxNotesPLColumn = res.boxNotesPLColumn;
            }
            this.updatedpackingListTempQuantity = true;
                if(this.showPackigListByVendor && !this.showPackigListByAllVendors && this.selectedPLVendor !=''){
                    this.onPackingListSelected(this.selectedCurrentDocumentKey);
                }else if(this.showPackigListByVendor && this.showPackigListByAllVendors && this.selectedPLVendor !=''){
                    this.onPackingListSelected(this.selectedCurrentDocumentKey);
                }else if(this.showPackigListByVendor && this.showPackigListByAllVendors && this.selectedPLVendor ==''){
                    this.onDocumentSelected(this.selectedDocument);
                }else{
                    this.selectedPLVendor = '';
                    this.onDocumentSelected(this.selectedDocument);
                }
            //this.onDocumentSelected('Packing List');
        }
        

        });    
    }
  ngAfterViewInit() {
  }
}

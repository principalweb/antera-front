import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { PurchaseOrder, OrderColors } from 'app/models';
import { Store, select } from "@ngrx/store";
import { Subject, Subscription, forkJoin, of, Observable } from 'rxjs';
import { takeUntil, concatMap, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import * as fromPurchaseOrder from "app/features/e-commerce/purchase-orders/state/purchase-orders.state";
import { PurchaseOrderService } from '../services/purchase-order.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute, Data } from '@angular/router';
import { LineItem } from '../interface/interface';
import { treeify } from '../util/formatter';
import { ShipInfo } from 'app/models/shipinfo';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabGroup, MatTab, MatTabHeader } from '@angular/material/tabs';
import { EditShippingDialogComponent } from "./edit-shipping-dialog/edit-shipping-dialog.component";
import * as PurchaseOrderSelectors from "../state/selectors/purchase-orders.selectors";
import * as PurchaseOrderActions from "../store/purchase-orders.actions";
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { ChangeVendorWarningDialogComponent } from './change-vendor-warning-dialog/change-vendor-warning-dialog.component';
import { IDocument } from 'app/features/documents/document.interface';
import { DocumentsService } from 'app/core/services/documents.service';
import { DocumentHelpersService } from 'app/features/documents/document-helpers.service';
import { DocumentPdfComponent } from 'app/features/documents/document-pdf/document-pdf.component';
import { InvoiceDocument } from 'app/features/documents/templates/invoice.document';
import { PurchaseOrderNeedsDocument } from 'app/features/documents/templates/purchase-order-needs.document';
import { fx2Str, exportImageUrlForPDF, b64toBlob, fx2N } from 'app/utils/utils';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
import { ModuleField } from 'app/models/module-field';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail, Attachment } from 'app/models/mail';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { MailAccountDialogComponent } from 'app/shared/account-form/account-form.component';
import { AccountsRelatedContactListComponent } from 'app/shared/accounts-related-contact-list/accounts-related-contact-list.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
interface ITreeNode extends LineItem {
  children?: LineItem[]
}
@Component({
  selector: 'detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DetailComponent implements OnInit, OnDestroy{
  treeControl = new NestedTreeControl<ITreeNode>(node => node.children);
  treeList = new MatTreeNestedDataSource<ITreeNode>();
  editVendor: boolean = false;
  editInHandDate: boolean = false;
  editNotes: boolean = false;
  purchaseOrder: PurchaseOrder;
  vendorForm: FormGroup;
  inHandDateForm: FormGroup;
  poNotes: string = "";
  currentVendor: {[key: string]: string};
  accounts: Observable<any>;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  dialogRef: MatDialogRef<EditShippingDialogComponent>;
  vendorWarningRef: MatDialogRef<ChangeVendorWarningDialogComponent>;
  colors = OrderColors;
  @ViewChild('documentRenderer') documentRenderer: DocumentPdfComponent;
  documentDefinition: any;
  document: IDocument;
  filename = 'PURCHASE ORDER';
  selectedDocument = 'Purchase Order';
  orderDetails: any;
  selectedIndex = 0;
  logoUrl = '';
  loading = false;
  docOptions = [];
  docDefaultOptions = [];
  creditTerms = [];
  ordersConfig = [];
  dynamicDocumentLabels = [];
  savedDocumentFieldsLabels: ModuleField[];
  fields = [];
  mailToType = 'vendor';
  emailFound = false;
  cuser = '';
  dialogRef1: MatDialogRef<MailAccountDialogComponent>;
  dialogRef2: MatDialogRef<MailAccountDialogComponent>;
  dialogRef3: MatDialogRef<FuseMailComposeDialogComponent>;
  credentialsDialogRef: MatDialogRef<MailCredentialsDialogComponent>
  hideEmailButton: boolean = false;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
//   @ViewChild(MatDatepicker) datePicker: MatDatepicker<any>;
//   @ViewChild('pickerInput') pickerInput: ElementRef;
  constructor(private store: Store<fromPurchaseOrder.State>,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private api: ApiService,
    public orderService: PurchaseOrderService, 
    private documentHelper: DocumentHelpersService,
    private documentService: DocumentsService,
    private msg: MessageService,
    private auth: AuthService) { 
        this.documentDefinition = undefined;
        this.document = undefined;  
        this.documentService.document = 'Purchase Order';
      
    }

    ngAfterViewInit(){
        this.treeList.data = treeify(this.orderService.purchaseOrder.lineItems);
    }


  ngOnInit() {
    this.subscribeToDetailOrder();
    this.subscribeToPoNotes();
      this.treeList.data = treeify(this.orderService.purchaseOrder.lineItems);
    this.api.getLogo().subscribe((res: any) => {
        this.logoUrl = exportImageUrlForPDF(res.url);
    });
    this.documentService.getDocumentOptions().then((docOptions) => {
      this.docOptions = docOptions;
      this.getDocAllDefaultOptions();
    }).catch((err) => {
    });
    this.getSavedDocumentFieldsLabels();
    this.getModuleFields();
    this.cuser = this.auth.getCurrentUser().userId;
    
    const dropdownOptions = [
      'sys_credit_terms_list',
    ];
   this.getDropdownOptions(dropdownOptions)
  }

  

  changeVendor(){
    this.createVendorForm();
    this.editVendor = true;
  }

  subscribeToPoNotes(){
      this.store.pipe(takeUntil(this.destroyed$), select(PurchaseOrderSelectors.getSelectedPurchaseOrder),
      map((purchaseOrder: PurchaseOrder) => {
          this.purchaseOrder = purchaseOrder;
          if (purchaseOrder && purchaseOrder.lineItems) this.treeList._data.next(treeify(purchaseOrder.lineItems));
          return purchaseOrder.poNotes;
      }))
      .subscribe((poNotes: string) => {

          this.poNotes = poNotes;
      })
  }

  changeInHandDate(mode: boolean){
      if (mode) this.createInHandDateForm();
      this.editInHandDate = mode;
  }

  changeNotes(mode: boolean){
      this.editNotes = mode;
  }

  updateNotes(){
      this.store.dispatch(new PurchaseOrderActions.UpdatePurchaseOrder({
          purchaseOrderId: this.orderService.purchaseOrderId,
          data: {
              po_notes: this.poNotes
          }
      }));
      this.editNotes = false;
  }

    updateInHandDate(){
        if (this.inHandDateForm.valid){
            this.store.dispatch(new PurchaseOrderActions.IsLoading(true));
            this.store.dispatch(new PurchaseOrderActions.UpdatePurchaseOrder({
                purchaseOrderId: this.orderService.purchaseOrderId,
                data: {
                    inhand_date: new Date(this.inHandDateForm.controls.inHandDate.value)
                }
            }));

            this.editInHandDate = false;
        }
    }

  anyNullDescription(){
    return this.orderService.purchaseOrder.lineItems.some((lineItem: LineItem) => lineItem.description === "");
  }

  selectVendor(event){
    const account = event.option.value;
    this.vendorForm.patchValue({
      vendor: account.name
    });
  }

  saveVendor(){
    if (this.vendorForm.valid) {
      this.vendorWarning();
    }
  }

  cancelEdit(){
    this.editVendor = false;
  }

  subscribeToVendorAutocomplete() {
    this.accounts = this.vendorForm.controls.vendor.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((val) => this.api.getVendorAutocomplete(val))
    );
  }

  createVendorForm(){
    this.vendorForm = this.fb.group({
      vendor: [this.orderService.purchaseOrder.vendor, Validators.required, this.verifyVendor.bind(this)]
    });
    this.subscribeToVendorAutocomplete();
  }

  createInHandDateForm(){
      this.inHandDateForm = this.fb.group({
          inHandDate: [this.orderService.purchaseOrder.inhandDate, Validators.required]
      });
  }

  subscribeToDetailOrder(){
    this.store.pipe(takeUntil(this.destroyed$), select(PurchaseOrderSelectors.getSelectedPurchaseOrder))
    .subscribe((purchaseOrder: PurchaseOrder) => {
      if (purchaseOrder) this.treeList.data = purchaseOrder.lineItems;
    })
  }


  ngOnDestroy(){
    this.destroyed$.next(true);
  }

  arrayNewLine(shipInfo: ShipInfo): string{
    return shipInfo.addressLines.join(" ") + " \n" + `${shipInfo.city}, ${shipInfo.state} ${shipInfo.postalCode} \n ${shipInfo.phone}`
  }

  vendorWarning(){
    this.vendorWarningRef = this.dialog.open(ChangeVendorWarningDialogComponent, {
      panelClass: ['vendorWarning'],
      data: {
        currentVendor: this.currentVendor
      },
    });

    this.vendorWarningRef.afterClosed()
    .subscribe(result => {
      if (result){
        this.store.dispatch(new PurchaseOrderActions.ChangeVendor({
          id: this.orderService.purchaseOrderId,
          vendor: this.currentVendor.name,
          vendorId: this.currentVendor.id
        }));
        this.editVendor = false;
      }
    })
  }

  editShipping(shipInfo: ShipInfo){
    this.dialogRef = this.dialog.open(EditShippingDialogComponent, {
      panelClass: ['antera-details-dialog', 'editShipping'],
      data: {
        shipInfo
      }
    });
  }

  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;
  findLineItem(id: string){
    return this.orderService.purchaseOrder.lineItems.find(lineItem => lineItem.id === id);
  }

  verifyVendor(formControl: FormControl): Promise<any> | Observable<any> {
    return this.api.getVendorAutocomplete(formControl.value)
      .pipe(debounceTime(200), concatMap((accounts: any[]) => {
        if (accounts.findIndex((account: any) => account.name === formControl.value) === -1) {
          return of({ verifyVendor: true });
        } else {
          const currentAccount = accounts.find((account: any) => account.name === formControl.value);
          this.currentVendor = {
            id: currentAccount.id,
            name: currentAccount.name
          }
          return of(null);
        }

      }));
  }
    tabClicked(tab) {
        if(tab.tab.textLabel == 'Document'){
            this.makePdf();
        }
    }  
    makePdf() {
        this.loading = true;
        let logoUrl = this.logoUrl;
	this.api.getProductGroupAttributeValues('size')
	    .subscribe((attributes: any) => {
		if (attributes) {
			let productSizesSorting = [];
			attributes.forEach((attribute: any) => {
			    productSizesSorting[attributes.value] = attributes.label;
			});			        
			const defaultConfig = {
			    logoUrl: logoUrl,
			    docOptions: this.docOptions,
			    docDefaultOptions: this.docDefaultOptions,
			    creditTerms: this.creditTerms,
			    ordersConfig: this.ordersConfig,
			    dynamicDocumentLabels: this.dynamicDocumentLabels[this.selectedDocument],
			    fields: this.fields,
			    /*fields: this.fields,
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
			    shipInfoList: this.shipInfoList,*/
			};

			let resolver;
			this.orderDetails = {
			orderNo : this.orderService.purchaseOrder.number,
			alternateAccountNumber: '',
			attentionTo: '',
			bookedDate: '',
			csrEmail: '',
			csrName: '',
			csrPhone: '',
			customerPo: '',
			orderIdentity: '',
			salesPerson: '',
			salesPersonEmail: '',
			salesPersonPhone: '',
			shippingAccountNo: '',
			shipVia: '',
			orderType: 'PO',
			finalGrandTotalPrice: this.orderService.purchaseOrder.totalAmount,
			dueDate: '',
			factoryShipDate: '',
			inHandDateBy: this.orderService.purchaseOrder.inhandDate,
			orderDate: this.orderService.purchaseOrder.created,
			shipDate: '',
			supplierShipDate: '',        
			lineItems: this.orderService.purchaseOrder.lineItems,
			productSizesSorting: productSizesSorting,
			creditTerms: this.orderService.purchaseOrder.vendorTerms,
			vendorNotes: this.orderService.purchaseOrder.poNotes,
			vendorInfo: this.orderService.purchaseOrder.vendorInfo,
			};
			resolver = this.fetchVendorAccount(this.orderService.purchaseOrder.vendorId);
			this.document = new PurchaseOrderNeedsDocument({
			    ...defaultConfig,
			    order: this.orderDetails,
			    docGridView:true
			});
			if (resolver) {
			    resolver.subscribe((res) => {
				this.document.config.resolve = res;
				this.getDocumentDefinition();
			    });
			} else {
			    this.getDocumentDefinition();
			}

		}
	    });

    }
    getDocumentDefinition() {
        if (this.document) {
            this.document.setFormatter(this.documentHelper);
            this.document.getDocumentDefinition().subscribe((definition) => {
                this.documentDefinition = definition;
                this.loading = false;
            },(err) => {
          console.log(err);
          this.loading = false;
        });
        } else {
            this.documentDefinition = undefined;
            this.loading = false;
        }
    }
    getDocAllDefaultOptions() {
        this.docDefaultOptions = [];
        var data = [];
        each(this.docOptions, row => {
            if (row.value) {
                data.push(row.name);
            }
        });
        this.api.getDocsAllDefaultOptions({ names: data, type: 'Purchase Order' })
            .subscribe((res: any) => {
                if (res) {
                    this.docDefaultOptions = res;
                }
            });
    }
    fetchVendorAccount(vendorId: string) {
        return this.api.getAccountDetails(vendorId);
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
    getModuleFields() {
        const opts =
        {
            offset: 0,
            limit: 100,
            order: 'module',
            orient: 'asc',
            term: { module: 'Orders' }
        }

        return this.api.getFieldsList(opts).subscribe((response: ModuleField[]) => {
            this.fields = response;
        });
    }
    downloadPDF() {
        let filename = `${this.documentService.document}.${this.orderService.purchaseOrder.number}.pdf`;
        this.documentRenderer.download({ filename: filename });
        this.uploadToCloud();
    }

    printPDF() {
        this.documentRenderer.print();
        this.uploadToCloud();
    }

    uploadToCloud() {

        this.loading = true;
        let filename = `${this.documentService.document}.${this.orderService.purchaseOrder.number}.pdf`;
        this.loading = true;
        const blob = this.documentRenderer.blob;
        const frmData = new FormData();
        frmData.append('fileUpload[]', new File([blob], filename));
        frmData.append('poNo', this.orderService.purchaseOrder.number);
        frmData.append('orderType', 'PO');
        frmData.append('accountId', this.orderService.purchaseOrder.vendorId);
        frmData.append('selectedDocument', this.selectedDocument);
        this.api.uploadPoDocsToCloud(frmData)
            .subscribe((res: any) => {
                console.log(res);
                if(res.status == 'error'){
                    this.msg.show(res.msg, 'error');
                }else{
                    this.msg.show(`Succesfully uploaded ${filename}`, 'success');
                }
                this.loading = false;
            }, (err => {
                this.loading = false;
            }));
    }

    sendEmail(mailToType) {
        this.mailToType = mailToType;

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
                this.composeDialog();

            }, (err) => {
                this.loading = false;
                console.log(err);
            });
    }

    composeDialog() {
    
        this.loading = true;
        let filename = `${this.documentService.document}.${this.orderService.purchaseOrder.number}.pdf`;
        let blob = this.documentRenderer.blob;

        const basicMailData = {
            subject: 'Purchse Order '+this.orderService.purchaseOrder.number,
            attachments: [{ filename: filename, type: 'blob', data: blob, mimetype: 'application/pdf' }]
        };

        let mail = new Mail(basicMailData);
            let vendorId;
            let tagName;
            let templateName;
            let docTypeSentEmailStatus;
            let uniqueDecoDesigns = [];
	    tagName = 'Purchase Order Supplier';
	    templateName = 'Purchase Order Supplier : New';
	    vendorId = this.orderService.purchaseOrder.vendorId;
            docTypeSentEmailStatus = this.selectedDocument+': '+this.orderService.purchaseOrder.vendor;
            this.api.processEmailTemplateByName({ templateName: templateName, orderId: this.orderService.purchaseOrder.id, vendorId: vendorId, currentUserId: this.cuser }).subscribe((res: any) => {
                mail.subject = res.subject;
                mail.body = res.bodyHtml;
                this.api.getPoEmails(this.orderService.purchaseOrder.id, vendorId, tagName).subscribe((res: any) => {
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

                    const requests = [];
                    requests.push('test');
                    let artworkResponses = [];


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
                                                orderId: this.orderService.purchaseOrder.id,
                                                accountId: vendorId,
                                                tagName: tagName,
                                            }
                                        });
                                        arclRef.afterClosed()
                                            .subscribe(contact => {
                                                this.loading = false;
                                                this.api.getPoEmails(this.orderService.purchaseOrder.id, vendorId, tagName).subscribe((res: any) => {
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
                                                    this.openMailDialog(mail, artworkResponses, templateName, this.orderService.purchaseOrder.vendorId, docTypeSentEmailStatus);
                                                });
                                            });
                                    } else {
                                        this.openMailDialog(mail, artworkResponses, templateName, this.orderService.purchaseOrder.vendorId, docTypeSentEmailStatus);
                                    }
                                    this.confirmDialogRef = null;
                                });
                            } else {
                                this.openMailDialog(mail, artworkResponses, templateName, this.orderService.purchaseOrder.vendorId, docTypeSentEmailStatus);
                            }

                        });
                    }
                });
            });
    }

    private openMailDialog(mail: Mail, artworkResponses = [], docType = '', accountId = '', docTypeSentEmailStatus = '') {
        this.loading = false;
        let vendorId = this.orderService.purchaseOrder.vendorId ;
        let poId = this.orderService.purchaseOrder.id;
        //let user = { 'userId' : this.auth.getCurrentUser().userId , 'userName' : this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName };
        let user = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;

        this.dialogRef3 = this.dialog.open(FuseMailComposeDialogComponent, {
            panelClass: 'compose-mail-dialog',
            data: {
                action: 'Send',
                mail: mail,
                artworkResponses: artworkResponses,
                docType: docType,
                docTypeSentEmailStatus: docTypeSentEmailStatus,
                orderId: this.orderService.purchaseOrder.id,
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
                data.append('orderNo', this.orderService.purchaseOrder.number);
                data.append('poNo', this.orderService.purchaseOrder.number);
                data.append('orderId', this.orderService.purchaseOrder.id);
                data.append('accountId', this.orderService.purchaseOrder.vendorId);
                data.append('selectedDocument', this.selectedDocument);
                data.append('docTypeSentEmailStatus', docTypeSentEmailStatus);

                frmData.append('orderNo', this.orderService.purchaseOrder.number);
                frmData.append('orderId', this.orderService.purchaseOrder.id);
                frmData.append('orderType', 'PO');
                frmData.append('accountId', this.orderService.purchaseOrder.vendorId);
                frmData.append('selectedDocument', this.selectedDocument);
                frmData.append('docTypeSentEmailStatus', docTypeSentEmailStatus);


                mail.attachments.forEach((attachment: Attachment) => {
                    data.append('attachment[]', new File([attachment.data], attachment.filename));
                    frmData.append('fileUpload[]', new File([attachment.data], attachment.filename));
                });

                this.api.sendMailSMTP(data)
                    .subscribe(
                        (res: any) => { 
                            this.api.uploadPoDocsToCloud(frmData)
                                .subscribe((res: any) => {
                                    this.msg.show(`Succesfully uploaded to cloud`, 'success');
                                    this.api.updateWorkflowEventForPO(poId, vendorId, 1, 2 , user); 
                                    this.loading = false;
                                }, (err => {
                                    console.log(err);
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

    getDropdownOptions(options) {
    this.api.getDropdownOptions({dropdown: options})
	.subscribe((response: any[]) => {
	    if (!response) { return; }
	    const creditTermDropdown = find(response, { name: 'sys_credit_terms_list' });
	    this.creditTerms = creditTermDropdown.options;
	});   
    }
}

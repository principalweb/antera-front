import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { InvoiceDetailService } from '../../services/invoice-detail.service';
import { Subject, Subscription, forkJoin, of, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { takeUntil, concatMap, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';
import { ILineItem } from "../../interface/interface";
import { flatten, fx2Str, exportImageUrlForPDF, b64toBlob, fx2N } from 'app/utils/utils';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabGroup, MatTab, MatTabHeader } from '@angular/material/tabs';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';

import { IDocument } from 'app/features/documents/document.interface';
import { DocumentsService } from 'app/core/services/documents.service';
import { DocumentHelpersService } from 'app/features/documents/document-helpers.service';
import { DocumentPdfComponent } from 'app/features/documents/document-pdf/document-pdf.component';
import { InvoiceDocument } from 'app/features/documents/templates/invoice.document';
import { ArInvoiceDocument } from 'app/features/documents/templates/ar-invoice.document';
import { ModuleField } from 'app/models/module-field';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail, Attachment } from 'app/models/mail';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { MailAccountDialogComponent } from 'app/shared/account-form/account-form.component';
import { AccountsRelatedContactListComponent } from 'app/shared/accounts-related-contact-list/accounts-related-contact-list.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: "detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
})
export class DetailComponent implements OnInit {
  
  editingShipping: boolean = false;
  filteredContacts: Observable<any>;
  editShippingForm: FormGroup;
  @ViewChild('documentRenderer') documentRenderer: DocumentPdfComponent;
  documentDefinition: any;
  document: IDocument;
  filename = 'INVOICE';
  selectedDocument = 'Invoice';
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
  mailToType = 'customer';
  emailFound = false;
  cuser = '';
  dialogRef1: MatDialogRef<MailAccountDialogComponent>;
  dialogRef2: MatDialogRef<MailAccountDialogComponent>;
  dialogRef3: MatDialogRef<FuseMailComposeDialogComponent>;
  credentialsDialogRef: MatDialogRef<MailCredentialsDialogComponent>
  hideEmailButton: boolean = false;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  constructor(
    public invoiceService: InvoiceDetailService,
    private api: ApiService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private documentHelper: DocumentHelpersService,
    private documentService: DocumentsService,
    private msg: MessageService,
    private auth: AuthService    
  ) {
        this.documentDefinition = undefined;
        this.document = undefined;  
        this.documentService.document = 'Invoice';
  
  }

  ngOnInit() {
    
    this.createForm();
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

  changeEditing(mode: boolean){
    this.editingShipping = mode;
    if (!mode) this.editShippingForm.patchValue({
      name: this.invoiceService.invoice.billTo.name,
      addressOne: this.invoiceService.invoice.billTo.addressLines[0],
      addressTwo: this.invoiceService.invoice.billTo.addressLines[1],
      city: this.invoiceService.invoice.billTo.city,
      state: this.invoiceService.invoice.billTo.state,
      postalCode: this.invoiceService.invoice.billTo.postalCode,
    });
  }

  createForm(){
    this.editShippingForm = this.fb.group({
      name: [this.invoiceService.invoice.billTo.name, Validators.required],
      addressOne: [this.invoiceService.invoice.billTo.addressLines[0], Validators.required],
      addressTwo: [this.invoiceService.invoice.billTo.addressLines[1]],
      city: [this.invoiceService.invoice.billTo.city, Validators.required],
      state: [this.invoiceService.invoice.billTo.state, Validators.required],
      accountName: [this.getShippingAccountName(), Validators.required],
      postalCode: [this.invoiceService.invoice.billTo.postalCode, Validators.required],
      //country: [this.invoiceService.invoice.billTo.country, Validators.required]
    });
    this.subscribeToBillingContact();
    this.editShippingForm.valueChanges.subscribe(val => {
      console.log("val change", val);
      console.log("form", this.editShippingForm);
    })
  }

  

  subscribeToBillingContact(){
    this.filteredContacts = this.editShippingForm.controls.name.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((val) => this.api.getContactAutocomplete(val))
    );
  }

  selectContact(event){
    console.log("select contact event");
    this.editShippingForm.controls.name.patchValue(event.value);
  }

  filterVariation(lineItems: ILineItem[]): ILineItem[] {
    return lineItems.filter((lineItem: ILineItem) => !!lineItem.color && !!lineItem.size && lineItem.type === "Variation");
  }

  filterCharge(lineItems: ILineItem[]): ILineItem[] {
    return lineItems.filter((lineItem: ILineItem) => lineItem.type.toLowerCase() == 'charge');
  }

  filterDecoration(lineItems: ILineItem[]): ILineItem[] {
    return lineItems.filter((lineItem) => lineItem.type.toLocaleLowerCase() == "decoration");
  }
  

  saveShipping() {
    if (this.editShippingForm.invalid) return;
    console.log("save shipping");
    console.log(
      "first ship to line", this.invoiceService.invoice.shipTo.addressLines[0]
    );
    const data = {
      shipTo: {
        name: this.editShippingForm.controls.name.value,
        number: this.invoiceService.invoice.shipTo.number,
        addressLines: [
          //this.invoiceService.invoice.shipTo.addressLines[0],
          this.editShippingForm.controls.accountName.value,
          this.editShippingForm.controls.addressOne.value,
          this.editShippingForm.controls.addressTwo.value,
        ],
        city: this.editShippingForm.controls.city.value,
        state: this.editShippingForm.controls.state.value,
        postalCode: this.editShippingForm.controls.postalCode.value
      },
    };
    console.log("outgoing data", data);
    this.invoiceService.updateInvoice(data);
    this.editingShipping = false;
  }


  changeShipping(mode) {
    this.editingShipping = mode;
  }

  getBillingAccountName(): string {
    return this.invoiceService.invoice.billTo.addressLines[0];
  }

  mergeBillingAddress(): string {
    return !this.invoiceService.invoice.billTo.addressLines[2]
      ? this.invoiceService.invoice.billTo.addressLines[1]
      : `${this.invoiceService.invoice.billTo.addressLines[1]} ${this.invoiceService.invoice.billTo.addressLines[2]}`;
  }

  mergeBillingCityZipState(): string {
    return `${this.invoiceService.invoice.billTo.city}, ${this.invoiceService.invoice.billTo.state}, ${this.invoiceService.invoice.billTo.postalCode}`;
  }

  getShippingAccountName(): string {
    return this.invoiceService.invoice.shipTo.addressLines[0];
  }

  mergeShippingAddress(): string {
    return !this.invoiceService.invoice.shipTo.addressLines[2]
      ? this.invoiceService.invoice.shipTo.addressLines[1]
      : `${this.invoiceService.invoice.shipTo.addressLines[1]} ${this.invoiceService.invoice.shipTo.addressLines[2]}`;
  }

  mergeShippingCityZipState(): string {
    return `${this.invoiceService.invoice.shipTo.city}, ${this.invoiceService.invoice.shipTo.state}, ${this.invoiceService.invoice.shipTo.postalCode}`;
  }

  realAccount(formControl: FormControl): Promise<any> | Observable<any> {
    return forkJoin(
      this.api.getAccountAutocomplete(formControl.value),
      this.api.getVendorAutocomplete(formControl.value)
    ).pipe(
      concatMap((accounts: any[]) => {
        console.log("returned accounts", accounts);
        const returnedAccounts = flatten(accounts);
        console.log("flattened", returnedAccounts);
        if (
          returnedAccounts.findIndex(
            (account: any) => account.name === formControl.value
          ) === -1
        ) {
          console.log("no match");
          return of({ realAccount: true });
        } else {
          console.log("its here");
          const currentAccount = returnedAccounts.find(
            (account: any) => account.name === formControl.value
          );
          // this.currentShipping = {
          //   ...this.currentShipping,
          //   id: currentAccount.id,
          // };
          return of(null);
        }
      })
    );
  }

    tabClicked(tab) {
        if(tab.tab.textLabel == 'Document'){
            this.makePdf();
        }
    }  
    makePdf() {
        this.loading = true;
        let logoUrl = this.logoUrl;
        
        this.api.getArInvoiceLegacyOrderDetails(this.invoiceService.invoice.id)
            .subscribe((res: any) => {
                        const defaultConfig = {
                            logoUrl: logoUrl,
                            docOptions: this.docOptions,
                            docDefaultOptions: this.docDefaultOptions,
                            creditTerms: this.creditTerms,
                            ordersConfig: this.ordersConfig,
                            dynamicDocumentLabels: this.dynamicDocumentLabels[this.selectedDocument],
                            fields: this.fields,
                        };
                        let resolver;
                        this.orderDetails = res;
                        this.orderDetails.orderType = 'ARINVOICE';
                        this.orderDetails.finalGrandTotalPrice = this.invoiceService.invoice.invoiceAmount;
                        this.orderDetails.orderDate = this.invoiceService.invoice.created;
                        this.orderDetails.accountId = this.invoiceService.invoice.customerId;
                        //this.orderDetails.shipTo   =   this.invoiceService.invoice.shipTo;
                        this.orderDetails.shippingCompanyName = this.invoiceService.invoice.customer;
                        this.orderDetails.id  =  this.invoiceService.invoice.id;
                        this.orderDetails.orderNo  =  this.invoiceService.invoice.number;
                        this.orderDetails.alternateAccountNumber =  '';
                        this.orderDetails.attentionTo =  '';
                        this.orderDetails.bookedDate =  '';
                        this.orderDetails.csrEmail =  '';
                        this.orderDetails.csrName =  '';
                        this.orderDetails.csrPhone =  '';
                        this.orderDetails.customerPo =  '';
                        this.orderDetails.orderIdentity =  '';
                        this.orderDetails.salesPerson =  '';
                        this.orderDetails.salesPersonEmail =  '';
                        this.orderDetails.salesPersonPhone =  '';
                        this.orderDetails.shippingAccountNo =  '';
                        this.orderDetails.shipVia =  '';
                        this.orderDetails.orderType =  'ARINVOICE';
                        //this.orderDetails.finalGrandTotalPrice =  this.invoiceService.invoice.invoiceAmount;
                        this.orderDetails.dueDate =  '';
                        this.orderDetails.factoryShipDate =  '';
                        this.orderDetails.inHandDateBy =  '';
                        this.orderDetails.orderDate =  this.invoiceService.invoice.created;
                        this.orderDetails.shipDate =  '';
                        this.orderDetails.supplierShipDate =  '';        
                        //this.orderDetails.lineItems =  this.invoiceService.invoice.lineItems;
                        //this.orderDetails.productSizesSorting =  productSizesSorting;
                        this.orderDetails.creditTerms =  '';
                        this.orderDetails.vendorNotes =  '';
                        this.orderDetails.accountId  =  this.invoiceService.invoice.customerId;
                        //this.orderDetails.shipTo  =  this.invoiceService.invoice.shipTo;
                        this.orderDetails.shippingCompanyName = this.invoiceService.invoice.customer;
                        resolver = this.fetchAccountDetails(this.invoiceService.invoice.customerId);
                        this.document = new ArInvoiceDocument({
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

            }, (err) => {
                console.log(err);
                this.loading = false;
                this.msg.show("Failed to create pdf", "error");
            });
            
        /*
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
                            //fields: this.fields,
                            //dynamicDocumentLabels: this.dynamicDocumentLabels[this.selectedDocument],
                            //logoUrl: logoUrl,
                            //accountFields: this.accountFields,
                            //docLabels: this.docLabels,
                            //docOptions: this.docOptions,
                            //docSettings: this.docSettings,
                            //defaultDocOptions: this.defaultDocOptions,
                            //docDefaultOptions: this.docDefaultOptions,
                            //creditTerms: this.creditTerms,
                            //ordersConfig: this.ordersConfig,
                            //shipInfoList: this.shipInfoList,
                        };
console.log('this.invoiceService.invoice')
console.log(this.invoiceService.invoice)
                        let resolver;
                        this.orderDetails = {
                        id : this.invoiceService.invoice.id,
                        orderNo : this.invoiceService.invoice.number,
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
                        orderType: 'ARINVOICE',
                        finalGrandTotalPrice: this.invoiceService.invoice.invoiceAmount,
                        dueDate: '',
                        factoryShipDate: '',
                        inHandDateBy: '',
                        orderDate: this.invoiceService.invoice.created,
                        shipDate: '',
                        supplierShipDate: '',        
                        lineItems: this.invoiceService.invoice.lineItems,
                        productSizesSorting: productSizesSorting,
                        creditTerms: '',
                        vendorNotes: '',
                        accountId : this.invoiceService.invoice.customerId,
                        shipTo : this.invoiceService.invoice.shipTo,
                        shippingCompanyName: this.invoiceService.invoice.customer,
                        discountAmount : 0
                        };
                        resolver = this.fetchAccountDetails(this.invoiceService.invoice.customerId);
                        this.document = new ArInvoiceDocument({
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
            */

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
        this.api.getDocsAllDefaultOptions({ names: data, type: 'Invoice' })
            .subscribe((res: any) => {
                if (res) {
                    this.docDefaultOptions = res;
                }
            });
    }
    fetchAccountDetails(accountId: string) {
        return this.api.getAccountDetails(accountId);
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
        let filename = `${this.documentService.document}.${this.invoiceService.invoice.number}.pdf`;
        this.documentRenderer.download({ filename: filename });
        this.uploadToCloud();
    }

    printPDF() {
        this.documentRenderer.print();
        this.uploadToCloud();
    }

    uploadToCloud() {

        this.loading = true;
        let filename = `${this.documentService.document}.${this.invoiceService.invoice.number}.pdf`;
        this.loading = true;
        const blob = this.documentRenderer.blob;
        const frmData = new FormData();
        frmData.append('fileUpload[]', new File([blob], filename));
        frmData.append('arInvoiceNo', this.invoiceService.invoice.number);
        frmData.append('orderType', 'ARINVOICE');
        frmData.append('accountId', this.invoiceService.invoice.customerId);
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
        let filename = `${this.documentService.document}.${this.invoiceService.invoice.number}.pdf`;
        let blob = this.documentRenderer.blob;

        const basicMailData = {
            subject: 'INVOICE '+this.invoiceService.invoice.number,
            attachments: [{ filename: filename, type: 'blob', data: blob, mimetype: 'application/pdf' }]
        };

        let mail = new Mail(basicMailData);

            let tagName;
            let templateName;
            let docTypeSentEmailStatus;
            let uniqueDecoDesigns = [];
            tagName = 'Invoice';
            templateName = 'AR Invoice';
            docTypeSentEmailStatus = this.selectedDocument;
            this.api.processEmailTemplateByName({ templateName: templateName, orderId: this.invoiceService.invoice.id, currentUserId: this.cuser }).subscribe((res: any) => {
                mail.subject = res.subject;
                mail.body = res.bodyHtml;
                this.api.getTaggedEmails(this.invoiceService.invoice.id, tagName).subscribe((res: any) => {
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
                    let uniqueDecoDesigns = [];


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
    }

    private openMailDialog(mail: Mail, artworkResponses = [], docType = '', accountId = '', docTypeSentEmailStatus = '') {
        this.loading = false;
        let poId = this.invoiceService.invoice.id;
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
                orderId: this.invoiceService.invoice.id,
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
                data.append('orderNo', this.invoiceService.invoice.number);
                data.append('arInvoiceNo', this.invoiceService.invoice.number);
                data.append('orderId', this.invoiceService.invoice.id);
                data.append('accountId', this.invoiceService.invoice.customerId);
                data.append('selectedDocument', this.selectedDocument);
                data.append('docTypeSentEmailStatus', docTypeSentEmailStatus);

                frmData.append('orderNo', this.invoiceService.invoice.number);
                frmData.append('orderId', this.invoiceService.invoice.id);
                frmData.append('orderType', 'ARINVOICE');
                frmData.append('accountId', this.invoiceService.invoice.customerId);
                frmData.append('selectedDocument', this.selectedDocument);
                frmData.append('docTypeSentEmailStatus', docTypeSentEmailStatus);


                mail.attachments.forEach((attachment: Attachment) => {
                    data.append('attachment[]', new File([attachment.data], attachment.filename));
                    frmData.append('fileUpload[]', new File([attachment.data], attachment.filename));
                });

                this.api.sendMailSMTP(data)
                    .subscribe(
                        (res: any) => { 
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

    getDropdownOptions(options) {
    this.api.getDropdownOptions({dropdown: options})
        .subscribe((response: any[]) => {
            if (!response) { return; }
            const creditTermDropdown = find(response, { name: 'sys_credit_terms_list' });
            this.creditTerms = creditTermDropdown.options;
        });   
    }
}

import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FuseUtils } from '@fuse/utils';
import { fuseAnimations } from '@fuse/animations';
import { filter, find } from 'lodash';
import { OrderDetails, Contact, Account, Location, Logistic } from '../../../../models';
import { ApiService } from '../../../../core/services/api.service';
import { orderStatuses } from './order-statuses';
import { paymentStatuses } from './payment-statuses';
import { EcommerceOrderService } from '../../order.service';
import { displayName } from '../../utils';
import { MessageService } from '../../../../core/services/message.service';
import { fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { FeaturesService } from 'app/core/services/features.service';
import { map, take, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';
import { ContactFormDialogComponent } from 'app/shared/contact-form/contact-form.component';
import { ContactsService } from 'app/core/services/contacts.service';
import { ActionService } from 'app/core/services/action.service';
import { CxmlService, CxmlEnabled } from 'app/core/services/cxml.service';
import { PopupNotesDialogComponent } from 'app/shared/popup-notes-dialog/popup-notes-dialog.component';
import { ShippingFormDialogComponent } from 'app/shared/shipping-form/shipping-form.component';

@Component({
  selector: 'order-details-overview',
  templateUrl: './order-details-overview.component.html',
  styleUrls: ['./order-details-overview.component.scss'],
  animations   : fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class OrderDetailsOverviewComponent implements OnInit, OnChanges {
  @Input() order: OrderDetails = {} as OrderDetails;
  @Output() edit = new EventEmitter();
  @Output() payment = new EventEmitter();
  @Output() deletePayment = new EventEmitter();
  @Output() voidPayment = new EventEmitter();
  @Output() refundPayment = new EventEmitter();
  @Input() paymentList = [];
  @Input() fields = [];
  @ViewChild('myLocationSelect') myLocationSelect;


  pullAccountAddr = true;
  pullContactAddr = false;

  basicOrderInfoForm: FormGroup;
  accountDetailsForm: FormGroup;
  shippingDetailsForm: FormGroup;

  // statusForm: FormGroup;
  // paymentStatusForm: FormGroup;
  orderStatuses = orderStatuses;
  paymentStatuses = paymentStatuses;

  editingBasicInfo = false;
  editingAccountDetails = false;
  editingShippingDetails = false;

  //oTypes = ['Quote', 'Order', 'Merged', 'Webstore'];
  //isPromoItemOptions = ['', 'Yes', 'No'];
  oTypes = [];
  locations = [];
  commissions = [];
  identities = [];
  shipsList = [];
  vipDiscounts = [];
  statusList = [];
  filteredStatusList = [];
  shipInfoList = [];
  creditTerms = [];
  isPromoItemOptions = [];
  onLocationListChanged: Subscription;
  onStatusListchanged: Subscription;
  onCommissionListChanged: Subscription;
  onPartnerIdentityListChanged: Subscription;
  // onVIPDiscountsChanged: Subscription;
  onVIPDiscountsForAccountChanged: Subscription;
  onDropdownOptionsForOrdersChangedSubscription: Subscription;

  filteredUsers = [];
  filteredContacts = [];
  filteredAccounts = [];
  filteredCsrs = [];
  filteredCsrEmb = [];
  filteredProdManagers = [];
  filteredCsrScr = [];

  selectedLocationId = '';

  displayName = displayName;
  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;
  logisticsForm: FormGroup;
  editingLogistics: any;
  logistics: any;
  corporateIdentities: any[];
  identityEnabled: boolean = false;
  commissionEnabled: boolean;
  commissionGroups: any;
  currentContact: Contact;
  contactUserId = ""
  colors = {
    'Void': 'red-500',
    'Pending': 'orange-500',
    'Booked': 'blue-500',
    'BackOrdered': 'mat-pink-500',
    'Partial': 'purple-500',
    'Paid': 'blue-500',
    'Unpaid': 'orange-500'
  };
  formValidationDlgRef: MatDialogRef<FormValidationComponent>;
  excludeInvalidControls = ['locationId','accountId', 'contactId', 'salesPersonId', 'billingCustomerId', 'billingCompanyId', 'shippingCustomerId', 'shippingCompanyId', 'csrEmbroideryUserId', 'productionManagerId', 'commissionGroupId'];

  cxmlStatus: Subscription;
  cxmlAsnEnabled = false;

  loading = false;

  salutationTypes = [];
  shippingDialogRef: MatDialogRef<ShippingFormDialogComponent>;

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private orderService: EcommerceOrderService,
    private msg: MessageService,
    private features: FeaturesService,
    public dialog: MatDialog,
    private cxmlService: CxmlService,
    private actionService: ActionService,
    private contactsService: ContactsService,
  ) {

  }

  fetchContactEmail(contactId) {
    this.api.getContactDetails(contactId).pipe(take(1)).subscribe((contact: Contact ) => this.currentContact = contact);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.order && changes.order.currentValue) {
      this.configureLogisticsIfEnabled();
    }
  }

  ngOnInit() {
    if (this.order.contactId) this.fetchContactEmail(this.order.contactId);
    this.cxmlAsnEnabled = false;
    this.cxmlStatus = this.cxmlService.cxmlStatus
    .subscribe((response: CxmlEnabled) => {
      this.cxmlAsnEnabled = response.asn;
    });

    // Check if identity is enabled
    this.configureCorporateIdentity();
    this.configureCommissions();

    this.onLocationListChanged =
      this.orderService.onLocationListChanged
        .subscribe((list: any[]) => {
          list.forEach(location => {
            this.locations.push(location);
          });
        });

    this.onStatusListchanged =
      this.orderService.onStatusListChanged
        .subscribe((list: any[]) => {
          this.statusList = list;
          this.filteredStatusList = filter(list, { 'module': `${this.order.orderType}` });
        });

    this.onCommissionListChanged =
      this.orderService.onCommissionListChanged
        .subscribe((list: any[]) => {
          this.commissions = list;
        });

    this.onPartnerIdentityListChanged =
      this.orderService.onPartnerIdentityListChanged
        .subscribe((piList: any[]) => {
          this.identities.concat(piList);
          piList.forEach(pi => {
            this.identities.push(pi);
          });
        });

    this.onDropdownOptionsForOrdersChangedSubscription =
      this.orderService.onDropdownOptionsForOrdersChanged
        .subscribe((res: any[]) => {
          if (!res) return;
          const vipDiscountsDropdown = find(res, { name: 'vip_discounts_for_orders_list' });
          this.vipDiscounts = vipDiscountsDropdown.options;

          const shipAccTypesDropdown = find(res, { name: 'sys_shippacct_list' });
          this.shipsList = shipAccTypesDropdown && shipAccTypesDropdown.options;

          const creditTermDropdown = find(res, { name: 'sys_credit_terms_list' });
          this.creditTerms = creditTermDropdown && creditTermDropdown.options;

          const orderTypeDropdown = find(res, { name: 'order_type_list' });
          this.oTypes = orderTypeDropdown && orderTypeDropdown.options;

          const promoItemDropdown = find(res, { name: 'sys_promo_item_list' });
          this.isPromoItemOptions = promoItemDropdown && promoItemDropdown.options;


        });

    // this.onVIPDiscountsChanged =
    //     this.orderService.onVIPDiscountsChanged
    //         .subscribe((list: any[]) => {
    //           this.vipDiscounts = list;
    //         });

    // this.statusForm = this.formBuilder.group({
    //     newStatus: ['']
    // });

    // this.paymentStatusForm = this.formBuilder.group({
    //     newStatus: ['']
    // })
    
    this.createAccountForm();
    this.basicOrderInfoForm = this.createBasicOrderInfoForm();
    this.shippingDetailsForm = this.createShippingDetailsForm();

    this.configureLogisticsIfEnabled();

    this.pullAccountAddr = (this.order.addressToPull == '' || this.order.addressToPull == 'Account') ? true : false;
    this.pullContactAddr = !this.pullAccountAddr;
    this.getShippingAllInfo();

    this.contactsService.getDropdownOptionsForContact([
      'sys_contact_salutation_list',
       ]).then((res: []) => {
         //TODO test function  still works
        const contactSalutationDropdown = find(res, {name: 'sys_contact_salutation_list'});
        this.salutationTypes = contactSalutationDropdown && contactSalutationDropdown['options'];   
      
      }).catch((err) => {});
  }

  composeDialog(){
    console.log('Unimplemented method ');
  }

  private configureCorporateIdentity() {
    this.api.getAdvanceSystemConfig({ module: 'Orders', setting: 'identityEnabled' }).subscribe((res: any) => {
      if (res.value && res.value != 1) {
        return;
      }
      this.api.getIdentityList().subscribe((res: any[]) => {
        this.identityEnabled = true;
        this.corporateIdentities = res;
      });
    });
  }

  // Logistics fields will only be enabled if the feature is enabled and the order has a related logistics entry.
  private configureLogisticsIfEnabled() {
    this.features.isLogisticsEnabled().subscribe((enabled) => {
      if (enabled) {
        const params = {
          'limit': 50,
          'offset': 0,
          'order': 'orderId',
          'orient': 'desc',
          'term': {
            'orderId': this.order.id
          }
        }
        this.api.getLogisticsList(params).subscribe((res: any[]) => {
          if (res.length) {
            this.logistics = res[0];
            this.logisticsForm = this.createLogisticsForm();
          }
        });
      }
    });
  }

  ngAfterViewInit() {
    this.api.getAccountDetails(this.order.accountId)
    .subscribe((account: Account) => {       
      if (!account) {        
        this.loading = false;
        return;
      }else{        
        if(account.popupNotes != "" && (account.popupNotes_show_order_accview=="1" || account.popupNotes_show_order=="1")){
        this.dialog.open(PopupNotesDialogComponent, {
          panelClass: 'popup-notes-dialog',
          width: '60%',
          data:account         
        });
      }}
    });
  }

  ngOnDestroy() {
    this.cxmlStatus.unsubscribe();
    this.onLocationListChanged.unsubscribe();
    this.onCommissionListChanged.unsubscribe();
    this.onPartnerIdentityListChanged.unsubscribe();
    this.onDropdownOptionsForOrdersChangedSubscription.unsubscribe();
    // this.onVIPDiscountsChanged.unsubscribe();
  }

  createBasicOrderInfoForm() {
    //console.log('this.order', this.order);

    let orderDate = this.order.orderDate ? moment(this.order.orderDate).toDate() : null;
    let dueDate = this.order.dueDate ? moment(this.order.dueDate).toDate() : null;
    return this.formBuilder.group({
      // Basic Order Info
      orderDate: requiredField('orderDate',this.fields) ? [orderDate, Validators.required] : [orderDate],
      bookedDate: requiredField('bookedDate',this.fields) ? [{ value: this.order.bookedDate, disabled: true }] : [{ value: this.order.bookedDate, disabled: true }],
      invoiceDate: requiredField('invoiceDate',this.fields) ? [{ value: this.order.invoiceDate, disabled: true }] : [{ value: this.order.invoiceDate, disabled: true }],
      orderNo: requiredField('orderNo',this.fields) ? [{ value: this.order.orderNo, disabled: true }] : [{ value: this.order.orderNo, disabled: true }],
      orderIdentity: requiredField('orderIdentity',this.fields) ? [this.order.orderIdentity, Validators.required] : [this.order.orderIdentity],
      invoiceNo: requiredField('invoiceNo',this.fields) ? [this.order.invoiceNo] : [this.order.invoiceNo],
      altNumber: requiredField('altNumber',this.fields) ? [this.order.altNumber] : [this.order.altNumber],
      orderType: requiredField('orderType',this.fields) ? [FuseUtils.convertUcfirst(this.order.orderType), Validators.required] : [FuseUtils.convertUcfirst(this.order.orderType)],
      partnerIdentityId: requiredField('partnerIdentityId',this.fields) ? [this.order.partnerIdentityId, Validators.required] : [this.order.partnerIdentityId],
      commissionGroupId: requiredField('commissionGroupId',this.fields) ? [this.order.commissionGroupId] : [this.order.commissionGroupId],
      commissionGroupName: requiredField('commissionGroupId',this.fields) ? [this.order.commissionGroupName] : [this.order.commissionGroupName],
      taxRate: requiredField('taxRate',this.fields) ? [this.order.taxRate] : [this.order.taxRate],
      isPromoItem: requiredField('isPromoItem',this.fields) ? [this.order.isPromoItem] : [this.order.isPromoItem],
      dueDate: requiredField('dueDate',this.fields) ? [dueDate, Validators.required] : [dueDate],
      projectName: requiredField('projectName',this.fields) ? [this.order.projectName, Validators.required] : [this.order.projectName],
      pricingMethodId: requiredField('pricingMethods',this.fields) ? [this.order.pricingMethodId, Validators.required] : [this.order.pricingMethodId],
      pricingMethodsName: requiredField('pricingMethods',this.fields) ? [this.order.pricingMethodsName, Validators.required] : [this.order.pricingMethodsName],
    });
  }

  createAccountDetailsForm() {
    return this.formBuilder.group({
      // Order Deteails
      contactName: [this.order.contactName, Validators.required],
      contactId: [this.order.contactId, Validators.required],
      accountName: [this.order.accountName, Validators.required],
      accountId: [this.order.accountId, Validators.required],
      attentionTo: requiredField('attentionTo', this.fields) ? [this.order.attentionTo, Validators.required] : [this.order.attentionTo],
      customerPo: requiredField('customerPo', this.fields) ? [this.order.customerPo, Validators.required] : [this.order.customerPo],
      salesPerson: [this.order.salesPerson, Validators.required],
      salesPersonId: [this.order.salesPersonId, Validators.required],
      csr: requiredField('csr', this.fields) ? [this.order.csr, Validators.required] : [this.order.csr],
      csrName: requiredField('csrName', this.fields) ? [this.order.csrName, Validators.required] : [this.order.csrName],
      locationId: requiredField('locationId', this.fields) ? [this.order.locationId, Validators.required] : [this.order.locationId], // This field is not being used
      locationName: requiredField('locationId', this.fields) ? [this.order.locationName, Validators.required] : [this.order.locationName], // This field is not being used
      //partnerIdentityId: requiredField('partnerIdentityId', this.fields) ? [this.order.partnerIdentityId, Validators.required] : [this.order.partnerIdentityId],
      commissionId: requiredField('commissionId', this.fields) ? [this.order.commissionId, Validators.required] : [this.order.commissionId],
      creditTerms: requiredField('creditTerms', this.fields) ? [this.order.creditTerms, Validators.required] : [this.order.creditTerms],

      // Billing Address
      billingCompanyName: [this.order.billingCompanyName, Validators.required],
      billingCompanyId: [this.order.billingCompanyId, Validators.required],
      billingCustomerSalutation: [this.order.billingCustomerSalutation],
      billingCustomerName: requiredField('billingCustomerName', this.fields) ? [this.order.billingCustomerName, Validators.required] : [this.order.billingCustomerName],
      billingCustomerId: requiredField('billingCustomerName', this.fields) ? [this.order.billingCustomerId, Validators.required] : [this.order.billingCustomerId],
      billingStreet: requiredField('billingStreet', this.fields) ? [this.order.billingStreet, Validators.required] : [this.order.billingStreet],
      billingStreet2: requiredField('billingStreet2', this.fields) ? [this.order.billingStreet2, Validators.required] : [this.order.billingStreet2],
      billingCity: requiredField('billingCity', this.fields) ? [this.order.billingCity, Validators.required] : [this.order.billingCity],
      billingState: requiredField('billingState', this.fields) ? [this.order.billingState, Validators.required] : [this.order.billingState],
      billingPostalcode: requiredField('billingPostalcode', this.fields) ? [this.order.billingPostalcode, Validators.required] : [this.order.billingPostalcode],
      billingCountry: requiredField('billingCountry', this.fields) ? [this.order.billingCountry, Validators.required] : [this.order.billingCountry],
      billingPhone: requiredField('billingPhone', this.fields) ? [this.order.billingPhone, Validators.required] : [this.order.billingPhone],

      // Shipping Address
      shippingCompanyName: [this.order.shippingCompanyName, Validators.required],
      shippingCompanyId: [this.order.shippingCompanyId, Validators.required],
      shippingCustomerSalutation: [this.order.shippingCustomerSalutation],
      shippingCustomerName: requiredField('shippingCustomerName', this.fields) ? [this.order.shippingCustomerName, Validators.required] : [this.order.shippingCustomerName],
      shippingCustomerId: requiredField('shippingCustomerName', this.fields) ? [this.order.shippingCustomerId, Validators.required] : [this.order.shippingCustomerId],
      shippingStreet: requiredField('shippingStreet', this.fields) ? [this.order.shippingStreet, Validators.required] : [this.order.shippingStreet],
      shippingStreet2: requiredField('shippingStreet2', this.fields) ? [this.order.shippingStreet2, Validators.required] : [this.order.shippingStreet2],
      shippingCity: requiredField('shippingCity', this.fields) ? [this.order.shippingCity, Validators.required] : [this.order.shippingCity],
      shippingState: requiredField('shippingState', this.fields) ? [this.order.shippingState, Validators.required] : [this.order.shippingState],
      shipPostalcode: requiredField('shipPostalcode', this.fields) ? [this.order.shipPostalcode, Validators.required] : [this.order.shipPostalcode],
      shipCountry: requiredField('shipCountry', this.fields) ? [this.order.shipCountry, Validators.required] : [this.order.shipCountry],
      shippingPhone: requiredField('shippingPhone', this.fields) ? [this.order.shippingPhone, Validators.required] : [this.order.shippingPhone],
      csrEmbroideryUserId: requiredField('csrEmbroideryUserName', this.fields) ? [this.order.csrEmbroideryUserId, Validators.required] : [this.order.csrEmbroideryUserId],
      csrEmbroideryUserName: requiredField('csrEmbroideryUserName', this.fields) ? [this.order.csrEmbroideryUserName, Validators.required] : [this.order.csrEmbroideryUserName],
      csrScreenprintUserId: requiredField('csrScreenprintUserName', this.fields) ? [this.order.csrScreenprintUserId, Validators.required] : [this.order.csrScreenprintUserId],
      csrScreenprintUserName: requiredField('csrScreenprintUserName', this.fields) ? [this.order.csrScreenprintUserName, Validators.required] : [this.order.csrScreenprintUserName],
      productionManagerId: requiredField('productionManagerName', this.fields) ? [this.order.productionManagerId, Validators.required] : [this.order.productionManagerId],
      productionManagerName: requiredField('productionManagerName', this.fields) ? [this.order.productionManagerName, Validators.required] : [this.order.productionManagerName],

    });
  }

  createShippingDetailsForm() {
    // Use Date to cast dates without time to local timezone
    if (this.order.shipDate === "0000-00-00") {
      this.order.shipDate = null;
    }
    let shipDate = this.order.shipDate ? moment(this.order.shipDate).toDate() : null;
    let inHandDateBy = this.order.inHandDateBy ? moment(this.order.inHandDateBy).toDate() : null;
    let supplierShipDate = this.order.supplierShipDate ? moment(this.order.supplierShipDate).toDate() : null;
    let factoryShipDate = this.order.factoryShipDate ? moment(this.order.factoryShipDate).toDate() : null;
    let supplierInHandsDate = this.order.supplierInHandsDate ? moment(this.order.supplierInHandsDate).toDate() : null;
    let expectedPrintDate = this.order.expectedPrintDate ? moment(this.order.expectedPrintDate).toDate() : null;
    let proofDueDate = this.order.proofDueDate ? moment(this.order.proofDueDate).toDate() : null;

    return this.formBuilder.group({
      // Shipping Details
      shipVia: requiredField('shipVia', this.fields) ? [this.order.shipVia, Validators.required] : [this.order.shipVia],
      shipDate: requiredField('shipDate', this.fields) ? [shipDate, Validators.required] : [shipDate],
      shippingAccountNo: requiredField('shippingAccountNo', this.fields) ? [this.order.shippingAccountNo, Validators.required] : [this.order.shippingAccountNo],
      inHandDateBy: requiredField('inHandDateBy', this.fields) ? [inHandDateBy, Validators.required] : [inHandDateBy],
      supplierShipDate: requiredField('supplierShipDate', this.fields) ? [supplierShipDate, Validators.required] : [supplierShipDate],
      factoryShipDate: requiredField('factoryShipDate', this.fields) ? [factoryShipDate, Validators.required] : [factoryShipDate],
      supplierInHandsDate: requiredField('supplierInHandsDate', this.fields) ? [supplierInHandsDate, Validators.required] : [supplierInHandsDate],
      expectedPrintDate: requiredField('expectedPrintDate', this.fields) ? [expectedPrintDate, Validators.required] : [expectedPrintDate],
      vipDiscountsRate: requiredField('vipDiscountsRate', this.fields) ? [this.order.vipDiscountsRate, Validators.required] : [this.order.vipDiscountsRate],
      isRushOrder: requiredField('isRushOrder', this.fields) ? [this.order.isRushOrder === 'Yes' ? true : false, Validators.required] : [this.order.isRushOrder === 'Yes' ? true : false],
      billComplete: requiredField('billComplete', this.fields) ? [this.order.billComplete === '1' ? true : false, Validators.required] : [this.order.billComplete === '1' ? true : false],
      notePackagingSlip: requiredField('notePackagingSlip', this.fields) ? [this.order.notePackagingSlip, Validators.required] : [this.order.notePackagingSlip],
      proofDueDate: requiredField('proofDueDate',this.fields) ? [proofDueDate, Validators.required] : [proofDueDate],
    });
  }

  createLogisticsForm() {
    return this.formBuilder.group({
      qualityExpectationRetail: [this.logistics.qualityExpectationRetail],
      qualityExpectationPromotional: [this.logistics.qualityExpectationPromotional],
      logoRelease: [this.logistics.logoRelease],
      cartonMarkings: [this.logistics.cartonMarkings],
      countryOfOriginPlacement: [this.logistics.countryOfOriginPlacement],
    });
  }
  editLogistics() {
    this.editingLogistics = !this.editingLogistics;
    if (this.editingLogistics) {
      this.logisticsForm = null;
      this.logisticsForm = this.createLogisticsForm();
    }
  }

  editBasicOrderInfo() {
    this.editingBasicInfo = !this.editingBasicInfo;
    if (this.editingBasicInfo) {

      this.basicOrderInfoForm = null;
      this.basicOrderInfoForm = this.createBasicOrderInfoForm();
    }
  }

  clearCsr() {
    this.accountDetailsForm.patchValue({
      csrName: null,
      csr: null,
    });
  }

  clearCsrEmb() {
    this.accountDetailsForm.patchValue({
      csrEmbroideryUserId: null,
      csrEmbroideryUserName: null,
    });
  }

  clearProdManagers() {
    this.accountDetailsForm.patchValue({
      productionManagerId: null,
      productionManagerName: null,
    });
  }


  clearCsrScr() {
    this.accountDetailsForm.patchValue({
      csrScreenprintUserId: null,
      csrScreenprintUserName: null,
    });
  }

  createAccountForm() {
    if (this.accountDetailsForm)
      this.accountDetailsForm = null;
    this.accountDetailsForm = this.createAccountDetailsForm();

    this.accountDetailsForm.get('salesPerson').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
      this.orderService.autocompleteUsers(keyword).subscribe((res: any[]) => {
        this.filteredUsers = res;
      });
    });

    this.accountDetailsForm.get('csrName').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    )
      .subscribe(keyword => {
        if (keyword && keyword.length === 0) {
          this.clearCsr();
        }
        if (keyword && keyword.length > 3) {
          this.orderService.autocompleteUsers(keyword).subscribe((res: any[]) => {
            this.filteredCsrs = res;
          });
        }
      });

    this.accountDetailsForm.get('csrEmbroideryUserName').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    )
      .subscribe(keyword => {
        if (keyword && keyword.length === 0) {
          this.clearCsrEmb();
        }
        if (keyword && keyword.length > 3) {
          this.orderService.autocompleteUsers(keyword).subscribe((res: any[]) => {
            this.filteredCsrEmb = res;
          });
        }
      });

    this.accountDetailsForm.get('productionManagerName').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    )
      .subscribe(keyword => {
        if (keyword && keyword.length === 0) {
          this.clearProdManagers();
        }
        if (keyword && keyword.length > 3) {
          this.orderService.autocompleteUsers(keyword).subscribe((res: any[]) => {
            this.filteredProdManagers = res;
          });
        }
      });


    this.accountDetailsForm.get('csrScreenprintUserName').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    )
      .subscribe(keyword => {
        if (keyword && keyword.length === 0) {
          this.clearCsrScr();
        }
        if (keyword && keyword.length > 3) {
          this.orderService.autocompleteUsers(keyword).subscribe((res: any[]) => {
            this.filteredCsrScr = res;
          });
        }
      });


    this.accountDetailsForm.get('contactName').valueChanges.pipe(      
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
      this.orderService.autocompleteContacts(keyword).subscribe((res: any[]) => {
        this.filteredContacts = res;
      });
    });

    this.accountDetailsForm.get('accountName').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
      this.orderService.autocompleteAccounts(keyword).subscribe((res: any[]) => {
        this.filteredAccounts = res;
      });
    });
  }

  editAccountDetails(save = false) {
    this.editingAccountDetails = !this.editingAccountDetails;
    if (!this.editingAccountDetails && !save) {
      this.accountDetailsForm.patchValue({
        shippingStreet: this.order.shippingStreet,
        shippingStreet2: this.order.shippingStreet2,
        shippingCity: this.order.shippingCity,
        shippingState: this.order.shippingState,
        shipPostalcode: this.order.shipPostalcode,
        shipCountry: this.order.shipCountry,
      })
    }
    // This script was wrote by Olena for resetting form when close
    if (this.editingAccountDetails)
      this.createAccountForm();
  }

  editShippingDetails() {
    this.editingShippingDetails = !this.editingShippingDetails;
    if (this.editingShippingDetails) {
      this.shippingDetailsForm = null;
      this.shippingDetailsForm = this.createShippingDetailsForm();
    }
  }

  selectAddress(ev) {
    this.accountDetailsForm.patchValue({
      locationId: null
    });
    this.loading = true;
    if (ev.value === 'Contact') {
      this.pullContactAddr = true;
      this.pullAccountAddr = false;
      this.api.getContactDetails(this.order.contactId)
        .subscribe((contact: Contact) => {
          if (!contact) {
            this.loading = false;
            return;
          }
          this.loading = false;
          this.accountDetailsForm.patchValue({

            shippingCompanyId: this.order.accountId,
            shippingCompanyName: this.order.accountName,
            shippingCustomerId: this.order.contactId,
            shippingCustomerName: this.order.contactName,
            shippingStreet: contact.shipAddress1,
            shippingStreet2: contact.shipAddress2,
            shippingCity: contact.shipCity,
            shippingState: contact.shipState,
            shipPostalcode: contact.shipPostalcode,
            shipCountry: contact.shipCountry,
            shippingPhone: contact.phone,

            billingCompanyId: this.order.accountId,
            billingCompanyName: this.order.accountName,
            billingCustomerId: this.order.contactId,
            billingCustomerName: this.order.contactName,
            billingStreet: contact.billAddress1,
            billingStreet2: contact.billAddress2,
            billingCity: contact.billCity,
            billingState: contact.billState,
            billingPostalcode: contact.billPostalcode,
            billingCountry: contact.billCountry,
            billingPhone: contact.phone,
          });
          
        });
    } else {
      this.pullContactAddr = false;
      this.pullAccountAddr = true;
      this.api.getAccountDetails(this.order.accountId)
        .subscribe((account: Account) => {
          if (!account) {
            this.loading = false;
            return;
          }
          this.loading = false;
          this.accountDetailsForm.patchValue({
            shippingCompanyId: this.order.accountId,
            shippingCompanyName: this.order.accountName,
            shippingCustomerId: this.order.contactId,
            shippingCustomerName: this.order.contactName,
            shippingStreet: account.shipAddress1,
            shippingStreet2: account.shipAddress2,
            shippingCity: account.shipCity,
            shippingState: account.shipState,
            shipPostalcode: account.shipPostalcode,
            shipCountry: account.shipCountry,
            shippingPhone: account.phone,

            billingCompanyId: this.order.accountId,
            billingCompanyName: this.order.accountName,
            billingCustomerId: this.order.contactId,
            billingCustomerName: this.order.contactName,
            billingStreet: account.billAddress1,
            billingStreet2: account.billAddress2,
            billingCity: account.billCity,
            billingState: account.billState,
            billingPostalcode: account.billPostalcode,
            billingCountry: account.billCountry,
            billingPhone: account.phone,
          });
        });
    }
  }

  saveOrder(type) {
    
    switch (type) {
      case 'BasicOrderInfo': {
        if (this.basicOrderInfoForm.invalid) {
          this.showValidation('new', this.basicOrderInfoForm);
          //this.msg.show('Please complete the form first', 'error');
          return;
        }
        this.editBasicOrderInfo();


        let data = {
          ...this.basicOrderInfoForm.getRawValue(),
          orderDate: moment(this.basicOrderInfoForm.get('orderDate').value).format('YYYY-MM-DD'),
          dueDate: moment(this.basicOrderInfoForm.get('dueDate').value).format('YYYY-MM-DD')
        };

        // Set commission group name if id is set
        // Required because the response gives back the request payload
        if (data.commissionGroupId) {
          const group = this.commissionGroups.find((group) => group.id === data.commissionGroupId);
          data.commissionGroupName = group.name;
        }

        // Set commission group name if id is set
        if (data.partnerIdentityId) {
          const group = this.corporateIdentities.find((identity) => identity.id === data.partnerIdentityId);
          data.corporateIdentity = { ...data.corporateIdentity, name: group.name };
        }

        this.edit.emit({ type: 'Edit', data: data });
        break;
      }
      case 'AccountDetails': {
        if (this.accountDetailsForm.invalid) {
          this.showValidation('new', this.accountDetailsForm);
          //this.msg.show('Please complete the form first', 'error');
          return;
        }
        const salesPerson = this.accountDetailsForm.get('salesPerson').value.name ? this.accountDetailsForm.get('salesPerson').value.name : this.accountDetailsForm.get('salesPerson').value;
        const accountName = this.accountDetailsForm.get('accountName').value.name ? this.accountDetailsForm.get('accountName').value.name : this.accountDetailsForm.get('accountName').value;
        const contactName = this.accountDetailsForm.get('contactName').value.name ? this.accountDetailsForm.get('contactName').value.name : this.accountDetailsForm.get('contactName').value;
        const csrName = this.accountDetailsForm.get('csrName').value.name ? this.accountDetailsForm.get('csrName').value.name : this.accountDetailsForm.get('csrName').value;

        this.editAccountDetails(true);
        if (this.selectedLocationId) {
          this.edit.emit({
            type: 'Edit',
            data: {
              ...this.accountDetailsForm.getRawValue(),
              salesPerson: salesPerson,
              accountName: accountName,
              contactName: contactName,
              csrName: csrName
            }
          });

          return;
        };

        this.edit.emit({
          type: 'Edit',
          data: {
            ...this.accountDetailsForm.getRawValue(),
            salesPerson: salesPerson,
            accountName: accountName,
            contactName: contactName,
            csrName: csrName,
            addressToPull: this.pullAccountAddr == true ? 'Account' : 'Contact'
          }
        });
        if(this.contactUserId !== "") {
          this.fetchContactEmail(this.contactUserId)
        } 
        
        break;
      }
      case 'Logistics': {
        const data = this.logisticsForm.value;
        const logistic = new Logistic({ ...this.logistics, ...data });
        this.api.updateLogistic(logistic.toObject()).subscribe((res) => {
          this.configureLogisticsIfEnabled();
        });
        break;
      }
      case 'ShippingDetails': {
        if (this.shippingDetailsForm.get('shipDate').value === '0000-00-00' || this.shippingDetailsForm.get('shipDate').value === 'Invalid date') {
          this.shippingDetailsForm.get('shipDate').setValue(null);
        }
        if (this.shippingDetailsForm.invalid) {
          this.showValidation('new', this.shippingDetailsForm);
          //this.msg.show('Please complete the form first', 'error');
          return;
        }

        if(visibleField('supplierShipDate', this.fields) && visibleField('supplierInHandsDate', this.fields) && moment(this.shippingDetailsForm.get('supplierShipDate').value).isValid() && moment(this.shippingDetailsForm.get('supplierInHandsDate').value).isValid() && !moment(this.shippingDetailsForm.get('supplierInHandsDate').value).isSameOrAfter(this.shippingDetailsForm.get('supplierShipDate').value)){
            this.msg.show(fieldLabel('supplierShipDate', this.fields)+' should be equal to or before '+fieldLabel('supplierInHandsDate', this.fields), 'error');
            return;
        }

        if(visibleField('supplierShipDate', this.fields) && visibleField('shipDate', this.fields) && moment(this.shippingDetailsForm.get('supplierShipDate').value).isValid() && moment(this.shippingDetailsForm.get('shipDate').value).isValid() && !moment(this.shippingDetailsForm.get('shipDate').value).isSameOrAfter(this.shippingDetailsForm.get('supplierShipDate').value)){
            this.msg.show(fieldLabel('supplierShipDate', this.fields)+' should be equal to or before '+fieldLabel('shipDate', this.fields), 'error');
            return;
        }

        if(visibleField('supplierShipDate', this.fields) && visibleField('inHandDateBy', this.fields) && moment(this.shippingDetailsForm.get('supplierShipDate').value).isValid() && moment(this.shippingDetailsForm.get('inHandDateBy').value).isValid() && !moment(this.shippingDetailsForm.get('inHandDateBy').value).isSameOrAfter(this.shippingDetailsForm.get('supplierShipDate').value)){
            this.msg.show(fieldLabel('supplierShipDate', this.fields)+' should be equal to or before '+fieldLabel('inHandDateBy', this.fields), 'error');
            return;
        }


        if(visibleField('supplierInHandsDate', this.fields) && visibleField('shipDate', this.fields) && moment(this.shippingDetailsForm.get('supplierInHandsDate').value).isValid() && moment(this.shippingDetailsForm.get('shipDate').value).isValid() && !moment(this.shippingDetailsForm.get('shipDate').value).isSameOrAfter(this.shippingDetailsForm.get('supplierInHandsDate').value)){
            this.msg.show(fieldLabel('supplierInHandsDate', this.fields)+' should be equal to or before '+fieldLabel('shipDate', this.fields), 'error');
            return;
        }

        if(visibleField('supplierInHandsDate', this.fields) && visibleField('inHandDateBy', this.fields) && moment(this.shippingDetailsForm.get('supplierInHandsDate').value).isValid() && moment(this.shippingDetailsForm.get('inHandDateBy').value).isValid() && !moment(this.shippingDetailsForm.get('inHandDateBy').value).isSameOrAfter(this.shippingDetailsForm.get('supplierInHandsDate').value)){
            this.msg.show(fieldLabel('supplierInHandsDate', this.fields)+' should be equal to or before '+fieldLabel('inHandDateBy', this.fields), 'error');
            return;
        }

        if(visibleField('shipDate', this.fields) && visibleField('inHandDateBy', this.fields) && moment(this.shippingDetailsForm.get('shipDate').value).isValid() && moment(this.shippingDetailsForm.get('inHandDateBy').value).isValid() && !moment(this.shippingDetailsForm.get('inHandDateBy').value).isSameOrAfter(this.shippingDetailsForm.get('shipDate').value)){
            this.msg.show(fieldLabel('shipDate', this.fields)+' should be equal to or before '+fieldLabel('inHandDateBy', this.fields), 'error');
            return;
        }
        
        if(visibleField('proofDueDate', this.fields) && visibleField('shipDate', this.fields) && moment(this.shippingDetailsForm.get('proofDueDate').value).isValid() && moment(this.shippingDetailsForm.get('shipDate').value).isValid() && !moment(this.shippingDetailsForm.get('shipDate').value).isSameOrAfter(this.shippingDetailsForm.get('proofDueDate').value)){
            this.msg.show(fieldLabel('proofDueDate', this.fields)+' should be equal to or before '+fieldLabel('shipDate', this.fields), 'error');
            return;
        }
        
        if(visibleField('proofDueDate', this.fields) && visibleField('inHandDateBy', this.fields) && moment(this.shippingDetailsForm.get('proofDueDate').value).isValid() && moment(this.shippingDetailsForm.get('inHandDateBy').value).isValid() && !moment(this.shippingDetailsForm.get('inHandDateBy').value).isSameOrAfter(this.shippingDetailsForm.get('proofDueDate').value)){
            this.msg.show(fieldLabel('proofDueDate', this.fields)+' should be equal to or before '+fieldLabel('inHandDateBy', this.fields), 'error');
            return;
        }
        
        this.editShippingDetails();
        this.edit.emit({
          type: 'Edit',
          data: {
            ...this.shippingDetailsForm.getRawValue(),
            shipDate: this.shippingDetailsForm.get('shipDate').value ? moment(this.shippingDetailsForm.get('shipDate').value).format('YYYY-MM-DD') : null,
            inHandDateBy: this.shippingDetailsForm.get('inHandDateBy').value ? moment(this.shippingDetailsForm.get('inHandDateBy').value).format('YYYY-MM-DD') : null,
            expectedPrintDate: this.shippingDetailsForm.get('expectedPrintDate').value ? moment(this.shippingDetailsForm.get('expectedPrintDate').value).format('YYYY-MM-DD') : null,
            proofDueDate: this.shippingDetailsForm.get('proofDueDate').value ? moment(this.shippingDetailsForm.get('proofDueDate').value).format('YYYY-MM-DD') : null,
            supplierShipDate: this.shippingDetailsForm.get('supplierShipDate').value ? moment(this.shippingDetailsForm.get('supplierShipDate').value).format('YYYY-MM-DD') : null,
            factoryShipDate: this.shippingDetailsForm.get('factoryShipDate').value ? moment(this.shippingDetailsForm.get('factoryShipDate').value).format('YYYY-MM-DD') : null,
            supplierInHandsDate: this.shippingDetailsForm.get('supplierInHandsDate').value ? moment(this.shippingDetailsForm.get('supplierInHandsDate').value).format('YYYY-MM-DD') : null,
            billComplete: (this.shippingDetailsForm.get('billComplete').value === true ? '1' : '0'),
            isRushOrder: (this.shippingDetailsForm.get('isRushOrder').value === true ? 'Yes' : 'No')
          }
        });
        break;
      }
    }
  }

  getLocationName() {
    const locationId = this.accountDetailsForm.get('locationId').value;
    if (locationId) {
      const location = this.locations.find((_location) => _location.id === locationId);
      const value = location && location.locationName;
      return value ? value : '';
    }
    return '';
  }

  selectLocation(ev) {
    const location = this.locations.find((_location) => _location.id === ev.value);

    this.pullContactAddr = false;
    this.pullAccountAddr = true;

    if (location) {
      this.loading = true;
      this.accountDetailsForm.patchValue({
        shippingCompanyId: this.order.accountId,
        shippingCompanyName: location.locationName,
        shippingCustomerId: location.deliveryContactId,
        shippingCustomerName: location.deliveryContact,
        shippingStreet: location.shippingAddressStreet,
        shippingStreet2: location.shippingAddressStreet2,
        shippingCity: location.shippingAddressCity,
        shippingState: location.shippingAddressState,
        shipPostalcode: location.shippingAddressPostalcode,
        shipCountry: location.shippingAddressCountry,
        shippingPhone: location.phone,

        billingCompanyId: this.order.accountId,
        billingCompanyName: location.locationName,
        billingCustomerId: location.deliveryContactId,
        billingCustomerName: location.deliveryContact,
        billingStreet: location.billingAddressStreet,
        billingStreet2: location.billingAddressStreet2,
        billingCity: location.billingAddressCity,
        billingState: location.billingAddressState,
        billingPostalcode: location.billingAddressPostalcode,
        billingCountry: location.billingAddressCountry,
        billingPhone: location.phone,
      });
      this.loading = false;
    }
  }

  receivePayment() {
    this.payment.emit();
  }

  addTracking() {
     this.actionService.getShippingInfo({orderId: this.order.id,  vendorId: ''}).subscribe((shipping: any) => {
      
      if(typeof shipping !== 'undefined' && shipping.length > 0) {
        this.shippingDialogRef = this.dialog.open(ShippingFormDialogComponent, {
          panelClass: 'shipping-form-dialog',
          data      : {
             action: 'edit',
             orderId: this.order.id,
             vendorId:'',
             shipping: shipping[0]
          }
        });
        this.shippingDialogRef.afterClosed().subscribe(data => {
          this.getShippingAllInfo()
        })
      } else {
        this.shippingDialogRef = this.dialog.open(ShippingFormDialogComponent, {
          panelClass: 'shipping-form-dialog',
          data      : {
              action: 'new',
              orderId: this.order.id,
              vendorId: '',
              // inhandsDate: this.row.inhandsDate,
              // shipDate: this.row.shipDate
          }
        });
        this.shippingDialogRef.afterClosed().subscribe(data => {
          this.getShippingAllInfo()
        })
      }
    });
  }

  editShippingInfo(data) {
    
    this.actionService.getShippingInfo({orderId: this.order.id,  vendorId: '',  id: data.id}).subscribe((shipping: any) => {
      if(typeof shipping !== 'undefined' && shipping.length > 0) {
        this.shippingDialogRef = this.dialog.open(ShippingFormDialogComponent, {
          panelClass: 'shipping-form-dialog',
          data      : {
             action: 'edit',
             orderId: this.order.id,
             vendorId:'',
             shipping: shipping[0]
          }
        });
        this.shippingDialogRef.afterClosed().subscribe(data => {
          this.getShippingAllInfo()
        })
      } else {
        this.msg.show("Shipping info not found","error");
      }
    })
  }

  deleteShippingInfo(data) {
    this.api.deleteShippingInfo({orderId: this.order.id,  vendorId: '',  id: data.id}).subscribe((response: any) => {
      if(response) {
        this.msg.show("Shipping info deleted successfully", 'success');
        this.getShippingAllInfo();
      }
    })
  }

  selectCommissionGroup(ev) {
    const cg = ev.option.value;
    this.basicOrderInfoForm.get('commissionGroupId').setValue(cg.id);
  }
  
  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.accountDetailsForm.get('salesPersonId').setValue(assignee.id);
  }

  selectCsr(ev) {
    const assignee = ev.option.value;
    this.accountDetailsForm.get('csr').setValue(assignee.id);
  }

  selectCsrEmbroidery(ev) {
    const assignee = ev.option.value;
    this.accountDetailsForm.get('csrEmbroideryUserId').setValue(assignee.id);
  }

  selectProdManagers(ev) {
    const assignee = ev.option.value;
    this.accountDetailsForm.get('productionManagerId').setValue(assignee.id);
  }


  selectCsrScreenprint(ev) {
    const assignee = ev.option.value;
    this.accountDetailsForm.get('csrScreenprintUserId').setValue(assignee.id);
  }

  selectContact(ev) {
    const assignee = ev.option.value;
    this.accountDetailsForm.get('contactId').setValue(assignee.id);
    this.accountDetailsForm.get('shippingCustomerId').setValue(assignee.id);
    this.accountDetailsForm.get('shippingCustomerName').setValue(assignee.name);
    this.accountDetailsForm.get('billingCustomerId').setValue(assignee.id);
    this.accountDetailsForm.get('billingCustomerName').setValue(assignee.name);
    this.loading = true;
    if(assignee.id === 'add') {
      const dlgRef = this.dialog.open(ContactFormDialogComponent, {
        panelClass: 'antera-details-dialog',
        data: {
          action: 'new',
          service: this.contactsService
        }
      });

      dlgRef.afterClosed().subscribe(data => {
        if(data) {
          if(this.accountDetailsForm.value.accountId) {
            this.loading = true;
            this.api.linkAccountContact(this.accountDetailsForm.value.accountId, data.contact.extra.id)
            .subscribe(() => {
              this.loading = false;
              this.accountDetailsForm.get('contactId').setValue(data.contact.extra.id);
              this.accountDetailsForm.get('contactName').setValue(data.contact.extra.firstName + ' ' + data.contact.extra.lastName);
            }, (err) => {
              this.loading = false;
              this.accountDetailsForm.get('contactId').setValue('');
                this.accountDetailsForm.get('contactName').setValue('');
                this.msg.show('Linking account & contact failed','error');
            })
          } else {
            this.accountDetailsForm.get('contactId').setValue(data.contact.extra.id);
            this.accountDetailsForm.get('contactName').setValue(data.contact.extra.firstName + ' ' + data.contact.extra.lastName);
            if (data.contact.extra.commissionGroupId) {
              this.accountDetailsForm.get('commissionGroupId').setValue(data.contact.extra.commissionGroupId);
              this.accountDetailsForm.get('commissionGroupName').setValue(data.contact.extra.commissionGroupName);
            }
          }
        } else {
          this.accountDetailsForm.get('contactId').setValue('');
          this.accountDetailsForm.get('contactName').setValue('');
          this.msg.show('Creating contact failed', 'error');
        }
      });
    }
    this.api.getContactDetails(assignee.id)
      .subscribe((contact: Contact) => {
        
        if (!contact) {
          this.loading = false;
          return;
        }
        this.contactUserId = contact.id
        this.loading = false;
        if (this.pullContactAddr == true) {
          this.accountDetailsForm.patchValue({
            shippingCompanyId: this.order.accountId,
            shippingCompanyName: this.order.accountName,
            shippingCustomerId: assignee.id,
            shippingCustomerName: assignee.name,
            shippingStreet: contact.shipAddress1,
            shippingStreet2: contact.shipAddress2,
            shippingCity: contact.shipCity,
            shippingState: contact.shipState,
            shipPostalcode: contact.shipPostalcode,
            shipCountry: contact.shipCountry,
            shippingPhone: contact.phone,
            
            billingCompanyId: this.order.accountId,
            billingCompanyName: this.order.accountName,
            billingCustomerId: assignee.id,
            billingCustomerName: assignee.name,
            billingStreet: contact.billAddress1,
            billingStreet2: contact.billAddress2,
            billingCity: contact.billCity,
            billingState: contact.billState,
            billingPostalcode: contact.billPostalcode,
            billingCountry: contact.billCountry,
            billingPhone: contact.phone,
          });
        }
      });
  }

  selectAccount(ev) {
    const assignee = ev.option.value;
    this.accountDetailsForm.get('accountId').setValue(assignee.id);
    this.accountDetailsForm.get('billingCompanyId').setValue(assignee.id);
    this.accountDetailsForm.get('billingCompanyName').setValue(assignee.name);
    this.accountDetailsForm.get('shippingCompanyId').setValue(assignee.id);
    this.accountDetailsForm.get('shippingCompanyName').setValue(assignee.name);
    this.loading = true;
    let contactId = this.accountDetailsForm.get('contactId').value.name ? this.accountDetailsForm.get('contactId').value.name : this.accountDetailsForm.get('contactId').value;
    let contactName = this.accountDetailsForm.get('contactName').value.name ? this.accountDetailsForm.get('contactName').value.name : this.accountDetailsForm.get('contactName').value;
    this.api.getAccountDetails(assignee.id)
      .subscribe((account: Account) => {
        if (!account) {
          this.loading = false;
          return;
        }
        this.loading = false;
        this.accountDetailsForm.patchValue({ creditTerms: account.creditTerms });
        if (this.pullAccountAddr == true) {
          this.accountDetailsForm.patchValue({
            shippingCompanyId: (this.order.accountId) ? this.order.accountId : account.id,
            shippingCompanyName: (this.order.accountName) ? this.order.accountName : account.accountName,
            shippingCustomerId: (this.order.contactId) ? this.order.contactId : contactId,
            shippingCustomerName: (this.order.contactName) ? this.order.contactName : contactName,
            shippingStreet: account.shipAddress1,
            shippingStreet2: account.shipAddress2,
            shippingCity: account.shipCity,
            shippingState: account.shipState,
            shipPostalcode: account.shipPostalcode,
            shipCountry: account.shipCountry,
            shippingPhone: account.phone,

            billingCompanyId: (this.order.accountId) ? this.order.accountId : account.id,
            billingCompanyName: (this.order.accountName) ? this.order.accountName : account.accountName,
            billingCustomerId: (this.order.contactId) ? this.order.contactId : contactId,
            billingCustomerName: (this.order.contactName) ? this.order.contactName : contactName,
            billingStreet: account.billAddress1,
            billingStreet2: account.billAddress2,
            billingCity: account.billCity,
            billingState: account.billState,
            billingPostalcode: account.billPostalcode,
            billingCountry: account.billCountry,
            billingPhone: account.phone,
          });
        }
      });
  }

  locationTrigger() {

  }

  changeOrderStatus(ev) {
    const selectedStatus = find(this.filteredStatusList, { 'name': `${ev}` });
    this.orderService.updateOrderStatus({
      id: this.order.id,
      statusId: selectedStatus.id
    }).then((res) => {
      this.msg.show('Have updated order status successfully.', 'success');
      if (res && res.status == 'success') {
        this.edit.emit({
          type: 'Status',
          data: {
            orderStatus: selectedStatus.name
          }
        });
      }

    }).catch((err) => {
      console.log(err);
    });
  }

  getBalancePerEachPayment(index) {
    let paymentAmount = 0;
    for (let i = 0; i < index + 1; i++) {
      const payment = this.paymentList[i];
      paymentAmount += parseFloat(payment.amount);
    }
    if(this.order.exchageRateForCustomer) {
      return (parseFloat(this.order.finalGrandTotalPrice) * parseFloat(this.order.exchageRateForCustomer)) - paymentAmount;
    }
    return parseFloat(this.order.finalGrandTotalPrice) - paymentAmount;
  }

  convertQuoteToOrder() {
    this.edit.emit({
      type: 'Convert'
    })
  }

  displayCreditTerm(value) {
    const creditTerm = find(this.creditTerms, { value: value });
    if (!creditTerm) return '';
    return creditTerm.label;
  }

  getShippingAllInfo() {
    this.api.getShippingAllInfo({ orderId: this.order.id })
      .subscribe((shipping: any) => {
        if (shipping) {
          this.shipInfoList = shipping;
          return this.shipInfoList;
        }
      });
  }

  emitDeletePayment(payment) {
    this.deletePayment.emit(payment);
  }


  emitVoidPayment(payment) {
    this.voidPayment.emit(payment);
  }

  emitRefundPayment(payment) {
    this.refundPayment.emit(payment);
  }

  selectBillingSalutation(ev) {
    const salutations = ev.option.value;
    this.accountDetailsForm.get('billingCustomerSalutation').setValue(salutations.value);
  }

  selectShippingSalutation(ev) {
    const salutations = ev.option.value;
    this.accountDetailsForm.get('shippingCustomerSalutation').setValue(salutations.value);
  }


  private configureCommissions() {
    const params = {
      offset: 0,
      limit: 50,
      order: "name",
      orient: "asc",
      term: {
        name: '',
        description: '',
        modifiedByName: '',
      }
    };
    this.api.getCommissionGroupsList(params).subscribe((res: any[]) => {
      this.commissionGroups = res;
      if (this.commissionGroups.length > 0) {
        this.commissionEnabled = true;
      }
    });
  }

  showValidation(action, form:FormGroup){
      this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
          panelClass: 'app-form-validation',
          data: {
            action: action,
            moduleForm: form,
            fields: this.fields,
            excludeInvalidControls: this.excludeInvalidControls
          }
      });

      this.formValidationDlgRef.afterClosed().subscribe(data => {
      if(data) {
          data.invalidControls.forEach((control) => {
	      form.get(control).markAsTouched();
          });
      }
      this.formValidationDlgRef = null;
      });
  }

  clearAutoCompleteField(form: FormGroup, name, id) {
      form.get(name).setValue('');
      form.get(id).setValue('');
  }

  clearLocation(){
    this.accountDetailsForm.patchValue({
      locationId: null,
      locationName: null,
    });
        this.pullContactAddr = false;
        this.pullAccountAddr = true;
        this.loading = true;
        this.api.getAccountDetails(this.order.accountId)
          .subscribe((account: Account) => {                
            if (!account) {
              this.loading = false;
              return;
            }
                setTimeout(() => {
                        this.loading = false;
                        this.myLocationSelect.close();
                }, 500);
            this.accountDetailsForm.patchValue({
              shippingCompanyId: this.order.accountId,
              shippingCompanyName: this.order.accountName,
              shippingCustomerId: this.order.contactId,
              shippingCustomerName: this.order.contactName,
              shippingStreet: account.shipAddress1,
              shippingStreet2: account.shipAddress2,
              shippingCity: account.shipCity,
              shippingState: account.shipState,
              shipPostalcode: account.shipPostalcode,
              shipCountry: account.shipCountry,
              shippingPhone: account.phone,
  
              billingCompanyId: this.order.accountId,
              billingCompanyName: this.order.accountName,
              billingCustomerId: this.order.contactId,
              billingCustomerName: this.order.contactName,
              billingStreet: account.billAddress1,
              billingStreet2: account.billAddress2,
              billingCity: account.billCity,
              billingState: account.billState,
              billingPostalcode: account.billPostalcode,
              billingCountry: account.billCountry,
              billingPhone: account.phone,
            });
        });
  }
  sendAsn() {
    this.loading = true;
    this.cxmlService.sendAsn(this.order.id)
    .subscribe((res: any) => {
      this.loading = false;
      if (res.msg) {
        this.msg.show(res.msg, 'success');
      } else {
        this.msg.show('An error occured, please try again', 'error');
      }
    }, (err) => {
      this.loading = false;
      this.msg.show(err.error.msg, 'error');
    });
  }


}

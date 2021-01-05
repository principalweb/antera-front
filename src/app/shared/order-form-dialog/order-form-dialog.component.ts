import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { ContactsService } from 'app/core/services/contacts.service';
import { Account, Contact, OrderDetails } from 'app/models';
import { ContactFormDialogComponent } from '../contact-form/contact-form.component';
import { fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { ModuleField } from 'app/models/module-field';
import { AuthService } from 'app/core/services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';
import { find } from 'lodash';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { AccountDetailsDialogComponent } from 'app/features/accounts/components/account-details-dialog/account-details-dialog.component';

@Component({
  selector: 'app-order-form-dialog',
  templateUrl: './order-form-dialog.component.html',
  styleUrls: ['./order-form-dialog.component.scss']
})
export class OrderFormDialogComponent implements OnInit {

  account: Account;
  contact: Contact;
  order: OrderDetails;

  action = 'new';
  title = `Create Order`;
  orderForm: FormGroup;
  loading = false;

  filteredContacts = [];
  filteredAccounts: Observable<any>;
  filteredSalesRep: Observable<any>;
  filteredCsrs: Observable<any>;

  selectedAccount: any;
  selectedContact: any;
  timezones = [];
  type = '';

  nameSelector = c => c.name;

  fields = [];
  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;

  opportunityNo = '';
  corporateIdentities: Object;
  defaultIdentity: any = '';
  defaultCommission: any = '';
  identityEnabled: boolean = false;
  commissionGroups: any[];
  commissionEnabled: boolean;
  formValidationDlgRef: MatDialogRef<FormValidationComponent>;
  excludeInvalidControls = ['accountId', 'contactId', 'salesPersonId', 'billingCustomerId', 'billingCompanyId', 'shippingCustomerId', 'shippingCompanyId', 'csrEmbroideryUserId', 'productionManagerId', 'csr'];
  salutationTypes = [];
  customerPO_required = false;
  dropdownOptions = [];
  onTimezonesDropdownChangedSubscription: Subscription;

  constructor(
    public dialogRef: MatDialogRef<OrderFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private api: ApiService,
    private auth: AuthService,
    private contactsService: ContactsService,
    private dialog: MatDialog,
    private accountService: AccountsService,
  ) {
    this.account = this.data.account;
    this.contact = this.data.contact;
    this.order = this.data.order;
    this.action = this.data.action;
    this.type = this.data.type;
    this.opportunityNo = this.data.opportunityNo;
  }

  ngOnInit() {

    const dropdownOptions = [
            'sys_acctrating_list', 
            'businesspartner_list', 
            'account_type_dom', 
            'industry_dom', 
            'lead_source_dom', 
            'sys_credit_terms_list',
            'sys_shippacct_list',
            'multi_tax_rate_list',
            'sys_accounts_group_list',
            'sys_accounts_service_status_list',
            'sys_tax_exemption_reason_id_list',
            'sys_brand_affiliation_list',
            'sys_annual_budget_list',
            'sys_vendor_decoration_price_strategy',
            'sys_leads_channel_list',
          ];
        this.api.getDropdownOptions({ dropdown: dropdownOptions })
        .subscribe((res: any[]) => {
                console.log("res",res)
                if (!res) return;
                this.dropdownOptions = res;
                console.log("dropdownOptions",this.dropdownOptions)
            
            });
            this.onTimezonesDropdownChangedSubscription = 
            this.accountService.onTimezonesDropdownChanged
                .subscribe((res: any[]) => {
                    if (!res) return;
                    this.timezones = res;
                });
    this.loading = true;
    this.configureCommissions();
    this.configureOrderForm().subscribe((results: any) => {
      if (results[0].value && results[0].value == 1) {
          this.identityEnabled = true;
      }
      if (results[1]) {
        this.fields = results[1].map(moduleField => new ModuleField(moduleField));
            this.loading = false;
            this.createOrderForm();
      }
    });

    this.contactsService.getDropdownOptionsForContact([
      'sys_contact_salutation_list',
       ]).then((res: any[]) => {
         // TODO find out the type of the response and test function works as expected
        const contactSalutationDropdown = find(res, {name: 'sys_contact_salutation_list'});
        this.salutationTypes = contactSalutationDropdown && contactSalutationDropdown.options;   
      
      }).catch((err) => {});
  }



  configureOrderForm() {
    const orderModuleFieldParams = 
    {
        offset: 0,
        limit: 200,
        order: 'module',
        orient: 'asc',
        term: { module : 'Orders' }
    };
    return forkJoin(
      this.api.getAdvanceSystemConfig({module: 'Orders', setting:'identityEnabled'}),
      this.api.getFieldsList(orderModuleFieldParams)
    );
  }

  createOrderForm() {
    if (this.data.action === 'edit') {
      if(this.type == 'CreditMemo'){
          this.title = `Edit Credit Memo`;
      }else{
          this.title = `Edit ${this.type}`;
      }
      
      this.selectedAccount = {
        id: this.order.accountId,
        name: this.order.accountName
      };
     
      this.selectedContact = {
        id: this.order.contactId,
        name: this.order.contactName
        };

        let baseForm = {
            orderIdentity: [this.order.orderIdentity, Validators.required],
            accountId: [this.selectedAccount.id, Validators.required],
            accountName: [this.order.accountName, Validators.required],
            contactId: [this.selectedContact.id, Validators.required],
            contactName: [this.order.contactName, Validators.required],
            salesPersonId: [this.order.salesPersonId, Validators.required],
            salesPerson: [this.order.salesPerson, Validators.required],
            csr: [this.order.csr],
            //partnerIdentityId: [this.order.partnerIdentityId],
            partnerIdentityId: requiredField('partnerIdentityId', this.fields) ? [this.order.partnerIdentityId, Validators.required] : [this.order.partnerIdentityId],
            commissionGroupId: [this.order.commissionGroupId],
            csrName: [this.order.csrName],
            customerPo: requiredField('customerPo', this.fields) ? [this.order.customerPo, Validators.required] : [this.order.customerPo],
            billingStreet: requiredField('billingStreet', this.fields) ? [this.order.billingStreet, Validators.required] : [this.order.billingStreet],
            billingCustomerName: requiredField('billingCustomerName', this.fields) ? [this.order.billingCustomerName, Validators.required] : [this.order.billingCustomerName],
            billingStreet2: requiredField('billingStreet2', this.fields) ? [this.order.billingStreet2, Validators.required] : [this.order.billingStreet2],
            billingCity: requiredField('billingCity', this.fields) ? [this.order.billingCity, Validators.required] : [this.order.billingCity],
            billingState: requiredField('billingState', this.fields) ? [this.order.billingState, Validators.required] : [this.order.billingState],
            billingCountry: requiredField('billingCountry', this.fields) ? [this.order.billingCountry, Validators.required] : [this.order.billingCountry],
            billingPostalcode: requiredField('billingPostalcode', this.fields) ? [this.order.billingPostalcode, Validators.required] : [this.order.billingPostalcode],
            billingPhone: requiredField('billingPhone', this.fields) ? [this.order.billingPhone, Validators.required] : [this.order.billingPhone],
            shippingStreet: requiredField('shippingStreet', this.fields) ? [this.order.shippingStreet, Validators.required] : [this.order.shippingStreet],
            shippingStreet2: requiredField('shippingStreet2', this.fields) ? [this.order.shippingStreet2, Validators.required] : [this.order.shippingStreet2],
            shippingCity: requiredField('shippingCity', this.fields) ? [this.order.shippingCity, Validators.required] : [this.order.shippingCity],
            shippingState: requiredField('shippingState', this.fields) ? [this.order.shippingState, Validators.required] : [this.order.shippingState],
            shipPostalcode: requiredField('shipPostalcode', this.fields) ? [this.order.shipPostalcode, Validators.required] : [this.order.shipPostalcode],
            shipCountry: requiredField('shipCountry', this.fields) ? [this.order.shipCountry, Validators.required] : [this.order.shipCountry],
            shippingPhone: requiredField('shippingPhone', this.fields) ? [this.order.shippingPhone, Validators.required] : [this.order.shippingPhone],
            inHandDateBy: requiredField('inHandDateBy', this.fields) && this.type != 'CreditMemo' ? [this.order.inHandDateBy, Validators.required] : [this.order.inHandDateBy],
            shipDate: requiredField('shipDate', this.fields) && this.type != 'CreditMemo' ? [this.order.shipDate, Validators.required] : [this.order.shipDate],
            creditTerms: [this.order.creditTerms],
            shipVia: [this.order.shipVia]
        }


        this.orderForm = this.formBuilder.group(baseForm);
    } else {
      if(this.type == 'CreditMemo'){
          this.title = `Create Credit Memo`;
      }else{
          this.title = `Create ${this.type}`;
      }
      const caField = (field) => {
        if (this.contact && this.contact[field] && this.contact[field].trim()) {
          return this.contact[field].trim();
        }

        if (this.account && this.account[field] && this.account[field].trim()) {
          return this.account[field].trim();
        }

        return '';
      }


      if (this.identityEnabled) {
        // Configure default corporate identity
        const user = this.auth.getCurrentUser();
        if (user.corpIdentity) {
          this.defaultIdentity = user.corpIdentity;
        }
        
        
      }
      if(this.commissionEnabled) {
        const user = this.auth.getCurrentUser();
        if (user.commissionGroupId) {
          this.defaultCommission = user.commissionGroupId;
        }
      }
      if (this.account) {
        this.selectedAccount = {
          id: this.account.id,
          name: this.account.accountName,
          salesRepId: this.account.salesRepId,
          salesRep: this.account.salesRep,
          csrId: this.account.csrId,
          csr: this.account.csr,
          shippingAccountType: this.account.shippingAccountType,
          commissionGroupId: this.account.commissionGroupId
        };

        if (this.identityEnabled && this.account.corporateIdentityId) {
          this.defaultIdentity = this.account.corporateIdentityId;
        }

        if(this.account.customerPO) {
          if(this.account.customerPO === '1') {
              this.customerPO_required = true;
          } else {
              this.customerPO_required = false;
          }
        }
      } else {
        this.selectedAccount = {
          id: '',
          name: '',
          salesRep: '',
          salesRepId: '',
          csrId: '',
          csr: '',
          shippingAccountType: '',
          commissionGroupId: this.defaultCommission
        };
      };

      if (this.contact) {
        this.selectedContact = {
          id: this.contact.id,
          name: this.contact.firstName + ' ' + this.contact.lastName
        };
      } else {
        this.selectedContact = {
          id: '',
          name: ''
        };
      }
      
      // Load identities
      this.api.getIdentityList().subscribe((res) => {
          this.corporateIdentities = res;
      });

        let baseForm = {
            orderIdentity: ['', Validators.required],
            accountId: [this.selectedAccount.id, Validators.required],
            accountName: [this.selectedAccount.name, Validators.required],
            contactId: [this.selectedContact.id, Validators.required],
            contactName: [this.selectedContact.name, Validators.required],
            //partnerIdentityId: [this.defaultIdentity],
            partnerIdentityId: requiredField('partnerIdentityId', this.fields) ? [this.defaultIdentity, Validators.required] : [this.defaultIdentity],
            commissionGroupId: [this.selectedAccount.commissionGroupId],
            salesPersonId: [this.selectedAccount.salesRepId, Validators.required],
            salesPerson: [this.selectedAccount.salesRep, Validators.required],
            csr: requiredField('csr', this.fields) ? [this.selectedAccount.csrId, Validators.required] : [this.selectedAccount.csrId],
            csrName: requiredField('csrName', this.fields) ? [this.selectedAccount.csr, Validators.required] : [this.selectedAccount.csr],
            customerPo: requiredField('customerPo', this.fields) ? [caField('customerPo'), Validators.required] : [caField('customerPo')],
            billingStreet: requiredField('billAddress1', this.fields) ? [caField('billAddress1'), Validators.required] : [caField('billAddress1')],
            billingCustomerSalutation: requiredField('billingCustomerSalutation', this.fields) ? [caField('salutation'), Validators.required] : [caField('salutation')],
            billingCustomerName: requiredField('billingCustomerName', this.fields) ? [caField('contactName'), Validators.required] : [caField('contactName')],
            billingStreet2: requiredField('billingStreet2', this.fields) ? [caField('billAddress2'), Validators.required] : [caField('billAddress2')],
            billingCity: requiredField('billCity', this.fields) ? [caField('billCity'), Validators.required] : [caField('billCity')],
            billingState: requiredField('billState', this.fields) ? [caField('billState'), Validators.required] : [caField('billState')],
            billingPostalcode: requiredField('billPostalcode', this.fields) ? [caField('billPostalcode'), Validators.required] : [caField('billPostalcode')],
            billingCountry: requiredField('billCountry', this.fields) ? [caField('billCountry'), Validators.required] : [caField('billCountry')],
            billingPhone: requiredField('phone', this.fields) ? [caField('phone'), Validators.required] : [caField('phone')],
            shippingStreet: requiredField('shippingStreet', this.fields) ? [caField('shipAddress1'), Validators.required] : [caField('shipAddress1')],
            shippingCustomerSalutation: requiredField('shippingCustomerSalutation', this.fields) ? [caField('salutation'), Validators.required] : [caField('salutation')],
            shippingCustomerName: requiredField('shippingCustomerName', this.fields) ? [caField('contactName'), Validators.required] : [caField('contactName')],
            shippingStreet2: requiredField('shippingStreet2', this.fields) ? [caField('shipAddress2'), Validators.required] : [caField('shipAddress2')],
            shippingCity: requiredField('shipCity', this.fields) ? [caField('shipCity'), Validators.required] : [caField('shipCity')],
            shippingState: requiredField('shipState', this.fields) ? [caField('shipState'), Validators.required] : [caField('shipState')],
            shipPostalcode: requiredField('shipPostalcode', this.fields) ? [caField('shipPostalcode'), Validators.required] : [caField('shipPostalcode')],
            shipCountry: requiredField('shipCountry', this.fields) ? [caField('shipCountry'), Validators.required] : [caField('shipCountry')],
            shippingPhone: requiredField('shippingPhone', this.fields) ? [caField('phone'), Validators.required] : [caField('phone')],
            inHandDateBy: requiredField('inHandDateBy', this.fields) && this.type != 'CreditMemo' ? [null, Validators.required] : [],
            shipDate: requiredField('shipDate', this.fields) && this.type != 'CreditMemo' ? [null, Validators.required] : [],
            creditTerms: requiredField('creditTerms', this.fields) ? [caField('creditTerms'), Validators.required] : [caField('creditTerms')],
            shipVia: requiredField('shipVia', this.fields) ? [this.selectedAccount.shippingAccountType, Validators.required] : [this.selectedAccount.shippingAccountType],
        };

      
        this.orderForm = this.formBuilder.group(baseForm);
    }

    this.filteredSalesRep = this.orderForm.get('salesPerson')
    .valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => this.api.getUserAutocomplete(val))
    );

    this.orderForm.get('contactName')
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(val => this.contactFilterByAccount(val))
      ).subscribe((rst: any[]) => {
        this.filteredContacts = rst;
      });

    this.filteredCsrs  = this.orderForm.get('csrName')
      .valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(keyword => this.api.getUserAutocomplete(keyword))
      );

    this.filteredAccounts = this.orderForm.get('accountName')
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(val => this.api.getCustomerAutocomplete(val))
      );
    }

    selectBillingSalutation(ev) {
      const salutations = ev.option.value;
      this.orderForm.get('billingCustomerSalutation').setValue(salutations.value);
  
    }

    selectShippingSalutation(ev) {
      const salutations = ev.option.value;
      this.orderForm.get('shippingCustomerSalutation').setValue(salutations.value);
  
    }

  ngAfterViewInit() {

  }

  create() {
    
    if (this.orderForm.invalid) {
      //this.msg.show('Please complete the form first', 'error');
      this.showValidation('new', this.orderForm);
      return;
    }
    if(this.customerPO_required === true) {
      if(this.orderForm.value.customerPo === "" || this.orderForm.value.customerPo === null) {
          this.msg.show("Customer PO is required",'error');
          return;
      }            
    }

    this.loading = true;

    const extraData = {
      billingCompanyName     : this.orderForm.value.accountName,
      billingCompanyId       : this.orderForm.value.accountId,
      billingCustomerName    : this.orderForm.value.billingCustomerName,
      billingCustomerId      : this.orderForm.value.contactId,
      billingCustomerSalutation: this.orderForm.value.billingCustomerSalutation,

      shippingCustomerSalutation: this.orderForm.value.shippingCustomerSalutation,
      shippingCustomerName   : this.orderForm.value.shippingCustomerName,
      shippingCustomerId     : this.orderForm.value.contactId,
      shippingCompanyName    : this.orderForm.value.accountName,
      shippingCompanyId      : this.orderForm.value.accountId
    }

    const newOrder = new OrderDetails(
      {
        ...this.orderForm.value,
        orderDate: new Date().toISOString().substr(0, 10),
        orderType: this.type,
        ...extraData
      }
    );

    if (this.opportunityNo && this.opportunityNo != '')
      newOrder.opportunityNo = this.opportunityNo;

    this.api.createOrder(newOrder)
      .subscribe(
        (data: any) => {
          this.loading = false;
          if (data.status === "success") {
            this.dialogRef.close({
              action: 'create',
              order: new OrderDetails(data.extra)
            });
          } else {
            this.msg.show(data[0].msg,'error');
          }
        },
        () => {
          this.loading = false;
          this.dialogRef.close();
        }
      );
  }

  update() {
    if (this.orderForm.invalid) {
      this.showValidation('update', this.orderForm);
      //this.msg.show('Please complete the form first', 'error');
      return;
    }

    this.loading = true;

    this.order.update(this.orderForm.value);

    this.api.updateOrder(this.order)
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.dialogRef.close({
            action: 'update',
            order: this.order
          });
        },
        () => {
          this.loading = false;
          this.dialogRef.close();
        }
      )
  }

  selectSalesRep(ev) {
    const c = ev.option.value;
    this.orderForm.get('salesPerson').setValue(c.name);
    this.orderForm.get('salesPersonId').setValue(c.id);
  }

  selectCsr(ev) {
      const c = ev.option.value;
      this.orderForm.get('csrName').setValue(c.name);
      this.orderForm.get('csr').setValue(c.id);
  }

  selectContact(ev) {
    const c = ev.option.value;
    this.orderForm.get('contactName').setValue('');

    if (c.id === 'add') {
      
      const dlgRef = this.dialog.open(ContactFormDialogComponent, {
        panelClass: 'antera-details-dialog',
        data: {
          action: 'new',
          service: this.contactsService
        }
      });

      dlgRef.afterClosed().subscribe(data => {
        if (data) {
          if (this.orderForm.value.accountId) {
            this.loading = true;
            this.api.linkAccountContact(this.orderForm.value.accountId, data.contact.extra.id)
              .subscribe(() => {
                this.loading = false;
                this.orderForm.get('contactId').setValue(data.contact.extra.id);
                this.orderForm.get('contactName').setValue(data.contact.extra.firstName + ' ' + data.contact.extra.lastName);
              }, (err) => {
                this.loading = false;
                this.orderForm.get('contactId').setValue('');
                this.orderForm.get('contactName').setValue('');
                this.msg.show('Linking account & contact failed','error');
              })
          } else {
            this.orderForm.get('contactId').setValue(data.contact.extra.id);
            this.orderForm.get('contactName').setValue(data.contact.extra.firstName + ' ' + data.contact.extra.lastName);
            if (data.contact.extra.commissionGroupId) {
              this.orderForm.get('commissionGroupId').setValue(data.contact.extra.commissionGroupId);
              this.orderForm.get('commissionGroupName').setValue(data.contact.extra.commissionGroupName);
            }
          }
        } else {
          this.orderForm.get('contactId').setValue('');
          this.orderForm.get('contactName').setValue('');
          this.msg.show('Creating contact failed', 'error');
        }
      });
    } else {
      this.orderForm.get('contactId').setValue(c.id);
      this.orderForm.get('contactName').setValue(c.name);
      if (c.commissionGroupId) {
        this.orderForm.get('commissionGroupId').setValue(c.commissionGroupId);
        this.orderForm.get('commissionGroupName').setValue(c.commissionGroupName);
      }
    }
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

  selectAccount(ev) {
    if (ev.option.value.id === 'add') {
     
      this.orderForm.get('accountId').setValue("");
      this.orderForm.get('accountName').setValue("");
      const dlgRefs = this.dialog.open(AccountDetailsDialogComponent, {
          panelClass: 'account-details-dialog',
          data      : {
              action: 'new',
              service : this.accountService,
              dropdowns: [this.dropdownOptions, this.timezones],
              type:'order',
          }
      });
      dlgRefs.afterClosed().subscribe(data => {
          
          if(data && data.account && data.account.status == 'success') {
            const account = data.account;
            
              this.orderForm.get('accountId').setValue(data.account.extra.id);
              this.orderForm.get('accountName').setValue(data.account.extra.accountName);
              this.api.getAccountDetails(data.account.extra.id)
              .subscribe((res: any) => {
                const account = new Account(res);

                if (account.corporateIdentityId) {
                  this.defaultIdentity = account.corporateIdentityId;
                }

                if(account.customerPO) {
                  if(account.customerPO === '1') {
                      this.customerPO_required = true;
                  } else {
                      this.customerPO_required = false;
                  }
                }
                const patch: any = {
                  'salesPersonId': account.salesRepId,
                  'salesPerson': account.salesRep,
                  'billingStreet': account.billAddress1,
                  'billingStreet2': account.billAddress2,
                  'billingCity': account.billCity,
                  'billingState': account.billState,
                  'billingPostalcode': account.billPostalcode,
                  'billingCountry': account.billCountry,
                  'billingPhone': account.phone,
                  'shippingStreet': account.shipAddress1,
                  'shippingStreet2': account.shipAddress2,
                  'shippingCity': account.shipCity,
                  'shippingState': account.shipState,
                  'shipPostalcode': account.shipPostalcode,
                  'shipCountry': account.shipCountry,
                  'shippingPhone': account.phone,
                  'creditTerms': account.creditTerms,
                  'shipVia': account.shippingAccountType,
                  'partnerIdentityId': this.defaultIdentity, 
                };

                if (account.commissionGroupId) {
                  patch.commissionGroupId = account.commissionGroupId;
                }

                this.orderForm.patchValue(patch);
              });
            
              this.contactFilterByAccount('')
                .subscribe(rst => {
                  this.filteredContacts = rst;
                });
          } else {
              if(data) {
                  this.msg.show('Creating account failed', 'error');
              }
              
          }
          
      })
  } else {
    const acc = ev.option.value;
    this.orderForm.get('accountId').setValue(acc.id);
    this.orderForm.get('accountName').setValue(acc.name);
    this.api.getAccountDetails(acc.id)
      .subscribe((res: any) => {
        const account = new Account(res);

        if (account.corporateIdentityId) {
          this.defaultIdentity = account.corporateIdentityId;
        }

        if(account.customerPO) {
          if(account.customerPO === '1') {
              this.customerPO_required = true;
          } else {
              this.customerPO_required = false;
          }
        }
        const patch: any = {
          'salesPersonId': account.salesRepId,
          'salesPerson': account.salesRep,
          'billingStreet': account.billAddress1,
          'billingStreet2': account.billAddress2,
          'billingCity': account.billCity,
          'billingState': account.billState,
          'billingPostalcode': account.billPostalcode,
          'billingCountry': account.billCountry,
          'billingPhone': account.phone,
          'shippingStreet': account.shipAddress1,
          'shippingStreet2': account.shipAddress2,
          'shippingCity': account.shipCity,
          'shippingState': account.shipState,
          'shipPostalcode': account.shipPostalcode,
          'shipCountry': account.shipCountry,
          'shippingPhone': account.phone,
          'creditTerms': account.creditTerms,
          'shipVia': account.shippingAccountType,
          'partnerIdentityId': this.defaultIdentity, 
        };

        if (account.commissionGroupId) {
          patch.commissionGroupId = account.commissionGroupId;
        }

        this.orderForm.patchValue(patch);
      });
    
      this.contactFilterByAccount('')
        .subscribe(rst => {
          this.filteredContacts = rst;
        });
    }      
  }

  copyBillingAddress(ev) {
    if (ev.checked) {
      this.orderForm.get('shippingStreet').setValue(this.orderForm.value.billingStreet);
      this.orderForm.get('shippingStreet2').setValue(this.orderForm.value.billingStreet2);
      this.orderForm.get('shippingCity').setValue(this.orderForm.value.billingCity);
      this.orderForm.get('shippingState').setValue(this.orderForm.value.billingState);
      this.orderForm.get('shipPostalcode').setValue(this.orderForm.value.billingPostalcode);
      this.orderForm.get('shipCountry').setValue(this.orderForm.value.billingCountry);
      this.orderForm.get('shippingPhone').setValue(this.orderForm.value.billingPhone);
    }

  }

  private contactFilterByAccount(val) {
    if (this.orderForm.value.accountId) {
      return this.api.getRelatedContacts({
        accountId: this.orderForm.value.accountId,
        limit: 10,
        offset: 0,
        term: {
          contactName: val
        }
      }).pipe(
        map((list: any) =>
          list.map(c => ({
            id: c.id,
            name: c.contactName
          }))
        )
      );
    }
    console.log(val);
    return this.api.getContactAutocomplete(val);
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
  
}

import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as shape from 'd3-shape';
import { cloneDeep, find } from 'lodash';
import { Subscription, Observable, forkJoin } from 'rxjs';


import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';
import { ContactFormDialogComponent } from 'app/shared/contact-form/contact-form.component';
import { OrderFormDialogComponent } from 'app/shared/order-form-dialog/order-form-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { ContactsService } from 'app/core/services/contacts.service';
import { Account, Contact } from 'app/models';
import { AccountsService } from '../../accounts.service';
import { ContactsSelectDialogComponent } from '../contacts-select-dialog/contacts-select-dialog.component';
import { Scheme, Values } from './chart-options';
import { AuthService } from 'app/core/services/auth.service';
import { QbService } from 'app/core/services/qb.service';

import { displayName, visibleField, fieldLabel, requiredField } from 'app/utils/utils';
import { OpportunityFormDialogComponent } from '../../../opportunities/opportunity-form/opportunity-form.component';
import { OpportunitiesService } from 'app/core/services/opportunities.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { PermissionService } from 'app/core/services/permission.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FuseLocationFormComponent } from 'app/features/locations/location-form/location-form.component';
import { LocationsService } from 'app/features/locations/locations.service';
import { PopupNotesDialogComponent } from 'app/shared/popup-notes-dialog/popup-notes-dialog.component';


@Component({
  selector: 'accounts-overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class OverviewTabComponent implements OnInit {
  @Input() team: Contact[] = [];
  @Input() account: Account = {} as Account;
  @Output() edit = new EventEmitter();

  menuVisible = false;
  dialogRef: MatDialogRef<ContactFormDialogComponent>;
  orderDlgRef: MatDialogRef<OrderFormDialogComponent>;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  formValidationDlgRef: MatDialogRef<FormValidationComponent>;
  permissionsEnabled: boolean;

  //Chart Options
  scheme = Scheme;
  values = Values; // Chart is based on static values currently
  curve = shape.curveBasis;
  periods = [
    {
      key: "LW",
      value: "Last Week"
    },
    {
      key: "TM",
      value: "This Month"
    },
    {
      key: "YTD",
      value: "YTD"
    },
    {
      key: "LY",
      value: "Last Year"
    }
  ];
  stats = {};
  selectedPeriod = "TM";
  loading = false;
  accountStats: any = {};
  onAccountStatsChangedSubscription: Subscription;
  onDropdownOptionsForAccountChangedSubscription: Subscription;
  onModuleFieldsChangedSubscription: Subscription;
  onAccountBalanceChanged: Subscription;

  accountForm: FormGroup;
  editingAccounts = false;
  filteredUsers = [];
  filteredAccounts = [];
  ratings = [];
  pTypes = [];
  accTypes = [];
  creditTerms = [];
  fields = [];
  accGroupTypes = [];
  accServiceTypes = [];

  displayName = displayName;

  isShippingEditDisabled = false;
  onDisplayMenuChanged: Subscription;
  sourceEnabled = true;
  qboActive = false;
  qbConnector = '';
  onQbActiveChangedSubscription: Subscription;
  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;
  identityEnabled: boolean = false;
  corporateIdentities: any[];
  commissionGroups: any[];
  commissionEnabled: boolean;
  balanceAmount: number = 0;
  precredit: string = '';
  procredit: string = '';
  excludeInvalidControls = ['corporateIdentityId', 'commissionGroupId', 'parentAccountId', 'salesRepId', 'salesManagerName', 'csrEmbroideryUserId', 'csrScreenprintUserId'];

  constructor(
    private accountsService: AccountsService,
    private api: ApiService,
    private dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private contactsService: ContactsService,
    private msg: MessageService,
    private authService: AuthService,
    private opportunitiesService: OpportunitiesService,
    private qbService: QbService,
    private permService: PermissionService,
    private locationsService: LocationsService,
  ) {
  }

  ngOnInit() {

    this.createAccountForm();

    this.onAccountStatsChangedSubscription =
      this.accountsService.onAccountStatsChanged
        .subscribe((res: any) => {
          this.accountStats = res;
        });

    this.onDropdownOptionsForAccountChangedSubscription =
      this.accountsService.onDropdownOptionsForAccountChanged
        .subscribe((res: any[]) => {
          if (!res) return;
          const ratingDropdown = find(res, { name: 'sys_acctrating_list' });
          this.ratings = ratingDropdown && ratingDropdown.options;

          const creditTermDropdown = find(res, { name: 'sys_credit_terms_list' });
          this.creditTerms = creditTermDropdown && creditTermDropdown.options;

          const partnerDropdown = find(res, { name: 'businesspartner_list' });
          this.pTypes = partnerDropdown && partnerDropdown.options;

          const accountTypeDropdown = find(res, { name: 'account_type_dom' });
          this.accTypes = accountTypeDropdown && accountTypeDropdown.options;

          const accountGroupTypeDropdown = find(res, { name: 'sys_accounts_group_list' });
          this.accGroupTypes = accountGroupTypeDropdown && accountGroupTypeDropdown.options;

          const accountServiceTypeDropdown = find(res, { name: 'sys_accounts_service_status_list' });
          this.accServiceTypes = accountServiceTypeDropdown && accountServiceTypeDropdown.options;

        });

    this.onDisplayMenuChanged =
      this.accountsService.onDisplayMenuChanged
        .subscribe((list: any[]) => {
          const sourceItem = find(list, { name: 'order.sourcing' });
          if (sourceItem) {
            this.sourceEnabled = sourceItem.display == '1' ? true : false;
          }
        });

    this.onQbActiveChangedSubscription =
      this.qbService.onQbActiveChanged
        .subscribe((res: boolean) => {
          if (res) {
            this.qbConnector = this.qbService.getActiveConnector();
            this.qboActive = this.qbConnector == 'QBO' || this.qbConnector == 'XERO' ? true : false;
          }
        });

    this.onModuleFieldsChangedSubscription =
      this.accountsService.onModuleFieldsChanged
        .subscribe((fields: any[]) => {
          this.fields = fields;
        });

    this.onAccountBalanceChanged =
      this.api.getAccountBalance({ accountId: this.account.id }).subscribe((credit: number) => {
        this.balanceAmount = (credit) > 0 ? credit : Math.abs(credit);
        if (credit > 0) {
          this.precredit = '';
          this.procredit = '';
        } else {
          this.precredit = '(';
          this.procredit = ')';
        }
      });


    this.permService.getPermissionStatus().subscribe((res: any) => {
      if (res == '0' || res == 0 || res == false) {
        res = false
      } else {
        res = true;
      }

      this.permissionsEnabled = res;
    });
  }
  ngAfterViewInit(){
    if(this.account.popupNotes != "" && this.account.popupNotes_show_order_accview=="1"){
      this.dialog.open(PopupNotesDialogComponent, {
        panelClass: 'popup-notes-dialog',
        width: '60%',
        data:this.account          
      });
    }
  }
  ngOnDestroy() {
    this.onAccountStatsChangedSubscription.unsubscribe();
    this.onDisplayMenuChanged.unsubscribe();
    this.onDropdownOptionsForAccountChangedSubscription.unsubscribe();
    this.onAccountBalanceChanged.unsubscribe();
    this.onQbActiveChangedSubscription.unsubscribe();
    if (this.onModuleFieldsChangedSubscription) this.onModuleFieldsChangedSubscription.unsubscribe();
  }

  ngOnChanges(changes) {
    if (changes.account && changes.account.currentValue) {
      const account = changes.account.currentValue;

      this.stats = {
        "LW": {
          opportunities: 38000,
          sales: 20,
          credit: 30,
          orders: 10
        },
        "TM": {
          opportunities: 38000,
          sales: 34,
          credit: 21,
          orders: 20
        },
        "YTD": {
          opportunities: 38000,
          sales: account.ytdSales,
          credit: 43,
          orders: 61
        },
        "LY": {
          opportunities: 38000,
          sales: account.lastYearSales,
          credit: 12,
          orders: 43
        }
      }
    }
  }

  editAccount() {
    this.editingAccounts = !this.editingAccounts;
    if (this.editingAccounts) {
      this.createAccountForm();
    }
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  openContactDialog(contact, mode: string = '') {
    if (this.dialogRef) {
      return;
    }

    if (mode == 'create') {
      this.dialogRef = this.dialog.open(ContactFormDialogComponent, {
        panelClass: 'antera-details-dialog',
        data: {
          action: 'new',
          service: this.contactsService,
          account: this.account
        }
      });

      this.dialogRef.afterClosed().subscribe(data => {
        if (data && data.contact && data.contact.status == 'success') {
          this.dialogRef = null;
          if (data.relatedAccounts && data.relatedAccounts.length > 0) {
            const batch = [];
            data.relatedAccounts.forEach((account) => {
              batch.push(this.api.linkAccountContact(account.id, data.contact.extra.id));
            });
            this.loading = true;
            forkJoin(...batch)
              .subscribe(
                (res) => {
                  this.loading = false;
                  this.reloadContacts();
                }
              );
          }
          else {
            this.loading = true;
            this.api.linkAccountContact(this.account.id, data.contact.extra.id)
              .subscribe(() => {
                this.loading = false;
                this.reloadContacts();
              }, (err) => {
                this.loading = false;
                this.msg.show('Linking account & contact failed', 'error');
              });
          }
        } else {
          this.dialogRef = null;
          this.msg.show('Creating contact failed', 'error');
        }

      })
      return;
    }

    if (mode == 'remove') {
      this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
        disableClose: false
      });
      this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this contact from this account?';

      this.confirmDialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loading = true;
          this.api.removeLinkAccountContact(this.account.id, contact.id)
            .subscribe((response: any) => {
              this.msg.show(response.msg, 'success');
              if (response.status === 'Success') {
                this.reloadContacts();
              }
            }, (err) => {
              this.loading = false;
              this.confirmDialogRef = null;
              this.msg.show('Removing related account & contact failed', 'error');
            });
        }
        this.confirmDialogRef = null;
      });
      return;
    }

    this.loading = true;

    this.accountsService.getContactDetails(contact.id)
      .then(details => {
        this.dialogRef = this.dialog.open(ContactFormDialogComponent, {
          panelClass: 'antera-details-dialog',
          data: {
            action: 'edit',
            contact: details,
            contactRel: contact,
            service: this.contactsService,
            account: this.account
          }
        });

        this.dialogRef.afterClosed().subscribe(data => {
          if (data) {
            this.reloadContacts();
            return;
          }

          this.loading = false;
          this.dialogRef = null;
        });
      }).catch(err => {
        this.msg.show('Cannot get the contact details', 'error');
        this.loading = false;
      });
  }

  openContactListDialog() {
    this.loading = true;
    this.contactsService.select = this.account.id
    this.contactsService.page.pageSize = 10;
    this.contactsService.getContactCount();
    this.contactsService.getContacts()
      .then(() => {
        this.loading = false;
        let csdRef = this.dialog.open(ContactsSelectDialogComponent, {
          panelClass: 'contacts-select-dialog',
          data: {
            action: 'all',
            data: this.account.id,
            service: this.contactsService
          }
        });

        csdRef.afterClosed()
          .subscribe(data => {
            this.reloadContacts();
          });
      })
      .catch(() => {
        this.loading = false;
      })
  }

  createOrder(type) {
    this.loading = true;
    this.accountsService.setOrderType(type);
    this.api.post('/content/get-related-contacts-count', { accountId: this.account.id })
      .subscribe((response: any) => {
        this.loading = false;
        if (response.count > 0) {
          let csdRef = this.dialog.open(ContactsSelectDialogComponent, {
            panelClass: 'contacts-select-dialog',
            data: {
              action: 'related',
              data: this.account.id,
              service: this.accountsService
            }
          });
          csdRef.afterClosed()
            .subscribe(contact => {
              if (contact && contact.id) {
                this.accountsService.orderContact = contact;
                this.openOrderFormDialog();
              }
            });
        }
        else {
          let dialogRef = this.dialog.open(ContactCreateConfirmComponent, {
            width: '250px',
          });
          dialogRef.afterClosed().subscribe(result => {
            if (!result) return;
            if (result == 'Create') {
              this.openContactDialog(null, 'create');
            }
            else {
              this.openContactListDialog();
            }
          });
        }
      });
  }

  openOrderFormDialog() {
    this.orderDlgRef = this.dialog.open(OrderFormDialogComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        action: 'new',
        account: this.accountsService.currentAccount,
        contact: this.accountsService.orderContact,
        type: this.accountsService.orderType
      }
    });

    this.orderDlgRef.afterClosed()
      .subscribe(data => {
        if (data && data.order && data.order.id) {
          if (data.order.orderType == 'Order' || data.order.orderType == 'CreditMemo')
            this.router.navigate(['/e-commerce/orders', data.order.id]);
          else if (data.order.orderType == 'Source')
            this.router.navigate(['/e-commerce/sources', data.order.id]);
          else if (data.order.orderType == 'Quote')
            this.router.navigate(['/e-commerce/quotes', data.order.id]);
        }
      });
  }

  createOpportunity() {
    let dialogRef: MatDialogRef<OpportunityFormDialogComponent>
    dialogRef = this.dialog.open(OpportunityFormDialogComponent, {
      panelClass: 'opportunity-form-dialog',
      data: {
        action: 'new',
        service: this.opportunitiesService,
        account: this.account
      }
    });

    dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        this.opportunitiesService.createOpportunity(response)
          .subscribe(() => { })
      });
  }

  clone() {
    const newAcc = cloneDeep(this.account);
    newAcc.accountName += '(copy)';
    this.accountsService.addAccount(newAcc)
      .subscribe((response: any) => {
        if (response.status === 'success') {
          const id = response.extra.id;
          this.router.navigate(['/accounts', id]);
        }
      })
  }

  deleteAccount() {
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this account?';

    confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.accountsService.deleteAccount(this.account)
          .then((response: any) => {
            this.loading = false;
            if (Array.isArray(response)) {
              this.router.navigate(['/accounts']);
            }
          }).catch(() => { this.loading = false });
      }
    });

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

  clearCsr() {
    this.accountForm.patchValue({
      csrId: '',
      csr: '',
    });
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

  createAccountForm() {
    if (this.accountForm) {
      this.accountForm = null;
    }

    this.configureCorporateIdentity();
    this.configureCommissions();
    this.accountForm = this.createForm();

    this.accountForm.get('salesRep').valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
      if (keyword && keyword.length >= 3) {
        this.accountsService.autocompleteUsers(keyword).subscribe((res: any[]) => {
          this.filteredUsers = res;
        });
      }
    });

    this.accountForm.get('csr').valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
      if (keyword && keyword.length === 0) {
        this.clearCsr();
      }
      if (keyword && keyword.length >= 3) {
        this.accountsService.autocompleteUsers(keyword).subscribe((res: any[]) => {
          this.filteredUsers = res;
        });
      }
    });

    this.accountForm.get('parentAccount').valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(val => {
      if (val && val.length >= 3) {
        this.api.getAccountAutocomplete(val).subscribe((res: any[]) => {
          this.filteredAccounts = res;
        });
      }
    });

  }
  // Create Account Form
  createForm() {

    const user = this.authService.getCurrentUser();
    return this.formBuilder.group({
      accountName: [this.account.accountName, Validators.required],
      corporateIdentityId: requiredField('corporateIdentityName', this.fields) ? [this.account.corporateIdentityId, Validators.required] : [this.account.corporateIdentityId],
      corporateIdentityName: requiredField('corporateIdentityName', this.fields) ? [this.account.corporateIdentityName, Validators.required] : [this.account.corporateIdentityName],
      commissionGroupId: requiredField('commissionGroupName', this.fields) ? [this.account.commissionGroupId, Validators.required] : [this.account.commissionGroupId],
      commissionGroupName: requiredField('commissionGroupName', this.fields) ? [this.account.commissionGroupName, Validators.required] : [this.account.commissionGroupName],
      parentAccount: requiredField('parentAccount', this.fields) ? [this.account.parentAccount, Validators.required] : [this.account.parentAccount],
      parentAccountId: requiredField('parentAccount', this.fields) ? [this.account.parentAccountId, Validators.required] : [this.account.parentAccountId],
      alternateAccountNumber: requiredField('alternateAccountNumber', this.fields) ? [this.account.alternateAccountNumber, Validators.required] : [this.account.alternateAccountNumber],
      partnerType: requiredField('partnerType', this.fields) ? [this.account.partnerType, Validators.required] : [this.account.partnerType],
      timeZone: requiredField('timeZone', this.fields) ? [this.account.timeZone, Validators.required] : [this.account.timeZone],
      salesRepId: [this.account.salesRepId == '' ? user.userId : this.account.salesRepId, Validators.required],
      salesRep: [this.account.salesRep == '' ? `${user.firstName} ${user.lastName}` : this.account.salesRep, Validators.required],
      phone: requiredField('phone', this.fields) ? [this.account.phone, Validators.required] : [this.account.phone],
      additionalPhone: requiredField('additionalPhone', this.fields) ? [this.account.additionalPhone, Validators.required] : [this.account.additionalPhone],
      rating: requiredField('rating', this.fields) ? [this.account.rating, Validators.required] : [this.account.rating],

      accountType: requiredField('accountType', this.fields) ? [this.account.accountType, Validators.required] : [this.account.accountType],
      csr: requiredField('csr', this.fields) ? [this.account.csr, Validators.required] : [this.account.csr],
      csrId: requiredField('csrId', this.fields) ? [this.account.csrId, Validators.required] : [this.account.csrId],
      creditTerms: requiredField('creditTerms', this.fields) ? [this.account.creditTerms, Validators.required] : [this.account.creditTerms],
      accountsGroup: requiredField('accountsGroup', this.fields) ? [this.account.accountsGroup, Validators.required] : [this.account.accountsGroup],
      accountsServiceStatus: requiredField('accountsServiceStatus', this.fields) ? [this.account.accountsServiceStatus, Validators.required] : [this.account.accountsServiceStatus],

      shipAddress1: requiredField('shipAddress1', this.fields) ? [{ value: this.account.shipAddress1, disabled: this.isShippingEditDisabled }, Validators.required] : [{ value: this.account.shipAddress1, disabled: this.isShippingEditDisabled }],
      shipAddress2: requiredField('shipAddress2', this.fields) ? [{ value: this.account.shipAddress2, disabled: this.isShippingEditDisabled }, Validators.required] : [{ value: this.account.shipAddress2, disabled: this.isShippingEditDisabled }],
      shipCity: requiredField('shipCity', this.fields) ? [{ value: this.account.shipCity, disabled: this.isShippingEditDisabled }, Validators.required] : [{ value: this.account.shipCity, disabled: this.isShippingEditDisabled }],
      shipState: requiredField('shipState', this.fields) ? [{ value: this.account.shipState, disabled: this.isShippingEditDisabled }, Validators.required] : [{ value: this.account.shipState, disabled: this.isShippingEditDisabled }],
      shipPostalcode: requiredField('shipPostalcode', this.fields) ? [{ value: this.account.shipPostalcode, disabled: this.isShippingEditDisabled }, Validators.required] : [{ value: this.account.shipPostalcode, disabled: this.isShippingEditDisabled }],
      shipCountry: requiredField('shipCountry', this.fields) ? [{ value: this.account.shipCountry, disabled: this.isShippingEditDisabled }, Validators.required] : [{ value: this.account.shipCountry, disabled: this.isShippingEditDisabled }],

      billAddress1: requiredField('billAddress1', this.fields) ? [this.account.billAddress1, Validators.required] : [this.account.billAddress1],
      billAddress2: requiredField('billAddress2', this.fields) ? [this.account.billAddress2, Validators.required] : [this.account.billAddress2],
      billCity: requiredField('billCity', this.fields) ? [this.account.billCity, Validators.required] : [this.account.billCity],
      billState: requiredField('billState', this.fields) ? [this.account.billState, Validators.required] : [this.account.billState],
      billPostalcode: requiredField('billPostalcode', this.fields) ? [this.account.billPostalcode, Validators.required] : [this.account.billPostalcode],
      billCountry: requiredField('billCountry', this.fields) ? [this.account.billCountry, Validators.required] : [this.account.billCountry],
    });
  }

  saveAccount() {

    if (this.accountForm.get('csr').value == null || this.accountForm.get('csr').value == '' || this.accountForm.get('csrId').value == null || this.accountForm.get('csrId').value == '') {
      this.accountForm.patchValue({
        csr: '',
        csrId: ''
      });
    }

    if (this.accountForm.get('salesRep').value == null || this.accountForm.get('salesRep').value == '' || this.accountForm.get('salesRepId').value == null || this.accountForm.get('salesRepId').value == '') {
      this.accountForm.patchValue({
        salesRep: '',
        salesRepId: ''
      });
    }

    if (this.accountForm.get('parentAccount').value == null || this.accountForm.get('parentAccount').value == '' || this.accountForm.get('parentAccountId').value == null || this.accountForm.get('parentAccountId').value == '') {
      this.accountForm.patchValue({
        parentAccount: '',
        parentAccountId: ''
      });
    }

    if (this.accountForm.get('corporateIdentityName').value == null || this.accountForm.get('corporateIdentityName').value == '' || this.accountForm.get('corporateIdentityId').value == null || this.accountForm.get('corporateIdentityId').value == '') {
      this.accountForm.patchValue({
        corporateIdentityName: '',
        corporateIdentityId: ''
      });
    }

    if (this.accountForm.get('commissionGroupName').value == null || this.accountForm.get('commissionGroupName').value == '' || this.accountForm.get('commissionGroupId').value == null || this.accountForm.get('commissionGroupId').value == '') {
      this.accountForm.patchValue({
        commissionGroupName: '',
        commissionGroupId: ''
      });
    }

    if (this.accountForm.invalid) {
      //this.msg.show('Please complete the form first', 'error');

      this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
        panelClass: 'app-form-validation',
        data: {
          action: 'update',
          moduleForm: this.accountForm,
          fields: this.fields,
          excludeInvalidControls: this.excludeInvalidControls
        }
      });

      this.formValidationDlgRef.afterClosed().subscribe(data => {
        if (data) {
          data.invalidControls.forEach((control) => {
            this.accountForm.get(control).markAsTouched();
          });
        }
        this.formValidationDlgRef = null;
      });
      return;
    }
    this.editAccount();
    this.edit.emit({ type: 'AccountDetails', dataForm: this.accountForm });
  }

  copyBillingAddress(ev) {
    if (ev.checked) {
      this.accountForm.patchValue({
        shipAddress1: this.accountForm.value.billAddress1,
        shipAddress2: this.accountForm.value.billAddress2,
        shipCity: this.accountForm.value.billCity,
        shipState: this.accountForm.value.billState,
        shipPostalcode: this.accountForm.value.billPostalcode,
        shipCountry: this.accountForm.value.billCountry,
      });
      //this.edit.emit({ type: 'Billing', dataForm: this.accountForm });
      this.isShippingEditDisabled = true;
    }
    else {
      this.isShippingEditDisabled = false;
    }
    //this.createAccountForm();
  }

  onLeadCardSelected(status) {
    this.router.navigate(['/leads'], { queryParams: { status: status, assigned: this.account.accountName, refType: 'Account' } });
  }

  onActivityCardSelected(status) {
    this.router.navigate(['/activities'], { queryParams: { status: status, refId: this.account.id, refType: 'Account' } });
  }

  onQuoteCardSelected(status) {
    this.router.navigate(['/e-commerce/quotes'], { queryParams: { status: status, assigned: this.account.accountName, refType: 'Account' } });
  }

  onOrderCardSelected(status) {
    if(status == 'All'){
        this.router.navigate(['/e-commerce/orders'], { queryParams: { status: ['Billed','Booked'], assigned: this.account.accountName, refType: 'Account' } });
    }else{
        this.router.navigate(['/e-commerce/orders'], { queryParams: { status: status, assigned: this.account.accountName, refType: 'Account' } });
    }
    
  }

  onProjectsCardSelected(status) {
    this.router.navigate(['/opportunities'], { queryParams: { status: status, assigned: this.account.accountName, refType: 'Account' } });
  }

  onLocationsCardSelected() {
    //     this.accountsService.payload.term.parentId = this.account.id;
    this.router.navigate(['/accounts'], { queryParams: { parentId: this.account.id } });
  }

  reloadLocations() {
    this.accountsService.getLocationsCount(this.account.id);
    this.accountsService.getLocations(this.account.id)
      .then(() => {
        this.loading = false;
        this.dialogRef = null;
      })
      .catch(() => {
        this.loading = false;
        this.dialogRef = null;
      });
  }

  editLocation(location) {
    const dialogRef = this.dialog.open(FuseLocationFormComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        action: 'edit',
        location
      }
    });

    dialogRef.afterClosed()
      .subscribe(response => {
        if (!response) {
          return;
        }

        const actionType: string = response[0];

        switch (actionType) {
          case 'save':
            this.accountsService.updateLocation(response[1]).subscribe((res) => {
              this.msg.show('Updated location', 'success');
              this.reloadLocations();
            });
            break;

          case 'delete':
            this.deleteLocation(location);
            break;
        }
      });
  }
  deleteLocation(ws) {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this location?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.accountsService.deleteLocation(ws).subscribe((res) => {
          this.msg.show('Location deleted', 'success');
          this.reloadLocations();
        });
      }

      this.confirmDialogRef = null;
    });
  }

  newLocation() {
    const dialogRef = this.dialog.open(FuseLocationFormComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        action: 'new'
      }
    });

    dialogRef.afterClosed()
      .subscribe((response: FormGroup) => {
        if (!response) {
          return;
        }

        this.accountsService.createLocation(response[1]).pipe(
          switchMap((response: any) => {
            return this.api.post('/content/add-locations-to-account', {
              accountId: this.account.id,
              locationsIds: [response.extra.params.id],
            });
          })
        ).subscribe((res) => {
          this.reloadLocations();
        });
      });
  }

  deleteSelectedLocations() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected locations?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.locationsService.deleteSelectedLocations();
      }
      this.confirmDialogRef = null;
    });
  }

  reloadContacts() {
    this.accountsService.getContactsCount(this.account.id);
    this.accountsService.getContacts(this.account.id)
      .then(() => {
        this.loading = false;
        this.dialogRef = null;
      })
      .catch(() => {
        this.loading = false;
        this.dialogRef = null;
      });
  }

  getBillCity(account) {
    const { billCity, billState, billPostalcode } = account;
    const city = billCity
      ? `${billCity}, ${billState || ''} ${billPostalcode || ''}`
      : `${billState || ''} ${billPostalcode || ''}`;

    return city;
  }

  getShipCity(account) {
    const { shipCity, shipState, shipPostalcode } = account;
    const city = shipCity
      ? `${shipCity}, ${shipState || ''} ${shipPostalcode || ''}`
      : `${shipState || ''} ${shipPostalcode || ''}`;

    return city;
  }

  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.accountForm.get('salesRep').setValue(assignee.name);
    this.accountForm.get('salesRepId').setValue(assignee.id);
  }

  selectCorporateIdentity(ev) {
    const identity = ev.option.value;
    this.accountForm.get('corporateIdentityName').setValue(identity.name);
    this.accountForm.get('corporateIdentityId').setValue(identity.id);
  }

  selectCommissionGroups(ev) {
    const group = ev.option.value;
    this.accountForm.get('commissionGroupName').setValue(group.name);
    this.accountForm.get('commissionGroupId').setValue(group.id);
  }


  selectCSR(ev) {
    const csr = ev.option.value;
    this.accountForm.get('csr').setValue(csr.name);
    this.accountForm.get('csrId').setValue(csr.id);
  }

  selectParentAccount(ev) {
    const acc = ev.option.value;
    this.accountForm.get('parentAccountId').setValue(acc.id);
    this.accountForm.get('parentAccount').setValue(acc.name);
  }

  clearAssignee() {
    this.accountForm.patchValue({
      salesRep: '',
      salesRepId: ''
    });
  }

  clearParentAccount() {
    this.accountForm.patchValue({
      parentAccount: '',
      parentAccountId: ''
    });
  }
  clearCorporateIdentity() {
    this.accountForm.patchValue({
      corporateIdentityName: '',
      corporateIdentityId: ''
    });
  }
  clearCommissionGroups() {
    this.accountForm.patchValue({
      commissionGroupName: '',
      commissionGroupId: ''
    });
  }

  displayCreditTerm(value) {
    const creditTerm = find(this.creditTerms, { value: value });
    if (!creditTerm) return '';
    return creditTerm.label;
  }

  displayAccountsGroup(value) {
    const accGroupType = find(this.accGroupTypes, { value: value });
    if (!accGroupType) return '';
    return accGroupType.label;
  }

  displayAccountsServiceStatus(value) {
    const accServiceType = find(this.accServiceTypes, { value: value });
    if (!accServiceType) return '';
    return accServiceType.label;
  }


  publishToQBO() {
    console.log(this.account);
    if (this.qboActive) {
      this.loading = true;
      let entity = "Account";
      if (this.account.partnerType == "Vendor") {
        entity = "Vendor";
      }
      this.qbService.pushEntity(entity, this.account.id)
        .then((res: any) => {
          if (res.error == true) {
            this.msg.show(res.msg, 'error');
            this.loading = false;
          }
          else {
            this.msg.show(res.msg, 'success');
            this.loading = false;
          }
        }).catch((err) => {
          this.loading = false;
          this.msg.show(err.message, 'error');
        });
    } else {
      this.msg.show('QB is not active.', 'error');
    }
  }
  qboCleanEntity(){
      this.loading = true;
      let entity = "Customer";
      if (this.account.partnerType == "Vendor") {
        entity = "Vendor";
      }
      this.qbService.qboCleanEntity(entity, this.account.id, '')
        .subscribe(() => {
          this.loading = false;
          this.msg.show('QBO table cleaned for this account', 'success');
        }, (err) => {
          this.loading = false;
          this.msg.show('QBO table cleaning for this account failed', 'error');
      });  
  }
}


@Component({
  selector: 'create-contact-confirm-dialog',
  template: `
  <div mat-dialog-content>
    <p>This account doesn't have any contacts related.</p>
    <p>Please create one or select from contact list to add.</p>
  </div>
  <div mat-dialog-actions>
    <button mat-button (click)="onButtonClick('Create')" tabindex="1">Create</button>
    <button mat-button (click)="onButtonClick('Select')" tabindex="2">Select</button>
  </div>
  `
})
export class ContactCreateConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<ContactCreateConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onButtonClick(type): void {
    this.dialogRef.close(type);
  }

}

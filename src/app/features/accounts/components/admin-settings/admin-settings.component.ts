import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountsService } from '../../accounts.service';
import { Account } from '../../../../models';
import { getTimezones } from '../../utils';

@Component({
  selector: 'account-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss']
})
export class AdminSettingsComponent implements OnInit {
  @Input() info: Account;
  accountForm: FormGroup;

  // Olena added for fixing building errors
  ratings = ['A','B','C','D','E'];
  pTypes = ['Customer', 'Vendor'];
  timezones = getTimezones();
  
  constructor(
    private formBuilder: FormBuilder,
    private accountsService: AccountsService
  ) { }

  ngOnInit() {
    this.accountForm = this.formBuilder.group({
      accountName          : [this.info.accountName, Validators.required],
      parentAccount        : [this.info.parentAccount],
      rating               : [this.info.rating],
      partnerType          : [this.info.partnerType],
      timeZone             : [this.info.timeZone],
      accountExtension     : [this.info.accountExtension],
      website              : [this.info.website],
      shipAddress1         : [this.info.shipAddress1],
      shipAddress2         : [this.info.shipAddress2],
      shipCity             : [this.info.shipCity],
      shipState            : [this.info.shipState],
      shipPostalcode       : [this.info.shipPostalcode],
      shipCountry          : [this.info.shipCountry],
      salesRep             : [this.info.salesRep],
      phone                : [this.info.phone],
      fax                  : [this.info.fax],
      priorSalesRep        : [this.info.priorSalesRep],
      accountType          : [this.info.accountType],
      billAddress1         : [this.info.billAddress1],
      billAddress2         : [this.info.billAddress2],
      billCity             : [this.info.billCity],
      billState            : [this.info.billState],
      billPostalcode       : [this.info.billPostalcode],
      billCountry          : [this.info.billCountry],
      generalInfo          : [this.info.generalInfo],
      taxStatus            : [this.info.taxStatus],
      taxExemptNo          : [this.info.taxExemptNo],
      taxExempt            : [this.info.taxExempt],
      vipDiscountsForOrders: [this.info.vipDiscountsForOrders],
      ytdSales             : [this.info.ytdSales],
      lastYearSales        : [this.info.lastYearSales],
      highCreditLimit      : [this.info.highCreditLimit],
      defaultTaxRate       : [this.info.defaultTaxRate],
      webstoreUrl          : [this.info.webstoreUrl],
  });
  }

  updateAccount() {
    this.accountsService
      .updateAccount({
        id: this.info.id,
        ...this.accountForm.getRawValue()
      })
      .subscribe(response => {
        if (response.status === 'success') {
          this.info = response.extra;
        }
      });
  }

}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';
import { AccountsService } from './accounts.service';
import { GlobalConfigService } from 'app/core/services/global.service';

@Injectable()
export class AccountResolverService implements Resolve<any> {

  constructor(
    private service: AccountsService,
    private globalService: GlobalConfigService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {

    const account_id = route.paramMap.get('account_id');
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
      'sys_vendor_payment_terms_list',
      'sys_leads_channel_list',
      'sys_leads_merchandise_interest_list',
      'sys_leads_contact_type_list'
    ];

    return this.service
      .getAccountDetail(account_id)
      .then((details: any) =>
          Promise.all([
            Promise.resolve(details),
            this.service.getContacts(account_id),
            this.service.getContactsCount(account_id),
            this.service.getTotalCountByPartnerType(details.partnerType),
            this.service.getAccountStats(account_id),
            this.service.getDropdownOptionsForAccount(dropdownOptions),
            this.service.getDisplayMenu(),
            this.service.getTimezonesDropdown(),
            this.globalService.loadSysConfig(),
            this.service.getModuleFields()
          ])
      ).then((data: any) => {
        if (data[0] && data[0].id) {
          this.service.setCurrentAccount(data[0]);
          return Promise.resolve(data);
        } else {
          this.router.navigate(['/accounts']);
        }
      });
  }
}

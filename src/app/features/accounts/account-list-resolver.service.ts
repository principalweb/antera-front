import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';
import { AccountsService } from './accounts.service';
import { Observable, forkJoin } from 'rxjs';

@Injectable()
export class AccountListResolverService implements Resolve<any> {

  constructor(
    private service: AccountsService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

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

    this.service.resetParams();
    if(route.queryParams.parentId) {
      this.service.payload.term.parentId = route.queryParams.parentId;
    } else {
      this.service.resetParams();
    }

    return forkJoin([
      this.service.getAccounts(),
      this.service.getAccountsCount(),
      this.service.getDropdownOptionsForAccount(dropdownOptions),
      this.service.getTimezonesDropdown(),
    ]);;
    
  }
}

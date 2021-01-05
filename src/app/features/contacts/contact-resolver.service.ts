import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router } from '@angular/router';
import { GlobalConfigService } from 'app/core/services/global.service';
import { ContactsService } from 'app/core/services/contacts.service';
import { ProjectDashboardService } from '../dashboards/project/project.service';

@Injectable()
export class ContactResolverService implements Resolve<any> {

  constructor(
    private service: ContactsService,
    private globalService: GlobalConfigService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {

    const id = route.paramMap.get('id');
    const dropdownOptions = [
      'lead_source_dom', 
      'sys_shippacct_list',
      'sys_brand_affiliation_list',
      'sys_annual_budget_list',
      'sys_contact_salutation_list',
      'sys_leads_merchandise_interest_list',
      'sys_leads_contact_type_list',
      'sys_leads_channel_list'
    ];

    return this.service
      .getContactDetails(id)
      .then((details: any) =>
          Promise.all([
            Promise.resolve(details),
            this.service.getDropdownOptionsForContact(dropdownOptions),
            this.service.getContactStats(id),
            this.globalService.loadSysConfig(),
            this.service.getModuleFields()
          ])
      ).then((data: any) => {
        if (data[0] && data[0].id) {
          this.service.setCurrentContact(data[0]);
          return Promise.resolve(data);
        } else {
          this.router.navigate(['/contacts']);
        }
      });
  }
}

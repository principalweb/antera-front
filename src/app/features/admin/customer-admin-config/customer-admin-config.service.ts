import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable()
export class CustomerAdminConfigService {

  constructor() { }
  selectedTabIndex = 0;
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
  {
    if (route.queryParams.prop == 'dropdowns')
      this.selectedTabIndex = 3;
    return of({});
  }
}

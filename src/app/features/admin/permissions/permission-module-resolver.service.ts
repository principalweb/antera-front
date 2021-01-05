import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';

import { PermissionService } from 'app/core/services/permission.service';
import { PermissionEntityType } from 'app/models';

@Injectable({
  providedIn: 'root'
})
export class PermissionModuleResolverService implements Resolve<any> {

    constructor(
        private service: PermissionService,
    ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
      let id = route.paramMap.get('id');

      return this.service.getEntityType(id);
  }
}

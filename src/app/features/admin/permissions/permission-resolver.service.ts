import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';

import { PermissionService } from 'app/core/services/permission.service';
import { ApiService } from 'app/core/services/api.service';
import { PermissionGroup } from 'app/models';

@Injectable()
export class PermissionResolverService implements Resolve<any> {

  constructor(private service: PermissionService, private api: ApiService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let id = route.paramMap.get('id');

    if (id === 'new') {
      return forkJoin([
        of('new'),
        of(new PermissionGroup({}))
      ])
    } else {
        return forkJoin([
          of('edit'),
          this.service.getGroup(id)
        ]);
    }
  }

}

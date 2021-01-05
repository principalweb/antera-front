import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';

import { ProductionsService } from 'app/core/services/productions.service';
import { ApiService } from 'app/core/services/api.service';
import { Production } from 'app/models';

@Injectable()
export class ProductionResolverService implements Resolve<any> {

  constructor(private service: ProductionsService, private api: ApiService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let id = route.paramMap.get('id');

    if (id === 'new') {
      return forkJoin([
        of('new'),
        of(new Production({})),
        this.service.getDesignLocations(),
        this.service.getAllDesignTypes(),
        this.service.getStatusList(),
      ])
    }

    return forkJoin([
      of('edit'),
      this.service.getProduction(id),
      this.service.getDesignLocations(),
      this.service.getAllDesignTypes(),
      this.service.getStatusList(),
    ]);
  }

}

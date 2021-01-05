import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';

import { SourcesService } from 'app/core/services/sources.service';
import { SourceDetails } from 'app/models/source';
import { GlobalConfigService } from 'app/core/services/global.service';
import { ApiService } from 'app/core/services/api.service';

@Injectable()
export class SourceResolverService implements Resolve<any> {
  sourcingId: any;

  constructor(
    private service: SourcesService, 
    private globalService: GlobalConfigService,
    private api: ApiService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let id = route.paramMap.get('id');
    if (id === 'new') {
      return forkJoin([
        of('new'),
        of(new SourceDetails({})),
        this.globalService.loadSysConfig()
      ])
    }

    return forkJoin([
      of('edit'),
      this.service.getSource(id),
      this.globalService.loadSysConfig(),
    ]);
  }

}

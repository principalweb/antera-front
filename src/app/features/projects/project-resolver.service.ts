import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';

import { ProjectsService } from 'app/core/services/projects.service';
import { ApiService } from 'app/core/services/api.service';
import { Project } from 'app/models';
import { GlobalConfigService } from 'app/core/services/global.service';

@Injectable()
export class ProjectResolverService implements Resolve<any> {

  constructor(private service: ProjectsService, private api: ApiService, private globalService: GlobalConfigService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let id = route.paramMap.get('id');

    if (id === 'new') {
      return forkJoin([
        of('new'),
        of(new Project({})),
        this.globalService.loadSysConfig()
      ])
    }

    return forkJoin([
      of('edit'),
      this.service.getProject(id),
      this.globalService.loadSysConfig()
    ]);
  }

}

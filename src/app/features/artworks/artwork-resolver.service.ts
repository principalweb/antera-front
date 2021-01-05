import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';

import { ArtworksService } from 'app/core/services/artworks.service';
import { ApiService } from 'app/core/services/api.service';
import { Artwork } from 'app/models';
import { GlobalConfigService } from 'app/core/services/global.service';

@Injectable()
export class ArtworkResolverService implements Resolve<any> {

  constructor(private service: ArtworksService, private api: ApiService, private globalService: GlobalConfigService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let id = route.paramMap.get('id');

    if (id === 'new') {
      return forkJoin([
        of('new'),
        of(new Artwork({})),
        this.service.getDesignLocations(),
        this.service.getAllDesignTypes(),
        this.service.getAllDesignTypesDetailsOptions(),
        this.service.getStatusList(),
        this.globalService.loadSysConfig()
      ])
    }

    return forkJoin([
      of('edit'),
      this.service.getArtwork(id),
      this.service.getDesignLocations(),
      this.service.getAllDesignTypes(),
      this.service.getAllDesignTypesDetailsOptions(),
      this.service.getStatusList(),
      this.globalService.loadSysConfig()
    ]);
  }

}

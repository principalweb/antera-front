import { Injectable } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class PsService implements Resolve<any> {
  routeParams: any;
  constructor(
    private api: ApiService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any>{
    // this.routeParams = route.queryParams;
    return;
  }

  /*
   * Purchse Order - vendorId
   */
  checkEndpoint(entity, id)
  {
      return new Promise((resolve, reject) => {
        this.api.post("/content/ps-check-endpoint", {entity:entity, vendorId:id})
              .subscribe((response: any) => {
                  resolve(response);
              }, err => reject(err));
      });
  }

  pushPsEntity(entity, vendorId, entityId)
  {
    return new Promise((resolve, reject) => {
      this.api.post("/content/ps-push-entity", {entity: entity, vendorId: vendorId, entityId: entityId})
            .subscribe((response: any) => {
                resolve(response);
            }, err => reject(err));
    });
  }
}

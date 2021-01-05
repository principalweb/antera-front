import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ApiService } from 'app/core/services/api.service';
import { HttpUrlEncodingCodec, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';


export class MyCustomHttpUrlEncodingCodec extends HttpUrlEncodingCodec {
  encodeKey(k: string): string {
    return super.encodeKey(k)
      .replace(new RegExp('%5B', 'g'), '[')
      .replace(new RegExp('%5D', 'g'), ']');
  }
}

abstract class DecoProofStatus {
  static PENDING = 1;
  static DECLINED = 2;
  static APPROVED_WITH_CHANGES = 3;
  static APPROVED = 4;
}

@Injectable({
  providedIn: 'root'
})
export class ArtProofResolverService implements Resolve<any> {
  routeParams: any;
  toState: any;
  source = 'order';

  constructor(
    private api: ApiService
  ) { }

  /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any {
    this.routeParams = route.params;
    if (route.queryParams) {
      if (route.queryParams.status === DecoProofStatus.PENDING) {
        this.toState = route.queryParams.status;
      }
      if (route.queryParams.source && route.queryParams.source === 'artwork') {
        this.source = route.queryParams.source;
      }
    }
    return forkJoin(
      this.getOrder(),
      this.getProofs()
    );
  }


  getOrder() {
    return this.api.getOrderDetails(this.routeParams.id);
  }

  getProofs() {
    let params: HttpParams = new HttpParams({
      encoder: new MyCustomHttpUrlEncodingCodec()
    });
    console.log('this.routeParams');
    console.log(this.routeParams);
    params = params.append('filter[order_id]', this.routeParams.id);
    params = params.append('expand', 'transitions');
    params = params.append('filter[source_type]', this.source);
    return this.api.getArtProofs({
      params: params
    });
  }
}

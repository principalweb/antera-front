import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Injectable()
export class ManageMenuService{

  routeParams: any;
  onDisplayMenuChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(
    private api: ApiService
  ) { }

    /**
   * Resolve
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
  {

      return new Promise((resolve, reject) => {

          Promise.all([
              this.getDisplayMenu()
          ]).then(
              () => {
                  resolve();
              },
              reject
          );
      });
  }

  getDisplayMenu(): Promise<any>
  {
    return new Promise((resolve, reject) => {
      this.api.get('/content/get-display-menu')
          .subscribe((list: any[]) => {
            this.onDisplayMenuChanged.next(list);
            resolve(list);
          }, reject);
    });
  }

  updateMenu(menu)
  {
    return this.api.post('/content/display-menu', menu);
  }
}

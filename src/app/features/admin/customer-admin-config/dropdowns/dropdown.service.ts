import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class DropdownService {

  onDropdownOptionsChanged: BehaviorSubject<any> = new BehaviorSubject({});
  route: ActivatedRouteSnapshot;

  constructor(
    private api: ApiService
  ) { 

  }

      /**
     * The Contacts App Main Resolver
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
      this.route = route;
      return forkJoin([
        this.getDropdownOptions(route.params.name)
      ]);
    }

    getDropdownOptions(optionName) {
      return this.api.getDropdownOptions({dropdown:[optionName]}).pipe(
        map((response: any) => {
          this.onDropdownOptionsChanged.next(response);
          return response;
        })
      );
    }

    createDropdownOption(option) {
      return this.api.createDropdownOption(option).pipe(
        switchMap(() => this.getDropdownOptions(this.route.params.name))
      );
    }

    updateDropdownOption(option) {
      return this.api.updateDropdownOption(option).pipe(
        switchMap(() => this.getDropdownOptions(this.route.params.name))
      );
    }

    deleteDropdownOption(ids) {
      return this.api.deleteDropdownOption(ids).pipe(
        switchMap(() => this.getDropdownOptions(this.route.params.name))
      );
    }
}

import { Injectable } from '@angular/core';
import { EmailTemplate } from 'app/models/email-template';
import { ApiService } from 'app/core/services/api.service';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class EmailTemplateFormResolverService implements Resolve<any> {

  constructor(private api: ApiService) { }


  /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any
    {
        if (route.params.id === 'new') {
            return {};
        }
        return this.api.getEmailTemplate(route.params.id);
    }
}

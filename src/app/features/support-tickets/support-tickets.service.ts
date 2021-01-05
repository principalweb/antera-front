import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { Faq } from 'app/models/faq';
import { AuthService } from 'app/core/services/auth.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class SupportTicketsService implements Resolve<any>
{
    assigneeFilter = [];
    
    constructor(
        private http: HttpClient,
        private api: ApiService ,
        private authService: AuthService
    )
    {
        const signedUser = this.authService.getCurrentUser();
        this.assigneeFilter.push({
            id: signedUser.userId,
            name: `${signedUser.firstName} ${signedUser.lastName}`,
            email: `${signedUser.email}`
        });
    }

    /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        
    }

    getUserAutoCompleteRequest(term) {

        return this.api.post('/content/user-auto-email', {
            search: term,
            permUserId: this.authService.getCurrentUser().userId
        });
    }

}

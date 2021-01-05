import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject } from 'rxjs';

@Injectable()
export class GuidedSessionService implements Resolve<any>
{
    onSessionChanged: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(private http: HttpClient)
    {
    }

    /**
     * The Academy App Main Resolver
     *
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getSession(route.params.sessionId, route.params.sessionSlug)
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    getSession(sessionId, sessionSlug): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.http.get('api/guided-session/' + sessionId + '/' + sessionSlug)
                .subscribe((response: any) => {
                    this.onSessionChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }

}

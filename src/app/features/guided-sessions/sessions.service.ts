import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject } from 'rxjs';

@Injectable()
export class GuidedSessionsService implements Resolve<any>
{
    onCategoriesChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onSessionsChanged: BehaviorSubject<any> = new BehaviorSubject({});

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
                this.getCategories(),
                this.getSessions()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    getCategories(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.http.get('api/session-categories')
                .subscribe((response: any) => {
                    this.onCategoriesChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }

    getSessions(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.http.get('api/guided-sessions')
                .subscribe((response: any) => {
                    this.onSessionsChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }

}

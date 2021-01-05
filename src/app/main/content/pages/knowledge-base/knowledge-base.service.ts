import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject } from 'rxjs';

@Injectable()
export class KnowledgeBaseService implements Resolve<any>
{
    knowledgeBase: any;
    onKnowledgeBaseChanged: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(private http: HttpClient)
    {
    }

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
                this.getKnowledgeBase()
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    /**
     * Get knowledge base
     */
    getKnowledgeBase(): Promise<any[]>
    {
        return new Promise((resolve, reject) => {

            this.http.get('https://s3.amazonaws.com/images.anterasoftware.com/videos/knowledgebase.json')
                .subscribe((response: any) => {
                    this.knowledgeBase = response;
                    this.onKnowledgeBaseChanged.next(this.knowledgeBase);
                    resolve(this.knowledgeBase);
                }, reject);
        });
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { Faq } from 'app/models/faq';
import { AuthService } from 'app/core/services/auth.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class FaqService implements Resolve<any>
{
    onFaqsChanged: BehaviorSubject<Faq[]> = new BehaviorSubject([]);
    onFaqsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

    params = {
        offset: 0,
        order: "dateModified",
        orient: "desc",
        search: "",
        term: { status : ''}
    };

    constructor(
        private http: HttpClient,
        private api: ApiService ,
        private authService: AuthService
    )
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
        return this.getFaqsAndCount();
    }

    getFaqsAndCount()
    {
        return forkJoin([
            this.getFaqs(),
            this.getFaqsCount()
        ]);
    }

    /**
     * Get faqs
     */
    getFaqs()
    {
        return this.api.getFaqsList(this.params).pipe(
            map((response: any) => {
                this.onFaqsChanged.next(response);
                return response;
            })
        );
    }

    getFaqsCount()
    {
        return this.api.getFaqsCount(this.params).pipe(
            map((response: any) => {
                this.onFaqsCountChanged.next(response.count);
                return response;
            })
        );
    }

    createFaq(faq: Faq)
    {
        return this.api.createFaq(faq.toObject()).pipe(
            switchMap(() => this.getFaqsAndCount())
        );
    }

    updateFaq(faq: Faq)
    {
        return this.api.updateFaq(faq.toObject()).pipe(
            switchMap(() => this.getFaqs())
        );
    }

    deleteFaq(faq)
    {
        return this.api.deleteFaqs([faq.id]).pipe(
            switchMap(() => this.getFaqsAndCount())
        );
    }

    updateFaqStatus(params){
        return this.api.updateFaqStatus(params).pipe(
            switchMap(() => this.getFaqs())
        );
    }
}

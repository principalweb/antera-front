import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ApiService } from 'app/core/services/api.service';
import { Observable ,  BehaviorSubject } from 'rxjs';

@Injectable()
export class AcademyCoursesService implements Resolve<any>
{
    onCategoriesChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onCoursesChanged: BehaviorSubject<any> = new BehaviorSubject({});
    loading = false;
    params =
    {
        offset: 0,
        limit: 100,
        order: 'title',
        orient: 'asc',
        term: { }
    }
    
    constructor(
    private http: HttpClient,
    private api: ApiService,
    )
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
        this.loading = true;
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getCategories(),
                this.getCourses()
            ]).then(
                () => {
                    resolve();
                    this.loading = false;
                },
                reject
            );
        });
    }

    getCategories(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.http.get('api/academy-categories')
                .subscribe((response: any) => {
                    this.onCategoriesChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }

    getCourses(): Promise<any>
    {
        this.loading = true;
        return new Promise((resolve, reject) => {
            this.api.getTrainingList(this.params)
                .subscribe((response: any) => {
                    this.onCoursesChanged.next(response);
                    resolve(response);
                    this.loading = false;
                }, reject);
        });
    }

    syncCourses(): Promise<any>
    {
        this.loading = true;
        return new Promise((resolve, reject) => {
            this.api.syncTraining(this.params)
                .subscribe((response: any) => {
                    this.getCourses();
                }, reject);
        });
    }
}

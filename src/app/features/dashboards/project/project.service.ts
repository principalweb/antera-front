import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from 'environments/environment';

@Injectable()
export class ProjectDashboardService implements Resolve<any>
{
    projects: any[];
    widgets: any[];
    widgetData: any;
    widgetMgmData: any;
    widgetArtData: any;

    constructor(
        private http: HttpClient,
        private api: ApiService,
        private auth: AuthService
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

        return new Promise((resolve, reject) => {

            Promise.all([
                this.getProjects(),
                this.getWidgets(),
                this.getWidgetData(),
                this.getManagementWidgetData(),
                this.getArtworkWidgetData()
            ]).then(
                () => {
                    console.log('dashboard data loaded');
                    resolve();
                },
                reject
            );
        });
    }

    getProjects(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.http.get('api/project-dashboard-projects')
                .subscribe((response: any) => {
                    this.projects = response;
                    // remove Management tab if the user isn't an admin or antera admin
                    if (this.auth.getCurrentUser().userType == 'User') {
                      this.projects = response.filter(
                        (el) => el.name != "Management"
                      );
                      this.projects.splice(1 , 1);
                    }
                    resolve(response);
                }, reject);
        });
    }

    getWidgets(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.http.get( 'api/project-dashboard-widgets')
                .subscribe((response: any) => {
                    this.widgets = response;
                    console.log("Widgets ->", response);
                    resolve(response);
                }, reject);
        });
    }

    getWidgetData(): Promise<any>
    {
        const user = this.auth.getCurrentUser();
        return new Promise((resolve, reject) => {
            this.api.post('/widget/get-widgets', { userId: user.userId })
                .subscribe((response: any) => {
                    console.log("Widget Data ->", response);
                    this.widgetData = response;
                    resolve(response);
                });
        });
    }

    getManagementWidgetData(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.get('/widget/get-management-widgets')
                .subscribe((response: any) => {
                    console.log("Widget Mgm Data ->", response);
                    this.widgetMgmData = response;
                    resolve(response);
                });
        });
    }
    getArtworkWidgetData(): Promise<any>
    {
        const user = this.auth.getCurrentUser();
        return new Promise((resolve, reject) => {
            this.api.post('/widget/get-artwork-widgets',{ userId: user.userId })
                .subscribe((response: any) => {                     
                    this.widgetArtData = response;
                    resolve(response);
                });
        });
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';

import { FuseUtils } from '@fuse/utils';

import { Report } from './report.model';
import { ApiService } from '../../core/services/api.service';
import { MessageService } from '../../core/services/message.service';

const searchFields = [
    'reportName', 'createdBy'
];

@Injectable()
export class ReportService implements Resolve<any>
{
    onReportsChanged: BehaviorSubject<Report[]>;
    public onDepartmentsChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onSelectionChanged: BehaviorSubject<string[]>;
    onSearchTextChanged: Subject<any> = new Subject();

    reports: Report[];
    report: Report;

    private _searchText: string;
    private _selection: string[];
    // filterBy: string;

    constructor(
        private http: HttpClient,
        private api: ApiService,
    )
    {
        this.onReportsChanged = new BehaviorSubject([]);
        this.onSelectionChanged = new BehaviorSubject([]);
        this._searchText = '';
        this._selection = [];

        this.onSearchTextChanged.subscribe(val => {
            this._searchText = val;

            this.getReports().then(console.log);
        });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return this.getReports();
    }

    getReports(): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                this.http.post('/protected/content/enabled-reports',{})
                    .subscribe((response: Report[]) => {

                        this.reports = response;
/*                        if ( this._searchText && this._searchText !== '' )
                        {
                            this.reports = FuseUtils.filterFieldsByString(
                                this.reports, this._searchText, searchFields
                            );
                        }*/

                        this.onReportsChanged.next(this.reports);
                        resolve(this.reports);
                    }, reject);
            }
        );
    }

    getDepartment(): Promise<any> {
        return new Promise(
            (resolve, reject) => {
                this.http.get('/protected/content/get-departments')
                    .subscribe((response: any) => {
                        this.onDepartmentsChanged.next(response);
                        resolve(response);
                    }, reject);
            }
        );
    }

    // Temporary filter for reportName only
    getReportsByFilters(reportName, dateCreated, department): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                this.http.post('/protected/content/enabled-reports',{ reportName: reportName , dateCreated: dateCreated, department: department })
                //this.http.get('api/reports')
                    .subscribe((response: Report[]) => {

                        this.reports = response;
  /*                      this.reports = FuseUtils.filterFieldsByString(
                            this.reports, reportName, ['reportName']
                        );*/
                        this.onReportsChanged.next(this.reports);
                        resolve(this.reports);
                    }, reject);
            }
        );
    }

    /**
     * Toggle selected Report by id
     * @param id
     */
    toggleSelected(id) 
    {
        if ( this._selection.length > 0 )
        {
            const index = this._selection.indexOf(id);

            if ( index !== -1 )
            {
                this._selection.splice(index, 1);
                this.onSelectionChanged.next(this._selection);

                return;
            }
        }

        this._selection.push(id);
        this.onSelectionChanged.next(this._selection);
    }

    toggleSelectAll() 
    {
        if ( this._selection.length === this.reports.length) {
            this.deselectAll();
        } else {
            this.selectAll();
        }
    }

    selectAll()
    {
        this._selection = this.reports.map(report => report.id);
        this.onSelectionChanged.next(this._selection);
    }

    deselectAll()
    {
        this._selection = [];
        this.onSelectionChanged.next(this._selection);
    }


    updateReport(report: Report)
    {
        return new Promise((resolve, reject) => {

            this.http.post('api/report/' + report.id, {...report})
                .subscribe(response => {
                    this.getReports().then(resolve, reject);
                });
        });
    }

    deleteSelectedReports()
    {
        this.reports = this.reports.filter(
            report => this._selection.indexOf(report.id) < 0
        );

        this.deselectAll();
        this.onReportsChanged.next(this.reports);
    }


}

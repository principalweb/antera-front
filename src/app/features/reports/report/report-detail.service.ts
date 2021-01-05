import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot, Router, Route, ActivatedRoute } from '@angular/router';
import { ReportService } from '../report.service';
import { HttpClient } from '@angular/common/http';
import { Report } from '../report.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, switchMap, tap } from 'rxjs/operators';


@Injectable()
export class FuseReportDetailService {

    report: Report;
    onReportChanged: BehaviorSubject<any> = new BehaviorSubject({});
    reportId = '';
    reportCode = '';
    fromDate = '';
    toDate = '';
    reportName = '';
    customerId = '';
    contactsId = '';
    representiveId = '';
    vendorId = '';
    paidStatus = '';
    orderStatusId = '';

    filters$: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
    ) {

    }

    getFiltersFromQueryParams() {
        return { ...this.route.snapshot.queryParams, reportId: this.reportId, report: this.reportCode };
    }

    mergeFilters(filters) {
        this.filters$.pipe(
            take(1)
        ).subscribe((prevFilters) => {
            this.filters$.next({ ...prevFilters, ...filters });
        });
    }

    setFilters(filters) {
        this.filters$.next(filters);
    }

    getReportDetail(reportCode, reportId) {
        return this.filters$.pipe(
            take(1),
            switchMap((filters) => {
                const data = {
                    report: reportCode,
                    value: reportId,
                    ...filters
                };
                return this.http.post('/protected/content/show-report', data);
            }),
            tap((response) => {
                this.report = new Report(response);
                this.report.reportName = this.reportName;
                this.report.id = this.reportId;
                this.report.value = reportCode;
                this.onReportChanged.next(this.report);
                return response;
            })
        );
    }

}

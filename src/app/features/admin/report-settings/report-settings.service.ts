import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { Report } from 'app/features/reports/report.model';
import { map, switchMap } from 'rxjs/operators';

@Injectable()

export class ReportSettingService
{

    onReportSettingChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onReportSettingsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

    params = {
        offset: 0,
        limit: 50,
        order:"reportName",
        orient:"asc",
        term: {
            reportName: '',
            reportLabel: '',
            department: '',
            enabled:''
        }
    };

  constructor(
    private api: ApiService,
    private selection: SelectionService
  )
  { }

  getReportsAndCount()
  {
    return forkJoin([
      this.getReports(),
      this.getReportsCount()
    ]);
  }


  getReports()
  {
    return this.api.getAllReports(this.params).pipe(
      map((response: any) => {
        this.onReportSettingChanged.next(
          response.map(report =>
            new Report(report)
          )
        );
        return response;
      }),
    );
  }

  getReportsCount()
  {
    return this.api.getAllReportsCount(this.params).pipe(
      map((response: any) => {
        this.onReportSettingsCountChanged.next(response.count);
        return response;
      }),
    );
  }

  updateEnabled(params)
  {
    return this.api.updateReports(params);
  }


  filter(term) {
    this.params.term = term;
    return this.getReportsAndCount();
  }

  filterAdmin(term) {
    this.params.term = term;
    return this.getAdminReportsAndCount();
  }


  getAdminReportsAndCount()
  {
    return forkJoin([
      this.getAdminReports(),
      this.getAdminReportsCount()
    ]);
  }


  getAdminReports()
  {
    return this.api.getAdminReports(this.params).pipe(
      map((response: any) => {
        this.onReportSettingChanged.next(
          response.map(report =>
            new Report(report)
          )
        );
        return response;
      }),
    );
  }

  getAdminReportsCount()
  {
    return this.api.getAdminReportsCount(this.params).pipe(
      map((response: any) => {
        this.onReportSettingsCountChanged.next(response.count);
        return response;
      }),
    );
  }

  updateAdminEnabled(params)
  {
    return this.api.updateReports(params);
  }

  setPagination(pe) {
    this.params.offset = pe.pageIndex;
    this.params.limit = pe.pageSize;

    return this.getReports();
  }

  sort(se) {
    this.params.order = se.active;
    this.params.orient = se.direction;

    return this.getReports();
  }

  sortAdmin(se) {
    this.params.order = se.active;
    this.params.orient = se.direction;

    return this.getAdminReports();
  }
}

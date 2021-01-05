import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { Subscription, merge, Observable, Subject, BehaviorSubject, of, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { ReportService } from '../report.service';
import { Report } from '../report.model';
import * as moment from 'moment';
import { isNil, isEmpty } from 'lodash';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseReportFilterFormComponent } from '../filter-form/filter-form.component';
import { map, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'fuse-report-list',
    templateUrl: './report-list.component.html',
    styleUrls: ['./report-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FuseReportListComponent implements OnInit, AfterViewInit {
    @Input() departments: string;
    @Input() reports: Report[];
    @ViewChild(MatPaginator) paginator: MatPaginator;

    filterForm: FormGroup;

    dataSource: MatTableDataSource<Report>;
    displayedColumns = ['reportName', 'description', 'department'];

    constructor(
        private fb: FormBuilder,
        private router: Router
    ) {
        this.filterForm = this.fb.group({
            reportName: null,
            description: null,
            department: null
        });

        this.filterForm.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(_ => this.applyFilter())
    }

    ngOnInit() {
        this.dataSource = new MatTableDataSource<Report>(this.reports);
        this.dataSource.filterPredicate = (row, _) => {
            const { reportName, description, department } = this.filterForm.value;
            if (
                (isNil(reportName) || isEmpty(reportName)) &&
                (isNil(description) || isEmpty(description)) &&
                (isNil(department) || isEmpty(department))
            ) return true;

            if (reportName && (row.reportName || '').toLowerCase().indexOf(reportName.toLowerCase()) > -1) {
                return true;
            }

            if (description && (row.description || '').toLowerCase().indexOf(description.toLowerCase()) > -1) {
                return true;
            }

            if (department && row.department.indexOf(department.toLowerCase()) > -1) {
                return true;
            }
        }


    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    applyFilter() {
        this.dataSource.filter = JSON.stringify(this.filterForm.value);
    }

    departmentToString(department: string[]) {
        if (department && department.length) {
            return department.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
        }

        return '';
    }

    viewReport(report) {
        if (report.filters && report.filters.length > 0) {
        }
        else {
            this.router.navigate(['/reports', report.id, report.value], {
                queryParams: {
                    fromDate: moment().startOf('month').format('YYYY-MM-DD'),
                    toDate: moment().endOf('month').format('YYYY-MM-DD'),
//                    fromDate: moment().startOf('month').toISOString(),
//                    toDate: moment().endOf('month').toISOString(),
                    reportName: report.reportName,
                    customer: '',
                    vendor: '',
                    contact: '',
                    salesRep: '',
                    orderStatus: '',
                    paidStatus: ''
                }
            });
        }
    }
}

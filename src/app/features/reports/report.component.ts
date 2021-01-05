import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription, Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PermissionService } from 'app/core/services/permission.service';
import { AuthService } from 'app/core/services/auth.service';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { CreateReportDialogComponent } from './create-report-dialog/create-report-dialog.component';

import { Report } from './report.model';
import { ReportService } from './report.service'
import { debounceTime, distinctUntilChanged, takeUntil, filter, map } from 'rxjs/operators';

@Component({
    selector: 'fuse-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})

export class FuseReportComponent implements OnInit, OnDestroy {
    selectedCount: number;
    searchInput: FormControl;
    onSelectionSubscription: Subscription;
    dialogRef: MatDialogRef<CreateReportDialogComponent>;
    destroyed$: Subject<boolean> = new Subject();
    reports: Report[];
    groupedReports: any;
    departments: string[];

    userAllowedActions = [];
    entityTypes: any = [];
    permissionsEnabled: boolean = false;

    constructor(
        private reportService: ReportService,
        public dialog: MatDialog,
        private permService: PermissionService,
        private authService: AuthService,
    ) {
        this.searchInput = new FormControl('');
    }

    ngOnInit() {
        this.permService.getPermissionStatus(this.authService.getCurrentUser().userId).subscribe((res: any) => {
            if (res == '0' || res == 0 || res == false) {
                res = false
            } else {
                res = true;
            }

            this.permissionsEnabled = res;
        });

        this.permService.getEntityTypes().subscribe((res: any) => {
            this.entityTypes = res;
        });

        this.permService.getUserActions(this.authService.getCurrentUser().userId).subscribe((res: any) => {
            this.userAllowedActions = res.data;
        })
        this.onSelectionSubscription =
            this.reportService.onSelectionChanged
                .subscribe(selection => {
                    this.selectedCount = selection.length;
                });

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
            this.reportService.onSearchTextChanged.next(searchText);
        });

        this.reportService.onReportsChanged.pipe(
            takeUntil(this.destroyed$),
            map((reports: any[]) => reports.filter(report => {
                let notAllowed = report.department.some(d => {
                    return this.reportAllowed(d) == false;
                });
                return !notAllowed
            }))
        ).subscribe((reports: any[]) => {
            this.reports = reports;
            this.groupReports(reports);
        });
    }

/*    groupReports(reports: any[]) {
        this.groupedReports = reports.reduce((groups, report, index) => {
            if (!groups[report.department]) {
                groups[report.department] = [];
            }
            groups[report.department].push(report);
            return groups;
        }, {});
        this.departments = Object.keys(this.groupedReports);
        console.log(this.groupedReports);
    }*/

    groupReports(reports: any[]) {
        this.groupedReports = reports.reduce((groups, report, index) => {
            // const departments = JSON.parse(report.department) || [];
            const departments = report.department;
            //   const departments =  JSON.parse(this.getReportDepartments(report.departments));
            departments.forEach(department => {
                if (!groups[department]) {
                    groups[department] = [];
                }
                groups[department].push(report);
            });
            return groups;
        }, {});
        this.departments = Object.keys(this.groupedReports);
    }

    ngOnDestroy() {
        this.onSelectionSubscription.unsubscribe();
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    clearSearch() {
        if (this.searchInput.value.length > 0)
            this.searchInput.setValue('');
    }

    newReport() {
        this.dialogRef = this.dialog.open(CreateReportDialogComponent, {
            panelClass: 'antera-details-dialog',
            width: '85%',
            height: '85%',
            data: {
                action: 'new',
                service: this.reportService,
            }
        });


    }

    reportAllowed(departmentName) {
        if (this.permissionsEnabled == false) {
            return true;
        }
        // find if the entity type is enabled for reports
        let enabled = this.entityTypes.find(item => item.name == 'Report');
        // lol
        if (enabled && enabled.enabled) {
            // userAllowedactions has only the allowed actions
            let found = this.userAllowedActions.find(item => item.actionName == departmentName);
            if (found) {
                return true;
            }
            // not found
            return false;
        }

        return true;
    }
}

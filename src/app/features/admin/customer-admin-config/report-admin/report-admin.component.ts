import { Component, OnInit,OnDestroy ,ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';
import { ReportSettingService } from 'app/features/admin/report-settings/report-settings.service';
import { ApiService } from 'app/core/services/api.service';
import { FormGroup, FormControl,FormBuilder,Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { SelectionService } from 'app/core/services/selection.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { delay, map } from 'rxjs/operators';
import { find } from 'lodash';
import { ReportDepartmentComponent } from 'app/shared/report-department/report-department.component';

@Component({
  selector: 'app-report-admin',
  templateUrl: './report-admin.component.html',
  styleUrls: ['./report-admin.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class ReportAdminComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    departments = [];
    displayedColumns = ['reportName', 'reportLabel', 'description', 'department','enabled'];
    filterForm: FormGroup;
    checkboxes: any = {};
    reportName = new FormControl('');
    reportLabel = new FormControl('');
    enabled = new FormControl('');
    department = new FormControl('');
    description = new FormControl('');

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dataSource: ReportSettingsDataSource;
    dialogRef: MatDialogRef<ReportDepartmentComponent>;

    loading = false;
    loaded = () => {
        this.loading = false;
    };


  constructor(
    private rs: ReportSettingService,
    private fb: FormBuilder,
    private api: ApiService,
    public selection: SelectionService,
    public dialog: MatDialog

  ) {
        this.filterForm = this.fb.group(this.rs.params.term);
  }

  ngOnInit() {
        this.dataSource = new ReportSettingsDataSource(this.rs);
        this.filterReports();
        const dropdowns = [
            'department_report',
        ];
        this.api.getDropdownOptions({dropdown:dropdowns})
                    .subscribe((res: any[]) => {
                        this.departments = find(res, {name: 'department_report'}).options;
                    });
  }
  ngOnDestroy() {
  }

  updateEnabled(report, ev) {
    ev.stopPropagation();
    if(report.enabled == '1') {
        report.enabled = false;
    } else {
         report.enabled = true;
    }
    this.rs.updateAdminEnabled({id:report.id,enabled:report.enabled,general:'yes'})
                    .subscribe(this.loaded, this.loaded);
  }

  editLabel(report,ev) {
    ev.stopPropagation();
    let dialogRef = this.dialog.open(EditDialogComponent, {
      width: '320px',
      data: { labelName: report.reportLabel }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result)
      {
        return;
      }
      else
      {
        report.reportLabel = result;
        this.rs.updateAdminEnabled({id:report.id, reportLabel:report.reportLabel, description:report.description, department:report.department, enabled:report.enabled, general:'yes'})
                    .subscribe(this.loaded, this.loaded);

      }
    });

  }

 editDescription(report,ev) {
    ev.stopPropagation();
    let dialogRef = this.dialog.open(EditDialogComponent, {
      width: '320px',
      data: { labelName: report.description }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result)
      {
        return;
      }
      else
      {
        report.description = result;
        this.rs.updateAdminEnabled({id:report.id, reportLabel:report.reportLabel, description:report.description, department:report.department, enabled:report.enabled, general:'yes'})
                    .subscribe(this.loaded, this.loaded);

      }
    });

  }
  ConvertToJSON(department: any) {
     return JSON.parse(department);
  }

  editDepartment(report,ev) {
    ev.stopPropagation();
    let dialogRef = this.dialog.open(ReportDepartmentComponent, {
      width: '320px',
      data: { labelName: report.department }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result)
      {
        return;
      }
      else
      {
          report.department = result.value;
          this.rs.updateAdminEnabled({id:report.id, reportLabel:report.reportLabel, description:report.description, department:report.department, enabled:report.enabled, general:'yes'})
                    .subscribe(this.loaded, this.loaded);

      }
    });

  }

  paginate(pe) {
    this.loading = true;
    this.rs.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  sort(se) {
    this.loading = true;
    this.rs.sortAdmin(se)
        .subscribe(this.loaded, this.loaded);
  }


  filterReports()
  {
    this.loading = true;
    this.rs.filterAdmin(this.filterForm.value)
    .subscribe(this.loaded, this.loaded);
    //this.paginator.firstPage();

  }
  onSelectedChange(dropdownId)
  {
      this.selection.toggle(dropdownId);
  }

  toggleAll(ev) {
      this.selection.reset(ev.checked);
  }
}
export class ReportSettingsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private rs: ReportSettingService
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription =
           this.rs.onReportSettingsCountChanged.pipe(
                delay(300),
           ).subscribe(c => {
                this.total = c;
           });

        return this.rs.onReportSettingChanged;

/*        return this.rs.onReportSettingChanged.pipe(
            map((reports) => {
                return reports.map((report) => {
                    report.departmentsLabel = report.department.join(', ');
                    return report;
                });
            })
        );*/
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
@Component({
  selector: 'dialog-overview-example-dialog',
  template: `
  <div mat-dialog-content fxLayout="column">
    <p>Want to change the ? Please type that you want to edit.</p>
    <mat-form-field fxFlex>
        <input matInput tabindex="1" [(ngModel)]="data.labelName">
    </mat-form-field>
  </div>
  <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.labelName" tabindex="2">Ok</button>
      <button mat-button (click)="onNoClick()" tabindex="-1">No Thanks</button>
  </div>
  `
})
export class EditDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

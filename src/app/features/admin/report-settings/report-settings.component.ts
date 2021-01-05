import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable } from 'rxjs';
import { ReportSettingService } from 'app/features/admin/report-settings/report-settings.service';
import { FormGroup, FormControl,FormBuilder,Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionService } from 'app/core/services/selection.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { delay } from 'rxjs/operators';
import { ReportDepartmentComponent } from 'app/shared/report-department/report-department.component';


@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html',
  styleUrls: ['./report-settings.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class ReportSettingsComponent implements OnInit, OnDestroy {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    //@ViewChild(MatSort) sort: MatSort;

    displayedColumns = ['reportName', 'reportLabel', 'description', 'department','enabled'];
  //  onDepartmentChanged: Subscription;
    filterForm: FormGroup;
    checkboxes: any = {};
    reportName = new FormControl('');
    reportLabel = new FormControl('');
    description = new FormControl('');
    enabled = new FormControl('');
    department = new FormControl('');
    dialogRef: MatDialogRef<ReportDepartmentComponent>;


  //  report: Report;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dataSource: ReportSettingsDataSource;

    loading = false;
    loaded = () => {
        this.loading = false;
    };

  constructor(
    private rs: ReportSettingService,
    private fb: FormBuilder,
    public selection: SelectionService,
    public dialog: MatDialog
  ) {
        this.filterForm = this.fb.group(this.rs.params.term);
    }

  ngOnInit() {
        this.dataSource = new ReportSettingsDataSource(this.rs);
        this.filterReports();
  }

  ngOnDestroy() {
//    this.onDepartmentChanged.unsubscribe();
  }

  updateEnabled(report, ev) {
    ev.stopPropagation();
    if(report.enabled == '1') {
        report.enabled = false;
    } else {
         report.enabled = true;
    }
    this.rs.updateEnabled({id:report.id,enabled:report.enabled,general:'no'})
                    .subscribe(this.loaded, this.loaded);
  }
  ConvertToJSON(department: any) {
     return JSON.parse(department);
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
    this.rs.sort(se)
        .subscribe(this.loaded, this.loaded);
  }


  filterReports()
  {
    this.loading = true;
    this.rs.filter(this.filterForm.value)
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

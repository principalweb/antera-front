import { Component, Inject, Input, ViewEncapsulation, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup,  Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Report } from '../report.model';
import { ReportService } from '../report.service';

import { Observable } from 'rxjs';




import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { Router} from '@angular/router';
export interface Animal {
      name: string;
        sound: string;
}
@Component({
  selector: 'app-create-report-dialog',
  templateUrl: './create-report-dialog.component.html',
  styleUrls: ['./create-report-dialog.component.scss'],
  animations: fuseAnimations
})

export class CreateReportDialogComponent implements OnInit,OnDestroy 
{
    selectedValue: string;
    action: string;
    dialogTitle: string;
    departments: any;
    sidenavClicked = false;
    report: Report;
    loading = false;
    reportNameFormGroup: FormGroup;
    columnsFormGroup: FormGroup;
    filtersFormGroup: FormGroup;
    sortFormGroup: FormGroup;
    isEditable = true;
    subscription: any;
                //departments: this.reportService.getDepartment()
  constructor(
        private _formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<CreateReportDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public reportService: ReportService,
        private router: Router,
        private msg: MessageService
  ) { 

    }

  ngOnInit() {
    this.reportNameFormGroup = this._formBuilder.group({
        reportNameCtrl: ['', Validators.required]
    });
    this.columnsFormGroup = this._formBuilder.group({
        columnsCtrl: ['', Validators.required],
        departmentCtrl: ['', Validators.required]
    });
    this.filtersFormGroup = this._formBuilder.group({
        filtersCtrl: ['', Validators.required]
    });
    this.sortFormGroup = this._formBuilder.group({
        sortCtrl: ['', Validators.required]
    });

    this.subscription = this.reportService.onDepartmentsChanged.subscribe(response => {
      this.action = this.data.action;
      this.departments = response;
    });

    this.reportService.getDepartment();

    if ( this.action === 'edit' )
    {
        this.dialogTitle = 'Edit Report';
        this.report = this.data.report;
    }
    else
    {
        this.dialogTitle = 'New Report';
        this.report = new Report({});

    }
  }

  ngOnDestroy()
  {
  }
}

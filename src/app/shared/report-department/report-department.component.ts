import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';
import { find } from 'lodash';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'report-department',
  templateUrl: './report-department.component.html',
  styleUrls: ['./report-department.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ReportDepartmentComponent implements OnInit {

  departmentList = [];
  departments = new FormControl();
  constructor(
    private api: ApiService,
    public dialogRef: MatDialogRef<ReportDepartmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
        const dropdowns = [
            'department_report',
        ];
        this.api.getDropdownOptions({dropdown:dropdowns})
                    .subscribe((res: any[]) => {
                        this.departmentList = find(res, {name: 'department_report'}).options;
         });
  }

}

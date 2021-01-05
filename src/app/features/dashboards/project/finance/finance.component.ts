import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject ,  Observable } from 'rxjs';
import * as shape from 'd3-shape';

import { fuseAnimations } from '@fuse/animations';

import { ProjectDashboardService } from '../project.service';

import {
  salesRepMarginColumns,
  salesRepTopColumns,
  salesRepMarginData,
  salesRepTopData
} from './constants';

@Component({
  selector: 'finance-dashboard',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.scss'],
  animations   : fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class FinanceComponent implements OnInit {
  @Input() widgets: any;
  @Input() enableBudgetSummary: boolean;

  widget5: any = {};
  widget6: any = {};
  widget6_1: any = {};
  widget7: any = {};
  widget8: any = {};
  widget9: any = {};
  widget11: any = {};

  salesRepTopColumns = salesRepTopColumns;
  salesRepMarginColumns = salesRepMarginColumns;

  dataSource1: MatTableDataSource<any>;
  dataSource2: MatTableDataSource<any>;

  constructor(
    private router: Router,
    private projectDashboardService: ProjectDashboardService,
  ) {
    /**
       * Widget 5
       */
    this.widget5 = {
      currentRange: 'TW',
      xAxis: true,
      yAxis: true,
      gradient: false,
      legend: false,
      showXAxisLabel: false,
      xAxisLabel: 'Days',
      showYAxisLabel: false,
      yAxisLabel: 'Isues',
      scheme: {
        domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
      },
      onSelect: (ev) => {
        console.log(ev);
      },
      supporting: {
        currentRange: '',
        xAxis: false,
        yAxis: false,
        gradient: false,
        legend: false,
        showXAxisLabel: false,
        xAxisLabel: 'Days',
        showYAxisLabel: false,
        yAxisLabel: 'Isues',
        scheme: {
          domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
        },
        curve: shape.curveBasis
      }
    };

    /**
     * Widget 6
     */
    this.widget6 = {
      currentRange: 'TW',
      legend: false,
      explodeSlices: false,
      labels: true,
      doughnut: false,
      gradient: false,
      scheme: {
        domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63', '#fdc12d']
      },
      onSelect: (ev) => {
        console.log(ev);
      }
    };

    this.widget6_1 = {
      currentRange: 'TW',
      legend: false,
      explodeSlices: false,
      labels: true,
      doughnut: false,
      gradient: false,
      scheme: {
        domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63', '#fdc12d']
      },
      onSelect: (ev) => {
        console.log(ev);
      }
    };

    /**
     * Widget 7
     */
    this.widget7 = {
      currentRange: 'T'
    };

    /**
     * Widget 8
     */
    this.widget8 = {
      legend: false,
      explodeSlices: false,
      labels: true,
      doughnut: false,
      gradient: false,
      scheme: {
        domain: ['#f44336', '#9c27b0', '#03a9f4', '#e91e63', '#ffc107']
      },
      onSelect: (ev) => {
        console.log(ev);
      }
    };

    /**
     * Widget 9
     */
    this.widget9 = {
      currentRange: 'TW',
      xAxis: false,
      yAxis: false,
      gradient: false,
      legend: false,
      showXAxisLabel: false,
      xAxisLabel: 'Days',
      showYAxisLabel: false,
      yAxisLabel: 'Isues',
      scheme: {
        domain: ['#42BFF7', '#C6ECFD', '#C7B42C', '#AAAAAA']
      },
      curve: shape.curveBasis
    };

  }

  ngOnInit() {
    this.widget11.onContactsChanged = new BehaviorSubject({});
    this.widget11.onContactsChanged.next(this.widgets.widget11.table.rows);
    this.widget11.dataSource = new FilesDataSource(this.widget11);

    this.dataSource1 = new MatTableDataSource(salesRepTopData);
    this.dataSource2 = new MatTableDataSource(salesRepMarginData);
  }

  goto(link) {
    this.router.navigate([link]);
  }
}

export class FilesDataSource extends DataSource<any>
{
  constructor(private widget11) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<any[]> {
    return this.widget11.onContactsChanged;
  }

  disconnect() {
  }
}

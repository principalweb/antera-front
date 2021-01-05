import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataSource } from '@angular/cdk/table';
import * as shape from 'd3-shape';
import { BehaviorSubject, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from 'app/core/services/auth.service';
import { fx2Str, fx2K } from 'app/utils/utils';

@Component({
  selector: 'marketing-dashboard',
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.scss'],
  animations   : fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class MarketingComponent implements OnInit {
  @Input() widgets: any;
  @Input() widgetData: any;
  @Input() enableBudgetSummary: boolean;

  widget5: any = {};
  widget6: any = {};
  widget6_1: any = {};
  widget7: any = {};
  widget8: any = {};
  widget9: any = {};
  widget11: any = {};

  fx2Str = fx2Str;
  fx2K = fx2K;

  constructor(
    private router: Router,
    private auth: AuthService
  ) {
    /**
       * Widget 5
       */
    this.widget5 = {
      currentRange: '2W',
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
      currentRange: '2W',
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
  }

  goto(link, status = '', paymentStatus = '') {
    const user = this.auth.getCurrentUser();
    let queryParams = {};
    switch(link)
    {
      case '/activities':
        if(status=='owned'){
          queryParams = {refType:'User', status: status, userId: user.userId, owner:`${user.firstName} ${user.lastName}`};
        }else if(status=='assigned'){
          queryParams = {refType:'User', status: "Pending", userId: user.userId};
        }else{
          queryParams = {refType:'User', status: status, userId: user.userId};        
        } 
      break;

      case '/leads':
        queryParams = {refType:'User', status: status, userName: `${user.firstName} ${user.lastName}`}
      break;

      case '/e-commerce/quotes':
        queryParams = {refType:'User', status: status, userName: `${user.firstName} ${user.lastName}`}
      break;

      case '/e-commerce/orders':
        queryParams = {refType:'User', status: status, userName: `${user.firstName} ${user.lastName}`, paymentStatus: paymentStatus}
      break;

      case '/opportunities':
        // queryParams = {refType:'User', status: status, userName: `${user.firstName} ${user.lastName}`}
        queryParams = {refType:'User'}
      break;

      case '/artworks':
        queryParams = {refType:'User', status: status, userName: `${user.firstName} ${user.lastName}`}
      break;

      case '/workflow':
        queryParams = {refType:'User', status: status, userName: `${user.firstName} ${user.lastName}`}
      break;


      default:
      break;
    }
    this.router.navigate([link], {queryParams});
  }

  gotoOrdersWithWebstoreType(link, status = []) {
    const user = this.auth.getCurrentUser();
    let queryParams = {refType:'User', orderType: 'StoreOrder', status: status, userName: `${user.firstName} ${user.lastName}`};
    this.router.navigate([link], {queryParams});
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

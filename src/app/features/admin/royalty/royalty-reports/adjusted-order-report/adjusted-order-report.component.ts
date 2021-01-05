import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApiService } from 'app/core/services/api.service';
import { AdjustedVoidRoyalty } from 'app/models';


@Component({
  selector: 'app-adjusted-order-report',
  templateUrl: './adjusted-order-report.component.html',
  styleUrls: ['./adjusted-order-report.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class AdjustedOrderReportComponent implements OnInit , OnDestroy {
  franchiseId = '';
  franchiseName = '';
  franchiseNumber = '';
  month = '';
  fromDate = '';
  toDate  = '';
  createdBy = '';
  path = '';
  onAdjustedOrderReportSubscription: Subscription;
  adjusted: AdjustedVoidRoyalty;
  loading = false;
  constructor(
    private api: ApiService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }


  ngOnInit() {
    this.onAdjustedOrderReportSubscription =  this.activatedRoute.params.subscribe(params => {
        this.franchiseId = params['franchiseId'];
        this.franchiseName = params['franchiseName'];
        this.franchiseNumber = params['franchiseNumber'];
        this.month =  params['month'];
        this.fromDate =  params['fromDate'];
        this.toDate =  params['toDate'];
        this.createdBy =  params['createdBy'];
        this.path = params['path'];
    });
    this.voidReport();
  }

  ngOnDestroy() {
    this.onAdjustedOrderReportSubscription.unsubscribe();
  }

  voidReport() {
        this.loading = true;
        this.adjusted = new AdjustedVoidRoyalty();
        this.adjusted.franchiseName = this.franchiseName;
        this.adjusted.franchiseNumber = this.franchiseNumber;
        this.adjusted.reportName = 'Current Month Void Report';
        this.adjusted.month = this.month;
        var params = {
           franchiseId :  this.franchiseId,
           franchiseName :  this.franchiseName,
           reportName: 'royaltyVoid',
           fromDate: this.fromDate,
           toDate: this.toDate,
           month: this.month, 
           createdBy : this.createdBy,
           path : this.path
        };
        this.api.getRoyaltyReport(params)
                .subscribe((data: any) => {
                   this.adjusted.data = JSON.parse(data)['data'];
                   this.loading = false;
                });
    }

}

import { Component, OnInit } from '@angular/core';
import { AdjustedVoidRoyalty } from 'app/models/royalty';
import { ApiService } from 'app/core/services/api.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-void-minus-report',
  templateUrl: './void-minus-report.component.html',
  styleUrls: ['./void-minus-report.component.scss']
})
export class VoidMinusReportComponent implements OnInit {
  franchiseId = '';
  franchiseName = '';
  franchiseNumber = '';
  month = '';
  fromDate = '';
  toDate  = '';
  createdBy = '';
  path = '';
  onAdjustedOrderReportSubscription: Subscription;
  report: AdjustedVoidRoyalty;
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
        this.report = new AdjustedVoidRoyalty();
        this.report.franchiseName = this.franchiseName;
        this.report.franchiseNumber = this.franchiseNumber;
        this.report.reportName = 'Current Month Void Report';
        this.report.month = this.month;
        var params = {
           franchiseId :  this.franchiseId,
           franchiseName :  this.franchiseName,
           reportName: 'royaltyVoidMinus',
           fromDate: this.fromDate,
           toDate: this.toDate,
           month: this.month, 
           createdBy : this.createdBy,
           path : this.path
        };
        this.api.getRoyaltyReport(params)
                .subscribe((data: any) => {
                   this.report.data = JSON.parse(data)['data'];
                   this.loading = false;
                });
    }

}

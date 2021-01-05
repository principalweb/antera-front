import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApiService } from 'app/core/services/api.service';
import { FranchiseVendorRoyalty } from 'app/models';

@Component({
  selector: 'app-franchise-vendor-report',
  templateUrl: './franchise-vendor-report.component.html',
  styleUrls: ['./franchise-vendor-report.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class FranchiseVendorReportComponent implements OnInit , OnDestroy {
  franchiseId = '';
  franchiseName = '';
  franchiseNumber = '';
  month = '';
  fromDate = '';
  toDate  = '';
  createdBy = '';
  path = '';
  franchise: FranchiseVendorRoyalty;
  onFranchiseVendorReportSubscription: Subscription;
  loading = false;

  constructor(
    private api : ApiService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.onFranchiseVendorReportSubscription =  this.activatedRoute.params.subscribe(params => {
      this.franchiseId = params['franchiseId'];
      this.franchiseName = params['franchiseName'];
      this.franchiseNumber = params['franchiseNumber'];
      this.month =  params['month'];
      this.fromDate =  params['fromDate'];
      this.toDate =  params['toDate'];
      this.createdBy =  params['createdBy'];
      this.path = params['path'];
    });
    this.franchiseVendorReport();
  }

  ngOnDestroy() {
    this.onFranchiseVendorReportSubscription.unsubscribe();
  }

  franchiseVendorReport() {
    this.loading = true;
        var params = {
           franchiseId :  this.franchiseId,
           franchiseName :  this.franchiseName,
           reportName: 'royaltyFranchise',
           month: this.month,
           fromDate: this.fromDate,
           toDate: this.toDate,
           createdBy : this.createdBy,
           path : this.path
        };
        this.franchise = new FranchiseVendorRoyalty();
        this.franchise.franchiseName = this.franchiseName;
        this.franchise.franchiseNumber = this.franchiseNumber;
        this.franchise.reportName = 'Franchise Vendor Report';
        this.franchise.month = this.month;
        this.api.getRoyaltyReport(params)
                .subscribe((data: any) => {
                  this.franchise.data = JSON.parse(data)['data'];
                  this.loading = false;
                });
    }
}

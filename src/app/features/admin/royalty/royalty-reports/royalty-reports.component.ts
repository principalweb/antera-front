import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ApiService } from 'app/core/services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-royalty-reports',
  templateUrl: './royalty-reports.component.html',
  styleUrls: ['./royalty-reports.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class RoyaltyReportsComponent implements OnInit, OnDestroy {

  showTabContent: boolean = false;
  superReport: boolean = false;
  notSuper: boolean = false;
  franchiseId = '';
  franchiseName = '';
  fromDate = '';
  toDate = '';
  createdBy = '';
  onRoyaltyReportSubscription: Subscription;
  month: any;
  path = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.onRoyaltyReportSubscription = this.activatedRoute.params.subscribe(params => {
      this.franchiseId = params['franchiseId'];
      this.franchiseName = params['franchiseName'];
      this.fromDate = params['fromDate'];
      this.toDate = params['toDate'];
      this.month = params['month'];
      this.createdBy = params['createdBy'];
      this.path = params['path'];
//      if(typeof params['superReport'] !== 'undefined') {
      this.superReport = params['superReport'] == 'true';
      this.notSuper = params['notSuper'] == 'true';
//      }
    });
  }

  ngOnDestroy() {
    this.onRoyaltyReportSubscription.unsubscribe();
  }

  reloadTabs() {
    this.showTabContent = false;
    setTimeout(() => this.showTabContent = true, 500);
  }

}

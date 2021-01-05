import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';

import { DatePipe } from '@angular/common';
import { ApiService } from 'app/core/services/api.service';
import { SummaryRoyalty } from 'app/models';
import { MessageService } from 'app/core/services/message.service';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';

@Component({
  selector: 'app-super-summary-report',
  templateUrl: './super-summary-report.component.html',
  styleUrls: ['./super-summary-report.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class SuperSummaryReportComponent implements OnInit,OnDestroy {
  franchiseId = '';
  franchiseName = '';
  franchiseNumber = '';
  month = '';
  fromDate = '';
  toDate  = '';
  createdBy = '';
  path = '';
  loading = false;
  summary: SummaryRoyalty;
  onSuperSummaryReportSubscription: Subscription;

  constructor(
    private datePipe: DatePipe,
    private api : ApiService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private msg: MessageService,
  ) { }

  ngOnInit() {
    this.onSuperSummaryReportSubscription =  this.activatedRoute.params.subscribe(params => {
        this.franchiseId = params['franchiseId'];
        this.franchiseName = params['franchiseName'];
        this.franchiseNumber = params['franchiseNumber'];
        this.month = this.datePipe.transform(new Date(),"yyyy-MM-dd");//params['month'];
        this.fromDate =  params['fromDate'];
        this.toDate =  params['toDate'];
        this.createdBy =  params['createdBy'];
        this.path = params['path'];
     });
    this.superSummaryReport();
  }

  ngOnDestroy() {
    this.onSuperSummaryReportSubscription.unsubscribe();
  }

   downloadCSV() {

      if (this.summary.data.length === 0) {
         this.msg.show('No Data Found', 'error');
         return;
      }

      const options = {
         fieldSeparator: ',',
         quoteStrings: '"',
         decimalseparator: '.',
         showLabels: true,
         showTitle: false,
         title: `${this.summary.reportName}`,
         useBom: true,
         noDownload: false,
         headers: Object.keys(this.summary.data[0]),
         nullToEmptyString: true,
      };

      new Angular5Csv(this.summary.data, this.summary.reportName, options);
   }

   downloadSummary() {
      const params = {
         franchiseId: this.franchiseId,
         franchiseName: this.franchiseName,
         month: this.month,
         fromDate: this.fromDate,
         toDate: this.toDate,
         createdBy: this.createdBy,
         path : this.path
      };

      this.api.downloadRoyaltyReport(params)
         .subscribe(response => this.downloadFile(response, 'application/pdf'));
   }

   /**
   * Method is use to download file.
   * @param data - Array Buffer data
   * @param type - type of the document.
   */
   downloadFile(data: any, type: string) {
      const blob = new Blob([data], { type: type });
      const url = window.URL.createObjectURL(blob);

      const fileLink = document.createElement('a');
      fileLink.href = url;
      fileLink.download = 'RoyaltyReport.pdf';
      fileLink.click();

      // var pwa = window.open(url);
      // if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
      //   alert('Please disable your Pop-up blocker and try again.');
      // }
      URL.revokeObjectURL(url);
   }


  superSummaryReport() {
      this.loading = true;
      var params = {
         franchiseId: this.franchiseId,
         franchiseName: this.franchiseName,
         reportName: 'royalty',
         month: this.month,
         fromDate: this.fromDate,
         toDate: this.toDate,
         createdBy: this.createdBy
      };
      this.summary = new SummaryRoyalty();
      this.summary.franchiseName = this.franchiseName;
      this.summary.franchiseNumber = this.franchiseNumber;
      this.summary.reportName = 'Super Summary Royalty Report';
      this.summary.month = this.month;
      this.api.getRoyaltySuperReport(params)
         .subscribe((data: any) => {
            console.log(data);
            this.summary.data = JSON.parse(data)['data'];
            this.loading = false;
         });
   }

}

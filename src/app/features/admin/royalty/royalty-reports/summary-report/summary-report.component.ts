import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { ApiService } from 'app/core/services/api.service';
import { SummaryRoyalty } from 'app/models';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { MessageService } from 'app/core/services/message.service';

@Component({
   selector: 'app-summary-report',
   templateUrl: './summary-report.component.html',
   styleUrls: ['./summary-report.component.scss'],
   animations: fuseAnimations,
   encapsulation: ViewEncapsulation.None
})

export class SummaryReportComponent implements OnInit, OnDestroy {
   franchiseId = '';
   franchiseName = '';
   franchiseNumber = '';
   month = '';
   fromDate = '';
   toDate = '';
   createdBy = '';
   path = '';
   loading = false;
   summary: SummaryRoyalty;
   onSummaryReportSubscription: Subscription;

   constructor(
      private api: ApiService,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private msg: MessageService
   ) { }

   ngOnInit() {
      this.onSummaryReportSubscription = this.activatedRoute.params.subscribe(params => {
         this.franchiseId = params['franchiseId'];
         this.franchiseName = params['franchiseName'];
         this.franchiseNumber = params['franchiseNumber'];
         this.month = params['month'];
         this.fromDate = params['fromDate'];
         this.toDate = params['toDate'];
         this.createdBy = params['createdBy'];
         this.path = params['path'];
      });
      this.summaryReport();
   }

   ngOnDestroy() {
      this.onSummaryReportSubscription.unsubscribe();
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
      this.loading = false;
      const blob = new Blob([data], { type: type });
      const url = window.URL.createObjectURL(blob);
      const today = moment(new Date()).format('YYYY-MM-DD_HH-mm-ss');
      const now = new Date();
      const month = now.getMonth() + 1;
      //const filename = this.franchiseNumber + '_RR_' + month + '-' + now.getDate() + '-' + now.getFullYear() + '.pdf';
      const filename = 'Summary_'+ this.franchiseNumber + '_RR_'+today+'.pdf';
      const fileLink = document.createElement('a');
      fileLink.href = url;
      fileLink.download = filename;
      fileLink.click();

      // var pwa = window.open(url);
      // if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
      //   alert('Please disable your Pop-up blocker and try again.');
      // }
      URL.revokeObjectURL(url);

      const frmData = new FormData();
      frmData.append('fileUpload[]', new File([blob], filename));
      frmData.append("path", this.path);
      frmData.append("reportFileName", filename);
      frmData.append("month", this.month); 
      this.api.uploadRoyaltyReportsToCloud(frmData)
      .subscribe((res: any) => {
  	    if(res.status=='success'){
  	        this.msg.show(`Succesfully uploaded ${filename}`, 'success');                    
  	    }
  	    this.loading = false;
  	}, (err => {
  	    this.loading = false;
  	}));
  
   }

   summaryReport() {
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
      this.summary.reportName = 'Summary Royalty Report';
      this.summary.month = this.month;
      this.api.getRoyaltyReport(params)
         .subscribe((data: any) => {
            this.summary.data = JSON.parse(data)['data'];
            this.loading = false;
         });
   }

}

import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { ApiService } from 'app/core/services/api.service';
import { InvoiceRoyalty } from 'app/models';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-invoice-report',
  templateUrl: './invoice-report.component.html',
  styleUrls: ['./invoice-report.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class InvoiceReportComponent implements OnInit, OnDestroy {
  franchiseId = '';
  franchiseName = '';
  franchiseNumber = '';
  month ='';
  fromDate = '';
  toDate  = '';
  createdBy = '';
  path = '';
  uploadToCloud = false;
  reportFileName = '';
  onInvoiceReportSubscription: Subscription;
  invoice: InvoiceRoyalty;
  loading = false;

  constructor(
      private api: ApiService,
      private activatedRoute: ActivatedRoute,
      private router: Router,
      private msg: MessageService
  ) { }

  ngOnInit() {
    this.onInvoiceReportSubscription =  this.activatedRoute.params.subscribe(params => {
        this.franchiseId = params['franchiseId'];
        this.franchiseName = params['franchiseName'];
        this.franchiseNumber = params['franchiseNumber'];
        this.month =  params['month'];
        this.fromDate =  params['fromDate'];
        this.toDate =  params['toDate'];
        this.createdBy =  params['createdBy'];
        this.path = params['path'];
    });
    this.invoiceReport();

  }

  ngOnDestroy() {
    this.onInvoiceReportSubscription.unsubscribe();
  }

   invoiceReport() {
        this.loading = true;
        const today = moment(new Date()).format('YYYY-MM-DD_HH-mm-ss');
        const reportFileName = 'Invoice_Report_'+today+'.csv';
        this.invoice = new InvoiceRoyalty();
        this.invoice.month = this.month;
        this.invoice.franchiseName = this.franchiseName;
        this.invoice.franchiseNumber = this.franchiseNumber;
        this.invoice.reportName = 'Invoice Report';
        var params = {
           franchiseId :  this.franchiseId,
           franchiseName :  this.franchiseName,
           reportName: 'royaltytop',
           fromDate: this.fromDate,
           toDate: this.toDate,
           month: this.month,
           createdBy : this.createdBy,
           path : this.path,
           uploadToCloud : (this.uploadToCloud) ? '1' : '0',
           reportFileName : reportFileName
        };
        this.api.getRoyaltyReport(params)
                .subscribe((data: any) => {
                   this.invoice.data = JSON.parse(data)['data'];
                   this.loading = false;
                   if(this.uploadToCloud){
                       var cloudUrl = JSON.parse(data)['cloudUrl'];
                       if(cloudUrl.length > 0){
                         this.msg.show(`Succesfully uploaded to cloud`, 'success');                    
                       }
                   }
                   this.uploadToCloud = false;
                });
    }


    downloadCSV() {

      if (this.invoice.data.length === 0) {
          this.msg.show('No Data Found' , 'error');
          return;
      }
      this.loading = true;
      const options = { 
          fieldSeparator: ',',
          quoteStrings: '"',
          decimalseparator: '.',
          showLabels: true, 
          showTitle: false,
          title: `${this.invoice.reportName}`,
          useBom: true,
          noDownload: false,
          headers: Object.keys(this.invoice.data[0]),
          nullToEmptyString: true,
      };
   
      new Angular5Csv(this.invoice.data, this.invoice.reportName, options);
      this.uploadToCloud = true;
      this.invoiceReport();
   }
}

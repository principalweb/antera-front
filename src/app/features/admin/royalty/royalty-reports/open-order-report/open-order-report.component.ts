import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { ApiService } from 'app/core/services/api.service';
import { OpenOrderRoyalty } from 'app/models';
import { MessageService } from 'app/core/services/message.service';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';

@Component({
  selector: 'app-open-order-report',
  templateUrl: './open-order-report.component.html',
  styleUrls: ['./open-order-report.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})

export class OpenOrderReportComponent implements OnInit,OnDestroy {
  franchiseId = '';
  franchiseName = '';
  franchiseNumber = '';
  month = '';
  fromDate = '';
  toDate  = '';
  createdBy = '';
  path = '';
  loading = false;
  uploadToCloud = false;
  reportFileName = '';
  openorder: OpenOrderRoyalty;
  onOpenOrderReportSubscription: Subscription;

  constructor(
    private datePipe: DatePipe,
    private api : ApiService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private msg: MessageService,
  ) { }

  ngOnInit() {
    this.onOpenOrderReportSubscription =  this.activatedRoute.params.subscribe(params => {
        this.franchiseId = params['franchiseId'];
        this.franchiseName = params['franchiseName'];
        this.franchiseNumber = params['franchiseNumber'];
        this.month = params['month'];//this.datePipe.transform(new Date(),"yyyy-MM-dd");//params['month'];
        this.fromDate =  params['fromDate'];
        this.toDate =  params['toDate'];
        this.createdBy =  params['createdBy'];
        this.path = params['path'];
     });
    this.openReport();
  }

  ngOnDestroy() {
    this.onOpenOrderReportSubscription.unsubscribe();
  }

  openReport() {
        this.loading =true;
        const today = moment(new Date()).format('YYYY-MM-DD_HH-mm-ss');
        const reportFileName = 'Open_Order_Report_'+today+'.csv';
        var params = {
           franchiseId :  this.franchiseId,
           franchiseName :  this.franchiseName,
           reportName: 'royaltyOpen',
           month: this.month,
           fromDate: this.fromDate,
           toDate: this.toDate,
           createdBy : this.createdBy,
           path : this.path,
           uploadToCloud : (this.uploadToCloud) ? '1' : '0',
           reportFileName : reportFileName
        };
        this.openorder = new OpenOrderRoyalty();
        this.openorder.franchiseName = this.franchiseName;
        this.openorder.franchiseNumber = this.franchiseNumber;
        this.openorder.reportName = 'Open Order Report';
        this.openorder.month = this.month;
        this.api.getRoyaltyReport(params)
                .subscribe((data: any) => {
                   this.openorder.data = JSON.parse(data)['data'];
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

      if (this.openorder.data.length === 0) {
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
          title: `${this.openorder.reportName}`,
          useBom: true,
          noDownload: false,
          headers: Object.keys(this.openorder.data[0]),
          nullToEmptyString: true,
      };

      new Angular5Csv(this.openorder.data, this.openorder.reportName, options);
      this.uploadToCloud = true;
      this.openReport();
   }
}

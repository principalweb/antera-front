import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FranchiseDetails } from 'app/models';
import { InvoiceRoyalty } from 'app/models';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { RoyaltyFranchiseComponent } from '../royalty-franchise/royalty-franchise.component';
import { RoyaltyService } from '../royalty.service';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { SelectionService } from 'app/core/services/selection.service';
import { delay } from 'rxjs/operators';
//import { Report } from '../../../reports/report.model';
//import { FuseReportDetailService } from '../../../reports/report/report-detail.service';
import * as moment from 'moment';

@Component({
  selector: 'app-franchise-list',
  templateUrl: './franchise-list.component.html',
  styleUrls: ['./franchise-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations

})

export class FranchiseListComponent implements OnInit, OnDestroy {

    displayedColumns = ['franchiseName', 'franchiseNumber', 'url','generate' ,'buttons'];
   // displayedColumns = ['checkbox', 'franchiseName', 'franchiseNumber', 'url','generate' ,'buttons'];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<RoyaltyFranchiseComponent>;
    filterForm: FormGroup;
    checkboxes: any = {};

  //  report: Report;
    invoice: InvoiceRoyalty;
    dataSource: FranchiseDataSource;
    onFranchiseChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    loading = false;
    loaded = () => {
        this.loading = false;
    };

    monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
          ];


  constructor(
      private royaltyService: RoyaltyService,
      private api: ApiService,
      private auth: AuthService,
     // private reportDetailService: FuseReportDetailService,
      public  dialog: MatDialog,
      private fb: FormBuilder,
      private router: Router,
      private datePipe: DatePipe,
      public  selection: SelectionService
  ) {

        this.filterForm = this.fb.group(this.royaltyService.params.term);
    }

  ngOnInit()
  {
        this.dataSource = new FranchiseDataSource(this.royaltyService);
        this.onFranchiseChangedSubscription =
            this.royaltyService.onFranchiseChanged
                .subscribe(franchises => {
                    this.selection.init(franchises);
                });
        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged
                .subscribe(selection => {
                    this.checkboxes = selection;
                });
  }

  ngOnDestroy()
  {
        this.onFranchiseChangedSubscription.unsubscribe();
  }

  editFranchise(franchise)
  {
        this.api.getFranchiseDetails(franchise.id)
            .subscribe((data: any) => {
                const franchise1 = new FranchiseDetails(data);
                this.dialogRef = this.dialog.open(RoyaltyFranchiseComponent, {
                    panelClass: 'antera-details-dialog',
                    data: {
                        franchise: franchise1,
                        action : 'edit',
                    }
                });

                this.dialogRef.afterClosed()
                    .subscribe(response => {
                        if ( !response )
                        {
                            return;
                        }
                        const actionType: string = response[0];
                        const franchise: FranchiseDetails = response[1];
                        switch ( actionType )
                        {
                            case 'save':
                                this.loading = true;
                                this.royaltyService.updateFranchise(franchise)
                                    .subscribe(this.loaded, this.loaded);
                                break;
                            case 'delete':
                                this.deleteFranchise(franchise);
                                break;
                        }
                    });
            })
    }

    deleteFranchise(franchise)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to Disable? This will Also Restrict to Access Any Existing Reports Related to This Franchise. CAUTION: Adding this Franchise again will NOT Retrieve these Existing reports.';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.loading = true;
                this.royaltyService.deleteFranchise(franchise.id)
                    .subscribe(this.loaded, this.loaded);
            }
            this.confirmDialogRef = null;
        });

    }

    onSelectedChange(franchiseId)
    {
        this.selection.toggle(franchiseId);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterFranchise() {
        this.loading = true;
        this.royaltyService.filter(this.filterForm.value)
            .subscribe(this.loaded, this.loaded);
    }

    clearFilters() {
        this.filterForm.reset();
        this.filterFranchise();
    }

    sort(se) {
        this.royaltyService.sort(se)
            .subscribe(this.loaded, this.loaded);
    }

    paginate(pe) {
        this.royaltyService.setPagination(pe)
            .subscribe(this.loaded, this.loaded);
    }

    tooltip(franchise) {
        return 'Name: ' + franchise.franchiseName + '\n' +
               'Number: ' + franchise.franchiseNumber;
    }

    hasLiveDate(liveDate): boolean 
    {
        if(liveDate) {
            if((liveDate  === '0000-00-00') || (liveDate  === '0000-00-00 00:00:00')) {
                return false;
            }
            return true;
        }
        return false;
    }


    getListofMonthsFromLiveDate(liveDate) {
        var started = moment(liveDate, 'YYYY-MM-DD');
        var cursor = moment().startOf('month');
        var list = [];

        //if needed to filter for current year add logic cursor.isSame(started, 'year'); 
        //filter for  last 6 month add logic moment().subtract(6, 'months'); 
         let diff = moment().diff(started, 'months');
         if(diff > 6) {
             started =  moment().subtract(6, 'months');
         }
        while (!cursor.isSame(started, 'month')) {
            cursor.subtract(1, 'month');
            list.push(cursor.clone().format('MMMM, YYYY'));
        }
        return list;
    }

    generatePreviousReport(franchise,month) {
        var firstDay = this.datePipe.transform(new Date(month),"yyyy-MM-dd");
        var ld =  moment(firstDay, 'YYYY-MM-DD').endOf('month');
        var lastDay = ld.format('YYYY-MM-DD');
        var params = {
           franchiseId :  franchise.id,
           franchiseName :  franchise.franchiseName,
           franchiseNumber :  franchise.franchiseNumber,
           month: month,
           fromDate: firstDay,
           toDate: lastDay,
           superReport : false,
           notSuper : true,
           createdBy : this.auth.getCurrentUser().userId,
           path : this.extractHostname(franchise.url),
        };
        this.router.navigate(['/admin/royalty/royalty-reports', params ]);
    }

    generateReport(franchise) {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()-1;
        if(month < 0) { // for Januay 1 running report for December Last Year
          month = 11;
          year = year - 1;
        }
        var firstDay = this.datePipe.transform(new Date(year, month, 1),"yyyy-MM-dd");
        var lastDay =  this.datePipe.transform(new Date(year, month + 1, 0),"yyyy-MM-dd");
        var params = {
           franchiseId :  franchise.id,
           franchiseName :  franchise.franchiseName,
           franchiseNumber :  franchise.franchiseNumber,
           month: this.monthNames[month] + ', ' + year,
           fromDate: firstDay,
           toDate: lastDay,
           superReport : false,
           notSuper : true,
           createdBy : this.auth.getCurrentUser().userId,
           path : this.extractHostname(franchise.url),
        };
        this.router.navigate(['/admin/royalty/royalty-reports', params ]);
    }

/*    superSummaryReport() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth()-1;
        if(month < 0) { // for Januay 1 running report for December Last Year
          month = 11;
          year = year - 1;
        }
        var firstDay = this.datePipe.transform(new Date(year, month, 1),"yyyy-MM-dd");
        var lastDay =  this.datePipe.transform(new Date(year, month + 1, 0),"yyyy-MM-dd");
        var params = {
           franchiseId : '',
           franchiseName : '',
           franchiseNumber :  '',
           month: this.monthNames[month] + ', ' + year,
           fromDate: firstDay,
           toDate: lastDay,
           superReport : true,
           createdBy : this.auth.getCurrentUser().userId
        };
        this.router.navigate(['/admin/royalty/royalty-reports', params ]);
    }*/

    extractHostname(url: string) {
        if(url){
        let hostname: String;
        if (url.indexOf("//") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }
        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
        return hostname;
    }
    }

}

export class FranchiseDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private royaltyService: RoyaltyService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.royaltyService.onFranchiseCountChanged.pipe(
                delay(300)
            ).subscribe(c => {
                this.total = c;
            });

        return this.royaltyService.onFranchiseChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }

}

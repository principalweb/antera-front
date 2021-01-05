import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

import { Subscription } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FranchiseListComponent } from './franchise-list/franchise-list.component';
import { RoyaltyFranchiseComponent } from './royalty-franchise/royalty-franchise.component';
import { CapListComponent } from './royalty-caps/cap-list/cap-list.component';
import { RoyaltyCapsComponent } from './royalty-caps/royalty-caps.component';

import { MessageService } from 'app/core/services/message.service';

import { FranchiseDetails } from 'app/models';
import { CapDetails } from 'app/models';
import { RoyaltyService } from './royalty.service';
import { AuthService } from 'app/core/services/auth.service';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { Router } from '@angular/router';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-royalty',
  templateUrl: './royalty.component.html',
  styleUrls: ['./royalty.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})

export class RoyaltyComponent implements OnInit {

    searchInput: FormControl;
    dialogRef: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    loading = false;
    monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
          ];


    showTabContent: boolean = false;

 @ViewChild(FranchiseListComponent) franchiseList: FranchiseListComponent;

  constructor(
        private royaltyService: RoyaltyService,
        public dialog: MatDialog,
        private msg: MessageService,
        private auth: AuthService,
        public selection: SelectionService,
        private datePipe: DatePipe,
        private api: ApiService,
        private router: Router,
  ) {
        this.searchInput = new FormControl('');
    }

  ngOnInit() {
        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
            this.royaltyService.search(searchText);
        });
  }

 /* reloadTabs() {
    this.showTabContent = false;
    setTimeout(() => this.showTabContent = true, 500);
  }*/


  clearSearch(){
      if (this.searchInput.value.length > 0)
        this.searchInput.setValue('');
  }

  clearFilters() {
      //  this.royaltyService.viewMyItems = false;
        //if (this.royaltyService.params.term.salesRepId)
        //    this.royaltyService.params.term.salesRepId = '';
        this.franchiseList.clearFilters();
  }

 /*   changeShowMyItems(ev) {
        const userId = this.auth.getCurrentUser().userId;
        this.franchiseList.loading = true;
        this.royaltyService.filterViewMyItem(userId)
            .subscribe((res) => {
                this.franchiseList.loading = false;
            });
    }*/

    capList() {
        this.dialogRef = this.dialog.open(RoyaltyCapsComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'new'
            }
        });
        this.dialogRef.afterClosed()
            .subscribe((cap: CapDetails) => {
                if ( !cap ) return;

                this.franchiseList.loading = true;
                this.royaltyService.createCap(cap)
                    .subscribe(() => {
                        this.msg.show('Royalty Program listed successfully', 'success');
                        this.franchiseList.loading = false;
                    }, err => {
                        this.msg.show('Error occurred listing a Royalty Program', 'error');
                        this.franchiseList.loading = false;
                    });
            });


    }

    newFranchise()
    {
        this.dialogRef = this.dialog.open(RoyaltyFranchiseComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'new'
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((franchise: FranchiseDetails) => {
                if ( !franchise ) return;

                this.franchiseList.loading = true;
                this.royaltyService.createFranchise(franchise)
                    .subscribe(() => {
                        this.msg.show('Franchise listed successfully', 'success');
                        this.franchiseList.loading = false;
                    }, err => {
                        this.msg.show('Error occurred listing a Franchise', 'erro');
                        this.franchiseList.loading = false;
                    });
            });

    }

    superSummaryReport() 
    {
//        this.franchiseList.superSummaryReport();
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
           notSuper : false,
           createdBy : this.auth.getCurrentUser().userId
        };
        this.router.navigate(['/admin/royalty/royalty-reports', params ]);
    }
/*    deleteSelectedFranchise()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to disable all selected Franchise?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.franchiseList.loading = true;
                this.royaltyService.deleteSelectedFranchise()
                    .subscribe(() => {
                        this.msg.show('Selected Franchise disabled successfully', 'success');
                        this.franchiseList.loading = false;
                    }, err => {
                        this.msg.show('Error occurred while disabling selected Franchise', 'error');
                        this.franchiseList.loading = false;
                    });
            }
            this.confirmDialogRef = null;
        });
    }*/

}

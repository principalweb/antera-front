import { Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';

import { CapDetails } from 'app/models';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
//import { RoyaltyFranchiseComponent } from '../../royalty-franchise/royalty-franchise.component';
import { RoyaltyService } from '../../royalty.service';
import { ApiService } from 'app/core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { delay } from 'rxjs/operators';



@Component({
  selector: 'app-cap-list',
  templateUrl: './cap-list.component.html',
  styleUrls: ['./cap-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations

})
export class CapListComponent implements OnInit, OnDestroy {
    displayedColumns = ['capCode', 'capCycle', 'capPercent', 'capMin', 'capMax', 'adPercent', 'adMin'];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  //  dialogRef: MatDialogRef<RoyaltyFranchiseComponent>;
    filterForm: FormGroup;
    checkboxes: any = {};

    dataSource: CapDataSource;
    onCapChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;



    loading = false;
    loaded = () => {
        this.loading = false;
    };

  constructor(
      private royaltyService: RoyaltyService,
      private api: ApiService,
      public dialog: MatDialog,
      private fb: FormBuilder,
      public selection: SelectionService

  ) {

   //   this.royaltyService.getCapAndCount();

        this.filterForm = this.fb.group(this.royaltyService.capParams.term);
    }

  ngOnInit()
  {

        this.dataSource = new CapDataSource(this.royaltyService);
        this.onCapChangedSubscription =
            this.royaltyService.getCapAndCount()
                .subscribe(caps => {
                  //console.log(caps);
                    this.selection.init(caps);
                });
        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged
                .subscribe(selection => {
                    this.checkboxes = selection;
                });
  }

  ngOnDestroy()
  {
       // this.onCapChangedSubscription.unsubscribe();
  }

/*    editFranchise(franchise)
    {
        this.api.getCapDetails(franchise.id)
            .subscribe((data: any) => {
                const franchise1 = new CapDetails(data);
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
                        const franchise: CapDetails = response[1];
                        switch ( actionType )
                        {
                            case 'save':
                                this.loading = true;
                                this.royaltyService.updateCap(franchise)
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

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

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
*/
    onSelectedChange(capId)
    {
        this.selection.toggle(capId);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterCap() {
        this.loading = true;
        this.royaltyService.filterCap(this.filterForm.value)
            .subscribe(this.loaded, this.loaded);
    }

    clearFilters() {
        this.filterForm.reset();
        this.filterCap();
    }

    sort(se) {
        this.royaltyService.sortCap(se)
            .subscribe(this.loaded, this.loaded);
    }

    paginate(pe) {
        this.royaltyService.setPaginationCap(pe)
            .subscribe(this.loaded, this.loaded);
    }

    tooltip(cap) {
        return 'Code: ' + cap.capCode + '\n' +
               'Percent: ' + cap.capPercent;
    }

}

export class CapDataSource extends DataSource<any>
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
            this.royaltyService.onCapCountChanged.pipe(
                delay(300)
            ).subscribe(c => {
                this.total = c;
            });

        return this.royaltyService.onCapChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }

}

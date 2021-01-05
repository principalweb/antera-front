import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { LogisticFormDialogComponent } from './logistics-form/logistics-form.component';
import { OrderFormDialogComponent } from '../../shared/order-form-dialog/order-form-dialog.component';
import { ApiService } from '../../core/services/api.service';
import { SelectionService } from 'app/core/services/selection.service';
import { unionBy } from 'lodash';
import { LogisticsService } from 'app/core/services/logistics.service';
import { AuthService } from 'app/core/services/auth.service';
import { LogisticListComponent } from './logistics-list/logistics-list.component';
import { SourceFormComponent } from '../e-commerce/sources/source-form/source-form.component';
import { SourceDetails } from 'app/models/source';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
    selector     : 'logistics-logistics',
    templateUrl  : './logistics.component.html',
    styleUrls    : ['./logistics.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LogisticsComponent implements OnInit, OnDestroy
{
    view = 'kanban-condensed';
    selectedDue = 'Show All';
    assignees = [];
    selectedAssignees = [];
    assigneeSearch = new FormControl('');
    onAssigneeSearch: Subscription;
    isLoading = false;

    searchInput: FormControl;
    dialogRef: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    onViewChangedSubscription: any;

    viewMyItems = false;

    @ViewChild(LogisticListComponent) opporList: LogisticListComponent;

    loading = false;
    loaded = () => {
        this.loading = false;
    };

    constructor(
        private LogisticsService: LogisticsService,
        private router: Router,
        public dialog: MatDialog,
        private api: ApiService,
        public selection: SelectionService,
        private auth: AuthService
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
        this.selectedAssignees = this.LogisticsService.assigneeFilter;
        this.assignees = this.selectedAssignees;

        this.onViewChangedSubscription =
            this.LogisticsService.onViewChanged
                .subscribe(view => this.view = view);
        
        this.onAssigneeSearch =
            this.assigneeSearch.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(searchText => {
                    this.isLoading = true;
                    return this.LogisticsService.getUserAutoCompleteRequest(searchText)
                })
            ).subscribe((users: any[]) => {
                this.isLoading = false;

                this.assignees = unionBy([
                    ...this.selectedAssignees,
                    ...users
                ]);
            });
    }

    ngOnDestroy()
    {
        this.onViewChangedSubscription.unsubscribe();
    }

    newLogistic()
    {
        this.dialogRef = this.dialog.open(LogisticFormDialogComponent, {
            panelClass: 'logistics-form-dialog',
            data      : {
                action: 'new',
                service: this.LogisticsService
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if ( !response )
                {
                    return;
                }

                this.LogisticsService.createLogistic(response)
                    .subscribe(() => {})
            });
    }

    newSource() {
        this.LogisticsService.getLogistic(this.selection.selectedIds[0])
            .subscribe((logistic: any) => {
                this.dialogRef = this.dialog.open(SourceFormComponent, {
                    panelClass: 'antera-details-dialog',
                    data      : {
                        logistic: logistic,
                        action : 'new',
                    }
                });
        
                this.dialogRef.afterClosed()
                .subscribe((sourceDetails: SourceDetails) => {
                    if (!sourceDetails) return;
                    this.loading = true;
                    this.api.createSource(sourceDetails.toObject())
                        .subscribe((res: any) => {
                            this.loading = false;
                            this.router.navigate(['/e-commerce/sources', res.extra.id]);
                        }, ()=> {
                            this.loading = false;
                        });
                });
            });
    }

    newOrder(type)
    {
        const logistic = this.LogisticsService
            .getLogisticFromList(this.selection.selectedIds[0]);

        forkJoin([
            this.api.getAccountDetails(logistic.accountId),
            this.api.getContactDetails(logistic.contactId)
        ]).subscribe(result => {
            const orderDlgRef = this.dialog.open(OrderFormDialogComponent, {
                panelClass: 'antera-details-dialog',
                data: {
                    action: 'new',
                    account: result[0],
                    contact: result[1],
                    logisticNo: logistic.logisticNo,
                    type: type
                }
            });
          
            orderDlgRef.afterClosed()
                .subscribe(data => {
                    if (data && data.order && data.order.id) {
                        this.router.navigate([`/e-commerce/${type}s`, data.order.id]);
                    }
                });
        });
    }

    deleteLogistics(ids) {
        if (this.confirmDialogRef) {
            return;
        }

        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this logistic?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.LogisticsService.deleteLogistics(ids)
                    .subscribe(() => {})
            }
            this.confirmDialogRef = null;
        });
    }

    deleteSelectedLogistics() {
        this.deleteLogistics(this.selection.selectedIds);
    }

    clearSearch(){
      if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');
    }

    changeView(ev) {
        this.LogisticsService.onViewChanged.next(ev.value);
    }

    changeAssignees() {
        this.LogisticsService.filterByAssignees(this.selectedAssignees);
    }

    changeDue(ev) {
        this.selectedDue = ev.value;
        this.LogisticsService.filterByDue(this.selectedDue);
    }

    clearAssigneeFilters() {
        this.selectedAssignees = [];
        this.assignees = [];
        this.LogisticsService.assigneeFilter = [];
        this.selectedDue = "Show All";
        this.LogisticsService.due = "Show All";
        this.LogisticsService.filterByAssignees(this.selectedAssignees);
    }

    clearFilters() {
        this.searchInput.setValue('');
        this.viewMyItems = false;
        this.LogisticsService.resetParams();
        this.opporList.loading = true;
        this.LogisticsService.getLogisticsWithCount()
            .subscribe((res) => {
                this.opporList.loading = false;
            }, (err) => {
                this.opporList.loading = false;
            });
    }

    // changeShowMyItems(ev) {
    //     if (this.viewMyItems)
    //         this.LogisticsService.params.term.salesRepId = this.auth.getCurrentUser().userId;
    //     else 
    //         this.LogisticsService.params.term.salesRepId = '';
    //     this.opporList.loading = true;
    //     this.LogisticsService.getLogisticsWithCount()
    //         .subscribe((res) => {
    //             this.opporList.loading = false;
    //         }, (err) => {
    //             this.opporList.loading = false;
    //         });
    // }
}

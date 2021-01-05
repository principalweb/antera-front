import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable, forkJoin } from 'rxjs';
import { each, find } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { LogisticFormDialogComponent } from '../logistics-form/logistics-form.component';
import { Logistic } from '../../../models';
import { SelectionService } from 'app/core/services/selection.service';
import { LogisticsService } from 'app/core/services/logistics.service';
import { delay, map } from 'rxjs/operators';

@Component({
    selector     : 'logistics-logistics-list',
    templateUrl  : './logistics-list.component.html',
    styleUrls    : ['./logistics-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LogisticListComponent implements OnInit, OnDestroy
{
    @Output() delete = new EventEmitter();
    @ViewChild('dialogContent') dialogContent: TemplateRef<any>;

    dataSource: LogisticDataSource;
    displayedColumns = ['checkbox', 'orderId', 'modifiedByName', 'etd', 'customsCleared', 'inRoute', 'eta', 'adt', 'plannedDeliveryDate','POD', 'buttons'];

    checkboxes: {};
    itemCount = 0;

    onSelectionChangedSubscription: Subscription;
    onLogisticsChangedSubscription: Subscription;

    dialogRef: any;
    filterForm: FormGroup;
    businessTypes = [];
    loading = false;

    constructor(
        private logisticsService: LogisticsService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        public selection: SelectionService
    ) {

        this.filterForm = this.fb.group(this.logisticsService.params.term);

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged.subscribe(selection => {
                this.checkboxes = selection;
            })

        this.onLogisticsChangedSubscription =
            this.logisticsService.onLogisticsChanged
                .subscribe(logistics => {
                    this.checkboxes = {};
                    logistics.map(contact => {
                        this.checkboxes[contact.id] = false;
                    });
                    this.itemCount = logistics.length;
                });

        this.dataSource = new LogisticDataSource(logisticsService);
    }

    ngOnInit()
    {
        // const fields = [
        //     'orderId', 'modifiedByName', 'contactName', 'etd', 'salesStage',
        //     'amount', 'salesRep', 'dateCreated', 'user', 'dateClosed', 'logisticType'
        // ];
        // each(fields, f => {
        //     this.filterForm.get(f)
        //         .valueChanges
        //         .debounceTime(300)
        //         .distinctUntilChanged()
        //         .subscribe(() => {
        //             this.filterlogistics();
        //         })
        // });

        this.loading = true;
        this.logisticsService.getLogisticsWithCount()
            .subscribe(() => {
                this.loading = false;
            })
    }

    ngOnDestroy()
    {
        this.onLogisticsChangedSubscription.unsubscribe();
    }

    editLogistic(logistic)
    {
        this.loading = true;
        this.logisticsService.getLogistic(logistic.id)
            .subscribe(data => {
                this.loading = false;

                const logistic1 = new Logistic(data);
                this.dialogRef = this.dialog.open(LogisticFormDialogComponent, {
                    panelClass: 'logistics-form-dialog',
                    data      : {
                        logistic: logistic1,
                        action : 'edit',
                        service: this.logisticsService
                    }
                });
        
                this.dialogRef.afterClosed()
                    .subscribe(response => {
                        if ( !response ) return;
        
                        switch ( response[0] )
                        {
                            case 'save':
                                this.updatelogistic(response[1]);
                                break;
                            case 'delete':
                                this.deletelogistic(logistic);
                                break;
                        }
                    });
            });
    }


    deletelogistic(logistic)
    {
        this.delete.emit([logistic.id]);
    }

    updatelogistic(logistic)
    {
        this.loading = true;
        this.logisticsService.updateLogistic(logistic)
            .subscribe(() => {
                this.loading = false;
            });
    }

    onSelectedChange(logisticId)
    {
        this.selection.toggle(logisticId);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterlogistics() {
        const filters = this.filterForm.value;
        this.logisticsService.setFilters(filters);
        
        this.loading = true;
        forkJoin([
            this.logisticsService.getLogistics(),
            this.logisticsService.getLogisticsCount()
        ]).subscribe(() => {
            this.loading = false;
        });
    }

    sort(sortEvent) {
        this.logisticsService.setSortData(sortEvent);

        this.loading = true;
        this.logisticsService.getLogistics()
            .subscribe(() => {
                this.loading = false;
            });
    }

    paginate(pageEvent) {
        this.logisticsService.setPagination(pageEvent);

        this.loading = true;
        this.logisticsService.getLogistics()
            .subscribe(() => {
                this.loading = false;
            });
    }
}

export class LogisticDataSource extends DataSource<any> {
    total = 0;
    totalSubscription: Subscription;

    constructor(private service: LogisticsService) {
        super();
    }

    connect(): Observable<any[]> {
        this.totalSubscription = this.service.onTotalCountChanged.pipe(
            delay(100),
        ).subscribe(total => {
            this.total = total;
        });

        return this.service.onLogisticsChanged.pipe(
            map(logistics => {
                const stages = this.service.onStagesChanged.value;

                return logistics.map(
                    logistic => {
                        const stage = find(stages, {stageKey: logistic.salesStage});
                        if (stage) {
                            logistic.salesStageName = stage.stage;
                        }

                        return logistic;
                    }
                )
            }),
        );
    }

    disconnect() {
        this.totalSubscription.unsubscribe();
    }
}

import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable, forkJoin } from 'rxjs';
import { each, find } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { OpportunityFormDialogComponent } from '../opportunity-form/opportunity-form.component';
import { OpportunityDetails } from '../../../models';
import { SelectionService } from 'app/core/services/selection.service';
import { OpportunitiesService } from 'app/core/services/opportunities.service';
import { debounceTime, distinctUntilChanged, delay, map } from 'rxjs/operators';

@Component({
    selector     : 'opportunities-opportunity-list',
    templateUrl  : './opportunity-list.component.html',
    styleUrls    : ['./opportunity-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class OpportunityListComponent implements OnInit, OnDestroy
{
    @Output() delete = new EventEmitter();
    @ViewChild('dialogContent') dialogContent: TemplateRef<any>;

    dataSource: OpportunityDataSource;
    displayedColumns = ['checkbox', 'name', 'accountName', 'contactName', 'leadSource', 'type', 'salesStage', 'amount', 'salesRep','dateClosed', 'user', 'dateCreated', 'buttons'];

    checkboxes: {};
    itemCount = 0;

    onSelectionChangedSubscription: Subscription;
    onOpportunitiesChangedSubscription: Subscription;

    dialogRef: any;
    filterForm: FormGroup;
    businessTypes = [];
    loading = false;

    constructor(
        private opportunitiesService: OpportunitiesService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        public selection: SelectionService
    ) {

        this.filterForm = this.fb.group(this.opportunitiesService.params.term);

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged.subscribe(selection => {
                this.checkboxes = selection;
            })

        this.onOpportunitiesChangedSubscription =
            this.opportunitiesService.onOpportunitiesChanged
                .subscribe(opportunities => {
                    this.checkboxes = {};
                    opportunities.map(contact => {
                        this.checkboxes[contact.id] = false;
                    });
                    this.itemCount = opportunities.length;

                    this.selection.init(opportunities);
                });

        this.dataSource = new OpportunityDataSource(opportunitiesService);
    }

    ngOnInit()
    {
        const fields = [
            'name', 'accountName', 'contactName', 'leadSource', 'salesStage',
            'amount', 'salesRep', 'dateCreated', 'user', 'dateClosed', 'opportunityType'
        ];
        each(fields, f => {
            this.filterForm.get(f)
                .valueChanges.pipe(
                    debounceTime(300),
                    distinctUntilChanged(),
                ).subscribe(() => {
                    this.filterOpportunities();
                });
        });

        this.loading = true;
        this.opportunitiesService.getOpportunitiesWithCount()
            .subscribe(() => {
                this.loading = false;
            })

    }

    ngOnDestroy()
    {
        this.onOpportunitiesChangedSubscription.unsubscribe();
    }

    editOpportunity(opportunity)
    {
        this.loading = true;
        this.opportunitiesService.getOpportunity(opportunity.id)
            .subscribe(data => {
                this.loading = false;

                const opportunity1 = new OpportunityDetails(data);
                this.dialogRef = this.dialog.open(OpportunityFormDialogComponent, {
                    panelClass: 'opportunity-form-dialog',
                    data      : {
                        opportunity: opportunity1,
                        action : 'edit',
                        service: this.opportunitiesService
                    }
                });
        
                this.dialogRef.afterClosed()
                    .subscribe(response => {
                        if ( !response ) return;
        
                        switch ( response[0] )
                        {
                            case 'save':
                                this.updateOpportunity(response[1]);
                                break;
                            case 'delete':
                                this.deleteOpportunity(opportunity);
                                break;
                        }
                    });
            });
    }


    deleteOpportunity(opportunity)
    {
        this.delete.emit([opportunity.id]);
    }

    updateOpportunity(opportunity)
    {
        this.loading = true;
        this.opportunitiesService.updateOpportunity(opportunity)
            .subscribe(() => {
                this.loading = false;
            });
    }

    onSelectedChange(opportunityId)
    {
       this.selection.toggle(opportunityId);
        console.log(this.selection.selectedIds);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterOpportunities() {
        const filters = this.filterForm.value;
        this.opportunitiesService.setFilters(filters);
        
        this.loading = true;
        forkJoin([
            this.opportunitiesService.getOpportunities(),
            this.opportunitiesService.getOpportunitiesCount()
        ]).subscribe(() => {
            this.loading = false;
        });
    }

    sort(sortEvent) {
        this.opportunitiesService.setSortData(sortEvent);

        this.loading = true;
        this.opportunitiesService.getOpportunities()
            .subscribe(() => {
                this.loading = false;
            });
    }

    paginate(pageEvent) {
        this.opportunitiesService.setPagination(pageEvent);

        this.loading = true;
        this.opportunitiesService.getOpportunities()
            .subscribe(() => {
                this.loading = false;
            });
    }
}

export class OpportunityDataSource extends DataSource<any> {
    total = 0;
    totalSubscription: Subscription;

    constructor(private service: OpportunitiesService) {
        super();
    }

    connect(): Observable<any[]> {
        this.totalSubscription = this.service.onTotalCountChanged.pipe(
            delay(100)
        ).subscribe(total => {
            this.total = total;
        });

        return this.service.onOpportunitiesChanged.pipe(
            map(opportunities => {
                const stages = this.service.onStagesChanged.value;

                return opportunities.map(
                    opportunity => {
                        const stage = find(stages, {stageKey: opportunity.salesStage});
                        if (stage) {
                            opportunity.salesStageName = stage.stage;
                        }

                        return opportunity;
                    }
                )
            })
        );
    }

    disconnect() {
        this.totalSubscription.unsubscribe();
    }
}

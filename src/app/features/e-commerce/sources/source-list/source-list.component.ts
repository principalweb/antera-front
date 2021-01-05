import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable, forkJoin } from 'rxjs';
import { each, find } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { SelectionService } from 'app/core/services/selection.service';
import { SourceDetails } from 'app/models/source';
import { SourceFormComponent } from '../source-form/source-form.component';
import { SourcesService } from 'app/core/services/sources.service';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, delay, map } from 'rxjs/operators';

@Component({
    selector     : 'app-source-list',
    templateUrl  : './source-list.component.html',
    styleUrls    : ['./source-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class SourceListComponent implements OnInit, OnDestroy
{
    @Output() delete = new EventEmitter();
    @ViewChild('dialogContent') dialogContent: TemplateRef<any>;

    dataSource: SourceDataSource;
    displayedColumns = ['checkbox', 'itemName', 'itemNumber', 'gcName', 'gcItemNumber', 'quoteValidThrough', 'createdByName', 'assignedSalesRep', 'status', 'dateModified', 'buttons'];

    checkboxes: {};

    onSelectionChangedSubscription: Subscription;
    onSourcesChangedSubscription: Subscription;

    dialogRef: any;
    filterForm: FormGroup;
    businessTypes = [];
    
    loading = false;
    loaded = () => {
        this.loading = false;
    };
  
    constructor(
        private sourcesService: SourcesService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        public selection: SelectionService,
        private router: Router,
    ) {

        this.filterForm = this.fb.group(this.sourcesService.params.term);

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged.subscribe(selection => {
                this.checkboxes = selection;
            })

        this.onSourcesChangedSubscription =
            this.sourcesService.onSourcesChanged
                .subscribe(sources => {
                    this.checkboxes = {};
                    sources.map(source => {
                        this.checkboxes[source.id] = false;
                    });
                });

        this.dataSource = new SourceDataSource(sourcesService);
    }

    ngOnInit()
    {
        const fields = [
            'itemName', 'itemNumber', 'gcName', 'gcItemNumber', 'quoteValidThrough', 
            'createdByName', 'assignedSalesRep', 'status', 'dateModified'
        ];
        each(fields, f => {
            this.filterForm.get(f).valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
            ).subscribe(() => {
                this.filterSources();
            })
        });

        this.loading = true;
        this.sourcesService.getSourcesWithCount()
            .subscribe(() => {
                this.loading = false;
            })
    }

    ngOnDestroy()
    {
        this.onSourcesChangedSubscription.unsubscribe();
    }

    editSource(source)
    {
        this.router.navigate(['/e-commerce/sources', source.id]);
    }

    updateSource(sourceDetails) {
        this.loading = true;
        this.sourcesService.updateSource(sourceDetails)
            .subscribe(this.loaded, this.loaded);
    }

    deleteSource(source)
    {
        this.delete.emit([source.id]);
    }

    onSelectedChange(sourceId)
    {
        this.selection.toggle(sourceId);
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterSources() {
        const filters = this.filterForm.value;
        this.sourcesService.setFilters(filters);
        
        this.loading = true;
        forkJoin([
            this.sourcesService.getSources(),
            this.sourcesService.getSourcesCount()
        ]).subscribe(() => {
            this.loading = false;
        });
    }

    sort(sortEvent) {
        this.sourcesService.setSortData(sortEvent);

        this.loading = true;
        this.sourcesService.getSources()
            .subscribe(() => {
                this.loading = false;
            });
    }

    paginate(pageEvent) {
        this.sourcesService.setPagination(pageEvent);

        this.loading = true;
        this.sourcesService.getSources()
            .subscribe(() => {
                this.loading = false;
            });
    }
}

export class SourceDataSource extends DataSource<any> {
    total = 0;
    totalSubscription: Subscription;

    constructor(private service: SourcesService) {
        super();
    }

    connect(): Observable<any[]> {
        this.totalSubscription = this.service.onTotalCountChanged.pipe(
            delay(100)
        ).subscribe(total => {
            this.total = total;
        });

        return this.service.onSourcesChanged.pipe(
            map(sources => {
                const statuses = this.service.onStatusesChanged.value;
                return sources.map(
                    source => {
                        const status = find(statuses, {value: source.status});
                        if (status) {
                            source.status = status.value;
                        }

                        return source;
                    }
                );
            }),
        );
    }

    disconnect() {
        this.totalSubscription.unsubscribe();
    }
}

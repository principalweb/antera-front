import { Component, OnDestroy, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Subscription ,  Observable, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProjectFormComponent } from '../project-form/project-form.component';
import { ProjectsService } from 'app/core/services/projects.service';
import { SelectionService } from 'app/core/services/selection.service';
import { Project } from 'app/models';
import { delay } from 'rxjs/operators';

@Component({
    selector     : 'fuse-projects-list',
    templateUrl  : './projects-list.component.html',
    styleUrls    : ['./projects-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseProjectsListComponent implements OnInit, OnDestroy
{
    @Input() embedded = false;
    @Input() multiselect = true;

    dataSource: ProjectDataSource | null;
    displayedColumns = [
        'checkbox',
        'name',
        'estimatedStartDate',
        'dueDate',
        'assignee',
        'status',
        'priority',
        'converted'
    ];
    checkboxes: any = {};

    onProjectsChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;
    onClearFiltersSubscription: Subscription;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseProjectFormComponent>;
    filterForm: FormGroup;
    loading = false;
    loaded = () => {
        this.loading = false;
    }

    constructor(
        private projectsService: ProjectsService,
        private router: Router,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private selection: SelectionService
    )
    {
        this.onProjectsChangedSubscription =
            this.projectsService.onProjectsChanged.subscribe(projects => {
                this.selection.init(projects);
            });

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged.subscribe(selection => {
                this.checkboxes = selection;
            });

    }

    ngOnInit()
    {
        this.filterForm = this.fb.group(this.projectsService.payload.term);
        this.filterProjects();

        this.dataSource = new ProjectDataSource(
            this.projectsService
        );

        this.onClearFiltersSubscription =
            this.projectsService.onClearFilters
                .subscribe(() => {
                    this.filterForm.reset();
                    this.clearFilters();
                });
    }

    ngOnDestroy()
    {
        this.onProjectsChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
        this.onClearFiltersSubscription.unsubscribe();
    }

    deleteProject(project)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.loading = true;
                this.projectsService.deleteProject(project);
            }

            this.confirmDialogRef = null;
        });

    }

    onSelectedChange(id)
    {
        if (!this.multiselect) {
            this.selection.reset(false);
        }

        this.selection.toggle(id);
    }

    editProject(project)
    {
        this.router.navigate(['/projects', project.id]);
        /*
        this.dialogRef = this.dialog.open(FuseProjectFormComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'edit',
                service: this.projectsService,
                project
            }
        });

        this.dialogRef.afterClosed()
            .subscribe(response => {
                if ( !response )
                {
                    return;
                }
                this.loading = true;
                console.log(response);
                const actionType: string = response[0];

                switch ( actionType )
                {
                    case 'save':
                        this.projectsService.updateProject(response[1]);
                        this.loading = false;
                        break;

                    case 'delete':
                        this.deleteProject(project);
                        this.loading = false;
                        break;
                }
            });
            */
    }

    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    extractProjectColor(color_arrary) {
        if(color_arrary){
            const colors = color_arrary.replace(/\s/g, '').split(',');
            return colors[0];
        }
    }

    filterProjects(){
        if (this.loading) {
            return;
        }

        this.projectsService.payload.term = this.filterForm.value;

        this.loading = true;
        forkJoin([
            this.projectsService.getProjectCount('list'),
            this.projectsService.getProjects('list')
        ]).subscribe(
            this.loaded,
            this.loaded
        );
    }

    paginate(ev) {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.projectsService.paginate(ev)
            .subscribe(
                this.loaded,
                this.loaded
            );
    }

    sort(se) {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.projectsService.sort(se)
            .subscribe(
                this.loaded,
                this.loaded
            );
    }


    clearFilters() {
        this.loading = true;
        this.projectsService.resetList()
            .subscribe(() => {
                this.loading = false;
            });
    }
}

export class ProjectDataSource extends DataSource<any>
{
    total = 0;
    totalSubscription: Subscription;

    constructor(
        private projectsService: ProjectsService,
    ) {
        super();
    }

    connect(): Observable<Project[]>
    {
        this.totalSubscription =
            this.projectsService.onTotalCountChanged.pipe(
                delay(300)
            ).subscribe(c => {
                this.total = c;
            });

        return this.projectsService.onProjectsChanged;
    }

    disconnect()
    {
        this.totalSubscription.unsubscribe();
    }
}

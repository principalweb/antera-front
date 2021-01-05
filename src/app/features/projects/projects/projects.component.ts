import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { unionBy } from 'lodash';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { Project } from 'app/models';
import { ProjectsService } from 'app/core/services/projects.service';
import { FuseProjectFormComponent } from '../project-form/project-form.component';
import { FuseProjectsListComponent } from '../projects-list/projects-list.component';
import { ComingSoonComponent } from '../../../shared/coming-soon/coming-soon.component';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
    selector     : 'fuse-projects',
    templateUrl  : './projects.component.html',
    styleUrls    : ['./projects.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseProjectsComponent implements OnInit, OnDestroy
{
    @ViewChild('listComponent') listComponent: FuseProjectsListComponent;
    selectedCount: number;
    searchInput: FormControl;
    onSelectionSubscription: Subscription;
    onViewChangedSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseProjectFormComponent>;
    mode = 'kanban-condensed';
    assignees = [];
    selectedAssignees = [];
    selectedDue = 'Show All';
    isUserProjects = false; 
    assigneeSearch = new FormControl('');
    onAssigneeSearch: Subscription;
    rangeOptions: any[];

    selectedRange = {id: 'all', name: 'All', bg:{'color': ''}};

    isLoading = false;

    constructor(
        private projectsService: ProjectsService,
        public dialog: MatDialog,
        private router: Router,
        private cd: ChangeDetectorRef,
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
        this.selectedAssignees = this.projectsService.assigneeFilter;
        this.assignees = this.selectedAssignees;
        this.onSelectionSubscription =
            this.projectsService.onSelectionChanged
                .subscribe(selection => {
                    this.selectedCount = selection.length;
                    this.cd.markForCheck();
                });

        this.searchInput.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
            ).subscribe(searchText => {
                this.projectsService.onSearchTextChanged.next(searchText);
            });


        this.onAssigneeSearch =
            this.assigneeSearch.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(searchText => {
                    this.isLoading = true;
                    this.cd.markForCheck();
                    return this.projectsService.getUserAutoCompleteRequest(searchText);
                })
            ).subscribe((users: any[]) => {
                    this.isLoading = false;
                    this.assignees = unionBy([
                        ...this.selectedAssignees,
                        ...users
                    ]);
                    this.cd.markForCheck();
                });

        this.onViewChangedSubscription =
            this.projectsService.onViewChanged
                .subscribe(view => {
                    this.mode = view;
                    this.cd.markForCheck();
                });
        this.rangeOptions = this.projectsService.rangeOptions;
    }

    ngOnDestroy()
    {
        this.onSelectionSubscription.unsubscribe();
    }

    newProject()
    {
        this.router.navigate(['/projects/new']);
        /*
        this.dialogRef = this.dialog.open(FuseProjectFormComponent, {
            panelClass: 'antera-details-dialog',
            data      : {
                action: 'new'
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: FormGroup) => {
                if ( !response ) {
                    return;
                }

                this.projectsService.updateProject(response[1]);
            });
       */
    }

    cloneSelectedProjects()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to clone all selected projects?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.projectsService.cloneSelectedProjects();
            }
            this.confirmDialogRef = null;
        });
    }
    
    deleteSelectedProjects()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected projects?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.projectsService.deleteSelectedProjects();
            }
            this.confirmDialogRef = null;
        });
    }

    changeView(ev) {
        this.projectsService.changeView(ev.value);
    }

    changeDue(ev) {
        this.selectedDue = ev.value;
        this.projectsService.filterByDueDate(this.selectedDue);
    }

    viewUserProjects() {
        this.projectsService.viewUserProjects(this.isUserProjects);
    }

    changeAssignees() {
        this.projectsService.filterByAssignees(this.selectedAssignees);
    }


    clearSearch(){
      if (this.searchInput.value.length > 0)
        this.searchInput.setValue('');
    }

    clearFilters() {
        this.projectsService.assigneeFilter = [];
        this.projectsService.due = "Show All";
        this.projectsService.selectedRange = {id: 'all', name: 'All', bg: {'color' : ''}};
        this.selectedAssignees = [];
        this.assignees = [];
        this.selectedDue = "Show All";
        this.selectedRange = {id: 'all', name: 'All', bg: {'color' : ''}};

        if (this.mode === 'list') {
            this.projectsService.onClearFilters.next();
        } else {
            this.projectsService.filterByAssignees(this.selectedAssignees);
        }
    }


    emailSelected(){
        
    }

    massUpdateSelected(){
        
    }

    mergeSelected(){
        
    }

    addToTargetListSelected(){
        
    }

    generateLetterSelected(){
        
    }
    changeRange(range) {
        this.selectedRange = range;
        this.projectsService.filterRange(range);
    }
}

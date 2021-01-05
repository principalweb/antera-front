import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { ActivitiesService } from '../../core/services/activities.service';
import { ActivityFormDialogComponent } from '../../shared/activity-form/activity-form.component';
import { ComingSoonComponent } from '../../shared/coming-soon/coming-soon.component';
import { MessageService } from 'app/core/services/message.service';
import { Observable, forkJoin } from 'rxjs';
import { AuthService } from 'app/core/services/auth.service';
import { ActivitiesListComponent } from 'app/shared/activities-list/activities-list.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-activities',
    templateUrl: './activities.component.html',
    styleUrls: ['./activities.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class ActivitiesComponent implements OnInit {

    @ViewChild(ActivitiesListComponent) activitiesTableComponent: ActivitiesListComponent;

    searchInput: FormControl;

    constructor(
        public activitiesService: ActivitiesService,
        public dialog: MatDialog,
        private msg: MessageService,
        private auth: AuthService
    ) { 
        this.searchInput = new FormControl('');
    }

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<ActivityFormDialogComponent>;

    ngOnInit() {

    }
    
    ngOnDestroy(){
    }

    ngAfterViewInit() {

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(searchText => {
                // Prevent search if filter fields are not empty
                if (this.activitiesService.payload.term.type != '' || 
                this.activitiesService.payload.term.name != '' ||
                this.activitiesService.payload.term.refType != '' ||
                this.activitiesService.payload.term.assigned != '' ||
                this.activitiesService.payload.term.dueDate != '' ||
                this.activitiesService.payload.term.owner != '')
                    return;
                // Prevent search if keyword is less than 3
                if (searchText.length < 3 && searchText.length > 0)
                    return;
                this.activitiesTableComponent.loading = true;
                this.activitiesService.onSearchTextChanged.next(searchText);
            });
    }

    newActivity(type = 'Task'){
        this.dialogRef = this.dialog.open(ActivityFormDialogComponent, {
          panelClass: 'activity-form-dialog',
          data      : {
              action: 'new',
              type : type,
              service : this.activitiesService
          }
        });
    }

    clearSearch(){
        if (this.searchInput.value.length > 0)
            this.searchInput.setValue('');
    }

    clearFilters(){
        this.searchInput.setValue('');
        this.activitiesService.viewMyItems = false;
        this.activitiesService.showCompleted = false;
        
        this.activitiesTableComponent.clearFilters();    
    }

    changeShowMyItems(ev) {
        if (this.activitiesService.viewMyItems) 
            this.activitiesService.payload.term.userId = this.auth.getCurrentUser().userId;
        else 
            this.activitiesService.payload.term.userId = '';

        this.activitiesTableComponent.loading = true;
        Promise.all([
            this.activitiesService.getTotalCount(),
            this.activitiesService.getActivitiesList()
        ])
        .then(data => {
            this.activitiesTableComponent.loading = false;
            this.activitiesTableComponent.paginator.firstPage();
        });
    }

    showCompleted(ev){
        if (this.activitiesService.showCompleted) 
            this.activitiesService.payload.term.status = 'Completed';
        else 
            this.activitiesService.payload.term.status = '';
        this.activitiesTableComponent.loading = true;
        Promise.all([
            this.activitiesService.getTotalCount(),
            this.activitiesService.getActivitiesList()
        ])
        .then(data => {
            this.activitiesTableComponent.loading = false;
            this.activitiesTableComponent.paginator.firstPage();
        });
    }

    deleteSelectedActivities(){

        if (this.activitiesService._selection.length > 0 )
        {
            this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });
    
            this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected Activities?';
    
            this.confirmDialogRef.afterClosed().subscribe(result => {
                if ( result )
                {
                    this.activitiesTableComponent.loading = true;
                    this.activitiesService.deleteSelectedActivities()
                        .subscribe((res: any) => {
                            this.msg.show('Activities deleted','success');
                            this.activitiesService.deselectAll();
                            this.activitiesService.onActivityChanged.next("Deleted"); // Update navbar to update badge title
                            forkJoin([
                                this.activitiesService.getActivitiesList(),
                                this.activitiesService.getTotalCount()
                            ])
                            .subscribe(()=> {
                                this.activitiesTableComponent.loading = false;
                            })
                        }, (err) => {
                            this.msg.show(err.message, 'error');
                            this.activitiesTableComponent.loading = false;
                        });
                }
                this.confirmDialogRef = null;
            });
        }
        else{
            this.msg.show('Please select activities to delete.','error');
        }
    }

    emailSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    massUpdateSelected(){
        this.dialog.open(ComingSoonComponent);
    }

    addToTargetListSelected(){
        this.dialog.open(ComingSoonComponent);
    }

}

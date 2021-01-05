import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivitiesService } from 'app/core/services/activities.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ActivityFormDialogComponent } from 'app/shared/activity-form/activity-form.component';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { Observable, forkJoin } from 'rxjs';
import { ActivitiesListComponent } from 'app/shared/activities-list/activities-list.component';

@Component({
  selector: 'app-contact-activity-list',
  templateUrl: './contact-activity-list.component.html',
  styleUrls: ['./contact-activity-list.component.scss']
})
export class ContactActivityListComponent implements OnInit {

  @Input() contact: any;
  cContact: any; 

  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  dialogRef: MatDialogRef<ActivityFormDialogComponent>;
  @ViewChild(ActivitiesListComponent) activitiesTableComponent: ActivitiesListComponent;

  constructor(
    public activitiesService: ActivitiesService,
    public dialog: MatDialog,
    private auth: AuthService,
    private msg: MessageService,
  ) { 
        this.activitiesService.showCompleted = true;
        this.activitiesService.payload.term.status = '';
  }

  ngOnInit() {
    this.cContact = this.contact;
  }

  newActivity(type = 'Task'){
    this.dialogRef = this.dialog.open(ActivityFormDialogComponent, {
      panelClass: 'activity-form-dialog',
      data      : {
          action: 'new',
          type : type,
          contact : this.contact,
          service : this.activitiesService
      }
    });
  }

  clearFilters(){
    this.activitiesService.viewMyItems = false;
    this.activitiesService.showCompleted = true;
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
  
  showCompleted(ev){
    if (this.activitiesService.showCompleted) 
        this.activitiesService.payload.term.status = '';
    else 
        this.activitiesService.payload.term.status = 'Pending';
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
}

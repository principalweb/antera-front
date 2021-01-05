import { Component, OnInit, ViewChild, ViewEncapsulation, Input } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { Activity } from 'app/models';
import { ActivityFormDialogComponent } from '../activity-form/activity-form.component';
import { ActivitiesService } from 'app/core/services/activities.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { find } from 'lodash';
import * as moment from 'moment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
    selector: 'app-activities-list',
    templateUrl: './activities-list.component.html',
    styleUrls: ['./activities-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})

export class ActivitiesListComponent implements OnInit {

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @Input() order: any;
    @Input() account: any;
    @Input() contact: any;
    @Input() project: any;
    @Input() projectTask: any;
    @Input() isActivities: boolean;

    dataSource: ActivityDataSource | null;
    displayedColumns = ['checkbox', 'type', 'name', 'phone', 'refType', 'refName', 'assigned', 'dueDate', 'dateEntered', 'owner', 'priority', 'status','buttons'];
    selectedActivities: any[];
    checkboxes: {};
    selectedCount = 0;

    onActivitiesChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    dialogRef: MatDialogRef<ActivityFormDialogComponent>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    taskTypes = [];
    statusTypes = [];
    loading = false;
    loaded = () => {
        this.loading = false;
    };

    filterForm: FormGroup;
    filteredRefs = [];
    selectedRefType = '';
    selectedActivityType = '';
    selectedPriorityType = '';
    refTypes = ['Account', 'Contact', 'Order', 'Quote', 'Project', 'Project Task', 'Opportunity', 'Sourcing', 'Leads',  'Artwork'];
    prioritiesList = [];

    constructor(
        private activitiesService: ActivitiesService,
        private api: ApiService,
        public dialog: MatDialog,
        private msg: MessageService,
        private fb: FormBuilder,
        private router: Router, 
    )
    {
        this.onActivitiesChangedSubscription =
            this.activitiesService.onActivitiesChanged.subscribe(activities => {
                this.loading = false;
                this.checkboxes = {};
                activities.map(activity => {
                    this.checkboxes[activity.id] = false;
                });
            });

        this.onSelectionChangedSubscription =
            this.activitiesService.onSelectionChanged.subscribe(selection => {
                for ( const id in this.checkboxes )
                {
                    if (!this.checkboxes.hasOwnProperty(id)) {
                        continue;
                    }
                    this.checkboxes[id] = selection.includes(id);
                }
                this.selectedCount = selection.length;
            });
        
        this.api.getDropdownOptions({dropdown: ['sys_activity_relates_list', 'sys_activity_types_list', 'sys_activity_status_list', 'sys_activity_priorities_list']})
            .subscribe((res: any[]) => {
                this.refTypes = find(res, {name: 'sys_activity_relates_list'}).options;
                this.taskTypes = find(res, {name: 'sys_activity_types_list'}).options;
                this.statusTypes = find(res, {name: 'sys_activity_status_list'}).options;
                this.prioritiesList = find(res, {name: 'sys_activity_priorities_list'}).options;
            });
    }

    ngOnInit() {
        if (this.order) {
            this.activitiesService.payload.term.refType = (this.order.orderType == 'Quote') ? 'Quote' : 'Order';
            this.activitiesService.payload.term.refId = this.order.id;
            this.activitiesService.payload.term.refName = this.order.orderNo;
        }

        if (this.account) {
            this.activitiesService.payload.term.refType = 'Account';
            this.activitiesService.payload.term.refId = this.account.id;
            this.activitiesService.payload.term.refName = this.account.accountName;
        }

        if (this.contact) {
            this.activitiesService.payload.term.refType = 'Contact';
            this.activitiesService.payload.term.refId = this.contact.id;
            this.activitiesService.payload.term.refName = `${this.contact.firstName} ${this.contact.lastName}`;
        }

        if (this.project) {
            this.activitiesService.payload.term.refType = 'Project';
            this.activitiesService.payload.term.refId = this.project.id;
            if(!this.isActivities){
                this.activitiesService.payload.term.type = 'Project Task';
            }else{
                this.activitiesService.payload.term.type = '';
            }
            
        }

        if (this.projectTask) {
            this.activitiesService.payload.term.refType = 'Project Task';
            this.activitiesService.payload.term.refId = this.projectTask.id;
            if(this.isActivities){
                this.activitiesService.payload.term.type = '';
            }else{
                this.activitiesService.payload.term.type = '';
            }
        }

        this.selectedRefType = this.activitiesService.payload.term.refType;
        this.selectedActivityType = this.activitiesService.payload.term.type;
        this.selectedPriorityType = this.activitiesService.payload.term.priority;
        const formObj = this.activitiesService.payload.term;
        this.filterForm = this.fb.group(formObj);
        this.dataSource = new ActivityDataSource(this.activitiesService);
        this.fetchList();
    }

    ngAfterViewInit() {

        this.filterForm.get('refName').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe(keyword => {
            if (keyword.length > 0) {
                if (this.selectedRefType === 'Account') {
                    this.activitiesService.autocompleteAccounts(keyword)
                        .subscribe((res: any) => {
                            this.filteredRefs = res;
                        });
                } else if (this.selectedRefType === 'Order') {
                    this.activitiesService.autocompleteOrders(keyword)
                        .subscribe((res: any) => {
                            this.filteredRefs = res;
                        });
                } else if (this.selectedRefType === 'Quote') {
                    this.activitiesService.autocompleteQuotes(keyword)
                        .subscribe((res: any) => {
                            this.filteredRefs = res;
                        });
                } else if (this.selectedRefType === 'Contact') {
                    this.activitiesService.autocompleteContacts(keyword)
                        .subscribe((res: any) => {
                            this.filteredRefs = res;
                        });
                } else if (this.selectedRefType === 'Project') {
                    this.activitiesService.autocompleteProjects(keyword)
                        .subscribe((res: any) => {
                            this.filteredRefs = res;
                        });
                } else if (this.selectedRefType === 'Project Task') {
                    this.activitiesService.autocompleteProjects(keyword)
                        .subscribe((res: any) => {
                            this.filteredRefs = res;
                        });
                } else if (this.selectedRefType === 'Opportunity') {
                    this.activitiesService.autocompleteOpportunitiesByName(keyword).subscribe((res: any) => {
                        this.filteredRefs = res;
                    });
                } else if (this.selectedRefType === 'Leads') {
                    this.activitiesService.autocompleteLeads(keyword).subscribe((res: any) => {
                        this.filteredRefs = res;
                    });
                } else if (this.selectedRefType === 'Artwork') {
                    this.activitiesService.autocompleteArtworks(keyword).subscribe((res: any) => {
                        this.filteredRefs = res;
                    });
                } else if (this.selectedRefType === 'Sourcing') {
                    this.activitiesService.autocompleteSourcing(keyword).subscribe((res: any) => {
                        this.filteredRefs = res;
                    });
                } else {
                    this.msg.show('Please select reference Type first', 'error');
                }
            }
        })
    }

    ngOnDestroy()
    {
        this.onActivitiesChangedSubscription.unsubscribe();
        this.onSelectionChangedSubscription.unsubscribe();
    }

    toggleAll(ev) {
        if (ev) {
            this.activitiesService.toggleSelectAll();
        }
    }

    updateActivity(activity, status) {
        activity.status = status;
        this.loading = true;
        this.activitiesService.updateActivity(activity)
            .subscribe((res) => {
                this.activitiesService.onActivityChanged.next('Updated'); // Update navbar to update badge title
                forkJoin([
                    this.activitiesService.getTotalCount(),
                    this.activitiesService.getActivitiesList()
                ]).subscribe((res) => {
                    this.loading = false;
                }, (err) => {
                    this.loading = false;
                });
            }, (err) => {
                this.loading = false;
            });
    }

    updateActivityForCall(activity, direction) {
        activity.value.direction = direction;
        this.loading = true;
        this.activitiesService.updateActivity(activity)
            .subscribe((res) => {
                this.activitiesService.onActivityChanged.next('Updated'); // Update navbar to update badge title
                forkJoin([
                    this.activitiesService.getTotalCount(),
                    this.activitiesService.getActivitiesList()
                ]).subscribe((res) => {
                    this.loading = false;
                }, (err) => {
                    this.loading = false;
                });
            }, (err) => {
                this.loading = false;
            });
    }    

    updateActivityForProjectTask(activity, approved) {
        activity.value.approved = approved;
        if(approved){
            const today = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            activity.value.approvalDate = today;
        }else{
            activity.value.approvalDate = '';            
        }
        this.loading = true;
        this.activitiesService.updateActivity(activity)
            .subscribe((res) => {
                this.activitiesService.onActivityChanged.next('Updated'); // Update navbar to update badge title
                forkJoin([
                    this.activitiesService.getTotalCount(),
                    this.activitiesService.getActivitiesList()
                ]).subscribe((res) => {
                    this.loading = false;
                }, (err) => {
                    this.loading = false;
                });
            }, (err) => {
                this.loading = false;
            });
    }
    
    deleteActivity(activity)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.loading = true;
                this.activitiesService.deleteActivity(activity.id)
                    .subscribe((res) => {
                        this.msg.show('Activity deleted','success');
                        this.activitiesService.onActivityChanged.next("Deleted"); // Update navbar to update badge title
                        forkJoin([
                            this.activitiesService.getActivitiesList(),
                            this.activitiesService.getTotalCount()
                        ]).subscribe(() => {
                            this.loading = false;
                        });
                    },(err) => {
                        this.msg.show(err.message,'error');
                        this.loading = false;
                    })
            }
            this.confirmDialogRef = null;
        });

    }

    updateStatus(activity,status,ev)
    {
        ev.stopPropagation();
        // activity.status = activity.status == 'Pending' ? 'Completed' : 'Pending';
        this.updateActivity(activity, status);
    }



    updateApproved(activity, ev)
    {
        ev.stopPropagation();
        activity.value.approved = activity.value.approved == '1' ? '0' : '1';
        this.updateActivityForProjectTask(activity, activity.value.approved);
    }
    
    updateCallDirection(activity, ev)
    {
        ev.stopPropagation();
        activity.value.direction = activity.value.direction == 'Outbound' ? 'Inbound' : 'Outbound';
        this.updateActivityForCall(activity, activity.value.direction);
    }    

    onSelectedChange(activityId)
    {
        this.activitiesService.toggleSelected(activityId);
    }

    editActivity(activity: Activity){
        this.dialogRef = this.dialog.open(ActivityFormDialogComponent, {
            panelClass: 'activity-form-dialog',
            data      : {
                activity : activity,
                service : this.activitiesService,
                action : 'edit'
            }
        });

        this.dialogRef.afterClosed()
            .subscribe(() => {
                this.loading = false;
            });
    }

  newProjectTaskActivity(activity){
    this.dialogRef = this.dialog.open(ActivityFormDialogComponent, {
      panelClass: 'activity-form-dialog',
      data      : {
          action: 'new',
          type : 'Task',
          projectTask : activity,
          service : this.activitiesService
      }
    });
        this.dialogRef.afterClosed()
            .subscribe(() => {
                this.loading = false;
            });   
  }
  
    fetchList(){
        this.activitiesService.payload.term = this.filterForm.value;
        this.activitiesService.payload.term.refType = this.selectedRefType;
        this.activitiesService.payload.term.type = this.selectedActivityType;
        this.activitiesService.payload.term.priority = this.selectedPriorityType;

        this.loading = true;
        Promise.all([
            this.activitiesService.getTotalCount(),
            this.activitiesService.getActivitiesList()
        ])
        .then(data => {
            this.loading = false;
            this.paginator.firstPage();
        });
    }

    sortChange(ev) {
        // if(ev.direction === "") {
        //     ev.direction = 'asc';
        // }
        console.log("event change", ev);
        this.loading = true;
        this.activitiesService.payload.order = ev.active;
        this.activitiesService.payload.orient = ev.direction;
        this.activitiesService.getActivitiesList()
            .then((res) => {
                this.loading = false;
            })
            .catch((err) => {
                this.loading = false;
            });
    }

    paginate(ev) {
        this.loading = true;
        this.activitiesService.payload.offset = ev.pageIndex;
        this.activitiesService.payload.limit = ev.pageSize;
        this.activitiesService.getActivitiesList()
            .then((res) => {
                this.loading = false;
            })
            .catch((err) => {
                this.loading = false;
            });
    }

    clearFilters(){
        this.filterForm.reset();
        this.activitiesService.resetParams();
        if (this.order) {
            this.activitiesService.payload.term.refType = (this.order.orderType == 'Quote') ? 'Quote' : 'Order';
            console.log(this.activitiesService.payload.term.refType);
            this.activitiesService.payload.term.refId = this.order.id;
            this.activitiesService.payload.term.refName = this.order.orderNo;
        }

        if (this.account) {
            this.activitiesService.payload.term.refType = 'Account';
            this.activitiesService.payload.term.refId = this.account.id;
            this.activitiesService.payload.term.refName = this.account.accountName;
        }

        if (this.project) {
            this.activitiesService.payload.term.refType = 'Project';
            this.activitiesService.payload.term.refId = this.project.id;
            //this.activitiesService.payload.term.type = 'Project Task';
            if(!this.isActivities){
                this.activitiesService.payload.term.type = 'Project Task';
            }else{
                this.activitiesService.payload.term.type = '';
            }
        }

        if (this.projectTask) {
            this.activitiesService.payload.term.refType = 'Project Task';
            this.activitiesService.payload.term.refId = this.projectTask.id;
        }
        
        if (this.activitiesService.showCompleted) 
            this.activitiesService.payload.term.status = 'Completed';
        else 
            this.activitiesService.payload.term.status = '';

        this.selectedRefType = this.activitiesService.payload.term.refType;
        this.selectedActivityType = this.activitiesService.payload.term.type;
        this.selectedPriorityType = this.activitiesService.payload.term.priority;
        this.filterForm.setValue(this.activitiesService.payload.term);
        this.fetchList();
    }
    tooltip(activity) {
        if (activity.type == 'Email' || activity.type == 'E-Mail')
            return 'Subject: ' + activity.value.name + '\n' +
                   'Date:' + moment(activity.value.dueDate).format('YYYY-MM-DD');

        return 'Subject: ' + activity.value.name + '\n' +
               'Notes: ' + activity.value.note + '\n' +
               'Description: ' + activity.value.description;
    }

    isPastDueActivity(activity) {
        return moment() > moment(activity.value.dueDate) && activity.status == 'Pending';
    }

    displayName(val: any) {
        if (!val) {
            return '';
        } else if (typeof val === 'string') {
            return val;
        }
    
        return val.name;
    }

    onLinkModule(type,id) {
        if(type === 'Order') {
            this.router.navigate([`/e-commerce/orders/${id}`]);
        } 
        if(type === 'Quote') {
            this.router.navigate([`/e-commerce/quotes/${id}`]);
        } 
        if(type === 'Account') {
            this.router.navigate([`/accounts/${id}`]);
        }
        if(type === 'Contact') {
            this.router.navigate([`/contacts/${id}`]);
        }
        if (type === 'Opportunity') {
            this.router.navigate([`/opportunities/${id}`]);
        }
        if (type === 'Leads') {
            this.router.navigate([`/leads/${id}`]);
        }
        if (type === 'Sourcing') {
            this.router.navigate([`/e-commerce/sources/${id}`]);
        }
        if (type === 'Artwork') {
            this.router.navigate([`/artworks/${id}`]);
        }

        console.log(type);
        console.log(id);
    }

    selectRef(ev) {
        const ref = ev.option.value;
        this.filterForm.patchValue({
            refId: ref.id,
            refName: ref.name
        });
        this.fetchList();        
    }
}

export class ActivityDataSource extends DataSource<any>
{
    total = 0;

    private sub1: Subscription;

    constructor(private activitiesService: ActivitiesService) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Activity[]>
    {
        this.sub1 = this.activitiesService.onTotalCountChanged
            .subscribe(count => {
                setTimeout(() => {
                    this.total = count;
                });
            })

        return this.activitiesService.onActivitiesChanged;
    }

    disconnect()
    {
        this.sub1.unsubscribe();
    }
}

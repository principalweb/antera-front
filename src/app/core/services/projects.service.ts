import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Subscription, Observable, BehaviorSubject, Subject, of, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { findIndex } from 'lodash';

import { Project } from '../../models';
import { ApiService } from './api.service';
import { MessageService } from './message.service';
import { SelectionService } from './selection.service';
import { AuthService } from './auth.service';
import { switchMap, map, tap } from 'rxjs/operators';


@Injectable()
export class ProjectsService implements Resolve<any>
{
    onProjectsChanged: BehaviorSubject<Project[]>;
    onTotalCountChanged: BehaviorSubject<number>;
    onSelectionChanged: BehaviorSubject<string[]>;
    onSearchTextChanged: Subject<any> = new Subject();
    onStatusListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onViewChanged: BehaviorSubject<any> = new BehaviorSubject('kanban-condensed');
    onFolderReady = new BehaviorSubject<any>(null);
    onProjectChanged: BehaviorSubject<Project>;
    onClearFilters = new Subject();

    projects: Project[];
    designTypes = [];
    designTypesDetailsOptions = [];
    decoTypes = [];
    designLocations = [];
    due = 'Show All';
    assigneeFilter = [];
    isViewUserProjects = false;
    rangeOptions = [
        {id: 'past', name: 'Today/Past Due', bg:{'color':'red'}},
        {id: 'tomorrow',name: 'Tomorrow', bg:{'color':'#fee12b'}},
        {id: 'thisweek', name: '2-7 Days', bg:{'color':'green'}},
        {id: 'all', name: 'All', bg:{'color':''}}
    ]; 

    selectedRange = {id: 'all', name: 'All', bg:{'color':''}};

    onFilteredAssigneesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onFilteredCustomersChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onFilteredOrdersChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onFilteredDesignTypesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);

    payload = {
        offset: 0,
        limit: 50,
        order: 'dateCreated',
        orient: 'desc',
        term: {
            name: '',
            description: '',
            dateCreated: '',
            dateModified: '',
            assignedUserName: '',
            assignee: '',
            modifiedUserName: '',
            createdByName: '',
            estimatedStartDate: '',
            dueDate: '',
            status: '',
            priority: '',
        }
    }

    constructor(
        private api: ApiService,
        private msg: MessageService,
        public selection: SelectionService,
        private authService: AuthService
    ) {
        this.onProjectsChanged = new BehaviorSubject([]);
        this.onTotalCountChanged = new BehaviorSubject(0);
        this.onSelectionChanged = new BehaviorSubject([]);

        // Remove default assignee filter
        // const signedUser = this.authService.getCurrentUser();
        // this.assigneeFilter.push({
        //     id: signedUser.userId,
        //     name: `${signedUser.firstName} ${signedUser.lastName}`
        // });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this.getStatusList();
    }

    getProjects(listType = 'kanban'): Observable<any> {
        let data: any = this.payload;
        data.listType = listType;

        return this.api.getProjectList(data).pipe(
            tap((response:any) => {
                this.projects = response.map(data => {
                    const project = new Project(data);
                    return project;
                });

                const filtered = this.filterProjects();
                this.onProjectsChanged.next(filtered);
            }),
        );
    }
    
    getProjectCount(listType = 'kanban'): Observable<any> {
        let data: any = this.payload;

        if (this.onViewChanged.value !== 'list') {
            data = {
                offset: 0,
                limit: 1000,
                term: {}
            };
        }

        data.listType = listType;
        return this.api.getProjectCount(data).pipe(
            map((response: number) => {
                this.onTotalCountChanged.next(response);
                return response;
            })
        )
    }

    filterProjects() {
        let filtered = this.projects;
        if (this.isViewUserProjects) {
            const signedUser = this.authService.getCurrentUser();
            filtered = filtered.filter(
                (item: any) => !findIndex([{
                    id: signedUser.userId,
                    name: `${signedUser.firstName} ${signedUser.lastName}`
                }],
                    {
                        id: item.assignedId
                    })
            )
        }
        else {

            if (this.assigneeFilter.length > 0 && this.assigneeFilter[0] !== undefined) {
                filtered = filtered.filter(
                    (item: any) => !findIndex(this.assigneeFilter, {
                        id: item.assignedId
                    })
                )
            }

        }
        filtered = filtered.filter(
            (item: any) => {
                return this.inDateRange(item, this.selectedRange)
            }
        );

        return filtered;
    }

    inDateRange(item, range): boolean {
        let cardDate = moment(item.dueDate).endOf('day');
        let curDate = moment().endOf('day');
        let diff = cardDate.diff(curDate, 'hours');

        if (range.id == 'past') {
            return diff < 24;
        } else if (range.id == 'tomorrow') {
            return diff >= 24 && diff < 24*2;
        } else if (range.id == 'thisweek') {
            return diff >= 24*2 && diff <= 24*7;
        }

        return true;
    }

    getProject(id: string) {
        return this.api.getProjectDetails(id);
    }

    updateProject(project: Project) {
        return this.api.updateProject(project).subscribe((response:any) => {
            this.getProjects().subscribe((res) => { 
              // any other things here 
            });
          });
    }

    deleteProject(project) {
        return this.api.deleteProjects([project.id]).subscribe((response: any) => {
                if (response.status === "Success") {
                    this.msg.show("This item has been moved to the Recycle Bin", "info");
                    this.getProjects().subscribe(() => {                    
			this.onProjectsChanged.next(
			    this.filterProjects()
			);
                    });
                }
                return of(response);
            });
    }

    deleteSelectedProjects() {
        return this.api.deleteProjects(this.selection.selectedIds).subscribe((response: any) => {
                if (response.status === "success") {
                    this.msg.show("The selected items have been moved to the Recycle Bin", "info");
                    this.getProjects().subscribe(() => {                    
			this.onProjectsChanged.next(
			    this.filterProjects()
			);
                    });
                }
                return of(response);
            });
    }

    cloneSelectedProjects() {
        return this.api.cloneProjects(this.selection.selectedIds).subscribe((response: any) => {
                if (response.status === "success") {
                    this.msg.show("The selected items have been cloned", "info");
                    this.getProjects().subscribe(() => {                    
			this.onProjectsChanged.next(
			    this.filterProjects()
			);
                    });
                }
                return of(response);
            });
    }
    
    getStatusList() {
        return this.api.getProjectStatusList().pipe(
            map((list: any) => {
                this.onStatusListChanged.next(list);
            })
        );
    }

    filterByDueDate(due) {
        this.due = due;
        this.onProjectsChanged.next(
            this.filterProjects()
        );
    }

    filterByAssignees(assignees) {
        this.assigneeFilter = assignees;
        this.onProjectsChanged.next(
            this.filterProjects()
        );
    }

    viewUserProjects(isViewUserProjects) {
        this.isViewUserProjects = isViewUserProjects;
        this.onProjectsChanged.next(
            this.filterProjects()
        );
    }

    getUserAutoCompleteRequest(term) {
        return this.api.post('/content/user-auto', {
            search: term
        });
    }

    getUserAutocomplete(term) {
        this.api.post('/content/user-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredAssigneesChanged.next(list);
        });
    }

    getCustomerAutocomplete(term) {
        return this.api.post('/content/customer-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredCustomersChanged.next(list);
        });
    }

    getOrderAutocomplete(term) {
        return this.api.post('/content/order-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredOrdersChanged.next(list);
        });
    }

    getDesignTypeAutocomplete(term) {
        return this.api.post('/content/design-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredDesignTypesChanged.next(list);
        });
    }

    getAllDesignTypes() {
        if (this.designTypes.length > 0) {
            return of(this.designTypes);
        }

        return this.api.getAllDesignTypes().pipe(
            map((types: string[]) => {
                this.designTypes = types;
                return types;
            })
        );
    }

    getAllDesignTypesDetailsOptions() {
        if (this.designTypesDetailsOptions.length > 0) {
            return of(this.designTypesDetailsOptions);
        }
        return this.api.getAllDesignTypesDetailsOptions().pipe(
            map((types: string[]) => {
                this.designTypesDetailsOptions = types;
                return types;
            })
        );
    }


    getDesignLocations() {
        if (this.designLocations.length > 0) {
            return of(this.designLocations);
        }

        return this.api.getDesignLocations().pipe(
            map((locations: any) => {
                this.designLocations = locations;
                return locations;
            })
        );
    }

    changeView(view) {
        this.onViewChanged.next(view);
    }

    paginate(ev) {
        this.payload.offset = ev.pageIndex;
        this.payload.limit = ev.pageSize;

        return this.getProjects('list');
    }

    sort(ev) {
        this.payload.order = ev.active;
        this.payload.orient = ev.direction;

        return this.getProjects('list');
    }

    resetList() {
        this.payload.term = {
            name: '',
            description: '',
            dateCreated: '',
            dateModified: '',
            assignedUserName: '',
            assignee: '',
            modifiedUserName: '',
            createdByName: '',
            estimatedStartDate: '',
            dueDate: '',
            status: '',
            priority: ''
        };

        return forkJoin([
            this.getProjects('list'),
            this.getProjectCount('list')
        ]);
    }

  filterRange(range) {
      this.selectedRange = range;
      this.onProjectsChanged.next(
              this.filterProjects()
      );
  }

  setPinned(card) {
        return this.api.projectSetPinned(card.id, card.pinned).pipe(
            map((res: any) => {
                return res;
            })
        )
    }
}

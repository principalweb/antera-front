import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject, forkJoin } from 'rxjs';
import { findIndex, find } from 'lodash';
import * as moment from 'moment';
import { AuthService } from 'app/core/services/auth.service';
import { Source, SourceDetails } from 'app/models/source';
import { ApiService } from 'app/core/services/api.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class SourcesService implements Resolve<any>
{
    onSourcesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onTotalCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
    onStatusesChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSelectionChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onViewChanged = new BehaviorSubject('kanban-condensed');
    onFolderReady = new BehaviorSubject<any>(null);

    events: Subject<any> = new Subject();
    due = 'Show All';
    boardSources: Source[];
    assigneeFilter = [];

    params = {
        offset: 0,
        limit: 50,
        order: "dateModified",
        orient: "desc",
        term: {
            'itemName':'', 
            'itemNumber':'', 
            'gcName':'', 
            'gcItemNumber':'', 
            'quoteValidThrough':'', 
            'createdByName':'', 
            'assignedSalesRep':'', 
            'status':'', 
            'dateModified':''
        },
        permUserId: this.authService.getCurrentUser().userId
    }

    constructor(
        private api: ApiService,
        private authService: AuthService
    )
    {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

        return this.getStatusList();
    }

    getSources(): Observable<any> {
        return this.api.getSourcesList(this.params).pipe(
            map((sources: any) => {
                this.onSourcesChanged.next(
                    sources.map(source =>
                        new Source(source)
                    )
                );
                return sources
            })
        );
    }

    getSourcesCount(): Observable<any> {
        return this.api.getSourcesCount(this.params).pipe(
            map((res: any) => {
                this.onTotalCountChanged.next(res.count);
                return res;
            })
        );
    }

    getSourcesWithCount(): Observable<any[]> {
        return forkJoin([
            this.getSources(),
            this.getSourcesCount()
        ]);
    }

    getSource(id) {
        return this.api.getSource(id);
    }

    getBoardSources() {
        const params1 = {
            order: 'dateModified',
            orient: 'desc',
            offset: 0,
            limit: 10,  
            term: {
                status: 'Closed Won'
            },
            permUserId: this.authService.getCurrentUser().userId
        }
        const params2 = {
            order: 'dateModified',
            orient: 'desc',
            offset: 0,
            limit: 10,
            term: {
                status: 'Closed Lost'
            },
            permUserId: this.authService.getCurrentUser().userId
        }
        return forkJoin([
            this.api.getBoardSources(),
            this.api.getSourcesList(params1),
            this.api.getSourcesList(params2)
        ]).pipe( 
            map((data: any) => {
                const sources = [
                    ...data[0].board[0],
                    ...data[1],
                    ...data[2]
                ];
                this.boardSources = sources;
                this.onSourcesChanged.next(this.filterBoardSources());
                this.onTotalCountChanged.next(this.filterBoardSources().length);
                return data;
            })
        );
    }

    getStatusList() {
        return this.api.getDropdownOptions({dropdown: [
            'sys_sourcing_status_list' 
            ]}).pipe(
                map((statuses: any[]) => {
                    const statusDropdown = find(statuses, {name: 'sys_sourcing_status_list'});
                    this.onStatusesChanged.next(statusDropdown.options);
                }),
            );
    }

    createSource(source: SourceDetails) {
        return this.api.createSource(source.toObject()).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getSources(),
                        this.getSourcesCount()
                    ]);
                }

                return this.getBoardSources();
            })
        );
    }

    updateSource(source: SourceDetails) {
        return this.api.updateSource(source.toObject()).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getSources(),
                        this.getSourcesCount()
                    ]);
                }

                return this.getBoardSources();
            })
        );
    }

    deleteSources(ids) {
        return this.api.deleteSources(ids).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getSources(),
                        this.getSourcesCount()
                    ]);
                }

                return this.getBoardSources();
            })
        );
    }

    addStatus(newStatus) {
        const statuses = this.onStatusesChanged.value;
        this.onStatusesChanged.next([...statuses, newStatus]);
    }

    removeStatus(status) {
        // const statuses = this.onStatusesChanged.value.filter(st => st !== status);
        // this.onStatusesChanged.next(statuses);
    }

    updateStatusList(list) {
        this.onStatusesChanged.next(list);
    }

    setPagination(pe) {
        this.params.offset = pe.pageIndex
        this.params.limit = pe.pageSize;
    }

    setFilters(filters) {
        this.params.term = filters;
    }

    setSortData(sortData) {
        this.params.order = sortData.active;
        this.params.orient = sortData.direction;
    }

    filterByDue(due) {
        this.due = due;
        this.onSourcesChanged.next(
            this.filterBoardSources()
        );
    }

    filterByAssignees(assignees) {
        this.assigneeFilter = assignees;
        this.onSourcesChanged.next(
            this.filterBoardSources()
        );
    }

    filterBoardSources() {
        let filtered = this.boardSources;

        if ( this.assigneeFilter.length > 0 && this.assigneeFilter[0] !== undefined ) {
            filtered = filtered.filter(
                (item: any) => !findIndex(this.assigneeFilter, {
                    id: item.salesRepId
                })
            )
        }

        if ( filtered.length == 0){
            const signedUser = this.authService.getCurrentUser();
            if (this.assigneeFilter.length == 1 && this.assigneeFilter[0].id == signedUser.userId)
                filtered = this.boardSources;
        }

        if ( this.due == 'Past Close Date' ) {
            filtered = filtered.filter(
                (item: any) => (item.dateClosed !== null) && (moment() > moment(new Date(item.dateClosed)))
            );
        }
        else if ( this.due == 'To be Closed in 7 Days' ) {
            filtered = filtered.filter(
                (item: any) => (item.dateClosed !== null) && (moment().add(7, 'days') > moment(new Date(item.dateClosed)) && moment() < moment(new Date(item.dateClosed)))
            );
        }
        else if ( this.due == 'To be Closed in 30 days' ) {
            filtered = filtered.filter(
                (item: any) => (item.dateClosed !== null) && (moment().add(30, 'days') > moment(new Date(item.dateClosed)) && moment() < moment(new Date(item.dateClosed)))
            );
        }

        return filtered;
    }

    getUserAutoCompleteRequest(term) {
        return this.api.post('/content/user-auto', {
            search: term
        });
    }

    resetParams(){
        this.params = {
            offset: 0,
            limit: 50,
            order: "dateModified",
            orient: "desc",
            term: {
                'itemName':'', 
                'itemNumber':'', 
                'gcName':'', 
                'gcItemNumber':'', 
                'quoteValidThrough':'', 
                'createdByName':'', 
                'assignedSalesRep':'', 
                'status':'', 
                'dateModified':''
            },
            permUserId: ''
        }

    }
}

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { findIndex, find, uniqBy, each } from 'lodash';
import { Observable ,  BehaviorSubject ,  Subject, forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Opportunity } from '../../models';
import * as moment from 'moment';
import { AuthService } from 'app/core/services/auth.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class OpportunitiesService implements Resolve<any>
{
    onOpportunitiesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onTotalCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
    onStagesChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSelectionChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onViewChanged = new BehaviorSubject('kanban-condensed');

    events: Subject<any> = new Subject();
    due = 'Show All';
    boardOpportunities: Opportunity[];
    assigneeFilter = [];

    params = {
        offset: 0,
        limit: 50,
        order: "name",
        orient: "asc",
        term: {
            'name': '',
            'accountName': '',
            'contactName': '',
            'leadSource': '',
            'salesStage': '',
            'amount': '',
            'salesRep': '',
            'dateCreated': '',
            'user': '',
            'dateClosed': '',
            'opportunityType': '',
            'salesRepId': ''
        },
        termIn: {

        },
        termNotIn: {

        },
        permUserId: ''
    }

    constructor(
        private api: ApiService,
        private authService: AuthService
    )
    {
        const signedUser = this.authService.getCurrentUser();
        this.assigneeFilter.push({
            id: signedUser.userId,
            name: `${signedUser.firstName} ${signedUser.lastName}`
        });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

        this.resetParams();
        if (route.queryParams.refType && route.queryParams.refType == 'User'){
            this.params.term.salesRep = route.queryParams.userName;
            if (route.queryParams.status == 'Open'){
                this.params.termIn = {};
                this.params.termNotIn = {salesStage: ['ClosedWon','ClosedLost']};
            }
            this.onViewChanged.next('list');
        }


        if (route.queryParams.refType && route.queryParams.refType == 'Account'){
            this.params.term.accountName = route.queryParams.assigned;
            if (route.queryParams.status == 'Open'){
                this.params.termIn = {};
                this.params.termNotIn = {salesStage: ['ClosedWon','ClosedLost']};
            }
            this.onViewChanged.next('list');
        }



        if (route.queryParams.refType && route.queryParams.refType == 'Contact'){
            this.params.term.contactName = route.queryParams.assigned;
            if (route.queryParams.status == 'Open'){
                this.params.termIn = {};
                this.params.termNotIn = {salesStage: ['ClosedWon','ClosedLost']};
            }
            this.onViewChanged.next('list');
        }

        return this.getSalesStages();
    }

    getOpportunities(): Observable<any> {
        this.params.permUserId = this.authService.getCurrentUser().userId;
        return this.api.getOpportunitiesList(this.params).pipe(
            map((opportunities: any) => {
                this.onOpportunitiesChanged.next(
                    opportunities.map(opportunity =>
                        new Opportunity(opportunity)
                    )
                );
                return opportunities
            })
        );
    }

    getOpportunitiesCount(): Observable<any> {
        this.params.permUserId = this.authService.getCurrentUser().userId;
        return this.api.getOpportunitiesCount(this.params).pipe(
            map((res: any) => {
                this.onTotalCountChanged.next(res.count);
                return res;
            })
        );
    }

    getOpportunitiesWithCount(): Observable<any[]> {
        return forkJoin([
            this.getOpportunities(),
            this.getOpportunitiesCount()
        ]);
    }

    getOpportunity(id) {
        return this.api.getOpportunity(id);
    }

    getOpportunityFromList(id) {
        return find(this.onOpportunitiesChanged.value, { id });
    }

    getBoardOpportunities() {
        /*
        const params1 = {
            order: 'dateModified',
            orient: 'desc',
            offset: 0,
            limit: 10,  
            term: {
                salesStage: 'ClosedWon'
            },
            permUserId: this.authService.getCurrentUser().userId
        }
        const params2 = {
            order: 'dateModified',
            orient: 'desc',
            offset: 0,
            limit: 10,
            term: {
                salesStage: 'ClosedLost'
            },
            permUserId: this.authService.getCurrentUser().userId
        }
        */
        /*
        return forkJoin([
            this.api.getBoardOpportunities(),
            //this.api.getOpportunitiesList(params1),
            //this.api.getOpportunitiesList(params2)
        ]).pipe(
            map((data: any) => {
                const opportunities = [
                    ...data[0].board[0]
                ];
                this.boardOpportunities = uniqBy(opportunities, 'id');
                this.onOpportunitiesChanged.next(this.filterBoardOpportunities());
                this.onTotalCountChanged.next(this.filterBoardOpportunities().length);
                return data;
            })
        );
        */

        return this.api.getBoardOpportunities().pipe(
            map((data: any) => {
                const opportunities = [
                    ...data.board[0]
                ];
                this.boardOpportunities = uniqBy(opportunities, 'id');
                this.onOpportunitiesChanged.next(this.filterBoardOpportunities());
                this.onTotalCountChanged.next(this.filterBoardOpportunities().length);
                return data;

            })
        );
    }

    getSalesStages() {
        return this.api.getOpportunitiesSalesStage().pipe(
            map(stages => {
                this.onStagesChanged.next(stages);
            })
        );
    }

    createOpportunity(opportunity) {
        return this.api.createOpportunity(opportunity).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getOpportunities(),
                        this.getOpportunitiesCount()
                    ]);
                }

                return this.getBoardOpportunities();
            })
        );
    }

    updateOpportunity(opportunity) {
        return this.api.updateOpportunity(opportunity).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getOpportunities(),
                        this.getOpportunitiesCount()
                    ]);
                }

                return this.getBoardOpportunities();
            })
        );
    }

    deleteOpportunities(ids) {
        return this.api.deleteOpportunities(ids).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getOpportunities(),
                        this.getOpportunitiesCount()
                    ]);
                }

                return this.getBoardOpportunities();
            })
        );
    }

    addStatus(newStage) {
        const stages = this.onStagesChanged.value;
        this.onStagesChanged.next([...stages, newStage]);
    }

    removeStatus(stage) {
        // const stages = this.onStagesChanged.value.filter(st => st !== stage);
        // this.onStagesChanged.next(stages);
    }

    updateStatusList(list) {
        this.onStagesChanged.next(list);
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
        this.onOpportunitiesChanged.next(
            this.filterBoardOpportunities()
        );
    }

    filterByAssignees(assignees) {
        this.assigneeFilter = assignees;
        this.onOpportunitiesChanged.next(
            this.filterBoardOpportunities()
        );
    }

    filterBoardOpportunities() {
        let filtered = this.boardOpportunities;
/*
        if ( this.assigneeFilter.length > 0 && this.assigneeFilter[0] !== undefined ) {
            filtered = filtered.filter(
                (item: any) => !findIndex(this.assigneeFilter, {
                    id: item.salesRepId
                })
            )
        }
*/
        if ( this.assigneeFilter.length > 0 && this.assigneeFilter[0] !== undefined ) {
            let assigneeFiltered = [];
            this.assigneeFilter.forEach((assignee) => {
                let assigneeSubFilter = this.boardOpportunities.filter(
                    (item: any) => !findIndex([assignee], {
                        id: item.salesRepId
                    })
                );
                assigneeSubFilter.forEach((assignee) => {
                    assigneeFiltered.push(assignee);
                });
                
            });
            if ( assigneeFiltered.length > 0 && assigneeFiltered[0] !== undefined ) {
                filtered = uniqBy(assigneeFiltered, 'id');
                
            }else{
                filtered = [];
            }
        }
        if ( filtered.length == 0){
            const signedUser = this.authService.getCurrentUser();
            if (this.assigneeFilter.length == 1 && this.assigneeFilter[0].id == signedUser.userId)
                filtered = this.boardOpportunities;
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
            search: term,
            permUserId: this.authService.getCurrentUser().userId
        });
    }

    resetParams(){
        this.params = {
            offset: 0,
            limit: 50,
            order: "name",
            orient: "asc",
            term: {
                'name': '',
                'accountName': '',
                'contactName': '',
                'leadSource': '',
                'salesStage': '',
                'amount': '',
                'salesRep': '',
                'dateCreated': '',
                'user': '',
                'dateClosed': '',
                'opportunityType': '',
                'salesRepId': '',
            },
            termIn: {
    
            },
            termNotIn: {
    
            },
            permUserId: ''
        }
    }
}

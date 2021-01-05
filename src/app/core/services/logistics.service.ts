import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject, forkJoin } from 'rxjs';
import { findIndex, find, uniqBy } from 'lodash';
import { ApiService } from '../../core/services/api.service';
import { Logistic } from '../../models';
import * as moment from 'moment';
import { AuthService } from 'app/core/services/auth.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class LogisticsService implements Resolve<any>
{
    onLogisticsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onTotalCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
    onStagesChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSelectionChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onViewChanged = new BehaviorSubject('kanban-condensed');

    events: Subject<any> = new Subject();
    due = 'Show All';
    boardLogistics: Logistic[];
    assigneeFilter = [];

    params = {
        offset: 0,
        limit: 50,
        order: "orderNo",
        orient: "asc",
        term: {
            'orderId': '',
        },
        termIn: {

        },
        termNotIn: {

        }
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
            // this.params.term.salesRep = route.queryParams.userName;

            // if (route.queryParams.status == 'Open'){
            //     this.params.termIn = {};
            //     this.params.termNotIn = {salesStage: ['ClosedWon','ClosedLost']};
            // }
            this.onViewChanged.next('list');
            return;
        }

        if (route.queryParams.refType && route.queryParams.refType == 'Contact'){
            // this.params.term.contactName = route.queryParams.assigned;
            // if (route.queryParams.status == 'Open'){
            //     this.params.termIn = {};
            //     this.params.termNotIn = {salesStage: ['ClosedWon','ClosedLost']};
            // }
            this.onViewChanged.next('list');
            return;
        }

        // return this.getSalesStages();
    }

    isEnabled() {
        console.log(window.location.host);
        return true;
    }

    getLogistics(): Observable<any> {
        return this.api.getLogisticsList(this.params).pipe(
            map((logistics: any) => {
                this.onLogisticsChanged.next(
                    logistics.map(logistic =>
                        new Logistic(logistic)
                    )
                );
                return logistics
            })
        );
    }

    getLogisticsCount(): Observable<any> {
        return this.api.getLogisticsCount(this.params).pipe(
            map((res: any) => {
                this.onTotalCountChanged.next(res.count);
                return res;
            })
        );
    }

    getLogisticsWithCount(): Observable<any[]> {
        return forkJoin([
            this.getLogistics(),
            this.getLogisticsCount()
        ]);
    }

    getLogistic(id) {
        return this.api.getLogistic(id);
    }

    getLogisticFromList(id) {
        return find(this.onLogisticsChanged.value, { id });
    }

    getBoardLogistics() {
        const params1 = {
            order: 'dateModified',
            orient: 'desc',
            offset: 0,
            limit: 10,  
            term: {
                // salesStage: 'ClosedWon'
            }
        }
        const params2 = {
            order: 'dateModified',
            orient: 'desc',
            offset: 0,
            limit: 10,
            term: {
                // salesStage: 'ClosedLost'
            }
        }
        return forkJoin([
            // this.api.getBoardLogistics({}),
            this.api.getLogisticsList(params1),
            this.api.getLogisticsList(params2)
        ]).pipe(
            map((data: any) => {
                const logistics = [
                    // ...data[0].board[0],
                    ...data[0],
                    ...data[1]
                ];
                this.boardLogistics = uniqBy(logistics, 'id');
                this.onLogisticsChanged.next(this.filterBoardLogistics());
                this.onTotalCountChanged.next(this.filterBoardLogistics().length);
                return data;
            }),
        );
    }

    // getSalesStages() {
    //     return this.api.getLogisticsSalesStage()
    //         .map(stages => {
    //             this.onStagesChanged.next(stages);
    //         });
    // }

    createLogistic(logistic) {
        return this.api.createLogistic(logistic).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getLogistics(),
                        this.getLogisticsCount()
                    ]);
                }

                return this.getBoardLogistics();
            })
        );
    }

    updateLogistic(logistic) {
        return this.api.updateLogistic(logistic).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getLogistics(),
                        this.getLogisticsCount()
                    ]);
                }

                return this.getBoardLogistics();
            }),
        );
    }

    deleteLogistics(ids) {
        return this.api.deleteLogistics(ids).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getLogistics(),
                        this.getLogisticsCount()
                    ]);
                }

                return this.getBoardLogistics();
            }),
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
        this.onLogisticsChanged.next(
            this.filterBoardLogistics()
        );
    }

    filterByAssignees(assignees) {
        this.assigneeFilter = assignees;
        this.onLogisticsChanged.next(
            this.filterBoardLogistics()
        );
    }

    filterBoardLogistics() {
        let filtered = this.boardLogistics;

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
                filtered = this.boardLogistics;
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
            order: "orderId",
            orient: "asc",
            term: {
                'orderId': '',
            },
            termIn: {
    
            },
            termNotIn: {
    
            }
        }
    }
}

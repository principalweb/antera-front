import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject, forkJoin } from 'rxjs';
import { findIndex, find } from 'lodash';
import * as moment from 'moment';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
import { OrderDetails } from '../../models';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class EcommerceBillingService implements Resolve<any>
{
    onBillingChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onTotalCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
    onStageChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSelectionChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onViewChanged = new BehaviorSubject('kanban-condensed');
    onFolderReady = new BehaviorSubject<any>(null);

    orders: any[];
    onOrdersChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onOrderTypeListchanged: BehaviorSubject<any> = new BehaviorSubject([]);
    orderType = ['All'];

    paymentStatusList = [];
    statuses = [];
    
    events: Subject<any> = new Subject();
    due = 'Show All';
    boardBilling: any[];
    assigneeFilter = [];
    params = {
        offset: 0,
        limit: 50,
        order: "",
        orient: "desc",
        term: {
            orderNo: "",
            inHouseOrderNo: "",
            orderIdentity: "",
            contactName: "",
            accountName: "",
            orderType: ['Fulfillment'],
            orderDate: "",
            totalPrice: "",
            salesPerson: "",
            cloudOrderLink: "",
            inHandByDate: "",
            completion: "Active",
            orderStatus: [],
            paymentStatus: [],
            modifiedDate: "",
            csrId: "",
            userId: "",
            action: "",
            billingStage: ""
        },
        myViewItems: false,
        type: true,
        completed: false,
        permUserId: this.authService.getCurrentUser().userId
    };

    constructor(
        private api: ApiService,
        private authService: AuthService
    )
    {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {

        return forkJoin([
            this.getStatusList(),
            this.getStagesList()
        ]);

    }

    getBilling(): Observable<any> {
        return this.api.getBillingList(this.params).pipe(
            map((billing: any) => {
                this.onBillingChanged.next(
                    billing.items.map(bill =>
                        new OrderDetails(bill)
                    )
                );
                return billing
            })
        );
    }

    getBillingCount(): Observable<any> {
        return this.api.getBillingCount(this.params).pipe(
            map((res: any) => {
                this.onTotalCountChanged.next(res.total);
                return res;
            })
        );
    }

    getBillingWithCount(): Observable<any[]> {
        return forkJoin([
            this.getBilling(),
            this.getBillingCount()
        ]);
    }

    getBillingDetails(id) {
        return this.api.getBilling(id);
    }

    getBoardBilling() {
        return forkJoin([
            this.api.getBoardBilling()
        ]).pipe( 
            map((data: any) => {
                const billing = [
                    ...data[0].board,
                ];
                this.boardBilling = billing;
                this.onBillingChanged.next(this.filterBoardBilling());
                this.onTotalCountChanged.next(this.filterBoardBilling().length);
                return data;
            })
        );
    }

    getStatusList() {
        return this.api.getDropdownOptions({dropdown: [
            'sys_billed_order_stage_list' 
            ]}).pipe(
                map((statuses: any[]) => {
                    const statusDropdown = find(statuses, {name: 'sys_billed_order_stage_list'});
                    this.onStageChanged.next(statusDropdown.options);
                }),
            );
    }

    createBilling() {

    }

    updateBilling(billing: OrderDetails) {
        return this.api.updateOrder(billing).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getBilling(),
                        this.getBillingCount()
                    ]);
                }
                return this.getBoardBilling();
            })
        );
    }

    updateOrderBillingStage(orderId, stage) {
        return this.api.updateOrderBillingStage(orderId, stage).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getBilling(),
                        this.getBillingCount()
                    ]);
                }
                return this.getBoardBilling();
            })
        );
    }


    deleteBilling(ids) {
        return this.api.deleteBilling(ids).pipe(
            switchMap(() => {
                if (this.onViewChanged.value === 'list') {
                    return forkJoin([
                        this.getBilling(),
                        this.getBillingCount()
                    ]);
                }

                return this.getBoardBilling();
            })
        );
    }

    addStatus(newStatus) {
        const statuses = this.onStageChanged.value;
        this.onStageChanged.next([...statuses, newStatus]);
    }

    removeStatus(status) {
        // const statuses = this.onStageChanged.value.filter(st => st !== status);
        // this.onStageChanged.next(statuses);
    }

    updateStatusList(list) {
        this.onStageChanged.next(list);
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
        this.onBillingChanged.next(
            this.filterBoardBilling()
        );
    }

    filterByAssignees(assignees) {
        this.assigneeFilter = assignees;
        this.onBillingChanged.next(
            this.filterBoardBilling()
        );
    }

    filterBoardBilling() {
        let filtered = this.boardBilling;

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
                filtered = this.boardBilling;
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
        order: "",
        orient: "desc",
        term: {
            orderNo: "",
            inHouseOrderNo: "",
            orderIdentity: "",
            contactName: "",
            accountName: "",
            orderType: ['Fulfillment'],
            orderDate: "",
            totalPrice: "",
            salesPerson: "",
            cloudOrderLink: "",
            inHandByDate: "",
            completion: "Active",
            orderStatus: [],
            paymentStatus: [],
            modifiedDate: "",
            csrId: "",
            userId: "",
            action: "",
            billingStage: ""
        },
        myViewItems: false,
        type: true,
        completed: false,
        permUserId: this.authService.getCurrentUser().userId
    };
    }
    

    getOrderTypeList() {
        const data = {"dropdown":["order_type_list"]};
        return new Promise((resolve, reject) => {
            this.api.dropdownList(data).subscribe((list: any[]) => {
                this.onOrderTypeListchanged.next(list);
                resolve(list);
            }, reject);
        });
    }

    getStatues() {
        return new Promise((resolve, reject) => {
            let module = this.orderType[0];
            if (module == 'Webstore' || module === 'All') {
                module = 'Order';
            }
            this.api.getStatuses(module).subscribe((list: any[]) => {
                this.statuses = list;
                resolve(list);
            }, reject);
        });
    }

    getPaymentStatusList() {
        const data = {"dropdown":["order_payment_status_list"]};
        return new Promise((resolve, reject) => {
            this.api.dropdownList(data).subscribe((list: any[]) => {
                this.paymentStatusList = list;
                resolve(list);
            }, reject);
        });
    }

    getStagesList() {
        return this.api.getDropdownOptions({dropdown: [
            'sys_billed_order_stage_list' 
            ]}).pipe(
                map((stages: any[]) => {
                    const stageDropdown = find(stages, {name: 'sys_billed_order_stage_list'});
                    this.onStageChanged.next(stageDropdown.options);
                }),
            );
    }
    cloneOrder(id): Promise<any>
    {
        return new Promise((resolve, reject) => {
            const data = {
                id: id,
                orderDate: moment(new Date()).format('YYYY-MM-DD')
            };
            this.api.copyQuoteOrder(data)
                .subscribe((response: any) => {
                    resolve(response);
                }, err => reject(err));
        });
    }
    cloneFulfillment(id): Promise<any>
    {   
        return new Promise((resolve, reject) => {
            const data = {
                id: id,
                copyFulfillment: '1',
                orderDate: moment(new Date()).format('YYYY-MM-DD')
            };
            this.api.copyQuoteOrder(data)
                .subscribe((response: any) => {
                    resolve(response);
                }, err => reject(err));
        });
    }
}
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import * as moment from 'moment';
import { OrderDetails } from 'app/models';


@Injectable()
export class EcommerceOrdersService implements Resolve<any>
{
    orders: any[];
    onOrdersChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onTotalCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
    onOrderTypeListchanged: BehaviorSubject<any> = new BehaviorSubject([]);
    orderType = ['All'];
    
    payload = {
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
            orderType: ['All'],
            orderDate: "",
            bookedDate: "",
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
            accountId: ""
        },
        myViewItems: false,
        type: true,
        completed: false,
        readyToBill: false,
        permUserId: ''
    };

    searchPayload = {
        offset: 0,
        limit: 50,
        order: "",
        orient: "desc",
        search: '',
        type: true,
        completed: false,
        permUserId: ''
    }

    paymentStatusList = [];
    statuses = [];

    constructor(
    private api: ApiService,
    private authService: AuthService,
    ) {
 
    }

    /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        this.clearFilters();
        if(route.data && route.data.helpModule === 'Orders') {
            this.payload.term.orderNo = localStorage.getItem('orders_orderNo') !== null ? localStorage.getItem('orders_orderNo') : ""
            this.payload.term.orderIdentity = localStorage.getItem('orders_orderIdentity') !== null ? localStorage.getItem('orders_orderIdentity') : ""
            this.payload.term.contactName = localStorage.getItem('orders_contactName') !== null ? localStorage.getItem('orders_contactName') : ""
            this.payload.term.accountName = localStorage.getItem('orders_accountName') !== null ? localStorage.getItem('orders_accountName') : ""
            this.payload.term.orderDate = localStorage.getItem('orders_orderDate') !== null ? localStorage.getItem('orders_orderDate') : ""
            this.payload.term.bookedDate = localStorage.getItem('orders_bookedDate') !== null ? localStorage.getItem('orders_bookedDate') : ""
            this.payload.term.totalPrice = localStorage.getItem('orders_totalPrice') !== null ? localStorage.getItem('orders_totalPrice') : ""
            this.payload.term.salesPerson = localStorage.getItem('orders_salesPerson') !== null ? localStorage.getItem('orders_salesPerson') : ""
            this.payload.term.orderStatus = JSON.parse(localStorage.getItem('orders_orderStatus')) !== null ? JSON.parse(localStorage.getItem('orders_orderStatus')) : []
            this.payload.term.paymentStatus = JSON.parse(localStorage.getItem('orders_orderPaymentStatus')) !== null ? JSON.parse(localStorage.getItem('orders_orderPaymentStatus')) : []
            route.queryParams.ordersOnly ? this.orderType = ["Order"] : this.orderType = JSON.parse(localStorage.getItem('orders_orderType')) === null ? ["All"] : JSON.parse(localStorage.getItem('orders_orderType'));
        }
        if(route.data && route.data.helpModule === 'Quotes') {
            console.log("JSON.parse(localStorage.getItem('quotes_orderStatus'))",localStorage.getItem('quotes_orderStatus'))
            this.payload.term.orderNo = localStorage.getItem('quotes_orderNo') !== null ? localStorage.getItem('quotes_orderNo') : ""
            this.payload.term.orderIdentity = localStorage.getItem('quotes_orderIdentity') !== null ? localStorage.getItem('quotes_orderIdentity') : ""
            this.payload.term.contactName = localStorage.getItem('quotes_contactName') !== null ? localStorage.getItem('quotes_contactName') : ""
            this.payload.term.accountName = localStorage.getItem('quotes_accountName') !== null ? localStorage.getItem('quotes_accountName') : ""
            this.payload.term.orderDate = localStorage.getItem('quotes_orderDate') !== null ? localStorage.getItem('quotes_orderDate') : ""
            this.payload.term.bookedDate = localStorage.getItem('quotes_bookedDate') !== null ? localStorage.getItem('quotes_bookedDate') : ""
            this.payload.term.totalPrice = localStorage.getItem('quotes_totalPrice') !== null ? localStorage.getItem('quotes_totalPrice') : ""
            this.payload.term.salesPerson = localStorage.getItem('quotes_salesPerson') !== null ? localStorage.getItem('quotes_salesPerson') : ""
            // this.payload.term.orderStatus = JSON.parse(localStorage.getItem('quotes_orderStatus')) !== null ? JSON.parse(localStorage.getItem('quotes_orderStatus')) : ""
            console.log("this.payload.term.orderStatus",this.payload.term.orderStatus)
            route.queryParams.ordersOnly ? this.orderType = ["Order"] : this.orderType = JSON.parse(localStorage.getItem('quotes_orderType')) === null ? ["All"] : JSON.parse(localStorage.getItem('quotes_orderType'));
         } else {
            route.queryParams.ordersOnly ? this.orderType = ["Order"] : this.orderType = JSON.parse(localStorage.getItem('orders_orderType')) === null ? ["All"] : JSON.parse(localStorage.getItem('orders_orderType'));
         }
         
        if (route.url[0]) {
             if (route.url[0].path === 'quotes') {
                this.orderType = ['Quote']
            }
        }

        if (route.queryParams.refType && route.queryParams.refType == 'Account') {
            this.payload.term.accountName= route.queryParams.assigned;
            this.payload.term.orderStatus = Array.isArray(route.queryParams.status) ? route.queryParams.status : [route.queryParams.status];
        }

        if (route.queryParams.refType && route.queryParams.refType == 'Contact') {
            this.payload.term.contactName = route.queryParams.assigned;
            this.payload.term.orderStatus = Array.isArray(route.queryParams.status) ? route.queryParams.status : [route.queryParams.status];
        }

        if (route.queryParams.refType && route.queryParams.refType == 'User') {
            this.payload.term.salesPerson = route.queryParams.userName;
            this.payload.term.orderStatus = Array.isArray(route.queryParams.status) ? route.queryParams.status : [route.queryParams.status];
            this.payload.term.paymentStatus = Array.isArray(route.queryParams.paymentStatus) ? route.queryParams.paymentStatus : [route.queryParams.paymentStatus];
            if(route.queryParams.orderType == 'StoreOrder') {
                this.orderType = ['StoreOrder'];
            }
        }
        this.payload.term.orderType = this.orderType;
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getOrders(),
                this.getOrdersCount(),
                this.getOrderTypeList(),
                this.getStatues(),
                this.getPaymentStatusList(),
            ]).then(
                () => {
                    resolve();
                },
                reject
            );
        });
    }

    getOrders(isSearchRequired = false): Promise<any>
    {
        return new Promise((resolve, reject) => {
            let data = isSearchRequired? this.searchPayload : this.payload;
            data.permUserId = this.authService.getCurrentUser().userId;
            this.api.post('/content/get-quote-order-list', data)
                .subscribe((response: any) => {
                    console.log("orders response", response);
                    this.orders = response.items;
                    this.onOrdersChanged.next(this.orders);
                    resolve(response);
                }, reject);
        });
    }

    getOrdersCount(isSearchRequired = false): Promise<any>
    {
        return new Promise((resolve, reject) => {
            const data = isSearchRequired? this.searchPayload : this.payload;
            data.permUserId = this.authService.getCurrentUser().userId;
            this.api.post('/content/get-quote-order-count', data)
                .subscribe((response: any) => {
                    this.onTotalCountChanged.next(response.total);
                    resolve(response);
                }, reject);
        });
    }

    getPaymentDetails(id): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/retrieve-payment-info', {oId: id})
                .subscribe((response: any) => {
                    resolve(response);
                }, err => reject(err));
        });
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

    generateCreditMemo(id): Promise<any>
    {
        return new Promise((resolve, reject) => {
            const data = {
                id: id,
                orderDate: moment(new Date()).format('YYYY-MM-DD'),
                orderType: 'CreditMemo',
                orderStatus: 'Billed',
                orderIdentity: 'Billed',
            };
            this.api.copyQuoteOrder(data)
                .subscribe((response: any) => {
                    resolve(response);
                }, err => reject(err));
        });
    }
    
    updatePaymentDetails(data)
    {
        return this.api.post('/content/update-payment-info', data);
    }

    clearFilters() {
        this.payload.term = {
            orderNo: "",
            inHouseOrderNo: "",
            orderIdentity: "",
            contactName: "",
            accountName: "",
            orderType: this.orderType,
            orderDate: "",
            bookedDate: "",
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
            accountId: ""
        };
        this.payload.myViewItems = false;
        this.payload.readyToBill = false;
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

}

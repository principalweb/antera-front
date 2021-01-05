import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';

import { FuseUtils } from '@fuse/utils';

import { Receiving, ReceivingItem, Site, Bin } from './receiving.model';
import { ApiService } from '../../core/services/api.service';

@Injectable()
export class ReceivingsService implements Resolve<any>
{
    onReceivingsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onTotalCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
    onSelectedReceivingsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSearchTextChanged: Subject<any> = new Subject();
    onFilterChanged: Subject<any> = new Subject();
    onReceivingsItemsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSitesChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    receiveChanged: BehaviorSubject<any> = new BehaviorSubject([]);

    receivings: Receiving[];
    selectedReceivings: string[] = [];
    receivingItems: ReceivingItem[];
    received:any = {message:''};

    searchText: string;
    filterBy: string;

    payload = {
        received: 0,
        offset: 0,
        limit: 50,
        order: "orderNumber",
        orient: "desc",
        term: {
            orderNumber: "",
            customerPo: "",
            identity: "",
            orderDate: "",
            customerName: "",
            vendorName: ""
        },
        type: true,
        completed: false
    };

    constructor(
                private http: HttpClient,
                private api: ApiService
                )
    {
    }

    /**
     * The Receivings App Main Resolver
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        if(route.queryParams) {
          this.payload.term.orderNumber = route.queryParams.orderNumber;
          this.payload.term.vendorName = route.queryParams.vendorName;
        }
        return new Promise((resolve, reject) => {

            Promise.all([
                this.getReceivings(),
                this.getReceivingsCount(),
            ]).then(
                ([files]) => {

                    this.onSearchTextChanged.subscribe(searchText => {
                        this.searchText = searchText;
                        this.getReceivings();
                        this.getReceivingsCount();
                    });

                    this.onFilterChanged.subscribe(filter => {
                        this.filterBy = filter;
                        this.getReceivings();
                        this.getReceivingsCount();
                    });

                    resolve();

                },
                reject
            );
        });
    }

    getReceivings(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-po-to-receive', this.payload)
                .subscribe((response: any) => {

                    this.receivings = response;

                    /*if ( this.searchText && this.searchText !== '' )
                    {
                        this.receivings = FuseUtils.filterArrayByString(this.receivings, this.searchText);
                    }*/

                    this.receivings = this.receivings.map(receiving => {
                        return new Receiving(receiving);
                    });

                    this.onReceivingsChanged.next(this.receivings);
                    resolve(this.receivings);
                }, reject);
            }
        );
    }

    getReceivingsCount(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-po-to-receive-count', this.payload)
                .subscribe((response: any) => {
                    this.onTotalCountChanged.next(response.count);
                    resolve(response);
                }, reject);
        });
    }

    getLocations(): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-po-to-receive-count', this.payload)
                .subscribe((response: any) => {
                    this.onTotalCountChanged.next(response.total);
                    resolve(response);
                }, reject);
        });
    }

    getPoProducts(po): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-po-products-to-receive', {orderId:po.id, vendorId:po.vendorId, received: po.received})
                .subscribe((response: any) => {
                    this.receivingItems = response;
                    this.onReceivingsItemsChanged.next(this.receivingItems);
                    resolve(response);
                }, reject);
        });
    }

    getDefaultFob()
    {
        return this.api.post('/content/get-default-site', {});
    }

    getFob(data = {}):  Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-fob-bins', data)
                .subscribe((response: any) => {
                    this.onSitesChanged.next(response);
                    resolve(response);
                }, reject);
        });
    }

    undoReceipt(po, items)
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/inventory-undo-receipt', {po:po,items:items})
                .subscribe(response => {
                    this.received = response;
                    this.receiveChanged.next(response);
                    resolve(response);
                });
        });
    }

    receive(po, items)
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/inventory-receive', {po:po,items:items})
                .subscribe(response => {
                    this.received = response;
                    this.receiveChanged.next(response);
                    resolve(response);
                });
        });
    }

}

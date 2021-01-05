import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, Subject, from } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../../core/services/api.service';
import { PurchaseOrderFromServer, PurchaseOrder} from 'app/models';
import { AuthService } from 'app/core/services/auth.service';
import { Store, select } from '@ngrx/store';
import { POFilters, Meta } from "../state/purchase-orders.state";
import * as PurchaseOrderActions from "app/features/e-commerce/purchase-orders/store/purchase-orders.actions";
import * as moment from 'moment';
import * as purchaseOrderSelectors from "app/features/e-commerce/purchase-orders/state/selectors/purchase-orders.selectors";
import * as fromPurchaseOrder from "app/features/e-commerce/purchase-orders/state/purchase-orders.state";
@Injectable({
    providedIn: 'root'
})
export class PurchaseOrdersService implements Resolve<any>, OnDestroy {
    purchaseOrders: PurchaseOrder[];
    filters: POFilters;
    destroyed$: Subject<boolean> = new Subject();
    meta: Meta;
    totalCount: number;
    statuses: Status[] = [];
    constructor(private api: ApiService, private store: Store<fromPurchaseOrder.State>) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        this.clearFilters();
        this.subscribeToFilters();
        this.getStatuses();
        return this.api.getPurchaseOrders(this.filters, 1, 50).pipe(map((data: PurchaseOrderResponse) => {
            console.log("data", data);
            this.meta = data._meta;
            this.totalCount = this.meta.totalCount;
            return data.data.map(individualPurchaseOrder => new PurchaseOrder(individualPurchaseOrder)
        )})).subscribe((purchaseOrders) => {
            console.log("purchase Orders", purchaseOrders);
            this.store.dispatch(new PurchaseOrderActions.setInitialPurchaseOrders({
                purchaseOrderList: purchaseOrders,
                selectedPurchaseOrder: null,
                loading: false,
                meta: this.meta,
                fetchError: false,
                filters: {
                    label: "",
                    number: "",
                    vendor: "",
                    status: "",
                    hidden: "0"
                    //status: []
                },
            }))
        })
    }

    ngOnDestroy(){
        this.destroyed$.next(true);
    }

    clearFilters(){
        console.log("clearing filters");
    }

    getStatuses(){
        this.api.getStatuses('PurchaseOrder')
        .subscribe((statuses: Status[]) => {
            this.statuses = statuses;
            console.log("statuses", statuses);
        });
    }

    getPurchaseOrders(pageIndex: number, pageSize: number){
        console.log("pageIndex from paginator", pageIndex);
        console.log("pagesize from paginator", pageSize);
        this.store.dispatch(new PurchaseOrderActions.FilterPurchaseOrders({
            filters: this.filters,
            currentPage: pageIndex += 1,
            perPage: pageSize
        }));
    }

    subscribeToFilters() {
        this.store.pipe(takeUntil(this.destroyed$), select(purchaseOrderSelectors.getFilterState))
        .subscribe((filters: POFilters) => this.filters = filters);
        //this.store.select("filters").subscribe(filters => console.log("filters", filters));
    }

    subscribeToCount(){
        this.store.pipe(takeUntil(this.destroyed$), select(purchaseOrderSelectors.getMetaState))
        .subscribe((meta: Meta) => {
            console.log("meta", meta);
            if (meta) this.totalCount = meta.totalCount;
        })
    }

    subscribeToPurchaseOrders() {
        this.store.pipe(takeUntil(this.destroyed$), select(purchaseOrderSelectors.getPurchaseOrderList))
            .subscribe((subscribedPurchaseOrders: PurchaseOrder[]) =>
                this.purchaseOrders = subscribedPurchaseOrders);
    }
    
}

export class PurchaseOrderResponse {
    data: PurchaseOrderFromServer[];
    _links: {
        self: {
            href: string
        }
    };
    _meta: {
        totalCount: number,
        pageCount: number,
        currentPage: number,
        perPage: number
    };
}

export class Status {
    id: string;
    module: string;
    name: string;
}
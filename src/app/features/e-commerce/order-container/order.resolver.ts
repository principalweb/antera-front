import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { OrderDetails } from 'app/models';
import { ApiService } from 'app/core/services/api.service';

@Injectable()
export class OrderResolver implements Resolve<any>
{
    routeParams: any;

    constructor(
        private api: ApiService,
    ) {
    }

    /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any {
        // this.routeParams = route.params;
        // this.getProductAutoComplete();

        // if (this.routeParams.id === 'new') {
        //     return new OrderDetails();
        // }
        // const dropdownOptions = [
        //     'vip_discounts_for_orders_list',
        //     'sys_credit_terms_list',
        //     'sys_shippacct_list'
        // ];

        // return forkJoin([
        //     this.getOrder(this.routeParams.id),
        //     this.getUniversalProductAPIs(),
        //     this.getOrderTypeList(),
        //     // this.getShippinglist(),
        //     // this.getVIPDiscounts(),
        //     this.getDropdownOptionsForOrders(dropdownOptions),
        //     this.getOrderStatusList(),
        //     this.getPaymentTracks(this.routeParams.id),
        //     this.product.getProductPOTypeList(),
        //     this.product.getProductTypeList(),
        //     this.product.getProductStoreList(),
        //     this.product.getProductSourceList(),
        //     this.globalService.loadSysConfig(),
        //     this.globalService.getModuleFields(this.orderModuleFieldParams),
        //     this.api.getAdvanceSystemConfigAll({ module: 'Orders' }),
        // ]);
    }
}
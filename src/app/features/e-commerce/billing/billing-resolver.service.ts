import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { OrderDetails } from '../../../models';
import { EcommerceProductService } from '../product/product.service';
import { GlobalConfigService } from 'app/core/services/global.service';
import { ModuleField } from 'app/models/module-field';
import { map, switchMap, tap, takeUntil } from 'rxjs/operators';


@Injectable()
export class BillingResolverService implements Resolve<any>, OnDestroy
{
    private destroy$ = new Subject<boolean>();

    routeParams: any;
    onOrderChanged: BehaviorSubject<any> = new BehaviorSubject({});

    onOrderTypeListchanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onShippingListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onLocationListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onCommissionListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onPartnerIdentityListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    // onVIPDiscountsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onVIPDiscountsForAccountChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onGetLogoChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onGetDocumentLabelsChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onPaymentTracksChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onOrderPerDocumentsChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onStatusListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onDropdownOptionsForOrdersChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);

    order = new OrderDetails();
    productsList = [];
    universalProductAPIs = [];
    mode = 0;
    selectedLineItemId = '';
    selectedMatrixRows = [];
    selectedLineItemColor = '';
    selectedRowId = 0;
    rootFolderId = '';
    selectedIndex = 0;
    context;
    selectedDocument = '';
    selectedPoVendor = '';
    productUniversalSearch: {
        form: any,
        list: any[],
        eqpVendor: boolean,
        preferredVendor: boolean
    };

    orderModuleFieldParams = 
    {
        offset: 0,
        limit: 100,
        order: 'module',
        orient: 'asc',
        term: { module : 'Orders' }
    }

    constructor(
        private api: ApiService,
        private globalService: GlobalConfigService,
        private product: EcommerceProductService
    ) {
        this.onOrderChanged.pipe(
            takeUntil(this.destroy$),
        ).subscribe((order) => {
            this.order = new OrderDetails(order);
        });
     }

     ngOnDestroy() {
         this.destroy$.next(true);
         this.destroy$.complete();
     }

    /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any
    {
        this.routeParams = route.params;
        // this.getProductAutoComplete();

        if (this.routeParams.id === 'new') {
            return new OrderDetails();
        }
        if (route.queryParams) {
            if (route.queryParams.docType === 'po') {
                this.selectedIndex = 2;
                this.selectedDocument = 'Purchase Order';
                this.selectedPoVendor = route.queryParams.vendor;
            }  else if (route.queryParams.docType === 'decopo') {
                this.selectedIndex = 2;
                this.selectedDocument = 'Decoration PO';
                this.selectedPoVendor = route.queryParams.vendor;
            }  else if (route.queryParams.docType === 'art') { 
                this.selectedIndex = 2;
                this.selectedDocument = 'Art Proof';
            } else {
                this.selectedIndex = 0;
                this.selectedDocument = '';
                this.selectedPoVendor = '';

            }
        }

        const dropdownOptions = [
            'vip_discounts_for_orders_list',
            'sys_credit_terms_list',
            'sys_shippacct_list',
            'order_type_list'
        ];

        return forkJoin([
            this.getOrder(this.routeParams.id),
            this.getUniversalProductAPIs(),
            this.getOrderTypeList(),
            // this.getShippinglist(),
            // this.getVIPDiscounts(),
            this.getDropdownOptionsForOrders(dropdownOptions),
            this.getOrderStatusList(),
            this.getPaymentTracks(this.routeParams.id),
            this.product.getProductPOTypeList(),
            this.product.getProductTypeList(),
            this.product.getProductStoreList(),
            this.product.getProductSourceList(),
            this.globalService.loadSysConfig(),
            this.globalService.getModuleFields(this.orderModuleFieldParams),
            this.api.getAdvanceSystemConfigAll({module: 'Orders'}),
        ]);
    }

    getOrder(id): Observable<any>
    {
        return this.api.getOrderDetails(id).pipe(
            map((order: OrderDetails) => {
                this.order = order;
                this.onOrderChanged.next(order);
                return order;
            })
        );
    }

    getOrderPerDocType(id, docType='invoice'): Observable<any>
    {
        return this.api.getOrderDetailsPerDocType({id: id, docType: docType}).pipe(
            map((order: OrderDetails) => {
               this.onOrderPerDocumentsChanged.next(order);
                return order;
            })
        );
    }

    createOrder(order): Observable<any>
    {
        return this.api.createOrder(order).pipe(
            map((data: any) => {
                this.order = new OrderDetails(data.extra);
                this.onOrderChanged.next(this.order);
                return this.order;
            })
        );
    }

    updateOrder(order): Observable<any>
    {
        return this.api.updateOrder(order).pipe(
            switchMap(() => this.getOrder(order.id))
        );
    }

    // convertQuote(id): Observable<any>
    // {
    //     return this.api.convertQuote(id)
    //         .switchMap(() => this.getOrder(id));
               
    // }

    updateOrderLineItem(lineItem) {
        return this.api.updateLineItem(
            this.order.id,
            lineItem
        ).pipe(
            tap((res) => {
                this.getOrder(this.order.id).subscribe(() => console.log('Refreshing order..'));
            })
        );
    }

    updateOrderLineItemMatrixRows(lineItem, mrows) {
        return this.api.updateLineItemMatrixRows(
            this.order.id,
            lineItem.lineItemUpdateId,
            mrows
        ).pipe(
            tap((res) => {
                this.getOrder(this.order.id).subscribe(() => console.log('Refreshing order..'));
            })
        );
    }

    getDropdownOptionsForOrders(options) {
        return new Promise((resolve, reject) => {
            this.api.getDropdownOptions({dropdown: options})
                .subscribe((response: any[]) => {
                    this.onDropdownOptionsForOrdersChanged.next(response);
                    resolve(response);
                }, err => reject(err));
        });
    }

    getOrderTypeList() {
        const data = {"dropdown":["order_type_list"]};
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-dropdowns', data).subscribe((list: any[]) => {
                this.onOrderTypeListchanged.next(list);
                resolve(list);
            }, reject);
        });
    }
    
    getShippinglist() {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-shipping-methods').subscribe((list: any[]) => {
                this.onShippingListChanged.next(list);
                resolve(list);
            }, reject);
        });
    }

    getOrderStatusList() {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-statuses').subscribe((list: any[]) => {
                this.onStatusListChanged.next(list);
                resolve(list);
            }, reject);
        });
    }

    getLocationsForAccount(accountId){
        const data = {"accountId":accountId};
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-locations-for-account', data).subscribe((list: any[]) => {
                if (list)
                    this.onLocationListChanged.next(list);
                else
                    this.onLocationListChanged.next([]);
                resolve(list);
            }, reject);
        });
    }

    getLocationsForContact(contactId){
        const data = {"contactId":contactId};
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-locations-for-contact', data).subscribe((list: any[]) => {
                if (list)
                    this.onLocationListChanged.next(list);
                else 
                    this.onLocationListChanged.next([]);
                resolve(list);
            }, reject);
        });
    }

    getCommisionsForSalesRep(userId){
        const data = {"userId":userId};
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-commission-for-sales-rep', data).subscribe((list: any[]) => {
                if (list)
                    this.onCommissionListChanged.next(list);
                else 
                    this.onCommissionListChanged.next([]);
                resolve(list);
            }, reject);
        });
    }

    getPartnerIdentityListForSalesRep(salesPersonId){
        const data = {"userId":salesPersonId};
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-partner-identity-for-sales-rep', data).subscribe((list: any[]) => {
                if (list)
                    this.onPartnerIdentityListChanged.next(list);
                else 
                    this.onPartnerIdentityListChanged.next([]);
                resolve(list);
            }, reject);
        });
    }

    getPartnerIdentityListForAccount(accountId){
        const data = {"accountId":accountId};
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-partner-identity-for-account', data).subscribe((list: any[]) => {
                if (list)
                    this.onPartnerIdentityListChanged.next(list);
                else 
                    this.onPartnerIdentityListChanged.next([]);
                resolve(list);
            }, reject);
        });
    }
    
    // getVIPDiscounts(){
    //     return new Promise((resolve, reject) => {
    //         this.api.get('/content/get-discounts').subscribe((list: any[]) => {
    //             this.onVIPDiscountsChanged.next(list);
    //             resolve(list);
    //         }, reject);
    //     });   
    // }

    getVIPDiscountsForAccount(accountId) {
        const data = {"accountId":accountId};
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-discounts-for-account', data).subscribe((list: any[]) => {
                if (list)
                    this.onVIPDiscountsForAccountChanged.next(list);
                else 
                    this.onVIPDiscountsForAccountChanged.next([]);
                resolve(list);
            }, reject);
        });
    }

    getProductAutoComplete()
    {
        // limit: 5000 is hard-coded for now
        this.api.getProductList({}, 0, 5000)
            .subscribe((list: any) => {
                this.productsList = list.map(p => ({
                    id: p.id,
                    productId: p.productId,
                    productName: p.productName,
                    vendorName: p.vendorName,
                    MediaContent: p.MediaContent
                }));
            });
    }

    getUniversalProductAPIs() {
        return this.api.getUniversalApis().pipe(
            map((result: any[]) => {
                this.universalProductAPIs = result;
                return result;
            })
        );
    }

    getAdditionalCharges(id){
        return this.api.getProductAdditionalCharges(id);
    }

    getLogo(): Promise<any[]>
    {
        return new Promise((resolve, reject) => {
            this.api.getLogo()
                .subscribe((response: any) => {
                     this.onGetLogoChanged.next(response);
                     resolve(response);
                }, (err => reject(err)));
        });
    }

    getLogoFromOrder(order) {
        if (order.corporateIdentity && order.corporateIdentity.logo) {
            this.onGetLogoChanged.next({ url: order.corporateIdentity.logo });
        }
    }

    getIdentityLogo(partnerIdentityId = ''): Promise<any[]>
    {
        return new Promise((resolve, reject) => {
            this.api.getIdentityLogo({identityId: partnerIdentityId})
                .subscribe((response: any) => {
                    this.onGetLogoChanged.next(response);
                    resolve(response);
                }, (err => reject(err)));
        });
    }

    getDocumentLabels(partnerIdentityId = ''): Promise<any>
    {
        const data = {cId: partnerIdentityId};
        return new Promise((resolve, reject) => {
            this.api.getDocumentLabels(data)
                .subscribe((response: any) => {
                    this.onGetDocumentLabelsChanged.next(response);
                    resolve(response);
                }, (err => reject(err)));
        });
    }

    inquirePayment(payment)  {

        const payload = {
            oId: payment.orderId,
            trackId: payment.id,
            userId: '',
        };

        return this.api.inquirePayment(payload);
    }


    voidPayment(payment)  {

        const payload = {
            oId: payment.oId,
            trackId: payment.trackId,
            userId: payment.userId,
            amount: payment.amount
        };

        return this.api.voidPayment(payload).pipe(
            tap((res) => {
                this.getOrder(this.order.id);
                this.getPaymentTracks(payload.oId);
            })
        );
    }



    refundPayment(payment)  {
        const payload = {
            oId: payment.oId,
            trackId: payment.trackId,
            userId: payment.userId,
            amount: payment.amount
        };

        return this.api.refundPayment(payload).pipe(
            tap((res) => {
                this.getOrder(this.order.id);
                this.getPaymentTracks(payload.oId);
            })
        );
    }



    deletePayment(payment)  {

        const payload = {
            oId: payment.orderId,
            trackId: payment.id,
            userId: payment.userId,
            creditMemo: payment.creditMemo,
        };

        return this.api.deletePayment(payload).pipe(
            tap((res) => {
                this.getOrder(this.order.id);
                this.getPaymentTracks(payload.oId);
            })
        );
    }

    getPaymentTracks(orderId): Promise<any>
    {
        const data = {oId: orderId};
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-payment-track', data)
                .subscribe((response: any) => {
                    this.onPaymentTracksChanged.next(response);
                    resolve(response);
                }, (err => reject(err)));
        });
    }

    updateOrderStatus(data): Promise<any>
    {
        return new Promise((resolve, reject) => {
            this.api.post('/content/update-order-status', data)
                .subscribe((response: any) => {
                    resolve(response);
                }, (err => reject(err)));
        });
    }

    autocompleteUsers(name){
        return this.api.getUserAutocomplete(name);
    }

    autocompleteContacts(name){
        return this.api.getContactAutocomplete(name);
    }

    autocompleteAccounts(name){
        return this.api.getCustomerAutocomplete(name);
    }

    calculateTax() {
        if(this.order.id) {
            return this.api.post('/content/calculate-tax', {id:this.order.id});
        }
    }

    createOrderToShipStation() {
        if(this.order.id) {
            return this.api.post('/content/ship-station-create-order', {id:this.order.id});
        }
    }

    getOrderShipStation() {
        if(this.order.id) {
            return this.api.post('/content/get-order-ship-station', {id:this.order.id});
        }
    }

    validateCreditLimit(order) {
        return this.api.post('/content/validate-credit-limit', {amount: order.finalGrandTotalPrice, accountId: order.accountId});
    }


}

import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, forkJoin, of, Subject, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { includes } from 'lodash';
import { OrderDetails, Logistic, OrderColors } from 'app/models';
import { EcommerceOrderService } from '../../order.service';
import { ApiService } from 'app/core/services/api.service';
import { OrderFormDialogComponent } from '../../../../shared/order-form-dialog/order-form-dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabGroup, MatTab, MatTabHeader } from '@angular/material/tabs';
import { EcommerceOrdersService } from '../../orders.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectPaymentDialogComponent } from '../../../../shared/select-payment-dialog/select-payment-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { OrderPaymentFormDialogComponent } from '../../components/order-payment-form/order-payment-form.component';
import { GlobalConfigService } from 'app/core/services/global.service';
import { PermissionService } from 'app/core/services/permission.service';
import { FeaturesService } from 'app/core/services/features.service';
import { CustomerViewService } from 'app/core/services/customer-view.service';
import { OrderFormService } from '../../order-form/order-form.service';
import { QbService } from 'app/core/services/qb.service';
import * as moment from 'moment';
import { AuthService } from 'app/core/services/auth.service';
import { switchMap, distinctUntilChanged, catchError, take, takeUntil } from 'rxjs/operators';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { VoidPaymentDialogComponent } from '../../order/void-payment-dialog/void-payment-dialog.component';
import { RefundPaymentDialogComponent } from '../../order/refund-payment-dialog/refund-payment-dialog.component';
import { InventoryTransferComponent } from '../../components/inventory-transfer/inventory-transfer.component';
import { InventoryService } from 'app/core/services/inventory.service';
import { TransferCustomerInventoryDialogComponent } from '../../order/order.component';
import { OrderUnsavedChangesDialogComponent } from '../../order-form/order-unsaved-changes-dialog/order-unsaved-changes-dialog.component';



@Component({
  selector: 'app-billing-details',
  templateUrl: './billing-details.component.html',
  styleUrls: ['./billing-details.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class BillingDetailsComponent implements OnInit, OnDestroy {

    @ViewChild('tabs') tabs: MatTabGroup;

    destroyed$: Subject<boolean> = new Subject();
    order = new OrderDetails();
    onOrderChangedSubscription: Subscription;
    onModuleFieldsChangedSubscription: Subscription;
    onPaymentTracksChangedSubscription: Subscription;
    onQbActiveChangedSubscription: Subscription;

    paymentList = [];
    fields = [];
    loading = false;
    selectedIndex = 0;
    qboActive = false;
    qboInvoicePublished = false;
    qboCmPublished = false;
    qboSynced = true;
    qboCmSynced = false;
    permissionsEnabled: boolean;
    logisticsSubscription: Subscription;
    isLogisticsEnabled: boolean = false;
    sysconfigOrderFormTotalDecimalUpto: string;
    colors = OrderColors;
    editable: boolean;
    data: any;
    transferInventory: boolean = false;
    accountType: string = '';

    // Temporary feature toggle
    newOrderFormEnabled: boolean = false;
    newOrderFormToggled: boolean = false;
    routeData: any;
    user: any;
    forceNewOrderForm: boolean;
    existingRouteReuseStrategy: any;
    ordersConfig: any;
    documentsToUpload = '';

    constructor(
        private orderService: EcommerceOrderService,
        private authService: AuthService,
        private api: ApiService,
        private msg: MessageService,
        private dialog: MatDialog,
        private ordersService: EcommerceOrdersService,
        private router: Router,
        private globalService: GlobalConfigService,
        private qbService: QbService,
        private inventoryService: InventoryService,
        private permService: PermissionService,
        private featureService: FeaturesService,
        private route: ActivatedRoute,
        public customerViewService: CustomerViewService,
        private orderFormService: OrderFormService,
    ) {
    }

    ngOnInit() {
        // Subscribe to update order on changes
        this.existingRouteReuseStrategy = this.router.routeReuseStrategy.shouldReuseRoute;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;

        // Temporary hack to intercept tab change
        if(this.tabs) {
            this.tabs._handleClick = this.interceptTabChange.bind(this);
        }
        this.routeData = this.route.snapshot.data && this.route.snapshot.data.data;

        this.ordersConfig = this.routeData && this.routeData[12];

        this.user = this.authService.getCurrentUser();

        this.configureOrderFormV2();

        this.editable = false;
        this.orderService.context = 'order';
        this.sysconfigOrderFormTotalDecimalUpto = '1.2-2';
        this.onOrderChangedSubscription =
            this.orderService.onOrderChanged.pipe(
                takeUntil(this.destroyed$),
                switchMap((order) => of(order)),
                distinctUntilChanged(),
            ).subscribe(order => {
                this.order = new OrderDetails(order);

                this.configureLockedInvoice();
                this.configureLogisticsIfEnabled();

                console.log("Order -> ", this.order);
                this.selectedIndex = this.orderService.selectedIndex;
                this.orderService.getLogo();
                this.orderService.getDocumentLabels(this.order.partnerIdentityId);
                // Get locations, commissions, partner identy lists
                this.orderService.getCommisionsForSalesRep(this.authService.getCurrentUser().userId);
                this.orderService.getLocationsForAccount(this.order.accountId);
                this.orderService.getLocationsForContact(this.order.contactId);
                this.orderService.getPartnerIdentityListForAccount(this.order.accountId);
                this.orderService.getPartnerIdentityListForSalesRep(this.order.salesPersonId);
                this.checkTransferInventory();
            });

        this.onPaymentTracksChangedSubscription =
            this.orderService.onPaymentTracksChanged
                .subscribe((list: any) => {
                    this.paymentList = list.payments;
                });

        this.onModuleFieldsChangedSubscription =
            this.globalService.onModuleFieldsChanged
                .subscribe((fields: any[]) => {
                    this.fields = fields;
                });

        this.onQbActiveChangedSubscription =
            this.qbService.onQbActiveChanged
                .subscribe((res: boolean) => {
                    if (res) {
                        this.qboActive = this.qbService.getActiveConnector() == "QBO" ? true : false;
                    }
                });

        this.qbService.entityStatus('Invoice', this.order.id)
            .then((res: any) => {
                this.qboInvoicePublished = res.status == '1' ? true : false;
            }).catch((err) => {
                this.msg.show(err, 'error');
            });

        this.qbService.entityStatus('CreditMemo', this.order.id)
            .then((res: any) => {
                this.qboCmPublished = res.status == '1' ? true : false;
                this.qboCmSynced = this.qboCmPublished;
            }).catch((err) => {
                this.msg.show(err, 'error');
            });

        this.permService.getPermissionStatus().subscribe((res: any) => {
            if (res == '0' || res == 0 || res == false) {
                res = false;
            } else {
                res = true;
            }

            this.permissionsEnabled = res;
        });
        this.checkTransferInventory();
    }

    private checkTransferInventory() {
        this.transferInventory = false;
        this.accountType = '';
        this.inventoryService.checkTransferInventory(this.order.accountId, this.order.id)
            .subscribe((response: any) => {
                if (response.transferInventory) {
                    this.transferInventory = true;
                    this.accountType = response.type;
                } else {
                    this.transferInventory = false;
                    this.accountType = '';
                }
            });
    }

    public toggleNewOrderForm() {
        this.newOrderFormToggled = !this.newOrderFormToggled;
        localStorage.setItem('features.order-form-v2.toggled', this.newOrderFormToggled ? '1' : '0');
    }

    private configureLockedInvoice() {
        let editable = true;
        if (this.user.userType === 'AnteraAdmin') {
            this.editable = editable;
            return;
        }
        if (this.routeData[12] && this.routeData[12] && this.routeData[12].settings) {
            const settings = this.routeData[12].settings;

            const status = this.order.orderStatus.toLowerCase();
            if (settings.lockInvoicedOrders == '1' && status === 'billed') {
                editable = false;
            }
        }
        this.editable = editable;
    }

    private configureOrderFormV2() {
        if (this.routeData[12] && this.routeData[12] && this.routeData[12].settings) {
            const settings = this.routeData[12].settings;

            if (settings.enableOrderFormV2 == '1') {
                this.newOrderFormEnabled = true;
            }

            if (settings.forceOrderFormV2 == '1') {
                this.newOrderFormToggled = true;
                this.forceNewOrderForm = true;
            } else {
                const isOrderFormAlreadyToggled = +localStorage.getItem('features.order-form-v2.toggled') || 0;
                if (isOrderFormAlreadyToggled && this.newOrderFormEnabled) {
                    this.newOrderFormToggled = true;
                }
            }
        }
    }

    private configureLogisticsIfEnabled() {
        this.logisticsSubscription = this.featureService.isLogisticsEnabled().subscribe((enabled) => {
            if (enabled) {
                const sourceParams = {
                    'limit': 50,
                    'offset': 0,
                    'order': 'dateEntered',
                    'orient': 'desc',
                    'term': {
                        'quoteId': this.order.id
                    }
                };
                this.api.getSourcingSubmissionsList(sourceParams).subscribe((res: any[]) => {
                    if (!res.length) {
                        this.isLogisticsEnabled = false;
                        return;
                    }
                    this.isLogisticsEnabled = true;
                });
            }
        });
    }

    ngAfterViewInit() {

    }

    ngOnDestroy() {
        this.destroyed$.next(true);
        this.destroyed$.complete();

        this.router.routeReuseStrategy.shouldReuseRoute = this.existingRouteReuseStrategy;

        if (this.onOrderChangedSubscription) this.onOrderChangedSubscription.unsubscribe();
        if (this.onPaymentTracksChangedSubscription) this.onPaymentTracksChangedSubscription.unsubscribe();
        if (this.onModuleFieldsChangedSubscription) this.onModuleFieldsChangedSubscription.unsubscribe();
    }

    createOrderToShipStation() {
        if (this.orderService.order.id) {
            this.orderService.createOrderToShipStation()
                .subscribe((response: any) => { });
        }
    }

    cancelOrder() {
        const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to cancel this order?';

        confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.updateOrderStatus('Cancelled');
            }
        });
    }
    generateCreditMemo() {
        this.loading = true;
        this.ordersService.generateCreditMemo(this.order.id)
            .then((res) => {
                this.loading = false;
                if (res.status === 'success') {
                    this.msg.show('Credit memo generated successfully.', 'success');
                    const id = res.extra.id;
                    this.router.navigate(['e-commerce/orders', id]);
                }
                else {
                    this.msg.show(res.msg, 'error');
                }
            }).catch((err) => {
                this.loading = false;
                this.msg.show(err.message, 'error');
            });
    }
    updateOrderStatus(status) {
        if (status == 'Billed' && this.accountType == "distributorSale") {
            let dialogRef = this.dialog.open(TransferCustomerInventoryDialogComponent, {
                width: '500px',
            });
            dialogRef.afterClosed().subscribe(result => {
                if (!result) return;
                if (result == 'Transfer') {
                    this.openTransferInventory(this.accountType);
                }
                else {
                    this.accountType = "distributor";
                    this.updateOrderStatus(status);
                }
            });
            return;
        }
        this.loading = true;
        this.orderFormService.order$.pipe(
            take(1),
        ).subscribe((order) => {
            const updatedData = {
                ...this.order,
                orderStatus: status
            };

            this.api.updateOrder(updatedData)
                .subscribe((data: any) => {
                    this.loading = false;
                    this.checkTransferInventory();

                    if (data.status === 'error') {
                        this.msg.show(data.msg, 'error');
                        return;
                    }

                    this.order = new OrderDetails(data.extra);
                    this.orderService.onOrderChanged.next(this.order);
                    this.msg.show('Order updated successfully.', 'success');
                    switch (status) {
                        case 'Booked': {
                            this.createLogisticIfEnabled();
                            this.createOrderToShipStation();
                            break;
                        }
                        case 'Billed': {
                            this.selectedIndex = 2;
                            this.updateInvoiceDate(this.order.id, moment(new Date()).format('YYYY-MM-DD'));
                            this.publishInvoiceToQBO();
                            break;
                        }
                        case 'Void': {
                            this.selectedIndex = 12;
                            this.updateVoidDate(this.order.id);
                            break;
                        }
                        case 'Cancelled': {
                            this.deleteLogisticIfEnabled();
                            this.router.navigate(['/e-commerce/orders']);
                            break;
                        }

                        default: {
                            break;
                        }
                    }
                    this.orderService.getOrder(this.order.id);
                    this.orderFormService.loadOrder(this.order.id);
                }, (err) => {
                    this.loading = false;
                    this.msg.show('Error occured while updating the order', 'error');
                });
        });
    }

    private deleteLogisticIfEnabled() {
        if (!this.isLogisticsEnabled) {
            return;
        }
        this.api.getLogisticsList({ term: { orderId: this.order.id } }).pipe(
            switchMap((orders: any[]) => {
                const ids = orders.map((order) => order.id);
                return this.api.deleteLogistics(ids);
            })
        ).subscribe((res) => {
            //
        });
    }

    private createLogisticIfEnabled() {
        if (!this.isLogisticsEnabled) {
            return;
        }
        const user = this.authService.getCurrentUser();
        const payload = new Logistic({
            'orderId': this.order.id,
            'createdByName': user.name,
            'createdById': user.id,
            'modifiedByName': user.name,
            'modifiedById': user.id,
            'cutOffDate': '0000-00-00 00:00:00',
            'ETD': '0000-00-00 00:00:00',
            'ETA': '0000-00-00 00:00:00',
            'ATD': '0000-00-00 00:00:00',
            'bookingConfirmation': '',
            'ISF': '0',
            'loadNumber': '',
            'customsCleared': '0',
            'freightAvailableDate': '0000-00-00 00:00:00',
            'inRoute': '0',
            'trackingNumber': '',
            'plannedDeliveryDate': '0000-00-00 00:00:00',
            'actualDeliveryDate': '0000-00-00 00:00:00',
            'comments': '',
            'POD': '0'
        });
        this.api.createLogistic(payload).subscribe((res) => {
            console.log('Logistic Created', res);
        });
    }

    editOrder(event) {
        this.loading = true;
        const updatedData = {
            ...this.order,
            ...event.data
        };
        this.api.updateOrder(updatedData)
            .subscribe((data: any) => {
                this.loading = false;
                this.order = new OrderDetails(data.extra);
                this.orderService.onOrderChanged.next(this.order);
                this.msg.show('Order updated successfully.', 'success');
            }, (err) => {
                this.loading = false;
                this.msg.show('Error occured while updating the order', 'error');
            });
    }

    receivePayment() {
        let dialogRef;
        dialogRef = this.dialog.open(SelectPaymentDialogComponent, {
            panelClass: 'select-payment-dialog',
            data: {
                accountId: this.order.accountId
            }
        });
        dialogRef.afterClosed()
            .subscribe(data => {
                if (data && data.type) {
                    this.editPaymentEntries(this.order, data.type);
                }
            });
    }

    editPaymentEntries(order, type) {
        let dialogRef;
        dialogRef = this.dialog.open(OrderPaymentFormDialogComponent, {
            panelClass: 'order-payment-dialog',
            data: {
                paymentTracks: this.paymentList,
                service: this.ordersService,
                order: order,
                paymentType: type
            }
        });
        dialogRef.afterClosed()
            .subscribe((data) => {
                if (data && data.action === 'updated') {
                    this.ordersService.getPaymentDetails(order.id)
                        .then(pInfo => {
                            order.paymentStatus = pInfo.paymentStatus;
                        });
                }
                this.orderService.getOrder(this.order.id);
                this.orderFormService.loadOrder(this.order.id);
                this.orderService.getPaymentTracks(this.order.id);
            });
    }

    updateInvoiceDate(orderId, date) {
        let data = { oId: orderId, date: date };
        this.api.updateInvoiceDate(data)
            .subscribe((res: any) => {
                console.log(res);
            }, err => {
                console.log(err);
            });
    }

    updateVoidDate(orderId) {
        let data = { oId: orderId };
        this.api.updateVoidDate(data)
            .subscribe((res: any) => {
                console.log(res);
            }, err => {
                console.log(err);
            });
    }

    publishCmToQBO() {
        if (this.qboActive) {
            this.loading = true;
            this.qboCmSynced = false;
            this.qbService.pushEntity('CreditMemo', this.order.id)
                .then((res: any) => {
                    if (res.error == true) {
                        this.msg.show(res.msg, 'error');
                        this.qboCmPublished = false;
                        this.loading = false;
                    }
                    else {
                        this.msg.show(res.msg, 'success');
                        this.qboCmPublished = true;
                        this.loading = false;
                    }
                    this.qboCmSynced = true;
                }).catch((err) => {
                    this.loading = false;
                    this.qboCmPublished = false;
                    this.qboCmSynced = true;
                    this.msg.show(err.message, 'error');
                });
        }
        else {
            this.msg.show('QB is not active.', 'error');
        }
    }

    inquirePayment(payment) {
        if (payment.paymentMethod === 'Credit Card') {
            this.orderService.inquirePayment(payment).subscribe(res => {
                return res;
            });
        } else {
            this.msg.show('Invalid Payment Type. Request Not Proceed.', 'error');
        }
    }

    voidPayment(payment) {
        //  let partial = false;
        let paymentValid = false;
        const dialogRef = this.dialog.open(VoidPaymentDialogComponent, {
            data: {
                payment: payment,
                service: this.orderService,
                paymentValid: paymentValid
            }
        });
    }

    refundPayment(payment) {
        let paymentValid = false;
        const dialogRef = this.dialog.open(RefundPaymentDialogComponent, {
            data: {
                payment: payment,
                service: this.orderService,
                paymentValid: paymentValid
            }
        });
    }


    deletePayment(payment) {

        payment.creditMemo = false;
        payment.userId = this.authService.getCurrentUser().userId;
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        dialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this payment?';

        dialogRef.afterClosed().subscribe(confirmed => {

            if (!confirmed) {
                return;
            }


            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });


            dialogRef.componentInstance.confirmMessage = 'Do you you want to Apply Credit to the Account?';
            dialogRef.afterClosed().subscribe(confirmed => {
                if (confirmed) {
                    payment.creditMemo = true;
                }
                this.orderService.deletePayment(payment).subscribe((res: any) => {
                    if (!res.success) {
                        this.msg.show(`Error deleting payment - ${res.msg}`, 'error');
                    } else {
                        this.msg.show('Payment deleted', 'success');
                    }
                });
            });
        });
    }

    voidInvoiceToQBO() {
        if (this.qboActive) {
            this.loading = true;
            this.qboSynced = false;
            this.qbService.voidEntity('Invoice', this.order.id)
                .then((res: any) => {
                    this.qboSynced = true;
                    if (res.code != '200') {
                        this.msg.show(res.msg, 'error');
                        this.loading = false;
                    }
                    else {
                        this.msg.show(res.msg, 'success');
                        this.loading = false;
                    }
                }).catch((err) => {
                    this.loading = false;
                    this.msg.show(err.message, 'error');
                });
        }
    }

    publishInvoiceToQBO() {
        if (this.qboActive) {
            this.loading = true;
            this.qboSynced = false;
            this.qbService.pushEntity('Invoice', this.order.id)
                .then((res: any) => {
                    this.qboSynced = true;
                    if (res.code != '200') {
                        this.msg.show(res.msg, 'error');
                        this.qboInvoicePublished = false;
                        this.loading = false;
                    }
                    else {
                        this.msg.show(res.msg, 'success');
                        this.qboInvoicePublished = true;
                        this.loading = false;
                        if (this.order.orderStatus === 'Booked') {
                            this.updateOrderStatus('Billed');
                        }
                    }
                }).catch((err) => {
                    this.loading = false;
                    this.qboInvoicePublished = false;
                    this.qboSynced = true;
                    this.msg.show(err.message, 'error');
                });
        }
        else {
            if (this.order.orderStatus === 'Booked') {
                this.updateOrderStatus('Billed');
            }
        }
    }

    openTransferInventory(accountType = 'distributor') {
        let dialog = this.dialog.open(InventoryTransferComponent, {
            panelClass: 'inventory-transfer',
            data: { orderId: this.order.id, accountId: this.order.accountId, accountType: accountType }
        });
        dialog.afterClosed()
            .subscribe((response: any) => {
                if (accountType == 'distributorSale' && response == 'Billed') {
                    this.accountType = 'distributor';
                    this.updateOrderStatus('Billed');
                }
            });
    }

    validateCreditLimit(status) {
        if (status == 'Booked'
            && (this.order.orderType.toLowerCase() == 'order' || this.order.orderType.toLowerCase() === 'webstore' || this.order.orderType.toLowerCase() === 'storeorder')) {
            this.orderService.validateCreditLimit(this.order).subscribe((res: any) => {
                if (res.data == false) {
                    this.msg.show("This customer is over their allowed credit limit. To book this order, the customer must be below the sum of the current credit balance and the total of the order to be booked.", 'error');
                    return;
                }

                this.updateOrderStatus(status);
            });
        }

    }

    interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
        const args = arguments;
        this.canDeactivate().subscribe((result) => {
            return result && MatTabGroup.prototype._handleClick.apply(this.tabs, args);
        });
    }

    canDeactivate(): Observable<boolean> {

        return Observable.create(observable => {

            this.orderFormService.config$.pipe(
                take(1),
            ).subscribe((config) => {

                if (!config.dirty) {
                    observable.next(true);
                    observable.complete();
                    return;
                }

                const confirmDialogRef = this.dialog.open(OrderUnsavedChangesDialogComponent);
                confirmDialogRef.afterClosed().subscribe(result => {

                    // Cancel and don't do anything
                    if (!result || result === 'cancel') {
                        observable.next(false);
                        observable.complete();
                    }

                    // Save and continue
                    if (result === 'save') {
                        this.orderFormService.saveIfDirty().subscribe((res) => {
                            observable.next(true);
                            observable.complete();
                        });
                    }

                    // Discard and continue
                    if (result === 'discard') {
                        this.orderFormService.load(this.order.id);
                        observable.next(true);
                        observable.complete();
                    }
                });
            });
        });
    }

    removeDocumentsToUpload() {
        this.documentsToUpload = '';
    }
}

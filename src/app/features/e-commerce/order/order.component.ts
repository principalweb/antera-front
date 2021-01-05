import { Component, OnDestroy, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { Subscription, forkJoin, of, Subject, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { OrderDetails, Logistic, OrderColors } from '../../../models';
import { EcommerceOrderService } from '../order.service';
import { MessageService } from 'app/core/services/message.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabGroup, MatTab, MatTabHeader } from '@angular/material/tabs';
import { EcommerceOrdersService } from '../orders.service';
import { OrderPaymentFormDialogComponent } from '../components/order-payment-form/order-payment-form.component';
import { SelectPaymentDialogComponent } from 'app/shared/select-payment-dialog/select-payment-dialog.component';
import { SimpleChatDialogComponent } from 'app/shared/simple-chat-dialog/simple-chat-dialog.component';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { GlobalConfigService } from 'app/core/services/global.service';
import { QbService } from 'app/core/services/qb.service';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
import { PermissionService } from 'app/core/services/permission.service';
import { FeaturesService } from 'app/core/services/features.service';
import { switchMap, distinctUntilChanged, catchError, take, takeUntil, startWith, map } from 'rxjs/operators';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { VoidPaymentDialogComponent } from '../order/void-payment-dialog/void-payment-dialog.component';
import { RefundPaymentDialogComponent } from '../order/refund-payment-dialog/refund-payment-dialog.component';
import { InventoryTransferComponent } from '../components/inventory-transfer/inventory-transfer.component';
import { InventoryService } from 'app/core/services/inventory.service';
import { CustomerViewService } from 'app/core/services/customer-view.service';
import { OrderFormService } from '../order-form/order-form.service';
import { OrderUnsavedChangesDialogComponent } from '../order-form/order-unsaved-changes-dialog/order-unsaved-changes-dialog.component';
import { AwsFileManagerComponent } from 'app/shared/aws-file-manager/aws-file-manager.component';
import { AwsCreateDirComponent } from 'app/shared/aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from 'app/shared/aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from 'app/shared/aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from 'app/shared/aws-rename-dir/aws-rename-dir.component';
import { SocketService } from 'app/core/services/socket.service';
import { SocketMessage } from 'app/models/socket-message';
import { HttpErrorResponse } from '@angular/common/http';
import { PoSyncComponent } from '../order-form/po-sync/po-sync.component';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { NoteService } from 'app/main/note.service';
import { CurrencyService } from 'app/features/admin/currency/currency.service';
import { IntegrationService } from 'app/core/services/integration.service';
@Component({
    selector: 'fuse-e-commerce-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FuseEcommerceOrderComponent implements OnInit, OnDestroy {

    @ViewChild('tabs') tabs: MatTabGroup;
    @ViewChild(AwsFileManagerComponent) awsfilemanager: AwsFileManagerComponent;
    @ViewChild(AwsCreateDirComponent) awscreatedircomponent: AwsCreateDirComponent;
    @ViewChild(AwsDocViewerComponent) awsdocviewercomponent: AwsDocViewerComponent;
    @ViewChild(AwsTaggingComponent) awstaggingcomponent: AwsTaggingComponent;
    @ViewChild(AwsRenameDirComponent) awsrenamedircomponent: AwsRenameDirComponent;

    destroyed$: Subject<boolean> = new Subject();
    order = new OrderDetails();
    onOrderChangedSubscription: Subscription;
    onModuleFieldsChangedSubscription: Subscription;
    onPaymentTracksChangedSubscription: Subscription;
    onQbActiveChangedSubscription: Subscription;
    bookingOrderNotSentShipStation:boolean = false;
    paymentList = [];
    fields = [];
    currencyEnabled: boolean = false;
    loading = false;
    selectedIndex = 0;
    qboActive = false;
    qbConnection = '';
    qboInvoicePublished = false;
    qboCmPublished = false;
    qboSynced = true;
    qboCmSynced = false;
    qboPoStatus = {color: '', status: ''};
    permissionsEnabled: boolean;
    logisticsSubscription: Subscription;
    isLogisticsEnabled: boolean = false;
    sysconfigOrderFormTotalDecimalUpto: string;
    colors = OrderColors;
    editable: boolean;
    isVouched: boolean = false;
    data: any;
    transferInventory: boolean = false;
    accountType: string = '';
    userType: string = '';
    customerPO_required = false;
    // Temporary feature toggle
    newOrderFormEnabled: boolean = false;
    newOrderFormToggled: boolean = false;
    routeData: any;
    user: any;
    forceNewOrderForm: boolean;
    existingRouteReuseStrategy: any;
    ordersConfig: any;
    awsFileManagerType = 'orders';

    private _socketSub: Subscription;
    socketMessage: SocketMessage;
    socketEditors = [];
    chatButtonColor="accent";
    documentsToUpload = '';
    invoiceShow = true;

    constructor(
        public orderService: EcommerceOrderService,
        public currencyService: CurrencyService,
        private authService: AuthService,
        public noteService: NoteService,
        private accountService: AccountsService,
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
        private socket: SocketService,
        private integrationService: IntegrationService
    ) {
    }

    ngOnInit() {

        this.accountService.checkAdminFeeEnabled(); 
        this.subscribeToCurrencyEnabled();
        this.userType = this.authService.getCurrentUser().userType;
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


                // Get locations, commissions, partner identy lists
                this.orderService.getCommisionsForSalesRep(this.authService.getCurrentUser().userId);
                if (this.order.accountId != order.accountId) {
                    this.orderService.getLocationsForAccount(order.accountId);
                }

                if (this.order.contactId != order.contactId) {
                    this.orderService.getLocationsForContact(this.order.contactId);
                }

                if (this.order.accountId != order.accountId) {
                    this.orderService.getPartnerIdentityListForAccount(this.order.accountId);
                }

                if (this.order.salesPersonId != order.salesPersonId) {
                    this.orderService.getPartnerIdentityListForSalesRep(this.order.salesPersonId);
                }

                this.order = new OrderDetails(order);                
                this.checkInvoiceReceipt()               
                this.orderService.orderDetails.next(this.order);
                this.configureLockedVouched();
                this.configureLockedInvoice();
                this.configureLogisticsIfEnabled();

                this.selectedIndex = this.orderService.selectedIndex;
                this.orderService.getLogo();
                this.orderService.getDocumentLabels(this.order.partnerIdentityId);

                this.checkTransferInventory();

                this.qbService.orderPoStatus(this.order.id)
                    .then((res: any) => {
                      this.qboPoStatus = res;
                    }).catch((err) => {
                        this.msg.show(err, 'error');
                    });
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
                        this.qbConnection = this.qbService.getActiveConnector();
                        this.qboActive = this.qbConnection == 'QBO' || this.qbConnection == 'XERO' ? true : false;
                    }
                });

        this.qbService.orderPoStatus(this.order.id)
            .then((res: any) => {
              this.qboPoStatus = res;
            }).catch((err) => {
                this.msg.show(err, 'error');
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
        this.api.getAccountDetails(this.order.accountId)
            .subscribe((account: any) => {
            if (!account) {        
                this.loading = false;
                return;
            }else{        
                if(account.customerPO) {
                    if(account.customerPO === '1') {
                        this.customerPO_required = true;
                    } else {
                        this.customerPO_required = false;
                    }
                }
                console.log("this.customerPO_required",this.customerPO_required);
                if(account.bookingOrderNotSentShipStation) {
                    if(account.bookingOrderNotSentShipStation === '1') {
                        this.bookingOrderNotSentShipStation = true;
                    } else {
                        this.bookingOrderNotSentShipStation = false;
                    }

                }       
            
            }
        });
       
        this.socket.connect();

        this._socketSub = this.socket.currentOrder.pipe(
            map(socketMessage => {
                this.socketMessage = socketMessage;
                this.socketEditors = socketMessage.clients;
            }),
        ).subscribe(socketMessage => this.msg.show(this.socketMessage.response, 'success'));

        this.socket.joinRoom(this.order.id);
        this.socket.orderEdited({id: this.order.id, data: {user: this.user}});
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

    interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
        const args = arguments;
        this.canDeactivate().subscribe((result) => {
            return result && MatTabGroup.prototype._handleClick.apply(this.tabs, args);
        });
    }

    handleRefresh(){
        this.api.processOrderExchangeRate({id: this.order.id}).pipe(take(1)).subscribe(res => 
            {
                this.orderService.getOrder(this.order.id);
                this.orderFormService.loadOrder(this.order.id);
                this.orderService.getPaymentTracks(this.order.id);
            }, error => console.log("refresh exchange rate error", error));
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

    private configureLockedVouched() {
        let isVouched = false;
        if (this.user.userType === 'AnteraAdmin') {
            this.isVouched = isVouched;
            return;
        }
        if (this.routeData[12] && this.routeData[12] && this.routeData[12].settings) {
            const settings = this.routeData[12].settings;

            const status = this.order.orderStatus.toLowerCase();
            if (settings.lockVouchedOrders == '1' && status === 'booked') {
                this.api.isOrderVouched({id:this.orderService.order.id, orderStatus: 'Booked'}).subscribe(
                    (res: any) => {
                        if (res.vouched) {
                            this.isVouched = true;
                            return;
                        }
                        this.isVouched = false;
                    },
                    (err: any) => {
                        this.msg.show(err.error.msg, 'error')
                        this.isVouched = false;
                    }
                );
            }
            if (settings.lockVouchedOrders == '1' && status === 'billed') {
                this.api.isOrderVouched({id:this.orderService.order.id, orderStatus: 'Billed'}).subscribe(
                    (res: any) => {
                        if (res.vouched) {
                            this.isVouched = true;
                            return;
                        }
                    },
                    (err: HttpErrorResponse) => {
                        this.msg.show(err.error.msg, 'error');
                        this.isVouched = false;
                    }
                );
            }
        }
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

        this.updateTabIndex();
        //** Initialize tab index in notes service */
    }

    public updateTabIndex() {
        if (this.tabs.selectedIndex != undefined &&
            this.tabs.selectedIndex != null)
            this.noteService.formatIndex(this.tabs.selectedIndex);
    }

    subscribeToCurrencyEnabled(){
        this.currencyService.currencySettings
          .pipe(takeUntil(this.destroyed$))
          .subscribe(settings => {
            this.currencyEnabled = settings.enableCurrency === "1";
          });
    }

    ngOnDestroy() {
        this.destroyed$.next(true);
        this.destroyed$.complete();
        this.noteService.currentTab.next("");
        this.router.routeReuseStrategy.shouldReuseRoute = this.existingRouteReuseStrategy;

        if (this.onOrderChangedSubscription) this.onOrderChangedSubscription.unsubscribe();
        if (this.onPaymentTracksChangedSubscription) this.onPaymentTracksChangedSubscription.unsubscribe();
        if (this.onModuleFieldsChangedSubscription) this.onModuleFieldsChangedSubscription.unsubscribe();
        if (this._socketSub) this._socketSub.unsubscribe();
        this.socket.orderExited({id: this.order.id, data: {user: this.user}});
    }

    calculateTax() {
        this.orderService.autoTaxJar()
            .subscribe((response: any) => {
                if(response.autoTaxCalc > 0) {
                    if (this.orderService.order.id) {
                        this.orderService.calculateTax()
                            .subscribe((response: any) => { });
                    }
                }
        });
    }

    createOrderToShipStation() {
        if (this.orderService.order.id) {
            this.integrationService.connectorGetConfig("SHIPSTATION", { 0: "enabled", 1:"bookingOrderNotSentShipStation"}).subscribe((response:any) => {
                if(response.enabled == "1") { 
                    if(response.bookingOrderNotSentShipStation == "0") {
                        if(!this.bookingOrderNotSentShipStation) {
                            this.orderService.createOrderToShipStation()
                                .subscribe((response: any) => { });
                        }
                    } else if(!this.bookingOrderNotSentShipStation) {
                        this.orderService.createOrderToShipStation()
                        .subscribe((response: any) => { });
                    }
                } 
            });
        }
    }

    createPurchaseOrderNeed() {
        if (this.orderService.order.id) {
            this.orderService.createPurchaseOrderNeed()
                .subscribe((response: any) => { });
        }
    }

    createPendingInvoice(){
        if (this.orderService.order.id) {
            this.orderService.createPendingInvoice()
                .subscribe((response: any) => {
                    console.log("pending invoice response", response);
                 });
        }
    }

    processOrderExchangeRate(){
        if (this.orderService.order.id){
            this.orderService.processOrderExchangeRate()
                .subscribe((response: any) => {
                    console.log("pending invoice response", response);
                });
        }
    }

    invoiceOrder() {
            this.orderFormService.config$.pipe(
                take(1),
            ).subscribe((config) => {
                if(config.dirty){
                        const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                            disableClose: false
                        });
                        confirmDialogRef.componentInstance.confirmMessage = 'You have unsaved changes which would be lost if you proceed. Are you sure you wish to discard these changes and invoice the order?';
                        confirmDialogRef.afterClosed().subscribe(result => {
                            if (result) {
                                this.updateOrderStatus('Billed');
                                console.log('discard');
                            }else{
                                console.log('wait');
                            }
                        });        
                }else{
                    this.updateOrderStatus('Billed');
                    console.log('no change');
                }            
            });
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

                    this.qbService.entityStatus('Invoice', this.order.id)
                      .then((res: any) => {
                        this.qboInvoicePublished = res.status == '1' ? true : false;
                      }).catch((err) => {
                        this.msg.show(err, 'error');
                      });

                    this.qbService.orderPoStatus(this.order.id)
                        .then((res: any) => {
                          this.qboPoStatus = res;
                        }).catch((err) => {
                            this.msg.show(err, 'error');
                        });
                    this.orderService.onOrderChanged.next(this.order);
                    this.msg.show('Order updated successfully.', 'success');
                    switch (status) {
                        case 'Booked': {
                            this.createLogisticIfEnabled();
                            this.createOrderToShipStation();
                            this.createPurchaseOrderNeed();
                            this.createPendingInvoice();
                            this.processOrderExchangeRate();
                            break;
                        }
                        case 'Billed': {
                            //this.selectedIndex = 2;
                            this.updateInvoiceDate(this.order.id, moment(new Date()).format('YYYY-MM-DD'));
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
                    if(status != 'Billed'){
                        this.orderService.getOrder(this.order.id);
                        this.orderFormService.loadOrder(this.order.id);
                    }

                }, (err) => {
                    this.loading = false;
                    if (err && err.error && err.error.msg) {
                      this.msg.show(err.error.msg, 'error');
                    } else {
                      this.msg.show('Error occured while updating the order', 'error');
                    }
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
                this.orderFormService.setOrder(this.order);
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

    openPoSync() {
        let dialogRef;
        const data = {
            order: this.order
        };

        dialogRef = this.dialog.open(PoSyncComponent, {
            panelClass: 'antera-details-dialog',
            data: data
        });
      dialogRef.afterClosed().subscribe((res) => {
        this.qbService.orderPoStatus(this.order.id)
          .then((res: any) => {
            this.qboPoStatus = res;
          }).catch((err) => {
              this.msg.show(err, 'error');
          });
      });
    }

    openCurrentEditors() {
        let dialogRef;
        const data = {
            users: this.socketEditors,
            header: "Order# " + this.order.orderNo,
            socketId: this.order.id
        }

        dialogRef = this.dialog.open(SimpleChatDialogComponent, {
            panelClass: 'simple-chat-dialog',
            data: data
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
        this.loading = true;
        let data = { oId: orderId, date: date };
        this.api.updateInvoiceDate(data)
            .subscribe((res: any) => {
                console.log(res);
                this.loading = false;
                this.orderService.getOrder(this.order.id);
                this.orderService.selectedIndex = 2;
                this.orderFormService.loadOrder(this.order.id);
                this.documentsToUpload = 'Invoice';
                this.selectedIndex = 2;
            }, err => {
                this.loading = false;
                console.log(err);
            });
    }

    removeDocumentsToUpload() {
        this.documentsToUpload = '';
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

    verifyOrderForInvoice() {
        this.api.verifyOrderForInvoice(this.order.id)
            .subscribe((response: any) => {
                if (response.error && response.error == 1) {
                    this.msg.show(response.msg, 'error');
                } else {
                    this.publishInvoiceToQBO();
                }
            });
    }
    cleanOrderWorkflow() {
        this.loading = true;
        this.api.cleanOrderWorkflow(this.order.id)
            .subscribe((response: any) => {
                if (response.status && response.msg) {
                    this.msg.show(response.msg, 'error');
                }
                this.loading = false;
            });
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
        if(this.customerPO_required === true) {
            if(this.order.customerPo === "" || this.order.customerPo === null) {
                this.msg.show("Customer PO is required",'error');
                return;
            }            
        }
        if(this.order.payStatus === 'Paid') {
            if (status == 'Booked'
            && (this.order.orderType.toLowerCase() == 'order' || this.order.orderType.toLowerCase() === 'webstore' || this.order.orderType.toLowerCase() === 'storeorder')) {

                this.updateOrderStatus(status);
            }
        } else {
            if (status == 'Booked'
                && (this.order.orderType.toLowerCase() == 'order' || this.order.orderType.toLowerCase() === 'webstore' || this.order.orderType.toLowerCase() === 'storeorder')) {
                this.orderService.validateCreditLimit(this.order).subscribe((res: any) => {
                    
                    if (res.status == false) {
                        this.msg.show("This customer is over their allowed credit limit. To book this order, the customer must be below the sum of the current credit balance and the total of the order to be booked.", 'error');
                        return;
                    } else if (res.status == 'error') {
                        this.msg.show(res.msg,'error');
                        return;
                    }
                //return
                    this.updateOrderStatus(status);
                });
            }
        }

    }

    checkInvoiceReceipt() {
        this.api.getAdvanceSystemConfigAll({module: 'Orders'})
            .subscribe((res: any) => {
             if(res.settings.invReceiptRequired === "1") {
                for (let i in this.order.lineItems) {
            
                    if(this.order.lineItems[i].inventoryReceived === "0") {
                        this.invoiceShow = false;
                    }
                }
            }
        },(err => console.log(err)));    
    }

    toogleNotification(sidenav: any, evt) {
        sidenav.toggle();
        this.noteService.toggleSideNav(evt)
	}
}

@Component({
    selector: 'transfer-customer-inventory-dialog',
    template: `
  <div mat-dialog-content>
    <div class='w-100-p'>Please select one.</div>
  </div>
  <div mat-dialog-actions>
    <button mat-button class='w-100-p' (click)="onButtonClick('Invoice')" tabindex="2">Invoice and deliver the product to the customer</button>
    <button mat-button class='w-100-p' (click)="onButtonClick('Transfer')" tabindex="1">Invoice and transfer to the customers warehouse</button>
  </div>
  `,
    styles: ['.mat-dialog-content {text-align:center;}']
})
export class TransferCustomerInventoryDialogComponent {

    constructor(
        public dialogRef: MatDialogRef<TransferCustomerInventoryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    onButtonClick(type): void {
        this.dialogRef.close(type);
    }

}

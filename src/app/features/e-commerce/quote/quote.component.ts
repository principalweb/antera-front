import { Component, OnDestroy, OnInit, ViewEncapsulation, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { includes } from 'lodash';
import { OrderDetails, Logistic, OrderColors } from '../../../models';
import { EcommerceOrderService } from '../order.service';
import { ApiService } from '../../../core/services/api.service';
import { OrderFormDialogComponent } from '../../../shared/order-form-dialog/order-form-dialog.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTab, MatTabHeader, MatTabGroup } from '@angular/material/tabs';
import { EcommerceOrdersService } from '../orders.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SelectPaymentDialogComponent } from '../../../shared/select-payment-dialog/select-payment-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { OrderPaymentFormDialogComponent } from '../components/order-payment-form/order-payment-form.component';
import { GlobalConfigService } from 'app/core/services/global.service';
import { PermissionService } from 'app/core/services/permission.service';
import { switchMap, take } from 'rxjs/operators';
import { FeaturesService } from 'app/core/services/features.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { CustomerViewService } from 'app/core/services/customer-view.service';
import { OrderFormService } from '../order-form/order-form.service';
import { OrderUnsavedChangesDialogComponent } from '../order-form/order-unsaved-changes-dialog/order-unsaved-changes-dialog.component';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { NoteService } from 'app/main/note.service';
import { FormControl } from '@angular/forms';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail, Attachment } from 'app/models/mail';

@Component({
    selector: 'fuse-e-commerce-source',
    templateUrl: './quote.component.html',
    styleUrls: ['./quote.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class FuseEcommerceQuoteComponent implements OnInit, OnDestroy {

    @ViewChild('tabs') tabs: MatTabGroup;

    order = new OrderDetails();
    onOrderChanged: Subscription;
    loading = false;
    permissionsEnabled: boolean;
    selected = new FormControl(0);

    dialogRef: MatDialogRef<OrderFormDialogComponent>;
    onModuleFieldsChangedSubscription: Subscription;
    fields = [];
    logisticsSubscription: Subscription;
    isLogisticsEnabled: boolean = false;

    // Temporary feature toggle
    newOrderFormEnabled: boolean = false;
    newOrderFormToggled: boolean = false

    colors = OrderColors;
    forceNewOrderForm: boolean;
    existingRouteReuseStrategy: any;
    ordersConfig: any;
    documentsToUpload = '';
    quotePreviewUrl = '';
    cpToken = '';
    dialogRefMailComposeInteractiveQuote: MatDialogRef<FuseMailComposeDialogComponent>;
    constructor(
        private api: ApiService,
        private accountService: AccountsService,
        private orderService: EcommerceOrderService,
        private msg: MessageService,
        private authService: AuthService,
        public noteService: NoteService,
        private dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute,
        private ordersService: EcommerceOrdersService,
        private globalService: GlobalConfigService,
        private permService: PermissionService,
        private featureService: FeaturesService,
        public customerViewService: CustomerViewService,
        private orderFormService: OrderFormService,
    ) {
    }

    ngOnInit() {
        this.accountService.checkAdminFeeEnabled(); 
        this.existingRouteReuseStrategy = this.router.routeReuseStrategy.shouldReuseRoute;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;

        // Subscribe to update order on changes
        this.orderService.context = 'quote';

        // Temporary hack to intercept tab change
        //this.tabs._handleClick = this.interceptTabChange.bind(this);
         if(this.tabs) {
            this.tabs._handleClick = this.interceptTabChange.bind(this);
        }
        this.ordersConfig = this.route.snapshot.data.data[12];
        const orderModuleSettings = this.ordersConfig.settings;

        if (orderModuleSettings.enableOrderFormV2 == '1') {
            this.newOrderFormEnabled = true;
        }

        if (orderModuleSettings.forceOrderFormV2 == '1') {
            this.newOrderFormToggled = true;
            this.forceNewOrderForm = true;
        } else {
            const isOrderFormAlreadyToggled = +localStorage.getItem('features.order-form-v2.toggled') || 0;
            if (isOrderFormAlreadyToggled && this.newOrderFormEnabled) {
                this.newOrderFormToggled = true;
            }
        }


        this.onOrderChanged =
            this.orderService.onOrderChanged
                .subscribe(order => {
                    this.order = new OrderDetails(order);
                    this.getPortalPrview();
                    this.orderService.orderDetails.next(this.order);
                    this.configureLogisticsIfEnabled();
                    console.log("Order -> ", this.order);
                    this.orderService.getLogo();
                    this.orderService.getDocumentLabels(this.order.partnerIdentityId);
                    // Get locations, commissions, partner identy lists
                    this.orderService.getCommisionsForSalesRep(this.authService.getCurrentUser().userId);
                    this.orderService.getLocationsForAccount(this.order.accountId);
                    this.orderService.getLocationsForContact(this.order.contactId);
                    this.orderService.getPartnerIdentityListForAccount(this.order.accountId);
                    this.orderService.getPartnerIdentityListForSalesRep(this.order.salesPersonId);
                });

        this.onModuleFieldsChangedSubscription =
            this.globalService.onModuleFieldsChanged
                .subscribe((fields: any[]) => {
                    this.fields = fields;
                });

        this.permService.getPermissionStatus().subscribe((res: any) => {
            if (res == '0' || res == 0 || res == false) {
                res = false
            } else {
                res = true;
            }

            this.permissionsEnabled = res;
        });
    }

    ngAfterViewInit() {
        this.updateTabIndex();
    }

    public updateTabIndex() {
        if (this.tabs.selectedIndex != undefined &&
            this.tabs.selectedIndex != null)
            this.noteService.formatIndex(this.tabs.selectedIndex);
    }

    public toggleNewOrderForm() {
        this.newOrderFormToggled = !this.newOrderFormToggled;
        localStorage.setItem('features.order-form-v2.toggled', this.newOrderFormToggled ? '1' : '0');
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
            // 
        });
    }

    cancelQuote() {
        const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to cancel this quote?';

        confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.updateOrderStatus('Cancelled');
            }
        });
    }

    updateOrderStatus(status) {
        let orderStatus;
        if (status == 'Favorite') {
            if (this.order.orderStatus == 'Pending')
                orderStatus = 'Favorite';
            else if (this.order.orderStatus == 'Favorite')
                orderStatus = 'Pending';
        }
        else if (status == 'Cancelled') {
            orderStatus = status;
        }
        this.loading = true;

        this.orderFormService.order$.pipe(
            take(1),
        ).subscribe((order) => {
            const updatedData = {
                ...this.order,
                orderStatus: orderStatus
            };
            this.api.updateOrder(updatedData)
                .subscribe((data: any) => {
                    this.loading = false;
                    this.order = new OrderDetails(data.extra);
                    this.orderService.onOrderChanged.next(this.order);
                    this.msg.show('Order updated successfully.', 'success');
                    if (orderStatus == 'Cancelled')
                        this.router.navigate(['/e-commerce/quotes']);
                }, (err) => {
                    this.loading = false;
                    this.msg.show('Error occured while updating the order', 'error');
                });
        });

    }
    getPortalPrview(){
        //this.loading = true;
        this.api.getPortalLevelQuoteToken(this.order.id, 0)
            .subscribe((res: any) => {
                if(res.status == 'success' && res.token !=''){
                    this.quotePreviewUrl = "/cp/quote-preview/"+this.order.id+"?cp-token="+res.token;
                    this.cpToken = res.token;
                    //console.log(this.quotePreviewUrl);
                    //window.open("/cp/quote-preview/"+this.order.id+"?cp-token="+res.token, "_blank");
                    //window.open("/cp/quote-detail/"+this.order.id, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=300,left=300,width=1024,height=800");
                }
                //this.loading = false;
            }, (err) => {
                console.log(err);
                //this.loading = false;
                this.msg.show("Failed to create preview", "error");
            });
    }
    convertQuoteToOrder() {
        if (this.order.orderStatus == 'Favorite') {
            const orderData = {
                ...this.order,
                orderType: 'Order',
                orderStatus: 'Booked',
                convertFavorite: '1'
            }
            this.loading = true;
            this.api.createOrder(orderData)
                .subscribe((res: any) => {
                    this.loading = false;
                    this.createLogisticIfEnabled();
                    this.msg.show("Quote converted to Order", "success");
                    this.api.createPurchaseOrderNeed(res.extra.id).subscribe((response: any) => { });
                    this.api.createPendingInvoice({id:res.extra.id}).subscribe((response: any) => { });
                    this.router.navigate(['/e-commerce/orders', res.extra.id]);
                }, (err) => {
                    console.log(err);
                    this.loading = false;
                    this.msg.show("Failed creating an order.", "error");
                });
        }
        else {
            this.loading = true;
            this.api.convertQuote(this.order.id)
                .subscribe((data: any) => {
                    let orderStatus = this.order.orderStatus;
                    if (this.order.orderStatus == 'Pending' || this.order.orderStatus == 'Rework') {
                        orderStatus = 'Booked';
                    }
                    const updatedData = {
                        ...this.order,
                        orderType: 'Order',
                        orderStatus: orderStatus
                    };
                    this.createLogisticIfEnabled();
                    this.api.updateOrder(updatedData)
                        .subscribe((data: any) => {
                            this.loading = false;
                            this.api.createPurchaseOrderNeed(this.order.id).subscribe((response: any) => { });
                            this.api.createPendingInvoice({id:this.order.id}).subscribe((response: any) => { });
                            this.msg.show("Quote converted to Order", "success");
                            setTimeout(() => {
                                this.router.navigate(['/e-commerce/orders', this.order.id]);
                            }, 100);
                        }, (err) => {
                            this.loading = false;
                            this.msg.show('Error occured while updating the order', 'error');
                        });
                }, (err) => {
                    console.log(err);
                    this.loading = false;
                    this.msg.show("Failed converting quote to order.", "error");
                });
        }
    }

    editOrder(event) {
        this.loading = true;
        // if (event.type == 'Convert' && this.order.orderType.toLowerCase() == 'quote') {
        //     this.api.convertQuote(this.order.id)
        //         .subscribe((res) => {
        //             this.loading = false;
        //             this.msg.show("Quote converted to Order", "success");
        //             this.router.navigate(['/e-commerce/orders', this.order.id]);
        //         }, (err) => {
        //             console.log(err);
        //             this.loading = false;
        //             this.msg.show("Failed converting quote to order.","error");
        //         });
        //     return;
        // };

        const updatedData = {
            ...this.order,
            ...event.data
        };
        console.log("Updated Data -> ", updatedData);
        this.api.updateOrder(updatedData)
            .subscribe((data: any) => {
                this.loading = false;
                this.order = new OrderDetails(data.extra);
                this.orderFormService.setOrder(this.order);
                this.orderService.getDocumentLabels(this.order.partnerIdentityId);
                this.orderService.getPartnerIdentityListForAccount(this.order.accountId);
                this.orderService.getPartnerIdentityListForSalesRep(this.order.salesPersonId);
                this.msg.show('Order updated successfully', 'success');
            }, (err) => {
                this.loading = false;
                this.msg.show('Eror occured while updating the order', 'error');
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
        this.loading = true;
        this.ordersService.getPaymentDetails(order.id)
            .then(pInfo => {
                this.loading = false;
                dialogRef = this.dialog.open(OrderPaymentFormDialogComponent, {
                    panelClass: 'order-payment-dialog',
                    data: {
                        payment: pInfo,
                        service: this.ordersService,
                        order: order,
                        paymentType: type
                    }
                });
                dialogRef.afterClosed()
                    .subscribe((data) => {
                        if (data && data.action === 'updated') {
                            order.paymentStatus = data.status;
                        }
                    });
            });
    }

    removeDocumentsToUpload() {
        this.documentsToUpload = '';
    }
       
    ngOnDestroy() {
        this.router.routeReuseStrategy.shouldReuseRoute = this.existingRouteReuseStrategy;
        this.onOrderChanged.unsubscribe();
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
  emailInteractiveQuote() {
    this.getEmailTemplateForInteractiveQuote();
  }
  getEmailTemplateForInteractiveQuote(){
    this.loading = true;
    const basicMailData = {
        subject: 'Customer Portal Interactive Quote',
        };  
    let mail = new Mail(basicMailData);
    this.api.processEmailTemplateByName({ cpToken:  this.cpToken, templateName: 'Customer Portal Interactive Quote', orderId: this.order.id, currentUserId: this.authService.getCurrentUser().userId }).subscribe((res: any) => {
        this.loading = false;
        mail.subject = res.subject;
        mail.body = res.bodyHtml;
            if (mail.to.indexOf(this.order.contactEmail) < 0) {
                mail.to.push(this.order.contactEmail);
            }
        this.openMailDialog(mail);
    });
    
  }
  openMailDialog(mail: Mail) {
        this.loading = false;
        this.dialogRefMailComposeInteractiveQuote = this.dialog.open(FuseMailComposeDialogComponent, {
            panelClass: 'compose-mail-dialog',
            data: {
                action: 'Send',
                mail: mail,
            }
        });
        this.dialogRefMailComposeInteractiveQuote.afterClosed()
            .subscribe(res => {
                if (!res) {
                    return;
                }
                this.loading = true;
                this.dialogRefMailComposeInteractiveQuote = null;
                mail = res.mail;
                const data = new FormData();
                const frmData = new FormData();
                data.append('userId', this.authService.getCurrentUser().userId);
                data.append('userName', this.authService.getCurrentUser().firstName + ' ' + this.authService.getCurrentUser().lastName);
                data.append('to', mail.to.join(','));
                data.append('cc', mail.cc.join(','));
                data.append('bcc', mail.bcc.join(','));
                data.append('from', mail.from);
                data.append('subject', mail.subject);
                data.append('body', mail.body);
                
                mail.attachments.forEach((attachment: Attachment) => {
                    data.append('attachment[]', new File([attachment.data], attachment.filename));
                });

                this.api.sendMailSMTP(data)
                    .subscribe(
                        (res: any) => {
                            this.loading = false;
                            this.msg.show('Email sent', 'success');
                            
                        },
                        (err: any) => {
                            this.loading = false;
                            this.msg.show(err.error.msg, 'error');
                            console.log(err);
                        });
            });
        return mail;
  }

    toogleNotification(sidenav: any, evt) {
        sidenav.toggle();
        this.noteService.toggleSideNav(evt)
    }
}   

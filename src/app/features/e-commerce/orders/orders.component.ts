import { Component, OnInit, ViewChild, ViewEncapsulation, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Observable ,  Subscription, forkJoin, of, from } from 'rxjs';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

import { fuseAnimations } from '@fuse/animations';

import { EcommerceOrdersService } from '../orders.service';
import { ApiService } from '../../../core/services/api.service';
import { OrderBottomSheetComponent } from '../components/order-bottom-sheet/order-bottom-sheet.component';
import { OrderFormDialogComponent } from '../../../shared/order-form-dialog/order-form-dialog.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { SelectPaymentDialogComponent } from 'app/shared/select-payment-dialog/select-payment-dialog.component';
import { OrderPaymentFormDialogComponent } from '../components/order-payment-form/order-payment-form.component';
import { OrderPaymentMessageDialogComponent } from '../components/order-payment-message-dialog/order-payment-message-dialog.component';
import { forEach, find } from 'lodash';
import { OrderBatchPaymentFormDialogComponent } from '../components/order-batch-payment-form/order-batch-payment-form.component';
import { debounceTime, distinctUntilChanged, delay, concatMap, mergeMap } from 'rxjs/operators';
import { OrderColors } from 'app/models';
import { QbService } from 'app/core/services/qb.service';
import * as moment from 'moment';
@Component({
    selector   : 'fuse-e-commerce-orders',
    templateUrl: './orders.component.html',
    styleUrls  : ['./orders.component.scss'],
    animations : fuseAnimations,
    encapsulation: ViewEncapsulation.None,

})
export class FuseEcommerceOrdersComponent implements OnInit
{

    onOrderTypeListchangedSubscription: Subscription;
    onQbActiveChangedSubscription: Subscription;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    dataSource: OrdersDataSource | null;
    displayedColumns = ['checkbox', 'orderNo', 'orderIdentity', 'contactName', 'salesPerson', 'accountName', 'orderType', 'orderDate', 'bookedDate', 'orderStatus', 'paymentStatus', 'totalPrice'];

    filterForm: FormGroup;

    checkboxes = {};
    mergeProcessedOrders = {};
    selectedAll = false;
    selectedAny = false;
    searchInput = new FormControl('');
    viewMyItems = false;
    readyToBill = false;
    showTotalOrBalance: string = 'Total';
    selectOptions = ["Total", "Balance"];

    colors = OrderColors;

    loading = false;
    mergeLoading = false;
    orderTypeList = [];
    selectedOrderTypes = ['All'];
    selectedOrderStatues = [];
    selectedPaymentStatues = [];
    creditMemo:boolean = false;
    mergePColor = 'accent'
    mergePMode = 'indeterminate'
    mergeProgress = 0;
    qboActive = false;
    qbConnection = '';
    qboSynced = true;
    invoiceBackDate: any;
    creditMemoBackDate: any;
    @ViewChild('formTemplate') formTemplate: TemplateRef<any>;
    @ViewChild('formTemplateCreditMemoBackDate') formTemplateCreditMemoBackDate: TemplateRef<any>;
    formTemplateDialog: any;
    formTemplateCreditMemoBackDateDialog: any;
    isAdmin = false;
    constructor(
        private ordersService: EcommerceOrdersService,
        private api: ApiService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private fb: FormBuilder,
        private msg: MessageService,
        private auth: AuthService,
        private qbService: QbService,
    ) { }

    ngOnInit()
    {
        this.filterForm = this.fb.group({
            orderNo: this.ordersService.payload.term.orderNo,
            inHouseOrderNo: this.ordersService.payload.term.inHandByDate,
            orderIdentity: this.ordersService.payload.term.orderIdentity,
            contactName: this.ordersService.payload.term.contactName,
            accountName: this.ordersService.payload.term.accountName,
            orderDate: this.ordersService.payload.term.orderDate,
            bookedDate: this.ordersService.payload.term.bookedDate,
            totalPrice: this.ordersService.payload.term.totalPrice,
            salesPerson: this.ordersService.payload.term.salesPerson,
            cloudOrderLink: this.ordersService.payload.term.cloudOrderLink,
            inHandByDate: this.ordersService.payload.term.inHandByDate,
            completion: this.ordersService.payload.term.completion,
            modifiedDate: this.ordersService.payload.term.modifiedDate,
            csrId: this.ordersService.payload.term.csrId,
            userId: this.ordersService.payload.term.userId,
            action: this.ordersService.payload.term.action
        });
        this.selectedOrderTypes = this.ordersService.orderType;
        this.selectedOrderStatues = this.ordersService.payload.term.orderStatus;
        this.selectedPaymentStatues = this.ordersService.payload.term.paymentStatus;
        if(this.auth.getCurrentUser().userType == 'AnteraAdmin' || this.auth.getCurrentUser().userType == 'CustomerAdmin'){
            this.isAdmin = true;
        }

        this.dataSource = new OrdersDataSource(this.ordersService);
        this.initSelection();

        this.onOrderTypeListchangedSubscription = this.ordersService.onOrderTypeListchanged
            .subscribe((list) => {
                this.orderTypeList = list;
                //this.orderTypeList.splice(0,1);
                this.orderTypeList.splice(0,0,{label: 'All', value: 'All'}); // Add All type
                this.orderTypeList = this.orderTypeList.filter((type) => type.value !== 'Quote');
                this.orderTypeList = this.orderTypeList.filter((type) => type.value !== '');
                const creditMemo = this.orderTypeList.filter(row => row.value == 'CreditMemo');
                this.creditMemo = false;
                if(creditMemo[0] && creditMemo[0].id) {
                    this.creditMemo = true;
                }
            });
        this.onQbActiveChangedSubscription =
            this.qbService.onQbActiveChanged
                .subscribe((res: boolean) => {
                    if (res) {
                        this.qbConnection = this.qbService.getActiveConnector();
                        this.qboActive = this.qbConnection == 'QBO' || this.qbConnection == 'XERO' ? true : false;
                    }
                });
    }

    ngAfterViewInit()
    {
        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
            if (searchText.length < 3 && searchText.length > 0)
                return;
            this.fetchList();
        });
    }

    updateColumnShown(event){
        this.displayedColumns = event.value === "Total" ? ['checkbox', 'orderNo', 'orderIdentity', 'contactName', 'salesPerson', 'accountName', 'orderType', 'orderDate', 'bookedDate', 'orderStatus', 'paymentStatus', 'totalPrice'] : 
            ['checkbox', 'orderNo', 'orderIdentity', 'contactName', 'salesPerson', 'accountName', 'orderType', 'orderDate', 'bookedDate', 'orderStatus', 'paymentStatus', 'balance']
    }

    ngOnDestroy()
    {
        if (this.onOrderTypeListchangedSubscription) this.onOrderTypeListchangedSubscription.unsubscribe();
    }

    openBottomSheet(ev) {
        ev.stopPropagation();

        this.dialog.open(OrderBottomSheetComponent, {
            panelClass: 'order-bottom-sheet'
        });
    }

    clearSearch(){
      if (this.searchInput.value.length > 0)
      this.searchInput.setValue('');
    }

    paginate(ev) {
        this.loading  = true;
        this.ordersService.payload.offset = ev.pageIndex;
        this.ordersService.payload.limit = ev.pageSize;

        this.ordersService.getOrders()
            .then(() => { this.loading = false; });

        this.initSelection();
    }

    sortChange(ev) {
        this.loading  = true;
        this.ordersService.payload.order = ev.active;
        this.ordersService.payload.orient = ev.direction;
        this.ordersService.getOrders()
            .then(() => { this.loading = false; });

        this.initSelection();
    }

    filterByOrderTypes() {
        this.fetchList();
    }

    fetchList() {

        const cb = () => {
            this.loading = false;
        }
        localStorage.setItem('orders_orderNo',this.filterForm.value.orderNo)
        localStorage.setItem('orders_orderIdentity',this.filterForm.value.orderIdentity)
        localStorage.setItem('orders_contactName',this.filterForm.value.contactName)
        localStorage.setItem('orders_salesPerson',this.filterForm.value.salesPerson)
        localStorage.setItem('orders_accountName',this.filterForm.value.accountName)
        localStorage.setItem('orders_orderType',JSON.stringify(this.selectedOrderTypes))
        localStorage.setItem('orders_orderDate',this.filterForm.value.orderDate)
        localStorage.setItem('orders_bookedDate',this.filterForm.value.bookedDate)
        localStorage.setItem('orders_orderStatus',JSON.stringify(this.selectedOrderStatues))
        localStorage.setItem('orders_orderPaymentStatus',JSON.stringify(this.selectedPaymentStatues))

        this.ordersService.payload.term = this.filterForm.value;
        this.ordersService.payload.term.orderType = this.selectedOrderTypes;
        this.ordersService.searchPayload.search = this.searchInput.value;
        this.ordersService.payload.myViewItems = this.viewMyItems;
        this.ordersService.payload.readyToBill = this.readyToBill;
        this.ordersService.payload.term.orderStatus = this.selectedOrderStatues;
        this.ordersService.payload.term.paymentStatus = this.selectedPaymentStatues;

        if (this.viewMyItems) {
            const user = this.auth.getCurrentUser();
            this.ordersService.payload.term.userId = user.userId;
            this.ordersService.payload.term.csrId = user.userId;
        } else {
            this.ordersService.payload.term.userId = '';
            this.ordersService.payload.term.csrId = '';
        }

        this.loading = true;
        if (this.ordersService.payload.term.orderNo == '' &&
            this.ordersService.payload.term.inHouseOrderNo == '' &&
            this.ordersService.payload.term.orderIdentity == '' &&
            this.ordersService.payload.term.contactName == '' &&
            this.ordersService.payload.term.accountName == '' &&
            this.ordersService.payload.term.orderType == ['All'] &&
            this.ordersService.payload.term.orderDate == '' &&
            this.ordersService.payload.term.bookedDate == '' &&
            this.ordersService.payload.term.totalPrice == '' &&
            this.ordersService.payload.term.salesPerson == '' &&
            this.ordersService.payload.term.cloudOrderLink == '' &&
            this.ordersService.payload.term.inHandByDate == '' &&
            this.ordersService.payload.term.completion == 'Active' &&
            this.ordersService.payload.term.orderStatus == [] &&
            this.ordersService.payload.term.paymentStatus == [] &&
            this.ordersService.payload.term.modifiedDate == '' &&
            this.ordersService.searchPayload.search != ''
            ){
            Promise.all([
                this.ordersService.getOrders(true),
                this.ordersService.getOrdersCount(true)
            ]).then(cb)
              .catch(cb);
        }
        else{
            Promise.all([
                this.ordersService.getOrders(),
                this.ordersService.getOrdersCount()
            ]).then(cb)
              .catch(cb);
        }

    }

    newOrder(orderType='Order') {
        const dlgRef = this.dialog.open(OrderFormDialogComponent, {
            panelClass: 'antera-details-dialog',
            data: {
                action: 'new',
                type: orderType
            }
        });

        dlgRef.afterClosed().subscribe((result) => {
            if (result) {
                if (result.action == 'create'){
                    this.router.navigate(['/e-commerce/orders/', result.order.id]);
                }
            }
        });
    }

    handleContact(e, contactId){
        e.stopPropagation();
        this.router.navigate([`/contacts/${contactId}`]);
        console.log("contact clicked");
    }

    handleAccount(e, accountId){
        e.stopPropagation();
        this.router.navigate([`/accounts/${accountId}`]);
    }

    cancelOrders() {
        if (!this.selectedAny && !this.selectedAll) {
            return;
        }

        const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to cancel all selected orders?';

        confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                const orders = [];

                forEach(this.checkboxes, (v, k) => {
                    if (v) {
                        orders.push(k);
                    }
                });

                this.loading = true;

                this.api.cancelOrders(orders)
                    .subscribe(
                        (res: any) => {
                            this.fetchList();
                            this.selectedAll = false;
                            this.selectedAny = false;
                            this.checkboxes = {};
                            this.msg.show(res.msg, 'info');
                        },
                        err => {
                            this.loading = false;
                            console.log(err);
                        }
                    );
            }
        });
    }

    cloneOrder()
    {
        if (!this.selectedAny && !this.selectedAll) {
            return;
        }

        let selectedOrderId;

        forEach(this.checkboxes, (v, k) => {
            if (v) {
                selectedOrderId = k;
            }
        });

        this.loading = true;
        this.ordersService.cloneOrder(selectedOrderId)
            .then((res) => {
                this.loading = false;
                if (res.status === 'success') {
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

    toggleAll() {
        if (this.selectedAll) {
            this.initSelection(false);
        } else {
            this.initSelection(true);
        }
    }

    onSelectedChange(id, ev) {
        this.selectedAll = true;
        this.selectedAny = false;

        this.checkboxes[id] = ev.checked;

        forEach(this.ordersService.orders, (v)=> {
            if (this.checkboxes[v.id]) {
                this.selectedAny = true;
            } else {
                this.selectedAll = false;
            }
        });
    }

    initSelection(val = false) {
        this.checkboxes = {};
        this.mergeProcessedOrders = {};

        if (val) {
            this.selectedAll = true;
        } else {
            this.selectedAll = false;
        }
        this.selectedAny = false;

        forEach(this.ordersService.orders, (v, k) => {
            this.checkboxes[v.id] = val;
            this.mergeProcessedOrders[v.id] = val;
        });
    }

    selectedCheckboxCount(){
        const selection = [];

        forEach(this.checkboxes, (v, k) => {
            if (v) {
                selection.push(k);
            }
        });
        return selection.length;
    }

    editPayment(order, ev) {
        if(order.orderStatus != 'Void' && order.orderStatus != 'Cancelled') {
            ev.stopPropagation();
            let dialogRef;
            dialogRef = this.dialog.open(SelectPaymentDialogComponent, {
                panelClass: 'select-payment-dialog',
                data: { 
                accountId: order.accountId
                }
            });
            dialogRef.afterClosed()
                .subscribe(data => {
                if (data && data.type) {
                    this.editPaymentEntries(order, data.type);
                }
            });
        }
    }

    editPaymentEntries(order, type){
        let dialogRef;
        this.loading = true;
        forkJoin([
            this.api.getPaymentTracks({oId: order.id}),
            this.api.getOrderDetails(order.id)
        ]).subscribe((res: any[]) => {
            this.loading = false;
            dialogRef = this.dialog.open(OrderPaymentFormDialogComponent, {
                panelClass: 'order-payment-dialog',
                data      : {
                    paymentTracks: res[0].payments,
                    service: this.ordersService,
                    order: res[1],
                    paymentType: type
                }
            });
            dialogRef.afterClosed()
                .subscribe((data) =>{
                    if (data) {
                        if (data.paymentType == 'Cash_Check') {
                            if (data.status === 'success') {
                                this.fetchList();
                            }
                            else {
                                this.msg.show('Something went wrong with payment', 'error');
                            }
                        }
                        else {
                            if (data.status === 'success') {
                                this.fetchList();
                             //   this.openPaymentMessageDialog(data);
                            }
                            else {
                                this.msg.show('Something went wrong with payment', 'error');
                            }
                        }
                    }
                    dialogRef = null;
                });
        }, (err => {
            this.loading = false;
            console.log(err);
        }));
    }

    openPaymentMessageDialog(data) {
        let dialogRef = this.dialog.open(OrderPaymentMessageDialogComponent, {
            panelClass: 'order-payment-message-dialog',
            data      : {
                paymentStatus: data.status,
                paymentData: data
            }
        });

        dialogRef.afterClosed()
        .subscribe(() =>{
            this.fetchList();
            dialogRef = null;
        });
    }

    payOrders() {
        // Only allow payments for one account
        const orderIds = [];
        forEach(this.checkboxes, (v, k) => {
            if (v) {
                orderIds.push(k);
            }
        });
        const selectedOrderStatusMap = orderIds.reduce((orderStatuses, id) => {
            const _orders = this.ordersService.orders;
            const order = _orders.find((order) => order.id === id);

            if (order !== -1) {
                if(order.orderStatus == 'Void' || order.orderStatus == 'Cancelled') {
                    orderStatuses[order.id] = true;
                } 
            }
            return orderStatuses;
        }, {});
        const selectedOrderStatus = Object.keys(selectedOrderStatusMap);
        /**
          orderIds.forEach((orderId) => {
            const _orders = this.ordersService.orders;
            const order = _orders.find(o => o.id === orderId);
            if(order.orderStatus == 'Void' || order.orderStatus == 'Cancelled') {
                this.msg.show('Please remove Void Or Cancelled Orders from Batch Payments!', 'error');
                return;
            }
        });*/
        const selectedAccountIdMap = orderIds.reduce((accountIds, id) => {
            const _orders = this.ordersService.orders;
            const orderIndex = _orders.findIndex((order) => order.id === id);

            if (orderIndex !== -1) {
                const order = _orders[orderIndex];
                // If account id is in the accountIds skip it
                if (!accountIds[order.accountId]) {
                    accountIds[order.accountId] = true;
                }
            }
            return accountIds;
        }, {});
     
        const selectedAccountIds = Object.keys(selectedAccountIdMap);
        if (selectedAccountIds.length > 1) {
            // Throw error message
            this.msg.show('Please Select Single Account For Batch Payments!', 'error');
        } else if (selectedOrderStatus.length > 0) {
            this.msg.show('Please Remove Void Or Cancelled Orders from Batch Payments!', 'error');
        } else {
            // Allow to proceed
            let dialogRef;
            dialogRef = this.dialog.open(SelectPaymentDialogComponent, {
                panelClass: 'select-payment-dialog',
                data: {
                    accountId: selectedAccountIds[0]//this.order.accountId
                }
            });
            dialogRef.afterClosed()
                 .subscribe(data => {
                    if (data && data.type) {
                        this.paySelectedOrders(data.type);
                    }
            });
        }
    }

    paySelectedOrders(paymentType) {
        const orders = [];
        forEach(this.checkboxes, (v, k) => {
            if (v) {
                orders.push(k);
            }
        });
        const batch = [];
        orders.forEach((orderId) => {
            batch.push(this.api.getPaymentTracks({oId: orderId}));
        });
        forkJoin(...batch)
            .subscribe((res) => {
                this.payCurrentBalancesForSelectedOrders(res, paymentType);
            }, () => {
                this.loading = false;
            });
    }

    payCurrentBalancesForSelectedOrders(paymentTracks, paymentType)
    {
        paymentTracks = paymentTracks.map(paymentTrack => {
            const _orders = this.ordersService.orders;

            const order = find(_orders, {id: paymentTrack.orderId});
            return {
                orderId: paymentTrack.orderId,
                payments: paymentTrack.payments,
                totalPrice: order.totalPrice
            }
        });
        console.log(paymentTracks);
        let dialogRef = this.dialog.open(OrderBatchPaymentFormDialogComponent, {
            panelClass: 'order-batch-payment-dialog',
            data      : {
                paymentTracks: paymentTracks,
                service: this.ordersService,
                paymentType: paymentType
            }
        });
        dialogRef.afterClosed()
            .subscribe((data) =>{
                if (data) {
                    if (data.paymentType == 'Cash_Check') {
                        if (data.status === 'success') {
                            this.fetchList();
                        }
                        else {
                            this.msg.show('Something went wrong with payment', 'error');
                        }
                    }
                    else {
                        if (data.status === 'success') {
                         //   this.openPaymentMessageDialog(data);
                         this.fetchList();
                        }
                        else {
                            this.msg.show('Something went wrong with payment', 'error');
                        }
                    }
                }
                dialogRef = null;
            });
    }

    navigateToInvoice(){
        const orderIds = [];
        for (let key in this.checkboxes){
            if (this.checkboxes[key]) orderIds.push(key);
        }
        this.router.navigate(["/e-commerce/invoicing/new"], { queryParams: { orderIds } });
    }

    clearFilters() {
        localStorage.setItem('orders_orderNo','')
        localStorage.setItem('orders_orderIdentity','')
        localStorage.setItem('orders_contactName','')
        localStorage.setItem('orders_salesPerson','')
        localStorage.setItem('orders_accountName','')
        localStorage.setItem('orders_orderType',JSON.stringify(["All"]))
        localStorage.setItem('orders_orderDate','')
        localStorage.setItem('orders_bookedDate','')
        localStorage.setItem('orders_orderStatus',JSON.stringify([]))
        localStorage.setItem('orders_orderPaymentStatus',JSON.stringify([]))
        this.viewMyItems = false;
        this.readyToBill = false;
        this.searchInput.setValue('');
        this.ordersService.clearFilters();
        this.selectedOrderTypes = ['All'];
        this.selectedOrderStatues = [];
        this.selectedPaymentStatues = [];
        this.filterForm.patchValue({
            orderNo: this.ordersService.payload.term.orderNo,
            inHouseOrderNo: this.ordersService.payload.term.inHandByDate,
            orderIdentity: this.ordersService.payload.term.orderIdentity,
            contactName: this.ordersService.payload.term.contactName,
            accountName: this.ordersService.payload.term.accountName,
            orderDate: this.ordersService.payload.term.orderDate,
            bookedDate: this.ordersService.payload.term.bookedDate,
            totalPrice: this.ordersService.payload.term.totalPrice,
            salesPerson: this.ordersService.payload.term.salesPerson,
            cloudOrderLink: this.ordersService.payload.term.cloudOrderLink,
            inHandByDate: this.ordersService.payload.term.inHandByDate,
            completion: this.ordersService.payload.term.completion,
            modifiedDate: this.ordersService.payload.term.modifiedDate,
            csrId: this.ordersService.payload.term.csrId,
            userId: this.ordersService.payload.term.userId,
            action: this.ordersService.payload.term.action
        });

        this.fetchList();
    }

    tooltip(row) {
        return 'Price Total: ' + row.totalPrice;
    }

    displayOrderType(value) {
      const orderType = find(this.orderTypeList, {value: value});
      if (!orderType) return '';
      return orderType.label;
    }
    highlight(orderId)
    {
        if(this.checkboxes[orderId]){
            return true;
        }else{
            return false;
        }
    }

    mergeProcessed(orderId)
    {
        if(this.mergeProcessedOrders[orderId]){
            return true;
        }else{
            return false;
        }
    }
    merge()
    {
        if (!this.selectedAny && !this.selectedAll) {
            return;
        }

        const orderIds = [];

        forEach(this.checkboxes, (v, k) => {
            if (v) {
                orderIds.push(k);
            }
        });

        if (orderIds.length === 0 || orderIds.length === 1 ) {
            this.msg.show('Please select more than one orders to merge', 'success');
            return;
        }
        this.loading = true;
        this.api.mergeOrders(orderIds)
            .subscribe((res: any) => {
                if (res.status == 'success')
                {
                    this.router.navigate(['/e-commerce/orders', res.extra.id]);
                }else{
                    this.loading = true;
                    }
            });
    }
    mergeBeta()
    {
        if (!this.selectedAny && !this.selectedAll) {
            return;
        }

        const orderIds = [];

        forEach(this.checkboxes, (v, k) => {
            if (v) {
                orderIds.push(k);
            }
        });

        if (orderIds.length === 0 || orderIds.length === 1 ) {
            this.msg.show('Please select more than one orders to merge', 'success');
            return;
        }
        this.mergeLoading = true;
        this.mergeProgress = 0;
/*
        this.api.mergeOrders(orderIds)
            .subscribe((res: any) => {
                if (res.status == 'success')
                    this.router.navigate(['/e-commerce/orders', res.extra.id]);
            });

*/
        const lastOrder = orderIds[orderIds.length - 1];
        const totalOrders = orderIds.length;
        var processedOrdersCnt = 0;
        this.api.initMergeQuoteOrderInBatch(orderIds)
            .subscribe((res: any) => {
                if (res.status == 'success' && res.extra.id){

                        const selectedIds = from(this.chunkOrdersIds(orderIds,5));
                        const requests = selectedIds.pipe(concatMap(
                          (val) => {
                          return this.api.processMergeQuoteOrderInBatch(res.extra.id, val);
                          }
                        ));
                        const subscribe = requests.subscribe((val: any) => {
                             var timeoutTimer = 1000;
                             if(val.extra.mergeProcessedOrderIds){
                                 val.extra.mergeProcessedOrderIds.forEach((id) => {
                                  setTimeout(() => {
                                     this.checkboxes[id] = false;
                                     this.mergeProcessedOrders[id] = true;
                                     if(processedOrdersCnt < totalOrders && this.mergeProgress != 100){
                                         var mergeProgressPer = Math.ceil((processedOrdersCnt/totalOrders)*100)
                                         this.mergeProgress = (mergeProgressPer > 100) ? 100 : mergeProgressPer;
                                     }
                                     processedOrdersCnt++;
                                  }, timeoutTimer);
                                  timeoutTimer += 500;
                                 });
                             }
                             if(val.extra.lastOrder && val.extra.lastOrder == lastOrder){
                                 this.mergeProgress = 100;
                                  setTimeout(() => {
                                        this.mergeLoading = false;
                                     this.router.navigate(['/e-commerce/orders', res.extra.id]);
                                  }, timeoutTimer);
                             }
                          });

                }else{
                    this.mergeLoading = false;
                    this.mergeProgress = 0;
                    this.msg.show(res.msg, 'error');
                }
            });
    }

    chunkOrdersIds(orderIds, chunkSize){
        var results = [];
        
        while (orderIds.length) {
            results.push(orderIds.splice(0, chunkSize));
        }
        return results;
   }
   
    callInvoiceBackDate(){
        if(this.qbService.backDateProcessing){
            this.msg.show('Process already running', 'success');
            return;
        }
        this.invoiceBackDate = null;
        this.formTemplateDialog = this.dialog.open(this.formTemplate);
    }
    updateInvoiceBackDate(){
        this.formTemplateDialog.close();
        const orderIds = [];
        forEach(this.checkboxes, (v, k) => {
            if (v) {
                orderIds.push(k);
            }
        });
        if (orderIds.length === 0) {
            this.invoiceBackDate = null;
            console.log('invoiceBackDate');
            console.log(this.invoiceBackDate);
            this.msg.show('Please select at least one order to update date ', 'success');
            return;
        }
        const selectedOrderStatusMap = orderIds.reduce((orderStatuses, id) => {
            const _orders = this.ordersService.orders;
            const order = _orders.find((order) => order.id === id);

            if (order !== -1) {
                if(order.orderStatus !== 'Billed') {
                    orderStatuses[order.id] = true;
                } 
            }
            return orderStatuses;
        }, {});
        const selectedOrderStatus = Object.keys(selectedOrderStatusMap);
        if (selectedOrderStatus.length > 0) {
            this.invoiceBackDate = null;
            this.msg.show('Please select billed orders only', 'error');
        } else {
            this.qboProcessBackDate(orderIds, this.invoiceBackDate, 'Invoice');
        }
    }
    selectInvoiceBackDate(event) {        
        this.invoiceBackDate = moment(event.value).format('YYYY-MM-DD');
    }

    qboProcessBackDate(orderIds, invoiceDate, entityType = 'Invoice') {
        if (this.qboActive) {
                if (orderIds.length === 0) {
                    this.msg.show('Please select at least one order to update date ', 'success');
                    return;
                }
                this.selectedAll = false;
                this.selectedAny = false;
                this.checkboxes = {};
                this.msg.show('Invoice date change process running in background', 'success');
                this.qbService.qboProcessBackDate(entityType, orderIds, '', invoiceDate)
                    .then((res: any) => {
                        if (res.code != '200') {
                            this.msg.show(res.msg, 'error');
                        }
                        else {
                            this.msg.show(res.msg, 'success');
                        }
                    }).catch((err) => {

                        this.msg.show(err.message, 'error');
                    });
        }else{
            this.msg.show('QBO not enabled', 'error');
        }
    }

   
    callCreditMemoBackDate(){
        if(this.qbService.backDateProcessing){
            this.msg.show('Process already running', 'success');
            return;
        }
        this.creditMemoBackDate = null;
        this.formTemplateCreditMemoBackDateDialog = this.dialog.open(this.formTemplateCreditMemoBackDate);
    }
    updateCreditMemoBackDate(){
        this.formTemplateCreditMemoBackDateDialog.close();
        const orderIds = [];
        forEach(this.checkboxes, (v, k) => {
            if (v) {
                orderIds.push(k);
            }
        });
        if (orderIds.length === 0) {
            this.creditMemoBackDate = null;
            console.log('creditMemoBackDate');
            console.log(this.creditMemoBackDate);
            this.msg.show('Please select at least one credit memo to update date ', 'success');
            return;
        }
        const selectedOrderStatusMap = orderIds.reduce((orderStatuses, id) => {
            const _orders = this.ordersService.orders;
            const order = _orders.find((order) => order.id === id);

            if (order !== -1) {
                if(order.orderType !== 'CreditMemo') {
                    orderStatuses[order.id] = true;
                } 
            }
            return orderStatuses;
        }, {});
        const selectedOrderStatus = Object.keys(selectedOrderStatusMap);
        if (selectedOrderStatus.length > 0) {
            this.creditMemoBackDate = null;
            this.msg.show('Please select Credit Memo only', 'error');
        } else {
            this.qboProcessBackDate(orderIds, this.creditMemoBackDate, 'CreditMemo');
        }
    }
    selectCreditMemoBackDate(event) {        
        this.creditMemoBackDate = moment(event.value).format('YYYY-MM-DD');
    }


}

export class OrdersDataSource extends DataSource<any>
{
    onTotalCountChanged: Subscription;
    total = 0;

    constructor(
        private ordersService: EcommerceOrdersService
    )
    {
        super();
    }

    connect(): Observable<any[]>
    {
        this.onTotalCountChanged =
            this.ordersService.onTotalCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.total = total;
            });

        return this.ordersService.onOrdersChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
    }
}

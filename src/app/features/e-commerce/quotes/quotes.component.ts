import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { Observable ,  Subscription } from 'rxjs';
import { forEach } from 'lodash';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

import { fuseAnimations } from '@fuse/animations';

import { EcommerceOrdersService } from '../orders.service';
import { ApiService } from 'app/core/services/api.service';
import { OrderBottomSheetComponent } from '../components/order-bottom-sheet/order-bottom-sheet.component';
import { OrderFormDialogComponent } from 'app/shared/order-form-dialog/order-form-dialog.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/services/auth.service';
import { delay } from 'rxjs/operators';
import { OrderColors } from 'app/models';

@Component({
    selector   : 'fuse-e-commerce-quotes',
    templateUrl: './quotes.component.html',
    styleUrls  : ['./quotes.component.scss'],
    animations : fuseAnimations
})
export class FuseEcommerceQuotesComponent implements OnInit
{
    onOrderTypeListchangedSubscription: Subscription;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    dataSource: FilesDataSource | null;
    /*        Comment 'actions' column.     */
    // displayedColumns = ['orderNo', 'identity', 'contact', 'salesRep', 'account', 'type', 'date', 'status', 'actions'];
    displayedColumns = ['checkbox', 'orderNo', 'orderIdentity', 'contactName', 'salesPerson', 'accountName', 'orderType', 'orderDate', 'orderStatus', 'totalPrice'];

    filterForm: FormGroup;

    checkboxes = {};
    selectedAll = false;
    selectedAny = false;
    viewMyItems = false;

    searchInput = new FormControl('');

    colors = OrderColors; 
    loading = false;

    orderTypeList = [];
    selectedOrderTypes = ['Quote'];

    constructor(
        private ordersService: EcommerceOrdersService,
        private api: ApiService,
        private dialog: MatDialog,
        private fb: FormBuilder,
        private router: Router,
        private msg: MessageService,
        private auth: AuthService
    ) { }

    ngOnInit()
    {
        const formObj = this.ordersService.payload.term;
        this.filterForm = this.fb.group(formObj);
        this.dataSource = new FilesDataSource(this.ordersService);
        this.initSelection();

        this.onOrderTypeListchangedSubscription = this.ordersService.onOrderTypeListchanged
            .subscribe((list) => {
                this.orderTypeList = list;
                //this.orderTypeList.splice(0,1);
                //this.orderTypeList.splice(0,0,{label: 'All'}); // Add All type
                this.orderTypeList = this.orderTypeList.filter((type) => type.value == 'Quote');
            });
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
        this.loading = true;
        this.ordersService.payload.offset = ev.pageIndex;
        this.ordersService.payload.limit = ev.pageSize;

        this.ordersService.getOrders()
            .then(() => { this.loading = false; });

        this.initSelection();
    }

    sortChange(ev) {
        this.loading = true;
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
        localStorage.setItem('quotes_orderNo',this.filterForm.value.orderNo)
        localStorage.setItem('quotes_orderIdentity',this.filterForm.value.orderIdentity)
        localStorage.setItem('quotes_contactName',this.filterForm.value.contactName)
        localStorage.setItem('quotes_salesPerson',this.filterForm.value.salesPerson)
        localStorage.setItem('quotes_accountName',this.filterForm.value.accountName)
        localStorage.setItem('quotes_orderType',JSON.stringify(this.selectedOrderTypes))
        localStorage.setItem('quotes_orderDate',this.filterForm.value.orderDate)
        localStorage.setItem('quotes_bookedDate',this.filterForm.value.bookedDate)
        localStorage.setItem('quotes_orderStatus',JSON.stringify(this.filterForm.value.orderStatus))
        // localStorage.setItem('orders_orderPaymentStatus',JSON.stringify(this.selectedPaymentStatues))
        this.ordersService.payload.term = this.filterForm.value;
        this.ordersService.payload.term.orderType = this.selectedOrderTypes;
        //this.ordersService.payload.myViewItems = false;
        this.ordersService.payload.myViewItems = this.viewMyItems;
        if (this.viewMyItems) {
            const user = this.auth.getCurrentUser();
            this.ordersService.payload.term.userId = user.userId;
            this.ordersService.payload.term.csrId = user.userId;
        } else {
            this.ordersService.payload.term.userId = "";
            this.ordersService.payload.term.csrId = "";
        }

        this.loading = true;
        Promise.all([
            this.ordersService.getOrders(),
            this.ordersService.getOrdersCount()
        ]).then(cb)
          .catch(cb);
    }

    newOrder() {
        const dlgRef = this.dialog.open(OrderFormDialogComponent, {
            panelClass: 'antera-details-dialog',
            data: {
                action: 'new',
                type: 'Quote'
            }
        });

        dlgRef.afterClosed().subscribe((result) => {
            if (result) {
                if (result.action == 'create'){
                    this.router.navigate(['/e-commerce/quotes/', result.order.id]);
                }
            }
        });
    }

    deleteOrders() {
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
                        () => {
                            this.fetchList();
                            this.selectedAll = false;
                            this.selectedAny = false;
                            this.checkboxes = {};
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
                    this.router.navigate(['e-commerce/quotes', id]);
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

    selectedCheckboxCount(){
        const selection = [];

        forEach(this.checkboxes, (v, k) => {
            if (v) {
                selection.push(k);
            }
        });
        return selection.length;
    }

    initSelection(val = false) {
        this.checkboxes = {};

        if (val) {
            this.selectedAll = true;
        } else {
            this.selectedAll = false;
        }
        this.selectedAny = false;

        forEach(this.ordersService.orders, (v, k) => {
            this.checkboxes[v.id] = val;
        });
    }

    clearFilters() {
        localStorage.setItem('quotes_orderNo','')
        localStorage.setItem('quotes_orderIdentity','')
        localStorage.setItem('quotes_contactName','')
        localStorage.setItem('quotes_salesPerson','')
        localStorage.setItem('quotes_accountName','')
        localStorage.setItem('quotes_orderType',JSON.stringify(["All"]))
        localStorage.setItem('quotes_orderDate','')
        localStorage.setItem('quotes_bookedDate','')
        localStorage.setItem('quotes_orderStatus',JSON.stringify([]))
        localStorage.setItem('quotes_orderPaymentStatus',JSON.stringify([]))
        this.viewMyItems = false;
        this.searchInput.setValue('');
        this.ordersService.clearFilters();
        this.selectedOrderTypes = ['Quote'];
        this.filterForm.setValue(this.ordersService.payload.term);

        this.fetchList();
    }
}

export class FilesDataSource extends DataSource<any>
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

import { Component, OnInit, OnDestroy, ViewEncapsulation, ElementRef, EventEmitter, Input, Output, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { WorkflowControlService } from '../workflow-control.service';
import { SelectionService } from 'app/core/services/selection.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { groupBy, sortBy, orderBy, fromPairs, find, uniq, forEach } from 'lodash';
import { fuseAnimations } from '@fuse/animations';
import { Observable , forkJoin, of, from } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { ActionService } from '../../../core/services/action.service';
import * as html2pdf from 'html2pdf.js';
import { AuthService } from 'app/core/services/auth.service';
import { FilesDataSource } from '../../e-commerce/quotes/quotes.component';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, delay, concatMap, mergeMap } from 'rxjs/operators';


@Component({
    selector: 'workflow-list',
    templateUrl: './workflow-status.component.html',
    styleUrls: ['./workflow-status.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowStatusComponent implements OnInit, OnDestroy {

    // receive saved search in select from parent component
    @Input() savedSearchParams: Observable<void>;
    // emit params to workflow.component
    @Output() searchParams = new EventEmitter<any>();
    // subscribe to 
    private savedSearchSubscription: any;

    selectedRow: any = {};
    selectedCol: any = {};
    loading = true;
    mergeLoading = false;
    filterForm: FormGroup;
    wcsSubscriptions = [];
    displayedColumns = [];
    columns = [];
    events: any = [];
    groupedEvents: any = {};
    tableData = [];
    colorLabels = [];
    total = 0;
    subs = [];
    checkboxes = {};
    mergeProcessedOrders = {}
    access: boolean = false;
    filedata: any;
    vendor_email: any;
    dom2: any;
    mergePColor = 'accent'
    mergePMode = 'indeterminate'
    mergeProgress = 0;
    params: any = {
        offset: 0,
        limit: 100,
        orient: 'desc',
        order: 'orderNo',
        term: {},
        permUserId: ''
    }
    showMyItems = false;
    workflowOrderMap: any;


    constructor(
        public wcs: WorkflowControlService,
        public selection: SelectionService,
        private fb: FormBuilder,
        private api: ApiService,
        private msg: MessageService,
        public actionService: ActionService,
        private auth: AuthService,
        private router: Router,
        private cd: ChangeDetectorRef,
    ) { }

    ngOnInit() {

        this.params.permUserId = this.auth.getCurrentUser().userId;

        this.wcs.readWorkFlows();
        this.wcsSubscriptions[0] = this.wcs.onColumnsChanged.subscribe(cols => {
            this.columns = cols.splice(6);
            this.checkLoading();
        });

        this.wcsSubscriptions[1] = this.wcs.onEventsChanged.subscribe(events => {
            this.events = events;
            this.checkLoading();
        });

        this.wcsSubscriptions[2] = this.wcs.filteredWorkflows.subscribe(workflow => {
            if (workflow.rows) {


                const workflowOrderMap = workflow.rows.reduce((rows, row, i) => {
                    rows[row.id] = row.orderId;
                    return rows;
                }, {});
                this.workflowOrderMap = { ...this.workflowOrderMap, ...workflowOrderMap };

                this.tableData = workflow.rows.map((row, i) => ({
                    ...row,
                    // id: i
                }));
            } else {
                this.tableData = [];
            }
            this.total = workflow.count;

            if (!this.selection.selectedCount) {
                this.selection.init(this.tableData);
            }

            if (this.tableData) {
                this.createColorLabels();
            }
            this.cd.markForCheck();
        });

        this.wcsSubscriptions[3] = this.selection.onSelectionChanged.subscribe(selection => {
            this.checkboxes = selection;
            this.mergeProcessedOrders = selection;
            this.cd.markForCheck();

        });
    }

    ngOnDestroy() {
        this.wcsSubscriptions.forEach(sub => sub.unsubscribe());
    }

    createFilterForm() {
        this.filterForm = this.fb.group(
            fromPairs(this.displayedColumns.slice(1).map(col => [col, '']))
        );
    }

    checkLoading() {
        if (this.loading && this.columns.length > 0 && this.events.length > 0) {
            this.loading = false;
            this.displayedColumns = [
                'checkbox',
                'orderNo',
                'account',
                'vendor',
                'shipDate',
                'timeline',
                ...this.columns.map(col => col.name)
            ];

            this.events = orderBy(this.events, 'order');
            this.groupedEvents = groupBy(this.events, 'group');

            //this.events = orderBy(this.events, 'order');
            //            this.groupedEvents = orderBy(this.groupedEvents, 'order');
            if (this.tableData) {
                this.createColorLabels();
            }

            if (!this.filterForm) {
                this.createFilterForm();
            }
        }
        this.cd.markForCheck();
    }

    hasEvent(row, col) {
        const r = row[col.name];
        const c = col.id

        return find(this.groupedEvents[c], e => e.id === r);
    }

    paginate(ev) {
        this.params.offset = ev.pageIndex;
        this.params.limit = ev.pageSize;
        this.fetchList();
    }

    sortChange(ev) {
        this.params.order = ev.active;
        this.params.orient = ev.direction;
        this.fetchList();
    }

    fetchList() {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.params.term = this.filterForm.value;
        let d = ['', ''];

        if (this.filterForm.value.shipDate) {
            d = [
                this.filterForm.value.shipDate.getMonth() + 1,
                this.filterForm.value.shipDate.getDate()
            ];
        }


        if (this.filterForm.value.timeline) {
            d = [
                this.filterForm.value.timeline.getMonth() + 1,
                this.filterForm.value.timeline.getDate()
            ];
        }

        const events = [];
        this.columns.forEach(col => {
            events[col.id] = this.filterForm.value[col.name];
        })

        this.params.term = {
            orderNo: this.filterForm.value.orderNo,
            vendor: this.filterForm.value.vendor,
            account: this.filterForm.value.account,
            shipDate: this.filterForm.value.shipDate,
            inhandBy: this.filterForm.value.timeline,
            month: d[0],
            day: d[1] || '',
            events
        };

        if (this.showMyItems) {
            const user = this.auth.getCurrentUser();

            this.params.term = {
                ...this.params.term,
                userId: user.userId,
                csrId: user.userId
            };
        }
        this.cd.markForCheck();

        this.wcs.getWorkflows(this.params).then(() => {
            this.loading = false;
            this.sendParams();
            this.cd.markForCheck();
        });
    }

    clearFilters() {
        this.filterForm.reset();
        this.fetchList();
    }
    chunkOrdersIds(orderIds, chunkSize){
        var results = [];
        
        while (orderIds.length) {
            results.push(orderIds.splice(0, chunkSize));
        }
        return results;
   }
    mergeOrdersBeta() {
        const orderIds = uniq(
            this.selection.selectedIds.map(id => this.workflowOrderMap[id])
        );

        if (orderIds.length === 0) {
            this.msg.show('Please select orders to merge', 'success');
            return;
        }
        this.mergeLoading = true;
        this.cd.markForCheck();
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
			     this.cd.markForCheck();
			     if(val.extra.mergeProcessedOrderIds){
			         val.extra.mergeProcessedOrderIds.forEach((id) => {
				  setTimeout(() => {
				     this.cd.markForCheck();
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
				     this.cd.markForCheck();
   			             this.mergeLoading = false;
			             this.router.navigate(['/e-commerce/orders', res.extra.id]);
				  }, timeoutTimer);
			     }
			  });

                }else{
                    this.cd.markForCheck();
                    this.mergeLoading = false;
                    this.mergeProgress = 0;
                    this.msg.show(res[0].msg, 'error');
                }
            });
    }
    
    mergeOrders() {
        const orderIds = uniq(
            this.selection.selectedIds.map(id => this.workflowOrderMap[id])
        );

        if (orderIds.length === 0) {
            this.msg.show('Please select orders to merge', 'success');
            return;
        }

        this.api.mergeOrders(orderIds)
            .subscribe((res: any) => {
                if (res.status == 'success')
                    this.router.navigate(['/e-commerce/orders', res.extra.id]);
            });
    }

    private createColorLabels() {
        this.tableData.forEach(row => {
            const clRow = {};

            this.columns.forEach(col => {
                const ev = find(this.groupedEvents[col.id], e => e.id === row[col.name]);
                if (ev) {
                    clRow[col.id] = ev;
                }
            });

            this.colorLabels.push(clRow);
        });
    }

    // emit parms to workflow.component
    sendParams() {
        this.searchParams.emit(this.params);
    }

    getItemDetails(items){
        const div = document.createElement('div');
        var html = "";
        if(items.length > 0) {
            for(let item of items) {
                html+= '<h3>item # '+item.itemNo+'</h3>';
                if(item.matrixRows.length > 0) {
                    for(let matrixRow of item.matrixRows) {
                        html+= '<p>'+matrixRow.size+'-'+matrixRow.color+'</p>';
                    }
                }
            }
        }
        div.innerHTML = html;
        return div.innerHTML || "";
    }

    /*
      console.log(params);
        exeAction(row, col, eve){
    
            this.selectedRow = row;
            this.selectedCol = col;
            let val =this.hasEvent(this.selectedRow, this.selectedCol);  
            if(val.action == 'sendpo'){
                this.loading = true;
                this.api.getAccountDetails(this.selectedRow.vendorId).subscribe((account:any)=> {
                this.vendor_email = account.email;           
            });
            this.embededPODecorationComponent.initializePurchaseOrderDetails(this.selectedRow.orderId, this.selectedRow.vendor);
            
            }
        
        }
        */


    my_email(val, data, name, row) {
        if (typeof this.actionService[val.action] === 'function') {

            this.loading = false;
            this.actionService[val.action](data, name, this.vendor_email, row);

        }
    }

    tooltip(workflow) {
        return 'Order Identity: ' + workflow.identity;
    }

}

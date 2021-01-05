import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject, of, forkJoin } from 'rxjs';
import * as moment from 'moment';
import { findIndex } from 'lodash';

import { Production } from '../../models';
import { Equipment } from '../../models/equipment';
import { ProductionProcess } from '../../models/production-process';
import { ApiService } from './api.service'; import { MessageService } from './message.service'; import { SelectionService } from './selection.service';
import { AuthService } from './auth.service';
import { map, switchMap, take } from 'rxjs/operators';


@Injectable()
export class ProductionsService implements Resolve<any>
{
    onProductionsChanged: BehaviorSubject<Production[]>;
    onEquipmentChanged: BehaviorSubject<Equipment[]>;
    onTotalCountChanged: BehaviorSubject<number>;
    onSearchTextChanged: Subject<any> = new Subject();
    onStatusListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onPriorityListChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onViewChanged: BehaviorSubject<any> = new BehaviorSubject('kanban-condensed');
    onFolderReady = new BehaviorSubject<any>(null);
    onProductionChanged: BehaviorSubject<Production>;
    onProcessChanged: BehaviorSubject<ProductionProcess[]>;
    onMachineGraphChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    barcodeEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
    barCodeSelectedWorkOrderNumber: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    barCodeScanNumber: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    allProductions: BehaviorSubject<Production[]> = new BehaviorSubject<Production[]>([]);
    loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    barCodeStation: BehaviorSubject<string> = new BehaviorSubject<string>("");

    onClearFilters = new Subject();

    productions: Production[];
    equipmentList: Equipment[];
    processList: ProductionProcess[];
    designTypes = [];
    decoTypes = [];
    designLocations = [];
    due = 'Show All';

    selectedMachine = {id: '', name: '', decoTypeId: ''};
    selectedDecoType = {id: '', name: ''};
    selectedVariation = {id: '', name: '', designName: '', decoTypeId: ''};
    selectedProduct = {id: '', name: '', decoTypeId: ''};
    selectedDue = 'Show All';
    selectedRange = {id: 'all', name: 'All', bg:{'color' : ''}};
    showBatchable: boolean = false;

    machineFilter = {id: '', name: '', decoTypeName: ''};
    decoTypeFilter = {id: '', name: ''};
    variationFilter = {id: '', name: '', designName: '', decoTypeName: ''};

    isViewUserProductions = false ;
    graphData = [];
    filterOptions = {
        designVariations: [],
        decoTypes: [],
        machines: [],
        products: [],
        range: []
    };

    onFilteredCustomersChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onFilteredOrdersChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onFilteredDesignTypesChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onVariationsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);

    listColumns = {
        id: '',
        customerName: '',
        orderName: '',
        decoTypeName: '',
        productName: '',
        machineName: '',
        variationName: '',
        statusName: ''
    };

    payload = {
        offset: 0,
        limit: 50,
        order: 'priorityId',
        orient: 'desc',
        term: {
            customerName: '',
            orderName: '',
            decoTypeName: '',
            productName: '',
            machineName: '',
            variationName: '',
            statusName: ''
        }
    }

    constructor(
        private api: ApiService,
        private msg: MessageService,
        public selection: SelectionService,
        private authService: AuthService
    ) {
        this.onProductionsChanged = new BehaviorSubject(this.productions);
        this.onTotalCountChanged = new BehaviorSubject(0);
        this.onEquipmentChanged = new BehaviorSubject(this.equipmentList); 
        this.onProcessChanged = new BehaviorSubject(this.processList);
        this.onMachineGraphChanged = new BehaviorSubject(this.graphData);
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {

        /*
        if (route.queryParams.refType && route.queryParams.refType == 'User'){
            this.payload.term.statusName = route.queryParams.status;
            this.onViewChanged.next('list');
            return;
        }
        */

        return this.getStatusList();
    }

    getProductions(): Observable<any>
    {
        let data: any = this.payload;
        if (this.onViewChanged.value !== 'list') {
            data = {
                offset: 0,
                limit: 200,
                term: this.payload.term,
                listType: 'kanban'
            };
        } else {
            data.listType = 'list';
        }

        return this.api.getProductionList(data).pipe(
            map((response: any[]) => {
                this.productions = response.map(data => {
                    const production = new Production(data);
                    return production;
                });
                
                this.allProductions.next(this.productions);
                // if(data.listType == 'kanban') {
                //     console.log(this.allProductions,response);
                // //this.productions.slice(0,2);
                // }
                const filtered = this.filterAll();
                this.onProductionsChanged.next(filtered);
                this.loading.next(false);
                return response;
            })
        );
    }
    // findProductionsByWorkOrderNumber(orderNumber: string): Production[] {
    //     return this.productions.filter((production: Production) => production.orderName == orderNumber);
    // }

    // barcodeMoveCards(productions: Production[]){
        
    //     productions.forEach((production: Production) => {
    //         const currentStatus = production.statusId;
    //         const list = [...this.onStatusListChanged.value];
    //         const currentIdx = list.findIndex((status: Status) => status.id == currentStatus.toString());
    //         this.updateJobStatus;
    //     })
    // }
    moveBarcodeCardsByOrderNumber(orderNumber: string){
        console.log("inside move card func");
        //const list = [...this.onStatusListChanged.value];
        this.loading.next(true);
        this.updateJobsByOrderNumber(this.barCodeStation.value, orderNumber);
        
       
    }
// needs to be tested with various design on multitple workorders with the bar code scanner 
    moveBarcodeCardsByWorkOrderNumber(workOrderNumber: string){
        console.log("inside move card func");
        //const list = [...this.onStatusListChanged.value];
        this.loading.next(true);
        // changed as now it requires to move by work order number
        //this.updateJobsByOrderNumber(this.barCodeStation.value, orderNumber);
        
        this.updateJobsByWorkOrderNumber(this.barCodeStation.value, workOrderNumber);
    }

    getEquipment(): Observable<any> {
        return this.api.getEquipment().pipe(
            map((response: any[]) => {
                this.equipmentList = response.map(data => {
                    const equipment = new Equipment(data);
                    return equipment;
                });

                this.onEquipmentChanged.next(this.equipmentList);

                return this.equipmentList;
            })
        );
    }

    getProcesses(): Observable<any> {
        return this.api.getProductionProcesses().pipe(
            map((res: any) => {
                this.processList = res.data.map(data => {
                    const proc = new ProductionProcess(data);
                    return proc;
                });

                this.onProcessChanged.next(this.processList);
                return this.processList;
            })
        );

    }

    createProcess(proc: ProductionProcess) {
        return this.api.productionCreateProcess(proc.toObject());
    }

    updateProcess(proc: ProductionProcess) {
        return this.api.productionUpdateProcess(proc.toObject());
    }

    deleteProcess(id: Number) {
        return this.api.productionDeleteProcess(id);
    }

    createEquipment(equipment: Equipment) {
        return this.api.createEquipment(equipment.toObject());
    }

    updateEquipment(equipment: Equipment) {
        return this.api.updateEquipment(equipment.toObject());
    }

    deleteEquipment(id: Number) {
        return this.api.deleteEquipment(id);
    }

    getProductionCount(): Observable<any>
    {
        let data: any = this.payload;

        if (this.onViewChanged.value !== 'list') {
            data = {
                offset: 0,
                limit: 1000,
                term: {}
            };
        }
        return this.api.getProductionCount(data).pipe(
            map((response: number) => {
                this.onTotalCountChanged.next(response);
                return response;
            })
        );
    }

    filterAll() {
        let filtered = this.productions;
        if (this.selectedDecoType.id) {
            filtered = filtered.filter(
                (item: any) => item.decoTypeId == this.selectedDecoType.id
                    
            )
        } 

        if (this.selectedMachine.id) {
            filtered = filtered.filter(
                (item: any) => item.machineId == this.selectedMachine.id
            )
        } 

        if (this.selectedVariation.id) {
            filtered = filtered.filter(
                (item: any) => item.variationId == this.selectedVariation.id
            )
        }

        if (this.showBatchable) {
            filtered = filtered.filter(
                (item: any) => !item.batchMaster && !item.batchJob && !item.completedBatch
            )
        }

        filtered = filtered.filter(
            (item: any) => {
                return this.inDateRange(item, this.selectedRange)
            }
        );

        this.onProductionsChanged.next(filtered);
        return filtered;
    }

    inDateRange(item, range): boolean {
        let cardDate = moment(item.due).endOf('day');
        let curDate = moment().endOf('day');
        let diff = cardDate.diff(curDate, 'hours');

        if (range.id == 'past') {
            return diff < 24;
        } else if (range.id == 'tomorrow') {
            return diff >= 24 && diff < 24*2;
        } else if (range.id == 'thisweek') {
            return diff >= 24*2 && diff <= 24*7;
        } else if (range.id == 'twothree') {
            return diff >= 24 * 2 && diff <= 24 * 3;
        } else if (range.id == 'fourseven') {
            return diff > 24 * 3 && diff <= 24 * 7;
        }

        return true;

    }

/*
    filterAll(decoTypeFilter, machineFilter, variationFilter, showBatchable, selectedRange) {
        let filtered = this.productions;
        if (this.decoTypeFilter.id) {
            filtered = filtered.filter(
                (item: any) => item.decoTypeId == decoTypeFilter.id
                    
            )
        } 

        if (machineFilter.id) {
            filtered = filtered.filter(
                (item: any) => item.machineId == machineFilter.id
            )
        } 

        if (variationFilter.id) {
            filtered = filtered.filter(
                (item: any) => item.variationId == variationFilter.id
            )
        }

        if (showBatchable) {
            filtered = filtered.filter(
                (item: any) => !item.batchMaster && !item.batchJob && !item.completedBatch
            )
        }

        filtered = filtered.filter(
            (item: any) => {
                return this.inDateRange(item, selectedRange)
            }
        );

        this.onProductionsChanged.next(filtered);
    }
    */

    getProduction(id: string) {
        return this.api.getProductionDetails(id);
    }

    updateProduction(production: Production)
    {
        return this.api.updateProduction(production.toObject()).pipe(
            switchMap(() => this.getProductions())
        );
    }

    updateProductionDetails(production: Production) {
        return this.api.updateProduction(production.toObject());
    }

    deleteProduction(production)
    {
        return this.api.deleteArtwork([production.id]).pipe(
            switchMap((response: any) => {
                if(response.status === "Success") {
                    this.msg.show("This item has been moved to the Recycle Bin", "info");
                    return this.getProductions();
                }
                
                this.msg.show(response[0].msg, "error");
                return of(response);
            })
        );
    }

    deleteSelectedProductions()
    {
        return this.api.deleteArtwork(this.selection.selectedIds).pipe(
            switchMap((response: any) => {
                if (response.status === "success") {
                    this.msg.show("The selected items have been moved to the Recycle Bin", "info");
                    return this.getProductions();
                }

                this.msg.show(response[0].msg, "error");
                return of(response);
            })
        );
    }

    getStatusList() {
        return this.api.getProductionStatusList().pipe(
            map((list: any) => {
                console.log("status list", list);
                this.onStatusListChanged.next(list);
                return list;
            })
        );
    }

    getPriorityList() {
        return this.api.getProductionPriorityList().pipe(
            map((list: any) => {
                this.onPriorityListChanged.next(list);
                return list;
            })
        );
    }

    updateStatus(status) {
        this.api.updateProductionStatusLabel(status.label, status.id)
            .subscribe((res:any) => {
                this.msg.show(res.msg, res.status);
                this.getStatusList().subscribe(() => {});
            });
    }

    removeStatus(id) {
        this.api.deleteProductionStatus({ id }).pipe(take(1))
        .subscribe(res => {
            this.getStatusList().subscribe(() => {});
        }, error => console.log("remove status error", error));
    }

    getCustomerAutocomplete(term) {
        return this.api.post('/content/customer-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredCustomersChanged.next(list);
        });
    }

    getOrderAutocomplete(term) {
        return this.api.post('/content/order-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredOrdersChanged.next(list);
        });
    }

    getDesignTypeAutocomplete(term) {
        return this.api.post('/content/design-auto', {
            search: term
        }).subscribe((list: any[]) => {
            this.onFilteredDesignTypesChanged.next(list);
        });
    }

    getAllDesignTypes() {
        if (this.designTypes.length > 0) {
            return of(this.designTypes);
        }

        return this.api.getAllDesignTypes().pipe(
            map((types: string[]) => {
                this.designTypes = types;
                return types;
            })
        );
    }

    getDesignLocations() {
        if (this.designLocations.length > 0) {
            return of(this.designLocations);
        }

        return this.api.getDesignLocations().pipe(
            map((locations: any) => {
                this.designLocations = locations;
                return locations;
            })
        );
    }

    changeView(view) {
        this.onViewChanged.next(view);
    }

    paginate(ev) {
        this.payload.offset = ev.pageIndex;
        this.payload.limit = ev.pageSize;

        return this.getProductions();
    }

    sort(ev) {
        this.payload.order = ev.active;
        this.payload.orient = ev.direction;

        return this.getProductions();
    }

    resetList() {
        this.payload.term = {
            customerName: '',
            orderName: '',
            decoTypeName: '',
            productName: '',
            machineName: '',
            variationName: '',
            statusName: ''
        };

        return forkJoin([
            this.getProductions(),
            this.getProductionCount()
        ]);
    }

    addStatus(newListName) {
        this.api.addProductionStatus({label: newListName})
        .pipe(take(1))
        .subscribe(res => {
            this.getStatusList().subscribe(() => {});
        }, error => console.log(error));
    }

    getCurrentDecoTypes() {
        return this.api.productionGetCurrentDecoTypes().pipe(
            map((res: any) => {
                return res.data;
            })
        )
    }

    getCurrentDesignVariations() {
        return this.api.productionGetCurrentDesignVariations().pipe(
            map((res: any) => {
                return res.data;
            })
        )
    }

    batchJobs() {
        return this.api.productionBatchJobs(this.selection.selectedIds).pipe(
            map((res:any) => {
                return res.data;
            })
        )
    }

    deleteBatch(id) {
        return this.api.productionDeleteBatch(id).pipe(
            map((res: any) => {
                return res.data;
            })
        )
    }

    updateJobStatus(jobId, statusId, machineId, reasonId = '') {
        return this.api.productionUpdateJobStatus(jobId, statusId, machineId, reasonId).pipe(
            switchMap((res: any) => {
                return this.getProductions()
            })
        );
    }

    updateJobsByOrderNumber(statusId, orderNo){
        this.api.productionUpdateJobStatusByOrderNumber(statusId, orderNo)
        .pipe(take(1))
        .subscribe(res => {
            console.log("update jobs response", res);
            this.getProductions()
            .pipe(take(1))
            .subscribe(newProductions => {
                console.log("New productions", newProductions);
                this.barCodeStation.next("");
            }, error => {
                console.log(
                  "new productions error in update jobs by order number",
                  error
                );
                this.loading.next(false);
            });
        }, err => {
            console.log("update jobs by order number error", err);
            this.loading.next(false);
        })
    }

    updateJobsByWorkOrderNumber(statusId, workOrderNo){
        this.api.productionUpdateJobStatusByWorkOrderNumber(statusId, workOrderNo)
        .pipe(take(1))
        .subscribe(res => {
            console.log("update jobs response", res);
            this.getProductions()
            .pipe(take(1))
            .subscribe(newProductions => {
                console.log("New productions", newProductions);
                this.barCodeStation.next("");
            }, error => {
                console.log(
                  "new productions error in update jobs by order number",
                  error
                );
                this.loading.next(false);
            });
        }, err => {
            console.log("update jobs by order number error", err);
            this.loading.next(false);
        })
    }

    getMachineGraph() {
        return this.api.productionMachineGraph().pipe(
            map((res: any) => {
                this.graphData = res.data;
                this.onMachineGraphChanged.next(this.graphData);
            })
        )
    }

    getFilterOptions() {
        return this.api.productionGetFilterOptions().pipe(
            map((res: any) => {
                this.filterOptions = res.data;
                this.filterOptions.range = [
                    {id: 'past', name: 'Today/Past Due', bg: {'color': 'red'}},
                    {id: 'tomorrow',name: 'Tomorrow', bg: {'color': '#FFD700'}},
                    // {id: 'thisweek', name: '2-7 Days', bg: {'color': 'green'}},
                    { id: 'twothree', name: '2-3 Days', bg: { 'color': '#FFA500' } },
                    { id: 'fourseven', name: '4-7 Days', bg: { 'color': 'green' } },
                    {id: 'all', name: 'All', bg: {'color': ''}}
                ];

                this.onVariationsChanged.next(res.data.designVariations);
                return res.data;
            })
        )
    }

    getPausedDropdown() {
        return this.api.getDropdownOptions({dropdown:["production_paused_reason"]}).pipe(
            map((res: any) => {
                return res[0].options;
            })
        );
    }

    updateJobEquipment(machineId, jobId) {
        return this.api.productionUpdateJobEquipment(machineId, jobId).pipe(
            map((res: any) => {
                return res.data;
            })
        )
    }

    addToBatch(masterJob, job) {
        return this.api.productionAddToBatch(masterJob, job).pipe(
            map((res: any) => {
                return res;
            })
        )
    }

    delFromBatch(jobId) {
        return this.api.productionDelFromBatch(jobId).pipe(
            map((res: any) => {
                return res;
            })
        )
    }

    setPinned(card) {
        return this.api.productionSetPinned(card.id, card.pinned).pipe(
            map((res: any) => {
                return res;
            })
        )
    }

    refreshVariationFilter() {
        return this.api.productionGetFilterOptions().pipe(
            map((res: any) => {
                this.onVariationsChanged.next(res.data.designVariations);
            })
        )
    }

    getJobOrders() {
        return this.api.productionGetJobOrders().pipe(
            map((res: any) => {
                return res.data;
            })
        )
    }

    batchAllByDesign() {
        return this.api.productionBatchAllByDesign().pipe(
            map((res: any) => {
                return res;
            })
        )
    }

    unbatchAll() {
        return this.api.productionUnbatchAll().pipe(
            map((res: any) => {
                return res;
            })
        )
    }
}

export interface Status {
    id: string;
    name: string;
    label: string;
    _table_ref: string;
    _order: string;
}
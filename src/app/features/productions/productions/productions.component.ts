import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, AfterViewInit, ElementRef, HostListener, } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import onScan from "onscan.js";
import { Router } from '@angular/router';
import { unionBy } from 'lodash';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { ProductionsService } from 'app/core/services/productions.service';
import { MessageService } from 'app/core/services/message.service';



import { FuseProductionsListComponent } from '../productions-list/productions-list.component';
import { MachineGraphComponent } from './machine-graph/machine-graph.component';

import { EquipmentFormComponent } from 'app/shared/equipment-form/equipment-form.component';
import { ProcessDialogComponent } from './process-dialog/process-dialog.component';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { BarcodeStatusDialogComponent } from './barcode-status-dialog/barcode-status-dialog.component';

@Component({
    selector     : 'fuse-productions',
    templateUrl  : './productions.component.html',
    styleUrls    : ['./productions.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseProductionsComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild('listComponent') listComponent: FuseProductionsListComponent;
    @ViewChild('production') productionDiv: ElementRef;
    selectedCount: number;
    searchInput: FormControl;
    onSelectionSubscription: Subscription;
    onViewChangedSubscription: Subscription;
    barcodeSubscription: Subscription;
    variationSubscription: Subscription;

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: any;

    mode = 'kanban-condensed';
    isUserProductions = false; 
    assigneeSearch = new FormControl('');
    onAssigneeSearch: Subscription;
    equipmentList: any;
    currentDecoTypeList: any;
    currentDesignVariationsList: any;
    showGraph: boolean = true;
    showBatchable: boolean = false;
    staticFilterOptions = {
        designVariations: [],
        decoTypes: [],
        machines: [],
        products: [],
        range: []
    };

    filterOptions = {
        designVariations: [],
        decoTypes: [],
        machines: [],
        products: [],
        range: []
    };

    jobOrders: any[];
    filterOrder: any;

    isLoading = false;

    constructor(
        public dialog: MatDialog,
        public productionsService: ProductionsService,
        private router: Router,
        public msgService: MessageService
    )
    {
        this.searchInput = new FormControl('');
        this.addBarcodeListener();
    }

    @HostListener('window:focus', ['$event'])
    onFocus(event: any): void {
       if (this.productionDiv.nativeElement) this.productionDiv.nativeElement.focus();
    }

    @HostListener('window:blur', ['$event'])
    onBlur(event: any): void {
        
    }

    ngOnInit()
    {
        // this.subscribeToBarcodeEnabled();
        this.onSelectionSubscription =
            this.productionsService.selection.onSelectionChanged
                .subscribe(selection => {
                    this.selectedCount = this.productionsService.selection.selectedIds.length;
                });

        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
            this.productionsService.onSearchTextChanged.next(searchText);
        });


        this.onViewChangedSubscription =
            this.productionsService.onViewChanged
                .subscribe(view => {
                    this.mode = view;
                    if (this.mode == 'list') {
                        this.filterOrder = '';
                    }
                });

        this.productionsService.getFilterOptions().subscribe((res) => {
            this.filterOptions = {
                decoTypes: res.decoTypes,
                designVariations: res.designVariations,
                machines: res.machines,
                products: res.products,
                range: res.range
            }
            this.staticFilterOptions = {
                decoTypes: res.decoTypes,
                designVariations: res.designVariations,
                machines: res.machines,
                products: res.products,
                range: res.range
            }
        });

        this.variationSubscription = this.productionsService.onVariationsChanged.subscribe((res: any) => {
            this.filterOptions.designVariations = res;
        });

        this.productionsService.getJobOrders().subscribe((res) => {
            this.jobOrders = res;
        });
    }

    ngOnDestroy()
    {
        this.productionsService.selection.reset(false);
        this.onSelectionSubscription.unsubscribe();
        this.onViewChangedSubscription.unsubscribe();
        this.variationSubscription.unsubscribe();
        if (this.barcodeSubscription) this.barcodeSubscription.unsubscribe();
        this.removeBarcodeListener();
    }

    ngAfterViewInit(){
        this.productionDiv.nativeElement.focus();
    }

    simulateBarcode(){
        onScan.simulate(document, '90139');
    }

    simStation(){
        onScan.simulate(document, 'st-7');
    }

    enableBarcode(event){
        this.productionsService.barcodeEnabled.next(event.checked)
    }


    newProduction()
    {
        this.router.navigate(['/productions/new']);
    }

    addBarcodeListener(){
        onScan.attachTo(document, {
            onScan: (sCode: string, iQty) => {
                console.log("sCode", sCode);
                if (sCode.includes('st')){
                    console.log("sCode st included and scanned", sCode);
                    //if sCode includes st- that means that its a station barcode
                    this.productionsService.barCodeStation.next(sCode.split('st').join("").split("-").join(""));
                    this.msgService.show(`Station ${sCode.split('st').join("").split("-").join("")} scanned`, 'success');
                    console.log("barcode station value", this.productionsService.barCodeStation.value);
                } else if (this.productionsService.barCodeStation.value){
                    console.log("sCode with a station value", sCode);
                    // need to be commented later
                    //this.productionsService.moveBarcodeCardsByOrderNumber(sCode);
                    //  Need to be open when work order backend work is done. 
                    this.productionsService.moveBarcodeCardsByWorkOrderNumber(sCode);
                } else {
                    console.log("There is no barcode station in memory. Scan station first", sCode);
                }
            },
            onScanError: error => {
                console.log("Scan error", error);
                this.msgService.show("Error Scanning Item", "error");
            },
            minLength: 1
        });
    }

    removeBarcodeListener(){
        if (onScan.isAttachedTo(document)) onScan.detachFrom(document);
    }

    openBarcodesDialog(){
        const barcodeRef = this.dialog.open(BarcodeStatusDialogComponent, {
            panelClass: 'antera-details-dialog'
        });
    }

    deleteSelectedProductions()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete all selected production?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.listComponent.loading = true;
                this.productionsService.deleteSelectedProductions()
                    .subscribe(
                        () => {
                            this.listComponent.loading = false;
                        },
                        () => {
                            this.listComponent.loading = false;
                        }
                    );
            }
            this.confirmDialogRef = null;
        });
    }

    changeView(ev) {
        this.productionsService.changeView(ev.value);
        this.productionsService.filterAll();
    }

    changeDecoType() {
        this.productionsService.selectedMachine = {id: '', name: '',  decoTypeId: ''};
        this.productionsService.selectedVariation = {id: '', name: '', designName: '',  decoTypeId: ''};

        this.filter();

        let machines = this.staticFilterOptions.machines;
        let designVariations = this.staticFilterOptions.designVariations;

        this.filterOptions.machines = machines.filter(
            (item: any) => (item.decoTypes.filter(d => d.id == this.productionsService.selectedDecoType.id).length > 0)
        )
        this.filterOptions.designVariations = designVariations.filter(
            (item: any) => item.decoTypeId == this.productionsService.selectedDecoType.id
        )
    }

    filter() {
        this.productionsService.filterAll();
    }

    clearSearch(){
        this.searchInput.setValue('');
    }

    clearFilters() {
        this.productionsService.selectedDue = "Show All";
        this.productionsService.selectedDecoType = {id: '', name: ''};
        this.productionsService.selectedMachine = {id: '', name: '', decoTypeId: ''};
        this.productionsService.selectedVariation = {id: '', name: '', designName: '', decoTypeId: ''};
        this.productionsService.selectedProduct = {id: '', name: '', decoTypeId: ''};
        this.productionsService.selectedRange = {id: 'all', name: 'All', bg: {'color': ''}};

        this.filterOptions = {
            decoTypes: this.staticFilterOptions.decoTypes,
            designVariations: this.staticFilterOptions.designVariations,
            machines: this.staticFilterOptions.machines,
            products: this.staticFilterOptions.products,
            range: this.staticFilterOptions.range
        }
        this.filterOrder = []
        this.productionsService.payload.term.orderName = '';
        this.productionsService.getProductions().subscribe();
        this.productionsService.getFilterOptions().subscribe();
        
        if (this.mode === 'list') {
            this.productionsService.onClearFilters.next();
            this.productionsService.selection.reset(false);
        } else {
            this.productionsService.filterAll();
        }
    }

    emailSelected(){

    }

    massUpdateSelected(){

    }

    mergeSelected(){

    }

    generateLetterSelected(){

    }

    addToTargetListSelected(){

    }

    addEquipment() {
        this.dialogRef = this.dialog.open(EquipmentFormComponent, {
            panelClass: 'antera-details-dialog',
            data: {}
        });

        this.dialogRef.afterClosed()
            .subscribe((data) => {
            });
    }

    addProcess() {
        this.dialogRef = this.dialog.open(ProcessDialogComponent, {
            panelClass: 'antera-details-dialog',
            maxWidth: '40%',
            data: {}
        });

        this.dialogRef.afterClosed()
            .subscribe((data) => {
            });
    }

    batchJobs() {
        this.productionsService.batchJobs().subscribe(
            (res:any) => {
                this.productionsService.getProductions().subscribe();
                this.productionsService.selection.reset(false);
            },
            (err: any) => {
                // HttpErrorResponse
                if (err.error.msg) {
                    this.msgService.show(err.error.msg.join("\n"), 'error');
                }
            }
        );
    }

    deleteBatch(id) {
        this.productionsService.deleteBatch(id).subscribe((res: any) => {
            this.productionsService.getProductions().subscribe();
            this.productionsService.selection.reset(false);
        });
    }

    toggleGraph() {
        this.showGraph = !this.showGraph;
    }

    batchable() {
        this.showBatchable = !this.showBatchable;
        this.filter();
    }

    changeRange(range) {
        this.productionsService.selectedRange = range;
        this.filter();
    }

    compareFn(obj1: any, obj2: any): boolean {
        return obj1 && obj2 ? obj1.id === obj2.id : obj1 === obj2;
    }

    displayFn(order?: any): string | undefined {
        return order ? order.name : undefined;
    }

    filterByOrder() {
        this.productionsService.payload.term.orderName = this.filterOrder.name;
        this.productionsService.getProductions().subscribe();
    }

    // subscribeToBarcodeEnabled(){
    //     this.barcodeSubscription = this.productionsService.barcodeEnabled
    //     .subscribe((enabled: boolean) => {
    //         enabled ? this.addBarcodeListener() : this.removeBarcodeListener()
    //     });
    // }
}

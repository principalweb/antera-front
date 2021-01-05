import { QbService } from 'app/core/services/qb.service';
import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription, Observable } from 'rxjs';
import { each, find, map } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { MessageService } from 'app/core/services/message.service';
import { InventoryService } from 'app/core/services/inventory.service';

import { InventoryAdjustItem, Site, Bin } from 'app/models';
import { delay } from 'rxjs/operators';
import { InventoryAdjustmentNotesComponent } from '../inventory-adjustment-notes/inventory-adjustment-notes.component';

interface AdjustmentType {
  viewValue: string;
}

enum AdjustmentTypes {
  AverageRow = 'Average Row',
  OverrideAll = 'Override All',
  AverageAll = 'Average All'
}
@Component({
  selector: 'inventory-item-adjustment',
  templateUrl: './inventory-item-adjustment.component.html',
  styleUrls: ['./inventory-item-adjustment.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class InventoryItemAdjustmentComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dialogRef: MatDialogRef<InventoryAdjustmentNotesComponent>;

  dataSource: InventoryListDataSource | null;
  displayedClumns = ['sku', 'color', 'size', 'site', 'bin', 'reserved', 'quantity', 'quantityDiff', 'price', 'glaccount', 'note', 'calculationType', 'save'];

  itemForm: FormGroup;

  item: InventoryAdjustItem;

  adjustmentType: string = AdjustmentTypes.AverageRow;
  updatedAveragePrice: number = 0;
  adjustQty: number = 0;
  price: number = 0;

  fob: Site[] = [];
  itemList: any[] = [];
  loading: boolean = false;

    filterForm: FormGroup;
    af: FormGroup;

    payload = {
        "offset": 0,
        "limit": 50,
        "order": "productId",
        "orient": "desc",
        "id": "",
        "term": {
            "productId": "",
            "productName": "",
            "inhouseId": "",
            "site": "",
            "bin": "",
            "sku": "",
            "color": "",
            "size": "",
            "quantity": "",
            "reserved": "",
            "min": "",
            "max": ""
        },
        "type": true,
        "completed": false,
        "average": this.isAverageCalculation()
    };

    paginationTotal: number = 0;

  onFobChangedSubscription: Subscription;
  onInventoryListChangedSubscription: Subscription;
  onProductChangedSubscription: Subscription;

  financialAccounts = {
    allAccounts: [],
  };

  adjusmentsOptions: AdjustmentType[] = [
    {viewValue: AdjustmentTypes.AverageRow},
    {viewValue: AdjustmentTypes.AverageAll},
    {viewValue: AdjustmentTypes.OverrideAll}
  ];

  constructor(
      private fb: FormBuilder,
      private inventoryService: InventoryService,
      private qbService: QbService,
      private msg: MessageService,
      public dialog: MatDialog
  ) {
    this.payload.id = "";
    this.filterForm = this.fb.group(this.payload.term);
    this.af = this.fb.group({});
      this.onFobChangedSubscription = this.inventoryService.onFobChanged.subscribe((response) => {
          this.fob = response;
      });
      this.onProductChangedSubscription = this.inventoryService.onProductChanged.subscribe((item) => {
        if (item) {
            this.payload.id = item.id;
            this.item = item;
            this.loadData();
        }
      });
        this.onInventoryListChangedSubscription =
            this.inventoryService.onInventoryAdjustListChanged
            .subscribe(list => {
                this.itemList = list;
                this.initAf();
                this.loading = false;
            });
  }

  private isAverageCalculation() {
    return this.adjustmentType == AdjustmentTypes.AverageRow ||
           this.adjustmentType == AdjustmentTypes.OverrideAll;
  }

  ngOnInit() {
      this.inventoryService.getFob();
      this.dataSource = new InventoryListDataSource(
          this.inventoryService
      );
      this.getFinancialAccounts();
  }

  getFinancialAccounts() {
    this.qbService.getFinancialAccoounts()
      .subscribe((response: any) => {
       const accounts = response.allAccounts.filter(aa => aa.type.indexOf('Asset:Accounts Receivable:') === -1);
       this.financialAccounts.allAccounts = accounts.filter((account: any) => account.name !== '')
      });
  }

  loadData() {
      this.payload.term = this.filterForm.value;
      console.log('this.payload.term .... ', this.payload.term);
      this.loading = true;
      console.log('payload from server ', this.payload );
      this.inventoryService.getInventoryAdjustList({...this.payload});
      this.inventoryService.getInventoryAdjustListCount({...this.payload});
      //this.inventoryService.getProductInventoryValue();
      //this.getProductInventoryBinAmount();
  }

  initAf()
  {
    this.af = this.fb.group({});
    each(this.itemList, (item) => {
        this.af.addControl(item.binId+'_'+item.sku, new FormControl(0));
        this.af.addControl(item.binId+'_'+item.sku+'_price', new FormControl(item.price));
        this.af.addControl(item.binId+'_'+item.sku+'_notes', new FormControl(''));
        this.af.addControl(item.binId+'_'+item.sku+'_gl', new FormControl(''));
        this.af.addControl('adjustmentType', new FormControl(''));
    });

    this.af.valueChanges.subscribe( (values) => {
      console.log('va;ues from change', values);
      console.log('adjustment type', values.adjustmentType);
      if(!values.adjustmentType){
        this.adjustmentType = AdjustmentTypes.AverageRow;
      } else {
        this.adjustmentType = values.adjustmentType;
      }
    });
  }

  getProductInventoryBinAmount() {
      /*this.inventoryService.getProductInventoryBinAmount({productId:this.item.id, sku:this.item.sku, binId:this.item.binId, siteId:this.item.siteId})
          .subscribe((response: any) => {
            this.price = response.price;
            this.initItemForm();
            this.getAdjust();
          }, (err:any) => {
              this.msg.show("Error fetching price for inventory!", 'error');
          });*/
  }

  initItemForm() {
    this.itemForm = this.fb.group({
    });
  }

  calculateChange(binId, sku) {
    const qty = Number(this.af.value[binId + '_' + sku]);
    const item = find(this.itemList, {binId: binId, sku: sku});
    if (item) {
      item.quantityChange = qty;
      item.newQuantity = Number(item.quantity) + Number(qty);
    }
  }

  getAdjust() {
      this.getFobBins();
      if (Number(this.itemForm.get('newQuantity').value) < 0) {
        this.adjustQty = 0;
      } else {
          //this.adjustQty = (Number(this.itemForm.get('newQuantity').value) - Number(this.item.quantity));
      }
  }

  getFobBins() {
      if (this.fob) {
          var result = this.fob.find(site => site.fobId == this.itemForm.get('site').value);
          if (result) {
              return result.bins;
          }
      }
      return [];
  }

  public adjustSaveAll() {
    let asa: any[] = [];
    each(this.itemList, (item) => {
      if (this.af.value[item.binId + '_' + item.sku] != item.quantity) {
        asa.push({
                  newQuantity: Number(this.af.value[item.binId + '_' + item.sku]) + Number(item.quantity),
                  quantity: Number(item.quantity),
                  sku:item.sku,
                  bin:item.binId,
                  site:item.siteId,
                  price: this.af.value[item.binId + '_' + item.sku + '_price'],
                  glaccount: this.af.value[item.binId + '_' + item.sku + '_gl'],
                  average: this.isAverageCalculation(),
                });
      }
    });
    this.loading = true;
    let p = {'p': this.item, 'as':asa};
    this.inventoryService.saveAdjustInventory(p)
          .subscribe((response: any) => {
            if (response.error == '1') {
              this.msg.show(response.msg, 'error');
              this.loading = false;
            } else {
              this.msg.show(response.msg, 'success');
              this.inventoryService.emitProduct(this.item);
            }
          }, (err: any) => {
              this.msg.show('Error saving inventory adjustment!', 'error');
              this.loading = false;
          });
  }

  adjustSave(item) {
    const qty = this.af.value[item.binId + '_' + item.sku];
    const price = this.af.value[item.binId + '_' + item.sku + '_price'];
    if (Number(qty) + Number(item.quantity) < 0) {
      this.msg.show('Stock level cannot go negative!', 'error');
      return;
    }
    this.loading = true;
    const p = this.setPayload(qty, item, price);
    if(this.isValidToSAve(item)){
      this.inventoryService.saveAdjustInventory(p)
      .subscribe((response: any) => {
        if (response.error == '1') {
          this.msg.show(response.msg, 'error');
          this.loading = false;
        } else {
          this.msg.show(response.msg, 'success');
          this.inventoryService.emitProduct(this.item);
        }
      }, (err: any) => {
          this.msg.show('Error saving inventory adjustment!', 'error');
          this.loading = false;
      });
    }
  }

  private setPayload(qty: any, item: any, price: any, average = false) {
    return {
      'p': this.item,
      'as': [
        {
          newQuantity: (Number(qty) + Number(item.quantity)),
          quantity: Number(item.quantity),
          sku: item.sku,
          bin: item.binId,
          site: item.siteId,
          price: price,
          glaccount: this.af.value[item.binId + '_' + item.sku + '_gl'],
          notes: this.af.value[item.binId + '_' + item.sku + '_notes'],
          average: this.isAverageCalculation(),
        }
      ]
    };
  }

  adjustSaveAverageAll(){
    const prices: number[] = [];
    const quantities: number[] = [];
    let averagePrice = 0;

    this.itemList.forEach( (item) => {
        const price = this.getCurrentItemPrice(item.binId, item.sku);
        const adjustQuantity = this.getCurrentItemQuanity(item.binId, item.sku);
        const quantity = this.parseToNumber(item.quantity);

        prices.push(price);
        quantities.push(quantity);
        quantities.push(adjustQuantity);
      }
    );

      const sumPrices = prices.reduce((a, b) => a + b, 0)
      const sumQuantities = quantities.reduce((a, b) => a + b, 0);
      
      console.log('sum quantities ', sumQuantities);
      console.log('sum prices ', sumPrices);

      averagePrice =  sumPrices/sumQuantities;
      console.log('average price ... ', averagePrice);

      this.updatedAveragePrice = averagePrice;

    this.itemList.forEach( (item) => {
      const currentPrice = this.getCurrentItemPrice(item.binId, item.sku);
      if(this.isValidToSAve(item)){
      const qty = this.getCurrentItemQuanity(item.binId, item.sku);
      const p = this.setPayload(qty, item, this.updatedAveragePrice, true);
      // this.adjustSave(item);
      this.loading = true;
      console.log('item new qty ', item.newQuantity);
      console.log('sending for each  average.... ', item, ' with ' , this.updatedAveragePrice);
      this.inventoryService.saveAdjustInventory(p)
      .subscribe( (response: any) => {
        // console.log('endpoint response .... ', val);
        // .subscribe((response: any) => {
          if (response.error == '1') {
            this.msg.show(response.msg, 'error');
            this.loading = false;
          } else {
            this.msg.show(response.msg, 'success');
            this.inventoryService.emitProduct(this.item);
          }
        }, (err: any) => {
            this.msg.show('Error saving inventory adjustment!', 'error');
            this.loading = false;
        });
      // })
      }
    });
  }

  isValidToSAve(item){
    const currentPrice = this.getCurrentItemPrice(item.binId, item.sku);
    return item.newQuantity && item.newQuantity > 0 && currentPrice > 0 ? true : false;
  }

  adjustSaveOverrideAll(item){
    this.updatedAveragePrice = this.getCurrentItemPrice(item.binId, item.sku);
    
    this.itemList.forEach( (item) => {
      const qty = this.getCurrentItemQuanity(item.binId, item.sku);
      if(this.isValidToSAve(item)){
      const p = this.setPayload(qty, item, this.updatedAveragePrice, true);
      console.log('item new qty ', item.newQuantity);
      console.log('sending for each  override.... ', item, ' with ' , this.updatedAveragePrice);
      this.inventoryService.saveAdjustInventory(p)
      .subscribe( (response: any) => {
        // console.log('endpoint response .... ', val);
        // .subscribe((response: any) => {
          if (response.error == '1') {
            this.msg.show(response.msg, 'error');
            this.loading = false;
          } else {
            this.msg.show(response.msg, 'success');
            this.inventoryService.emitProduct(this.item);
          }
        }, (err: any) => {
            this.msg.show('Error saving inventory adjustment!', 'error');
            this.loading = false;
        });
      }
    });
  }

  parseToNumber(numberToParse: string){
    if(numberToParse === null){
      return 0;
    }
   return parseInt(numberToParse) === NaN ? 0 : parseInt(numberToParse);
  }

  private getCurrentItemQuanity(binId: string, sku: string) {
    const qty = this.af.value[binId + '_' + sku];
    const adjustQuantity = this.parseToNumber(qty);
    return adjustQuantity;
  }

  private getCurrentItemPrice(binId: string, sku: string) {
    const currentItemPrice = this.af.value[binId + '_' + sku + '_price'];
    const price = this.parseToNumber(currentItemPrice);
    return price;
  }

  addNote(item) {
    var note  = this.af.value[item.binId + '_' + item.sku + '_notes'];
    item.note = note;
    this.dialogRef = this.dialog.open(InventoryAdjustmentNotesComponent, {
      panelClass: 'app-inventory-adjustment-notes',
      data: item,
      disableClose: true
  });
  this.dialogRef.afterClosed()
      .subscribe((response) => {
        if(response && response.note) {
          this.af.value[item.binId + '_' + item.sku + '_notes'] = response.note;
        }
        
      });
  }

  sortChange(ev) {
      this.payload.order = ev.active;
      this.payload.orient = ev.direction;
      if(ev.direction == "") {
          this.payload.order = "sku";
          this.payload.orient = "asc";
      }
      this.loadData();
  }

  paginate(ev) {
      this.payload.offset = ev.pageIndex;
      this.payload.limit = ev.pageSize;
      this.loadData();
  }

  ngOnDestroy() {
      this.onFobChangedSubscription.unsubscribe();
      this.onProductChangedSubscription.unsubscribe();
      this.onInventoryListChangedSubscription.unsubscribe();
  }
}

export class InventoryListDataSource extends DataSource<any>
{
    onTotalCountChanged: Subscription;
    total = 0;
    index = 0;

    constructor(
        private inventoryService: InventoryService
    )
    {
        super();
    }

    connect(): Observable<any[]>
    {
        this.onTotalCountChanged =
            this.inventoryService.onInventoryAdjustListCountChanged.pipe(
                delay(100),
            ).subscribe(total => {
                this.total = total;
            });

        return this.inventoryService.onInventoryAdjustListChanged;
    }

    disconnect() {
        this.onTotalCountChanged.unsubscribe();
    }
}

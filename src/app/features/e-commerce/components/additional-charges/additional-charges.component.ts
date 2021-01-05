import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { findIndex, sortBy, sum, unionBy, each, remove } from 'lodash';
import { displayName, fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { AdditionalCharge, ProductDetails, OrderDetails } from 'app/models';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { EditChargeComponent } from '../edit-charge/edit-charge.component';
import { PersonalizationComponent } from '../personalization/personalization.component';
import { distinctUntilChanged, takeUntil, take } from 'rxjs/operators';
import { IDecoVendor } from '../../order-form/interfaces';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { Subscription, Subject, BehaviorSubject, forkJoin } from 'rxjs';
import { GlobalConfigService } from 'app/core/services/global.service';
import { EcommerceOrderService } from '../../order.service';
import { calculateUnitCost } from '../../utils';
import { CurrencyService } from 'app/features/admin/currency/currency.service';
import { OrderFormService } from '../../order-form/order-form.service';
import { ExchangeRate } from 'app/models/exchange-rate';
import { CurrencyItem } from 'app/models/currency-item';
import { Settings } from "app/features/admin/currency/interface/interface";

@Component({
  selector: 'app-additional-charges',
  templateUrl: './additional-charges.component.html',
  styleUrls: ['./additional-charges.component.scss'],
})
export class AdditionalChargesComponent implements OnInit, OnDestroy {

  additionalCharges: any;
  filteredCharges: any[];
  calculateUnitCost = calculateUnitCost;
  customerCurrency: string;
  currencyEnabled: boolean;
  costExchangeRate: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  customerExchangeRate: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  vendorCurrencyPair: BehaviorSubject<string> = new BehaviorSubject<string>("");
  customerCurrencyPair: BehaviorSubject<string> = new BehaviorSubject<string>("");
  vendorCurrency: string;
  vendorCurrencyCode: string;
  customerCurrencyCode: string;
  defaultId: string;
  baseCurrency: string;
  baseCurrencyId: string;
  totalCount = 0;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  selectCharges = new FormControl();
  selectedCharges: any = [];
  // added this for permission check based on order id
  orderId: any;

  search = new FormControl('');
  displayColumns = [
    'code', 'name', 'description', 'quantity', 'cost',
    'price',
    // 'itemTaxOff', 
    // 'chargeGstTaxOnPo', 
    // 'isCommissionEnabled',
    // 'matchOrderQty', 
    // 'rollbackDistributeRows', 
    'settings', 'actions'
  ];
  supplierLocation: any;
  supplierDecoration: any;
  adminFeeSubscription: Subscription;
  fields = [];
  fieldLabel = fieldLabel;
  orderDetails: OrderDetails;
  order: OrderDetails;

  @ViewChild(MatTable) table: MatTable<any>;
  orderConfig: any;

  constructor(
    public dialog: MatDialog,
    public currencyService: CurrencyService,
    private accountService: AccountsService,
    private orderFormService: OrderFormService,
    public dialogRef: MatDialogRef<AdditionalChargesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msg: MessageService,
    private orderService: EcommerceOrderService,
    private globalService: GlobalConfigService,
    private api: ApiService
  ) {
    if (data.deco) {
      this.totalCount = data.deco.quantity;
    } else {
      this.totalCount = sum(
        data.item.matrixRows.map(row => Number(row.quantity))
      );
    }

    if (data.config) {
      this.orderConfig = data.config.module.settings;
    }

    this.orderId = data.oId;
  }

  getOrder() {
    this.orderFormService.order$
      .pipe(take(1))
      .subscribe((order: OrderDetails) => {
        this.order = order;
        if (order && order.orderStatus != "Booked") {
          this.getVendorAndCustomerCurrency(this.order.accountId)
        } else {
          this.costExchangeRate.next(parseFloat(this.data.item.exchageRateForVendor));
          this.customerExchangeRate.next(parseFloat(this.data.item.exchageRateForCustomer));
          this.baseCurrency = this.data.item.fromCurrencyCode;
          this.vendorCurrencyCode = this.data.item.toCurrencyCodeForVendor;
          this.customerCurrencyCode = this.data.item.toCurrencyCodeForCustomer;
        }
      });

  }

  getBaseCurrency() {
    this.currencyService.currencySettings.pipe(takeUntil(this.destroyed$))
      .subscribe((settings: Settings) => {
        this.baseCurrency = settings.baseCurrency;
        this.getBaseCurrencyCode(this.baseCurrency);
        this.currencyEnabled = settings.enableCurrency === "1";
      });
  }

  getBaseCurrencyCode(baseCurrency: string) {
    this.currencyService.currencies.pipe(take(1))
      .subscribe((currencyItems: CurrencyItem[]) => {
        const currencyItem = currencyItems.find((searchItem: CurrencyItem) => searchItem.code === baseCurrency);
        if (currencyItem) {
          this.baseCurrencyId = currencyItem.id;
          this.defaultId = currencyItem.id
        }
      })
  }

  getVendorAndCustomerCurrency(accountId: string) {
    forkJoin(
      this.api.getAccountDetails(this.data.item.vendorId)
        .pipe(take(1)),
      this.api.getAccountDetails(accountId)
        .pipe(take(1))
    )
      .subscribe((accountDetails: any[]) => {
        console.log("account details", accountDetails);
        this.vendorCurrency = accountDetails[0].defaultCurrency != null &&
          accountDetails[0].defaultCurrency != "0" && accountDetails[0].defaultCurrency != undefined && accountDetails[1].defaultCurrency != 0
          ? accountDetails[0].defaultCurrency : this.defaultId;
        const vendorCurrencyItem = this.currencyService.currencies.value.find((currencyItem: CurrencyItem) => currencyItem.id === this.vendorCurrency);
        if (vendorCurrencyItem) this.vendorCurrencyCode = vendorCurrencyItem.code;
        console.log("vendor currency in getVendor", this.vendorCurrency);

        this.customerCurrency = accountDetails[1].defaultCurrency != null &&
          accountDetails[1].defaultCurrency != "0" && accountDetails[1].defaultCurrency != undefined && accountDetails[1].defaultCurrency != 0
          ? accountDetails[1].defaultCurrency : this.defaultId;
        const customerCurrencyItem = this.currencyService.currencies.value.find((currencyItem: CurrencyItem) => currencyItem.id === this.customerCurrency);
        if (customerCurrencyItem) this.customerCurrencyCode = customerCurrencyItem.code;
        console.log("customer currency", this.customerCurrency);

        this.currencyService.exchangeRates.pipe(takeUntil(this.destroyed$))
          .subscribe((exchangeRates: ExchangeRate[]) => {
            const costExchangeRate = exchangeRates.find((exchangeRate: ExchangeRate) => exchangeRate.fromCurrencyCode === this.currencyService.currencySettings.value.baseCurrency
              && exchangeRate.toCurrencyId === this.vendorCurrency);
            if (costExchangeRate) this.costExchangeRate.next(parseFloat(costExchangeRate.rateAfterPadding));
            if (!costExchangeRate && this.baseCurrencyId === this.vendorCurrency) this.costExchangeRate.next(1);
            console.log("costExchangeRate", this.costExchangeRate.value);
            //this.vendorCurrencyPair.next(this.displayBaseVendorPair());
          });

        this.currencyService.exchangeRates.pipe(takeUntil(this.destroyed$))
          .subscribe((exchangeRates: ExchangeRate[]) => {
            const customerExchangeRate = exchangeRates.find((exchangeRate: ExchangeRate) => exchangeRate.fromCurrencyCode === this.currencyService.currencySettings.value.baseCurrency
              && exchangeRate.toCurrencyId === this.customerCurrency);
            if (customerExchangeRate) this.customerExchangeRate.next(parseFloat(customerExchangeRate.rateAfterPadding));
            if (!customerExchangeRate && this.baseCurrencyId === this.customerCurrency) this.customerExchangeRate.next(1);
            console.log("customer exchange rate", this.customerExchangeRate.value);
          });
        //this.customerCurrencyPair.next(this.displayBaseCustomerPair());
      })
  }

  // getDefaultUSDId() {
  //   console.log("Current currencies", this.currencyService.currencies.value);
  //   const usd = this.currencyService.currencies.value.find((currencyItem: CurrencyItem) => currencyItem.code === 'USD');
  //   if (usd !== null && usd != undefined) this.defaultId = usd.id;
  // }

  displayCostConverted(cost) {
    if (!cost || !this.costExchangeRate) return 0;
    return this.costExchangeRate.value * cost;
  }

  displayPriceConverted(price) {
    if (!price || !this.customerExchangeRate) return 0;
    return this.customerExchangeRate.value * price;
  }

  subscribeToAccount(){
    this.adminFeeSubscription = this.accountService.adminFeeEnabled.subscribe((adminFee: boolean) => {
      if (adminFee && !this.currencyEnabled){
          this.orderService.orderDetails.pipe(takeUntil(this.destroyed$))
            .subscribe((orderDetails: OrderDetails) => this.orderDetails = orderDetails);
          console.log("One fired");
        this.displayColumns = [
          'code', 'name', 'description', 'quantity', 'cost', 'adminFee', 'revCost',
          'price',
          // 'itemTaxOff', 
          // 'chargeGstTaxOnPo', 
          // 'isCommissionEnabled',
          // 'matchOrderQty', 
          // 'rollbackDistributeRows', 
          'settings', 'actions'
        ]
      } else if (adminFee && this.currencyEnabled){
        this.orderService.orderDetails.pipe(takeUntil(this.destroyed$))
          .subscribe((orderDetails: OrderDetails) => this.orderDetails = orderDetails);
          console.log("Two fired");
        this.displayColumns = [
          'code', 'name', 'description', 'quantity', 'vendorExchangeRate', 'vendorCurrency',
           'cost', 'adminFee', 'revCost',
           'customerCurrency', 'customerExchangeRate',
          'price', 'settings', 'actions'
        ];
      } else if (!adminFee && this.currencyEnabled){
        console.log("Three fired");
        this.displayColumns = [
          'code', 'name', 'description', 'quantity', 'vendorCurrency', 
          'vendorExchangeRate', 'cost', 'customerCurrency', 'customerExchangeRate',
          'price',
          // 'itemTaxOff', 
          // 'chargeGstTaxOnPo', 
          // 'isCommissionEnabled',
          // 'matchOrderQty', 
          // 'rollbackDistributeRows', 
          'settings', 'actions'
        ];
      } else {
        console.log("Four fired");
        this.displayColumns = [
          'code', 'name', 'description', 'quantity', 'cost',
          'price',
          // 'itemTaxOff', 
          // 'chargeGstTaxOnPo', 
          // 'isCommissionEnabled',
          // 'matchOrderQty', 
          // 'rollbackDistributeRows', 
          'settings', 'actions'
        ];
      }
    });
  }

  configureSupplierDeco() {
    if (!this.data.product || !this.data.deco) {
      return;
    }
    const product: ProductDetails = this.data.product;
    const deco: IDecoVendor = this.data.deco;

    if (deco.vendorSupplierDecorated == '1' && deco.sourceDecorationId && deco.sourceLocationId) {

      const location = product.SupplierLocationArray.Location.find((location) => location.locationId === deco.sourceLocationId);
      if (location) {
        const decoration = location.DecorationArray.Decoration.find((decoration) => decoration.decorationId === deco.sourceDecorationId);
        this.supplierLocation = location;
        this.supplierDecoration = decoration;
      }
    }
  }
qq
  ngOnInit() {
    this.getBaseCurrency();
    //this.getDefaultUSDId();
    this.getOrder();
    this.getFields();
    this.subscribeToAccount();
    this.api.getAddonCharges({ term: { status: '1' } }).subscribe(
      (res: any[]) => {
        this.additionalCharges = unionBy(
          this.data.charges.map(r => new AdditionalCharge(r)),
          res.map(r => AdditionalCharge.fromCharge(r)),
          'code'
        )
        this.filteredCharges = sortBy(this.additionalCharges, 'name');
      },
      (err) => { }
    );

    this.configureSupplierDeco();
    console.log("data charges", this.data.charges);
    this.selectedCharges = this.data.charges.map(c => new AdditionalCharge(c)) || [];
    console.log("this.selectedCharges", this.selectCharges);
    this.selectCharges.setValue(this.selectedCharges.map(c => c.code));

    this.search.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(val => {
      this.filteredCharges =
        this.additionalCharges.filter(charge =>
          charge.name.toLowerCase().indexOf(val.toLowerCase()) >= 0
        );

      this.filteredCharges = sortBy(this.filteredCharges, 'name');
      const selectedCodes = [];
      each(this.selectedCharges, ch => {
        if (findIndex(this.filteredCharges, { code: ch.code }) > -1) {
          selectedCodes.push(ch.code);
        }
      });

      this.selectCharges.setValue(selectedCodes);
    });

    
  }

  

  ngOnDestroy(){
    if (this.adminFeeSubscription) this.adminFeeSubscription.unsubscribe();
    this.destroyed$.next(true);
  }

  getFields() {
    this.globalService.onModuleFieldsChanged
      .pipe(takeUntil(this.destroyed$))
      .subscribe((fields: any[]) => {
        this.fields = fields;
        console.log("here are the fields", fields);
      });
  }

  changeSelectedCharges(codes) {
    each(this.filteredCharges, ch => {
      if (codes.indexOf(ch.code) > -1) {
        const j = findIndex(this.selectedCharges, { code: ch.code });
        if (j < 0) {

          // Temporary fix due to naming mismatch
          ch.itemCode = ch.code;
          ch.addonChargesType = ch.chargeType;
          this.selectedCharges.push(ch);
        }
      } else {
        remove(this.selectedCharges, { code: ch.code });
      }
    });
    this.selectedCharges = this.selectedCharges.slice(0);
  }

  addCharge(charge) {
    console.log('Add Charge', charge);

    if (charge && charge.ChargePriceArray && charge.ChargePriceArray.ChargePrice) {
      const pricing = charge.ChargePriceArray.ChargePrice;
      if (pricing.length) {
        const price = pricing[0].price; // TODO: Use price breaks to determine pricing
        const newCharge = new AdditionalCharge(charge);
        newCharge.cost = price;
        newCharge.name = charge.chargeName;
        newCharge.description = charge.chargeDescription;
        newCharge.addonChargesId = charge.chargeId;

        if (this.orderConfig) {
          newCharge.chargeGstTaxOnPo = (this.orderConfig.enableGstOnPo == '1' && charge.chargeGstTaxOnPo);
        }
        this.selectedCharges.push(newCharge);
        this.table.renderRows();
      }
    }
  }


  onEditCharge(row, i) {
    const dialogRef = this.dialog.open(EditChargeComponent, {
      data: {
        vendor: this.data.deco,
        item: this.data.item,
        config: this.data.config,
        addon: row,
      },
      panelClass: "order-edit-charge-modal"
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!data)
        return;

      const id = findIndex(this.additionalCharges, { code: row.code });
      this.additionalCharges[id].setData(data);

      const i = findIndex(this.selectedCharges, { code: row.code });
      this.selectedCharges[i].setData(data);
    });
  }

  save() {
    const deletedCharges = [];
    this.data.charges.forEach(charge => {
      const i = findIndex(this.selectedCharges, {
        addonChargeUpdateId: charge.addonChargeUpdateId
      });
      if (i < 0) {
        deletedCharges.push(charge.addonChargeUpdateId);
      }
    });

    this.dialogRef.close({
      action: 'save',
      charges: this.selectedCharges.map(c => c.toObject()),
      deleted: deletedCharges
    });
  }

  /* Temporarily disabled.
  addCharge() {
    const dialogRef = this.dialog.open(EditChargeComponent, {
      data: {},
      panelClass: "order-edit-charge-modal"
    });

    dialogRef.afterClosed().subscribe((data) => {
      if(!data) {
        return;
      }

      const i = findIndex(this.additionalCharges, { code: data.code });

      if (i >= 0) {
        this.msg.show('Item code already exists', 'error');
        return;
      }

      this.selectedCharges.push(
        new AdditionalCharge({
          ...data,
          matchOrderQty: false,
          itemTaxOff: false,
          chargeGstTaxOnPo: false,
          isCommissionEnabled: false
        })
      );
      this.selectedCharges = this.selectedCharges.slice(0);
    });
  }
  */

  deleteCharge(i) {
    this.selectedCharges.splice(i, 1);
    this.selectCharges.setValue(this.selectedCharges.map(c => c.code));
    this.selectedCharges = this.selectedCharges.slice(0);
  }

  checkQuantity(element) {
    if (element.matchOrderQty) {
      element.quantity = this.totalCount;
    } else {
      element.quantity = 1;
    }
  }

  clearSearch() {
    this.search.setValue('');
  }
  
  isPersonalizationsCharge(row){
     if(row.id && (row.name.indexOf("Personalization") > -1 || row.name.indexOf("personalization") > -1 )){
         return true;
     }
     return false;
  }
  
  getPersonalizations(id){
    const dialogRef = this.dialog.open(PersonalizationComponent, {
      data: {
        orderId: this.orderId,
        addonChargeId: id,
        deco: this.data.deco,
        item: this.data.item,
        config: this.data.config,
      },
      panelClass: "personalization-list-modal"
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!data)
        return;
    });  
  }
}
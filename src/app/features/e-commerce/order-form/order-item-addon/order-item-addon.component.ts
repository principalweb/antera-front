import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { IAddonCharge2, IAddonCharge, IDecoVendor } from '../interfaces';
import { FormBuilder } from '@angular/forms';
import { takeUntil, skip, debounceTime, take } from 'rxjs/operators';
import { Subject, Subscription, BehaviorSubject, forkJoin } from 'rxjs';
import { LineItem, AdditionalCharge, OrderDetails } from 'app/models';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { EditChargeComponent } from '../../components/edit-charge/edit-charge.component';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { EcommerceOrderService } from '../../order.service';
import { calculateUnitCost, calculateMargin } from '../../utils';
import { ExchangeRate } from 'app/models/exchange-rate';
import { CurrencyService } from 'app/features/admin/currency/currency.service';
import { CurrencyItem } from 'app/models/currency-item';
import { OrderFormService } from '../order-form.service';
import { ApiService } from 'app/core/services/api.service';
import { Settings } from "app/features/admin/currency/interface/interface";

@Component({
  selector: 'app-order-item-addon',
  templateUrl: './order-item-addon.component.html',
  styleUrls: ['./order-item-addon.component.scss']
})
export class OrderItemAddonComponent implements OnInit, OnDestroy, OnChanges {

  @Input() selection: SelectionModel<Partial<IAddonCharge>>;
  @Input() config: any;
  @Input() addon: IAddonCharge2;
  @Input() deco: IDecoVendor;
  @Input() item: LineItem;
  @Input() type: string = 'item';
  @Output() addonChange: EventEmitter<any> = new EventEmitter();
  @Output() actions: EventEmitter<any> = new EventEmitter();

  destroyed$ = new Subject<boolean>();
  calculateAdminFeeCost = calculateUnitCost;
  calculateMargin = calculateMargin;
  currencyEnabled: boolean;
  costExchangeRate: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  customerExchangeRate: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  vendorCurrencyPair: BehaviorSubject<string> = new BehaviorSubject<string>("");
  customerCurrencyPair: BehaviorSubject<string> = new BehaviorSubject<string>("");
  vendorCurrency: string;
  customerCurrency: string;
  order: OrderDetails;
  exchangeRates: ExchangeRate[];
  baseCurrency: string;
  baseCurrencyId: string;
  vendorCurrencyCode: string;
  customerCurrencyCode: string;
  defaultId: string;
  form: any;
  edit: boolean = true;
  rollToProduct: boolean;
  adminFeeEnabled: boolean;
  subscription: Subscription;
  orderDetails: OrderDetails;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private accountService: AccountsService,
    public currencyService: CurrencyService,
    private api: ApiService,
    private orderFormService: OrderFormService,
    private orderService: EcommerceOrderService
    ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item && changes.item.currentValue) {
      this.updateRollToProduct();
    }
  }


  private updateRollToProduct() {
    if (this.type === 'decoration') {
      this.rollToProduct = Boolean(this.item && +this.item.rollDecoChargesToProduct);
    } else {
      this.rollToProduct = Boolean(this.item && +this.item.rollAddonChargesToProduct);
    }
  }

  ngOnInit() {
    this.addon.price
    this.getBaseCurrency();
    //this.getDefaultUSDId();
    this.getOrder();
    this.form = this.createForm();
    this.updateRollToProduct();
    this.subscribeToAccount();
    this.getAdminFeeRate();
  }

  getDefaultUSDId() {
    const usd = this.currencyService.currencies.value.find((currencyItem: CurrencyItem) => currencyItem.code === 'USD');
    if (usd !== null && usd != undefined) this.defaultId = usd.id;
  }

  getOrder() {
    this.orderFormService.order$
      .pipe(take(1))
      .subscribe((order: OrderDetails) => {
        this.order = order;
        if (order && order.orderStatus != "Booked") {
          this.getVendorAndCustomerCurrency(this.order.accountId)
        } else {
          this.costExchangeRate.next(parseFloat(this.item.exchageRateForVendor));
          this.customerExchangeRate.next(parseFloat(this.item.exchageRateForCustomer));
          this.baseCurrency = this.item.fromCurrencyCode;
          this.vendorCurrencyCode = this.item.toCurrencyCodeForVendor;
          this.customerCurrencyCode = this.item.toCurrencyCodeForCustomer;
        }
      });
  }

  getVendorAndCustomerCurrency(accountId: string) {
    forkJoin(
      this.api.getAccountDetails(this.item.vendorId)
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
        console.log("vendor currency item", vendorCurrencyItem);
        if (vendorCurrencyItem) this.vendorCurrencyCode = vendorCurrencyItem.code;

        this.customerCurrency = accountDetails[1].defaultCurrency != null &&
          accountDetails[1].defaultCurrency != "0" && accountDetails[1].defaultCurrency != undefined && accountDetails[1].defaultCurrency != 0
          ? accountDetails[1].defaultCurrency : this.defaultId;
        const customerCurrencyItem = this.currencyService.currencies.value.find((currencyItem: CurrencyItem) => currencyItem.id === this.customerCurrency);
        if (customerCurrencyItem) this.customerCurrencyCode = customerCurrencyItem.code;

        this.currencyService.exchangeRates.pipe(takeUntil(this.destroyed$))
          .subscribe((exchangeRates: ExchangeRate[]) => {
            const costExchangeRate = exchangeRates.find((exchangeRate: ExchangeRate) => exchangeRate.fromCurrencyCode === this.currencyService.currencySettings.value.baseCurrency
              && exchangeRate.toCurrencyId === this.vendorCurrency);
            if (costExchangeRate) this.costExchangeRate.next(parseFloat(costExchangeRate.rateAfterPadding));
            if (!costExchangeRate && this.baseCurrencyId === this.vendorCurrency) this.costExchangeRate.next(1);
          });

        this.currencyService.exchangeRates.pipe(takeUntil(this.destroyed$))
          .subscribe((exchangeRates: ExchangeRate[]) => {
            const customerExchangeRate = exchangeRates.find((exchangeRate: ExchangeRate) => exchangeRate.fromCurrencyCode === this.currencyService.currencySettings.value.baseCurrency
              && exchangeRate.toCurrencyId === this.customerCurrency);
            if (customerExchangeRate) this.customerExchangeRate.next(parseFloat(customerExchangeRate.rateAfterPadding));
            if (!customerExchangeRate && this.baseCurrencyId === this.customerCurrency) this.customerExchangeRate.next(1);
          });
      })
  }

  
  subscribeToAccount(){
    this.accountService.adminFeeEnabled.pipe(takeUntil(this.destroyed$)).subscribe((adminFee: boolean) => this.adminFeeEnabled = adminFee);
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

  customerCurrencyMatches() {
    return this.baseCurrency === this.customerCurrencyCode;
  }

  vendorCurrencyMatches() {
    return this.baseCurrency === this.vendorCurrencyCode;
  }

  displayCostConverted() {
    console.log("cost converted running");
    if (!this.addon.cost || !this.costExchangeRate) return 0;
    return (this.costExchangeRate.value * parseFloat(this.addon.cost));
  }

  displayPriceConverted() {
    if (!this.addon.price || !this.customerExchangeRate) return 0;
    return this.customerExchangeRate.value * parseFloat(this.addon.price);
  }


  getAdminFeeRate() {
    if (this.adminFeeEnabled) this.orderService.orderDetails.pipe(takeUntil(this.destroyed$))
      .subscribe((orderDetails: OrderDetails) => this.orderDetails = orderDetails);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  createForm() {

    let restrictEditPrice = false;

    if (this.config 
      && this.config.permissions 
      && this.config.permissions.restrict_order_sales_pricing 
      && this.config.permissions.restrict_order_sales_pricing.data) {
        restrictEditPrice = true;
    }

    this.form = this.fb.group({
      id: [],
      addonChargeUpdateId: [this.addon.addonChargeUpdateId],
      addonChargesId: [this.addon.addonChargesId],
      addonChargesType: [this.addon.addonChargesType],
      adminFeeCost: [{
        value: this.addon.adminFeeCost,
        disabled: true
      }],
      totalCostIncludingAdminFee: [{
        value: this.addon.totalCostIncludingAdminFee,
        disabled: true
      }],
      artworkData: [this.addon.artworkData],
      artworkDesignId: [this.addon.artworkDesignId],
      code: [this.addon.code],
      commValue: [this.addon.commValue],
      cost: [this.addon.cost || 0],
      decoParentLineNo: [this.addon.decoParentLineNo],
      decoParentMappedId: [this.addon.decoParentMappedId],
      description: [this.addon.description],
      discount: [this.addon.discount],
      exactorSku: [this.addon.exactorSku],
      isCommissionEnabled: [this.addon.isCommissionEnabled],
      chargeGstTaxOnPo: [this.addon.chargeGstTaxOnPo],
      rollbackDistributeRows: [this.addon.rollbackDistributeRows],
      isDiscountEnabled: [this.addon.isDiscountEnabled],
      itemTax: [+this.addon.itemTax],
      itemTaxOff: [+this.addon.itemTaxOff],
      matchOrderQty: [+this.addon.matchOrderQty],
      name: [this.addon.name],
      priceConverted: [this.displayPriceConverted()],
      costConverted: [this.displayCostConverted()],
      productSequance: [this.addon.productSequance],
      showAddonCharges: [this.addon.showAddonCharges],
      quantity: [{ 
        value: this.addon.quantity || 0, 
        disabled: +this.addon.matchOrderQty
      }],
      price: [{
        value: this.addon.price || 0,
        disabled: restrictEditPrice
      }],
    });

    this.form.valueChanges.pipe(
      takeUntil(this.destroyed$),
      debounceTime(250),
    ).subscribe((_value) => {
      if (_value.matchOrderQty) {
        this.form.patchValue({
          'quantity': this.item.quantity
        }, { emitEvent: false });
      }
    });
    this.runFormSubscriptions();

    this.form.valueChanges.pipe(
      takeUntil(this.destroyed$),
      debounceTime(1500),
    ).subscribe((_value) => {
      const value = {
        ...this.form.value,
        matchOrderQty: _value.matchOrderQty ? '1' : '0',
        chargeGstTaxOnPo: _value.chargeGstTaxOnPo ? '1' : '0',
        itemTaxOff: _value.itemTaxOff ? '1' : '0',
        rollbackDistributeRows: _value.rollbackDistributeRows ? '1' : '0',
      };
      this.addonChange.emit({ charge: value, item: this.item, valid: this.form.valid });
    });
    return this.form;
  }

  subscribeToPriceConverted() {
    this.form.controls.priceConverted.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((priceConverted: string) => {
        this.form.controls.price.patchValue(this.convertPriceToOrginalRate(priceConverted));
      });
  }

  subscribeToCostConverted() {
    this.form.controls.costConverted.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((costConverted: string) => {
        this.form.controls.cost.patchValue(this.convertCostToOriginalRate(costConverted));
      });
  }

  convertPriceToOrginalRate(convertedPrice: string): string {
    return (parseFloat(convertedPrice) / this.customerExchangeRate.value).toString();
  }

  convertCostToOriginalRate(convertedCost: string): string {
    return (parseFloat(convertedCost) / this.costExchangeRate.value).toString();
  }

  runFormSubscriptions() {
    this.subscribeToPriceConverted();
    this.subscribeToCostConverted();
  }

  editCharge() {
    const addon = new AdditionalCharge(this.addon);
    const dialogRef = this.dialog.open(EditChargeComponent, {
      data: {
        addon: addon,
        vendor: this.deco,
        item: this.item,
        config: this.config,
      },
      panelClass: "order-edit-charge-modal"
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }

      this.form.patchValue(data);

    });
  }

  deleteCharge() {
    this.actions.emit({
      type: 'deleteAddonCharge',
      payload: {
        type: this.type,
        addonChargeUpdateIds: [this.addon.addonChargeUpdateId],
        lineItemUpdateId: this.item.lineItemUpdateId,
      }
    });
  }

}

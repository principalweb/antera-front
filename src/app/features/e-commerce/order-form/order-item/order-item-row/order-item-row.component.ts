import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ChangeDetectorRef, OnChanges, OnDestroy, ViewChildren } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { IMatrixRow, IDecoVendor, IProduct, ILineItem, ProductPart, CostStrategies, FobPoint, PriceStrategies } from '../../interfaces';
import { Subject, Observable, forkJoin, BehaviorSubject } from 'rxjs';
import { FormBuilder, Validators, FormControlName, FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { takeUntil, skip, debounceTime, distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { OrderItemDecoComponent } from '../../order-item-deco/order-item-deco.component';
import { OrderFormService } from '../../order-form.service';
import { ApiService } from 'app/core/services/api.service';
import { LocationFormComponent } from 'app/shared/location-form/location-form.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { throwMatDuplicatedDrawerError } from '@angular/material/sidenav';
import { Overlay } from '@angular/cdk/overlay';
import { ProductInventory } from '../../store/order-form.reducer';
import { CalculatorAreaComponent } from '../../calculator-area/calculator-area.component';
import { LineItem, OrderDetails } from 'app/models';
import { EcommerceOrdersService } from 'app/features/e-commerce/orders.service';
import { EcommerceOrderService } from 'app/features/e-commerce/order.service';
import { calculateMargin, markup, calculateUnitCost } from 'app/features/e-commerce/utils';
import { CurrencyService } from 'app/features/admin/currency/currency.service';
import { Account } from "app/models";
import { ExchangeRate } from 'app/models/exchange-rate';
import { Settings } from 'app/features/admin/currency/interface/interface';
import { CurrencyItem } from 'app/models/currency-item';
import { Store } from "@ngrx/store";
import * as OrderFormActions from "app/features/e-commerce/order-form/store/order-form.actions";
import * as fromOrderForm from "app/features/e-commerce/order-form/store/order-form.reducer";

const distinct = (value, index, self) => {
  return self.indexOf(value) === index;
};

@Component({
  selector: "app-order-item-row",
  templateUrl: "./order-item-row.component.html",
  styleUrls: ["./order-item-row.component.scss"],
})
export class OrderItemRowComponent implements OnInit, OnChanges, OnDestroy {
  @Input() config: any;
  @Input() row: IMatrixRow;
  @Input() rowIndex: number;
  @Input() item: LineItem;
  @Input() product: IProduct;
  @Input() selection: SelectionModel<IMatrixRow>;
  @Input() decorations: IDecoVendor[];
  @Input() productFob: any[];
  @Input() localFob: any[];
  @Input() adminFeeEnabled: boolean;
  @Input() productInventory: ProductInventory;
  @Output() rowChange: EventEmitter<any> = new EventEmitter();
  @Output() actions: EventEmitter<any> = new EventEmitter();

  @ViewChildren(FormControlName) formControlNames: FormControlName;
  @ViewChildren(OrderItemDecoComponent) itemDecoList;

  decoSelection: SelectionModel<IDecoVendor>;
  markup = markup;
  calculateMargin = calculateMargin;
  calculateAdminFeeCost = calculateUnitCost;
  parseFloat = parseFloat;
  expand: boolean = false;
  formGroup: FormGroup;
  destroyed$ = new Subject<boolean>();
  orderDetails: OrderDetails;
  sizes: {}[];
  colors: {}[];
  currencyEnabled: boolean;
  costExchangeRate: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  customerExchangeRate: BehaviorSubject<number> = new BehaviorSubject<number>(
    0
  );
  vendorCurrencyPair: BehaviorSubject<string> = new BehaviorSubject<string>("");
  customerCurrencyPair: BehaviorSubject<string> = new BehaviorSubject<string>(
    ""
  );
  vendorCurrency: string;
  customerCurrency: string;
  order: OrderDetails;
  exchangeRates: ExchangeRate[];
  baseCurrency: string;
  baseCurrencyId: string;
  vendorCurrencyCode: string;
  customerCurrencyCode: string;
  defaultId: string;
  fallbackWarehouse: FobPoint = {
    fobId: "0",
    fobCity: "Main",
    fobState: "",
    type: "DropShip",
  };

  matchingPart: ProductPart;
  pricing$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private api: ApiService,
    public currencyService: CurrencyService,
    private orderFormService: OrderFormService,
    private orderService: EcommerceOrderService,
    private dialog: MatDialog,
    private overlay: Overlay,
    private store: Store<fromOrderForm.State>
  ) {}

  ngOnInit() {
    console.log("current Item", this.item);
    //this.getDefaultUSDId();
    this.getBaseCurrency();
    this.getAdminFeeRate();
    this.getOrder();
    this.createForm();

    this.decoSelection = new SelectionModel<IDecoVendor>(true, []);
    this.pricing$ = this.orderFormService.pricing$.pipe(
      map((pricing) => {
        if (pricing && pricing.products && pricing.products.length > 0) {
          return pricing.products.filter(
            (product) => product.id === this.item.productId
          );
        }
        return pricing;
      })
    );
  }

  isFreightOrDiscount(): boolean {
    return this.item.lineType == "4" || this.item.lineType == "5";
  }

  customerCurrencyMatches() {
    return this.baseCurrency === this.customerCurrencyCode;
  }

  vendorCurrencyMatches() {
    return this.baseCurrency === this.vendorCurrencyCode;
  }

  getBaseCurrency() {
    this.currencyService.currencySettings
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settings: Settings) => {
        this.baseCurrency = settings.baseCurrency;
        this.getBaseCurrencyCode(this.baseCurrency);
        this.currencyEnabled = settings.enableCurrency === "1";
      });
  }

  getBaseCurrencyCode(baseCurrency: string) {
    this.currencyService.currencies
      .pipe(take(1))
      .subscribe((currencyItems: CurrencyItem[]) => {
        const currencyItem = currencyItems.find(
          (searchItem: CurrencyItem) => searchItem.code === baseCurrency
        );
        if (currencyItem) {
          this.baseCurrencyId = currencyItem.id;
          this.defaultId = currencyItem.id;
        }
      });
  }

  getAdminFeeRate() {
    if (this.adminFeeEnabled)
      this.orderService.orderDetails
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          (orderDetails: OrderDetails) => (this.orderDetails = orderDetails)
        );
  }

  getOrder() {
    this.orderFormService.order$
      .pipe(take(1))
      .subscribe((order: OrderDetails) => {
        this.order = order;
        if (order && order.orderStatus != "Booked") {
          this.getVendorAndCustomerCurrency(this.order.accountId);
        } else {
          this.costExchangeRate.next(
            parseFloat(this.item.exchageRateForVendor)
          );
          this.customerExchangeRate.next(
            parseFloat(this.item.exchageRateForCustomer)
          );
          this.baseCurrency = this.item.fromCurrencyCode;
          this.vendorCurrencyCode = this.item.toCurrencyCodeForVendor;
          this.customerCurrencyCode = this.item.toCurrencyCodeForCustomer;
        }
      });
  }

  splitShip(event: MouseEvent) {
    this.dialog.open(LocationFormComponent, {
      width: "50vw",
      height: "100vh",
      hasBackdrop: false,
      autoFocus: true,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      position: {
        top: "0px",
        right: "0px",
      },
    });
  }

  toggleExpand() {
    this.expand = !this.expand;
    this.cd.markForCheck();
  }

  generateAttributes() {
    const sizes = [];
    const colors = [];
    let quantities = [];

    if (this.product) {
      this.product.ProductPartArray.ProductPart.forEach((part) => {
        // Group price options by sizes
        const size = part.ApparelSize.labelSize;
        sizes.push(size);

        // Update form
        const color = part.ColorArray.Color.colorName;
        colors.push(color);
      });

      this.sizes = sizes.filter(distinct);
      this.colors = colors.filter(distinct);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.product && changes.product.currentValue) {
      this.generateAttributes();
    }

    // Configure upstream form group
    if (this.formGroup) {
      if (changes.row && changes.row.currentValue) {
        this.patchFormWithChanges(changes);
      }
      if (changes.item && changes.item.currentValue) {
        if (!this.formGroup.dirty) {
          this.formGroup.patchValue(
            { lineItemUpdateId: changes.item.currentValue.lineItemUpdateId },
            { onlySelf: true, emitEvent: false }
          );
          this.resetFulfillmentArray();
        }
      }
      this.formGroup.markAsPristine();
    }
    console.log("this.row", this.row);
    console.log("changes.row", changes.row);
    // if (this.currencyEnabled && this.row.matrixUpdateId && this.customerCurrencyCode) {
    //   this.store.dispatch(new OrderFormActions.UpdateCustomerCurrency({
    //     [this.row.matrixUpdateId]: this.customerCurrencyCode
    //   }))
    // }

    // if (this.currencyEnabled && this.row.matrixUpdateId && this.vendorCurrencyCode) {
    //   this.store.dispatch(
    //     new OrderFormActions.UpdateVendorCurrency({
    //       [this.row.matrixUpdateId]: this.vendorCurrencyCode
    //     })
    //   );
    // }
  }

  private patchFormWithChanges(changes: SimpleChanges) {
    const formValue = this.formGroup.value;
    const patch = {};

    if (!this.formGroup.dirty) {
      for (const prop in formValue) {
        if (formValue[prop] !== changes.row.currentValue[prop]) {
          patch[prop] = changes.row.currentValue[prop];
        }
      }
    }
    this.formGroup.patchValue(patch, { onlySelf: true, emitEvent: false });
  }

  isExpandable(): boolean {
    return this.decorations && this.decorations.length > 0;
  }

  // getDefaultUSDId(){
  //   const usd = this.currencyService.currencies.value.find((currencyItem: CurrencyItem) => currencyItem.code === 'USD');
  //   if (usd !== null && usd != undefined) this.defaultId = usd.id;
  // }

  getVendorAndCustomerCurrency(accountId: string) {
    forkJoin(
      this.api.getAccountDetails(this.item.vendorId).pipe(take(1)),
      this.api.getAccountDetails(accountId).pipe(take(1))
    ).subscribe((accountDetails: any[]) => {
      console.log("account details", accountDetails);
      this.vendorCurrency =
        accountDetails[0].defaultCurrency != null &&
        accountDetails[0].defaultCurrency != "0" &&
        accountDetails[0].defaultCurrency != undefined &&
        accountDetails[0].defaultCurrency != 0
          ? accountDetails[0].defaultCurrency
          : this.defaultId;
      const vendorCurrencyItem = this.currencyService.currencies.value.find(
        (currencyItem: CurrencyItem) => currencyItem.id === this.vendorCurrency
      );
      if (vendorCurrencyItem) this.vendorCurrencyCode = vendorCurrencyItem.code;

      this.customerCurrency =
        accountDetails[1].defaultCurrency != null &&
        accountDetails[1].defaultCurrency != "0" &&
        accountDetails[1].defaultCurrency != undefined &&
        accountDetails[1].defaultCurrency != 0
          ? accountDetails[1].defaultCurrency
          : this.defaultId;
      const customerCurrencyItem = this.currencyService.currencies.value.find(
        (currencyItem: CurrencyItem) =>
          currencyItem.id === this.customerCurrency
      );
      if (customerCurrencyItem)
        this.customerCurrencyCode = customerCurrencyItem.code;

      this.currencyService.exchangeRates
        .pipe(takeUntil(this.destroyed$))
        .subscribe((exchangeRates: ExchangeRate[]) => {
          const costExchangeRate = exchangeRates.find(
            (exchangeRate: ExchangeRate) =>
              exchangeRate.fromCurrencyCode ===
                this.currencyService.currencySettings.value.baseCurrency &&
              exchangeRate.toCurrencyId === this.vendorCurrency
          );
          if (costExchangeRate)
            this.costExchangeRate.next(
              parseFloat(costExchangeRate.rateAfterPadding)
            );
          if (!costExchangeRate && this.baseCurrencyId === this.vendorCurrency)
            this.costExchangeRate.next(1);
        });

      this.currencyService.exchangeRates
        .pipe(takeUntil(this.destroyed$))
        .subscribe((exchangeRates: ExchangeRate[]) => {
          const customerExchangeRate = exchangeRates.find(
            (exchangeRate: ExchangeRate) =>
              exchangeRate.fromCurrencyCode ===
                this.currencyService.currencySettings.value.baseCurrency &&
              exchangeRate.toCurrencyId === this.customerCurrency
          );
          if (customerExchangeRate)
            this.customerExchangeRate.next(
              parseFloat(customerExchangeRate.rateAfterPadding)
            );
          if (
            !customerExchangeRate &&
            this.baseCurrencyId === this.customerCurrency
          )
            this.customerExchangeRate.next(1);
        });
    });
  }

  getExchangeRate() {
    this.currencyService.exchangeRates
      .pipe(take(1))
      .subscribe((exchangeRates: ExchangeRate[]) => {
        this.exchangeRates = exchangeRates;
      });
  }

  displayCostConverted() {
    if (!this.row.cost || !this.costExchangeRate.value) return 0;
    return this.costExchangeRate.value * this.row.cost;
  }

  displayPriceConverted() {
    if (!this.row.price || !this.customerExchangeRate.value) return 0;
    return this.customerExchangeRate.value * this.row.price;
  }

  deleteRow(): void {
    this.actions.emit({
      type: "itemRowDelete",
      data: { row: this.row, item: this.item },
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  /**
   * Toggle Cost Strategy
   * With only two options use a simple toggle
   */
  toggleCostStrategy() {
    const field = this.formGroup.get("costStrategy");
    const newStrategy =
      field.value === CostStrategies.MANUAL
        ? CostStrategies.PRICE_BREAK
        : CostStrategies.MANUAL;

    field.setValue(newStrategy);
  }

  setCostStrategyToManual(event) {
    if (event.key === "Enter" || event.key === "Tab" || event.key === "Shift") {
      return;
    }
    const field = this.formGroup.get("costStrategy");
    field.setValue(CostStrategies.MANUAL);
  }

  togglePriceStrategy() {
    const field = this.formGroup.get("priceStrategy");
    const newStrategy =
      field.value === PriceStrategies.MANUAL
        ? PriceStrategies.PRICE_BREAK
        : PriceStrategies.MANUAL;

    field.setValue(newStrategy);
  }

  setPriceStrategyToManual(event) {
    if (event.key === "Enter" || event.key === "Tab" || event.key === "Shift") {
      return;
    }
    // console.log(this.formGroup.get('price').value);
    const field = this.formGroup.get("priceStrategy");
    field.setValue(PriceStrategies.MANUAL);
  }

  openDecorationList() {
    const row = { ...this.row, ...this.formGroup.value };
    this.actions.emit({
      type: "openDecorationList",
      row: row,
      item: this.item,
    });
  }

  get fulfillmentsFormArray(): FormArray {
    if (!this.formGroup) {
      return;
    }
    return this.formGroup.get("fulfillments") as FormArray;
  }

  chooseWarehouse(event, i) {
    return;
  }

  compareWarehouse(warehouse: any, value: string) {
    return value === warehouse.type + "-" + warehouse.fobId;
  }

  compareIncomingWarehouse(warehouse: any, value: string) {
    return value === warehouse.fobId;
  }

  chooseIncomingWarehouse(event, i) {
    const warehouse = event.value;
    const group = this.fulfillmentsFormArray.at(i);
    group.patchValue({
      incomingWarehouse: warehouse.fobId,
      incomingWarehouseName: warehouse.fobId,
    });
  }

  chooseSourceWarehouse(event, i) {
    const warehouse = event.value;
    const group = this.fulfillmentsFormArray.at(i);

    // Temporarily patch matrix row with poType
    this.formGroup.patchValue({
      poType: warehouse.type,
    });

    group.patchValue({
      sourceWarehouse: warehouse.fobId,
      sourceWarehouseName: `${warehouse.fobCity} ${warehouse.fobState}`,
      sourceWarehouseSelectKey: warehouse.type + "-" + warehouse.fobId,
      type: warehouse.type,
    });
  }

  createForm() {
    let restrictEditPrice = false;
    let warningForHideLine = false;
    if (this.item.lineType == "4" || this.item.lineType == "5") {
      // FRIEGHT (LineType 4) AND DISCOUNT (LineType 5) does not fall for this logic
    } else {
      if (this.item.hideLine === "1") {
        console.log(this.item.hideLine);
        warningForHideLine = true;
      }
    }

    if (
      this.config &&
      this.config.permissions &&
      this.config.permissions.restrict_order_sales_pricing &&
      this.config.permissions.restrict_order_sales_pricing.data
    ) {
      restrictEditPrice = true;
    } else {
      restrictEditPrice = false;
    }

    console.log("this.row", this.row);

    this.formGroup = this.fb.group({
      matrixUpdateId: [this.row.matrixUpdateId],
      lineItemUpdateId: [this.item.lineItemUpdateId],
      rowIndex: [this.rowIndex], // Required to update rows without matrix update id
      imageUrl: [this.row.imageUrl],
      poType: [this.row.poType],
      adminFeeCost: [
        {
          value: this.orderDetails ? this.orderDetails.adminFeeRate : "",
          disabled: true,
        },
        Validators.required,
      ],
      revisedCost: [
        {
          value: this.row.unitCostIncludingAdminFee
            ? this.row.unitCostIncludingAdminFee
            : "",
          disabled: true,
        },
        Validators.required,
      ],
      priceConverted: [this.displayPriceConverted()],
      costConverted: [this.displayCostConverted()],
      calculatorData: [this.row.calculatorData],
      color: [this.row.color, Validators.required],
      size: [this.row.size, Validators.required],
      itemSku: [this.row.itemSku, Validators.required],
      quantity: [this.row.quantity || 1],
      unitQuantity: [this.row.unitQuantity || 1],
      uomId: [this.row.uomId],
      uomConversionRatio: [this.row.uomConversionRatio || 1],
      price: [
        {
          value: this.row.price || 0,
          disabled: restrictEditPrice,
        },
      ],
      cost: [this.row.cost || 0],
      origPrice: [this.row.origPrice || 0],
      origCost: [this.row.origCost || 0],
      costStrategy: [this.row.costStrategy],
      priceStrategy: [this.row.priceStrategy],
      fulfillments: this.fb.array([]),
    });

    this.runFormSubscriptions();

    this.resetFulfillmentArray();

    // Emit form changes upstream
    this.formGroup.valueChanges
      .pipe(takeUntil(this.destroyed$), debounceTime(300))
      .subscribe((_value) => {
        const value = this.formGroup.value;
        this.actions.emit({
          type: "itemRowChange",
          event: {
            data: value,
            // valid: this.formGroup.valid
            valid: true,
          },
        });
      });
    return this.formGroup;
  }

  subscribeToPriceConverted() {
    this.formGroup.controls.priceConverted.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((priceConverted: string) => {
        this.formGroup.controls.price.patchValue(
          this.convertPriceToOrginalRate(priceConverted)
        );
      });
  }

  subscribeToCostConverted() {
    this.formGroup.controls.costConverted.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((costConverted: string) => {
        this.formGroup.controls.cost.patchValue(
          this.convertCostToOriginalRate(costConverted)
        );
      });
  }

  convertPriceToOrginalRate(convertedPrice: string): string {
    return (
      parseFloat(convertedPrice) / this.customerExchangeRate.value
    ).toString();
  }

  convertCostToOriginalRate(convertedCost: string): string {
    return (parseFloat(convertedCost) / this.costExchangeRate.value).toString();
  }

  runFormSubscriptions() {
    this.subscribeToPriceConverted();
    this.subscribeToCostConverted();
  }

  resetFulfillmentArray(): void {
    // Change array structure when it's not matching
    if (this.fulfillmentsFormArray.length !== this.row.fulfillments.length) {
      while (this.fulfillmentsFormArray.length !== 0) {
        this.fulfillmentsFormArray.removeAt(0);
      }
      const fulfillmentsFormArray = this.fb.array(
        this.row.fulfillments.map((_f) => {
          const f = { ..._f };

          if (!f.sourceWarehouseName) {
            f.sourceWarehouseName = "Main";
          }

          return this.fb.group({
            sourceWarehouseSelectKey: f.type + "-" + f.sourceWarehouse,
            sourceWarehouseName: f.sourceWarehouseName || "Main",
            ...f,
          });
        })
      );
      this.formGroup.setControl("fulfillments", fulfillmentsFormArray);
    } else {
      this.fulfillmentsFormArray.patchValue(this.row.fulfillments, {
        emitEvent: false,
      });
    }
  }

  openCalculator(event: MouseEvent) {
    const dialogRef = this.dialog.open(CalculatorAreaComponent, {
      hasBackdrop: true,
      autoFocus: true,
      // scrollStrategy: this.overlay.scrollStrategies.block(),
      // position: {
      //   top: event.clientY + 'px',
      //   left: event.clientX  + 'px',
      // }
    });
    dialogRef.componentInstance.item = this.item;
    dialogRef.componentInstance.row = this.row;

    dialogRef.afterClosed().subscribe((res) => {
      if (res === "clear") {
        this.formGroup.get("calculatorData").setValue([]);
        return;
      }
      if (res && res.area) {
        const unitQuantity = this.formGroup.get("unitQuantity").value;
        const quantity = res.area * unitQuantity;
        this.formGroup.patchValue({
          uomConversionRatio: res.area,
          quantity: quantity,
          calculatorData: [res],
        });
        return;
      }
    });
  }

  applyMatchingSku() {
    const value = this.formGroup.value;
    if (this.product) {
      //  Update image
      let image;
      const color = this.formGroup.get("color").value;
      if (color) {
        const colorImage = this.product.MediaContent.find(
          (media) => media.color === color
        );
        if (colorImage) {
          image = colorImage.url;
          this.formGroup.get("imageUrl").setValue(image);
        }
      }

      const partIndex = this.product.ProductPartArray.ProductPart.findIndex(
        (part) => {
          return (
            part.ColorArray.Color.colorName === value.color &&
            part.ApparelSize.labelSize === value.size
          );
        }
      );
      if (partIndex === -1) {
        this.matchingPart = undefined;
      } else {
        // Update sku
        this.matchingPart = this.product.ProductPartArray.ProductPart[
          partIndex
        ];
        this.formGroup.patchValue({ itemSku: this.matchingPart.sku });
        if (
          this.matchingPart.partPrice.PartPriceArray.PartPrice &&
          this.matchingPart.partPrice.PartPriceArray.PartPrice[0]
        ) {
          const partPrice = this.matchingPart.partPrice.PartPriceArray
            .PartPrice[0];
          // TODO: Maybe handle matching sku changes in an effect?
          // const price: number = parseFloat(partPrice.salePrice);
          // console.log("price type", typeof price === 'string');
          // const cost: number = parseFloat(partPrice.price);
          // console.log("cost", cost, typeof cost === 'string');
          // const revisedCost = ((price * (parseFloat(this.orderDetails.adminFeeRate) / 100)) + cost);
          // console.log("revised cost type", typeof revisedCost === 'string');
          this.formGroup.patchValue({
            cost: partPrice.price,
            price: partPrice.salePrice,
          });
        }
      }
    }
  }

  changeImage() {
    if (!this.config.edit) {
      return;
    }

    const action = {
      type: "itemRowChangeImage",
      item: this.item,
      row: this.row,
    };

    this.actions.emit(action);
  }

  convertToSeparateLineItem() {
    const action = {
      type: "convertRowToLineItem",
      item: this.item,
      row: this.row,
    };

    this.actions.emit(action);
  }

  /**
   * Selection Helpers
   */

  // Toggle selection of all matrix rows
  masterToggle() {
    return this.isAllSelected()
      ? this.clearSelection()
      : this.decorations.forEach((item) => this.decoSelection.select(item));
  }

  // Clear the selection of the matrix rows
  clearSelection() {
    this.decoSelection.clear();
  }

  isAnyRowSelected() {
    return this.decorations.some((item) => this.decoSelection.isSelected(item));
  }

  // Are all of the matrix rows selected?
  isAllSelected(type: string = "matrixRow") {
    return this.decorations.every((row) => this.decoSelection.isSelected(row));
  }

  copyRowDecorations() {
    this.clearSelection();
    this.masterToggle();
    this.copySelectedDecorations();
  }

  copySelectedDecorations() {
    this.actions.emit({
      type: "copySelectedDecorations",
      payload: {
        selection: this.decoSelection.selected,
        row: this.row,
        item: this.item,
      },
    });
    this.decoSelection.clear();
  }

  bulkAction(type) {
    const action: any = {
      type,
      payload: {
        row: this.row,
        item: this.item,
        selection: this.decoSelection.selected,
      },
    };

    this.actions.emit(action);
    this.decoSelection.clear();
  }

  handleDecoActions(event) {
    // Bubble up
    this.actions.emit(event);
  }

  /**
   * trackByDeco
   * Track decorations by decoVendorId
   * @param index
   * @param deco
   */
  trackByDeco(index, deco) {
    return deco.decoVendorId;
  }

  /**
   * syncQuantity
   * For now allocate all quantity to the first fulfillment
   * @param event
   */
  syncQuantity(event) {
    console.log("sync is happening");
    const unitQuantity = event.target.value;
    const conversionRatio = this.formGroup.get("uomConversionRatio").value;
    const quantity = unitQuantity * conversionRatio;

    // Update base quantity
    this.formGroup.patchValue({ quantity });

    // Update fulfillments quantity
    this.fulfillmentsFormArray.at(0).patchValue({ quantity });
  }

  // TODO: MAGIC Refactor to the backend
  syncOrigPriceCost() {
    const row = this.formGroup.value;
    const adjustments: any = {};
    if (this.item.lineType == "4" || this.item.lineType == "5") {
    } else {
      if (this.item.hideLine === "1" && row.price !== 0) {
        adjustments.price = row.origPrice;
        this.formGroup.patchValue(adjustments);
        alert(
          "This price cannot be modified because 'Hide from customer' is selected in the configuration."
        );
      }
    }

    if (row.origPrice != row.price) {
      adjustments.origPrice = row.price;
    }

    if (row.origCost != row.cost) {
      adjustments.origCost = row.cost;
    }

    if (Object.keys(adjustments).length > 0) {
      this.formGroup.patchValue(adjustments);
    }
  }

  changeUom(event: MatSelectChange) {
    const uomId = event.value;
    const unitQuantity = this.formGroup.get("unitQuantity").value;

    if (uomId) {
      const uomDetails = this.product.uomDetails.find(
        (child) => child.id === uomId
      );

      let conversionRatio: number = uomDetails.conversionRatio
        ? +uomDetails.conversionRatio
        : 1;

      // Override conversion ratio with calculator data
      if (this.row.calculatorData && this.row.calculatorData.area) {
        conversionRatio = this.row.calculatorData.area;
      }

      const quantity = unitQuantity * conversionRatio;

      this.formGroup.patchValue({
        uomConversionRatio: conversionRatio,
        uomId: uomDetails.id,
        quantity: quantity,
      });
    } else {
      this.formGroup.patchValue({
        uomConversionRatio: 1,
        uomId: null,
        quantity: unitQuantity,
      });
    }
  }

  copyPrice() {
    const value = this.formGroup.value;
    const action = {
      type: "UpdateItemRows",
      item: this.item,
      payload: {
        price: value.price,
        origPrice: value.price,
        priceStrategy: value.priceStrategy,
      },
    };

    this.actions.emit(action);
  }

  copyCost() {
    const value = this.formGroup.value;
    const action = {
      type: "UpdateItemRows",
      item: this.item,
      payload: {
        cost: value.cost,
        origCost: value.cost,
        costStrategy: value.costStrategy,
      },
    };

    this.actions.emit(action);
  }
}

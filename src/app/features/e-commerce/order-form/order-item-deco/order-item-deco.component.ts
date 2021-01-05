import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { IDecoVendor, ILineItem, IMatrixRow, IAddonCharge, CostStrategies, PriceStrategies } from '../interfaces';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Subject, Observable, of } from 'rxjs';
import { takeUntil, skip, debounceTime, map, distinctUntilChanged, take } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { OrderFormService } from '../order-form.service';
import { PreviewDecorationComponent } from 'app/shared/preview-decoration/preview-decoration.component';
import { MatDialog } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSelectChange } from '@angular/material/select';
import { ProductDetails, OrderDetails } from 'app/models';
import { SupplierDecorationDialogComponent } from '../../components/supplier-decoration-dialog/supplier-decoration-dialog.component';
import { OrderArtProofComponent } from '../order-art-proof/order-art-proof.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ApiService } from 'app/core/services/api.service';

export class OrderFormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}

@Component({
  selector: 'app-order-item-deco',
  templateUrl: './order-item-deco.component.html',
  styleUrls: ['./order-item-deco.component.scss']
})
export class OrderItemDecoComponent implements OnInit, OnDestroy, OnChanges {

  @Input() config: any;
  @Input() orderDetails: OrderDetails
  @Input() adminFeeEnabled: boolean;
  @Input() currencyEnabled: boolean;
  @Input() costExchangeRate: number;
  @Input() customerExchangeRate: number;
  @Input() calculateMargin
  @Input() calculateAdminFeeCost
  @Input() baseCurrency: string;
  @Input() customerCurrencyCode: string;
  @Input() vendorCurrencyCode: string;
  @Input() deco: IDecoVendor;
  @Input() item: ILineItem;
  @Input() product: ProductDetails;
  @Input() row: IMatrixRow;
  @Input() edit: boolean = true;
  @Input() selection: SelectionModel<IDecoVendor>;
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() actions: EventEmitter<any> = new EventEmitter();

  matcher = new OrderFormErrorStateMatcher();

  destroyed$ = new Subject<boolean>();
  form: FormGroup;
  decoVendors$: Observable<any[]>;
  addonSelection: SelectionModel<Partial<IAddonCharge>>;
  sourceLocation: any;
  sourceDecoration: any;
  artProofs$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private orderModel: OrderFormService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private api: ApiService,
  ) {
  }

  ngOnInit() {
    console.log("Deco", this.deco);
    this.form = this.createForm();
    this.addonSelection = new SelectionModel<Partial<IAddonCharge>>(true, []);
    this.artProofs$ = this.orderModel.artProofs$.pipe(
      map((proofs) => proofs.data.filter((proof) => {
        return proof.product_id == this.item.productId
          && this.deco.decorationDetails.some((details) => details.decoDesignVariation.decoImprintVariation == proof.artwork_variation_id)
      }))
    );
    this.decoVendors$ = this.orderModel.decoVendorsByType$.pipe(
      map((decoVendorsByType) => {
        if (decoVendorsByType[this.deco.decoType]) {
          return decoVendorsByType[this.deco.decoType];
        } else {
          return [];
        }
      })
    );
  }

  createProof() {

    this.orderModel.order$.pipe(
      take(1)
    ).subscribe((order) => {

      const dialog = this.dialog.open(OrderArtProofComponent, {
        data: {
          deco: this.deco,
          item: this.item,
          model: {
            order_id: order.id,
            account_id: order.accountId,
            artwork_variation_id: this.deco.decorationDetails[0].decoDesignVariation.decoImprintVariation,
            product_id: this.item.productId,
            artwork_id: this.deco.designId,
          }
        }
      });
      dialog.afterClosed().subscribe((res) => {
        const action = {
          type: 'LoadArtProofs',
        };
        this.actions.emit(action);
      });
    });

  }

  editProof(proof) {
    this.orderModel.order$.pipe(
      take(1)
    ).subscribe((order) => {

      const dialog = this.dialog.open(OrderArtProofComponent, {
        data: {
          deco: this.deco,
          item: this.item,
          model: proof,
        }
      });

      dialog.afterClosed().subscribe((res) => {
        const action = {
          type: 'LoadArtProofs',
        };
        this.actions.emit(action);
      });

    });
  }

  deleteProof(proof) {
    const confirm = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });
    confirm.componentInstance.confirmMessage = 'Are you sure you would like to delete this proof?';
    confirm.componentInstance.confirmButtonText = 'Yes';

    confirm.afterClosed().subscribe((proceed) => {
      if (proceed) {
        this.actions.emit({
          type: 'DeleteArtProof',
          payload: { id: proof.id }
        });
      }
    });
  }

  get rollDecoCharges() {
    return this.item.rollDecoChargesToProduct && +this.item.rollDecoChargesToProduct;
  }

  /**
   * Toggle Cost Strategy
   * With only two options use a simple toggle
   */
  toggleCostStrategy() {
    const field = this.form.get('costStrategy');
    const newStrategy = (field.value === CostStrategies.MANUAL)
      ? CostStrategies.PRICE_BREAK
      : CostStrategies.MANUAL;

    field.setValue(newStrategy);
  }

  setCostStrategyToManual(event): void {
    if (event.keyCode === 'Enter' || event.keyCode === 'Tab') {
      return;
    }
    const field = this.form.get('costStrategy');
    field.setValue(CostStrategies.MANUAL);
  }

  togglePriceStrategy() {
    const field = this.form.get('priceStrategy');
    const newStrategy = (field.value === PriceStrategies.MANUAL)
      ? PriceStrategies.PRICE_BREAK
      : PriceStrategies.MANUAL;

    field.setValue(newStrategy);
  }

  setPriceStrategyToManual(event) {
    if (event.keyCode === 'Enter' || event.keyCode === 'Tab') {
      return;
    }
    this.form.patchValue({
      priceStrategy: PriceStrategies.MANUAL,
    });
  }


  compareVendor(vendor: any, value: any): boolean {
    return vendor && value ? vendor.id === value : vendor === value;
  }

  compareSupplierLocation(location: any, value: any): boolean {
    return location && value ? location.locationId === value : location === value;
  }
  compareSupplierDecoration(decoration: any, value: any): boolean {
    return decoration && value ? decoration.decorationId === value : decoration === value;
  }

  selectVendor($event: MatSelectChange) {
    const vendor: { id: string, vendor: string } = $event.value;
    if (vendor.id && vendor.vendor) {
      this.form.patchValue({
        vendorId: vendor.id,
        vendorName: vendor.vendor
      });
    } else {
      this.form.patchValue({
        vendorId: null,
        vendorName: null
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.form) {
      if (changes.deco && changes.deco.currentValue) {
        const newValue = { ...changes.deco.currentValue };
        newValue.vendorSupplierDecorated = +newValue.vendorSupplierDecorated, // Cast to integer
          this.form.patchValue(newValue, { onlySelf: true, emitEvent: false });
      }
    }
  }

  changeVariation() {
    this.actions.emit({
      type: 'changeDecorationVariation',
      decoration: this.deco,
      item: this.item,
      row: this.row
    });
  }

  private patchFormWithChanges(changes: SimpleChanges) {
    const formValue = this.form.value;
    const patch = {};
    if (!this.form.dirty) {
      for (const prop in formValue) {
        if (formValue[prop] !== changes.row.currentValue[prop]) {
          patch[prop] = changes.row.currentValue[prop];
        }
      }
    }
    this.form.patchValue(patch, { onlySelf: true, emitEvent: false });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  get decorationThumbnail() {
    return (
      this.deco
      && this.deco.decorationDetails && this.deco.decorationDetails[0]
      && this.deco.decorationDetails[0].decoDesignVariation
      && this.deco.decorationDetails[0].decoDesignVariation.itemImageThumbnail
      && this.deco.decorationDetails[0].decoDesignVariation.itemImageThumbnail[0]
    ) || 'assets/images/ecommerce/product-image-placeholder.png';
  }


  copyToClipboard() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = JSON.stringify(this.deco);
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  createForm() {

    this.actions.emit({
      type: 'loadDecoVendorsByType',
      decoType: this.deco.decoType
    });

    let restrictEditPrice = false;
    if (this.config
      && this.config.permissions
      && this.config.permissions.restrict_order_sales_pricing
      && this.config.permissions.restrict_order_sales_pricing.data) {
      restrictEditPrice = true;
    }

    this.form = this.fb.group({
      id: [],
      order: [0],
      quantity: [{ value: this.deco.quantity || 0, disabled: true }],
      decoLocation: [this.deco.decoLocation, Validators.required],
      sourceLocationId: [this.deco.sourceLocationId],
      sourceDecorationId: [this.deco.sourceDecorationId],
      decorationNotes: [this.deco.decorationNotes],
      priceConverted: [this.displayPriceConverted()],
      costConverted: [this.displayCostConverted()],
      decoChargeId: [this.deco.decoChargeId],
      decoChargeName: [this.deco.decoChargeName],
      vendorId: [this.deco.vendorId],
      vendorNo: [this.deco.vendorNo],
      vendorName: [this.deco.vendorName],
      vendorSupplierDecorated: [+this.deco.vendorSupplierDecorated],
      customerPrice: [{
        value: this.deco.customerPrice || 0,
        disabled: restrictEditPrice
      }],
      adminFee: [{
        value: this.orderDetails ? this.orderDetails.adminFeeRate : "",
        disabled: true
      }],
      unitCostIncludingAdminFee: [{
        value: this.deco.unitCostIncludingAdminFee || 0,
        disabled: true
      }],
      itemCost: [this.deco.itemCost || 0],
      costStrategy: [this.deco.costStrategy],
      priceStrategy: [this.deco.priceStrategy],
      isGeneralNote: [this.deco.isGeneralNote],
    });

    // Initial state 
    if (this.product && this.product.SupplierLocationArray && this.product.SupplierLocationArray.Location) {

      const location = this.product.SupplierLocationArray.Location.find((l) => l.locationId === this.deco.sourceLocationId);
      if (location) {
        this.sourceLocation = location;
        const decoration = location.DecorationArray.Decoration.find((d) => d.decorationId === this.deco.sourceDecorationId);
        if (decoration) {
          this.sourceDecoration = decoration;
        }
        this.cd.markForCheck();
      }
    }

    this.form.get('vendorSupplierDecorated').valueChanges.pipe(
      takeUntil(this.destroyed$),
      distinctUntilChanged(),
    ).subscribe((val) => {
      if (!val) {
        this.form.patchValue({
          sourceLocationId: null,
          sourceDecorationId: null,
        });
        this.sourceDecoration = undefined;
        this.sourceLocation = undefined;
      } else {

        this.form.patchValue({
          vendorId: null,
          vendorName: null,
        });

        if (this.product.SupplierLocationArray && this.product.SupplierLocationArray.Location && this.sourceLocation) {
          this.sourceLocation = this.product.SupplierLocationArray.Location.find((location) => location.defaultLocation == '1');
          this.sourceDecoration = this.sourceLocation.DecorationArray.Decoration.find((decoration) => decoration.defaultDecoration == '1');
          this.form.patchValue({
            sourceLocationId: this.sourceLocation.locationId,
            sourceDecorationId: this.sourceDecoration.decorationId,
          });
          this.cd.markForCheck();
        }
      }
    });

    this.form.get('sourceDecorationId').valueChanges.pipe(
      takeUntil(this.destroyed$),
      distinctUntilChanged(),
    ).subscribe((value) => {
      if (this.sourceLocation) {
        const decoration = this.sourceLocation.DecorationArray.Decoration.find((d) => d.decorationId === value);
        this.sourceDecoration = decoration;
      }
    });

    this.form.get('sourceLocationId').valueChanges.pipe(
      takeUntil(this.destroyed$),
      distinctUntilChanged(),
    ).subscribe((value) => {
      if (this.product && this.product.SupplierLocationArray && this.product.SupplierLocationArray.Location) {
        const location = this.product.SupplierLocationArray.Location.find((l) => l.locationId === value);
        this.sourceLocation = location;
      }
    });

    this.form.valueChanges.pipe(
      takeUntil(this.destroyed$),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe((value) => {
      const payload = {
        ...value,
        vendorSupplierDecorated: value.vendorSupplierDecorated ? '1' : '0'
      };
      this.cd.markForCheck();
      this.actions.emit({
        type: 'decoChanged',
        data: payload,
        deco: this.deco,
        item: this.item,
        valid: this.form.valid,
        sourceLocation: this.sourceLocation,
        sourceDecoration: this.sourceDecoration,
      });
    });
    this.runFormSubscriptions();
    return this.form;
  }

  subscribeToPriceConverted() {
    this.form.controls.priceConverted.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((priceConverted: string) => {
        console.log("changing");
        this.form.controls.customerPrice.patchValue(this.convertPriceToOrginalRate(priceConverted));
      });
  }

  subscribeToCostConverted() {
    this.form.controls.costConverted.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe((costConverted: string) => {
        console.log("cost changing");
        this.form.controls.itemCost.patchValue(this.convertCostToOriginalRate(costConverted));
      });
  }

  convertPriceToOrginalRate(convertedPrice: string): string {
    return (parseFloat(convertedPrice) / this.customerExchangeRate).toString();
  }

  convertCostToOriginalRate(convertedCost: string): string {
    return (parseFloat(convertedCost) / this.costExchangeRate).toString();
  }

  runFormSubscriptions() {
    this.subscribeToPriceConverted();
    this.subscribeToCostConverted();
  }

  deleteDecoration() {
    const action = {
      type: 'deleteDecoration',
      payload: {
        decoVendorRecordId: this.deco.decoVendorRecordId,
        item: this.item
      }
    };
    this.actions.emit(action);
  }

  previewDecoration() {
    const dialogRef = this.dialog.open(PreviewDecorationComponent, {});
    dialogRef.componentInstance.deco = this.deco;
  }

  openChargesDialog() {
    const action = {
      type: 'openDecoChargesDialog',
      payload: {
        vendor: this.deco,
        item: this.item,
        product: this.product
      }
    };
    this.actions.emit(action);
  }


  selectSupplierDecoration(event: MatSelectChange) {
    const decoration = event.value;
    const data = {
      sourceDecorationId: decoration.decorationId
    };
    this.sourceDecoration = decoration;

    // this.useImprintPricing();
    this.cd.markForCheck();

    this.form.patchValue(data);
  }
  selectSupplierLocation(event: MatSelectChange) {
    const value = event.value;
    const location = this.product.SupplierLocationArray.Location.find((l) => l.locationId === value.locationId);
    this.sourceLocation = location;
    this.cd.markForCheck();

    const data = {
      sourceLocationId: location.locationId,
      decoLocation: location.locationName
    };

    this.form.patchValue(data);
  }

  handleAddonChange(event) {

    event.deco = this.deco;
    event.item = this.item;

    this.actions.emit({
      type: 'decoAddonChargeChanged',
      event: event
    });
  }

  addDecoAddonCharge() {
    const action = {
      type: 'addDecoAddonCharge',
      payload: {
        decoVendorRecordId: this.deco.decoVendorRecordId,
        item: this.item
      }
    };
    this.actions.emit(action);
  }

  bulkAction(type) {
    switch (type) {
      case 'copySelection': {

      }
      case 'deleteSelectedDecorations': {

      }
    }
  }

  bulkDeleteCharges() {
    const ids = this.addonSelection.selected.map((charge) => charge.addonChargeUpdateId);
    this.actions.emit({
      type: 'deleteAddonCharge',
      payload: {
        type: 'item',
        addonChargeUpdateIds: ids,
        lineItemUpdateId: this.item.lineItemUpdateId,
      }
    });
  }

  copyCharges() {
    console.log('Copy charges');
  }

  handleAddonActions(event) {
    this.actions.emit(event);
  }

  editVariation() {
    const action: any = {
      type: 'changeDecorationVariation',
      payload: {
        deco: this.deco,
        item: this.item,
        row: this.row
      }
    };
    this.actions.emit(action);
  }

  useImprintPricing() {
    const action: any = {
      type: 'useImprintPricing',
      payload: {
        item: this.item,
        imprintPriceKey: this.sourceDecoration.imprintPriceKey,
        location: this.sourceLocation,
        decoration: this.sourceDecoration,
      }
    };
    this.actions.emit(action);
  }

  openDialogWithTemplateRef(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef);
  }

  openDecorationDialog() {
    const dialogRef = this.dialog.open(SupplierDecorationDialogComponent, {
      width: '80vw',
      height: '80vh',
    });
    dialogRef.componentInstance.product = this.product;
    dialogRef.componentInstance.location = this.sourceLocation;
    dialogRef.componentInstance.decoration = this.sourceDecoration;
  }

  /**
     * Selection Helpers
     */

  // Toggle selection of all matrix rows
  masterToggle() {
    return this.isAllSelected() ?
      this.clearSelection() :
      this.deco.addonCharges.forEach((charge) => this.addonSelection.select(charge));
  }

  // Clear the selection of the matrix rows
  clearSelection() {
    this.addonSelection.clear();
  }

  isAnyRowSelected() {
    return this.deco.addonCharges.some((charge) => this.addonSelection.isSelected(charge));
  }

  // Are all of the matrix rows selected?
  isAllSelected() {
    return this.deco.addonCharges.every((charge) => this.addonSelection.isSelected(charge));
  }

  displayCostConverted() {
    if (!this.deco.itemCost || !this.costExchangeRate) return 0;
    return (this.costExchangeRate * parseFloat(this.deco.itemCost)).toFixed(2);
  }

  displayPriceConverted() {
    if (!this.deco.customerPrice || !this.customerExchangeRate) return 0;
    return (this.customerExchangeRate * parseFloat(this.deco.customerPrice)).toFixed(2);
  }

  customerCurrencyMatches() {
    return this.baseCurrency === this.customerCurrencyCode;
  }

  vendorCurrencyMatches() {
    return this.baseCurrency === this.vendorCurrencyCode;
  }


}

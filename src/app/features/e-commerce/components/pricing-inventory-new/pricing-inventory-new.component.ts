import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { find, each, map, remove, sum, sumBy, values } from 'lodash';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatrixRow } from '../../../../models/matrix-row';
import { MessageService } from '../../../../core/services/message.service';
import { numberWithCommas, fobCity, numValues } from '../../utils';
import { fx2N } from '../../../../utils/utils';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ApiService } from 'app/core/services/api.service';
import { Account, PriceBreak } from 'app/models';
import { GlobalConfigService } from 'app/core/services/global.service';
import { get } from 'lodash';
import { SupplierDecorationDialogComponent } from '../supplier-decoration-dialog/supplier-decoration-dialog.component';

@Component({
  selector: 'app-pricing-inventory-new',
  templateUrl: './pricing-inventory-new.component.html',
  styleUrls: ['./pricing-inventory-new.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PricingInventoryNewComponent implements OnInit{
  product: any = {};
  lineItem: any = {};
  priceType: string = "Blank";
  priceTypes: string[] = [];

  colors = [];
  sizes = [];
  displayedColumns = [];
  priceList = [];
  mList = [];
  locationList = [];
  suppliersList = [];

  modifiedPrices = {
    locked: false,
    priceBreaks: []
  };

  mForm: FormGroup;
  sColor: any = {};
  margin = '';
  prevInput = 0;
  _totalCount = 0;
  _totalAmount = '0';
  matrixRows = [];
  minQty = 1;
  hRow = 0;
  editMode = false;
  priceForm: FormGroup;
  lockedFields: any = {};
  activeCell = null;
  loading1 = false;
  _anteraInventory: any = {};
  loading2 = false;
  _supplierInventory: any = {};
  liveInventory = true;
  sysconfigOrderFormCostDecimalUpto: string;
  decimalUpto: any;
  // added this to check permissions
  orderId: any;

  vendorProductNotes = '';
  eqp = false;
  defaultProductMargin: any;
  conversionRatio: number = 1;
  uomId: any;
  abbreviation: any;
  restrictEditPrice: boolean;

  relatedVendors: any[] = [];
  relatedProducts: any[] = [];
  alternateProductAvail = false;

  loading = false;
  alternateMatch = false;

  deletedRows = [];

  get totalCount() {
    return numberWithCommas(this._totalCount);
  }

  get totalAmount() {
    return numberWithCommas(this._totalAmount);
  }

  openDecorationDialog() {
    const dialogRef = this.dialog.open(SupplierDecorationDialogComponent, {
      width: '80vw',
      height: '80vh',
    });
    dialogRef.componentInstance.product = this.product;
  }

  overrideMargin() {
    if (this.margin) {
      this.margin = null;
    } else {
      if (this.defaultProductMargin) {
        this.margin = this.defaultProductMargin;
      }
    }
    this.checkMargin();
  }

  supplierInventory(size, fobId) {
    if (!this._supplierInventory[this.sColor.color.toLowerCase()] ||
      !this._supplierInventory[this.sColor.color.toLowerCase()][size.toLowerCase()]) {
      return 0;
    } else {
      return this._supplierInventory[this.sColor.color.toLowerCase()][size.toLowerCase()][fobId] || 0;
    }
  }

  anteraInventory(size, fobId) {
    let inventory = get(this._anteraInventory, this.sColor.color + '.' + size + '.' + fobId + '.inventory', 0);
    let reserved = get(this._anteraInventory, this.sColor.color + '.' + size + '.' + fobId + '.reserved', 0);
    return inventory;
    //return inventory + ', ' + reserved;
  }

  constructor(
    public dialogRef: MatDialogRef<PricingInventoryNewComponent>,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private config: GlobalConfigService,
    private dialog: MatDialog,
    private msg: MessageService,
    private api: ApiService,
  ) {
      this.priceForm = this.fb.group({});
  }

  ngOnInit() {
    console.log('data to work with.... ', this.data);
    this.lineItem = this.data.lineItem;
    this.orderId = this.data.oId;

    if (this.data.order.advanceStatusId !== 3) {
      this.alternateProductAvail = true;
    }
    this.loadProduct(this.data.lineItem.productId);
  }

  loadProduct(productId) {
    this.loading = true;
    forkJoin([
      this.api.getProductDetailsCurrency(productId).pipe(catchError(e => of('oops'))),
      this.api.getAnteraFob().pipe(catchError(e => of('oops'))),
      this.api.getUniversalFob(productId).pipe(catchError(e => of('oops'))),
      this.api.getAdvanceSystemConfigAll({ module: 'Orders' }).pipe(catchError(e => of('oops')))
    ]).subscribe(([product, anteraFob, universalFob, advanceSystemConfigAll]: any) => {
      if (!product.productId) {
        this.msg.show('Error fetching product information', 'error');
        this.loading = false;
        return ;
      }
      this.product = product;

      if(this.data.order && this.data.order.pricingMethodId > 1){
        this.replaceProductPartArray(product);
      }
      if (universalFob.length === 0) {
        this.data.suppliers = [
          {
            fobId: 0,
            fobCity: 'Main',
            fobState: ''
          }
        ];
      } else {
        this.data.suppliers = universalFob;
      }
      this.decimalUpto = 4;
      this.data.warehouses = anteraFob;
      this.data.productsMargin = advanceSystemConfigAll && advanceSystemConfigAll.settings && advanceSystemConfigAll.settings.productsMargin || 40;
      this.data.config = advanceSystemConfigAll;
      this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.decimalUpto;

      // Clone instead of pass by reference otherwise it will come through frozen
      const currentBreaks = this.lineItem.modifiedPriceBreaks && this.lineItem.modifiedPriceBreaks.priceBreaks || []
      this.modifiedPrices = {
        locked: this.lineItem.modifiedPriceBreaks.locked || false,
        priceBreaks: [...currentBreaks] || []
      };
      if (this.lineItem.priceType && this.lineItem.priceType != "") {
        this.priceType = this.lineItem.priceType;
      }

      if (this.lineItem.uomId && this.lineItem.uomId != "" && this.lineItem.uomId > 0) {
        this.uomId = this.lineItem.uomId;
        const uomDetails = this.product.uomDetails.find(child => child.id === this.uomId);
      }
      this.conversionRatio = (this.lineItem.uomConversionRatio) ? this.lineItem.uomConversionRatio : 1;

      this.priceTypes = Object.keys(this.product.ProductImprintPartArray.ProductImprintPart);

      this.matrixRows = this.lineItem.matrixRows.map(row => new MatrixRow(row));
      this.defaultProductMargin = this.data.productsMargin;
      if (this.lineItem.productMargin) {
        this.margin = this.lineItem.productMargin;
      }

      this.getColorArray();
      this.sColor = find(this.colors, { color: this.data.color }) || this.colors[0];
      this.selectColor(this.sColor);

      this.priceForm = this.fb.group({});
      this.getUniversalInventory();
      this.getAnteraInventory();
      this.getVendorDetails(product.vendorId);

      this.restrictEditPrice = get(this.data, 'configState.permissions.restrict_order_sales_pricing.data', false);
      this.relatedVendors = [];
      this.relatedProducts = [];
      this.relatedVendors = this.product.RelatedProductArray && this.product.RelatedProductArray.RelatedProduct ? this.product.RelatedProductArray.RelatedProduct.filter((p) => p.type == 1) : [];
      this.relatedProducts = this.product.RelatedProductArray && this.product.RelatedProductArray.RelatedProduct ? this.product.RelatedProductArray.RelatedProduct.filter((p) => p.type == 2) : [];
      this.loading = false;
    });
  }


  private replaceProductPartArray(product: any) {
    if(product.ProductPartArray && product.ProductPartArray.ProductPart !== undefined){
      const productPartLenght = product.ProductPartArray.ProductPart.length;
      const addOnPricingId = this.data.order.pricingMethodId;
      const addOn = product.addonPricing[addOnPricingId];
      if (addOn && addOn.ProductPart){
        product.ProductPartArray.ProductPart.splice(0, productPartLenght, ...product.addonPricing[addOnPricingId].ProductPart);
      }
    }
  }

  selectColor(color) {
    if (this.editMode) {
      this.msg.show('Please save prices first', 'info');
      return;
    }

    this.sColor = color;
    this.getUniversalInventory(color.color);

    const allSizes = map(
      this.sColor.sizeArr,
      sizeObj => sizeObj.size
    );
    allSizes.forEach((size) => {
        if(this.sizes.indexOf(size) < 0){
            this.sizes.push(size);
        }
    });
    console.log(allSizes);
    console.log(this.sizes);
    this.displayedColumns = [
      'label1',
      'label2',
      ...this.sizes
    ];


    this.populatePriceList();

    this.mList = [];
    const mctlDef = {};
    each(this.sColor.msArr, (ms, msIndex) => {
      const row = {
        'label1': ''//'Row ' + (msIndex + 1)
      };
      each(ms, sizeObj => {
        const cell = {
          name: `q-${msIndex}-${sizeObj.sku}`,
          qtyObj: sizeObj.quantity,
          sku: sizeObj.sku,
          msIndex: msIndex
        };

        mctlDef[cell.name] = sizeObj.quantity;

        row[sizeObj.size] = cell;
      });
      this.mList.push(row);
    });
    this.mForm = this.fb.group(mctlDef);

    this.locationList = [];
    each(this.data.warehouses, (location) => {
      if (location.customerOwned && location.accountId !== this.data.order.accountId) {
        return;
      }
      const row = {
        'label1': fobCity(location)
      };

      each(this.sColor.sizeArr, sizeObj => {
        const cell = {
          name: `q-${location.fobId}-${sizeObj.size}`,
          qtyObj: sizeObj.wQtys,
          fobId: location.fobId
        };
        row[sizeObj.size] = cell;
      });
      this.locationList.push(row);
    });

    this.suppliersList = [];
    each(this.data.suppliers, (location) => {
      const row = {
        'label1': fobCity(location)
      };
      each(this.sColor.sizeArr, sizeObj => {
        const cell = {
          name: `q-${location.fobId}-${sizeObj.size}`,
          qtyObj: sizeObj.sQtys,
          fobId: location.fobId
        };
        row[sizeObj.size] = cell;
      });

      this.suppliersList.push(row);
    });
  }

  addToOrder(replaceAnyway = false) {
    if (!this.sColor.color) {
      this.msg.show('Please select a color', 'error');
      return;
    }
    if (this.priceType == "Blank") {
      this.lineItem.priceType = "";
    } else {
      this.lineItem.priceType = this.priceType;
    }

    if (this.lineItem.productId != this.product.id) {
      if (!replaceAnyway) {
        this.alternateMatch = true;
        this.lineItem.matrixRows.forEach(m => {
          const pv = this.product.ProductPartArray.ProductPart.find((v) => v.sku == m.itemSku);
          if ((!pv || !pv.sku) && this.alternateMatch) {
            this.alternateMatch = false;
            this.openReplaceConfirmDialog();
            return;
          }
        }, this);
        if (!this.alternateMatch) {
          this.loading = false;
          return ;
        }
        this.alternateMatch = false;
      }
      this.lineItem.id = this.product.id;
      this.lineItem.productId = this.product.id;
      this.lineItem.inhouseId = this.product.inhouseId;
      this.lineItem.itemCode = this.product.itemCode;
      this.lineItem.itemNo = this.product.productId;
      this.lineItem.productName = this.product.productName;
      this.lineItem.productPOType = this.product.poType;
      this.lineItem.vendorId = this.product.vendorId;
      this.lineItem.vendorName = this.product.vendorName;
      this.lineItem.quoteCustomImage = [];
      if (this.product.MediaContent && this.product.MediaContent[0] && this.product.MediaContent[0].url) {
        this.lineItem.quoteCustomImage = [this.product.MediaContent[0].url];
      }
      this.matrixRows.forEach((r, index) => {
        const color = this.colors.find(c => c.color.toLowerCase() == r.color.toLowerCase());
        r.imageUrl = '';
        if (color) {
          r.imageUrl = color.imageUrl;
          r.color = color.color;
        } else {
          this.deletedRows.push(r.matrixUpdateId);
          //this.matrixRows.splice(index, 1);
          r.quantity = 0;
          r.unitQuantity = 0;
        }
      }, this);
    }

    const mrows = this.matrixRows.filter(row => row.size !== '');
    let c = 0;

    let swId = this.suppliersList[0].fobId;

    let err = false;

    each(this.colors, color => {

      each(color.msArr, s => {
        each(s, sizeObj => {
          let price = this.getPrice(sizeObj.sku, this.hRow);

          let qty = Number(sizeObj.quantity);
          if (Number.isNaN(qty) || qty <= 0) {
            return;
          }

          const unitQuantity = qty;
          qty = qty * this.conversionRatio;

          let row = undefined;
          row = find(this.matrixRows, {
            itemSku: sizeObj.sku
          });

          if (!row) {
            if (this.product.orderMinPricebreak && qty < sizeObj.priceBreaks[0].minQuantity) {
              this.msg.show(color.color + ', ' + sizeObj.size + ' - Please provide a quantity more than ' + sizeObj.priceBreaks[0].minQuantity, 'error');
              err = true;
              return '';
            }
            let fulfillments = [{
              custInventoryReceived: "0",
              custInventoryReceivedQty: "0",
              id: "",
              incomingWarehouse: "",
              incomingWarehouseName: "",
              inventoryReceived: "0",
              inventoryReceivedQty: "0",
              matrixUpdateId: "",
              quantity: qty,
              sourceWarehouse: swId,
              status: "",
              type: "DropShip",
            }];
            row = new MatrixRow({
              quantity: qty,
              unitQuantity: unitQuantity,
              uomId: this.uomId,
              uomAbbreviation: this.abbreviation,
              uomConversionRatio: this.conversionRatio,
              size: sizeObj.size,
              color: color.color,
              imageUrl: color.imageUrl,
              price: price.salePrice,
              totalPrice: price.salePrice * qty,
              origPrice: price.salePrice,
              cost: price.price,
              origCost: price.price,
              totalCost: price.price * qty,
              profit: (price.salePrice - price.price) * qty,
              productMargin: price.margin,
              uniqueLineItemId: this.lineItem.lineItemupdateId,
              itemSku: sizeObj.sku,
              poType: 'DropShip',
              priceStrategy: this.data.config.settings.defaultProductPriceStrategy || 'MANUAL',
              costStrategy: this.data.config.settings.defaultProductCostStrategy || 'MANUAL',
              fulfillments: fulfillments
            });
            mrows.push(row);
          } else {
            let fulfillments = [];
            if (row.fulfillments && Number(row.fulfillments[0].quantity) + Number(qty) > 0) {
              if (this.product.orderMinPricebreak && qty < sizeObj.priceBreaks[0].minQuantity) {
                this.msg.show(color.color + ', ' + sizeObj.size + ' - Please provide a quantity more than ' + sizeObj.priceBreaks[0].minQuantity, 'error');
                err = true;
                return '';
              }
              // Shallow clone
              row.fulfillments[0] = { ...row.fulfillments[0] };
              row.fulfillments[0].quantity = Number(row.fulfillments[0].quantity) + Number(qty);
              fulfillments = row.fulfillments;
            } else {
              if (this.product.orderMinPricebreak && qty < sizeObj.priceBreaks[0].minQuantity) {
                this.msg.show(color.color + ', ' + sizeObj.size + ' - Please provide a quantity more than ' + sizeObj.priceBreaks[0].minQuantity, 'error');
                err = true;
                return '';
              }
              fulfillments = [{
                custInventoryReceived: "0",
                custInventoryReceivedQty: "0",
                id: "",
                incomingWarehouse: "",
                incomingWarehouseName: "",
                inventoryReceived: "0",
                inventoryReceivedQty: "0",
                matrixUpdateId: "",
                quantity: qty,
                sourceWarehouse: swId,
                status: "",
                type: "DropShip",
              }];
            }
            row.setData({
              ...row,
              quantity: Number(row.quantity).valueOf() + Number(qty).valueOf(),
              unitQuantity: Number(row.unitQuantity).valueOf() + unitQuantity,
              uomId: this.uomId,
              uomAbbreviation: this.abbreviation,
              uomConversionRatio: this.conversionRatio,
              size: sizeObj.size,
              color: color.color,
              imageUrl: color.imageUrl,
              price: price.salePrice,
              totalPrice: price.salePrice * (Number(row.quantity).valueOf() + Number(qty).valueOf()),
              origPrice: price.salePrice,
              cost: price.price,
              origCost: price.price,
              totalCost: price.price * (Number(row.quantity).valueOf() + Number(qty).valueOf()),
              profit: (price.salePrice - price.price) * (Number(row.quantity).valueOf() + Number(qty).valueOf()),
              productMargin: price.margin,
              fulfillments: fulfillments
            });
          }
        });
      });
    });
    if (mrows.length <= this.deletedRows.length) {
      this.msg.show('Please select a variation!', 'error');
      return ;
    } else if (err) {
      return ;
    }

    this.dialogRef.close({
      action: 'save',
      matrixRows: mrows,
      margin: this.margin,
      priceType: this.priceType,
      modifiedPriceBreaks: this.modifiedPrices,
      uomId: this.uomId,
      uomConversionRatio: this.conversionRatio,
      deletedRows: this.deletedRows,
    });
  }

  checkMargin(ev?) {
    let n;
    if (ev) {
      if (ev.target.value) {
        n = Number(ev.target.value);
        if (isNaN(n)) {
          this.margin = null;
        } else {
          this.margin = n.toFixed(2);
        }
      }
      ev.target.blur();
    }

    if (!this.editMode) {
      each(this.modifiedPrices.priceBreaks, (mpb) => {
        if (!mpb.locked) {
          // Shallow clone price break for immutable structures
          mpb = { ...mpb };
          mpb.margin = parseFloat(this.margin).toFixed(2);
          if (mpb.margin != 100) {
            mpb.salePrice = +Number(parseFloat(mpb.price) * 100 / (100 - mpb.margin)).toFixed(this.countDecimals(mpb.price));
          }
        }
      });

      this.populatePriceList();
    }
  }

  updateQuantity(cell, ev) {
    const q = Number(ev.target.value);
    if (Number.isNaN(q) || q < 0) {
      this.msg.show('Please enter valid number. It should be non-negative value.', 'error');
      return;
    }

    cell.qtyObj = q;
    let colorObj = find(this.colors, { color: this.sColor.color });
    if (colorObj) {
      let sizeObj = find(colorObj.msArr[cell.msIndex], { sku: cell.sku });
      if (sizeObj) {
        sizeObj.quantity = cell.qtyObj;
      } else {
        console.log('Strange, item sku ' + cell.sku + ' not found!');
      }
    } else {
      console.log('Strange, selected color not found');
    }

    this.calc_totalCount();
    this.calc_totalAmount();

    ev.target.blur();
  }

  adjustFromPrice(row, col, ev) {
    const price = Number(parseFloat(this.priceForm.value[`${col}-${row}-price`]).toFixed(this.decimalUpto));
    const cost = Number(parseFloat(this.priceForm.value[`${col}-${row}-cost`]).toFixed(this.decimalUpto));
    let profit = price - cost;
    let margin = 0;

    if (price === 0) {
      margin = undefined;
    } else if (price > 0) {
      if (price === cost) {
        margin = 0;
      } else {
        margin = +Number(fx2N(profit * 100 / price).toFixed(2));
      }
    } else {
      profit = 0;
      margin = 0;
    }

    this.priceForm.patchValue({
      [`${col}-${row}-price`]: price,
      [`${col}-${row}-cost`]: cost,
      [`${col}-${row}-margin`]: margin
    });

    ev.target.blur();
  }

  adjustFromCostOrMargin(row, col, ev, updateMargin = true) {
    let price = Number(parseFloat(this.priceForm.value[`${col}-${row}-price`]).toFixed(this.decimalUpto));
    const cost = Number(parseFloat(this.priceForm.value[`${col}-${row}-cost`]).toFixed(this.decimalUpto));
    let margin = this.priceForm.value[`${col}-${row}-margin`];

    if (margin != null && margin != 100) {
      price = +Number((cost * 100 / (100 - margin)).toFixed(this.countDecimals(cost)));
    }
    const profit = price - cost;

    if (price < 0) {
      return;
    }

    if (price === 0) {
      margin = undefined;
    } else if (price === cost) {
      margin = 0;
    } else if (updateMargin) {
      margin = +Number(fx2N(profit * 100 / price).toFixed(2));
    }

    this.priceForm.patchValue({
      [`${col}-${row}-price`]: price,
      [`${col}-${row}-cost`]: cost,
      [`${col}-${row}-margin`]: margin
    });

    ev.target.blur();
  }

  editPrices() {
    this.editMode = true;
    this.createPriceForm();
  }

  savePrices() {
    this.editMode = false;
    each(this.sColor.sizeArr, sizeObj => {
      each(sizeObj.priceBreaks, (pb, i) => {
        const field = `${sizeObj.size}-${i}`;
        let price = this.priceForm.value[`${field}-price`];
        let cost = this.priceForm.value[`${field}-cost`];
        const margin = this.priceForm.value[`${field}-margin`];
        if (price === undefined) {
          return;
        }
        price = parseFloat(price).toFixed(this.decimalUpto);
        cost = parseFloat(cost).toFixed(this.decimalUpto);

        const mpb = find(this.modifiedPrices.priceBreaks, { sku: sizeObj.sku, i });

        remove(this.modifiedPrices.priceBreaks, { sku: sizeObj.sku, i });

        if ((mpb && mpb.locked) ||
          cost !== (pb.price) ||
          margin !== (this.margin)
        ) {
          this.modifiedPrices.priceBreaks = [
            ...this.modifiedPrices.priceBreaks,
            {
              salePrice: price,
              price: cost,
              margin: margin,
              locked: mpb && mpb.locked,
              sku: sizeObj.sku,
              i
            }
          ];
        }
      });
    });

    this.populatePriceList();
    this.calc_totalAmount();
  }

  applyToAllSizes() {
    const { sku, i, locked } = this.activeCell;
    const sizeObj = find(this.sColor.sizeArr, { sku });
    const field = `${sizeObj.size}-${i}`;
    const salePrice = parseFloat(this.priceForm.value[`${field}-price`]);
    const price = parseFloat(this.priceForm.value[`${field}-cost`]);
    const margin = parseFloat(this.priceForm.value[`${field}-margin`]);

    const sizeList = ['XS', 'S', 'M', 'L', 'XL'];

    each(this.sColor.sizeArr, sizeObj1 => {
      if (sizeList.indexOf(sizeObj1.size) < 0) {
        return;
      }

      const mpb = find(this.modifiedPrices.priceBreaks, { sku: sizeObj1.sku, i });
      remove(this.modifiedPrices.priceBreaks, { sku: sizeObj1.sku, i });

      this.modifiedPrices.priceBreaks.push({
        salePrice,
        price,
        margin,
        locked: mpb && mpb.locked,
        sku: sizeObj1.sku,
        i
      });
    });

    this.populatePriceForm();
  }

  applyToAllColors() {
    const { sku, i, locked } = this.activeCell;
    const sizeObj = find(this.sColor.sizeArr, { sku });
    const field = `${sizeObj.size}-${i}`;
    const salePrice = parseFloat(this.priceForm.value[`${field}-price`]);
    const price = parseFloat(this.priceForm.value[`${field}-cost`]);
    const margin = parseFloat(this.priceForm.value[`${field}-margin`]);

    const sizeList = ['XS', 'S', 'M', 'L', 'XL'];

    each(this.colors, colorObj => {
      each(colorObj.sizeArr, sizeObj1 => {
        if (sizeList.indexOf(sizeObj1.size) < 0) {
          return;
        }

        const mpb = find(this.modifiedPrices.priceBreaks, { sku: sizeObj1.sku, i });
        remove(this.modifiedPrices.priceBreaks, { sku: sizeObj1.sku, i });

        this.modifiedPrices.priceBreaks.push({
          salePrice,
          price,
          margin,
          locked: mpb && mpb.locked,
          sku: sizeObj1.sku,
          i
        });
      });
    });

    this.populatePriceForm();
  }

  toggleLock() {
    if (this.modifiedPrices.locked) {
      each(this.colors, colorObj => {
        each(colorObj.sizeArr, sizeObj => {
          const pb = find(this.modifiedPrices.priceBreaks, { sku: sizeObj.sku, i: 0 });
          pb.locked = false;
        });
      });
      this.modifiedPrices.locked = false;
    } else {
      each(this.colors, colorObj => {
        each(colorObj.sizeArr, sizeObj => {
          let pb;

          if (this.editMode) {
            const field = `${sizeObj.size}-0`;

            pb = {
              salePrice: parseFloat(this.priceForm.value[`${field}-price`]),
              price: parseFloat(this.priceForm.value[`${field}-cost`]),
              margin: parseFloat(this.priceForm.value[`${field}-margin`])
            };
          } else {
            pb = this.getPrice(sizeObj.sku, 0);
          }

          remove(this.modifiedPrices.priceBreaks, { sku: sizeObj.sku, i: 0 });
          this.modifiedPrices.priceBreaks.push({
            salePrice: pb.salePrice,
            price: pb.price,
            margin: pb.margin,
            locked: true,
            sku: sizeObj.sku,
            i: 0
          });
        });
        this.modifiedPrices.locked = true;
      });
    }

    if (!this.editMode) {
      this.calc_totalCount();
      this.calc_totalAmount();
    }
    this.populatePriceList();
    this.createPriceForm();
  }

  clearModifiedPrices() {
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = `
      Are you sure you want to reset all prices to their default values?
      Confirming will remove any custom prices that have been added to this item and all of its color variations
    `;

    confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.modifiedPrices = {
          locked: false,
          priceBreaks: []
        };
        this.activeCell = null;
        this.editMode = false;
        this.populatePriceList();
        this.populatePriceForm();
        this.editMode = false;
      }
    });
  }

  setActive(pb, i) {
    this.activeCell = {
      ...pb,
      i,
      locked: this.modifiedPrices.locked
    };
  }

  getColorArray() {
    if (this.product.ProductPartArray) {

      this.colors = [];
      let priceTypePart = [];
      if (this.priceType == "Blank") {
        this.minQty = this.product.ProductPartArray.ProductPart[0].partPrice.PartPriceArray.PartPrice[0].minQuantity;
        priceTypePart = this.product.ProductPartArray.ProductPart;
      } else {
        this.minQty = this.product.ProductImprintPartArray.ProductImprintPart[this.priceType][0].partPrice.PartPriceArray.PartPrice[0].minQuantity;
        priceTypePart = this.product.ProductImprintPartArray.ProductImprintPart[this.priceType];
      }

      // finding count of repeated item sku's in matrix
      let sizeColorArr = [];
      each(this.matrixRows, mr => {
        let colorObj = find(sizeColorArr, { color: mr.color });
        if (!colorObj) {
          sizeColorArr.push({ color: mr.color, skuArr: [] });
        }
        colorObj = find(sizeColorArr, { color: mr.color });
        let skuObj = find(colorObj.skuArr, { sku: mr.itemSku });
        if (!skuObj) {
          colorObj.skuArr.push({ sku: mr.itemSku });
        }
      });

      each(priceTypePart, part => {
        let colorObj = find(this.colors, { color: part.ColorArray.Color.colorName });

        if (!colorObj) {
          colorObj = {
            color: part.ColorArray.Color.colorName,
            sizeArr: [],
            msArr: [],
            quantity: 0
          };

          this.colors.push(colorObj);
        }

        const media = find(this.product.MediaContent, { partId: part.partId });
        if (media) {
          colorObj.imageUrl = media.url;
        }else if(colorObj.color){
           const mediaColor = find(this.product.MediaContent, { color: colorObj.color });
	    if (mediaColor) {
	      colorObj.imageUrl = mediaColor.url;
	    }
        }
        let foundSizeObj = find(colorObj.sizeArr, { color: part.ApparelSize.labelSize });

        if (!foundSizeObj) {

          const sizeObj = {
            size: part.ApparelSize.labelSize,
            priceBreaks: part.partPrice.PartPriceArray.PartPrice,
            sku: part.sku,
            partId: part.partId,
            quantity: 0,
            wQtys: {},
            sQtys: {}
          };

          each(this.data.warehouses, warehouse => {
            sizeObj.wQtys[warehouse.fobId] = '';
          });
          each(this.data.suppliers, supplier => {
            sizeObj.sQtys[supplier.fobId] = '';
          });

          colorObj.sizeArr.push({ ...sizeObj });
        }
      });

      each(this.matrixRows, mr => {
        const colorObj = find(this.colors, { color: mr.color });

        if (!colorObj) { return; }

        const sizeObj = find(colorObj.sizeArr, { sku: mr.itemSku });

        if (!sizeObj) { return; }

        if (mr.poType === 'DropShip') {
          sizeObj.sQtys[mr.warehouse] = Math.floor(mr.quantity / this.conversionRatio);
        } else {
          sizeObj.wQtys[mr.warehouse] = Math.floor(mr.quantity / this.conversionRatio);
        }
      });

      each(this.colors, colorObj => {
        colorObj.msArr.push([...colorObj.sizeArr]);
      });
      sizeColorArr = [];
      // doing this to avoid referencing at msArr level objects

      this.calc_totalCount();
      this.calc_totalAmount();
    }
  }

  stClass(cell) {
    if (cell.locked) {
      return 'locked';
    }

    if (cell.modified) {
      return 'changed';
    }

    return '';
  }

  changeLiveInventory(ev) {
    this.liveInventory = ev.checked;

    this.getUniversalInventory();
  }

  private calc_totalCount() {
    this._totalCount = 0;
    each(this.colors, c => {
      c.quantity = 0;
      each(c.msArr, ms => {
        each(ms, s => {
          c.quantity += s.quantity;
        });
      });

      this._totalCount += c.quantity;
    });

    this.hRow = -1;
    each(this.colors[0].sizeArr[0].priceBreaks, pb => {
      if (pb.minQuantity <= this._totalCount) {
        this.hRow++;
      }
    });

    if (this.hRow < 0) {
      this.hRow = 0;
    }
  }

  private calc_totalAmount() {
    let amount = 0;

    if (this.hRow < 0) {
      this._totalAmount = '0.00';
      return;
    }

    each(this.colors, colorObj => {
      each(colorObj.msArr, s => {
        each(s, sizeObj => {
          const price = this.getPrice(sizeObj.sku, this.hRow);
          if (!isNaN(price.salePrice)) {
            amount += Number(price.salePrice) * sizeObj.quantity;
          }
        });
      });
    });

    this._totalAmount = Number(amount).toFixed(2);
  }

  private populatePriceList() {
    let pbCount = this.sColor.sizeArr[0].priceBreaks.length;
    const minQtys = this.sColor.sizeArr[0].priceBreaks.map(pb => pb.minQuantity);

    if (this.modifiedPrices.locked) {
      pbCount = 1;
    }

    this.priceList = [];
    for (let i = 0; i < pbCount; i++) {
      const row: any = {
        'label1': minQtys[i]
      };

      for (let j = this.sColor.sizeArr.length - 1; j >= 0; j--) {
        const sizeObj = this.sColor.sizeArr[j];
        const pb = this.getPrice(sizeObj.sku, i);

        row[sizeObj.size] = {
          price: (pb.salePrice),
          cost: (pb.price),
          margin: fx2N(pb.margin),
          modified: pb.modified,
          locked: pb.locked,
          sku: sizeObj.sku
        };
      }

      this.priceList.push(row);
    }
  }

  private createPriceForm() {
    this.priceForm = this.fb.group(
      this.getFormObj()
    );
  }

  private populatePriceForm() {
    this.priceForm.setValue(
      this.getFormObj()
    );
  }

  private getFormObj() {
    const formObj = {};


    each(this.sColor.sizeArr, sizeObj => {
      each(sizeObj.priceBreaks, (pb, i) => {
        // TODO test that casting i is not causing issues
        if (this.modifiedPrices.locked && parseInt(i) > 0) {
          return;
        }

        const field = `${sizeObj.size}-${i}`;

        const mpb = find(this.modifiedPrices.priceBreaks, { sku: sizeObj.sku, i });
        if (mpb) {
          const _margin = mpb.margin;
          formObj[`${field}-price`] = (mpb.salePrice),
          formObj[`${field}-cost`] = (mpb.price);
          formObj[`${field}-margin`] = isNaN(_margin) ? null : _margin;
          return;
        }

        const margin = +Number(parseFloat(pb.margin).toFixed(2));
        const cost = parseFloat(pb.price);
        let price = 0;
        // if (margin == 100) {
        //   price = parseFloat(pb.salePrice);
        // } else {
          // price = +Number((cost * 100 / (100 - margin)).toFixed(this.countDecimals(cost)));
        // }
        price = +Number(parseFloat(pb.salePrice).toFixed(this.decimalUpto));
        formObj[`${field}-price`] = (price),
        formObj[`${field}-cost`] = (cost);
        formObj[`${field}-margin`] = isNaN(margin) ? null : margin;
      });
    });

    // console.log('GetFormObj: ', formObj);

    return formObj;
  }

  private getPrice(sku, i) {
    if (this.modifiedPrices.locked) {
      const pb = find(this.modifiedPrices.priceBreaks, { sku, i: 0 });
      if (pb) {
        return {
          salePrice: pb.salePrice,
          price: pb.price,
          margin: pb.margin,
          locked: pb.locked,
          modified: true
        };
      }
    }

    let pb = find(this.modifiedPrices.priceBreaks, { sku, i });
    if (pb) {
      return {
        salePrice: pb.salePrice,
        price: pb.price,
        margin: pb.margin,
        locked: pb.locked,
        modified: true
      };
    }

    let part: any = {};
    if (this.priceType == "Blank") {
      part = find(this.product.ProductPartArray.ProductPart, { sku });
    } else {
      part = find(this.product.ProductImprintPartArray.ProductImprintPart[this.priceType], { sku });
    }
    pb = part.partPrice.PartPriceArray.PartPrice[i];

    let priceBreak = {
      margin: 0,
      price: 0,
      salePrice: 0,
      locked: false,
      modified: false,
    };

    if (pb) {
      let margin;
      if (this.margin) {
        margin = +Number(parseFloat(this.margin).toFixed(2));
      } else {
        margin = +Number(parseFloat(pb.margin).toFixed(2));
      }

      const price = parseFloat(pb ? pb.price : 0);
      let salePrice = 0;
      if (margin == 100 || this.margin === '') {
        salePrice = parseFloat(pb ? pb.salePrice : 0);
      } else {
        salePrice = +Number((price * 100 / (100 - margin)).toFixed(this.countDecimals(price)));
      }

      priceBreak = {
        margin,
        price,
        salePrice,
        locked: false,
        modified: false
      };
    }
    return priceBreak;
  }

  checkOnSale(sku) {
    const part = find(this.product.ProductPartArray.ProductPart, { sku });
    return part.priceType;
  }

  getSaleMsg(sku) {
    const part = find(this.product.ProductPartArray.ProductPart, { sku });
    if (part.priceType == "3" && part.saleStartDate && part.saleStartDate != null) {
      return "Item on sale from " + this.datePipe.transform(part.saleStartDate) + " to " + this.datePipe.transform(part.saleEndDate);
    } else if (part.priceType == "2") {
      return "Incentive price shown";
    } else if (part.priceType == "1") {
      return "Special price from supplier";
    }
    return "";
  }

  private getUniversalInventory(color = "") {
    if ((this.product.source == "7" && color == "") || (this.product.source != "7" && color != "")) {
      return;
    }
    this.loading2 = true;
    this.api.getProductLiveInventory(this.product.id, this.liveInventory ? 1 : 0, color)
      .subscribe((res: any) => {
        this.loading2 = false;
        if (res.PartInventoryArray) {
          each(res.PartInventoryArray.PartInventory, part => {
            let temp: any = {};

            if (part.InventoryLocationArray) {
              each(part.InventoryLocationArray.InventoryLocation, location => {
                temp[location.inventoryLocationId] = location.inventoryLocationQuantity.Quantity.value;
              });
            }

            if (this._supplierInventory[part.partColor.toLowerCase()]) {
              this._supplierInventory[part.partColor.toLowerCase()][part.labelSize.toLowerCase()] = temp;
            } else {
              this._supplierInventory[part.partColor.toLowerCase()] = {
                [part.labelSize.toLowerCase()]: temp
              }
            }
          });
        } else {
          this._supplierInventory = {};
        }
      },
        () => {
          this.loading2 = false;
        })
  }

  private getAnteraInventory() {
    this.loading1 = true;
    this.api.getProductInventory(this.product.id, this.orderId)
      .subscribe((res: any) => {
        this.loading1 = false;
        if (res.PartInventoryArray) {
          each(res.PartInventoryArray.PartInventory, part => {
            let temp: any = {};

            if (part.InventoryLocationArray) {
              each(part.InventoryLocationArray.InventoryLocation, location => {
                let inventory = 0;
                let reserved = 0;

                if (location.inventoryLocationQuantity && location.inventoryLocationQuantity.Quantity && location.inventoryLocationQuantity.Quantity.value) {
                  inventory += Number(location.inventoryLocationQuantity.Quantity.value).valueOf();
                }
                if (location.inventoryReservedQuantity && location.inventoryReservedQuantity.Quantity && location.inventoryReservedQuantity.Quantity.value) {
                  reserved += Number(location.inventoryReservedQuantity.Quantity.value).valueOf();
                }

                if (temp[location.inventoryLocationId]) {
                  inventory += temp[location.inventoryLocationId].inventory;
                  reserved += temp[location.inventoryLocationId].reserved;
                }

                temp[location.inventoryLocationId] = {
                  inventory: inventory,
                  reserved: reserved
                };
              });
            }

            if (this._anteraInventory[part.partColor]) {
              this._anteraInventory[part.partColor][part.labelSize] = temp;
            } else {
              this._anteraInventory[part.partColor] = {
                [part.labelSize]: temp
              }
            }
          });
        } else {
          this._anteraInventory = {};
        }
      })
  }

  getVendorDetails(vendorId) {
    this.api.getAccountDetails(vendorId)
      .subscribe((account: Account) => {
        if (!account) {
          return;
        }
        this.vendorProductNotes = account.vendorProductNotes;
        this.eqp = account.eqp == '1' ? true : false
      });
  }

  setPriceType(priceType = "Blank") {
    if (this.modifiedPrices.priceBreaks.length > 0) {
      this.msg.show('Please reset prices to default values to continue', 'info');
      return;
    }
    this.priceType = priceType;
    this.getColorArray();
    this.sColor = find(this.colors, { color: this.sColor.color }) || this.colors[0];
    this.selectColor(this.sColor);
  }

  changeUom(ev) {
    const uomDetails = this.product.uomDetails.find(child => child.id === this.uomId);
    this.conversionRatio = (uomDetails.conversionRatio) ? uomDetails.conversionRatio : 1;
    this.abbreviation = (uomDetails.abbreviation) ? uomDetails.abbreviation : 'ea';
  }

  replaceProduct(product) {
    if (this.editMode) {
      this.msg.show('Please save prices first', 'info');
      return;
    }
    this.loadProduct(product.pId);
  }

  toNumber(v) {
    return isFinite(v) && !isNaN(v) ? Number(v) : 0;
  }

  openReplaceConfirmDialog() {
    const dialogRef = this.dialog.open(AlternateReplaceWarningDialog, {
      panelClass: 'antera-details-dialog',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addToOrder(true);
      }
    });
  }

  countDecimals (number) {
    if (Math.floor(number) === number) {
      return 0;
    }
    return number.toString().split('.')[1].length || 0;
  }

}

@Component({
  selector: 'alternate-replace-warning-dialog',
  template: `
  <div class="dialog-content-wrapper">
    <mat-toolbar matDialogTitle class="mat-accent m-0">
      <div fxFlex fxLayout="row" fxLayoutAlign="space-between center">
        <span class="title dialog-title">Confirmation</span>
        <button mat-button class="mat-icon-button" (click)="onNoClick()" aria-label="Close dialog">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </mat-toolbar>
    <div mat-dialog-content class="p-24 m-0" fusePerfectScrollbar>
      <p>This will remove any color/size combination along with its configuration, which are not available on new product!</p>
      <p>Order form will be saved automatic and changes will be updated.</p>
      <p>Do you wish to continue?</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onYesClick()">Yes</button>
      <button mat-button (click)="onNoClick()">No</button>
    </div>
  </div>
  `,
  styles: [ '.mat-dialog-actions {margin-bottom: 0px !important;}',
    '.mat-dialog-content {padding-bottom: 0px !important;}']
})
export class AlternateReplaceWarningDialog {

  constructor(
    public dialogRef: MatDialogRef<AlternateReplaceWarningDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

}

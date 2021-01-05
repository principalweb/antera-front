import { Component, Inject, ViewEncapsulation } from '@angular/core';
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
  selector: 'app-pricing-inventory',
  templateUrl: './pricing-inventory.component.html',
  styleUrls: ['./pricing-inventory.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PricingInventoryComponent {
  product: any = {};
  lineItem: any = {};
  priceType: string = "Blank";
  priceTypes: string[] = [];

  colors = [];
  sizes = [];
  displayedColumns = [];
  priceList = [];
  locationList = [];
  suppliersList = [];

  modifiedPrices = {
    locked: false,
    priceBreaks: []
  };

  warehouseForm: FormGroup;
  supplierForm: FormGroup;
  sColor: any = {};
  margin = '';
  uomId = 0;
  conversionRatio = 1;
  abbreviation = 'ea';
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

  get totalCount() {
    return numberWithCommas(this._totalCount);
  }

  get totalAmount() {
    return numberWithCommas(this._totalAmount);
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
    //return inventory + ', ' + reserved;
    return inventory;
  }

  constructor(
    public dialogRef: MatDialogRef<PricingInventoryComponent>,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private config: GlobalConfigService,
    private dialog: MatDialog,
    private msg: MessageService,
    private api: ApiService
  ) {
    this.orderId = data.oId;
    this.product = this.data.product;
    this.lineItem = { ...this.data.lineItem };
    this.decimalUpto = this.data.sysconfigOrderFormCostDecimalUpto;
    this.sysconfigOrderFormCostDecimalUpto = '1.2-' + this.decimalUpto;
    this.modifiedPrices = {
      locked: this.lineItem.modifiedPriceBreaks.locked || false,
      priceBreaks: this.lineItem.modifiedPriceBreaks.priceBreaks || []
    };
    if (this.data.suppliers.length === 0) {
      this.data.suppliers = [
        {
          fobId: 0,
          fobCity: 'Main',
          fobState: ''
        }
      ]
    }
    if (this.lineItem.priceType && this.lineItem.priceType != "") {
      this.priceType = this.lineItem.priceType;
    }
    if (this.lineItem.uomId && this.lineItem.uomId != "" && this.lineItem.uomId > 0) {
      this.uomId = this.lineItem.uomId;
      const uomDetails = this.product.uomDetails.find(child => child.id === this.uomId);
      this.conversionRatio = (this.lineItem.uomConversionRatio) ? this.lineItem.uomConversionRatio : 1;
      this.abbreviation = (uomDetails.abbreviation) ? uomDetails.abbreviation : 'ea';
    }
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
    this.getVendorDetails();
  }


  selectColor(color) {
    if (this.editMode) {
      this.msg.show('Please save prices first', 'info');
      return;
    }

    this.sColor = color;
    this.getUniversalInventory(color.color);

    this.sizes = map(
      this.sColor.sizeArr,
      sizeObj => sizeObj.size
    );

    this.displayedColumns = [
      'label1',
      'label2',
      ...this.sizes
    ];


    this.populatePriceList();

    this.locationList = [];
    const ctlDef = {};
    each(this.data.warehouses, (location) => {
      const row = {
        'label1': fobCity(location)
      };

      each(this.sColor.sizeArr, sizeObj => {
        const cell = {
          name: `q-${location.fobId}-${sizeObj.size}`,
          qtyObj: sizeObj.wQtys,
          fobId: location.fobId
        };

        ctlDef[cell.name] = sizeObj.wQtys[location.fobId];

        row[sizeObj.size] = cell;
      });

      this.locationList.push(row);
    });

    this.warehouseForm = this.fb.group(ctlDef);

    this.suppliersList = [];
    const ctlDef1 = {};
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

        ctlDef1[cell.name] = sizeObj.sQtys[location.fobId];

        row[sizeObj.size] = cell;
      });

      this.suppliersList.push(row);
    });

    this.supplierForm = this.fb.group(ctlDef1);
  }

  addToOrder() {
    if (!this.sColor.color) {
      this.msg.show('Please select a color', 'error');
      return;
    }
    if (this.priceType == "Blank") {
      this.lineItem.priceType = "";
    } else {
      this.lineItem.priceType = this.priceType;
    }

    // if (this._totalCount < this.minQty) {
    //   this.msg.show(`Total count should be greater than minimum quantity. Please add ${this.minQty - this._totalCount} more item${(this.minQty - this._totalCount)>1?'s':''}.`, 'error');
    // }

    const mrows = this.matrixRows.filter(row => row.size !== '');
    let c = 0;

    each(this.colors, color => {

      each(color.sizeArr, sizeObj => {
        let price = this.getPrice(sizeObj.sku, this.hRow);

        each(sizeObj.wQtys, (qty, warehouse) => {
          qty = Number(qty);
          if (Number.isNaN(qty) || qty < 0) {
            return;
          }
          const unitQuantity = qty;
          qty = qty * this.conversionRatio;

          console.log('qty' + qty);
          let row = find(this.matrixRows, {
            itemSku: sizeObj.sku,
            poType: 'Stock',
            warehouse
          });

          if (!row && qty > 0) {
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
              sourceWarehouse: warehouse,
              status: "",
              type: "Stock",
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
              poType: 'Stock',
              warehouse,
              fulfillments: fulfillments,
              uom: this.uomId,
            });
            mrows.push(row);
          } else if (row) {
            let fulfillments = [];
            if (row.fulfillments && row.fulfillments.length > 0) {
              fulfillments = row.fulfillments;
              if (fulfillments.length == 1) {
                fulfillments[0].quantity = qty;
              } else {
                let fqty = 0;
                if (row.quantity > qty) {
                  fqty = row.quantity - qty;
                } else if (row.quantity < qty) {
                  fqty = qty - row.quantity;
                }
                each(fulfillments, f => {
                  if (fqty > 0) {
                    if (row.quantity > qty) {
                      if (f.quantity > fqty) {
                        f.quantity -= fqty;
                        fqty = 0;
                      } else {
                        fqty -= f.quantity;
                        f.quantity = 0;
                      }
                    } else if (row.quantity < qty) {
                      f.quantity += fqty;
                      fqty = 0;
                    }
                  }
                });
              }
            } else {
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
                sourceWarehouse: warehouse,
                status: "",
                type: "DropShip",
              }];
            }
            row.setData({
              ...row,
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
              fulfillments: fulfillments
            });
          }
        })


        each(sizeObj.sQtys, (qty, warehouse) => {
          qty = Number(qty);
          if (Number.isNaN(qty) || qty < 0) {
            return;
          }
          const unitQuantity = qty;
          qty = qty * this.conversionRatio;
          let row = find(this.matrixRows, {
            itemSku: sizeObj.sku,
            poType: 'DropShip',
            warehouse
          });

          if (!row && qty > 0) {
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
              sourceWarehouse: warehouse,
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
              warehouse,
              fulfillments: fulfillments
            });
            mrows.push(row);
          } else if (row) {
            let fulfillments = [];
            if (row.fulfillments && row.fulfillments.length > 0) {
              fulfillments = row.fulfillments;
              if (fulfillments.length == 1) {
                fulfillments[0].quantity = qty;
              } else {
                let fqty = 0;
                if (row.quantity > qty) {
                  fqty = row.quantity - qty;
                } else if (row.quantity < qty) {
                  fqty = qty - row.quantity;
                }
                each(fulfillments, f => {
                  if (fqty > 0) {
                    if (row.quantity > qty) {
                      if (f.quantity > fqty) {
                        f.quantity -= fqty;
                        fqty = 0;
                      } else {
                        fqty -= f.quantity;
                        f.quantity = 0;
                      }
                    } else if (row.quantity < qty) {
                      f.quantity += fqty;
                      fqty = 0;
                    }
                  }
                });
              }
            } else {
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
                sourceWarehouse: warehouse,
                status: "",
                type: "DropShip",
              }];
            }
            row.setData({
              ...row,
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
              fulfillments: fulfillments
            });
          }
        })
      });
    });

    this.dialogRef.close({
      action: 'save',
      matrixRows: mrows,
      margin: this.margin,
      priceType: this.priceType,
      modifiedPriceBreaks: this.modifiedPrices,
      uomId: this.uomId,
      uomConversionRatio: this.conversionRatio,
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
      each(this.modifiedPrices.priceBreaks, mpb => {
        if (!mpb.locked) {
          mpb.margin = parseFloat(this.margin);
          mpb.salePrice = parseFloat(mpb.price) * 100 / (100 - mpb.margin);
        }
      });

      this.populatePriceList();
    } else {

    }
  }

  updateQuantity(cell, ev) {
    const q = Number(ev.target.value);
    if (Number.isNaN(q) || q < 0) {
      this.msg.show('Please enter valid number. It should be non-negative value.', 'error');
      return;
    }

    cell.qtyObj[cell.fobId] = q;

    this.calc_totalCount();
    this.calc_totalAmount();

    ev.target.blur();
  }

  adjustFromPrice(row, col, ev) {
    let price = Number(this.priceForm.value[`${col}-${row}-price`]);
    let cost = Number(this.priceForm.value[`${col}-${row}-cost`]);
    let profit = price - cost;
    let margin = fx2N(profit * 100 / price);

    if (price === 0) {
      margin = undefined;
    } else if (price > 0) {
      if (price === cost) {
        margin = 0;
      } else {
        margin = fx2N(profit * 100 / price);
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
    let price = Number(this.priceForm.value[`${col}-${row}-price`]);
    let cost = Number(this.priceForm.value[`${col}-${row}-cost`]);
    let margin = this.priceForm.value[`${col}-${row}-margin`];

    if (margin != null) {
      price = (cost * 100 / (100 - margin));
    }
    let profit = price - cost;

    if (price < 0) {
      return;
    }

    if (price === 0) {
      margin = undefined;
    } else if (price === cost) {
      margin = 0;
    } else if (updateMargin) {
      margin = fx2N(profit * 100 / price);
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
        var price = this.priceForm.value[`${field}-price`];
        var cost = this.priceForm.value[`${field}-cost`];
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
          this.modifiedPrices.priceBreaks.push({
            salePrice: price,
            price: cost,
            margin: margin,
            locked: mpb && mpb.locked,
            sku: sizeObj.sku,
            i
          });
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

      each(priceTypePart, part => {
        let colorObj = find(this.colors, { color: part.ColorArray.Color.colorName });
        console.log(colorObj);
        if (!colorObj) {
          colorObj = {
            color: part.ColorArray.Color.colorName,
            sizeArr: [],
            quantity: 0,
            unitQuantity: 0,
          };

          this.colors.push(colorObj);
        }

        const media = find(this.product.MediaContent, { partId: part.partId });
        if (media) {
          colorObj.imageUrl = media.url;
        }
        let foundSizeObj = find(colorObj.sizeArr, { size: part.ApparelSize.labelSize });

        if (!foundSizeObj) {

          const sizeObj = {
            size: part.ApparelSize.labelSize,
            priceBreaks: part.partPrice.PartPriceArray.PartPrice,
            sku: part.sku,
            partId: part.partId,
            quantity: 0,
            unitQuantity: 0,
            wQtys: {},
            sQtys: {}
          };

          each(this.data.warehouses, warehouse => {
            sizeObj.wQtys[warehouse.fobId] = '';
          });
          each(this.data.suppliers, supplier => {
            sizeObj.sQtys[supplier.fobId] = '';
          });

          colorObj.sizeArr.push(sizeObj);
        }
      });

      each(this.matrixRows, mr => {
        const colorObj = find(this.colors, { color: mr.color });

        if (!colorObj) return;

        const sizeObj = find(colorObj.sizeArr, { sku: mr.itemSku });

        if (!sizeObj) return;

        if (mr.poType === 'DropShip') {
          sizeObj.sQtys[mr.warehouse] = Math.floor(mr.quantity / this.conversionRatio);
        } else {
          sizeObj.wQtys[mr.warehouse] = Math.floor(mr.quantity / this.conversionRatio);
        }
      });

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
      c.unitQuantity = 0;
      each(c.sizeArr, s => {
        s.unitQuantity = sum(numValues(s.sQtys)) + sum(numValues(s.wQtys));
        c.unitQuantity += s.unitQuantity;
      });

      this._totalCount += (c.unitQuantity * this.conversionRatio);
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
      each(colorObj.sizeArr, sizeObj => {
        const price = this.getPrice(sizeObj.sku, this.hRow);
        amount += Number(price.salePrice) * sizeObj.unitQuantity * this.conversionRatio;
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
        // TODO test that casting i is not creating issues
        if (this.modifiedPrices.locked && parseInt(i) > 0) {
          return;
        }

        const field = `${sizeObj.size}-${i}`;

        const mpb = find(this.modifiedPrices.priceBreaks, { sku: sizeObj.sku, i });
        if (mpb) {
          let _margin = fx2N(mpb.margin);
          formObj[`${field}-price`] = (mpb.salePrice);
          formObj[`${field}-cost`] = (mpb.price);
          formObj[`${field}-margin`] = isNaN(_margin) ? null : _margin;
          return;
        }

        const margin = pb.margin;
        const cost = parseFloat(pb.price);
        const price = cost * 100 / (100 - margin);
        formObj[`${field}-price`] = (price);
        formObj[`${field}-cost`] = (cost);
        formObj[`${field}-margin`] = isNaN(margin) ? null : margin;
      });
    });

    console.log('GetFormObj: ', formObj);

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
        margin = parseFloat(this.margin);
      } else {
        margin = pb.margin;
      }

      const price = parseFloat(pb ? pb.price : 0);
      const salePrice = price * 100 / (100 - margin);

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

  openDecorationDialog() {
    const dialogRef = this.dialog.open(SupplierDecorationDialogComponent, {
      width: '80vw',
      height: '80vh',
    });
    dialogRef.componentInstance.product = this.product;
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
                  inventory = Number(location.inventoryLocationQuantity.Quantity.value).valueOf();
                }
                if (location.inventoryReservedQuantity && location.inventoryReservedQuantity.Quantity && location.inventoryReservedQuantity.Quantity.value) {
                  reserved = Number(location.inventoryReservedQuantity.Quantity.value).valueOf();
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

  getVendorDetails() {
    this.api.getAccountDetails(this.lineItem.vendorId)
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

}

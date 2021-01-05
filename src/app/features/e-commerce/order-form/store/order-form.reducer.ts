
import { OrderFormActions, OrderFormActionTypes } from './order-form.actions';
import { OrderDetails, MatrixRow, ProductDetails, LineItem } from 'app/models';
import { createFeatureSelector, createSelector } from '@ngrx/store';
// import { orderByComparator } from '@swimlane/ngx-datatable/release/utils';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FobPoint, IAddonCharge } from '../interfaces';
import { ExchangeRate } from 'app/models/exchange-rate';


export interface OrderLoadingState {
  active: boolean;
  label?: string;
}

export interface ProductInventory {
  local: { [sku: string]: any };
  universal: { [sku: string]: any };
}

export interface ProductInventoryMapState {
  [productId: string]: ProductInventory;
}

export interface State {
  order: any | undefined; // OrderDetails requires function
  artProofs: any | undefined;
  pricing?: any;
  config: any;
  edit: boolean;
  loading?: OrderLoadingState;
  saving: boolean;
  vouched: any | undefined;
  actionView?: string;
  fields: any[];
  decoVendorsByType: { [key: string]: any[] };
  productMap: { [key: string]: ProductDetails };
  productFobMap: { [key: string]: FobPoint[] };
  localFob: FobPoint[];
  inventoryMap: ProductInventoryMapState;
  currency: OrderFormCurrency;
  customerCurrencies: { [key: string]: string };
  vendorCurrencies: { [key: string]: string};
  timesGettingCurrency: number;
}

export interface OrderFormCurrency {
  currency: string;
  currencyEnabled: boolean;
  exchangeRates: ExchangeRate[],
}

export const initialState: State = {
  order: undefined,
  artProofs: [],
  edit: true,
  loading: {
    active: true
  },
  saving: false,
  vouched: false,
  actionView: undefined,
  config: {
    edit: true,
    hideVendor: false,
    hideCost: false,
    vouchedCost: true,
  },
  fields: [],
  decoVendorsByType: {},
  inventoryMap: {},
  productMap: {},
  localFob: [],
  productFobMap: {},
  currency: {
    currency: "",
    currencyEnabled: false,
    exchangeRates: [],
  },
  customerCurrencies: {},
  vendorCurrencies: {},
  timesGettingCurrency: 0
};

export function reducer(state = initialState, action: OrderFormActions): State {
  switch (action.type) {

    case OrderFormActionTypes.ResetOrderState: {
      return {
        ...initialState
      };
    }

    case OrderFormActionTypes.SaveOrder: {
      return {
        ...state,
        loading: { active: true, label: 'Saving Order' }
      };
    }

    case OrderFormActionTypes.SaveOrderSuccess: {
      return {
        ...state,
        order: action.payload,
        loading: { active: false }
      };
    }

    case OrderFormActionTypes.SaveOrderError: {
      return {
        ...state,
        loading: { active: false }
      }
    }

    case OrderFormActionTypes.LoadOrderFieldsSuccess: {
      return {
        ...state,
        fields: [...action.payload]
      };
    }

    case OrderFormActionTypes.LoadOrderPricingSuccess: {
      return {
        ...state,
        pricing: action.payload
      };
    }

    case OrderFormActionTypes.LoadOrderVouchedSuccess: {
      return {
        ...state,
        vouched: action.payload
      };
    }

    case OrderFormActionTypes.LoadLocalWarehousesSuccess: {
      let fobs = action.payload.filter((fob) => {
        if(fob.customerOwned && fob.accountId !== state.order.accountId) {
          return false;
        }
        return true;
      });
      fobs = fobs.map((fob) => {
        return { ...fob, type: 'Stock' };
      });
      return {
        ...state,
        localFob: fobs
      };
    }

    case OrderFormActionTypes.LoadOrderArtProofsSuccess: {
      const uniqueProofs = state.order.lineItems.reduce((items, item, itemIndex) => {
        if (!item.decoVendors || !item.decoVendors.length) { return items; }

        const variations = item.decoVendors.reduce((variations, deco, decoIndex) => {
          deco.decorationDetails.forEach((detail) => {
            variations.push({
              artwork_id: deco.designId,
              artwork_variation_id: detail.decoDesignVariation.decoImprintVariation,
              productImage: item.quoteCustomImage[0],
              decoDetails: detail
            });
          });
          return variations;
        }, []);

        variations.forEach((variation) => {
          const uniqueProof = { product_id: item.productId, ...variation };
          const alreadyCreated = action.payload.data
            .some((proof) => proof.artwork_variation_id == variation.artwork_variation_id && proof.product_id == item.productId);

          if (items.indexOf(uniqueProof) === -1 && !alreadyCreated) {
            items.push(uniqueProof);
          }
        });
        return items;
      }, []);

      return {
        ...state,
        artProofs: { ...action.payload, pending: uniqueProofs }
      };
    }

    case OrderFormActionTypes.LoadProductSuccess: {
      const product = action.payload.product;
      let fobs = [];
      if (Array.isArray(action.payload.universalFob)) {
        fobs = action.payload.universalFob.map((fob) => {
          return { ...fob, type: 'DropShip' };
        });
      }

      const productMap = {
        ...state.productMap,
        [product.id]: product
      };
      const productFobMap = {
        ...state.productFobMap,
        [product.id]: fobs
      };

      return {
        ...state,
        productMap: productMap,
        productFobMap: productFobMap,
      };
    }

    case OrderFormActionTypes.LoadProductInventorySuccess: {

      const [local, universal] = action.payload;

      // inventoryMap[product.id]['local'][sku][location]

      const inventoryMap = {
        'local': {},
        'universal': {},
      };

      if (!action.product || !action.product.ProductPartArray) {
        return state;
      }

      action.product.ProductPartArray.ProductPart.forEach((productPart) => {

        // Map local inventory
        const sku = productPart.sku;
        const localPartInventory = local.PartInventoryArray.PartInventory.find((part) => {
          return part.partId === productPart.partId;
        });
        if (localPartInventory && localPartInventory.InventoryLocationArray && localPartInventory.InventoryLocationArray.InventoryLocation) {
          inventoryMap['local'][sku] = localPartInventory.InventoryLocationArray.InventoryLocation.reduce((locations, location, index) => {
            if (!locations[location.inventoryLocationId]) {
              locations[location.inventoryLocationId] = 0;
            }

            if (location.inventoryLocationQuantity && location.inventoryLocationQuantity.Quantity && location.inventoryLocationQuantity.Quantity.value) {
              locations[location.inventoryLocationId] += Number(location.inventoryLocationQuantity.Quantity.value);
            }
            return locations;
          }, {});
        }

        // Map universal inventory to skus (If no color is passed it comes back as an array...)
        if (universal && !Array.isArray(universal) && universal.PartInventoryArray && universal.PartInventoryArray.PartInventory) {
          const universalPartInventory = universal.PartInventoryArray.PartInventory.find((part) => {
            return part.partId === productPart.partId;
          });
          if (universalPartInventory && universalPartInventory.InventoryLocationArray && universalPartInventory.InventoryLocationArray.InventoryLocation) {
            inventoryMap['universal'][sku] = universalPartInventory.InventoryLocationArray.InventoryLocation.reduce((locations, location, index) => {
              if (location.inventoryLocationQuantity && location.inventoryLocationQuantity.Quantity && location.inventoryLocationQuantity.Quantity.value) {
                locations[location.inventoryLocationId] = location.inventoryLocationQuantity.Quantity.value;
              } else {
                locations[location.inventoryLocationId] = 0;
              }
              return locations;
            }, {});
          }
        }
      });

      // Build product inventory node
      let productInventory;
      if (!state.inventoryMap[action.product.id]) {
        productInventory = inventoryMap;
      } else {
        // Merge previously fetched skus
        productInventory = {
          local: { ...state.inventoryMap[action.product.id]['local'], ...inventoryMap['local'] },
          universal: { ...state.inventoryMap[action.product.id]['universal'], ...inventoryMap['universal'] }
        };
      }

      // Rebuild statej
      return {
        ...state,
        inventoryMap: {
          ...state.inventoryMap,
          [action.product.id]: productInventory,
        }
      };
    }

    case OrderFormActionTypes.UpdateConfig: {
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload,
        }
      };
    }
    case OrderFormActionTypes.LoadOrder: {
      return {
        ...state,
        loading: { active: true, label: 'Loading' }
      };
    }

    case OrderFormActionTypes.UpdateDecoration: {

      const data = { ...action.payload.data };
      const items = state.order.lineItems.map((item) => {
        if (action.payload.item.lineItemUpdateId === item.lineItemUpdateId) {
          let shouldRemovePriceType = true;
          let priceType = null;
          const decoVendors = item.decoVendors.map((decoVendor) => {

            if (decoVendor.decoVendorRecordId === action.payload.deco.decoVendorRecordId) {
              const updatedDecoVendor = { ...decoVendor, ...data };

              if (updatedDecoVendor.sourceLocationId && updatedDecoVendor.sourceLocationId) {
                shouldRemovePriceType = false;

                if (action.payload.sourceLocation && action.payload.sourceDecoration) {
                  priceType = action.payload.sourceDecoration.imprintPriceKey;
                }
              }

              return updatedDecoVendor;
            }

            if (decoVendor.sourceLocationId && decoVendor.sourceLocationId) {
              shouldRemovePriceType = false;
            }

            return decoVendor;
          });

          const updatedItem = {
            ...item,
            decoVendors: decoVendors,
          };

          if (priceType) {
            updatedItem.priceType = priceType;
          }

          if (shouldRemovePriceType) {
            updatedItem.priceType = null;
          }

          return updatedItem;
        }
        return item;
      });

      const newOrder = {
        ...state.order,
        lineItems: items
      };

      return {
        ...state,
        order: newOrder,
        config: { ...state.config, dirty: true },
      };
    }
    case OrderFormActionTypes.UpdateDecorationSuccess: {
      return {
        ...state,
        saving: false,
      };
    }


    case OrderFormActionTypes.LoadOrderSuccess: {

      // // Sort line items...
      let order;
      // if (action.payload && action.payload.lineItems) {
      //   order = { ...action.payload, lineItems: [...action.payload.lineItems] };
      //   order.lineItems.sort((a, b) => {
      //     if (+a.sortOrder < +b.sortOrder) {
      //       return -1;
      //     }
      //     if (+a.sortOrder > +b.sortOrder) {
      //       return 1;
      //     }
      //     return 0;
      //   });
      // } else {
      order = { ...action.payload };
      // }
      if (order.shipDate === "0000-00-00") {
        order.shipDate = null;
      }

      return {
        ...state,
        order: order,
        loading: { active: false },
      };
    }

    case OrderFormActionTypes.LoadOrderError: {
      return {
        ...state,
        loading: { active: false },
      };
    }

    case OrderFormActionTypes.ApplyPriceBreaks: {
      return {
        ...state,
        loading: { active: true, label: 'Applying price breaks' },
      };
    }
    case OrderFormActionTypes.ApplyPriceBreaksSuccess:
    case OrderFormActionTypes.ApplyPriceBreaksError: {
      return {
        ...state,
        loading: { active: false },
      };
    }

    case OrderFormActionTypes.ReorderItemDropped: {

      const event = action.payload;

      const newOrder = Object.assign({}, state.order);
      newOrder.lineItems = action.payload.map((item, index) => {
        return { ...item, sortOrder: index };
      });

      return { ...state, order: newOrder };
    }

    case OrderFormActionTypes.AddMatrixRow: {
      const lineIndex = state.order.lineItems.findIndex((item) => item.lineItemUpdateId === action.payload.lineItemUpdateId);

      if (lineIndex >= 0) {

        // const hasNewRow = state.order.lineItems[lineIndex].matrixRows.some((row) => row.rowIndex);
        // if (hasNewRow) {
        //   return state;
        // }

        // Shallow copy order
        const newOrder = Object.assign({}, state.order);
        newOrder.lineItems = [...newOrder.lineItems];
        let length = newOrder.lineItems[lineIndex].matrixRows.length;

        // Shallow copy line item
        newOrder.lineItems[lineIndex] = Object.assign({}, newOrder.lineItems[lineIndex]);

        const orderConfig = state.config.module.settings;

        newOrder.lineItems[lineIndex].matrixRows = [
          ...newOrder.lineItems[lineIndex].matrixRows,
          new MatrixRow({
            rowIndex: length,
            quantity: 1,
            unitQuantity: 1,
            poType: 'DropShip',
            priceStrategy: orderConfig.defaultProductPriceStrategy || 'MANUAL',
            costStrategy: orderConfig.defaultProductCostStrategy || 'MANUAL',
            fulfillments: [{
              type: 'DropShip',
              quantity: 1,
              incomingWarehouse: null,
              sourceWarehouse: null,
            }]
          })
        ];
        return { ...state, order: newOrder };
      }

      return state;
    }
    case OrderFormActionTypes.UpdateMatrixRow: {
      const data = action.payload.row;
      const lineIndex = state.order.lineItems.findIndex((item) => item.lineItemUpdateId === action.payload.lineItemUpdateId);
      if (lineIndex >= 0) {

        // Shallow copy order and lines
        const newOrder = Object.assign({}, state.order);
        newOrder.lineItems = [...newOrder.lineItems];

        // Update rows
        const rows = state.order.lineItems[lineIndex].matrixRows.map((_row) => {
          let row: MatrixRow = { ..._row };

          if (data.matrixUpdateId) {
            if (data.matrixUpdateId === _row.matrixUpdateId) {

              row = { ..._row, ...data };

              row.totalCost = row.quantity * row.cost;
              row.totalPrice = row.quantity * row.price;

              // TODO: Implement multiple fulfillments
              row.fulfillments.map((fulfillment) => {
                return {
                  ...fulfillment,
                  quantity: row.quantity,
                };
              });
            }
          } else {
            if (data.rowIndex === _row.rowIndex) {
              row = new MatrixRow({ ..._row, ...data });

              // TODO: Calculate new totals
              row.totalCost = row.quantity * row.cost;
              row.totalPrice = row.quantity * row.price;
            }
          }

          return row;
        });
        // Update decoration quantities
        const decoVendors = state.order.lineItems[lineIndex].decoVendors.map((vendor) => {

          const decoDetails = vendor.decorationDetails.map((detail) => {
            const rowIndex = rows.findIndex((row) => row.matrixUpdateId && detail.matrixId === row.matrixUpdateId);
            const row = rows[rowIndex];
            if (detail.matrixId === row.matrixUpdateId) {
              return {
                ...detail,
                decoProductQty: row.quantity,
                decoProductSize: row.size,
                decoProductColor: row.color,
              };
            }
            return detail;
          });
          const totalDecoQuantity = decoDetails.reduce((sum, detail, index) => sum += detail.decoProductQty, 0);

          const addonCharges = vendor.addonCharges.map((charge: IAddonCharge) => {
            if (charge.matchOrderQty == '1') {
              return { ...charge, quantity: totalDecoQuantity };
            }
            return charge;
          });

          // Map to decoVendor with adjusted quantity
          return {
            ...vendor,
            decorationDetails: decoDetails,
            quantity: totalDecoQuantity,
            addonCharges: addonCharges,
          };
        });

        const item = Object.assign({}, newOrder.lineItems[lineIndex]);

        // Assign new rows
        item.matrixRows = rows;
        item.decoVendors = decoVendors;


        // Shallow copy line item
        newOrder.lineItems[lineIndex] = item;

        // Calculate new line item price

        return { ...state, order: newOrder };
      }

      return state;
    }

    case OrderFormActionTypes.UpdateItemRows: {

      const lineIndex = state.order.lineItems
        .findIndex((item) => item.lineItemUpdateId === action.item.lineItemUpdateId);

      if (lineIndex >= 0) {

        // Shallow copy order and lines
        const newOrder = Object.assign({}, state.order);
        newOrder.lineItems = [...newOrder.lineItems];

        // Update each row in the line with the payload
        const newLine = Object.assign({}, newOrder.lineItems[lineIndex]);
        newLine.matrixRows = newLine.matrixRows.map((row) => {
          return { ...row, ...action.payload };
        });

        newOrder.lineItems[lineIndex] = newLine;
        return { ...state, order: newOrder };
      }
      return state;
    }

    case OrderFormActionTypes.UpdateLineItem: {
      const data = { ...action.payload };
      const lineIndex = state.order.lineItems.findIndex((item) => item.lineItemUpdateId === action.payload.lineItemUpdateId);
      if (lineIndex >= 0) {

        // Shallow copy order and lines
        const newOrder = Object.assign({}, state.order);
        newOrder.lineItems = [...newOrder.lineItems];

        // Assign new rows
        // Shallow copy line item
        newOrder.lineItems[lineIndex] = Object.assign({}, newOrder.lineItems[lineIndex], data);
        return { ...state, order: newOrder };
      }
      return state;
    }

    case OrderFormActionTypes.DeleteDecorations: {

      const lineIndex = state.order.lineItems.findIndex((item) => item.id === action.payload.lineItemId);
      if (lineIndex >= 0) {

        // Shallow copy order and lines
        const updatedOrder = { ...state.order };
        updatedOrder.lineItems = [...updatedOrder.lineItems];

        const updatedItem = { ...updatedOrder.lineItems[lineIndex] };

        updatedItem.decoVendors = updatedItem.decoVendors.filter((vendor) => !action.payload.ids.includes(vendor.decoVendorRecordId));

        // Assign new rows
        // Shallow copy line item
        updatedOrder.lineItems[lineIndex] = updatedItem;
        return { ...state, order: updatedOrder };
      }
      return state;
    }

    case OrderFormActionTypes.DeleteMatrixRows: {

      // Shallow copy order line items, and specific line item
      const newOrder = Object.assign({}, state.order);
      newOrder.lineItems = [...newOrder.lineItems];

      action.payload.rows.forEach((targetRow) => {
        const itemIndex = state.order.lineItems.findIndex((item) => item.matrixRows.some((_row) => _row.matrixUpdateId === targetRow.matrixUpdateId));

        if (itemIndex !== -1) {
          newOrder.lineItems[itemIndex] = Object.assign({}, newOrder.lineItems[itemIndex]);

          const rowLength = newOrder.lineItems[itemIndex].matrixRows.length;
          if (rowLength === 1) {
            // Remove line item all together
            newOrder.lineItems[itemIndex]._destroy = true;
          }

          // Remove matrix row
          newOrder.lineItems[itemIndex].matrixRows = newOrder.lineItems[itemIndex].matrixRows.reduce((rows, _row) => {
            // Handle rows that have already been saved
            if (targetRow.matrixUpdateId) {
              if (targetRow.matrixUpdateId === _row.matrixUpdateId) {
                rows.push({ ..._row, _destroy: true });
              } else {
                rows.push(_row);
              }
            }
            // Handle rows that have not yet been saved
            if (typeof targetRow.rowIndex !== 'undefined' && targetRow.rowIndex >= 0 && targetRow.rowIndex !== _row.rowIndex) {
              rows.push(_row);
            }
            return rows;
          }, []);

        }
      });

      return { ...state, order: newOrder, config: { ...state.config, dirty: true } };
    }
    case OrderFormActionTypes.UpdateCustomerCurrency: {
      return {
        ...state,
        customerCurrencies: {...state.customerCurrencies, ...action.payload }
      }
    }
    case OrderFormActionTypes.UpdateCurrencyEffects: {
      console.log("Update currency Effects in reducer");
      console.log("action.payload", action.payload);
      return {
        ...state,
        vendorCurrencies: { ...state.vendorCurrencies, ...action.payload.vendorCurrencies },
        customerCurrencies: { ...state.customerCurrencies, ...action.payload.customerCurrencies }
      }
    }
    case OrderFormActionTypes.UpdateVendorCurrency: {
      return {
        ...state,
        vendorCurrencies: { ...state.vendorCurrencies, ...action.payload }
      };
    }
    case OrderFormActionTypes.DeleteMatrixRow: {
      const data = action.payload.row;
      const lineIndex = state.order.lineItems.findIndex((item) => item.lineItemUpdateId === action.payload.item.lineItemUpdateId);
      if (lineIndex >= 0) {
        // Shallow copy order line items, and specific line item
        const newOrder = Object.assign({}, state.order);
        newOrder.lineItems = [...newOrder.lineItems];
        newOrder.lineItems[lineIndex] = Object.assign({}, newOrder.lineItems[lineIndex]);

        const rowLength = newOrder.lineItems[lineIndex].matrixRows.length;
        if (rowLength === 1) {
          // Remove line item all together
          newOrder.lineItems[lineIndex]._destroy = true;
        }

        // Remove matrix row
        newOrder.lineItems[lineIndex].matrixRows = newOrder.lineItems[lineIndex].matrixRows.filter((_row) => {
          // Handle rows that have already been saved
          if (data.matrixUpdateId) {
            return data.matrixUpdateId !== _row.matrixUpdateId;
          }
          // Handle rows that have not yet been saved
          if (typeof data.rowIndex !== 'undefined' && data.rowIndex >= 0) {
            return data.rowIndex !== _row.rowIndex;
          }
          return true;
        });
        return { ...state, order: newOrder };
      }




      return state;
    }

    case OrderFormActionTypes.FetchVendorCustomerCurrency: {
      return {
        ...state,
        timesGettingCurrency: state.timesGettingCurrency + 1
      }
    }

    case OrderFormActionTypes.UpdateCharge: {

      if (action.chargeType === 'decoVendor') {
        const event = action.payload.event;
        const lineIndex = state.order.lineItems.findIndex((item) => item.lineItemUpdateId === event.item.lineItemUpdateId);

        if (lineIndex >= 0) {
          // Shallow clone path
          const newOrder = Object.assign({}, state.order);
          newOrder.lineItems = [...newOrder.lineItems];
          const line = Object.assign({}, newOrder.lineItems[lineIndex]);

          const decoVendors = line.decoVendors.map((decoVendor) => {
            if (decoVendor.decoVendorRecordId === event.deco.decoVendorRecordId) {
              const charges = decoVendor.addonCharges.map((charge) => {
                if (event.charge.addonChargeUpdateId === charge.addonChargeUpdateId) {
                  return { ...charge, ...event.charge };
                }
                return charge;
              });
              return { ...decoVendor, addonCharges: charges };
            }
            return decoVendor;
          });
          line.decoVendors = decoVendors;

          // Update the line
          newOrder.lineItems[lineIndex] = line;
          return { ...state, order: newOrder };
        }

      }

      const lineIndex = state.order.lineItems.findIndex((item) => item.lineItemUpdateId === action.payload.item.lineItemUpdateId);

      if (lineIndex >= 0) {
        // Shallow clone path
        const newOrder = Object.assign({}, state.order);
        newOrder.lineItems = [...newOrder.lineItems];
        const line = Object.assign({}, newOrder.lineItems[lineIndex]);

        // Mutate the charge
        line.addonCharges = line.addonCharges.map((charge) => {
          if (action.payload.charge.addonChargeUpdateId === charge.addonChargeUpdateId) {
            return { ...charge, ...action.payload.charge };
          }
          return charge;
        });
        // Update the line
        newOrder.lineItems[lineIndex] = line;
        return { ...state, order: newOrder };
      }

      return state;
    }

    case OrderFormActionTypes.AddProductsToOrder: {

      const products = action.payload.products.map((p: any) => {
        let rows;
        if (p.matrixRows && p.matrixRows.length) {
          // rows = p.matrixRows;
          rows = [];
        } else {
          rows = [
            // new MatrixRow({ quantity: 1, unitQuantity: 1, poType: 'DropShip' }).toObject()
          ];
        }

        // Apply image based on row color
        rows = rows.map((_row) => {
          const row = { ..._row };
          if (row.color) {
            const colorImage = p.MediaContent.find((media) => media.color === row.color);
            if (colorImage) {
              row.imageUrl = colorImage.url;
            }
          }
          row.fulfillments = [{ type: 'DropShip', quantity: row.quantity }];

          return row;
        });

        // Remove product details before adding line
        const { MediaContent, ProductPartArray, ProductImprintPartArray, LocationArray, ...productLine } = p;

        return {
          ...productLine,
          matrixRows: rows,
          decoVendors: [],
          addonCharges: [],
        };
      });

      const newState = {
        ...state,
        order: {
          ...state.order,
          lineItems: [...state.order.lineItems, ...products]
        }
      };

      return newState;
    }

    case OrderFormActionTypes.DuplicateLineItem: {
      const item = { ...action.payload.item };

      // Make generic
      item.lineItemUpdateId = undefined;
      item.matrixRows = item.matrixRows.map((_row) => {
        const row = { ..._row };
        row.matrixUpdateId = undefined;
        return row;
      });

      return {
        ...state
      };
    }

    case OrderFormActionTypes.ShowView: {
      return {
        ...state,
        actionView: action.payload.view
      };
    }
    case OrderFormActionTypes.UpdateCurrency: {
      return {
        ...state,
        currency: {
          ...state.currency,
          ...action.payload
        }
      }
    }
    case OrderFormActionTypes.LoadDecorationVendorsForTypeSuccess: {

      const { decoType, vendors } = action.payload;

      const decoVendorsByType = {
        ...state.decoVendorsByType
      };
      decoVendorsByType[decoType] = vendors;

      return {
        ...state,
        decoVendorsByType: decoVendorsByType
      };

    }
    default:
      return state;
  }
}

export const getOrderFormState = createFeatureSelector<State>('orderForm');

export const getOrder = createSelector(
  getOrderFormState,
  (state: State) => state.order
);

export const getOrderFields = createSelector(
  getOrderFormState,
  (state: State) => state.fields
);

export const getDesignLocations = createSelector(
  getOrderFormState,
  (state: State) => state.config && state.config.designLocations
);

export const getOrderSettings = createSelector(
  getOrderFormState,
  (state: State) => state.config && state.config.module && state.config.module.settings
);

export const getConfig = createSelector(
  getOrderFormState,
  (state: State) => state.config
);

export const getVouched = createSelector(
  getOrderFormState,
  (state: State) => state.vouched
);

export const getLoading = createSelector(
  getOrderFormState,
  (state: State) => state.loading
);

export const getSaving = createSelector(
  getOrderFormState,
  (state: State) => state.saving
);

export const getDecoVendorsByType = createSelector(
  getOrderFormState,
  (state: State) => state.decoVendorsByType
);

export const getInventoryMap = createSelector(
  getOrderFormState,
  (state: State) => state.inventoryMap
);

export const getProductMap = createSelector(
  getOrderFormState,
  (state: State) => state.productMap
);

export const getLocalFob = createSelector(
  getOrderFormState,
  (state: State) => state.localFob
);

export const getProductFobMap = createSelector(
  getOrderFormState,
  (state: State) => state.productFobMap
);

export const getOrderItems = createSelector(
  getOrderFormState,
  (state: State) => state.order.lineItems
);

export const getOrderArtProofs = createSelector(
  getOrderFormState,
  (state: State) => state.artProofs
);

export const getOrderPricing = createSelector(
  getOrderFormState,
  (state: State) => state.pricing
);

export const getOrderId = createSelector(
  getOrderFormState,
  (state: State) => state.order.id
);

export const getCurrency = createSelector(
  getOrderFormState,
  (state: State) => state.currency
);

export const getVendorCurrencies = createSelector(
  getOrderFormState,
  (state: State) => state.vendorCurrencies
);

export const getCustomerCurrencies = createSelector(
  getOrderFormState,
  (state: State) => state.customerCurrencies
);

export const currenciesUpdated = createSelector(
  getOrderFormState,
  (state: State) => {
    return {
      customerCurrencies: state.customerCurrencies,
      vendorCurrenciess: state.vendorCurrencies
    }
  }
);

export const getTimesFetchedCurrency = createSelector(
  getOrderFormState,
  (state: State) => state.timesGettingCurrency
);

import { Action } from '@ngrx/store';
import { OrderDetails, LineItem, MatrixRow, ProductDetails } from 'app/models';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ILineItem, IDecoVendor, IMatrixRow, IAddonCharge } from '../interfaces';
import { ArtProofActions } from './actions/art-proof.actions';
import { OrderFormCurrency } from './order-form.reducer';

export enum OrderFormActionTypes {
  LoadOrder = "[OrderForm] Load Order",
  LoadOrderSuccess = "[OrderForm] Load Order Success",
  LoadOrderError = "[OrderForm] Load Order Error",
  SaveOrder = "[OrderForm] Save Order",
  SaveOrderSuccess = "[OrderForm] Save Order Success",
  SaveOrderError = "[OrderForm] Save Order Error",
  AddProductsToOrder = "[OrderForm] Add Products To Order",
  AddProductsToOrderSuccess = "[OrderForm] Add Products To Order Success",
  AddProductsToOrderError = "[OrderForm] Add Products To Order Error",
  UpdateLineItem = "[OrderForm] Update LineItem",
  UpdateLineItemSuccess = "[OrderForm] Update LineItem Success",
  UpdateLineItemError = "[OrderForm] Update LineItem Error",
  DeleteLineItem = "[OrderForm] Delete Line Item",
  DeleteLineItemSuccess = "[OrderForm] Delete Line Item Success",
  DeleteLineItemError = "[OrderForm] Delete Line Item Error",
  DuplicateLineItem = "[OrderForm] Duplicate Line Item",
  UpdateMatrixRow = "[OrderForm] Update MatrixRow",
  UpdateMatrixRowSuccess = "[OrderForm] Update MatrixRow Success",
  UpdateMatrixRowError = "[OrderForm] Update MatrixRow Error",
  AddMatrixRow = "[OrderForm] Add MatrixRow",
  AddMatrixRowSuccess = "[OrderForm] Add MatrixRow Success",
  AddMatrixRowError = "[OrderForm] Add MatrixRow Error",
  ConvertMatrixRowToItem = "[OrderForm] Convert MatrixRow To Item",
  DeleteMatrixRow = "[OrderForm] Delete MatrixRow",
  DeleteMatrixRowSuccess = "[OrderForm] Delete MatrixRowSuccess",
  DeleteMatrixRowError = "[OrderForm] Delete MatrixRowError",
  DeleteMatrixRows = "[OrderForm] Delete Matrix Rows",
  DeleteMatrixRowsSuccess = "[OrderForm] Delete Matrix Rows Success",
  DeleteMatrixRowsError = "[OrderForm] Delete Matrix Rows Error",
  AddDecoration = "[OrderForm] Add Decoration",
  AddDecorationSuccess = "[OrderForm] Add Decoration Success",
  AddDecorationError = "[OrderForm] Add Decoration Error",
  UpdateDecoration = "[OrderForm] Update Decoration",
  UpdateDecorationSuccess = "[OrderForm] Update Decoration Success",
  UpdateDecorationError = "[OrderForm] Update Decoration Error",
  DeleteDecorations = "[OrderForm] Delete Decorations",
  DeleteDecorationsSuccess = "[OrderForm] Delete Decorations Success",
  DeleteDecorationsError = "[OrderForm] Delete Decorations Error",
  AddCharge = "[OrderForm] Add Charge",
  AddChargeSuccess = "[OrderForm] Add Charge Success",
  AddChargeError = "[OrderForm] Add Charge Error",
  UpdateCharge = "[OrderForm] Update Charge",
  DeleteCharge = "[OrderForm] Delete Charge",
  LoadOrderProducts = "[OrderForm] Load Products",
  LoadOrderProductsSuccess = "[OrderForm] Load Products Success",
  LoadOrderProductsError = "[OrderForm] Load Products Error",
  DeleteItemSelection = "[OrderForm] Delete Selection",
  ReorderItemDropped = "[OrderForm] Reorder Items",
  ShowView = "[OrderForm] Show View",
  AddDecorationToMatrixRow = "[OrderForm] Add Decoration To MatrixRow",
  UpdateConfig = "[OrderForm] Update Config",
  LoadOrderConfig = "[OrderForm] Load Config",
  LoadOrderConfigError = "[OrderForm] Load Config Error",
  LoadOrderConfigSuccess = "[OrderForm] Load Config Success",
  LoadOrderFields = "[OrderForm] Load Fields",
  LoadOrderFieldsSuccess = "[OrderForm] LoadOrderFieldsSuccess",
  PasteDecorations = "[OrderForm] Paste Decorations",
  PasteCharges = "[OrderForm] Paste Addon Charges",
  LoadDecorationVendorsForType = "[OrderForm] Load Decoration Vendors By Type",
  LoadDecorationVendorsForTypeSuccess = "[OrderForm] Load Decoration Vendors By Type Success",
  DeleteChargeSuccess = "DeleteChargeSuccess",
  DeleteChargeError = "DeleteChargeError",
  SaveChargeDialog = "SaveChargeDialog",
  SaveChargeDialogSuccess = "SaveChargeDialogSuccess",
  SaveChargeDialogError = "SaveChargeDialogError",
  LoadOrderPricing = "[OrderForm] Load Order Pricing",
  LoadOrderPricingSuccess = "[OrderForm] Load Order Pricing Success",
  LoadOrderPricingError = "[OrderForm] Load Order Pricing Error",
  DuplicateLineItemSuccess = "DuplicateLineItemSuccess",
  DuplicateLineItemError = "DuplicateLineItemError",
  ApplyPriceBreaks = "PriceBreakFound",
  ApplyPriceBreaksSuccess = "ApplyPriceBreaksSuccess",
  ApplyPriceBreaksError = "ApplyPriceBreaksError",
  ChangeDesignVariation = "ChangeDesignVariation",
  ChangeDesignVariationSuccess = "ChangeDesignVariationSuccess",
  ResetOrderState = "ResetOrderState",
  LoadProductInventory = "LoadProductInventory",
  LoadProductInventorySuccess = "LoadProductInventorySuccess",
  LoadOrderInventory = "LoadOrderInventory",
  LoadProduct = "LoadProduct",
  LoadProductSuccess = "LoadProductSuccess",
  LoadProductInventoryError = "LoadProductInventoryError",
  LoadProductError = "LoadProductError",
  LoadLocalWarehouses = "LoadLocalWarehouses",
  LoadLocalWarehousesSuccess = "LoadLocalWarehousesSuccess",
  LoadLocalWarehousesError = "LoadLocalWarehousesError",
  SyncTaxJar = "SyncTaxJar",
  SyncTaxJarSuccess = "SyncTaxJarSuccess",
  SyncTaxJarError = "SyncTaxJarError",
  SyncShipStationSuccess = "SyncShipStationSuccess",
  SyncShipStation = "SyncShipStation",
  SyncShipStationError = "SyncShipStationError",
  UpdateItemRows = "UpdateItemRows",
  LoadOrderArtProofs = "LoadOrderArtProofs",
  LoadOrderArtProofsSuccess = "LoadOrderArtProofsSuccess",
  LoadOrderArtProofsError = "LoadOrderArtProofsError",
  LoadOrderVouched = "[OrderForm] LoadOrderVouched",
  LoadOrderVouchedSuccess = "[OrderForm] LoadOrderVouchedSuccess",
  LoadOrderVouchedError = "[OrderForm] LoadOrderVouchedError",
  UpdateCurrency = "[OrderForm] UpdateCurrency",
  UpdateVendorCurrency = "[OrderForm] UpdateVendorCurrency",
  UpdateCustomerCurrency = "[OrderForm] UpdateCustomerCurrency",
  FetchVendorCustomerCurrency = "[OrderForm] FetchVendorCustomerCurrency",
  UpdateVendorAndCustomerCurrency = "[OrderForm] UpdateVendorAndCustomerCurrency",
  UpdateCurrencyEffects = "[OrderForm] UpdateCurrencyEffects"
}

/**
 * Remaining actions
 * 
 * Decouple from orderService
 * 
 * 
 * Form 
 *    Configuration
 *      Hide vendor information
 *      Hide cost information
 * 
 *    Quick add product
 * 
 *    Selection changes
 * 
 *      Keep selection model in sync
 * 
 * Items
 *    Vendor Notes
 *    Decoration Notes
 *    Order Notes
 *    DuplicateLine
 * 
 *    BulkOrderForm
 * 
 * Matrix Rows
 * 
 *    ConvertToLineItem
 *    Implement Pricing 
 *      Edit cost
 * 
 *    Fulfillment
 *      Set dropship warehouse
 * 
 * Decorations
 * 
 *    Issues: Cannot save decoration on line item that has not yet been saved
 * 
 *    Inline decoration form
 * 
 *    CreateDecoration   
 *    SelectDecoration
 *    ModifyDecoration
 *    AttachDecoration
 * 
 *    UpdateDecoration
 *    DeleteDecoration
 * 
 *    Copy decoration(s)
 * 
 * Charges
 * 
 *    AddCharge
 *    UpdateCharge
 *    DeleteCharge
 * 
 *    
 *    
 */

export class UpdateConfig implements Action {
  readonly type = OrderFormActionTypes.UpdateConfig;
  constructor(public payload: any, public options?: { skipEffects: boolean }) { }
}
export class ResetOrderState implements Action {
  readonly type = OrderFormActionTypes.ResetOrderState;
  constructor() { }
}

export class LoadOrder implements Action {
  readonly type = OrderFormActionTypes.LoadOrder;
  constructor(public payload: { id: string | number }) {
  }
}
export class LoadOrderSuccess implements Action {
  readonly type = OrderFormActionTypes.LoadOrderSuccess;
  constructor(public payload: OrderDetails) { }
}
export class LoadOrderError implements Action {
  readonly type = OrderFormActionTypes.LoadOrderError;
  constructor(public payload: any) { }
}

/**
 * Order Actions
 */


export class SyncTaxJar implements Action {
  readonly type = OrderFormActionTypes.SyncTaxJar;
  constructor(public payload: { id: string | number }) {
  }
}
export class SyncTaxJarSuccess implements Action {
  readonly type = OrderFormActionTypes.SyncTaxJarSuccess;
  constructor(public payload: any) { }
}
export class SyncTaxJarError implements Action {
  readonly type = OrderFormActionTypes.SyncTaxJarError;
  constructor(public payload: any) { }
}


export class SyncShipStation implements Action {
  readonly type = OrderFormActionTypes.SyncShipStation;
  constructor(public payload: { id: string | number }) {
  }
}
export class SyncShipStationSuccess implements Action {
  readonly type = OrderFormActionTypes.SyncShipStationSuccess;
  constructor(public payload: any) { }
}
export class SyncShipStationError implements Action {
  readonly type = OrderFormActionTypes.SyncShipStationError;
  constructor(public payload: any) { }
}


/**
 * Load local warehouses
 */

export class LoadLocalWarehouses implements Action {
  readonly type = OrderFormActionTypes.LoadLocalWarehouses;
  constructor() { }
}
export class LoadLocalWarehousesSuccess implements Action {
  readonly type = OrderFormActionTypes.LoadLocalWarehousesSuccess;
  constructor(public payload: any) { }
}

export class LoadLocalWarehousesError implements Action {
  readonly type = OrderFormActionTypes.LoadLocalWarehousesError;
  constructor(public payload: any) { }
}



/**
 * Load product
 */

export class LoadProduct implements Action {
  readonly type = OrderFormActionTypes.LoadProduct;
  constructor(public productId: string) { }
}
export class LoadProductSuccess implements Action {
  readonly type = OrderFormActionTypes.LoadProductSuccess;
  constructor(public payload: any) { }
}

export class LoadProductError implements Action {
  readonly type = OrderFormActionTypes.LoadProductError;
  constructor(public payload: any) { }
}

/**
 * Load Order Products
 */
export class LoadOrderProducts implements Action {
  readonly type = OrderFormActionTypes.LoadOrderProducts;
  constructor() { }
}
export class LoadOrderProductsSuccess implements Action {
  readonly type = OrderFormActionTypes.LoadOrderProductsSuccess;
  constructor(payload: any) { }
}

export class LoadOrderProductsError implements Action {
  readonly type = OrderFormActionTypes.LoadOrderProductsError;
  constructor(payload: any) { }
}

/**
 * Load inventory for all products on an order
 */
export class LoadOrderInventory implements Action {
  readonly type = OrderFormActionTypes.LoadOrderInventory;
  constructor() { }
}


/**
 * Load product inventory
 */
export class LoadProductInventory implements Action {
  readonly type = OrderFormActionTypes.LoadProductInventory;
  constructor(public product: Partial<ProductDetails>, public color?: string) { }
}

export class LoadProductInventorySuccess implements Action {
  readonly type = OrderFormActionTypes.LoadProductInventorySuccess;
  constructor(public payload: any, public product: Partial<ProductDetails>) { }
}
export class LoadProductInventoryError implements Action {
  readonly type = OrderFormActionTypes.LoadProductInventoryError;
  constructor(public payload: any, public product: Partial<ProductDetails>) { }
}

export class LoadOrderPricing implements Action {
  readonly type = OrderFormActionTypes.LoadOrderPricing;
  constructor(public payload: { id: string | number }) {
  }
}
export class LoadOrderPricingSuccess implements Action {
  readonly type = OrderFormActionTypes.LoadOrderPricingSuccess;
  constructor(public payload: OrderDetails) { }
}
export class LoadOrderPricingError implements Action {
  readonly type = OrderFormActionTypes.LoadOrderPricingError;
  constructor(public payload: any) { }
}

export class LoadOrderVouched implements Action {
  readonly type = OrderFormActionTypes.LoadOrderVouched;
  constructor(public payload: { id: string | number }) {
  }
}
export class LoadOrderVouchedSuccess implements Action {
  readonly type = OrderFormActionTypes.LoadOrderVouchedSuccess;
  constructor(public payload: any) { }
}
export class LoadOrderVouchedError implements Action {
  readonly type = OrderFormActionTypes.LoadOrderVouchedError;
  constructor(public payload: any) { }
}

export class UpdateItemRows implements Action {
  readonly type = OrderFormActionTypes.UpdateItemRows;
  constructor(public item: LineItem, public payload: Partial<MatrixRow>) { }
}

export class ApplyPriceBreaks implements Action {
  readonly type = OrderFormActionTypes.ApplyPriceBreaks;
  constructor(public payload: any) { }
}
export class ApplyPriceBreaksSuccess implements Action {
  readonly type = OrderFormActionTypes.ApplyPriceBreaksSuccess;
  constructor(public payload: any) { }
}
export class ApplyPriceBreaksError implements Action {
  readonly type = OrderFormActionTypes.ApplyPriceBreaksError;
  constructor(public payload: any) { }
}

export class SaveOrder implements Action {
  readonly type = OrderFormActionTypes.SaveOrder;
  constructor(public payload: Partial<OrderDetails>) {
  }
}
export class SaveOrderSuccess implements Action {
  readonly type = OrderFormActionTypes.SaveOrderSuccess;
  constructor(public payload: OrderDetails) { }
}
export class SaveOrderError implements Action {
  readonly type = OrderFormActionTypes.SaveOrderError;
  constructor(public payload: any) { }
}


// Matrix Row
export class AddMatrixRow implements Action {
  readonly type = OrderFormActionTypes.AddMatrixRow;
  constructor(public payload: { lineItemUpdateId: string | number }) {
  }
}

export class AddMatrixRowSuccess implements Action {
  readonly type = OrderFormActionTypes.AddMatrixRowSuccess;
  constructor(public payload: OrderDetails) { }
}

export class AddMatrixRowError implements Action {
  readonly type = OrderFormActionTypes.AddMatrixRowError;
  constructor(public payload: any) { }
}

export class UpdateMatrixRow implements Action {
  readonly type = OrderFormActionTypes.UpdateMatrixRow;
  constructor(public payload: { row: MatrixRow, lineItemUpdateId: string; valid: boolean }) {
  }
}

export class DeleteMatrixRow implements Action {
  readonly type = OrderFormActionTypes.DeleteMatrixRow;
  constructor(public payload: { row: MatrixRow, item: LineItem }) {
  }
}

export class DeleteMatrixRows implements Action {
  readonly type = OrderFormActionTypes.DeleteMatrixRows;
  constructor(public payload: { ids: string[], rows: Partial<MatrixRow>[] }) { }
}

export class DeleteMatrixRowsSuccess implements Action {
  readonly type = OrderFormActionTypes.DeleteMatrixRowsSuccess;
  constructor(public payload: any, public action: DeleteMatrixRows) {
  }
}

export class DeleteMatrixRowsError implements Action {
  readonly type = OrderFormActionTypes.DeleteMatrixRowsError;
  constructor(public payload: any, public action: DeleteMatrixRows) {
  }
}

export class ConvertMatrixRowToItem implements Action {
  readonly type = OrderFormActionTypes.ConvertMatrixRowToItem;
  constructor(public payload: { item: LineItem, row: MatrixRow }) {
  }
}

// Decorations 

export class AddDecoration implements Action {
  readonly type = OrderFormActionTypes.AddDecoration;
  constructor(public payload: any) { }
}

export class AddDecorationSuccess implements Action {
  readonly type = OrderFormActionTypes.AddDecorationSuccess;
  constructor(public payload: any) { }
}
export class AddDecorationError implements Action {
  readonly type = OrderFormActionTypes.AddDecorationError;
  constructor(public payload: any) { }
}

export class UpdateDecoration implements Action {
  readonly type = OrderFormActionTypes.UpdateDecoration;
  constructor(public payload: any) {
  }
}

export class UpdateDecorationSuccess implements Action {
  readonly type = OrderFormActionTypes.UpdateDecorationSuccess;
  constructor(public payload: OrderDetails, public action: UpdateDecoration) { }
}

export class UpdateDecorationError implements Action {
  readonly type = OrderFormActionTypes.UpdateDecorationError;
  constructor(public payload: any, public action: UpdateDecoration) { }
}

export class DeleteDecorations implements Action {
  readonly type = OrderFormActionTypes.DeleteDecorations;
  constructor(public payload: { orderId: string; lineItemId: string; ids: string[] }) {
  }
}

export class DeleteDecorationsSuccess implements Action {
  readonly type = OrderFormActionTypes.DeleteDecorationsSuccess;
  constructor(public payload: any, public action: DeleteDecorations) { }
}

export class DeleteDecorationsError implements Action {
  readonly type = OrderFormActionTypes.DeleteDecorationsError;
  constructor(public payload: any, public action: DeleteDecorations) { }
}


export class PasteDecorations implements Action {
  readonly type = OrderFormActionTypes.PasteDecorations;
  constructor(public payload: { sourceItem: LineItem, sourceRow: MatrixRow, decoSelection: IDecoVendor[], itemRowsSelection: IMatrixRow[] }) { }
}

export class PasteCharges implements Action {
  readonly type = OrderFormActionTypes.PasteCharges;
  constructor(public payload: { sourceCharges: IAddonCharge[], targetRows: IMatrixRow[] }) { }
}

export class ChangeDesignVariation implements Action {
  readonly type = OrderFormActionTypes.ChangeDesignVariation;
  constructor(public payload: { deco: IDecoVendor, designsToModify: any; item: LineItem; row: MatrixRow }) { }
}
export class ChangeDesignVariationSuccess implements Action {
  readonly type = OrderFormActionTypes.ChangeDesignVariationSuccess;
  constructor(public payload: any) { }
}
export class ChangeDesignVariationError implements Action {
  readonly type = OrderFormActionTypes.ChangeDesignVariationSuccess;
  constructor(public payload: any) { }
}

// Line items
export class UpdateLineItem implements Action {
  readonly type = OrderFormActionTypes.UpdateLineItem;
  constructor(public payload: any) {
  }
}

export class ReorderItemDropped implements Action {
  readonly type = OrderFormActionTypes.ReorderItemDropped;
  constructor(public payload: LineItem[]) {
  }
}

export class DeleteLineItem implements Action {
  readonly type = OrderFormActionTypes.DeleteLineItem;
  constructor(public payload: { ids: string[] }) {
  }
}

export class DeleteLineItemSuccess implements Action {
  readonly type = OrderFormActionTypes.DeleteLineItemSuccess;
  constructor(public payload: any) { }
}

export class DeleteLineItemError implements Action {
  readonly type = OrderFormActionTypes.DeleteLineItemError;
  constructor(public payload: any) { }
}

export class DuplicateLineItem implements Action {
  readonly type = OrderFormActionTypes.DuplicateLineItem;
  constructor(public payload: { item: LineItem }) {
  }
}
export class DuplicateLineItemSuccess implements Action {
  readonly type = OrderFormActionTypes.DuplicateLineItemSuccess;
  constructor(public payload: any) {
  }
}
export class DuplicateLineItemError implements Action {
  readonly type = OrderFormActionTypes.DuplicateLineItemError;
  constructor(public payload: any) {
  }
}

// Charges
export class UpdateCharge implements Action {
  readonly type = OrderFormActionTypes.UpdateCharge;
  constructor(public payload: any, public chargeType: string = 'item') {
  }
}

export class SaveChargeDialog implements Action {
  readonly type = OrderFormActionTypes.SaveChargeDialog;
  constructor(public payload: any) { }
}
export class SaveChargeDialogSuccess implements Action {
  readonly type = OrderFormActionTypes.SaveChargeDialogSuccess;
  constructor(public payload: any) { }
}
export class SaveChargeDialogError implements Action {
  readonly type = OrderFormActionTypes.SaveChargeDialogError;
  constructor(public payload: any) { }
}

export class DeleteCharge implements Action {
  readonly type = OrderFormActionTypes.DeleteCharge;
  constructor(public payload: {
    orderId: string;
    lineItemUpdateId: string;
    addonChargeUpdateIds: string;
  }) { }
}
export class DeleteChargeSuccess implements Action {
  readonly type = OrderFormActionTypes.DeleteChargeSuccess;
  constructor(public payload: any) { }
}
export class DeleteChargeError implements Action {
  readonly type = OrderFormActionTypes.DeleteChargeError;
  constructor(public payload: any) { }
}


// Bulk actions
export class DeleteSelection implements Action {
  readonly type = OrderFormActionTypes.DeleteItemSelection;
  constructor(public payload: { selection: any }) {
  }
}

// Add Products To Order
export class AddProductsToOrder implements Action {
  readonly type = OrderFormActionTypes.AddProductsToOrder;
  constructor(public payload: { products: LineItem[] }) {
  }
}

export class AddProductsToOrderSuccess implements Action {
  readonly type = OrderFormActionTypes.AddProductsToOrderSuccess;
  constructor(public payload: OrderDetails) { }
}

export class AddProductsToOrderError implements Action {
  readonly type = OrderFormActionTypes.AddProductsToOrderError;
  constructor(public payload: any) { }
}

export class ShowView implements Action {
  readonly type = OrderFormActionTypes.ShowView;
  constructor(public payload: { view: string, data: any }) {
  }
}

export class LoadOrderConfig implements Action {
  readonly type = OrderFormActionTypes.LoadOrderConfig;
}
export class LoadOrderFields implements Action {
  readonly type = OrderFormActionTypes.LoadOrderFields;
}
export class LoadOrderFieldsSuccess implements Action {
  readonly type = OrderFormActionTypes.LoadOrderFieldsSuccess;
  constructor(public payload: any[]) { }
}

export class LoadOrderArtProofs implements Action {
  readonly type = OrderFormActionTypes.LoadOrderArtProofs;
  constructor(public payload: { id: string }) { }
}

export class LoadOrderArtProofsSuccess implements Action {
  readonly type = OrderFormActionTypes.LoadOrderArtProofsSuccess;
  constructor(public payload: any) { }
}
export class LoadOrderArtProofsError implements Action {
  readonly type = OrderFormActionTypes.LoadOrderArtProofsError;
  constructor(public payload: any) { }
}


export class LoadDecorationVendorsForType implements Action {
  readonly type = OrderFormActionTypes.LoadDecorationVendorsForType;
  constructor(public payload: { decoType: string }) { }
}
export class LoadDecorationVendorsForTypeSuccess implements Action {
  readonly type = OrderFormActionTypes.LoadDecorationVendorsForTypeSuccess;
  constructor(public payload: { decoType: string; vendors: any[] }) { }
}

//** Update Currency */
export class UpdateCurrency implements Action {
  readonly type = OrderFormActionTypes.UpdateCurrency;
  constructor(public payload: { [key: string]: any }) {}
}

export class UpdateCustomerCurrency implements Action {
  readonly type = OrderFormActionTypes.UpdateCustomerCurrency;
  constructor(public payload: { [key: string]: any }) {}
}

export class UpdateVendorCurrency implements Action {
  readonly type = OrderFormActionTypes.UpdateVendorCurrency;
  constructor(public payload: { [key: string]: any }) {}
}

export class UpdateVendorAndCustomerCurrency implements Action {
  readonly type = OrderFormActionTypes.UpdateVendorAndCustomerCurrency;
  constructor(public payload: IUpdateVendorCustomer) {}
}

export class UpdateCurrencyEffects implements Action {
  readonly type = OrderFormActionTypes.UpdateCurrencyEffects;
  constructor(public payload: ICurrencyUpdateEffects) { }
}

export class FetchVendorCustomerCurrency implements Action {
  readonly type = OrderFormActionTypes.FetchVendorCustomerCurrency;
  constructor(public payload: any) {}
}

export interface IUpdateVendorCustomer {
  vendorCurrencies: { [key: string]: string };
  customerCurrencies: { [key: string]: string };
}

export interface ICurrencyUpdateEffects {
  vendorCurrencies: { [key: string]: string };
  customerCurrencies: { [key: string]: string };
  costBreaks: any;
  priceBreaks: any;
}



//** */



export type OrderFormActions =
  ResetOrderState |
  LoadOrder | LoadOrderSuccess | LoadOrderError |
  LoadOrderPricing | LoadOrderPricingSuccess | LoadOrderPricingError |
  LoadOrderVouched | LoadOrderVouchedSuccess | LoadOrderVouchedError |
  SyncTaxJar | SyncTaxJarSuccess | SyncTaxJarError |
  SyncShipStation | SyncShipStationSuccess | SyncShipStationError |
  ApplyPriceBreaks | ApplyPriceBreaksSuccess | ApplyPriceBreaksError |
  SaveOrder | SaveOrderSuccess | SaveOrderError |
  ReorderItemDropped | UpdateLineItem |
  DeleteLineItem | DeleteLineItemSuccess | DeleteLineItemError |
  UpdateItemRows |
  AddMatrixRow | AddMatrixRowSuccess | AddMatrixRowError | UpdateMatrixRow | DeleteMatrixRow |
  DeleteMatrixRows | DeleteMatrixRowsSuccess | DeleteMatrixRowsError |
  DuplicateLineItem |
  LoadLocalWarehouses | LoadLocalWarehousesSuccess | LoadLocalWarehousesError |
  LoadProduct | LoadProductSuccess | LoadProductError |
  LoadProductInventory | LoadProductInventorySuccess | LoadProductInventoryError |
  AddDecoration | AddDecorationSuccess | AddDecorationError |
  UpdateDecoration | UpdateDecorationSuccess | UpdateDecorationError |
  DeleteDecorations | DeleteDecorationsSuccess | DeleteDecorationsError |
  LoadDecorationVendorsForType | LoadDecorationVendorsForTypeSuccess |
  PasteDecorations | PasteCharges |
  ChangeDesignVariation |
  LoadOrderArtProofs | LoadOrderArtProofsError | LoadOrderArtProofsSuccess |
  SaveChargeDialog | SaveChargeDialogSuccess | SaveChargeDialogError | UpdateCharge |
  ShowView |
  LoadOrderConfig | LoadOrderFields | LoadOrderFieldsSuccess |
  UpdateConfig |
  AddProductsToOrder | AddProductsToOrderSuccess | AddProductsToOrderError |
  UpdateCurrency |
  UpdateCustomerCurrency |
  UpdateVendorCurrency |
  FetchVendorCustomerCurrency |
  UpdateVendorAndCustomerCurrency |
  UpdateCurrencyEffects |
  ArtProofActions;

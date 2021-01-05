import { BaseModel } from './base-model';
import { IMatrixRow } from 'app/features/e-commerce/order-form/interfaces';

export class MatrixRow extends BaseModel implements IMatrixRow {
    matrixUpdateId: string;
    size: string;
    color: string;
    imageUrl: string;
    quantity: number;
    isMatrixVouched: boolean;
    reqMinOrderQty: number;
    unitQuantity: number;
    uomId: number;
    uomConversionRatio: number;
    uomAbbreviation: string;
    price: number;
    origPrice: number;
    totalPrice: number;
    cost: number;
    costStrategy?: string;
    priceStrategy?: string;
    origCost: number;
    totalCost: number;
    profit: number;
    commRate: string;
    IsCommChanged: string;
    commValue: string;
    poType: string;
    onHand: string;
    itemSku: string;
    taxValue: number;
    taxOff: string;
    gstTaxRateOnPo: string;
    gstTaxTotalOnPo: string;
    chargeGstTaxOnPo: string;
    decorationType: string;
    decorationData: string;
    inventoryReceived: string;
    inventoryReceivedQty: string;
    warehouse: string;
    uniqueLineItemId: string;
    productMargin: string;
    custInventoryReceivedQty: string;
    custInventoryReceived: string;
    distributorWarehouseId: string;
    rowIndex: number;
    fulfillments: any[];
    calculatorData?: any;
    adminFeeCost: number;
    totalCostIncludingAdminFee: number;
    adminFeeUnitCost: number;
    unitCostIncludingAdminFee: number;

    constructor(mrow) {
        super();

        this.setData(mrow);
    }

    setData(mrow) {
        this.setString(mrow, 'matrixUpdateId');
        this.setString(mrow, 'size');
        this.setString(mrow, 'color');
        this.setString(mrow, 'imageUrl');
        this.setInt(mrow, 'quantity');
        this.setInt(mrow, 'unitQuantity');
        this.setInt(mrow, 'uomId');
        this.setInt(mrow, 'uomConversionRatio');
        this.setFloat(mrow, 'price');
        this.setFloat(mrow, 'origPrice');
        this.setFloat(mrow, 'totalPrice');
        this.setFloat(mrow, 'cost');
        this.setFloat(mrow, 'origCost');
        this.setFloat(mrow, 'totalCost');
        this.setFloat(mrow, 'profit');
        this.setString(mrow, 'costStrategy');
        this.setString(mrow, 'priceStrategy');
        this.setFloat(mrow, 'commRate');
        this.setBoolean(mrow, 'isCommChanged');
        this.setFloat(mrow, 'commValue');
        this.setFloat(mrow, "reqMinOrderQty");
        this.setBoolean(mrow, "isMatrixVouched");
        this.setString(mrow, 'poType');
        this.setString(mrow, 'onHand');
        this.setString(mrow, 'uom');
        this.setString(mrow, 'itemSku');
        this.setFloat(mrow, 'taxValue');
        this.setBoolean(mrow, 'taxOff');
        this.setString(mrow, 'gstTaxRateOnPo');
        this.setString(mrow, 'gstTaxTotalOnPo');
        this.setBoolean(mrow, 'chargeGstTaxOnPo');
        this.setString(mrow, 'decorationType');
        this.setString(mrow, 'decorationData');
        this.setBoolean(mrow, 'inventoryReceived');
        this.setInt(mrow, 'inventoryReceivedQty');
        this.setString(mrow, 'warehouse');
        this.setString(mrow, 'uniqueLineItemId');
        this.setFloat(mrow, 'productMargin');
        this.setInt(mrow, 'custInventoryReceivedQty');
        this.setBoolean(mrow, 'custInventoryReceived');
        this.setInt(mrow, 'distributorWarehouseId');
        this.setInt(mrow, 'rowIndex');
        this.setArray(mrow, 'fulfillments');
        this.setFloat(mrow, 'adminFeeCost');
        this.setFloat(mrow, 'adminFeeUnitCost');
        this.setFloat(mrow, 'totalCostIncludingAdminFee');
        this.setFloat(mrow, 'unitCostIncludingAdminFee');
        if (mrow.calculatorData && mrow.calculatorData.length) {
            this.calculatorData = mrow.calculatorData;
        }
    }

    toPayload() {
        return {
            ...this.toObject(),
            IsCommChanged: this.toBitString(this.IsCommChanged),
            taxOff: this.toBitString(this.taxOff),
            chargeGstTaxOnPo: this.toBitString(this.chargeGstTaxOnPo),
            inventoryReceived: this.toBitString(this.inventoryReceived),
            custInventoryReceived: this.toBitString(this.custInventoryReceived)
        }
    }
}

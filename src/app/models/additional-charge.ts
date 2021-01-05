import { BaseModel } from './base-model';


export const DefaultChargeTypes = [
    'Default',
    'Freight',
];
export class AdditionalCharge extends BaseModel {
    addonChargeUpdateId = '';
    name = '';
    code = '';
    id = '';
    description = '';
    quantity = 0;
    cost = 0;
    totalCost = 0;
    price = 0;
    totalPrice = 0;
    itemTax = 0;
    itemTaxOff = false;
    discount = 0;
    commValue = 0;
    isCommissionEnabled = false;
    isDiscountEnabled = false;
    showAddonCharges = true;
    exactorSku = '';
    decoParentLineNo = 0;
    productSequence = 0;
    decoParentMappedId = '';
    artworkData = '';
    artworkDesignId = '';
    matchOrderQty = false;
    chargeType = '';
    addonChargesType = '';
    addonChargesId = '';
    gstTaxRateOnPo = 0;
    gstTaxTotalOnPo = 0;
    chargeGstTaxOnPo = false;
    rollbackDistributeRows = 0;
    adminFeeCost = 0;
    totalCostIncludingAdminFee =  0;
    adminFeeUnitCost = 0;
    unitCostIncludingAdminFee = 0;
    
    
    constructor(data?) {
        super();

        if (data) {
            this.setData(data);
        }
    }

    setData(data) {
        this.setString(data, 'addonChargeUpdateId');
        this.setString(data, 'id', this.addonChargeUpdateId);
        this.setString(data, 'name');
        this.setString(data, 'code');
        this.setString(data, 'chargeType');
        this.setString(data, 'addonChargesType');
        this.setString(data, 'addonChargesId');
        this.setString(data, 'description');
        this.setInt(data, 'quantity', 1);
        this.setFloat(data, 'cost');
        this.setFloat(data, 'totalCost');
        this.setFloat(data, 'price');
        this.setFloat(data, 'totalPrice');
        this.setFloat(data, 'adminFeeCost');
        this.setFloat(data, 'totalCostIncludingAdminFee');
        this.setFloat(data, 'adminFeeUnitCost');

        if (typeof data.taxable !== 'undefined')  {
            this.setBoolean(data, 'taxable');
            this.itemTax = data.taxable == "1" ? 1 : 0;
            this.itemTaxOff = data.taxable == "1" ? false : true;
        } else {
            this.setFloat(data, 'itemTax');
            this.setBoolean(data, 'itemTaxOff');
        }

        this.setFloat(data, 'discount');
        this.setFloat(data, 'commValue');
        this.setBoolean(data, 'isCommissionEnabled');
        this.setBoolean(data, 'isDiscountEnabled');
        this.setBoolean(data, 'showAddonCharges');
        this.setBoolean(data, 'matchOrderQty');
        this.setString(data, 'exactorSku');
        this.setInt(data, 'decoParentLineNo');
        this.setInt(data, 'productSequence');
        this.setString(data, 'decoParentMappedId');
        this.setString(data, 'artworkData');
        this.setString(data, 'artworkDesignId');
        this.setString(data, 'gstTaxRateOnPo');
        this.setString(data, 'gstTaxTotalOnPo');
        this.setBoolean(data, 'chargeGstTaxOnPo');        
        this.setBoolean(data, 'rollbackDistributeRows');        
    }

    static fromCharge(data) {
        return new AdditionalCharge({
            isCommissionEnabled: data.commissionable,
            addonChargesId: data.id,
            chargeType: data.chargeType,
            addonChargesType: data.addonChargesType,
            cost: data.cost,
            description: data.description,
            isDiscountEnabled: data.discountable,
            displayOrder: data.displayOrder,
            expenseAccount: data.expenseAccount,
            id: data.id,
            incomeAccount: data.incomeAccount,
            item: data.item,
            code: data.itemCode,
            name: data.name,
            price: data.price,
            showAddonCharges: data.showToCustomer,
            itemTaxOff: !data.taxable,
            itemTax: data.taxable,
            taxable: data.taxable,
            gstTaxRateOnPo: data.gstTaxRateOnPo,
            gstTaxTotalOnPo: data.gstTaxTotalOnPo,
            chargeGstTaxOnPo: data.chargeGstTaxOnPo,
        });
    }
}

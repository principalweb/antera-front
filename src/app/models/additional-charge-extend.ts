import { BaseModel } from './base-model';
import { TaxCategory } from './tax-category';

export class AdditionalCharge extends BaseModel {
    id: string;
    name: string;
    description: string;
    cost: number;
    price: number;
    item: string;
    itemCode: string;
    displayOrder: number;
    showToCustomer: boolean;
    incomeAccount: string;
    expenseAccount: string;
    taxable: boolean;
    discountable: boolean;
    commissionable: boolean;
    dateCreated: Date;
    dateModified: Date;
    createdByName: string;
    createdById: string;
    modifiedByName: string;
    modifiedById: string;
    addonChargesType: string;
    chargeType: string;
    addonChargesId: string;
    status: boolean;
    rollbackDistributeRows: boolean;
    chargeGstTaxOnPo: boolean;
    taxJarObj: TaxCategory;

    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'name');
        this.setString(data, 'description');
        this.setFloat(data, 'cost');
        this.setFloat(data, 'price');
        this.setString(data, 'item');
        this.setString(data, 'itemCode');
        this.setInt(data, 'displayOrder');
        this.setBoolean(data, 'showToCustomer');
        this.setString(data, 'incomeAccount');
        this.setString(data, 'expenseAccount');
        this.setBoolean(data, 'taxable');
        this.setBoolean(data, 'discountable');
        this.setBoolean(data, 'commissionable');
        this.setString(data, 'addonChargesType');
        this.setString(data, 'chargeType');
        this.setString(data, 'addonChargesId');
        this.setDate(data, 'dateCreated');
        this.setDate(data, 'dateModified');
        this.setString(data, 'createdByName');
        this.setString(data, 'createdById');
        this.setString(data, 'modifiedByName');
        this.setString(data, 'modifiedById');
        this.setBoolean(data, 'rollbackDistributeRows');
        this.setBoolean(data, 'chargeGstTaxOnPo');
        this.setBoolean(data, 'status');
        this.setObject(data.taxJarObj, 'taxJarObj', TaxCategory);
    }
}

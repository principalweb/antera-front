import { BaseModel } from './base-model';
import * as moment from 'moment';

export class ProductConfig extends BaseModel {
  rollAddonChargesToProduct: boolean;
  rollDecoChargesToProduct: boolean;
  rollDecoAddonChargesToProduct: boolean;
  allowParentKitCalc: boolean;
  chargeSalesTax: boolean;
  chargeGstTaxOnPo: boolean;
  payCommission: boolean;
  hideLine: boolean;
  overrideInHandDate: boolean;
  inhandDate: Date;
  fiscalYearStart: string;
  gstNumberForInvoice: string;
  abnNumberForInvoice: string;
  generateWorkOrderBy: string;
  alternateShipToAccountId: string;
  alternateShipToAccount: string;
  vouchingRequired: boolean;
  vouchingShowSupplierDecorated: boolean;
  invReceiptRequired: boolean;
  enableAdminFee: boolean;
  showTaxJarTaxBreakup: boolean;
  enableCreditLimitCheck: boolean;
  showPackigListByVendor: boolean;
  enableDefaultGridView: boolean;
  debugOrderDetails: boolean;
  enableOrderCache: boolean;
  enableAddonProductPricing: boolean;

  // Extended params for System Admin
  defaultTaxRate: string;
  defaultGstRateOnPo: string;
  productsMargin: number;
  decoMargin: number;
  defaultDecorationPriceLogic: string;
  shippingMargin: number;
  enableGrossProfit: boolean;
  identityEnabled: boolean;
  cxmlEnabled: boolean;
  poDoc: string;
  dubowEnabled: boolean;
  lockInvoicedOrders: boolean;
  lockVouchedOrders: boolean;
  defaultToSupplierDecorated: boolean;
  enableOrderFormV2: boolean;
  forceOrderFormV2: boolean;
  enableGstOnPo: boolean;
  enableArtProof: boolean;
  defaultStoreOrderStatus: string;
  enableReportsUploadingToCloud: boolean;
  defaultProductCostStrategy: string;
  defaultProductPriceStrategy: string;

  defaultDecorationCostStrategy: string;
  defaultDecorationPriceStrategy: string;

  setData(data) {
    this.setBoolean(data, 'rollAddonChargesToProduct');
    this.setBoolean(data, 'rollDecoChargesToProduct');
    this.setBoolean(data, 'rollDecoAddonChargesToProduct');
    this.setBoolean(data, 'allowParentKitCalc');
    this.setBoolean(data, 'chargeSalesTax');
    this.setBoolean(data, 'chargeGstTaxOnPo');
    this.setBoolean(data, 'payCommission');
    this.setBoolean(data, 'hideLine');
    this.setBoolean(data, 'overrideInHandDate');
    this.setString(data, 'alternateShipToAccountId');
    this.setString(data, 'alternateShipToAccount');
    this.setBoolean(data, 'vouchingRequired');
    this.setBoolean(data, 'vouchingShowSupplierDecorated');
    this.setBoolean(data, 'invReceiptRequired');
    this.setBoolean(data, 'enableAdminFee');
    this.setBoolean(data, 'showTaxJarTaxBreakup');
    this.setBoolean(data, 'enableCreditLimitCheck');
    this.setBoolean(data, 'showPackigListByVendor');
    this.setBoolean(data, 'enableDefaultGridView');
    this.setBoolean(data, 'debugOrderDetails');
    this.setBoolean(data, 'enableOrderCache');
    this.setBoolean(data, 'enableAddonProductPricing');

    // Extended params for System Admin
    this.setString(data, 'defaultTaxRate');
    this.setInt(data, 'productsMargin');
    this.setInt(data, 'decoMargin');
    this.setString(data, 'defaultDecorationPriceLogic');
    this.setInt(data, 'shippingMargin');
    this.setBoolean(data, 'enableGrossProfit');
    this.setBoolean(data, 'identityEnabled');
    this.setString(data, 'poDoc');
    this.setBoolean(data, 'cxmlEnabled');
    this.setBoolean(data, 'dubowEnabled');
    this.setBoolean(data, 'lockInvoicedOrders');
    this.setBoolean(data, 'lockVouchedOrders');
    this.setBoolean(data, 'defaultToSupplierDecorated');
    this.setBoolean(data, 'enableOrderFormV2');
    this.setBoolean(data, 'enableArtProof');
    this.setBoolean(data, 'forceOrderFormV2');
    this.setBoolean(data, 'enableGstOnPo');
    this.setBoolean(data, 'enableReportsUploadingToCloud');
    this.setString(data, 'defaultGstRateOnPo');

    this.setString(data, 'defaultProductCostStrategy');
    this.setString(data, 'defaultProductPriceStrategy');

    this.setString(data, 'defaultDecorationCostStrategy');
    this.setString(data, 'defaultDecorationPriceStrategy');
    this.setString(data, 'defaultStoreOrderStatus');
    this.setString(data, 'fiscalYearStart');
    this.setString(data, 'gstNumberForInvoice');
    this.setString(data, 'abnNumberForInvoice');
    this.setString(data, 'generateWorkOrderBy');

    // set workflow items to be automatically vouched
    this.setBoolean(data, 'workflowAutoVouch');

    if (data.inhandDate) {
      this.inhandDate = new Date(data.inhandDate);
    } else {
      this.inhandDate = new Date();
    }

  }

  toObject() {
    return {
      ...super.toObject(),
      inhandDate: moment(this.inhandDate).format('YYYY-MM-DD'),
    }
  }
}

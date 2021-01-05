import { BaseModel } from './base-model';

export class DecorationCharge extends BaseModel {
  decorationCode: string;
  decoratorSubType: string;
  decoratorType: string;
  id: string;
  name: string;
  price: string;
  quantityUpto: string;
  qunatityStart: string;
  salePrice: string;
  setupCharge: string;
  setupChargeSalePrice: string;
  stitchesUpto: string;
  vendorId: string;
  stitchesStart: string;
  vendorName: string;
  decorationDetail: string;
  addonCharges: any[];

  setData(data) {
      this.setString(data, 'decorationCode');
      this.setString(data, 'decoratorSubType');
      this.setString(data, 'decoratorType');
      this.setString(data, 'id');
      this.setString(data, 'name');
      this.setString(data, 'price');
      this.setString(data, 'quantityUpto');
      this.setString(data, 'qunatityStart');
      this.setString(data, 'salePrice');
      this.setString(data, 'setupCharge');
      this.setString(data, 'setupChargeSalePrice');
      this.setString(data, 'stitchesUpto');
      this.setString(data, 'vendorId');
      this.setString(data, 'stitchesStart');
      this.setString(data, 'vendorName');
      this.setString(data, 'decorationDetail');
      this.setArray(data, 'addonCharges');
  }
}

export class DecorationChargeDetails extends BaseModel {

    id: string;
    name: string;
    dateEntered: string;
    dateModified: string;
    modifiedUserId: string;
    createdBy: string;
    description: string;
    assignedUserId: string;
    vendorId: string;
    vendorName: string;
    price: string;
    currencyId: string;
    stitchesStart: string;
    stitchesUpto: string;
    decoratorType: string;
    decoratorSubType: string;
    qunatityStart: string;
    quantityUpto: string;
    decorationCode: string;
    priority: string;
    rank: string;
    showClient: string;
    setupCharge: string;
    salePrice: string;
    setupChargeSalePrice: string;
    incomeAccount: string;
    expenseAccount: string;
    taxable: string;
    commissionable: string;
    discountable: string;
    identifier: string;
    decorationDetail: string;
    addonCharges: any[];

    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'name');
        this.setDate(data, 'dateEntered');
        this.setString(data, 'dateModified');
        this.setString(data, 'modifiedUserId');
        this.setString(data, 'createdBy');
        this.setString(data, 'description');
        this.setString(data, 'assignedUserId');
        this.setString(data, 'vendorId');
        this.setString(data, 'vendorName');
        this.setString(data, 'price');
        this.setString(data, 'currencyId');
        this.setString(data, 'stitchesStart');
        this.setString(data, 'stitchesUpto');
        this.setString(data, 'decoratorType');
        this.setString(data, 'decoratorSubType');
        this.setString(data, 'qunatityStart');
        this.setString(data, 'quantityUpto');
        this.setString(data, 'decorationCode');
        this.setString(data, 'priority');
        this.setString(data, 'rank');
        this.setString(data, 'showClient');
        this.setString(data, 'setupCharge');
        this.setString(data, 'salePrice');
        this.setString(data, 'setupChargeSalePrice');
        this.setString(data, 'incomeAccount');
        this.setString(data, 'expenseAccount');
        this.setString(data, 'taxable');
        this.setString(data, 'commissionable');
        this.setString(data, 'discountable');
        this.setString(data, 'identifier');
        this.setString(data, 'decorationDetail');
        this.setArray(data, 'addonCharges');
    }
}

export class ProductDecoDetail
{
    id:string;
    productId:string;
    designId:string;
    customerId:string;
    location:string;
    autoAttach:boolean;
    rollPrice:boolean;
    show:boolean;
    preDecorated:boolean;
    store:string;
    mapping:any[];
    supplierDeco:boolean;
    supplierDecoId:string;
}

export class ProductDecoDesigns
{
    id:string;
    model:string;
    name:string;
    customerId:string;
    customerName:string;
}

export class ProductDecoCustomerList
{
    customerId:string;
    customerName:string;
}

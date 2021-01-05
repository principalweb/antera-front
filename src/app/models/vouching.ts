import { BaseModel } from './base-model';
import { ApCreditAllocationLog } from './ap-credit';

export class VouchingDetails extends BaseModel {
  id: string;
  orders: any[];
  vendorId: string;
  vendorName: string;
  invoiceNo: string;
  notes: string;
  poAmount: number;
  creditAmount: number;
  invoiceAmount: number;
  paidAmount: number;
  totalTaxOnPo: number;
  balanceAmount: number;
  createdByName: string;
  createdById: string;
  modifiedByName: string;
  modifiedById: string;
  dateCreated: Date;
  dateModified: Date;
  invoiceDate: Date;
  dueDate: Date;
  lines: VouchingLines[];
  credits: ApCreditAllocationLog[];

  setData(data) {
      this.setString(data, 'id');
      this.setString(data, 'orders');
      this.setString(data, 'vendorId');
      this.setString(data, 'vendorName');
      this.setString(data, 'invoiceNo');
      this.setString(data, 'notes');
      this.setFloat(data, 'poAmount');
      this.setFloat(data, 'paidAmount');
      this.setFloat(data, 'totalTaxOnPo');
      this.setFloat(data, 'balanceAmount');
      this.setString(data, 'createdByName');
      this.setString(data, 'createdById');
      this.setString(data, 'modifiedByName');
      this.setString(data, 'modifiedById');
      this.setDate(data, 'dateCreated');
      this.setDate(data, 'dateModified');
      this.setDate(data, 'invoiceDate');
      this.setDate(data, 'dueDate');
      this.setFloat(data, 'creditAmount');
      this.setFloat(data, 'invoiceAmount');
      this.lines = data.lines;
      this.credits = data.credits;
  }
}

export class VouchingList extends BaseModel {
  id: string;
  invoiceNumber: string;
  vouchedDate: string;
  paidAmount: string;
  totalTaxOnPo: string;
}

export class VouchingLines extends BaseModel {
  id: string;
  quantity: string;
  price: string;
  name: string;
  total: string;
  credit: string;
  type: string;
  lineId: string;
  parentId: string;
  recordId: string;
  productId: string;
  sku: string;
  color: string;
  size: string;
  image: string;
  taxRateOnPo: string;
  taxTotalOnPo: string;
  matrixUpdatedIds: string[];
}

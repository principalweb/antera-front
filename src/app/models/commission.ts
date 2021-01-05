import { BaseModel } from './base-model';

export class Commission extends BaseModel {
  id: string;
  name: string;
  dateEntered: Date;
  dateModified: Date;
  description: string;
  assignedSalesRep: string;
  assignedSalesRepId: string;
  orderGP: number;
  profitTarget: number;
  profitPercent: number;
  revenue: number;
  revenueTarget: number;
  cap: number;
  calulationType: string;
  paidOnPaid: boolean;
  createdByName: string;
  createdById: string;
  modifiedByName: string;
  modifiedById: string;
  netProfitPercent: number;

  setData(data) {
      this.setString(data, 'id');
      this.setString(data, 'name');
      this.setDate(data, 'dateEntered');
      this.setDate(data, 'dateModified');
      this.setString(data, 'description');
      this.setString(data, 'assignedSalesRep');
      this.setString(data, 'assignedSalesRepId');
      this.setFloat(data, 'orderGP');
      this.setFloat(data, 'profitTarget');
      this.setFloat(data, 'profitPercent');
      this.setFloat(data, 'revenue');
      this.setFloat(data, 'revenueTarget');
      this.setFloat(data, 'cap');
      this.setString(data, 'calulationType');
      this.setBoolean(data, 'paidOnPaid');
      this.setString(data, 'createdByName');
      this.setString(data, 'createdById');
      this.setString(data, 'modifiedByName');
      this.setString(data, 'modifiedById');
      this.setFloat(data, 'netProfitPercent');
  }
}

import { BaseModel } from './base-model';

export class EmailTemplate extends BaseModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  bodyHtml: string;
  assignedSalesRep: string;
  assignedSalesRepId: string;
  createdByName: string;
  createdById: string;
  modifiedByName: string;
  modifiedById: string;
  dateEntered: string;
  dateModified: string;
  ccEmail: string;
  bccEmail: string;

  setData(data) {
    this.setString(data, 'id');
    this.setString(data, 'slug');
    this.setString(data, 'name');
    this.setString(data, 'description');
    this.setString(data, 'assignedSalesRep');
    this.setString(data, 'assignedSalesRepId');
    this.setString(data, 'createdByName');
    this.setString(data, 'createdById');
    this.setString(data, 'modifiedByName');
    this.setString(data, 'modifiedById');
    this.setString(data, 'dateEntered');
    this.setString(data, 'dateModified');
    this.setString(data, 'subject');
    this.setString(data, 'body');
    this.setString(data, 'bodyHtml');
    this.setString(data, 'bccEmail');
    this.setString(data, 'ccEmail');
    this.setBoolean(data, 'textOnly');
  }
}

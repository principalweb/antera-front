import { BaseModel } from './base-model';

export class CommissionGroup extends BaseModel {
  id: string;
  name: string;
  dateEntered: Date;
  dateModified: Date;
  createdByName: string;
  createdById: string;
  modifiedByName: string;
  modifiedById: string;

  setData(data) {
      this.setString(data, 'id');
      this.setString(data, 'name');
      this.setDate(data, 'dateEntered');
      this.setDate(data, 'dateModified');
      this.setString(data, 'createdByName');
      this.setString(data, 'createdById');
      this.setString(data, 'modifiedByName');
      this.setString(data, 'modifiedById');
  }
}

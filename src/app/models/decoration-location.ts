import { BaseModel } from './base-model';

export class DecorationLocation extends BaseModel {
    id: string;
    dateEntered: Date;
    dateModified: Date;
    locationName: string;
    description: string;
    displayOrder: string;
    createdByName: string;
    createdById: string;
    modifiedByName: string;
    modifiedById: string;
    locationImage: string;
    locationHexColor: string;

    setData(data) {
        this.setString(data, 'id');
        this.setDate(data, 'dateEntered');
        this.setDate(data, 'dateModified');
        this.setString(data, 'locationName');
        this.setString(data, 'description');
        this.setString(data, 'displayOrder');
        this.setString(data, 'createdByName');
        this.setString(data, 'createdById');
        this.setString(data, 'modifiedByName');
        this.setString(data, 'modifiedById');
        this.setString(data, 'locationImage');
        this.setString(data, 'locationHexColor');
    }
}

export class DecorationLocationDetails extends BaseModel {
  id: string;
  dateEntered: Date;
  dateModified: Date;
  locationName: string;
  description: string;
  createdByName: string;
  createdById: string;
  modifiedByName: string;
  modifiedById: string;
  displayOrder: number;
  locationImage: string;
  locationHexColor: string;

  setData(data) {
      this.setString(data, 'id');
      this.setDate(data, 'dateEntered');
      this.setDate(data, 'dateModified');
      this.setString(data, 'locationName');
      this.setString(data, 'description');
      this.setString(data, 'createdByName');
      this.setString(data, 'createdById');
      this.setString(data, 'modifiedByName');
      this.setString(data, 'modifiedById');
      this.setInt(data, 'displayOrder');
      this.setString(data, 'locationImage');
      this.setString(data, 'locationHexColor');
  }
}
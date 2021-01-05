import { BaseModel } from "./base-model";

export class RelatedAccount extends BaseModel {
    accountName: string;
    billState: string;
    dateCreated: Date;
    id: string;
    partnerType: string;
    phone: string;
    portalAccessLevel: string;
    portalAllowedStatus: string[];
    salesRep: string;
    shipState: string;
    displayWithOthers: string;
    setData(ra){
        this.setString(ra, "accountName");
        this.setString(ra, "billState");
        this.setDate(ra, "dateCreated");
        this.setString(ra, "id");
        this.setString(ra, "partnerType");
        this.setString(ra, "phone"),
        this.setString(ra, "portalAccessLevel");
        this.setArray(ra, "portalAllowedStatus");
        this.setString(ra, "salesRep");
        this.setString(ra, "shipState");
        this.setString(ra, "displayWithOthers");
    }
}

export interface IRelatedAccount {
  accountName: string;
  billState: string;
  dateCreated: Date;
  id: string;
  partnerType: string;
  phone: string;
  portalAccessLevel: string;
  portalAllowedStatus: string[];
  salesRep: string;
  shipState: string;
  displayWithOthers: string;
}
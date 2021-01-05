import { BaseModel } from './base-model';

export class Shipping extends BaseModel {
    
    id: string;
    orderId: string;
    vendorId: string;
    shippingMethod: string;
    trackNumber: string;
    shipDate: Date;
    dateShipped: Date;
    arrivalDate: Date;
    inhandsDate: Date;
    note: string;
    shippingAccount: string;
    weight: number;
    promoStandRes: string;
    createdBy: string;
    dateCreated: Date;
    modifiedBy: string;
    dateModified: Date;

    setData(data) {
        this.setString(data, 'id');
        this.setString(data, 'orderId');
        this.setString(data, 'vendorId');
        this.setString(data, 'shippingMethod');
        this.setString(data, 'trackNumber');
        this.setDate(data, 'shipDate');
        this.setDate(data, 'dateShipped');
        this.setDate(data, 'arrivalDate');
        this.setDate(data, 'inhandsDate');
        this.setString(data, 'note');
        this.setString(data, 'shippingAccount');
        this.setFloat(data, 'weight');
        this.setString(data, 'promoStandRes');
        this.setString(data, 'createdBy');
        this.setDate(data, 'dateCreated');
        this.setString(data, 'modifiedBy');
        this.setDate(data, 'dateModified');
    }

    updateShipping (form: any) {
        this.id = form.id;
        this.orderId = form.orderId;
        this.vendorId = form.vendorId;
        this.shippingMethod = form.shippingMethod;
        this.trackNumber = form.trackNumber;
        this.shipDate = form.shipDate;
        this.dateShipped = form.dateShipped;
        this.arrivalDate = form.arrivalDate;
        this.inhandsDate = form.inhandsDate;
        this.note = form.note;
        this.shippingAccount = form.shippingAccount;
        this.weight = form.weight;
        this.promoStandRes = form.promoStandRes;
        this.createdBy = form.createdBy;
        this.dateCreated = form.dateCreated;
        this.modifiedBy = form.modifiedBy;
        this.dateModified = form.dateModified;
    }
}

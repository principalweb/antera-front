import { FuseUtils } from '@fuse/utils';

export class Location
{
    id: string;
    companyName: string;
    contact: string;
    deliveryContact: string;
    deliveryContactId: string;
    salesRep: string;
    salesRepId: string;
    locationName: string;
    phoneOffice: string;
    locationType: string;
    phoneFax: string;

    description: string;
    accounts: string;
    billingAddressStreet2: any;
    billingAddressStreet: any;
    billingAddressState: any;
    billingAddressPostalcode: any;
    billingAddressCountry: any;
    billingAddressCity: any;
    shippingAddressCity: any;
    shippingAddressCountry: any;
    shippingAddressPostalcode: any;
    shippingAddressState: any;
    shippingAddressStreet: any;
    shippingAddressStreet2: any;

    constructor(location) {
        {
            this.id = location.id || FuseUtils.generateGUID();
            this.companyName = location.companyName || '';
            this.contact = location.contact || '';
            this.deliveryContact = location.deliveryContact || '';
            this.deliveryContact = location.deliveryContactId || '';
            this.salesRep = location.salesRep || '';
            this.salesRepId = location.salesRepId || '';
            this.locationName = location.locationName || '';
            this.phoneOffice = location.phoneOffice || '';
            this.locationType = location.locationType || '';
            this.phoneFax = location.phoneFax || '';
            this.shippingAddressStreet = location.shippingAddressStreet || '';
            this.shippingAddressStreet2 = location.shippingAddressStreet2 || '';
            this.shippingAddressCity = location.shippingAddressCity || '';
            this.shippingAddressState = location.shippingAddressState || '';
            this.shippingAddressPostalcode = location.shippingAddressPostalcode || '';
            this.shippingAddressCountry = location.shippingCountry || '';
            this.billingAddressStreet = location.billingAddressAddress1 || '';
            this.billingAddressStreet2 = location.billingAddressAddress2 || '';
            this.billingAddressCity = location.billingAddressCity || '';
            this.billingAddressState = location.billingAddressState || '';
            this.billingAddressPostalcode = location.billingAddressPostalcode || '';
            this.billingAddressCountry = location.billingAddressCountry || '';
            this.description = location.description || '';
            this.accounts = location.accounts || '';
        }
    }
}

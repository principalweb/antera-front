import { FuseUtils } from '@fuse/utils';

export class Contact
{
    id: string;
    salutation: string;
    firstName: string;
    lastName: string;
    title: string;
    department: string;
    reportsTo: string;
    reportsToId: string;
    shippingType: string;
    shippingAcctNumber: string;
    salesRep: string;
    salesRepId: string;
    phone: string;
    fax: string;
    generalInfo: string;
    shipAddress1: string;
    shipAddress2: string;
    shipCity: string;
    shipState: string;
    shipPostalcode: string;
    shipCountry: string;
    billAddress1: string;
    billAddress2: string;
    billCity: string;
    billState: string;
    billPostalcode: string;
    billCountry: string;
    email: string;
    additionalEmail1: string;
    additionalEmail2: string;
    dateCreated: string;
    dateModified: string;
    leadSource: string;
    phoneMobile: string;
    commissionGroupId: any;
    commissionGroupName: any;
    brandAffiliation: any;
    salesManagerId: any;
    salesManagerName: any;
    annualBudget: any;
    leadsMerchandiseInterest: any;
    leadsContactType: any;
    leadsChannel: any;

    constructor(contact)
    {
        this.id = contact.id || '';
        this.salutation = contact.salutation || '';
        this.firstName = contact.firstName || '';
        this.lastName = contact.lastName || '';
        this.title = contact.title || '';
        this.department = contact.department || '';
        this.reportsTo = contact.reportsTo || '';
        this.reportsToId = contact.reportsToId || '';
        this.shippingType = contact.shippingType || '';
        this.shippingAcctNumber = contact.shippingAcctNumber || '';
        this.salesRep = contact.salesRep || '';
        this.phone = contact.phone || '';
        this.fax = contact.fax || '';
        this.generalInfo = contact.generalInfo || '';
        this.shipAddress1 = contact.shipAddress1 || '';
        this.shipAddress2 = contact.shipAddress2 || '';
        this.shipCity = contact.shipCity || '';
        this.shipState = contact.shipState || '';
        this.shipPostalcode = contact.shipPostalcode || '';
        this.shipCountry = contact.shipCountry || '';
        this.billAddress1 = contact.billAddress1 || '';
        this.billAddress2 = contact.billAddress2 || '';
        this.billCity = contact.billCity || '';
        this.billState = contact.billState || '';
        this.billPostalcode = contact.billPostalcode || '';
        this.billCountry = contact.billCountry || '';
        this.email = contact.email || '';
        this.additionalEmail1 = contact.additionalEmail1 || '';
        this.additionalEmail2 = contact.additionalEmail2 || '';
        this.dateCreated = contact.dateCreated || '';
        this.dateModified = contact.dateModified || '';
        this.salesRepId = contact.salesRepId || '';
        this.leadSource = contact.leadSource || '';
        this.phoneMobile = contact.phoneMobile || '';
        this.commissionGroupId = contact.commissionGroupId || '';
        this.commissionGroupName = contact.commissionGroupName || '';
        this.brandAffiliation = contact.brandAffiliation || '';
        this.salesManagerId = contact.salesManagerId || '';
        this.salesManagerName = contact.salesManagerName || '';
        this.annualBudget = contact.annualBudget || '';
        this.leadsMerchandiseInterest = contact.leadsMerchandiseInterest;
        this.leadsContactType = contact.leadsContactType;
        this.leadsChannel = contact.leadsChannel;
    }
}

export class ContactListItem {
    id: string;
    contactName: string;
    title: string;
    city: string;
    state: string;
    leadSource: string;
    phone: string;
    email: string;
    salesRep: string;
    dateCreated: string;
    dateModified: string;
    accountName: string;

    constructor(contact) {
        this.id = contact.id || FuseUtils.generateGUID();
        this.contactName = contact.contactName || '';
        this.title = contact.title || '';
        this.city = contact.city || '';
        this.state = contact.state || '';
        this.leadSource = contact.leadSource || '';
        this.phone = contact.phone || '';
        this.email = contact.email || '';
        this.salesRep = contact.salesRep || '';
        this.dateCreated = contact.dateCreated || '';
        this.dateModified = contact.dateModified || '';
        this.accountName = contact.accountName || '';
    }
}

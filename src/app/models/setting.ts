import { FuseUtils } from '@fuse/utils';
export class PsCompany
{
    code: string;
    enabled: string;
    name: string;
    type: string;
}
export class PsCreds
{
    username: string;
    password: string;
    country: string;
    enabled: boolean;
    poEnabled: boolean;
    poLive: boolean;
    poShipMap: any[];
}
export class PsEndpoint
{
    Service: {
        ServiceType: {
            Code:string,
            Name:string,
        },
        Status:string,
        Version:string,
        WSDL:string
    };
    TestURL:string;
    URL:string;

}
export class SanmarCreds
{
    id: string;
    api_type: string;
    extra: string;
    username: string;
    pass: string;
    enableIncentive: boolean;
}
export class XeroCreds
{
    InvItemExpenseAccountId:string;
    InvItemIncomeAccountId:string;
    // adjust increase debit
    aiDebit: string;
    aiCredit: string;
    // receipt debit
    rDebit: string;
    rCredit: string;
    // vouching debit
    vDebit: string;
    vCredit: string;
    // adjust decrease debit
    adDebit: string;
    adCredit: string;
    // sales debit
    sDebit: string;
    sCredit: string;
    SrvItemExpenseAccountId: string;
    SrvItemIncomeAccountId: string;
    NonInvItemExpenseAccountId: string;
    NonInvItemIncomeAccountId: string;
    IncludeOrderIdInPurchaseOrderMemo: boolean;
    NoZeroAmountItemsInPO: boolean;
    BillRollAddCharge: boolean;
    PurchaseLineDescForProductMatrix: string;
    PurchaseLineDescForAddCharge: string;
    IncludeSalesRepEmailToInvoice: boolean;
    NoZeroAmountItemsInInvoice: boolean;
    SalesLineDescForProductMatrix: string;
    SalesLineDescForAddCharge: string;
    PaymentReceiveAccount: string;
    CreditPaymentReceiveAccount: string;
    RefundFromAccount: string;
    numberDecimalValue: string;
    enableGST: boolean;
    enableIndependentPayments: boolean;
    disableRolling: boolean;
}
export class QboCreds
{
    EnableAnteraContactToQboCustomer:boolean;
    ItemIdentifierProperty1:string;
    InvItemExpenseAccountId:string;
    InvItemIncomeAccountId:string;
    // adjust increase debit
    aiDebit: string;
    aiCredit: string;
    // receipt debit
    rDebit: string;
    rCredit: string;
    // vouching debit
    vDebit: string;
    vCredit: string;
    // adjust decrease debit
    adDebit: string;
    adCredit: string;
    // sales debit
    sDebit: string;
    sCredit: string;
    SrvItemExpenseAccountId:string;
    SrvItemIncomeAccountId:string;
    NonInvItemExpenseAccountId:string;
    NonInvItemIncomeAccountId:string;
    IncludeOrderIdInPurchaseOrderMemo:boolean;
    NoZeroAmountItemsInPO:boolean;
    BillRollAddCharge:boolean;
    PurchaseLineDescForProductMatrix:string;
    PurchaseLineDescForAddCharge:string;
    IncludeSalesRepEmailToInvoice:boolean;
    NoZeroAmountItemsInInvoice:boolean;
    EnableAnteraUserToQboDepartment:boolean;
    SalesLineDescForProductMatrix:string;
    SalesLineDescForAddCharge:string;
    PaymentReceiveAccount: string;
    CreditPaymentReceiveAccount: string;
    RefundFromAccount: string;
    ContinueOnPaymentLinkingError: boolean;
    qboNumberDecimalValue:string;
    enableGST:boolean;
    enableGSTUsa:boolean;
    gstGl:string;
    hstGl:string;
    pstGl:string;
    pstbcGl:string;
    qstGl:string;
    rstGl:string;
    enableQbTax:boolean;
    enableIndependentPayments:boolean;
    disableRolling:boolean;
    vouchingTemporaryCostAccount: string;
    billBankAccount: string;
}
export class DubowCreds
{
    live:boolean;
    customerNumber:string;
    userId:string;
    password:string;
    poShipMap:any[];
}
export class CxmlCreds
{
    CrmDomain: string;
    CrmIdentity: string;
    CrmAgent: string;
    CustomerDomain: string;
    CustomerIdentity: string;
    SenderDomain: string;
    SenderIdentity: string;
    CustomerAgent: string;
    Secret: string;
    InvoiceUrl: string;
    AsnUrl: string;
    AttachDecoration: boolean;
    ZeroDecoration: boolean;
    MergeInvoiceDeco: boolean;
    SkuToPartId: boolean;
    DefaultPOWarehosue: string;
}
export class QboCustomerCreds
{
    Enabled: boolean;
    Live: boolean;
    EnableGl: boolean;
}
export class XeroCustomerCreds
{
    Enabled: boolean;
}
export class AsiCreds
{
    id:string;
    asi_id:string;
    clientKey:string;
    clientSecret:string;
    enabled:boolean;
    isLive:boolean;
    username:string;
    userpass:string;
}
export class TaxjarCreds
{
    enabled:boolean;
    createTransaction:boolean;
    autoTaxCalc:boolean;
    apiKey:string;
}
export class Partner
{
    id:string;
    name:string;
}
export class PartnerDetail
{
    id:string;
    name:string;
    clientCompany:string;
    clientStreet:string;
    clientCity:string;
    clientState:string;
    clientPostalcode:string;
    clientCountry:string;
    clientPhone:string;
    clientWebsite:string;
    altLogo: string;
}
export class Identity
{
    id:string;
    name:string;
}
export class IdentityDetail
{
    id:string;
    name:string;
    billingStreet:string;
    billingCity:string;
    billingState:string;
    billingPostalcode:string;
    billingCountry:string;
    shippingStreet:string;
    shippingCity:string;
    shippingState:string;
    shippingPostalcode:string;
    shippingCountry:string;
    phone:string;
    logo:string;
    altLogo: string;
}

export class ProductSettings
{
    defaultPoType: string;
    sageDesc: boolean;
    asiDesc: boolean;
    dcDesc: boolean;
    inventoryEnabled: boolean;
    kitEnabled: boolean;
    autoCatEnabled: boolean;
    forceCategory: boolean;
    showTax: boolean;
}
export class ShipStationCreds
{
    enabled:boolean;
    apiKey:string;
    apiSecret:string;
    noOfDaysToDelivery:string;
    doNotAddPrice:boolean;
    bookingOrderNotSentShipStation:boolean;
}

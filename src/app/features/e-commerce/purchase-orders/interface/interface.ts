export interface PurchaseOrder {
    id: string;
    currency: string;
    label: string;
    modified: string;
    number: string;
    adjustedTotalAmount: number;
    advancePaymentAmount: number;
    created: Date;
    fob: string;
    salesAmount: number;
    shippingAmount: number;
    source: string;
    sourceRequest: string;
    status: string;
    tax: number;
    taxType: string;
    terms: string;
    totalAmount: number;
    type: string;
    hidden: number;
    vendor: string;
    vendorId: string;
    taxInformation?: TaxInformation;
    contactInformation?: PurchaseOrderContactInformation[];
    lineItems?: LineItem[];
    inhandDate: Date;
    vendorTerms: string;
    vendorNotes: string;
    poNotes: string;
}

export interface TaxInformation {
    taxExempt: number,
    taxId: string,
    taxJurisdiction: string,
    taxType: string
}

export interface PurchaseOrderContactInformation {
    type: string;
    name: string;
    number: string;
    accountId: string;
    accountName: string;
    addressLines: Array<string>;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    serviceEndpoint: string;
    transportMethod: string;
    comments: string;
    region: string;
}

export interface PurchaseNeed {
    id: number;
    productId: number;
    name: string;
    description: string;
    supplierProductId: string;
    sku: string;
    uom: number;
    quantityNeeded: number;
    quantityOrdered: number;
    estimatedUnitCost: number;
    actualUnitCost: number;
    type: string;
    vendorId: string;
    refLineItemId: string;
    refSalesOrderId: string;
    vendor: string;
    customer: string;
    customerId: string;
    countProduct: number;
    status: string; 
    parentId: number;
    refDesignId: string;
    refSalesOrderNo: string;
    inhouseId: string;
    dueDate: string;
    color: string;
    size: string;
    rank: number;
}

export interface LineItem {
    id: string;
    quantity: number;
    unitPrice: number;
    extendedPrice: number;
    uom: string;
    description: string;
    supplierProductId: string;
    supplierProductPartId: string | null;
    customerProductId: string;
    customerProductVariation: string | null;
    sequence1: number;
    parentId: string | null;
    lineGroup: string;
    refSalesOrderId: string;
    refSalesOrderLineItemId: string;
    type: string;
    status: string;
    config: {
        image: string;
    };
    shipInfo: ShipInfo;
}

export interface CreatePurchaseOrderFromNeed {
    type: string;
    vendorId: string;
    vendor: string;
    poDate: Date;
    lineItems: CreatePOLineItem[]
}

export interface CreatePOLineItem {
    needId: number;
    changedQty: number;
    changeCost: number;
}

export interface ShipInfo {
    id: string;
    purchaseOrderId: string;
    type: string;
    name: string;
    number: string;
    accountId: string;
    accountName: string;
    addressLines: string[];
    city: string;
    state: string;
    postalCode: string;
    country: string;
    region: string;
    phone: string;
    email: string;
    serviceEndpoint: string;
    transportMethod: string;
    comments: string;
}
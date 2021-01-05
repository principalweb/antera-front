import { UomDetails } from 'app/models/uom';

export interface ICorporateIdentity {
    id: string;
    name: string;
    billingStreet: string;
    billingCity: string;
    billingState: string;
    billingPostalcode: string;
    billingCountry: string;
    shippingStreet: string;
    shippingCity: string;
    shippingState: string;
    shippingPostalcode: string;
    shippingCountry: string;
    phone: string;
    logo: string;
}

export class PriceStrategies {
    public static readonly MANUAL = 'MANUAL';
    public static readonly PRICE_BREAK = 'PRICE_BREAK';
    public static readonly PROFIT_MARGIN = 'PROFIT_MARGIN';
}

export class CostStrategies {
    public static readonly MANUAL = 'MANUAL';
    public static readonly PRICE_BREAK = 'PRICE_BREAK';
}

export interface IMatrixRow {
    calculatorData?: any;
    priceStrategy?: string;
    costStrategy?: string;
    matrixUpdateId: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
    origPrice: number;
    totalPrice: number;
    cost: number;
    origCost: number;
    totalCost: number;
    profit: number;
    commRate: string;
    IsCommChanged: string;
    commValue: string;
    poType: string;
    isMatrixVouched?: boolean;
    reqMinOrderQty?: number;
    onHand: string;
    uomId: number;
    uomAbbreviation: string;
    uomConversionRatio: number;
    unitQuantity: number;
    itemSku: string;
    taxValue: number;
    taxOff: string;
    decorationType: string;
    decorationData: string;
    inventoryReceived: string;
    inventoryReceivedQty: string;
    warehouse: string;
    uniqueLineItemId: string;
    productMargin: string;
    custInventoryReceivedQty: string;
    custInventoryReceived: string;
    distributorWarehouseId?: string;
    distributorWarehouseName?: string;
    imageUrl: string;
    totalPriceInfo?: string;
    AddonChargesRollBackTotalPrice?: number;
    matrixDecoPriceAdjust?: number;
    matrixDecoACPriceAdjustArray?: number;
    adminFeeCost: number;
    adminFeeUnitCost: number;
    totalCostIncludingAdminFee: number;
    unitCostIncludingAdminFee: number;
    fulfillments: any[]
    rowIndex?: number; // Required to update row that hasn't been saved
    _destroy?: number; // Is the item marked for destroy
}

export interface IAddonCharge {
    addonChargeUpdateId: string;
    name: string;
    code: string;
    description: string;
    quantity: string;
    cost: string;
    totalCost: number;
    price: string;
    totalPrice: number;
    itemTax: string;
    itemTaxOff: string;
    discount: string;
    commValue: string;
    isCommissionEnabled: string;
    isDiscountEnabled: string;
    showAddonCharges: string;
    exactorSku: string;
    decoParentLineNo: string;
    productSequance: string;
    decoParentMappedId: string;
    artworkData: string;
    artworkDesignId: string;
    matchOrderQty: string;
}

export interface IDesignColorThreadPm {
    Description: any;
    No: number;
    Color: string;
    ThreadPMS: string;
}

export interface IDecoDesignVariation {
    design_variation_unique_id: string;
    design_variation_title: string;
    itemImage: string[];
    itemImageThumbnail: string[];
    design_variation_product: string;
    design_variation_color: string;
    design_variation_location: string;
    design_note: string;
    design_color_thread_pms: IDesignColorThreadPm[];
    decoImprintVariation: string;
    decoImprintVariationSerial: string;
}

export interface IDecorationDetail {
    decoDetailId: string;
    matrixId: string;
    decoVendorRecordId: string;
    decoProductItemCode: string;
    decoProductItemNo: string;
    decoProductName: string;
    decoProductQty: string;
    decoProductSize: string;
    decoProductColor: string;
    decoImprints: string;
    decoLocation: string;
    decoLogoSize: string;
    decoDescription: string;
    decoColor: string;
    decoUnderbasePrint: string;
    decoDesignVariation: IDecoDesignVariation;
    decoMoreImprints: string;
    variationImages: string[];
    variationImagesThumbnail?: string[];
    variationUniqueId: string;
}

export interface IAddonCharge2 {
    chargeGstTaxOnPo: any;
    addonChargesType?: any;
    addonChargesId?: any;
    addonChargeUpdateId: string;
    name: string;
    code: string;
    description: string;
    quantity: string;
    cost: string;
    totalCost: number;
    price: string;
    totalPrice: number;
    itemTax: string;
    itemTaxOff: string;
    discount: string;
    commValue: string;
    isCommissionEnabled: string;
    isDiscountEnabled: string;
    showAddonCharges: string;
    exactorSku: string;
    decoParentLineNo: string;
    productSequance: string;
    decoParentMappedId: string;
    artworkData: string;
    artworkDesignId: string;
    matchOrderQty: string;
    decoVendorRecordId: string;
    rollbackDistributeRows: string;
    adminFeeCost: string;
    totalCostIncludingAdminFee: string;
}

export interface IPoShippingBillingDetails {
    billingCompanyName: string;
    billingCustomerName: string;
    billingStreet: string;
    billingStreet2: string;
    billingCity: string;
    billingState: string;
    billingPostalcode: string;
    billingCountry: string;
    billingPhone: string;
    shippingCompanyName: string;
    shippingCustomerName: string;
    shippingStreet: string;
    shippingStreet2: string;
    shippingCity: string;
    shippingState: string;
    shipPostalcode: string;
    shipCountry: string;
    shippingPhone: string;
}

export interface IDecoVendor {
    variationId?: string;
    decoVendorRecordId: string;
    vendorName: string;
    vendorNo: string;
    vendorId: string;
    decorationVendorName: string;
    decorationVendorId: string;
    decoType: string;
    decoTypeName: string;
    decoChargeId: string;
    decoChargeName: string;
    designId: string;
    designModal: string;
    designName: string;
    decoStatus: string;
    designImages: string[];
    designImagesThumbnail: string[];
    variationImages: string[];
    variationImagesThumbnail: string[];
    customerDescription: string;
    vendorDescription: string;
    decorationNotes: string;
    decoLocation: string;
    sourceDecorationId: string;
    sourceLocationId: string;
    quantity: string;
    customerPrice: string;
    origCustomerPrice: string;
    totalPrice: number;
    itemCost: string;
    origItemCost: string;
    totalCost: number;
    profit: number;
    costStrategy?: string;
    priceStrategy: string;
    commRate: string;
    IsCommChanged: string;
    commAmount: string;
    poType: string;
    onHand: string;
    uom: string;
    itemSku: string;
    itemTax: number;
    itemTaxOff: string;
    vouchingStatus: string;
    vendorSupplierDecorated: string;
    isDecoVouched: string;
    decorationDetails: IDecorationDetail[];
    addonCharges: IAddonCharge2[];
    poShippingBillingDetails: IPoShippingBillingDetails;
    adminFeeCost: number;
    adminFeeUnitCost: number;
    exchageRateForCustomer: string;
    exchageRateForVendor: string;
    fromCurrenyCode: string;
    fromCurrencySymbol: string;
    totalCostIncludingAdminFee: number;
    unitCostIncludingAdminFee: number;
    isGeneralNote: string;
    doNotIssuePo: string;
    designDynamicNotes: string;
}

export interface IPoShippingBillingDetails2 {
    billingCompanyName: string;
    billingCustomerName: string;
    billingStreet: string;
    billingStreet2: string;
    billingCity: string;
    billingState: string;
    billingPostalcode: string;
    billingCountry: string;
    billingPhone: string;
    shippingCompanyName: string;
    shippingCustomerName: string;
    shippingStreet: string;
    shippingStreet2: string;
    shippingCity: string;
    shippingState: string;
    shipPostalcode: string;
    shipCountry: string;
    shippingPhone: string;
}

export interface ILineItem {
    uomId: any;
    id: string;
    lineItemUpdateId: string;
    productId: string;
    vendorId: string;
    vendorName: string;
    vendorNo: string;
    itemCode: string;
    itemNo: string;
    itemName: string;
    uom: string;
    itemSku: string;
    quantity: string;
    stitches: string;
    priceType: string;
    price: string;
    origPrice: string;
    totalPrice: number;
    cost: string;
    origCost: string;
    totalCost: number;
    profit: number;
    commRate: string;
    isCommChanged: string;
    commValue: string;
    itemTax: string;
    customerDescription: string;
    vendorDescription: string;
    addonColorSize: string;
    shipTo: string;
    shipToId: string;
    shipDate: string;
    inhandDate: string;
    shipVendor: string;
    shipAccountNo: string;
    cloudArtworkLinks: string;
    cloudArtworkNames: string;
    otherMemo: string;
    otherMemoType: string;
    waiveProof: string;
    productName: string;
    lineType: string;
    hideLine: string;
    dropDown: string;
    isDescriptionForCustomer: string;
    accountCode: string;
    incomeAccount: string;
    expenseAccount: string;
    assetAccountCode: string;
    lineItemType: string;
    uniqeId: string;
    poType: string;
    lineItemVendorMargin: string;
    isChargesPulled: string;
    lineItemNote: string;
    hideMatrix: string;
    quoteCustomImage: string[];
    showFullDescription: string;
    showFullDescriptionOC: string;
    exactorSku: string;
    itemTaxOff: string;
    uomSetRef: string;
    sequenceStart: string;
    sequenceEnd: string;
    inhouseId: string;
    supplierOrder: string;
    supplierOrderCopied: string;
    customerNetPrice: string;
    discount: string;
    separatePO: string;
    isPOP: string;
    decorationType: string;
    decorationData: string;
    invoiceIndividually: string;
    showAttribSize: string;
    showAttribColor: string;
    showAttribDecoration: string;
    deocoratorName: string;
    deocoratorDesc: string;
    inventoryReceived: string;
    customMargin: string;
    inventoryReceivedQty: string;
    warehouse: string;
    warehouseList: string;
    isKitParent: string;
    isKitChild: string;
    poTerms: string;
    lineItemImage: string;
    defaultImageRemoved: string;
    addToProduct: string;
    rollDecoChargesToProduct: string | number;
    rollAddonChargesToProduct: string | number;
    rollDecoAddonChargesToProduct: string | number;
    chargeSalesTax: string;
    payCommission: string;
    modifiedPriceBreaks: any;
    dropDeadDate: string;
    lineItemLocationsList: string;
    discountRate: string;
    decoExpenseAccount: string;
    decoIncomeAccount: string;
    uniqueId: string;
    lockPrice: string;
    lockCost: string;
    productMargin: string;
    customerCannedMsgPulled: string;
    poCannedMsgPulled: string;
    product_image_color_map: string;
    decoChargesId: string;
    promoStandardIsTopRowPulled: string;
    storeLineNo: string;
    isSanmarProduct: string;
    rebate: string;
    custInventoryReceivedQty: string;
    custInventoryReceived: string;
    decoMargin: string;
    returnToDistributor: string;
    overrideInHandDate: string;
    alternateShipToAccountId: string;
    alternateShipToAccount: string;
    vendorPONote: string;
    vouchingStatus: string;
    matrixRows: IMatrixRow[];
    isItemVouched: string;
    addonCharges: IAddonCharge[];
    decoVendors: IDecoVendor[];
    productPOType: string;
    poShippingBillingDetails: IPoShippingBillingDetails2;
    ExtraTotalPrice: number;
    ExtraTotalCost: number;
    ExtraProfit: number;
    fulfillments: any[];
    _destroy?: boolean;
}

export interface IOrder {
    id: string;
    orderNo: string;
    webStoreOrderId: string;
    invoiceNo?: any;
    orderIdentity: string;
    orderType: string;
    orderStatus: string;
    orderDate: string;
    dueDate: string;
    creditTerms: string;
    salesPerson: string;
    salesPersonId: string;
    salesPersonPhone: string;
    salesPersonEmail: string;
    csrName?: any;
    csrPhone?: any;
    csrEmail?: any;
    customerPo: string;
    shipVia: string;
    shipDate: string;
    inHandDateBy: string;
    isRushOrder: string;
    orderAmount: number;
    totalCost: number;
    totalProfit: number;
    grossProfit: number;
    totalCommission: number;
    locationId: string;
    accountName: string;
    accountId: string;
    contactName: string;
    contactId: string;
    billingCustomerName: string;
    billingStreet: string;
    billingStreet2: string;
    billingCity: string;
    billingState: string;
    billingPostalcode: string;
    billingCountry: string;
    shippingCustomerName: string;
    shippingStreet: string;
    shippingStreet2: string;
    shippingCity: string;
    shippingState: string;
    shipPostalcode: string;
    shipCountry: string;
    billingCustomerId: string;
    billingCompanyId: string;
    billingCompanyName: string;
    billingPhone: string;
    shippingCustomerId: string;
    shippingCompanyId: string;
    shippingCompanyName: string;
    shippingPhone: string;
    ack: string;
    taxRate: string;
    taxAmount: string;
    taxAccount: string;
    taxContact: string;
    taxLocation: string;
    shippingAmount: string;
    orderSource: string;
    csrFlag: string;
    csr: string;
    attentionTo: string;
    orderNote: string;
    workOrderNote: string;   // verified one workOrderNote
    shippingAccountNo: string;
    isAckSent: string;
    referredBy: string;
    designComm: string;
    designerNameId: string;
    designerName: string;
    finalGrossPrice: number;
    finalGrandTotalPrice: number;
    addressToPull: string;
    notePackagingSlip: string;
    taxRateToShow: string;
    sourced: string;
    billComplete: string;
    vipDiscountsRate: number;
    commissionId: string;
    partnerIdentityId: string;
    discountAmount: string;
    advanceStatusId: string;
    factoryShipDate?: any;
    commissionGroupId: string;
    commissionGroupName: string;
    corporateIdentity: ICorporateIdentity;
    lineItems: ILineItem[];
    paidAmount: number;
    balanceAmount: number;
    invoiceDate: string;
}

export interface MediaContent {
    sku: string;
    partId: string;
    productId: string;
    mediaType: string;
    url: string;
    hex: string;
    color: string;
}

export interface ExtraLogo {
    logo: string;
    type: number;
    x: string;
    y: string;
    w: string;
    h: string;
    o: string;
    location: string;
}

export interface LogoInfo {
    image: string;
    logo: string;
    type: number;
    x: string;
    y: string;
    w: string;
    h: string;
    o: string;
    extra_logo: ExtraLogo[];
    iw: number;
    ih: number;
    location: string;
}

export interface ProductCategoryArray {
    category: string;
}

export interface ProductKeywordArray {
    ProductKeyword?: any;
}

export interface StoreDetail {
    id?: any;
    color: string;
    show: string;
}

export interface Color {
    id: string;
    name: string;
    code: string;
    storeDetails: StoreDetail[];
}

export interface StoreDetail2 {
    id?: any;
    size: string;
    show: string;
}

export interface Size {
    id: string;
    name: string;
    code: string;
    storeDetails: StoreDetail2[];
}

export interface Attributes {
    color: Color;
    size: Size;
}

export interface StoreArray {
    id: string;
    storeId: string;
    store: string;
    url: string;
    margin: string;
    Attributes: Attributes;
}

export interface PartPrice2 {
    minQuantity: string;
    price: string;
    salePrice: string;
    margin: string;
    unitProfit: number;
    totalPrice: number;
    totalSalesPrice: number;
    totalProfit: number;
}

export interface PartPriceArray {
    PartPrice: PartPrice2[];
}

export interface PartPrice {
    PartPriceArray: PartPriceArray;
    partId: string;
}

export interface Color2 {
    colorName: string;
    hex: string;
}

export interface ColorArray {
    Color: Color2;
}

export interface ApparelSize {
    labelSize: string;
}

export interface ProductPart {
    sku: string;
    partId: string;
    inventoryKey: string;
    inventory: string;
    partPrice: PartPrice;
    min: string;
    max: string;
    saleStartDate?: any;
    saleEndDate?: any;
    priceType: string;
    ColorArray: ColorArray;
    ApparelSize: ApparelSize;
}

export interface ProductPartArray {
    ProductPart: ProductPart[];
}

export interface PartPrice4 {
    minQuantity: string;
    price: string;
    salePrice: string;
    margin: string;
    unitProfit: number;
    totalPrice: number;
    totalSalesPrice: number;
    totalProfit: number;
}

export interface PartPriceArray2 {
    PartPrice: PartPrice4[];
}

export interface PartPrice3 {
    PartPriceArray: PartPriceArray2;
    partId: string;
}

export interface Color3 {
    colorName: string;
    hex: string;
}

export interface ColorArray2 {
    Color: Color3;
}

export interface ApparelSize2 {
    labelSize: string;
}

export interface ColorPrint {
    sku: string;
    partId: string;
    inventoryKey: string;
    inventory: string;
    partPrice: PartPrice3;
    min: string;
    max: string;
    saleStartDate?: any;
    saleEndDate?: any;
    priceType: string;
    ColorArray: ColorArray2;
    ApparelSize: ApparelSize2;
}

export interface ProductImprintPart {
    ColorPrint: ColorPrint[];
}

export interface ProductImprintPartArray {
    ProductImprintPart: ProductImprintPart;
}

export interface FobPoint {
    fobId: string;
    fobCity: string;
    fobState: string;
    type?: string;
}

export interface IProduct {
    id: string;
    productName: string;
    vendorName: string;
    vendorId: string;
    storeNames: string;
    inhouseId: string;
    productId: string;
    itemCode: string;
    anteraId: string;
    creationDate: string;
    lastChangeDate: string;
    description: string;
    colorMap: string;
    colorsAlias: string;
    productionTime: string;
    package: string;
    packaging?: any;
    usefulLinks?: any;
    collection?: any;
    priceRange?: any;
    additionalInfo: string;
    source: string;
    shell: string;
    MediaContent: MediaContent[];
    coop: string;
    rebate: string;
    division: string;
    dimension?: any;
    weight: string;
    taxEnabled: string;
    price: string;
    pricingErr?: any;
    specialPrice: string;
    extraInfo: string;
    extraBooleans: string;
    lot: string;
    orderSeqNum?: any;
    qbExpenseAccount: string;
    qbIncomeAccount: string;
    qbAssetAccount: string;
    imprintInfo: string;
    uomSetRef: string;
    poType: string;
    productType: string;
    taxJarCat: string;
    LogoInfo: LogoInfo[];
    DecorationInfo: string;
    DesignDeco?: any;
    cloneId: string;
    AvailableCharges?: any;
    assignedUserId: string;
    assignedUserName?: any;
    ProductCategoryArray: ProductCategoryArray[];
    ProductKeywordArray: ProductKeywordArray;
    StoreArray: StoreArray[];
    SystemEventArray: any[];
    DescriptionArray: any[];
    ProductPartArray: ProductPartArray;
    distinctImages: string[];
    ProductImprintPartArray: ProductImprintPartArray;
    fobPoints: FobPoint[];
    api: string;
    _destroy?: boolean;
    uomDetails?: UomDetails[];
    calculatorType?: string;
}

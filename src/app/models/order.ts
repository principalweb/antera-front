import { FuseUtils } from '@fuse/utils';
import { pick } from 'lodash';
import { MatrixRow } from './matrix-row';

export class Order
{
    id: string;
    orderNo: string;
    inHouseOrderNo: string;
    orderIdentity: string;
    contactName: string;
    accountName: string;
    orderType: string;
    orderDate: string;
    totalPrice: string;
    salesPerson: string;
    cloudOrderLink: string;
    inHandByDate: string;
    completion: string;
    orderStatus: string;
    ack: string;
    paymentStatus: string;
    modifiedDate: string;
    csr: string;
    csrName: string;
    deleted: string;
    archive: string;
    poId: string;
    accountId: string;
    lineItemTotal: string;
    lateActivities: string;
    action: string;
    hasNotify: string;
    completedAct: string;
    totalAct: string;
    corporateIdentity: any;
    bookedDate: any;

    // To be removed
    products = [];
    status = [];

    constructor(order?)
    {
        order = order || {};
        this.id = order.id || FuseUtils.generateGUID();
        this.orderNo = order.orderNo || FuseUtils.generateGUID();
        this.inHouseOrderNo = order.inHouseOrderNo || 0;
        this.orderIdentity = order.orderIdentity || 0;
        this.contactName = order.contactName || 0;
        this.accountName = order.accountName || 0;
        this.orderType = order.orderType || '';
        this.orderDate = order.orderDate || '';
        this.totalPrice = order.salesPerson || '';
        this.cloudOrderLink = order.cloudOrderLink || '';
        this.inHandByDate = order.inHandByDate || '';
        this.completion = order.completion || '';
        this.orderStatus = order.orderStatus || '';
        this.ack = order.ack || '';
        this.paymentStatus = order.paymentStatus || '';
        this.modifiedDate = order.modifiedDate || '';
        this.csr = order.csr || '';
        this.csrName = order.csrName || '';
        this.deleted = order.deleted || '';
        this.archive = order.archive || '';
        this.poId = order.poId || '';
        this.accountId = order.accountId || '';
        this.orderStatus = order.orderStatus || '';
        this.corporateIdentity = order.corporateIdentity;
        this.bookedDate = (order.bookedDate != '0000-00-00' ? order.bookedDate : '');
    }

    setData(obj) {
        const data = pick(obj, [
            'id', 'orderNo', 'inHouseOrderNo', 'orderIdentity', 'contactName', 'accountName', 'orderType', 
            'orderDate', 'bookedDate', 'totalPrice', 'salesPerson', 'cloudOrderLink', 'inHandByDate', 'completion', 'orderStatus', 
            'ack', 'paymentStatus', 'modifiedDate', 'csr', 'csrName', 'deleted', 'archive', 'poId', 'accountId', 
            'lineItemTotal', 'lateActivities', 'action','hasNotifiy', 'completedAct', 'totalAct', 'corporateIdentity'
        ]);

        Object.assign(this, data);
    }
}

export class LineItem
{
    id: string;
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
    price: string;
    origPrice: string;
    totalPrice: string;
    cost: string;
    origCost: string;
    totalCost: string;
    profit: string;
    commRate: string;
    isCommChanged: string;
    commValue: string;
    itemTax: string;
    chargeSalesTax: string;
    sortOrder: number;
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
    vendorProductName: string;
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
    quoteCustomImage: string;
    showFullDescription: string;
    showFullDescriptionOC: string;
    exactorSku: string;
    itemTaxOff: string;
    gstTaxRateOnPo: string;
    gstTaxTotalOnPo: string;
    chargeGstTaxOnPo: string;
    uomSetRef: string;
    uomConversionRatio: number;
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
    allowParentKitCalc?: any;
    poTerms: string;
    lineItemImage: string;
    defaultImageRemoved: string;
    addToProduct: string;
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
    matrixRows: Partial<MatrixRow>[];
    modifiedPriceBreaks: any;
    addonCharges ?: any[];
    decoVendors?: any[];
    lineItemUpdateId?: any;
    rollAddonChargesToProduct?: any;
    rollDecoChargesToProduct?: any;
    rollDecoAddonChargesToProduct?: any;
    doNotIssuePo?: any;
    priceType?: string;
    vendorPONote?: string;
    uomId: string;
    calculatorData: any;
    overrideInHandDate: string;
    adminFeeCost: string;
    totalCostIncludingAdminFee: string ;

    fromCurrencyCode: string;
    fromCurrencySymbol: string;
    toCurrencyCodeForCustomer: string;
    toCurrencySymbolForCustomer: string;
    exchageRateForCustomer: any;
    toCurrencyCodeForVendor: string;
    toCurrencySymbolForVendor: string;
    exchageRateForVendor: any;


    constructor(lineItem?) {
        this.id = lineItem.id || '';
        this.productId = lineItem.productId || '';
        this.vendorId = lineItem.vendorId || '';
        this.vendorName = lineItem.vendorName || '';
        this.vendorNo = lineItem.vendorNo || '';
        this.itemCode = lineItem.itemCode || '';
        this.itemNo = lineItem.itemNo || '';
        this.itemName = lineItem.itemName || '';
        this.uom = lineItem.uom || '';
        this.itemSku = lineItem.itemSku || '';
        this.quantity = lineItem.quantity || '';
        this.stitches = lineItem.stitches || '';
        this.price = lineItem.price || '';
        this.origPrice = lineItem.origPrice || '';
        this.totalPrice = lineItem.totalPrice || '';
        this.cost = lineItem.cost || '';
        this.origCost = lineItem.origCost || '';
        this.totalCost = lineItem.totalCost || '';
        this.profit = lineItem.profit || '';
        this.commRate = lineItem.commRate || '';
        this.isCommChanged = lineItem.isCommChanged || '';
        this.commValue = lineItem.commValue || '';
        this.itemTax = lineItem.itemTax || '';
        this.customerDescription = lineItem.customerDescription || '';
        this.vendorDescription = lineItem.vendorDescription || '';
        this.addonColorSize = lineItem.addonColorSize || '';
        this.shipTo = lineItem.shipTo || '';
        this.shipToId = lineItem.shipToId || '';
        this.shipDate = lineItem.shipDate || '';
        this.inhandDate = lineItem.inhandDate || '';
        this.shipVendor = lineItem.shipVendor || '';
        this.shipAccountNo = lineItem.shipAccountNo || '';
        this.cloudArtworkLinks = lineItem.cloudArtworkLinks || '';
        this.cloudArtworkNames = lineItem.cloudArtworkNames || '';
        this.otherMemo = lineItem.otherMemo || '';
        this.otherMemoType = lineItem.otherMemoType || '';
        this.waiveProof = lineItem.waiveProof || '';
        this.productName = lineItem.productName || '';
        this.vendorProductName = lineItem.vendorProductName || '';
        this.lineType = lineItem.lineType || '';
        this.hideLine = lineItem.hideLine || '';
        this.dropDown = lineItem.dropDown || '';
        this.isDescriptionForCustomer = lineItem.isDescriptionForCustomer || '';
        this.accountCode = lineItem.accountCode || '';
        this.incomeAccount = lineItem.incomeAccount || '';
        this.expenseAccount = lineItem.expenseAccount || '';
        this.assetAccountCode = lineItem.assetAccountCode || '';
        this.lineItemType = lineItem.lineItemType || '';
        this.uniqeId = lineItem.uniqeId || '';
        this.poType = lineItem.poType || '';
        this.lineItemVendorMargin = lineItem.lineItemVendorMargin || '';
        this.isChargesPulled = lineItem.isChargesPulled || '';
        this.lineItemNote = lineItem.lineItemNote || '';
        this.hideMatrix = lineItem.hideMatrix || '';
        this.quoteCustomImage = lineItem.quoteCustomImage || '';
        this.showFullDescription = lineItem.showFullDescription || '';
        this.showFullDescriptionOC = lineItem.showFullDescriptionOC || '';
        this.exactorSku = lineItem.exactorSku || '';
        this.itemTaxOff = lineItem.itemTaxOff || '';
        this.gstTaxRateOnPo = lineItem.gstTaxRateOnPo || '0';
        this.gstTaxTotalOnPo = lineItem.gstTaxTotalOnPo || '0';
        this.chargeGstTaxOnPo = lineItem.chargeGstTaxOnPo || 0;
        this.uomId = lineItem.uomId || '';
        this.uomSetRef = lineItem.uomSetRef || '';
        this.uomConversionRatio = lineItem.uomConversionRatio || 1;
        this.sequenceStart = lineItem.sequenceStart || '';
        this.sequenceEnd = lineItem.sequenceEnd || '';
        this.inhouseId = lineItem.inhouseId || '';
        this.supplierOrder = lineItem.supplierOrder || '';
        this.supplierOrderCopied = lineItem.supplierOrderCopied || '';
        this.customerNetPrice = lineItem.customerNetPrice || '';
        this.discount = lineItem.discount || '';
        this.separatePO = lineItem.separatePO || '';
        this.isPOP = lineItem.isPOP || '';
        this.decorationType = lineItem.decorationType || '';
        this.decorationData = lineItem.decorationData || '';
        this.invoiceIndividually = lineItem.invoiceIndividually || '';
        this.showAttribSize = lineItem.showAttribSize || '';
        this.showAttribColor = lineItem.showAttribColor || '';
        this.showAttribDecoration = lineItem.showAttribDecoration || '';
        this.deocoratorName = lineItem.deocoratorName || '';
        this.deocoratorDesc = lineItem.deocoratorDesc || '';
        this.inventoryReceived = lineItem.inventoryReceived || '';
        this.customMargin = lineItem.customMargin || '';
        this.inventoryReceivedQty = lineItem.inventoryReceivedQty || '';
        this.warehouse = lineItem.warehouse || '';
        this.warehouseList = lineItem.warehouseList || '';
        this.isKitParent = lineItem.isKitParent || '';
        this.isKitChild = lineItem.isKitChild || '';
        this.poTerms = lineItem.poTerms || '';
        this.lineItemImage = lineItem.lineItemImage || '';
        this.defaultImageRemoved = lineItem.defaultImageRemoved || '';
        this.addToProduct = lineItem.addToProduct || '';
        this.dropDeadDate = lineItem.dropDeadDate || '';
        this.lineItemLocationsList = lineItem.lineItemLocationsList || '';
        this.discountRate = lineItem.discountRate || '';
        this.decoExpenseAccount = lineItem.decoExpenseAccount || '';
        this.decoIncomeAccount = lineItem.decoIncomeAccount || '';
        this.uniqueId = lineItem.uniqueId || '';
        this.lockPrice = lineItem.lockPrice || '';
        this.lockCost = lineItem.lockCost || '';
        this.productMargin = lineItem.productMargin || '';
        this.customerCannedMsgPulled = lineItem.customerCannedMsgPulled || '';
        this.poCannedMsgPulled = lineItem.poCannedMsgPulled || '';
        this.product_image_color_map = lineItem.product_image_color_map || '';
        this.decoChargesId = lineItem.decoChargesId || '';
        this.promoStandardIsTopRowPulled = lineItem.promoStandardIsTopRowPulled || '';
        this.storeLineNo = lineItem.storeLineNo || '';
        this.isSanmarProduct = lineItem.isSanmarProduct || '';
        this.rebate = lineItem.rebate || '';
        this.custInventoryReceivedQty = lineItem.custInventoryReceivedQty || '';
        this.custInventoryReceived = lineItem.custInventoryReceived || '';
        this.matrixRows = lineItem.matrixRows || '';
        this.priceType = lineItem.priceType;
        this.vendorPONote = lineItem.vendorPONote;
        this.decoVendors = lineItem.decoVendors || [];
        this.adminFeeCost = lineItem.adminFeeCost || 0;
        this.totalCostIncludingAdminFee = lineItem.totalCostIncludingAdminFee || 0 ;
        
        this.fromCurrencyCode = lineItem.fromCurrencyCode || '';
        this.fromCurrencySymbol = lineItem.fromCurrencySymbol || '';
        this.toCurrencyCodeForCustomer = lineItem.toCurrencyCodeForCustomer || '';
        this.toCurrencySymbolForCustomer = lineItem.toCurrencySymbolForCustomer || '';
        this.exchageRateForCustomer = lineItem.exchageRateForCustomer || 1;
        this.toCurrencyCodeForVendor = lineItem.toCurrencyCodeForVendor || '';
        this.toCurrencySymbolForVendor = lineItem.toCurrencySymbolForVendor || '';
        this.exchageRateForVendor = lineItem.exchageRateForVendor || 1;
        this.doNotIssuePo = lineItem.doNotIssuePo || 0;


    }
}

export const OrderColors = {
    'Void': 'red-500',
    'Pending': 'orange-500',
    'Booked': 'blue-500',
    'BackOrdered': 'pink-500',
    'Partial': 'purple-500',
    'Paid': 'blue-500',
    'Unpaid': 'orange-500'
};

import { FuseUtils } from '@fuse/utils';
import { assign } from 'lodash';

export class OrderDetails {
	id: string;
	orderNo: string;
	orderIdentity: string;
	orderType: string;
	orderStatus: string;
	orderDate: string;
	dueDate: string;
	creditTerms: string;
	salesPerson: string;
	salesPersonPhone?: string;
	salesPersonEmail?: string;
	salesPersonId: string;
	customerPo: string;
	payStatus: string;
	shipVia: string;
	shipDate: string;
	inHandDateBy: string;
	supplierShipDate: string;
	factoryShipDate: string;
	supplierInHandsDate: string;
	expectedPrintDate: string;
	proformaDate: string;
	isRushOrder: string;
	orderAmount: string;
	totalCost: string;
	totalProfit: string;
	grossProfit: string;
	totalCommission: string;
	accountName: string;
	accountId: string;
	contactName: string;
	contactId: string;
	contactEmail: string;
	billingCustomerEmail: string;
	shippingCustomerEmail: string;
	contactSalutation: string;
        billingCustomerSalutation: string;
	billingCustomerName: string;
	billingStreet: string;
	billingStreet2: string;
	billingCity: string;
	billingState: string;
	billingPostalcode: string;
	billingCountry: string;
	shippingCustomerSalutation: string;
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
	taxStrategiesId?: string;
	taxStrategiesType?: string;
	shippingAmount: string;
	orderSource: string;
	csrFlag: string;
	csr: string;
	csrName: string;
	csrPhone?: string;
	csrEmail?: string;
	attentionTo: string;
	commissionId: string;
	orderNote: string;
	workOrderNote: string;
	shippingAccountNo: string;
	alternateAccountNumber?: string;
	isAckSent: string;
	referredBy: string;
	designComm: string;
	designerNameId: string;
	designerName: string;
	finalGrossPrice: string;
	finalGrandTotalPrice: string;
	productAmount: any;
	shippingAmountForReport: any;
	finalGrossPriceWithoutTax: any;
	balanceAmount: string;
	addressToPull: string;
	notePackagingSlip: string;
	taxRateToShow: string;
	invoiceNo: string;
	billComplete: string;
	vipDiscountsRate: string;
	partnerIdentityId: string;
	locationId: string;
	locationName: string;
	lineItems = [];
	productSizesSorting = [];
	status = [];
	paymentStatus = [];
	opportunityNo: string;
	advanceStatusId: number;
	corporateIdentity: any;
	commissionGroupId: any;
	commissionGroupName: any;
	grossProfitPercent: number;
	bookedDate: string;
	proofDueDate: string;
	invoiceDate: string;
	csrEmbroideryUserId: string;
	csrEmbroideryUserName: string;
	csrScreenprintUserId: string;
	csrScreenprintUserName: string;
	gstTaxDetailsOnPo: any;
	discountAmount: any;
	salesAmount: any;
	billingStage: string;
	altNumber: string;
	taxBreakup: any;
	taxJarBreakups: any;
	workOrderBoxLabel: any;
	workOrderDetails: any;
	barCodeURL: string;
	productionManagerId: string;
	productionManagerName: string;
	isPromoItem: string;
	emailSentStatus: any;
	adminFeeType: string;
	adminFeeRate: string;
	vendorTerms: string;
	vendorNotes: string;
	fromCurrencyCode: string;
	fromCurrencySymbol: string;
	toCurrencyCodeForCustomer: string;
	toCurrencySymbolForCustomer: string;
	exchageRateForCustomer: any;
	vendorInfo: any;
	shipTo: any;
	projectName: string;
	pricingMethodId: string;
	pricingMethodsName: string;
	

	constructor(order?) {
		order = order || {};
		this.id = order.id || '';
		this.advanceStatusId = order.advanceStatusId;
		this.orderNo = order.orderNo || '';
		this.orderIdentity = order.orderIdentity || '';
		this.orderType = order.orderType || '';
		this.orderStatus = order.orderStatus || '';
		this.orderDate = order.orderDate || '';
		this.dueDate = (order.dueDate != '0000-00-00' ? order.dueDate : '');
		this.creditTerms = order.creditTerms || '';
		this.salesPerson = order.salesPerson || '';
		this.salesPersonId = order.salesPersonId || '';
		this.customerPo = order.customerPo || '';
		this.payStatus = order.paymentStatus || '';
		this.shipVia = order.shipVia || '';
		this.shipDate = order.shipDate || '';
		this.inHandDateBy = order.inHandDateBy || '';
		this.supplierShipDate = order.supplierShipDate || '';
		this.factoryShipDate = order.factoryShipDate || '';
		this.supplierInHandsDate = order.supplierInHandsDate || '';
		this.expectedPrintDate = order.expectedPrintDate || '';
		this.proformaDate = order.inHandDateBy || null;
		this.isRushOrder = order.isRushOrder || 'No';
		this.orderAmount = order.orderAmount || '';
		this.totalCost = order.totalCost || '';
		this.totalProfit = order.totalProfit || '';
		this.grossProfit = order.grossProfit || '';
		this.grossProfitPercent = order.grossProfitPercent || '';
		this.totalCommission = order.totalCommission || '';
		this.accountName = order.accountName || '';
		this.accountId = order.accountId || '';
		this.contactName = order.contactName || '';
		this.contactEmail = order.contactEmail || '';
		this.billingCustomerEmail = order.billingCustomerEmail || '';
		this.shippingCustomerEmail = order.shippingCustomerEmail || '';
		this.contactId = order.contactId || '';
		this.contactSalutation = order.contactSalutation || '';
		this.billingCustomerSalutation = order.billingCustomerSalutation || '';
		this.billingCustomerName = order.billingCustomerName || '';
		this.billingStreet = order.billingStreet || '';
		this.billingStreet2 = order.billingStreet2 || '';
		this.billingCity = order.billingCity || '';
		this.billingState = order.billingState || '';
		this.billingPostalcode = order.billingPostalcode || '';
		this.billingCountry = order.billingCountry || '';
		this.shippingCustomerSalutation = order.shippingCustomerSalutation || '';
		this.shippingCustomerName = order.shippingCustomerName || '';
		this.shippingStreet = order.shippingStreet || '';
		this.shippingStreet2 = order.shippingStreet2 || '';
		this.shippingCity = order.shippingCity || '';
		this.shippingState = order.shippingState || '';
		this.shipPostalcode = order.shipPostalcode || '';
		this.shipCountry = order.shipCountry || '';
		this.billingCustomerId = order.billingCustomerId || '';
		this.billingCompanyId = order.billingCompanyId || '';
		this.billingCompanyName = order.billingCompanyName || '';
		this.billingPhone = order.billingPhone || '';
		this.shippingCustomerId = order.shippingCustomerId || '';
		this.shippingCompanyId = order.shippingCompanyId || '';
		this.shippingCompanyName = order.shippingCompanyName || '';
		this.shippingPhone = order.shippingPhone || '';
		this.ack = order.ack || '';
		this.taxRate = order.taxRate || '';
		this.taxAmount = order.taxAmount || '';
		this.taxAccount = order.taxAccount || '';
		this.taxContact = order.taxContact || '';
		this.taxLocation = order.taxLocation || '';
		this.shippingAmount = order.shippingAmount || '';
		this.orderSource = order.orderSource || '';
		this.csrFlag = order.csrFlag || '';
		this.csr = order.csr || '';
		this.csrName = order.csrName || '';
		this.attentionTo = order.attentionTo || '';
		this.orderNote = order.orderNote || '';
		this.workOrderNote = order.workOrderNote || '';
		this.shippingAccountNo = order.shippingAccountNo || '';
		this.isAckSent = order.isAckSent || '';
		this.referredBy = order.referredBy || '';
		this.designComm = order.designComm || '';
		this.designerNameId = order.designerNameId || '';
		this.designerName = order.designerName || '';
		this.finalGrossPrice = order.finalGrossPrice || '';
		this.finalGrandTotalPrice = order.finalGrandTotalPrice || '';		
		this.productAmount = order.productAmount;
		this.shippingAmountForReport = order.shippingAmountForReport;
		this.finalGrossPriceWithoutTax = order.finalGrossPriceWithoutTax;
		this.addressToPull = order.addressToPull || '';
		this.notePackagingSlip = order.notePackagingSlip || '';
		this.taxRateToShow = order.taxRateToShow || '';
		this.lineItems = order.lineItems || [];
		this.productSizesSorting = order.productSizesSorting || [];
		this.invoiceNo = order.invoiceNo || '';
		this.billComplete = order.billComplete || '0';
		this.vipDiscountsRate = order.vipDiscountsRate || '0';
		this.commissionId = order.commissionId || '';
		this.partnerIdentityId = order.partnerIdentityId || '';
		this.commissionGroupId = order.commissionGroupId || '';
		this.commissionGroupName = order.commissionGroupName || '';
		this.locationId = order.locationId || '';
		this.locationName = order.locationName || '';
		this.opportunityNo = order.opportunityNo || '';
		this.corporateIdentity = order.corporateIdentity;
		this.csrEmbroideryUserId = order.csrEmbroideryUserId;
		this.csrEmbroideryUserName = order.csrEmbroideryUserName;
		this.csrScreenprintUserId = order.csrScreenprintUserId;
		this.csrScreenprintUserName = order.csrScreenprintUserName;
		this.bookedDate = (order.bookedDate != '0000-00-00' ? order.bookedDate : '');
		this.proofDueDate = (order.proofDueDate != '0000-00-00' ? order.proofDueDate : '');
		this.invoiceDate = (order.invoiceDate ? order.invoiceDate.substring(0, 10) : '');
		this.gstTaxDetailsOnPo = order.gstTaxDetailsOnPo;
		this.discountAmount = order.discountAmount;
		this.salesAmount = order.salesAmount;
		this.taxStrategiesId = order.taxStrategiesId;
		this.taxStrategiesType = order.taxStrategiesType;
		this.billingStage = order.billingStage || 'Pending';
		this.altNumber = order.altNumber || '';
		this.barCodeURL = order.barCodeURL || '';
		this.taxBreakup = order.taxBreakup;
		this.taxJarBreakups = order.taxJarBreakups;
		this.workOrderBoxLabel = order.workOrderBoxLabel || [];
		this.workOrderDetails = order.workOrderDetails || [];
		this.productionManagerId = order.productionManagerId;
		this.productionManagerName = order.productionManagerName;
		this.isPromoItem = order.isPromoItem;
		this.emailSentStatus = order.emailSentStatus;
		this.adminFeeType = order.adminFeeType || 'PERCENT';
		this.adminFeeRate = order.adminFeeRate || '0';
		this.vendorTerms = order.vendorTerms || '';
		this.vendorNotes = order.vendorNotes || '';
		this.fromCurrencyCode = order.fromCurrencyCode || '';
		this.fromCurrencySymbol = order.fromCurrencySymbol || '';
		this.toCurrencyCodeForCustomer = order.toCurrencyCodeForCustomer || '';
		this.toCurrencySymbolForCustomer = order.toCurrencySymbolForCustomer || '';
		this.exchageRateForCustomer = order.exchageRateForCustomer || 1;
		this.vendorInfo = order.vendorInfo || '';
		this.shipTo = order.shipTo || [];
		this.projectName = order.projectName || '';
                this.pricingMethodId = order.pricingMethodId || '1';
                this.pricingMethodsName = order.pricingMethodsName || 'Wholesale';

	}

	update(obj) {
		assign(this, obj);
	}
}

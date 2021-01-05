export interface IInvoice {
  id: string;
  number: string;
  label: string;
  type: string;
  customerId: string;
  customer: string;
  invoiceDate: string;
  created: string;
  terms: string;
  needStatus: string;
  currency: string;
  fob: string;
  salesAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  advancePaymentAmount: number;
  invoiceAmount: number;
  balance: number;
  status: string;
  source: string;
  modified: string;
  allocations: IAllocation[];
  lineItems: ILineItem[];
  salesOrders: ISalesOrder[];
  billTo: IAccountInfo;
  shipTo: IAccountInfo;
}

export interface IAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  type: string;
  amount: number;
  info: string;
  userId: string;
  targetAllocationId: string;
}

export interface IInvoiceCollection {
  data: IInvoice[];
  _links: any[];
  _meta: IRestMeta;
}

export interface IRestMeta {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}

export interface IRestParams {
  page: number;
  perPage: number;
  order: string;
  orient: string;
}

export interface IRestFilter {
  number: number;
  label: string;
  type: string;
  customerId: string;
  invoiceDate: string;
  created: string;
  terms: string;
  currency: string;
  fob: string;
  salesAMount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  advancePaymentAmount: number;
  invoiceAmount: number;
  balance: number;
  status: string;
  source: string;
  modified: string;
  salesOrders: ISalesOrder[];
}

export interface ISalesOrder {
  salesOrderNumber: string;
}

export interface IAccountInfo {
  name: string;
  number: string;
  accountId: string;
  addressLines: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ILineItem {
  id: string;
  invoiceId: string;
  parentId: string;
  type: string;
  orderedQuantity: number;
  invoiceQuantity: number;
  backOrderedQuantity: number;
  uom: string;
  description: string;
  unitPrice: number;
  extendedPrice: number;
  tax: boolean;
  taxType: string;
  lineGroup: string;
  refSalesOrderId: string;
  refSalesOrderLineItemId: string;
  imageId: number;
  imageUrl: string;
  itemRef: string;
  status: string;
  matchOrderQty: boolean;
  color: string;
  size: string;
  itemNo: string;
  invoiceNo: string;
  customerName: string;
  customerId: string;
  customerInfo: string;
  productId: string;
  productName: string;
  productInfo: string;
  rollback: number;
}

export interface InvoiceResponse {
  data: any[];
  _links: {
    self: {
      href: string;
    };
    next: {
      href: string;
    };
    last: {
      href: string;
    };
  };
  _meta: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
}

export interface Meta {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}

export interface PendingInvoiceResponse {
  data: any[];
  _links: {
    self: {
      href: string;
    }
  };
  _meta: Meta
}

export interface LineItemResponse {
  data: any[];
}

export interface SummaryInvoicePayload {
  invoiceIds: string[];
  lineItems: SummaryLineItems[];
  final: string;
  merged: string;
}

export interface SummaryLineItems {
  id: string,
  parentId: string,
  invoiceQuantity: number,
  unitPrice: string
}


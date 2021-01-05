export class ApCredit
{
  'id': string;
  'advanceReasonId': string;
  'amount': number;
  'balance': number;
  'accountId': string;
  'creditedDate': string;
  'externalRef': string;
  'notes': string;
  'reference': string;
  'currency': string;
  'created': string;
}

export class ApCreditData
{
  'id': string;
  'advanceReasonId': string;
  'accountingId': string;
  'amount': number;
  'accountId': string;
  'creditedDate': string;
  'externalRef': string;
  'notes': string;
  'userId': string;
  'reference': string;
  'currency': string;
  'account': ApCreditDataAccount;
  'apCreditLines': ApCreditDataLines[];
}

export class ApCreditDataLines
{
  id: string;
  orderId: string;
  apCreditId: string;
  vendorId: string;
  quantity: string;
  price: string;
  name: string;
  total: string;
  type: string;
  lineId: string;
  parentId: string;
  recordId: string;
  productId: string;
  sku: string;
  color: string;
  size: string;
  image: string;
  taxRate: string;
  tax: string;
  order: ApCreditDataOrder;
}

export class ApCreditDataOrder
{
  'id': string;
  'number': string;
}

export class ApCreditDataAccount
{
  'id': string;
  'name': string;
}

export class ApCreditFilter
{
  terms: {
    reference: string;
    notes: string;
  };
}

export class ApCreditAllocationLog
{
  id: string;
  apCreditId: string;
  vouchingId: string;
  typeId: string;
  type: string;
  balance: number;
  amount: number;
  creditApplied: number;
  creditAvailable: boolean;
  notes: string;
  reference: string;
  info: string;
}

export class PoLines {
  id: string;
  quantity: string;
  price: string;
  name: string;
  total: string;
  type: string;
  lineId: string;
  parentId: string;
  recordId: string;
  productId: string;
  sku: string;
  color: string;
  size: string;
  image: string;
  taxRateOnPo: string;
  taxTotalOnPo: string;
}

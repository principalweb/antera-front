export class PurchaseOrderTaxInformation {
    constructor(
        public taxExempt: number,
        public taxId: string,
        public taxJurisdiction: string,
        public taxType: string ){}
}
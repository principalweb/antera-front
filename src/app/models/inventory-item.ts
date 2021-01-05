export class InventoryItem {
    sku: string;
    size: string;
    color: string;
    site: string;
    bin: string;
    minimumQuantity: string;
    quantity: string;
    lastInsertDate: string;

    constructor(item) {
        this.sku = item.sku || '';
        this.size = item.size || '';
        this.color = item.color || '';
        this.site = item.site || '';
        this.bin = item.bin || '';
        this.quantity = item.quantity || '';
        this.minimumQuantity = item.minimumQuantity || '';
        this.lastInsertDate = item.lastInsertDate || new Date().toISOString().slice(0, 10);
    }
}

export class InventoryItemList {
    id: string;
    productId: string;
    sku: string;
    size: string;
    color: string;
    site: string;
    min: string;
    max: string;
    quantity: string;

    constructor(item) {
        this.productId = item.productId || '';
        this.sku = item.sku || '';
        this.size = item.size || '';
        this.color = item.color || '';
        this.site = item.site || '';
        this.min = item.min || '';
        this.max = item.max || '';
        this.quantity = item.quantity || '';
    }
}

export class InventoryAdjustItem {
    id: string;
    productId: string;
    sku: string;
    size: string;
    color: string;
    site: string;
    siteId: string;
    bin: string;
    binId: string;
    min: string;
    max: string;
    quantity: string;
    dateModified: string;
    newQuantity: string;

    constructor(item) {
        this.productId = item.productId || '';
        this.sku = item.sku || '';
        this.size = item.size || '';
        this.color = item.color || '';
        this.site = item.site || '';
        this.siteId = item.siteId || '0';
        this.bin = item.bin || '';
        this.binId = item.binId || '0';
        this.min = item.min || '';
        this.max = item.max || '';
        this.quantity = item.quantity || '';
        this.dateModified = item.dateModified || new Date().toISOString().slice(0, 10);
        this.newQuantity = item.newQuantity || '';
    }
}

export class Bin {
    binId: string;
    bin: string;
}

export class Site {
    fobId: string;
    fobCity: string;
    fobState: string;
    bins: Bin[];
}

export class LocalBin {
    id: string;
    siteId: string;
    name: string;
}

export class LocalSite {
    id: string;
    name: string;
    customerOwned: boolean;
    customer: string;
    customerName: string;
}

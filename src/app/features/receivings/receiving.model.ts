import { FuseUtils } from '@fuse/utils';

export class Receiving
{
    id: string;
    orderNumber: string;
    customerPo: string;
    vendorName: string;
    customerName: string;
    identity: string;
    orderDate: string;
    vendorId: string;

    constructor(receiving)
    {
        {
            this.id = receiving.id || FuseUtils.generateGUID();
            this.orderNumber = receiving.orderNumber || '';
            this.customerPo = receiving.customerPo || '';
            this.vendorName = receiving.vendorName || '';
            this.customerName = receiving.customerName || '';
            this.identity = receiving.identity || '';
            this.orderDate = receiving.orderDate || '';
            this.vendorId = receiving.vendorId || '';
        }
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

export class ReceivingItem {
    orderId: string;
    vendorId: string;
    productId: string;
    itemNo: string;
    matrixId: string;
    lineId: string;
    sku: string;
    color: string;
    size: string;
    quantity: string;
    receivedQuantity: string;
    poQuantity: string;
    site: Site;
    bin: Bin;
}

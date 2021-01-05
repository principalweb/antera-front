import { FuseUtils } from '@fuse/utils';

export class Workflow
{
    id: string;
    orderNumber: string;
    identity: string;
    account: string;
    vendor: string;
    amount: string;
    proof: boolean;
    links: any;
    inHands: string;
    processing: string;
    salesRep: string;
    csr: string;
    qbSync: boolean;

    constructor(ws) {
        {
            this.id = ws.coliId|| FuseUtils.generateGUID();
            this.orderNumber = ws.orderNumber || '';
            this.identity = ws.identity || '';
            this.account = ws.account || '';
            this.vendor = ws.vendor || '';
            this.amount = ws.amount || '';
            this.proof = ws.proof || true;
            this.links = ws.links || {};
            this.inHands = ws.inHands || '';
            this.processing = ws.processing || '';
            this.salesRep = ws.salesRep || '';
            this.csr = ws.csr || '';
            this.qbSync = ws.qbSync || false;
        }
    }
}

import { FuseUtils } from '@fuse/utils';

export class Case
{
    id: string;
    number: string;
    subject: string;
    accountName: string;
    priority: string;
    status: string;
    salesRep: string;
    dateCreated: string;
    type: string;
    description: string;
    resolution: string;

    constructor(c) {
        this.id = c.id || FuseUtils.generateGUID();
        this.number = c.number || '';
        this.subject = c.subject || '';
        this.accountName = c.accountName || '';
        this.priority = c.priority || '';
        this.status = c.status || '';
        this.salesRep = c.salesRep || '';
        this.dateCreated = c.dateCreated || '';
        this.type = c.type || '';
        this.description = c.description || '';
        this.resolution = c.resolution || '';
    }
}

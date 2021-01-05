import { FuseUtils } from '@fuse/utils';
import { MatChipInputEvent } from '@angular/material/chips';

export class Webstore
{
    id: string;
    clientName: string[];
    hostName: string;
    points: string;
    distributor: string;
    enabled: boolean;
    logo: string;
    crmUrl: string;
    crmAccount: string;
    orderType: string;
    salesPerson: string;
    currency: string;
    css: string;

    constructor(ws?) {
        {
            ws = ws || {};
            this.id = ws.id || FuseUtils.generateGUID();
            this.clientName = ws.clientName || [];
            this.hostName = ws.hostName || '';
            this.points = ws.points || '';
            this.distributor = ws.distributor || '';
            this.enabled = ws.enabled || true;
            this.logo = ws.logo || '';
            this.crmUrl = ws.crmUrl || '';
            this.crmAccount = ws.crmAccount || '';
            this.orderType = ws.orderType || '';
            this.salesPerson = ws.salesPerson || '';
            this.currency = ws.currency || '';
            this.css = ws.css || '';
        }
    }

    addStore(event: MatChipInputEvent): void
    {
        const input = event.input;
        const value = event.value;

        // Add category
        if ( value )
        {
            this.clientName.push(value);
        }

        // Reset the input value
        if ( input )
        {
            input.value = '';
        }
    }

    removeStore(store)
    {
        const index = this.clientName.indexOf(store);

        if ( index >= 0 )
        {
            this.clientName.splice(index, 1);
        }
    }

}

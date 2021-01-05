import { OrderDetails, LineItem } from 'app/models';
import { Observable } from 'rxjs';
import { DocumentImageManager } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { InvoiceDocument } from './invoice.document';

export class InvoiceProformaDocument extends InvoiceDocument {
    name = 'invoice-proforma';
    label = 'Invoice';

    getTitle() {
        return this.getDynamicDocLabel('heading', this.label);
    }
}
import { OrderDetails } from 'app/models';
import { Observable } from 'rxjs';
import { DocumentImageManager } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { InvoiceDocument } from './invoice.document';


export class CreditMemoDocument extends InvoiceDocument {
    name = 'credit-memo';
    label = 'Credit Memo';

    getTitle() {
        return this.getDynamicDocLabel('heading', this.label);
    }
}
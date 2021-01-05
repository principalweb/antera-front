import { OrderDetails } from 'app/models';
import { Observable } from 'rxjs';
import { DocumentImageManager } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { InvoiceDocument } from './invoice.document';


export class ArInvoiceDocument extends InvoiceDocument {
    name = 'ar-invoice';
    label = 'ARInvoice';
}
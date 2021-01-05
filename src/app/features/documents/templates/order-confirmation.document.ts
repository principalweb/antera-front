import { OrderDetails } from 'app/models';
import { Observable } from 'rxjs';
import { DocumentImageManager } from '../document-image-manager';
import { IDocument, AbstractOrderDocument } from '../document.interface';
import { InvoiceDocument } from './invoice.document';


export class OrderConfirmationDocument extends InvoiceDocument {
    name = 'order-confirmation';
    label = 'Order Confirmation';
}
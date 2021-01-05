import { Component, Input, OnChanges, EventEmitter, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { find, findIndex, groupBy, sum, isEmpty} from 'lodash';
import { fx2Str, exportImageUrlForPDF } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { DocumentsService } from 'app/core/services/documents.service';
import { MatrixRow } from 'app/models';
import { Observable ,  Subscription, forkJoin } from 'rxjs';
import { defaultDocLabels } from 'app/features/admin/documents/documents';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'embedded-purchase-order-modern',
  templateUrl: './embedded-purchase-order-decoration-modern.component.html',
  styleUrls: ['./embedded-purchase-order-decoration-modern.component.scss']
})
export class EmbeddedPurchaseOrderDecorationModernComponent implements OnInit {

  @Input() orderId = '';
  @Input() orderNo = '';
  @Input() vendorName = '';
  @Input() vendorId = '';
  @Input() hidden:boolean = false;
  @Output() onDocumentReady = new EventEmitter();
  @Output() onDocumentLoadingFailed = new EventEmitter();
  @Input() fields = [];

  orderDetails: any;
  poDecoVendorData: any;
  productData: any;
  docOptions = [];
  logoUrl = '';
  docLabels = {};

  constructor(
    private api: ApiService,
    private documents: DocumentsService,
    private cd: ChangeDetectorRef
  ) {
    this.documents.getDocumentOptions().then((docOptions) => {
      this.docOptions = docOptions;
    });
  }

  ngOnInit() {

  }

  initializePurchaseOrderDetails(orderId, vendorName) {
    this.logoUrl = '';

    this.api.getOrderDetailsPerDocType({
      id: orderId,
      docType: 'po'
    }).pipe(
      switchMap((order: any) => {
        this.orderDetails = order;
        this.productData = this.generateProductDataByColorsSizes(this.orderDetails.lineItems);
        let obArr = [
          this.api.getDocumentLabels({cId: order.partnerIdentityId})
        ];

        if (order.partnerIdentityId) {
          obArr.push(this.api.getIdentityLogo({identityId: order.partnerIdentityId}));
        } else {
          obArr.push(this.api.getLogo());
        }
        return forkJoin(obArr);
      })
    ).subscribe((res: any) => {
      this.logoUrl = exportImageUrlForPDF(res[1].url);

      let allDocumentLabels = res[0];
      if (isEmpty(res[0])) {
        allDocumentLabels = defaultDocLabels;
      }
      this.docLabels = allDocumentLabels['Purchase Order'];

      setTimeout(()=>{
        this.onDocumentReady.emit()
     // console.log('subscribe',res, this.docLabels);
      }, 1000);
    },(err) => {
      console.log("Document not ready ->",err);
      this.onDocumentLoadingFailed.emit();
    });
  }

  generateProductDataByColorsSizes(lineItems) {
    const productData = [];

    lineItems.forEach((lineItem: any) => {

      if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
        lineItem.matrixRows = [new MatrixRow({})];
      }

      let totalCount = sum(
        lineItem.matrixRows.map(row => Number(row.quantity))
      );

      lineItem.matrixRows.forEach((row: any) => {
          const defaultImage = (lineItem.quoteCustomImage && lineItem.quoteCustomImage[0]) || 'assets/images/ecommerce/product-image-placeholder.png';

          const newRow = {
            productName: lineItem.productName,
            productId: lineItem.itemNo,
            image: exportImageUrlForPDF(row.imageUrl || defaultImage),
            quantity: +row.quantity,
            price: row.price,
            color: row.color,
            size: row.size,
            cost: row.cost,
            matrixRows: [{
              matrixUpdateId: row.matrixUpdateId,
              size: row.size,
              quantity: row.quantity
            }],
            matrixUpdateId: row.matrixUpdateId,
            customerDescription: lineItem.customerDescription,
            vendorDescription: lineItem.vendorDescription,
            sizeList: [{ size: row.size, quantity: row.quantity }],
            addonCharges: (findIndex(productData, { productId: lineItem.itemNo }) < 0) ? lineItem.addonCharges : [],
            lineItem: lineItem,
            matchOrderQty: totalCount,
            poShippingBillingDetails: !lineItem.poShippingBillingDetails ? {} : lineItem.poShippingBillingDetails
          }
          productData.push(newRow);
      });
    });

    productData.forEach(row => {
      let decoVendors = [];

      if (!row.lineItem.decoVendors) {
        return;
      }

      for (const v of row.lineItem.decoVendors) {
        if (!v.decorationDetails[0])
          break;

        decoVendors.push({
          id: v.decoVendorRecordId,
          designNo: v.designModal,
          image: v.decorationDetails[0].variationImagesThumbnail[0],
          name: v.designName,
          decoLocation: v.decoLocation,
          decoType: v.decoType,
          decoTypeName: v.decoTypeName,
          quantity: row.quantity,
          price: fx2Str(v.customerPrice),
          itemCost: fx2Str(v.itemCost),
          decoVendorId: v.vendorId,
          decoVendorName: v.vendorName,
          decorationDetails: v.decorationDetails,
          addonCharges: v.addonCharges,
          poShippingBillingDetails: v.poShippingBillingDetails
        });
      }

      row.decoVendors = decoVendors;
    });

    return productData;
  }

}

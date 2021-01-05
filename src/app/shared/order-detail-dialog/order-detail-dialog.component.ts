import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { find, findIndex, each, assign, sum } from 'lodash';
import { Subscription, Observable, forkJoin, of } from 'rxjs';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { ModuleField } from 'app/models/module-field';
import { AuthService } from 'app/core/services/auth.service';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { MatrixRow, Artwork, Design, ArtworkVariation, AdditionalCharge, Site } from 'app/models';

@Component({
  selector: 'order-detail-dialog',
  templateUrl: './order-detail-dialog.component.html',
  styleUrls: ['./order-detail-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrderDetailDialogComponent implements OnInit {

  orderId = '';
  designId : any; 
  order : any;
  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;
  loading = false;
  showBasicOrderDetails = false;
  showBillingShippingDetails = false;
  showProducts = false;
  fields = [];
  orderModuleFieldParams = 
  {
      offset: 0,
      limit: 100,
      order: 'module',
      orient: 'asc',
      term: { module : 'Orders' }
  }

  displayedColumns = ['vendor', 'id', 'image', 'color', 'name', 'size', 'quantity'];
  dataSource: MatTableDataSource<any>;
  checkboxes = {};

  constructor(
    public dialogRef: MatDialogRef<OrderDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private msg: MessageService,
    private api: ApiService,
    private auth: AuthService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource([]);
    this.orderId = this.data.orderId;  
    this.designId = this.data.designId;  
    this.showBasicOrderDetails = this.data.showBasicOrderDetails;  
    this.showBillingShippingDetails = this.data.showBillingShippingDetails;  
    this.showProducts = this.data.showProducts;  
    this.getModuleFields(this.orderModuleFieldParams);
    this.getOrderDeatils(this.orderId);
  }

  ngOnInit() {
  }

  getOrderDeatils(id) {
       this.loading = true;
       this.api.getOrderDetails(id)
          .subscribe((response: any[]) => {
               this.order  = response;
               this.loading = false;

		const tableData = [];
		this.order.lineItems.forEach((lineItem: any) => {

		  if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
		    lineItem.matrixRows = [new MatrixRow({})];
		  }

		  lineItem.matrixRows.forEach((row: any) => {
		    const defaultImage = (lineItem.quoteCustomImage && lineItem.quoteCustomImage[0]) || '';
		    const configFields = [
		      'rollAddonChargesToProduct',
		      'rollDecoChargesToProduct',
		      'rollDecoAddonChargesToProduct',
		      'chargeSalesTax',
		      'chargeGstTaxOnPo',
		      'payCommission',
		      'hideLine',
		      'overrideInHandDate'
		    ];
		    let hasConfigs = false;
		    for (let i = 0; i < configFields.length; i++) {
		      const f = configFields[i];
		      if (lineItem[f] === '1') {
			hasConfigs = true;
			i = configFields.length;
		      }
		    }

		    const decoVendors = lineItem.decoVendors.filter((vendor) => {
		      return lineItem.matrixRows.some(mrow => vendor.decorationDetails.length && mrow.matrixUpdateId === vendor.decorationDetails[0].matrixId);
		    });
     
		    const newRow = {
		      vendorName: lineItem.vendorName,
		      productName: lineItem.productName,
		      productId: lineItem.itemNo,
		      lineItemUpdateId: lineItem.lineItemUpdateId,
		      image: row.imageUrl || defaultImage,
		      quantity: +row.quantity,
		      unitQuantity: +row.unitQuantity,
		      uomConversionRatio: row.uomConversionRatio,
		      uomAbbreviation: row.uomAbbreviation,
		      price: row.price,
		      color: row.color,
		      size: row.size,
		      matrixRows: [row],
		      decoType: lineItem.decoType,
		      decoVendors: decoVendors,
		      lineItem,
		      hasConfigs,
		      showAddonCharges: findIndex(tableData, { lineItemUpdateId: lineItem.lineItemUpdateId }) < 0,
		      hasAddonCharges: lineItem.addonCharges && lineItem.addonCharges.length > 0,
		      vendorPONote: lineItem.vendorPONote
		    }
                    if(this.designId > 0){
                       const decoVendorsDesign = decoVendors.filter(dv => dv.designId === this.designId);
                       //console.log(decoVendorsDesign);
                       const decoVendorsDesignIsExist = decoVendorsDesign.filter(dv => dv.decorationDetails.length > 0 && dv.decorationDetails[0].matrixId == row.matrixUpdateId);
                       if(decoVendorsDesignIsExist.length > 0){
                           tableData.push(newRow);
                       }
                       /*
                       if(decoVendorsDesign.length > 0 && decoVendorsDesign[0].decorationDetails.length > 0 && decoVendorsDesign[0].decorationDetails[0].matrixId == row.matrixUpdateId){
                           tableData.push(newRow);
                       }
                       */
                    }else{
                       tableData.push(newRow);
                    }
		    
		  });
		});

		tableData.forEach((row, i) => {
		  let decoImages = [];
		  let decoStatus = true;

		  row.decoVendors.forEach(vendor => {
		    if (!vendor.decorationDetails) {
		      return;
		    }

		    let j = 0;
		    for (; j < vendor.decorationDetails.length; j++) {
		      const decoDetail = vendor.decorationDetails[j];
		      const mrow = find(row.matrixRows, { matrixUpdateId: decoDetail.matrixId });
		      if (mrow && decoDetail) {
			if (decoDetail.variationImagesThumbnail && decoDetail.variationImagesThumbnail[0]) {
			  decoImages.push({
			    location: vendor.decoLocation,
			    url: decoDetail.variationImagesThumbnail[0]
			  });
			} else {
			  decoImages.push({
			    location: vendor.decoLocation,
			    url: '/assets/images/ecommerce/product-image-placeholder.png',
			  });
			}
			break;
		      }
		    }

		    if (j < vendor.decorationDetails.length && (
		      vendor.decoStatus !== 'Done' ||
		      !vendor.decoLocation ||
		      !vendor.vendorId ||
		      !vendor.decoChargeId
		    )) {
		      decoStatus = false;
		    }
		  });

		  let potypes = [];
		  row.matrixRows.forEach(mrow => {
		    if (!mrow.potype && potypes.indexOf(mrow.poType) < 0) {
		      potypes.push(mrow.poType);
		    }
		  });
		  if (potypes.length > 1) {
		    row.poType = 'Multiple';
		  } else {
		    row.poType = potypes[0] || 'DropShip';
		  }

		  if (decoImages.length > 0 && decoStatus) {
		    row.decoTooltip = 'Artwork Approved';
		  } else if (decoImages.length > 0 && !decoStatus) {
		    row.decoTooltip = 'Artwork Pending';
		  } else {
		    row.decoTooltip = 'No Artwork has been added';
		  }

		  row.decoImages = decoImages;
		  row.hasDecorations = decoImages.length > 0;
		  row.decoStatus = decoStatus;
		  row.id = i;
		});

		this.dataSource.data = tableData;

        });

  }

    getModuleFields(params)
    {
        this.api.getFieldsList(params)
            .subscribe((response: any[]) => {
                this.fields = response;          
            });        
    }

  sizeTooltip(row) {
    let sizes = {};
    each(row.matrixRows, mrow => {
      if (sizes[mrow.size]) {
        sizes[mrow.size] += (+mrow.quantity);
      } else {
        sizes[mrow.size] = (+mrow.quantity);
      }
    });

    let rst = [];
    each(sizes, (q, s) => rst.push(q + ' ' + s));

    return rst.join(', ');
  }
}

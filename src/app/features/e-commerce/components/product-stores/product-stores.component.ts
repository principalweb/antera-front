import { Component, OnInit, Input, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductDetails } from '../../../../models';

import { fuseAnimations } from '@fuse/animations';

import { EcommerceProductService } from '../../product/product.service';
import { StoresListComponent } from './stores-list/stores-list.component';
import { StoresFormComponent } from './stores-form/stores-form.component';

@Component({
  selector: 'app-product-stores',
  templateUrl: './product-stores.component.html',
  styleUrls: ['./product-stores.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class ProductStoresComponent implements OnInit {
  @Input() product = new ProductDetails();

  @ViewChild(StoresListComponent) dataList: StoresListComponent;
  dialogRef: MatDialogRef<StoresFormComponent>;

  constructor(
              private dataService: EcommerceProductService,
              public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  createData() {
      let data = {dataId:"",id:"",storeId:"",store:"",margin:"",Attributes:{color:{id:"1",code:"color",storeDetails:[]},size:{id:"2",code:"size",storeDetails:[]}}};
        this.product.ProductPartArray.ProductPart.forEach(part => {
                data.Attributes.color.storeDetails = data.Attributes.color.storeDetails.filter(f => f.color !== part.ColorArray.Color.colorName);
                data.Attributes.color.storeDetails.push({id:"",color:part.ColorArray.Color.colorName,show:"1"});
                data.Attributes.size.storeDetails = data.Attributes.size.storeDetails.filter(f => f.size !== part.ApparelSize.labelSize);
                data.Attributes.size.storeDetails.push({id:"",size:part.ApparelSize.labelSize,show:"1"});
            });
        this.dialogRef = this.dialog.open(StoresFormComponent, {
            panelClass: 'app-stores-form',
            data: data 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.dataList.updateData(response);
            });
  }

  deleteSelectedData() {
    this.dataList.deleteSelected();
  }

  clearFilters() {
   // this.dataList.clearFilters();
  }

}

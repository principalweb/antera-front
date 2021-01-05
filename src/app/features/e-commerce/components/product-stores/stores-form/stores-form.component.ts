import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription ,  Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';

import { StoreDataSource } from 'app/models';
import { EcommerceProductService } from 'app/features/e-commerce/product/product.service';

@Component({
  selector: 'app-stores-form',
  templateUrl: './stores-form.component.html',
  styleUrls: ['./stores-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class StoresFormComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  onStoreListChanged: Subscription;
  dataForm: FormGroup;
  dataId: string = "";
  formData: StoreDataSource = {id:"",storeId:"",store:"",margin:"",Attributes:{color:{id:"1",code:"color",storeDetails:[]},size:{id:"2",code:"size",storeDetails:[]}}};
  stores: any[] = [];
  productColors: any[] = [];
  productSize: any[] = [];

  constructor(
                private msg: MessageService,
                private api: ApiService,
                public dialogRef: MatDialogRef<StoresFormComponent>,
                private fb: FormBuilder,
                private productService: EcommerceProductService,
                @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.formData = this.data;
      this.dataId = this.data.dataId;
      this.formData.Attributes.color.storeDetails = this.formData.Attributes.color.storeDetails.sort((a: any, b: any) => {
          if(a.color.toUpperCase() < b.color.toUpperCase()) {
              return -1;
          } else if(a.color.toUpperCase() > b.color.toUpperCase()) {
              return 1;
          } else {
              return 0;
          }
      })
  }

  ngOnInit() {
      this.onStoreListChanged =
        this.productService.onStoreListChanged
            .subscribe((data:any) => {
                this.stores = data;
            });
    this.productColors = [];
    this.productSize = [];
    this.productColors = this.formData.Attributes.color.storeDetails.map(rowColor => {
        if(rowColor.show == "1") {
            return rowColor.color;
        } else {
            return false;
        }
    });
    this.productSize = this.formData.Attributes.size.storeDetails.map(rowSize => {
        if(rowSize.show == "1") {
            return rowSize.size;
        } else {
            return false;
        }
    });
    this.dataForm = this.fb.group({
        storeId: new FormControl(this.formData.storeId),
        margin: new FormControl(this.formData.margin),
        colors: new FormControl(this.productColors),
        size: new FormControl(this.productSize)
        });
  }

  save() {
    let data = this.dataForm.value;
    if(data.storeId == "") {
        this.msg.show("Please select store", 'error');
        return;
    }
    let store = this.stores.filter(f => f.id == data.storeId);
    if(!store || !store[0]) {
        this.msg.show("Something went wrong with store selection!", 'error');
        return;
    }
    data.store = store[0].store;
    data.dataId = this.dataId;
    if(data.colors.length <= 0) {
        this.msg.show("Please select a color!", 'error');
        return;
    }
    if(data.size.length <= 0) {
        this.msg.show("Please select a size!", 'error');
        return;
    }
    data.Attributes = this.formData.Attributes;
    data.Attributes.size.storeDetails.forEach(rowSize => {
        if(data.size.includes(rowSize.size)) {
            rowSize.show = 1;
        } else {
            rowSize.show = 0;
        }
    });
    data.Attributes.color.storeDetails.forEach(rowColor => {
        if(data.colors.includes(rowColor.color)) {
            rowColor.show = 1;
        } else {
            rowColor.show = 0;
        }
    });
    data.id = this.formData.id;
    this.dialogRef.close(data);
  }

  ngOnDestroy() {
      this.onStoreListChanged.unsubscribe();
      this.formData = null;
      this.productSize = [];
      this.productColors = [];
  }

}

import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription ,  Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';

import { ArtworksService } from 'app/core/services/artworks.service';
import { ProductDecoCustomerList, ProductDecoDesigns, ProductDecoDetail } from 'app/models';
import { EcommerceProductService } from 'app/features/e-commerce/product/product.service';

import { ProductDecoChargesComponent } from '../product-deco-charges/product-deco-charges.component';

@Component({
  selector: 'app-product-deco-form',
  templateUrl: './product-deco-form.component.html',
  styleUrls: ['./product-deco-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class ProductDecoFormComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  onProductChanged: Subscription;
  dataForm: FormGroup;
  formData: ProductDecoDetail = {id:"",productId:"",designId:"",customerId:"",rollPrice:false,show:false,preDecorated:false,autoAttach:true,store:"",mapping:[],location:"",supplierDeco:false,supplierDecoId:""};
  customers: ProductDecoCustomerList[] = [];
  designs: ProductDecoDesigns[] = [];
  stores: any[] = [];
  dataId: string = '0';
  productColors: string[] = [];
  partColors: string[] = [];
  variations: any[] = [];
  variationDetails: any[] = [];
  design: any = {};
  locations: any[] = [];
  supplierLocations: any[] = [];
  supplierDecorations: any[] = [];
  locationsAll: any[] = [];
  showVariation: boolean = false;
  productSource: number = 0;
  showSupplierDeco: boolean = false;

  constructor(
                private msg: MessageService,
                private api: ApiService,
                private dataService: ArtworksService,
                public dialogRef: MatDialogRef<ProductDecoFormComponent>,
                private fb: FormBuilder,
                private activatedRoute: ActivatedRoute,
                private productService: EcommerceProductService,
                @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.dataId = '0';
      if(this.data.id) {
          this.dataId = this.data.id;
      }
      this.loadFormData();
      this.onProductChanged =
        this.productService.onProductChanged
            .subscribe((data:any) => {
                this.stores = data.StoreArray;
                this.formData.productId = data.id;
                data.ProductPartArray.ProductPart.forEach(part => {
                        this.partColors = this.partColors.filter(f => f !== part.ColorArray.Color.colorName);
                        this.partColors.push(part.ColorArray.Color.colorName);
                    });
                this.locationsAll = data.LocationArray.Location;
                this.supplierLocations = data.SupplierLocationArray.Location;
                this.productSource = data.source;
                this.productService.getProductStores(data.id)
                    .subscribe((data:any) => {
                        this.stores = data;
                    });
                    this.loadFormData();
            });
  }

  setDecoration() {
    this.supplierDecorations = [];
    this.showSupplierDeco = false;
    if(this.dataForm.value.supplierDeco && this.dataForm.value.location) {
      const supplierLocation = this.supplierLocations.find(sl => sl.locationId == this.dataForm.value.location);
      supplierLocation.DecorationArray.Decoration.forEach( decoration => {
        this.supplierDecorations.push({name: decoration.decorationName, id:decoration.decorationId});
      });
      this.showSupplierDeco = true;
    }
  }

  setLocation() {
    if(this.dataForm.value.supplierDeco) {
      this.locations = this.locationsAll.filter(loc => loc.sourceId != '');
    } else {
      this.locations = this.locationsAll.filter(loc => loc.sourceId == '');
    }
    this.setDecoration();
  }

  ngOnInit() {
      this.showVariation = false;
      this.dataService.getDesigns()
        .subscribe((response:any) => {
          this.designs = response;
        }, err => {
          console.log(err);
        });
      this.dataService.getArtworkCustomers()
        .subscribe((response:any) => {
          this.customers = response;
        }, err => {
          console.log(err);
        });
      this.loadData();
  }

  loadData() {
    if(this.dataId != '0') {
        this.loading = true;
        this.dataService.getProductDecoData(this.dataId)
            .subscribe((data:any) => {
                this.loading = false;
                data.preDecorated = data.preDecorated==1?true:false;
                data.show = data.show==1?true:false;
                data.rollPrice = data.rollPrice==1?true:false;
                if(data.autoAttach == 1) {
                    data.autoAttach = true;
                } else {
                    data.autoAttach = false;
                }
                if(data.supplierDeco == 1) {
                    data.supplierDeco = true;
                } else {
                    data.supplierDeco = false;
                }
                this.formData = data;
                this.loadFormData();
                this.getDesignVariations();
            }, err => {
                this.loading = false;
                this.msg.show(err.message, 'error');
            });
    }
  }

  getDesignVariations() {
      this.showVariation = false;
      this.loading = true;
      if(this.dataForm.value.designId) {
          this.api.getDesignDetails(this.dataForm.value.designId)
            .subscribe((data:any) => {
                this.variations = data.variation;
                this.variationDetails = [];
                this.variations.forEach((v, index) => {
                    this.variationDetails[v.design_variation_unique_id] = {image:v.itemImageThumbnail[0], title:'Variation ' + (index +1) + ',' + v.design_variation_color + ', ' + v.design_variation_location};
                });
                this.design = data;
                this.setDesignVariations();
            }, err => {
                this.loading = false;
                this.msg.show(err.message, 'error');
            });
      }
  }

  getVariationImage(id) {
      if(id) {
          let variation = this.variations.find(v => v.design_variation_unique_id == id);
          return variation.itemImageThumbnail[0];
      }
      return false;
  }

  getVariationTitle(i) {
      if(this.dataForm.value.mapping['color_'+i] && this.dataForm.value.mapping['color_'+i] != "") {
          let variationIndex = this.variations.findIndex(v => v.design_variation_unique_id == this.dataForm.value.mapping['color_'+i]);
          if(variationIndex != -1) {
              return 'Variation' + (variationIndex+1) + ', ' + this.variations[variationIndex].design_variation_color + ', ' + this.variations[variationIndex].design_variation_location;
          }
      }
      return "";
  }

  setDesignVariations() {
      this.dataForm.removeControl("mapping");
      let fbmap = this.fb.group([]);
      this.dataForm.addControl("mapping", fbmap);
      this.productColors.forEach((color, i) => {
          let fbmap1 = this.dataForm.get("mapping") as FormGroup;
          let designMap = {variationId:""};
          if(this.dataForm.value.designId == this.formData.designId) {
            designMap = this.formData.mapping.find(m => m.color == color);
          }
          if((designMap == undefined || designMap.variationId == undefined || designMap.variationId == '') && this.variations) {
              let variation = this.variations.find(v => {
                if(v.design_variation_color){
                    let arrColor = v.design_variation_color.split(",");
                    if(arrColor.find(c => c == color)) {
                        return true;
                    }
                }
                return false;
              });
              if(variation != undefined) {
                  designMap = {variationId:variation.design_variation_unique_id};
              }
          }
          if((designMap == undefined || designMap.variationId == undefined || designMap.variationId == '') && this.variations && this.variations.length > 0) {
              designMap = {variationId:this.variations[0].design_variation_unique_id};
          }
          if(designMap != undefined && designMap.variationId != "") {
              fbmap1.addControl('color_' + i, new FormControl(designMap.variationId));
          } else {
              fbmap1.addControl('color_' + i, new FormControl(''));
          }
      }, this);
      this.loading = false;
      this.showVariation = true;
  }

  loadFormData() {
    this.dataForm = this.fb.group({
        id: new FormControl(this.formData.id),
        designId: new FormControl(this.formData.designId),
        productId: new FormControl(this.formData.productId),
        customerId: new FormControl(this.formData.customerId),
        autoAttach: new FormControl(this.formData.autoAttach),
        rollPrice: new FormControl(this.formData.rollPrice),
        show: new FormControl(this.formData.show),
        preDecorated: new FormControl(this.formData.preDecorated),
        location: new FormControl(this.formData.location),
        store: new FormControl(this.formData.store),
        supplierDeco: new FormControl(this.formData.supplierDeco),
        supplierDecoId: new FormControl(this.formData.supplierDecoId),
        mapping: this.fb.group([])
        });
    this.setLocation();
    this.setColors();
  }

  getCustomerDesigns() {
      return this.designs.filter((design:any) => design.customerId == this.dataForm.value.customerId);
  }

  save() {
    if(this.dataForm.value.customerId == "" || this.dataForm.value.designId == "") {
        return false;
    }
    let data = { ...this.dataForm.value };
    let mapping = [];
    this.productColors.forEach((color, i) => {
        let mapped = this.formData.mapping.find(v => v.color == color);
        if(mapped && mapped.id) {
            mapped.variationId = data.mapping['color_'+i];
            this.design.variation.forEach(v => {
                if(data.mapping['color_'+i] == v.design_variation_unique_id) {
                    let arrColor = v.design_variation_color.split(",");
                    if(arrColor[0] == "") {
                        arrColor = [];
                    }
                    if(!arrColor.find(c => c == color)) {
                        arrColor.push(color);
                        v.design_variation_color = arrColor.toString();
                    }
                }
            });
            mapping.push(mapped);
        } else {
            mapping.push({color:color, variationId:data.mapping['color_'+i]});
        }
    });
    data.mapping = mapping;
    this.loading = true;
    this.dataService.updateProductDecoData(data)
        .subscribe((data:any) => {
            this.msg.show(data.msg, 'error');
            this.loading = false;
            if(data.id) {
                this.dataId = data.id;
                this.api.updateDesign(this.design)
                    .subscribe((data:any) => {
                    }, err => {
                        this.msg.show(err.message, 'error');
                    });
                this.loadData();
            }
        }, err => {
            this.loading = false;
            this.msg.show(err.message, 'error');
        });
  }

  setColors() {
      this.productColors = [];
      if(this.dataForm.value.store != "") {
          let store = this.stores.find(v => v.storeId == this.dataForm.value.store);
          console.log(store);
          if(store && store.Attributes.color.storeDetails.length > 0) {
              store.Attributes.color.storeDetails.forEach(storeColor => {
                  let i = this.partColors.findIndex(v => v == storeColor.color && storeColor.show == 1);
                  if(i != -1) {
                      this.productColors.push(storeColor.color);
                  }
              });
          }
      } else {
          this.productColors = this.partColors;
      }
      this.setDesignVariations();
  }

  ngOnDestroy() {
      this.dataId = '0';
  }

}

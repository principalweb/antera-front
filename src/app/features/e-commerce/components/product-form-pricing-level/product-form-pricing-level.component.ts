import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { ProductDetails } from 'app/models';
import { MediaDialogComponent } from 'app/shared/media-dialog/media-dialog.component';

import { EcommerceProductService } from '../../product/product.service';
import { ProductPricingMethodService } from '../../products/product-pricing/product-pricing-method.service';

export interface DuplicateTabeResponse {
  extra: {
    createdById: string;
    createdByName: string;
    dateEntered: Date;
    dateModified: Date;
    description: string;
    id: string;
    modifiedById: string;
    modifiedByName: string;
    name: string;
  };
  msg: string;
  status: string;
}

export interface ProductPricingMethod {
  addonPricing: any;
  pricingMethodId: string;
  productId: string;
}

export interface ProductPricingLevel {
  createdById:    string;
  createdByName:  string;
  dateEntered:    string;
  dateModified:   string;
  description:    string;
  id:             string;
  modifiedById:   string;
  modifiedByName: string;
  name:           string;
}

export enum DefaultPricing {
  NAME = 'default',
  ID = '1'
}

@Component({
  selector: "product-form-pricing-level",
  templateUrl: './product-form-pricing-level.component.html',
  styleUrls: ['./product-form-pricing-level.component.css'],
  animations : fuseAnimations
})
export class ProductFormPricingLevelComponent implements OnInit {
  @Output() save = new EventEmitter();
  @Output() addOnPricings = new EventEmitter();
  @Input() priceTable: any;

  currentSelectedId = 1;
  pricingMethodForm: FormGroup;
  product = new ProductDetails();
  productList = [];
  initialProductList = [];
  pricingLevels: Array<any> = [];
  addonPricing: {} = {};
  selected = new FormControl(0);
  currentIndex = 0;
  minlistLenghtHeight = 200;
  titleRows = 1;
  enableFeature = false;
  pricingLevelMethodList = [];
  selectedValue: string;
  referenceProduct: any  = {};

  confirmDialogRef: MatDialogRef<any>;
  dialogRef: MatDialogRef<MediaDialogComponent>;
  loading = false;

  showForm = false;
  pricingName = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
  ]);

  constructor(
    public dialog: MatDialog,
    private productService: EcommerceProductService,
    public msg: MessageService,
    private authService: AuthService,
    private productPricingMethodService: ProductPricingMethodService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.loadProductMethod(this.currentSelectedId);
    this.loadProducts();
    this.loadGlobalPricingMethods();
    // const defaultPricing: any = this.pricingLevels.filter( (pricing) => pricing.id === 1);
    // console.log('setting defauk pricing.... ', defaultPricing);
    this.pricingMethodForm = this.fb.group({
      pricingMethodName: []
    });

    // this.pricingMethodForm.valueChanges.subscribe( (value) => {
    //   console.timeLog('value changed .... ', value);
    //   const valueonForm = this.pricingMethodForm.get('pricingMethodName').value();
    //   console.log('value on form ', valueonForm);
    // });
    
    // this.loadPricingMethods();
  }

  selectionChange(event){
    // console.log('event from drop down ..... ', event.value);
    this.loading = true;
    this.currentSelectedId = event.value;
    this.loadProductMethod(event.value);

  }

  resetValuesAndReload(){
    this.loading = true;
    const methodId = this.currentSelectedId;
    console.log('resetPricingMethodCalculation  .... ');
    // {"productId":"80428","pricingMethodId":"305","reset":"1"}
    this.productPricingMethodService.resetPricingMethodCalculation(methodId).subscribe( (resp) => {
      console.log('response from correct update ', resp);
      this.loadProductMethod(this.currentSelectedId);
    });
  }

  private loadProducts() {
    this.loading = true;
    this.productService.getProduct().then((product) => {
      // console.log('if there is no loaded product ', product);
      // this.product = product;
      this.referenceProduct = product;
      console.log('product received when sending by id on product ', product);
      this.loading = false;
    });
  }//this.productService.addProduct(data)

  saveNewPricingForMethodLevel(data){
    // updatePricingMethods
    //level id
    // addon 
    console.log('psylosd for save ..... ', data);
    console.log(this.currentSelectedId);
    if(this.currentSelectedId === 1){
      // this.product.ProductPartArray.ProductPart

      console.log('product to emit must be this.product.ProductPartArray.ProductPart', this.product);
      // this.save.emit(this.product);
      console.log('emitting product ', this.product);
      console.log('emitting product ProductPartArray.ProductPart', this.product.ProductPartArray.ProductPart);
      this.save.emit(this.product.ProductPartArray.ProductPart);
    } else {
    this.productPricingMethodService.updatePricingMethods(data).subscribe( (resp) => {
      console.log('response from correct update ', resp);
      this.loadProductMethod(this.currentSelectedId);
    });
  }
    // this.productService.addProduct(data).then( (result) => {
    //   console.log('result from update ', result);
    // });
  }

  // private loadPricingMethods() {
  //   this.loading = true;
  //   this.pricingLevels = [];
  //   this.loadDefaultPricingMethodTab();
  //   this.productPricingMethodService.getPricingLevels().subscribe( (level: Array<any> = []) => {
  //     console.log('level from call ', level);
  //     if (level.length > 0) {
  //       this.productService.getPricingMethodsList().subscribe((response: any[]) => {
  //         const allPricingLevels = response.sort(function (a, b) {
  //           return a.id - b.id || a.id(b.id);
  //         });
  //     if (level){
  //        level.forEach(element => {
  //       if (allPricingLevels){
  //           allPricingLevels.filter( (pricing) => {
  //             if ( pricing.id  === 1 || pricing.id == element.pricingMethodId){
  //               this.pricingLevels.push(pricing);
  //               this.loading = false;
  //             }
  //           });
  //          }
  //         });
  //       }
  //       });
  //     }
  //     this.loading = false;
  //   });
  // }

  loadGlobalPricingMethods() {
    this.productPricingMethodService
      .getPricingMethodList()
      .subscribe((pricingMethods: Array<any>) => {
        // console.log('pricingMethods ', pricingMethods);
        pricingMethods.forEach((pricingMethod) => {
          // console.log('pushing methid ', pricingMethod);
          this.pricingLevelMethodList.push(pricingMethod);
          if(pricingMethod.id === '1'){
            this.pricingMethodForm.get('pricingMethodName').setValue(pricingMethod.id);
            this.loadProductMethod(pricingMethod.id);
          }
                this.pricingLevels.push(pricingMethod);
                // console.log('pricing methods ', this.pricingLevels);
                // const defaultPricing: any = this.pricingLevels.filter( (pricing) => pricing.id === 1);
                // console.log('setting defauk pricing.... ', defaultPricing);
                // this.pricingMethodForm.get('pricingMethodName').setValue(defaultPricing.name);

        });
      });
  }

  // private loadDefaultPricingMethodTab() {
  //   const defaultPricing: ProductPricingLevel = {
  //     createdById: '',
  //     createdByName: '',
  //     dateEntered: '',
  //     dateModified: '',
  //     description: '',
  //     id: '1',
  //     modifiedById: '',
  //     modifiedByName: '',
  //     name: 'Standard',
  //   };
  //   this.pricingLevels.push(defaultPricing);
  // }

  // selectedTabChanged(changes){
  //   this.currentIndex = changes.index;

  //   this.loadCurrentProduct();
  // }

  // private loadCurrentProduct() {
  //   const pricingMethodIdSelected = this.getCurrentPricingId();
  //   if (pricingMethodIdSelected > 1) {
  //     this.loadProductMethod(pricingMethodIdSelected);
  //   }
  //   else {
  //     this.loadProducts();
  //   }
  // }

  //  getCurrentPricingId() {
  //   if (this.pricingLevels[this.currentIndex]){
  //     return this.pricingLevels[this.currentIndex].id;
  //   }
  //   return DefaultPricing.ID;
  // }

  private loadProductMethod(pricingMethodIdSelected) {
    this.loading = true;
    // const productLevelId = pricingMethodIdSelected;
    // console.log('sending to productLevelId ', productLevelId);
console.log('xcurrentSelectedId  ', this.currentSelectedId);
    if(this.currentSelectedId.toString() === '1' || this.currentSelectedId === 1){
      
      this.productPricingMethodService.getProductDetails().subscribe( (product: any) => {
        console.log('product seed to rebuild for default  ', product);
        // console.log('receivinng product pricing product should have add on pricing ', product);  
        // this.product = product; 
        // const addonPricing.ProductPartArray.ProductPart
                                    // ProductPartArray.ProductPart[0].partPrice.PartPriceArray.PartPrice
        const productPartArray  =  {ProductPart: product.ProductPartArray.ProductPart};
        console.log('product part array ... .', productPartArray);
        // const productPartArray  =  {ProductPart: product.addonPricing.ProductPartArray.ProductPart};  
        const pricingMethodId = product.pricingMethodId;
        const productId = product.productId;
        const addonPricing = product.addonPricing;
  
        // const productModified: any = { productPartArray, pricingMethodId, productId, addonPricing};
        console.log('product received when sending by id on method ', product); 
        // this.product = productModified;  
  
        const productToLoad: any = {
          ProductPartArray: productPartArray,
          addonPricing: addonPricing,
          id: productId,
        };
        
  
        this.product = productToLoad;
  
        console.log('currently loaded product ---->>>>', this.product);
        // console.log('modfied product ', productModified);
        this.loading = false;

      });

      // ProductPartArray.ProductPart[0].partPrice.PartPriceArray.PartPrice

    } else {
      const methodId = this.currentSelectedId;
      console.log(' methodId .... ', methodId);
      this.productPricingMethodService.reloadUpdatePricingMethods(this.currentSelectedId).subscribe( (val) => {
        console.log('value loaded afetr saver', val);
      });


      this.productPricingMethodService.getProductPricingDetails(pricingMethodIdSelected)
      .subscribe( (product: any ) => {
        console.log('product seed to rebuild  ', product);
        // console.log('receivinng product pricing product should have add on pricing ', product);  
        // this.product = product; 
        // const addonPricing.ProductPartArray.ProductPart
        const productPartArray  =  {ProductPart: product.addonPricing.ProductPartArray.ProductPart};  
        const pricingMethodId = product.pricingMethodId;
        const productId = product.productId;
        const addonPricing = product.addonPricing;
  
        // const productModified: any = { productPartArray, pricingMethodId, productId, addonPricing};
        console.log('product received when sending by id on method ', product); 
        // this.product = productModified;  
  
        const productToLoad: any = {
          ProductPartArray: productPartArray,
          addonPricing: addonPricing,
          id: productId,
        };
        
  
        this.product = productToLoad;
  
        console.log('currently loaded product ---->>>>', this.product);
        // console.log('modfied product ', productModified);
        this.loading = false;
      });

    }
  }

  saveVariationEditor(variation) {
    // if (this.getCurrentPricingId() > 1){
    //   this.savePricingMethod(this.getCurrentPricingId(),  this.product);
    // } else {
      // this.addOnPricings.emit(variation, this.currentSelectedId);
    // }
    const methodId = this.currentSelectedId;
    const newPricing = {variation, methodId};
    console.log('loading for saveVariationEditor ', variation);

    // this.save.emit(newPricing);
    //  {productId, pricingMethodId, addonPricing } = this.product;
    console.log('this product for ref ', this.product);
     const productId = parseInt(this.product.id);
     const pricingMethodId = this.currentSelectedId;
     const addonPricing = { ProductPartArray: this.product.ProductPartArray};
     const api = { api: "antera"};
     const productName = this.referenceProduct.productName;
     const itemCode = this.referenceProduct.itemCode;
     const description = this.referenceProduct.description;
     const vendorId = this.referenceProduct.vendorId;
     const vendorName= this.referenceProduct.vendorName;
    //  const product = {vendorId, vendorName, description, itemCode, productName, api, productId,  pricingMethodId, addonPricing};
    //  const product = {productId,  pricingMethodId, addonPricing};
     const product = {'productId': productId, 'pricingMethodId': pricingMethodId, 'addonPricing' : addonPricing};
 
  console.log('sending product ', product);

    this.saveNewPricingForMethodLevel(product);
  }

  savePriceBreakEditor(variation) {
    const methodId = this.currentSelectedId;
    const newPricing = {variation, methodId};
    // this.save.emit(newPricing);
console.log('loading for savePriceBreakEditor ', variation);
    // this.saveNewPricingForMethodLevel();
    // this.loadPricingMethods();
    const productId =  parseInt(this.product.id);
    const pricingMethodId = this.currentSelectedId;
    // const addonPricing = this.product.ProductPartArray;
    const addonPricing = { ProductPartArray: this.product.ProductPartArray};
    const api = { api: "antera"};
    const productName = this.referenceProduct.productName;
    const itemCode = this.referenceProduct.itemCode;
    const description = this.referenceProduct.description;
    const vendorId = this.referenceProduct.vendorId;
    const vendorName= this.referenceProduct.vendorName;
    // const product = {vendorId, vendorName,description, itemCode, productName, api,  productId,  pricingMethodId, addonPricing};
      const product = {'productId': productId, 'pricingMethodId': pricingMethodId, 'addonPricing' : addonPricing};
    
    console.log('sending product ', product);
    this.saveNewPricingForMethodLevel(product);

  //  console.log('product send to save product ', product);
    // this.loadProductMethod(this.currentSelectedId);
  }

  // toggleNewPricingForm() {
  //   this.showForm = !this.showForm;
  // }

  // getErrorMessage() {
  //   if (this.pricingName.hasError('required')) {
  //     return 'Provide a name';
  //   }
  //   return this.pricingName.hasError('pricingName')
  //     ? 'Not a valid pricingName'
  //     : '';
  // }

  // createNewPricingLevel() {
  //   const user = this.authService.getCurrentUser();
  //   this.showForm = false;
  //   const newPricingName = this.pricingName.value;
  //   const data = {
  //     name: newPricingName,
  //     dateEntered: new Date(),
  //     dateModified: new Date(),
  //     description: '',
  //     createdByName: user.userName,
  //     createdById: user.userId,
  //     modifiedByName: user.userName,
  //     modifiedById: user.userId,
  //   };
  //   const prodPart = this.product['ProductPart'];
  //   this.productService
  //     .createPricingMethods(data)
  //     .subscribe((response: DuplicateTabeResponse) => {
  //     this.savePricingMethod(response.extra.id, this.product);
  //     });
  // }

  // listLenght(event){
  //   console.log('passinh heigh less than 250 ', event);
  //   if(event > this.minlistLenghtHeight ){
  //     this.minlistLenghtHeight = event;
  //     // [rowspan]="tile.rows"
  //   } else {
  //     this.minlistLenghtHeight = 250;
  //   }
  // }

  // private savePricingMethod(productLevelId, product) {
  //   this.productPricingMethodService.createPricingMethods(productLevelId, product)
  //     .subscribe((respons) => {
  //       this.loadPricingMethods();
  //       this.loadCurrentProduct();
  //       this.pricingName.reset();
  //     });
  // }

  // deletePricingLevel() {
  //   const pricingId = this.pricingLevels[this.currentIndex].id;
  //   const pricingName = this.pricingLevels[this.currentIndex].name;

  //   this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
  //     disableClose: false,
  //   });
  //   this.confirmDialogRef.componentInstance.confirmMessage = `Are you sure you want to delete " ${pricingName} " pricing method?`;

  //   this.confirmDialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       this.loading = true;
  // this.productPricingMethodService.deletePricingMethods(pricingId)
  //       .subscribe((respons) => {
  //         this.loadPricingMethods();
  //   });
  //       this.deletePrcingMethodById(pricingId);
  //     }
  //     this.confirmDialogRef = null;
  //   });
  //   return;
  // }

  // private deletePrcingMethodById(pricingId: any) {
  //   this.productService
  //     .deletePricingMethods([pricingId.toString()])
  //     .subscribe(
  //       (response) => {
  //         if (response) {
  //           this.loadProducts();
  //           this.loading = false;
  //         }
  //       },
  //       (err) => {
  //         this.loading = false;
  //         this.confirmDialogRef = null;
  //         this.msg.show('Unable to delete pricing method', 'error');
  //       }
  //     );
  // }
}

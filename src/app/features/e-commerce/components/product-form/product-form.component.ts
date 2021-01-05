import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'app/core/services/message.service';
import { ProductDetails } from '../../../../models/product-details';
import { MediaDialogComponent } from '../../../../shared/media-dialog/media-dialog.component';
import { PriceOption } from '../../../../models';
import { displayName, fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { EcommerceProductService } from '../../product/product.service';
import { AuthService } from 'app/core/services/auth.service';
import { PermissionService } from 'app/core/services/permission.service';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';
import { find } from 'lodash';
import { ModuleField } from 'app/models/module-field';
import { debounceTime, switchMap, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';

const distinct = (value, index, self) => {
  return self.indexOf(value) === index;
}

export interface DuplicateTabeResponse {
extra: {
createdById: string
createdByName: string
dateEntered: Date
dateModified: Date
description: string
id: string
modifiedById: string
modifiedByName: string
name: string
},
msg: string
status: string
}
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {

  product = new ProductDetails();
  pricingLevels: Array<any> = [];
  onProductChanged: Subscription;
  onInventoryListChanged: Subscription;
  addonPricing: {} = {};
  confirmDialogRef: MatDialogRef<any>

  showForm = false;
  sColor: string;
  pageType: string;
  productForm: FormGroup;
  priceTable: any = [];
  inventoryCount = 0;
  dialogRef: MatDialogRef<MediaDialogComponent>;
  formValidationDlgRef: MatDialogRef<FormValidationComponent>;
  fields = [];
  fieldLabel = fieldLabel;
  requiredField = requiredField;
  visibleField = (type, fields) => {
      const isVisible = visibleField(type, fields);
      return isVisible;
  }
  displayName = displayName;
  loading = false;
  descriptions: any[] = [];
  excludeInvalidControls = ['assignedUserId','vendorId'];

  tabs = [];
  selected = new FormControl(0);
  pricingName = new FormControl('', [Validators.required, Validators.minLength(1)]);

  permissionsEnabled: boolean;
  colors: any[];
  quantities: ProductDetails;
  @Input() embed: boolean;
  @Output() saved: EventEmitter<any> = new EventEmitter();
  @Output() cancelled: EventEmitter<any> = new EventEmitter();
  @Output() error: EventEmitter<any> = new EventEmitter();

  constructor(
    private productService: EcommerceProductService,
    private formBuilder: FormBuilder,
    public msg: MessageService,
    public dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private permService: PermissionService,
    private api: ApiService,
  ) {
    this.pageType = 'new';
    this.productForm = this.createProductForm();
    this.productService.getEnabledProductDescriptions()
      .subscribe((response: any[]) => {
        this.descriptions = response;
        this.attachDescriptions();
      });
    this.loadPricingMethods();
  }

  private loadPricingMethods() {
    this.productService.getPricingMethodsList()
      .subscribe((response: any[]) => {
        this.pricingLevels = response.sort(function(a, b) {
          return a.id - b.id  ||  a.id(b.id);
        });;
        this.pricingLevels.forEach(level => {
          if(level.id > 1){
            this.addonPricing[level.id] = { ... this.product.ProductPartArray};
          }
        });
      });
  }

  ngOnInit() {
    if (this.embed) {
      this.productService.pageType = 'new';
    }
    // Subscribe to update product on changes
    this.onProductChanged =
      this.productService.onProductChanged
        .subscribe(product => {
          if (product && this.productService.pageType === 'edit') {
            this.priceTable = [];
            this.colors = [];
            this.product = new ProductDetails(product);
            if (this.product.ProductPartArray.ProductPart && this.product.ProductPartArray.ProductPart.length > 0) {
              this.quantities = this.product.ProductPartArray.ProductPart.flatMap((part) =>
                part.partPrice.PartPriceArray.PartPrice.flatMap(price => price.minQuantity)
              ).filter(distinct);
              let groups = {};
              let colors = {};

              this.product.ProductPartArray.ProductPart.forEach(part => {

                // Group price options by sizes
                let priceOption = new PriceOption(part);
                const size = part.ApparelSize.labelSize;
                if (!groups[size]) {
                  groups[size] = [];
                }
                groups[size].push(priceOption);

                const color = part.ColorArray.Color.colorName;
                if (!colors[color]) {
                  colors[color] = [];
                }
              });
              for (let size in groups) {
                this.priceTable.push({ size: size, priceOptions: groups[size] });
              }
              for (let color in colors) {
                this.colors.push(color);
              }
            }
            //
            this.pageType = this.productService.pageType;
          }
          else {
            this.pageType = 'new';
            this.product = new ProductDetails();
          }

        const productsModuleFieldParams =
        {
            offset: 0,
            limit: 200,
            order: 'module',
            orient: 'asc',
            term: { module : 'Products' }
        }
        this.loading = true;
        this.api.getFieldsList(productsModuleFieldParams)
            .subscribe((res: any[])=> {
                this.fields = res.map(moduleField => new ModuleField(moduleField));
                this.loading = false;
                this.productForm = this.createProductForm();
                this.attachDescriptions();
            },() => {this.loading = false;});

        });

    this.onInventoryListChanged =
      this.productService.onInventoryListChanged
        .subscribe((inventoryList: any[]) => {
          this.inventoryCount = inventoryList && inventoryList.length;
        });

    this.permService.getPermissionStatus().subscribe((res: any) => {
      if (res == '0' || res == 0 || res == false) {
        res = false
      } else {
        res = true;
      }

      this.permissionsEnabled = res;
    });

    console.log("id", this.productForm.get("id"));
    this.productForm.controls.id.valueChanges.subscribe(id => console.log("id", id));
  }

  ngOnDestroy() {
    if (this.onProductChanged) this.onProductChanged.unsubscribe();
    if (this.onInventoryListChanged) this.onInventoryListChanged.unsubscribe();
  }

  createProductForm() {
    let systemEvents = this.product.SystemEventArray.filter(rowEvent => {
        return rowEvent.eventId&&rowEvent.eventId!="0"&&rowEvent.eventId!="";
    });
    return this.formBuilder.group({
      id: [this.product.id],
      source: [{ value: this.product.source, disabled: true }, Validators.required],
      poType: requiredField('poType',this.fields) ? [this.product.poType, Validators.required] : [this.product.poType],
      division: requiredField('division',this.fields) ? [this.product.division, Validators.required] : [this.product.division],
      taxEnabled: [true],
      productType: requiredField('productType',this.fields) ? [this.product.productType, Validators.required] : [this.product.productType],
      calculatorType: requiredField('calculatorType',this.fields) ? [this.product.calculatorType, Validators.required] : [this.product.calculatorType],
      taxJarCat: [this.product.taxJarCat],
      taxJarObj: requiredField('taxJarObj',this.fields) ? [this.product.taxJarObj, Validators.required] : [this.product.taxJarObj],
      anteraID: requiredField('anteraId',this.fields) ? [this.product.anteraId, Validators.required] : [this.product.anteraId],
      inhouseId: [this.product.inhouseId, Validators.required],
      productId: [this.product.productId, Validators.required],
      itemCode: [this.product.itemCode, Validators.required],
      productName: [this.product.productName, Validators.required],
      description: [this.product.description, Validators.required],
      tariffCode: [this.product.tariffCode],
      msrp: [this.product.msrp],
      countryOrigin: [this.product.countryOrigin],
      vendorName: [this.product.vendorName, Validators.required],
      vendorId: [this.product.vendorId, Validators.required],
      assignedUserId: [this.product.assignedUserId],
      hideOnOrder: [this.product.hideOnOrder],
      assignedUserName: requiredField('assignedUserName',this.fields) ? [this.product.assignedUserName, Validators.required] : [this.product.assignedUserName],
      expirationDate: requiredField('expirationDate',this.fields) ? [this.product.expirationDate, Validators.required] : [this.product.expirationDate],
      prodStatus: requiredField('prodStatus',this.fields) ? [this.product.prodStatus, Validators.required] : [this.product.prodStatus],
      prodKind: requiredField('prodKind',this.fields) ? [this.product.prodKind, Validators.required] : [this.product.prodKind],
      qbExpenseAccount: requiredField('qbExpenseAccount',this.fields) ? [this.product.qbExpenseAccount, Validators.required] : [this.product.qbExpenseAccount],
      qbIncomeAccount: requiredField('qbIncomeAccount',this.fields) ? [this.product.qbIncomeAccount, Validators.required] : [this.product.qbIncomeAccount],
      qbAssetAccount: requiredField('qbAssetAccount',this.fields) ? [this.product.qbAssetAccount, Validators.required] : [this.product.qbAssetAccount],
      imprintinfo: [this.product.imprintinfo],
      lot: [this.product.lot],
      production: requiredField('production',this.fields) ? [this.product.production, Validators.required] : [this.product.production],
      sequence: [this.product.sequence],
      uomSetRef: requiredField('uomSetRef',this.fields) ? [this.product.uomSetRef, Validators.required] : [this.product.uomSetRef],
      rebate: requiredField('rebate',this.fields) ? [this.product.rebate, Validators.required] : [this.product.rebate],
      coop: requiredField('coop',this.fields) ? [this.product.coop, Validators.required] : [this.product.coop],
      cloneId: [this.product.cloneId],
      rank: requiredField('rank',this.fields) ? [this.product.rank, Validators.required] : [this.product.rank],
      specialPrice: requiredField('specialPrice',this.fields) ? [this.product.specialPrice, Validators.required] : [this.product.specialPrice],
      package: requiredField('package',this.fields) ? [this.product.package, Validators.required] : [this.product.package],
      weight: requiredField('weight',this.fields) ? [this.product.weight, Validators.required] : [this.product.weight],
      ProductCategoryArray: [this.product.ProductCategoryArray],
      LocationArray: [this.product.LocationArray],
      width: requiredField('width',this.fields) ? [this.product.width, Validators.required] : [this.product.width],
      height: [this.product.height],
      depth: [this.product.depth],
      extraShippingFee: [this.product.extraShippingFee],
      StoreArray: [this.product.StoreArray],
      SystemEventArray: requiredField('SystemEventArray',this.fields) ? [this.product.SystemEventArray, Validators.required] : [this.product.SystemEventArray],
      DescriptionArray: this.formBuilder.group([]),
      customerMarginArray: this.createcustomerMarginArray()
    });

  }

  createcustomerMarginArray() {
    let formArray = this.formBuilder.array([]);
    let arr = this.product.CustomerMarginArray;
    if(arr.CustomerMargin) {
      if(arr.CustomerMargin.length > 0) {
        let form;
        arr.CustomerMargin.forEach(element => {
          formArray.push(this.formBuilder.group({
            id: element.id,
            accountName: element.accountName,
            accountId: element.accountId,
            margin: element.margin,
            delete: false
          }));
        });
        return formArray;
      } else {
        formArray.push(this.formBuilder.group({
          id: '',
          accountName: '',
          accountId: '',
          margin: '',
          delete: false
        }));
        return formArray;
      }
    } else {
      formArray.push(this.formBuilder.group({
        id: '',
        accountName: '',
        accountId: '',
        margin: '',
        delete: false
      }));
      return formArray;
    }

  }

  attachDescriptions() {
    if (this.descriptions) {
      this.descriptions.forEach(function (sd) {
        let fbsd = this.productForm.get("DescriptionArray") as FormGroup;
        let descArr = this.product.DescriptionArray.find(d => d.type == sd.type);
        let desc = "";
        if (descArr && descArr[0]) {
          descArr = descArr[0];
        }
        if (descArr && descArr.description) {
          desc = descArr.description;
        }
        fbsd.addControl(sd.type, new FormControl(desc));
      }, this);
    }
  }

  cloneProduct() {
    if (this.productForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    let DescriptionArray = [];
    this.descriptions.forEach(function (sd) {
      DescriptionArray.push({ type: sd.type, description: this.productForm.value.DescriptionArray[sd.type] });
    }, this);
    //return;
    const data = {
      api: "clone",
      ...this.productForm.value,
      source: this.product.source,
      ProductPartArray: [...this.product.ProductPartArray],
      KitArray: this.product.KitArray,
      RelatedProductArray: this.product.RelatedProductArray,
      MediaContent: this.product.MediaContent,
      DescriptionArray: DescriptionArray
    };
    data.cloneId = data.id;
    delete data.inhouseId;
    data.id = "";
    console.log("Submitted Data:", data);
    this.loading = true;
    this.productService.addProduct(data)
      .then((data: any) => {
        this.loading = false;
        console.log("Response:", data);
        this.product.id = data.id;
        let message;
        if (!data.msg) {
          message = "Product updated.";
          // Change the location with new one if new
          if (this.pageType == 'new') {
            message = "Product added.";
          }
          this.router.navigate(['/e-commerce/products', data.id]);
          //this.productService.onProductChanged.next(data);
        }
        else {
          message = data.msg;
        }
        // Show the success message
        this.msg.show(message, 'success');
      }).catch(err => {
        console.log("Error ->", err);
      });
  }

  saveProduct() {
    if(visibleField('expirationDate', this.fields)  && this.productForm.get('expirationDate').value && this.productForm.get('expirationDate').value !== '0000-00-00' && !moment(this.productForm.get('expirationDate').value).isValid()){
      this.msg.show(fieldLabel('expirationDate', this.fields)+' is not valid date', 'error');
      return;
    }
    if(this.productForm && this.productForm.value && this.productForm.value.expirationDate) {
      this.productForm.value.expirationDate = this.productForm.get('expirationDate').value ? moment(this.productForm.get('expirationDate').value).format('YYYY-MM-DD') : null
    }

    if (this.productForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
        panelClass: 'app-form-validation',
        data: {
          action: 'update',
          moduleForm: this.productForm,
          fields: this.fields,
          excludeInvalidControls: this.excludeInvalidControls
        }
      });

      this.formValidationDlgRef.afterClosed().subscribe(data => {
        if (data) {
          data.invalidControls.forEach((control) => {
            this.productForm.get(control).markAsTouched();
          });
        }
        this.formValidationDlgRef = null;
      });
      return;
    }
    let DescriptionArray = [];
    this.descriptions.forEach(function (sd) {
      DescriptionArray.push({ type: sd.type, description: this.productForm.value.DescriptionArray[sd.type] });
    }, this);
    //return;
    let eventArray = this.productForm.value.SystemEventArray.map(rowEvent => ({...rowEvent})).map(rowEvent => {;
        if(!rowEvent.eventId || rowEvent.eventId == "") {
            rowEvent.eventId = rowEvent.id;
            rowEvent.id = "";
        }
        return rowEvent;
    });
    const data = {
      api: "antera",
      ...this.productForm.value,
      currencyCode: this.product.currencyCode,
      source: this.product.source,
      showColor: this.product.showColor,
      showSize: this.product.showSize,
      orderMinPricebreak: this.product.orderMinPricebreak,
      ProductPartArray: {...this.product.ProductPartArray},
      MediaContent: this.product.MediaContent,
      KitArray: this.product.KitArray,
      RelatedProductArray: this.product.RelatedProductArray,
      CustomerMarginArray: this.product.CustomerMarginArray,
      ChargeArray: this.product.ChargeArray,
      DescriptionArray: DescriptionArray,
      StoreArray: this.product.StoreArray,
      SystemEventArray: eventArray,
      permUserId: this.authService.getCurrentUser().userId,
      addonPricing: this.addonPricing
    };
    data.hideOnOrder = data.hideOnOrder ? 1 : 0;
    console.log("Submitted Data:", data);
    this.loading = true;
    this.productService.addProduct(data)
      .then((data: any) => {
        this.loading = false;
        console.log("Response:", data);
        let message;
        if (!data.msg) {
          message = "Product updated.";
          // Change the location with new one if new
          if (this.pageType == 'new') {
            message = "Product added.";

            if (!this.embed) {
              this.router.navigate(['/e-commerce/products', data.id]);
            } else {
              this.saved.emit(data);
            }

          }
          this.productService.onProductChanged.next(data);
        }
        else {
          message = data.msg[0];
        }
        // Show the success message
        this.msg.show(message, 'success');
      }).catch(err => {
        console.log("Error ->", err);
        if (this.embed) {
          this.error.emit(err);
        }
      });
  }

  addNewPriceOptions(option) {
    const partData = {
      partId: '',
      ColorArray: { Color: { colorName: option.color } },
      ApparelSize: { labelSize: option.value },
      partPrice: {
        partId: option.partId,
        PartPriceArray: {
          PartPrice: option.priceBreaks
        }
      }
    }
    this.product.ProductPartArray.ProductPart.push(partData);
    this.saveProduct();
  }

  savePriceOption(option, i) {
    // Replace the priceOptions on the priceTable
    // this.priceTable.splice(i, 1, option);
    let priceIndex: number = this.priceTable[i].priceOptions.findIndex((priceOption) => {
      return priceOption.partId === option.partId;
    });
    let previousPrice = this.priceTable[i].priceOptions[priceIndex];
    this.priceTable[i].priceOptions.splice(priceIndex, 1, option);

    const updatedProductArray = this.product.ProductPartArray.ProductPart.map(pricePart => {
      if (option.partId === pricePart.partId) {
        this.sColor = option.color;
        pricePart.ColorArray.Color.colorName = option.color;
        pricePart.ApparelSize.labelSize = option.value;
        pricePart.partPrice.PartPriceArray.PartPrice = option.priceBreaks;
        pricePart.max = option.max;
        pricePart.min = option.min;
      }
      if (pricePart.ApparelSize.labelSize === previousPrice.value) {
        pricePart.value = option.value;
      }
      return pricePart;
    });
    console.log('updating price array ... ', updatedProductArray );
    this.product.ProductPartArray.ProductPart = [...updatedProductArray];
    // this.saveProduct();
  }

  saveVariationEditor($event) {
    this.product.ProductPartArray.ProductPart = [... $event];
    this.saveProduct();
  }

  addOnPricings(event){
    this.addonPricing = event.variation;
    this.product.ProductPartArray.ProductPart = [... event];
    this.saveProduct();
  }

  saveCharges($event) {
    this.product.ChargeArray.Charge = $event;
  }


  trackByIndex(index, item) {
    return index;
  }

  cancel() {
    if (!this.embed) {
      this.router.navigate(['/e-commerce/products']);
    } else {
      this.cancelled.emit(true);
    }
  }

  toggleNewPricingForm(){
    this.showForm = !this.showForm;
  }

  getErrorMessage() {
    if (this.pricingName.hasError('required')) {
      return 'Provide a name';
    }
    return this.pricingName.hasError('pricingName') ? 'Not a valid pricingName' : '';
  }

  deletePricingLevel(index: number, pricingId: number) {

    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });
    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this pricing method?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
            this.productService.deletePricingMethods([pricingId.toString()]).subscribe( (response) => {
              if(response){
                this.pricingLevels.splice(index, 1);
                this.loadPricingMethods();
                this.loading = false;
              }
          }, (err) => {
            this.loading = false;
            this.confirmDialogRef = null;
            this.msg.show('Unable to delete pricing method', 'error');
          });
      }
      this.confirmDialogRef = null;
    });
    return;
  }

  createNewPricingLevel(){
    this.showForm = false
    const newPricingName =  this.pricingName.value;
    const data = {
    "name": newPricingName,
    "dateEntered": new Date(),
    "dateModified": new Date(),
    "description": "",
    "createdByName": "Antera Support",
    "createdById": "100ba87a-cb40-4407-9bef-4fe3a7d8a367",
    "modifiedByName": "Antera Support",
    "modifiedById": "100ba87a-cb40-4407-9bef-4fe3a7d8a367"};
      this.productService.createPricingMethods(data)
      .subscribe( (response: DuplicateTabeResponse) => {
      const pricingLevelId = response.extra.id;
      this.addonPricing[pricingLevelId] = [...this.product.ProductPartArray];
      this.loadPricingMethods();
      this.pricingName.reset();
    });
  }
}

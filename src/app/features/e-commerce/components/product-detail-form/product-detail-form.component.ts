import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { ProductDetails } from '../../../../models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ApiService } from 'app/core/services/api.service';
import { displayName } from '../../utils';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-detail-form',
  templateUrl: './product-detail-form.component.html',
  styleUrls: ['./product-detail-form.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class ProductDetailFormComponent implements OnInit {
  @Input() product: ProductDetails;
  @Input() embedded = false;
  @Output() cancel = new EventEmitter<any>();
  @Output() save = new EventEmitter<any>();

  productForm: FormGroup;
  leadSources = ['DropShip', 'Stock'];

  filteredVendors = [];
  displayName = displayName;

  constructor(        
    private formBuilder: FormBuilder,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.productForm = this.createProductForm();
    this.productForm.get('vendorName').valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(val => {
        if (val.length >=3 ){
            this.api.getVendorAutocomplete(val).subscribe((res: any[]) => {
                this.filteredVendors = res;
            });
        }
    })
  }

  createProductForm()
  {
      return this.formBuilder.group({
          id              : [this.product.id],
          source          : [this.product.source],
          poType          : [this.product.poType],
          division        : [this.product.division],
          taxEnabled      : [this.product.taxEnabled],
          productType     : [this.product.productType],
          anteraID        : [this.product.id],
          inhouseId       : [this.product.inhouseId],
          productId       : [this.product.productId],
          itemCode        : [this.product.itemCode],
          productName     : [this.product.productName],
          description     : [this.product.description],
          vendorName      : [{value: this.product.vendorName, disabled: true }],
          vendorId        : [this.product.vendorId],
          expense         : [this.product.qbExpenseAccount],
          income          : [this.product.qbIncomeAccount],
          asset           : [this.product.qbAssetAccount],
          imprintinfo     : [this.product.imprintinfo],
          lot             : [this.product.lot],
          production      : [this.product.production],
          sequence        : [this.product.sequence],
          uomSet          : [this.product.uomSetRef],
          rebate          : [this.product.rebate],
          coop            : [this.product.coop],
          specialPrice    : [this.product.specialPrice],
          package         : [this.product.package],
          weight          : [this.product.weight],
          categories      : [this.product.ProductCategoryArray],
          width           : [this.product.width],
          height          : [this.product.height],
          depth           : [this.product.depth],
          extraShippingFee: [this.product.extraShippingFee],
          stores          : [this.product.StoreArray]

      });
  }

  onCancel() {
    this.cancel.emit();
  }

  onSave() {
    this.save.emit(this.productForm.value);
  }

  selectVendor(event: MatAutocompleteSelectedEvent): void {
    const vendor = event.option.value;
    this.productForm.patchValue({
        vendorName: vendor.name,
        vendorId: vendor.id
    })
  }

  displayWith(vendor) {
      if (!vendor) {
          return '';
      }
      return vendor.name;
  }
}

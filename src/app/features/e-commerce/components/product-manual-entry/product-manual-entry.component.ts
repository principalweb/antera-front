import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-manual-entry',
  templateUrl: './product-manual-entry.component.html',
  styleUrls: ['./product-manual-entry.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductManualEntryComponent implements OnInit {

  productForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      id              : ['', Validators.required],
      source          : ['', Validators.required],
      poType          : [''],
      division        : [''],
      taxEnabled      : [''],
      productType     : [''],
      anteraID        : [''],
      inhouseId       : ['', Validators.required],
      productId       : ['', Validators.required],
      itemCode        : ['', Validators.required],
      productName     : ['', Validators.required],
      description     : [''],
      vendorName      : ['', Validators.required],
      expense         : [''],
      income          : [''],
      asset           : [''],
      colors          : ['', Validators.required],
      imprintinfo     : ['', Validators.required],
      lot             : [''],
      production      : ['', Validators.required],
      sequence        : ['', Validators.required],
      uomSet          : [''],
      rebate          : ['', Validators.required],
      coop            : ['', Validators.required],
      specialPrice    : ['', Validators.required],
      package         : ['', Validators.required],
      weight          : ['', Validators.required],
      categories      : [''],
      width           : [''],
      height          : [''],
      depth           : [''],
      extraShippingFee: [''],
      stores          : ['']
    });
  }

  ngOnInit() {}

  addToProduct() {
    console.log('add to product');
  }

}

import { Component, OnInit, Optional, Inject, Input, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ProductDetails } from 'app/models';
import { ProductFormComponent } from 'app/features/e-commerce/components/product-form/product-form.component';

@Component({
  selector: 'order-create-product-dialog',
  templateUrl: './order-create-product-dialog.component.html',
  styleUrls: ['./order-create-product-dialog.component.scss']
})
export class OrderCreateProductDialogComponent implements OnInit, AfterViewInit {

  @Input() product: ProductDetails;
  @ViewChild(ProductFormComponent) productFormComponent: ProductFormComponent;
  form: FormGroup;

  constructor(
    @Optional() private dialogRef: MatDialogRef<OrderCreateProductDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) data,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.form = this.createForm();
  }

  ngAfterViewInit(): void {
    this.productFormComponent.productForm.patchValue(this.product);
  }

  save() {
    this.productFormComponent.saveProduct();
  }

  onFormSaved(event) {
    console.log('PRODUCT SAVED', event);
    this.dialogRef.close(event);
  }

  onFormError(event) {
    
  }

  close() {
    this.dialogRef.close(false);
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [this.product.id],
      source: [{ value: this.product.source, disabled: true }, Validators.required],
      poType: [this.product.poType],
      division: [this.product.division],
      taxEnabled: [this.product.taxEnabled == '1' ? true : false],
      productType: [this.product.productType],
      taxJarCat: [this.product.taxJarCat],
      anteraID: [this.product.anteraId],
      inhouseId: [this.product.inhouseId, Validators.required],
      productId: [this.product.productId, Validators.required],
      itemCode: [this.product.itemCode, Validators.required],
      productName: [this.product.productName, Validators.required],
      description: [this.product.description, Validators.required],
      vendorName: [this.product.vendorName, Validators.required],
      vendorId: [this.product.vendorId, Validators.required],
    });
  }

}

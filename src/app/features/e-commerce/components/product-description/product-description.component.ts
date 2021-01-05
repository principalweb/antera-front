import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-description',
  templateUrl: './product-description.component.html',
  styleUrls: ['./product-description.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductDescriptionComponent implements OnInit {

  row: any;
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ProductDescriptionComponent>,
    public formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.row = data.row;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      productName: [this.row.productName, Validators.required],
      customerDescription: [this.row.lineItem.customerDescription || '', Validators.maxLength(550)],
      vendorDescription: [this.row.lineItem.vendorDescription || '', Validators.maxLength(550)]
    });
  }

  save() {
    this.dialogRef.close({
      action: 'update',
      data: this.form.value
    });
  }

}

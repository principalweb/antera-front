import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MatrixRow } from 'app/models';


@Component({
  selector: 'app-price-override-dialog',
  templateUrl: './price-override.component.html',
  styleUrls: ['./price-override.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PriceOverrideComponent {
  form: FormGroup;
  loading: boolean = false;
  orderId: any;
  row: MatrixRow;
  useUom: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PriceOverrideComponent>,
    private fb: FormBuilder,
    private api: ApiService
  ) {
    this.row = data.row;

    if (this.row.uomId) {
      this.useUom = true;
    }

    this.form = this.fb.group({
      price: [data.price, Validators.required],
      unitPrice: [data.unitPrice]
    });

    this.orderId = data.oId;
  }

  syncUnitPriceUpdate(event) {
    if (!this.useUom) {
      return;
    }

    const value = event.target.value / this.row.uomConversionRatio;
    this.form.get('price').setValue(value);
  }

  syncPriceUpdate(event) {
    if (!this.useUom) {
      return;
    }

    const value = event.target.value * this.row.uomConversionRatio;
    this.form.get('unitPrice').setValue(value);
  }

  save() {
    this.dialogRef.close(this.form.value);
  }
}

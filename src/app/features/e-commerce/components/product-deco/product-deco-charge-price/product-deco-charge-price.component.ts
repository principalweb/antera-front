import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'product-deco-charge-price',
  templateUrl: './product-deco-charge-price.component.html',
  styleUrls: ['./product-deco-charge-price.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductDecoChargePriceComponent implements OnInit {
  priceForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ProductDecoChargePriceComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.createForm();
  }

  private createForm() {

    this.priceForm = this.fb.group({
      'chargePrice': this.fb.array([]),
    });
    const chargePrice = this.priceForm.get('chargePrice') as FormArray;

    this.data.ChargePriceArray.ChargePrice.forEach((chp) => {

        chargePrice.push(
          this.fb.group(chp)
        );
      });
  }

  public save() {
    const value = this.priceForm.value.chargePrice;
    this.dialogRef.close(value);
  }

  public close() {
    this.dialogRef.close();
  }


  private addPriceBreak() {
    const chargePrice = this.priceForm.get('chargePrice') as FormArray;
    chargePrice.push(
      this.fb.group({
        price: '0',
        salePrice: '0',
        xMinQty: '1',
        xUom: 'EA',
        yMinQty: '0',
        yUom: ''
      })
    );
  }

}

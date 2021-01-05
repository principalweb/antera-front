import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { PriceBreak } from 'app/models';
import { GlobalConfigService } from 'app/core/services/global.service';

@Component({
  selector: 'app-update-sku-dialog',
  templateUrl: './update-sku-dialog.component.html',
  styleUrls: ['./update-sku-dialog.component.scss']
})
export class UpdateSkuDialogComponent implements OnInit {
  selection: any;
  quantities: any;
  variationForm: FormGroup;
  defaultMargin: any;
  config: any;

  constructor(
    public dialogRef: MatDialogRef<UpdateSkuDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private fb: FormBuilder,
    private globalConfig: GlobalConfigService,
  ) { }

  ngOnInit() {
    this.selection = this.data.selection;
    this.quantities = this.data.quantities.map(num => +num);
    this.variationForm = this.createForm();
    this.defaultMargin = this.data.config ? this.data.config.productsMargin : 40;
    this.config = this.globalConfig.getSysConfig();
  }


  private createForm() {

    const part = this.selection[0];

    const form = this.fb.group({
      'prCode': [part.prCode],
      'min': [part.min],
      'max': [part.max],
      'partPrice': this.fb.array([]),
      'priceType': part.priceType,
      'saleStartDate': part.saleStartDate,
      'saleEndDate': part.saleEndDate,
      'sku': part.sku,
      'newQuantity': [],
    });


    const priceBreaks = form.get('partPrice') as FormArray;

    this.quantities.forEach((quantity) => {

      const matchQuantity = part.partPrice.PartPriceArray.PartPrice.find((priceBreak) => {
        return priceBreak.minQuantity == quantity;
      });

      if (matchQuantity) {
        priceBreaks.push(
          this.fb.group(
            new PriceBreak({
              margin: matchQuantity.margin,
              minQuantity: matchQuantity.minQuantity,
              price: matchQuantity.price,
              salePrice: matchQuantity.salePrice,
              totalPrice: matchQuantity.totalPrice,
              totalProfit: matchQuantity.totalProfit,
              totalSalesPrice: matchQuantity.totalSalesPrice,
              unitProfit: matchQuantity.unitProfit,
            }, this.config).toObject()
          )
        );
      } else {
        priceBreaks.push(
          this.fb.group(
            new PriceBreak({
              'minQuantity': quantity,
              'price': '0',
              'salePrice': '0',
              'margin': this.defaultMargin, // Use default margin
              'unitProfit': 0,
              'totalPrice': 0,
              'totalSalesPrice': 0,
              'totalProfit': 0
            }, this.config).toObject()
          )
        );
      }
    });

    return form;
  }


  addPriceBreak(): void {
    let quantity = this.variationForm.get('newQuantity').value;

    if (!quantity || this.quantities.indexOf(quantity) !== -1) {
      quantity = 0;
    }

    this.quantities.push(quantity);
    // this.quantities.sort((a, b) => {
    //   return (+a > +b) ? 1 : ((+b > +a) ? -1 : 0);
    // });

    const partPrice = this.variationForm.get('partPrice') as FormArray;

    partPrice.push(
      this.fb.group(
        new PriceBreak({
          'minQuantity': quantity,
          'price': '0',
          'salePrice': '0',
          'margin': this.defaultMargin, // Use default margin
          'unitProfit': 0,
          'totalPrice': 0,
          'totalSalesPrice': 0,
          'totalProfit': 0
        }, this.config).toObject()
      )
    );

    // partPrice.controls.sort((a:any, b:any) => {
    // return (+a.minQuantity > +b.minQuantity) ? 1 : ((+b.minQuantity > +a.minQuantity) ? -1 : 0);
    // });
  }

  priceUpdated(event, i) {
    console.log('Price updated', event, i);
    const partPrice = this.variationForm.get('partPrice') as FormArray;
    let priceBreak = new PriceBreak(partPrice.at(i).value, this.config);

    priceBreak.updatePrice(event.target.value);
    partPrice.at(i).setValue(priceBreak.toObject());
  }

  marginUpdated(event, i) {
    console.log('Margin updated', event, i);
    const partPrice = this.variationForm.get('partPrice') as FormArray;
    let priceBreak = new PriceBreak(partPrice.at(i).value, this.config);

    priceBreak.updateMargin(event.target.value);
    partPrice.at(i).setValue(priceBreak.toObject());
  }


  salePriceUpdated(event, i) {

    const partPrice = this.variationForm.get('partPrice') as FormArray;
    console.log('Sale price updated', event, i, partPrice.at(i).value);
    let priceBreak = new PriceBreak(partPrice.at(i).value, this.config);

    priceBreak.updateSalesPrice(event.target.value);
    partPrice.at(i).setValue(priceBreak.toObject());
  }


  save() {
    const value = this.variationForm.value;
    this.dialogRef.close(value);
  }

  close() {
    this.dialogRef.close();
  }

}

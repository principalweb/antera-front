import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DefaultChargeTypes } from 'app/models';

@Component({
  selector: 'app-edit-charge',
  templateUrl: './edit-charge.component.html',
  styleUrls: ['./edit-charge.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditChargeComponent implements OnInit {

  form: FormGroup;
  chargeTypes = DefaultChargeTypes;
  totalCount: any;
  orderConfig: any;

  constructor(
    public dialogRef: MatDialogRef<EditChargeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder
  ) {

    if (data.deco) {
      this.totalCount = data.deco.quantity;
    } else {
      this.totalCount = data.item.matrixRows.reduce((total, row) => {
        return total + Number(row.quantity).valueOf();
      }, 0);

      if (data.addon.matchOrderQty == '1' && this.totalCount != data.addon.quantity) {
        data.addon.quantity = this.totalCount;
      }
    }

    let restrictEditPrice = false;

    if (data.config) {
      this.orderConfig = data.config.module.settings;

      if (data.config.permissions 
        && data.config.permissions.restrict_order_sales_pricing 
        && data.config.permissions.restrict_order_sales_pricing.data) {
          restrictEditPrice = true;
      }
    }

    this.form = this.fb.group({
      addonChargeUpdateId: [data.addon.addonChargeUpdateId || ''],
      addonChargesType: [data.addon.addonChargesType || 'Default'],
      name: [data.addon.name || '', Validators.required],
      code: [data.addon.code || '', Validators.required],
      description: [data.addon.description || ''],
      quantity: [{
        value: data.addon.quantity || '',
        disabled: data.addon.matchOrderQty
      }, Validators.pattern('^[-+]?[0-9]*\.?[0-9]+$')],
      cost: [data.addon.cost || '', Validators.pattern('^[-+]?[0-9]*\.?[0-9]+$')],
      price: [{
        value: data.addon.price || '',
        disabled: restrictEditPrice,
      }, Validators.pattern('^[-+]?[0-9]*\.?[0-9]+$')],
      rollbackDistributeRows: [data.addon.rollbackDistributeRows],
      isCommissionEnabled: [data.addon.isCommissionEnabled],
      chargeGstTaxOnPo: [data.addon.chargeGstTaxOnPo],
      matchOrderQty: [data.addon.matchOrderQty],
      itemTaxOff: [data.addon.itemTaxOff],
    });
  }

  ngOnInit() { }

  onClose(save: boolean = false) {
    if (save && this.form.invalid) {
      return;
    }

    if (save) {
      this.dialogRef.close({
        ...this.data.addon,
        ...this.form.value,
      });
    } else {
      this.dialogRef.close();
    }
  }

  toggleMatchQuantity() {
    const control = this.form.get('matchOrderQty');
    const qtyControl = this.form.get('quantity');
    const adjustments: any = {
      matchOrderQty: !control.value,
    };
    if (adjustments.matchOrderQty) {
      adjustments.quantity = this.totalCount;
      qtyControl.disable();
    } else {
      adjustments.quantity = 1;
      qtyControl.enable();
    }
    this.form.patchValue(adjustments);
  }

  toggleTax() {
    this.form.get('itemTaxOff').setValue(
      !this.form.get('itemTaxOff').value
    );
  }

}

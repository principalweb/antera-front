import { Component, OnInit, Input, Optional, Inject } from '@angular/core';
import { LineItem, OrderDetails } from 'app/models';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'item-notes-dialog',
  templateUrl: './item-notes-dialog.component.html',
  styleUrls: ['./item-notes-dialog.component.css']
})
export class ItemNotesDialogComponent implements OnInit {

  @Input() item: LineItem;
  @Input() order: OrderDetails;
  @Input() config: any;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<ItemNotesDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) data
  ) { }

  ngOnInit() {
    this.form = this.createForm();
  }

  get decoVendorsFormArray(): FormArray {
    return this.form.get('decoVendors') as FormArray;
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }

  decoThumbnail(deco) {
    return (
      deco
      && deco.decorationDetails && deco.decorationDetails
      && deco.decorationDetails.decoDesignVariation
      && deco.decorationDetails.decoDesignVariation.itemImageThumbnail
      && deco.decorationDetails.decoDesignVariation.itemImageThumbnail[0]
    ) || 'assets/images/ecommerce/product-image-placeholder.png';
  }

  createForm() {
    const decoVendorsFormArray = this.fb.array(
      this.item.decoVendors.map((deco) => this.fb.group({designModal: deco.designModal, vendorName: deco.vendorName, decoLocation: deco.decoLocation, decoStatus: deco.decoStatus, decorationNotes: deco.decorationNotes, decorationDetails: deco.decorationDetails, isGeneralNote: (deco.isGeneralNote === '1') ? true : false }))
    );
    const form = this.fb.group({
      vendorPONote: [this.item.vendorPONote],
      orderNote: [this.order.orderNote],
      workOrderNote: [this.order.workOrderNote],
      decoVendors: decoVendorsFormArray,
    });

    if (this.config && !this.config.edit) {
      form.disable();
    }

    return form;
  }
}

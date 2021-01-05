import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

@Component({
  selector: 'packing-list-quantity-editor',
  templateUrl: './packing-list-quantity-editor.component.html',
  styleUrls: ['./packing-list-quantity-editor.component.scss']
})
export class PackingListQuantityEditorComponent implements OnInit {
  form: FormGroup;
  customPLNote = '';
  boxNotesPLColumn = 'Box Notes';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PackingListQuantityEditorComponent>,
    private fb: FormBuilder,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.form = this.createForm();
  }

  get packingListQuantityArray(): FormArray {
    return this.form.get('packingListQuantity') as FormArray;
  }
  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close(false);
  }

  createForm() {
    const productData = [];
    const lineItems = this.getApplicableItems();
    lineItems.forEach((lineItem: any) => {
        if (!lineItem.matrixRows || lineItem.matrixRows.length === 0) {
            return
        }
        lineItem.matrixRows.forEach((row: any) => {
            const defaultImage = (lineItem.quoteCustomImage && lineItem.quoteCustomImage[0]) || 'assets/images/ecommerce/product-image-placeholder.png';
            const newRow = {
                productName: lineItem.productName,
                itemNo: lineItem.itemNo,
                imageUrl: row.imageUrl || defaultImage,
                quantity: +row.quantity,
                color: row.color,
                size: row.size,
                matrixUpdateId: row.matrixUpdateId,
                boxNotes: '',
            };
            productData.push(newRow);
        });
    });
    
   
    const packingListQuantityArray = this.fb.array(
      productData.map((item) => this.fb.group(item))
    );
    console.log(packingListQuantityArray);
    const form = this.fb.group({
      packingListQuantity: packingListQuantityArray,
      customPLNote:  this.customPLNote,
      boxNotesPLColumn:  this.boxNotesPLColumn,
    });
    return form;
  }
  getApplicableItems() {
      if(this.data.vendorId !== '' && this.data.vendorId !== 'All'){
          return this.data.order.lineItems.filter((item) => item.vendorId == this.data.vendorId && item.lineType != '4' && item.lineType != '3' && item.hideLine != '1');
      }else{
          return this.data.order.lineItems.filter((item) => item.lineType != '4' && item.lineType != '3' && item.hideLine != '1');
      }
  }
}

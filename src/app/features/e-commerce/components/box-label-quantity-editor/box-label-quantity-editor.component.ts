import { Component, OnInit, Inject, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
import * as moment from 'moment';
const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

@Component({
  selector: 'box-label-quantity-editor',
  templateUrl: './box-label-quantity-editor.component.html',
  styleUrls: ['./box-label-quantity-editor.component.scss']
})
export class BoxLabelQuantityEditorComponent implements OnInit {
  form: FormGroup;
  loading: boolean;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BoxLabelQuantityEditorComponent>,
    private fb: FormBuilder,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.form = this.createForm();
  }

  get boxLabelQuantityArray(): FormArray {
    return this.form.get('boxLabelQuantity') as FormArray;
  }
  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close(false);
  }
  removeBoxLabel(index){
    let boxLabelQuantity = <FormArray>this.form.get('boxLabelQuantity');
    boxLabelQuantity.removeAt(index);
  }
  addBoxLabel(){
    const boxLabelQuantity = <FormArray>this.form.get('boxLabelQuantity');
    let index = this.form.value.length;
    boxLabelQuantity.push(this.fb.group({'boxNo': index, 'totalBox': this.form.value.length, 'qty': 0, 'totalQty': 0, 'shipDate' : null}));
  }
  createForm() {
    const items = this.data.selectedBoxLabelQuantity;
    const boxLabelQuantityArray = this.fb.array(
      items.map((item) => this.fb.group({'boxNo': item.boxNo, 'totalBox': item.totalBox, 'qty': item.qty, 'totalQty': item.totalQty, 'shipDate' : item.shipDate ? moment(item.shipDate).toDate() : null}))
    );
    const form = this.fb.group({
      boxLabelQuantity: boxLabelQuantityArray
    });
    return form;
  }
}

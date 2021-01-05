import { Component, OnInit, Optional, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { LineItem, MatrixRow } from 'app/models';

const INCHES_IN_FEET_SQ = 144;
@Component({
  selector: 'calculator-area',
  templateUrl: './calculator-area.component.html',
  styleUrls: ['./calculator-area.component.scss']
})
export class CalculatorAreaComponent implements OnInit {

  @Input() item: Partial<LineItem>;
  @Input() row: Partial<MatrixRow>;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<CalculatorAreaComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) data
  ) { }

  ngOnInit() {
    this.form = this.createForm();
  }

  clearForm() {
    this.dialogRef.close('clear');
  }

  createForm() {
    const form = this.fb.group({
      x: [1, Validators.required],
      y: [1, Validators.required],
      area: [0, Validators.required],
      formatted: [''],
    });

    if (this.row && this.row.calculatorData && this.row.calculatorData[0]) {
      form.patchValue({
        ...this.row.calculatorData[0]
      });
    }

    form.valueChanges.subscribe((value) => {
      let area = (value.x * value.y) / INCHES_IN_FEET_SQ;
      if (isNaN(area)) {
        area = 1;
      }
      area = parseFloat(area.toFixed(4));
      const formatted = `${value.x} in. * ${value.y} in. = ${area} sq ft. `;
      form.patchValue({ area, formatted }, { onlySelf: true, emitEvent: false });
    });

    return form;
  }

  displayValue() {
    const value = this.form.value;
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}
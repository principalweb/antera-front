import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { each } from 'lodash';

@Injectable()
export class TableFilterService {
  fields = [];
  form: FormGroup;

  constructor(private fb: FormBuilder) { }

  get values() {
    return this.form.value;
  }

  createForm(fields, defaults: any = {}) {
    const obj = {};
    each(fields, f => {
      obj[f] = defaults[f] || '';
    });

    this.form = this.fb.group(obj);

    return this.form;
  }

  reset() {
    this.form.reset();
  }
}

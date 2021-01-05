
import { Directive, ChangeDetectorRef, ContentChild, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs';

export abstract class CustomMatFormFieldControl<T> extends MatFormFieldControl<T> {
  required: boolean;
  stateChanges: Subject<void>;
  control: MatFormFieldControl<T> | undefined;
}

@Directive({
  selector: 'mat-form-field',
})
export class MatFormFieldRequiredDirective implements AfterViewInit {
  @ContentChild(MatFormFieldControl) _control: CustomMatFormFieldControl<any>;

  constructor(private _cdRef: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.updateRequiredLabel();
  }

  private updateRequiredLabel() {
    if (this._control && this._control.ngControl) {
      let validator;
      if (this._control.ngControl.validator) {
        validator = this._control.ngControl.validator;
      }
      if (this._control.ngControl.control && this._control.ngControl.control.validator) {
        validator = this._control.ngControl.control.validator;
      }
      if (validator) {
        setTimeout(() => {
          const vf = validator(new FormControl());
          this._control.required = vf ? vf.required : null;
          this._control.stateChanges.next();
          this._cdRef.markForCheck();
        }, 0);
      }
    }
  }
}

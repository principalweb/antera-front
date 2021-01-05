import { Component, Inject, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductConfig } from 'app/models'
import { displayName } from '../../utils';
import { ApiService } from 'app/core/services/api.service';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-config-dialog',
  templateUrl: './product-config-dialog.component.html',
  styleUrls: ['./product-config-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductConfigDialogComponent {
  @ViewChild('accountName') accountName: ElementRef;
  displayName = displayName;
  configForm: FormGroup;
  filteredAccounts = [];
  orderId: any;

  constructor(
    public dialogRef: MatDialogRef<ProductConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private fb: FormBuilder,
    private api: ApiService
  ) {
    const config = new ProductConfig(data.lineitem);
    this.configForm = this.fb.group(config);

    this.configForm.get('alternateShipToAccount')
      .valueChanges.pipe(
        map(val => displayName(val).trim().toLowerCase()),
        debounceTime(400),
        distinctUntilChanged(),
      ).subscribe(keyword => {
          this.api.getAccountAutocomplete(keyword)
            .subscribe((res: any[]) => {
              this.filteredAccounts = res;
            });
      });

      this.orderId = data.oId;
  }

  save(type) {
    const config = new ProductConfig(this.configForm.value);

    this.dialogRef.close({
      action: type,
      config: config.toObject()
    });
  }

  clearAlternateShipTo() {
    this.configForm.patchValue({
      alternateShipToAccountId: '',
      alternateShipToAccount: ''
    });
  }
  selectAccount(ev) {
    const assignee = ev.option.value;
    this.configForm.patchValue({
      alternateShipToAccountId: assignee.id,
      alternateShipToAccount: assignee.name
    });
  }
}

import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Personalization } from 'app/models';


@Component({
  selector: 'edit-personalization',
  templateUrl: './edit-personalization.component.html',
  styleUrls: ['./edit-personalization.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class EditPersonalizationComponent implements OnInit {
  form: FormGroup;
  orderConfig: any;
  constructor(
    public dialogRef: MatDialogRef<EditPersonalizationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder  
  ) { 
    console.log(data);
    this.form = this.fb.group({
      id: [data.p.id || ''],
      orderId: [data.orderId || '', Validators.required],
      lineItemId: [data.item.lineItemUpdateId || '', Validators.required],
      decoVendorId: [data.deco.decoVendorRecordId || '', Validators.required],
      addonChargeId: [data.addonChargeId || '', Validators.required],
      dateEntered: [data.p.dateEntered || ''],
      dateModified: [data.p.dateModified || ''],
      modifiedById: [data.p.modifiedById || ''],
      createdById: [data.p.createdById || ''],
      sequance: [data.p.sequance || '1'],
      displayText: [data.p.displayText || ''],
      notes: [data.p.notes || ''],
      font: [data.p.font || ''],
      color: [data.p.color || ''],
      location: (data.action == 'new') ? [data.deco.decoLocation || ''] : [data.p.location || ''],
    });  
  }

  ngOnInit() {
  }

  onClose(save: boolean = false) {
    console.log(this.form.value);
    if (save && this.form.invalid) {
      return;
    }

    if (save) {
      this.dialogRef.close({
        ...this.form.value
      });
    } else {
      this.dialogRef.close();
    }
  }

}

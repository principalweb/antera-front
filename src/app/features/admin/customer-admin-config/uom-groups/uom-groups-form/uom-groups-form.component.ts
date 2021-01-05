import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { UomGroupsDetails } from 'app/models/uom-groups';
import { UomGroupsService } from '../uom-groups.service';

@Component({
  selector: 'uom-groups-form',
  templateUrl: './uom-groups-form.component.html',
  styleUrls: ['./uom-groups-form.component.css']
})
export class UomGroupsFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  uomGroupsForm: FormGroup;
  uomGroupsType = ['Area', 'Count', 'Length', 'Other', 'Time', 'Volume', 'Weight'];  
  uomGroupsDetails: UomGroupsDetails;
  loading: false;

  constructor(
    public dialogRef: MatDialogRef<UomGroupsFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private uomGroupsService: UomGroupsService,
  )
  {

    this.action = data.action;
    if ( this.action === 'edit' )
    {
        this.dialogTitle = 'Edit Uom Groups';
        this.uomGroupsDetails = data.uomGroupsDetails;
    }
    else
    {
        this.dialogTitle = 'Create Uom Groups';
        this.uomGroupsDetails = new UomGroupsDetails();
    }
    this.uomGroupsForm = this.createUomGroupsForm();
  }

  createUomGroupsForm()
  {

    return this.formBuilder.group({
      name               : [this.uomGroupsDetails.name, Validators.required],
      type               : [this.uomGroupsDetails.type, Validators.required],
      description        : [this.uomGroupsDetails.description],
      defaultPurchaseUnit: [this.uomGroupsDetails.defaultPurchaseUnit],
      defaultSalesUnit   : [this.uomGroupsDetails.defaultSalesUnit],
      defaultShippingUnit: [this.uomGroupsDetails.defaultShippingUnit],
      status             : [this.uomGroupsDetails.status],
    });
  }



  ngOnInit() {
  }

  create() {
    if (this.uomGroupsForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    const data = {
      ...this.uomGroupsForm.value
    }
    console.log(data);
    this.uomGroupsDetails.setData(data);
    this.dialogRef.close(this.uomGroupsDetails);
  }

  update() {

    if (this.uomGroupsForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const data = {
      ...this.uomGroupsForm.value,
      id: this.uomGroupsDetails.id
    }
    this.uomGroupsDetails.setData(data);
    this.dialogRef.close(this.uomGroupsDetails);
  }
}

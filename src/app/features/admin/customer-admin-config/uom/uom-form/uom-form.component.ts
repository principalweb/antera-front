import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { UomDetails } from 'app/models/uom';
import { UomService } from '../uom.service';


@Component({
  selector: 'uom-form',
  templateUrl: './uom-form.component.html',
  styleUrls: ['./uom-form.component.css']
})
export class UomFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  uomForm: FormGroup;
  uomType = ['Area', 'Count', 'Length', 'Other', 'Time', 'Volume', 'Weight'];  
  uomGroups = [];  
  uomBaseType = [{ "name": "Basic", "value": "B" }, { "name": "Relative", "value": "R" }];
  uomDetails: UomDetails;
  loading: false;

  constructor(
    public dialogRef: MatDialogRef<UomFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private uomService: UomService,
  )
  {

    this.uomService.getUomGroupsListOnly()
      .subscribe((res:any) => {
        this.uomGroups = res;
      });      
      
    this.action = data.action;
    if ( this.action === 'edit' )
    {
        this.dialogTitle = 'Edit Uom';
        this.uomDetails = data.uomDetails;
    }
    else
    {
        this.dialogTitle = 'Create Uom';
        this.uomDetails = new UomDetails();
    }
    this.uomForm = this.createUomForm();
  }

  createUomForm()
  {

    return this.formBuilder.group({
      name               : [this.uomDetails.name, Validators.required],
      type               : [this.uomDetails.type, Validators.required],
      description        : [this.uomDetails.description],
      abbreviation       : [this.uomDetails.abbreviation, Validators.required],
      isBase             : [this.uomDetails.isBase],
      conversionRatio    : [this.uomDetails.conversionRatio, Validators.required],
      uomGroupId         : [this.uomDetails.uomGroupId, Validators.required],
      status             : [this.uomDetails.status],
    });
  }



  ngOnInit() {
  }

  create() {
    if (this.uomForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    const data = {
      ...this.uomForm.value
    }
    console.log(data);
    this.uomDetails.setData(data);
    this.dialogRef.close(this.uomDetails);
  }

  update() {

    if (this.uomForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const data = {
      ...this.uomForm.value,
      id: this.uomDetails.id
    }
    this.uomDetails.setData(data);
    this.dialogRef.close(this.uomDetails);
  }
}

import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { displayName, visibleField, fieldLabel, requiredField, fieldType } from 'app/utils/utils';
import { ModuleField } from 'app/models/module-field';
@Component({
  selector: 'app-form-validation',
  templateUrl: './form-validation.component.html',
  styleUrls: ['./form-validation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations

})
export class FormValidationComponent implements OnInit {
  
  action = 'new';
  moduleForm: FormGroup;
  displayName = displayName;
  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;
  fieldType = fieldType;
  invalidControls = [];
  otherInvalidControls = [];
  excludeInvalidControls = [];
  fields: any[];
  constructor(
    public dialogRef: MatDialogRef<FormValidationComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) 
  { 
      this.action = data.action;
      this.moduleForm = data.moduleForm;
      this.fields = data.fields;
      this.excludeInvalidControls = data.excludeInvalidControls;
  }

  ngOnInit() {
    this.invalidControls = this.getInvalidControls();
    console.log(this.invalidControls);
    //this.getAllRequiredControls(this.fields);
    //this.getAllRequiredControls = this.getAllRequiredControls(this.fields);
    //console.log(this.getAllRequiredControls);
  }

  public getInvalidControls() {
      const invalid = [];
      const controls = this.moduleForm.controls;
      console.log(controls);
      for (const name in controls) {
         if (!this.checkForExcludeInvalidControls(name) && controls[name].invalid) {
              invalid.push(name);
         }
      }
      return invalid;
  }
  public close(){
      this.dialogRef.close({invalidControls: this.invalidControls});
  }
  public checkForExcludeInvalidControls(name){
     if(this.excludeInvalidControls.indexOf(name) > -1){
         return true;
     }
     return false;
  }

  public getAllRequiredControls(mFields: ModuleField[]){
    mFields.forEach(field => {
	if(field.required){
	
	}
    });
  }
  
}

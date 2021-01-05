import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { DropdownOption } from 'app/models/dropdown-option';

@Component({
  selector: 'app-dropdown-option-form',
  templateUrl: './dropdown-option-form.component.html',
  styleUrls: ['./dropdown-option-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DropdownOptionFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  dropdownOptionForm: FormGroup;
  dropdownOption: DropdownOption;
  name: string;
  loading: false;

  constructor(
    public dialogRef: MatDialogRef<DropdownOptionFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private msg: MessageService,
    private auth: AuthService,

  )
  { 
    this.action = data.action;
    if ( this.action === 'edit' )
    {
        this.dialogTitle = 'Edit Dropdown Option';
        this.dropdownOption = data.dropdownOption;
        this.dropdownOption.modifiedById = this.auth.getCurrentUser().userId;
        this.dropdownOption.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
        this.dropdownOption.dateModified = new Date();
    }
    else
    {
        this.dialogTitle = 'Create Dropdown Option';
        this.dropdownOption = new DropdownOption();
        this.dropdownOption.createdById = this.auth.getCurrentUser().userId;
        this.dropdownOption.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
        this.dropdownOption.dateCreated = new Date();
    }
    this.name = data.name;
    this.dropdownOptionForm = this.createDropdownOptionForm();
  }

  createDropdownOptionForm()
  {
    return this.formBuilder.group({
      name               : [{value:this.name, disabled: true}],
      label              : [this.dropdownOption.label, Validators.required],
      value              : [this.dropdownOption.value, Validators.required],
      description        : [this.dropdownOption.description],
      orderSequence      : [this.dropdownOption.orderSequence],
      isDefault          : [this.dropdownOption.isDefault],
      dateCreated        : [this.dropdownOption.dateCreated],
      dateModified       : [this.dropdownOption.dateModified],
      createdById        : [this.dropdownOption.createdById],
      createdByName      : [this.dropdownOption.createdByName],
      modifiedById       : [this.dropdownOption.modifiedById],
      modifiedByName     : [this.dropdownOption.modifiedByName]
    });
  }

  ngOnInit() {
  }

  create() {
    if (this.dropdownOptionForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    this.dropdownOption.setData(this.dropdownOptionForm.value);
    this.dialogRef.close(this.dropdownOption);
  }

  update() {
    if (this.dropdownOptionForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    const data = {
      ...this.dropdownOptionForm.value,
      id: this.dropdownOption.id
    }
    this.dropdownOption.setData(data);
    this.dialogRef.close(this.dropdownOption);
  }
}

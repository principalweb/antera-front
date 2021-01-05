import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { fieldLabel, requiredField } from 'app/utils/utils';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { ModuleField } from 'app/models/module-field';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-factory-dialog',
  templateUrl: './create-factory-dialog.component.html',
  styleUrls: ['./create-factory-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateFactoryDialogComponent implements OnInit {
  loading: boolean;
  fields: any[];
  accountForm: FormGroup;
  dialogTitle = 'Create New Factory Account';

  constructor(
    public dialogRef: MatDialogRef<CreateFactoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private api: ApiService,
    private formBuilder: FormBuilder
  ) { }

  account: any = {
    partnerType: 'Vendor',
  };
  fieldLabel = fieldLabel;

  ngOnInit() {
    this.loading = true;


    this.account = {...this.account, ...this.data};

    const accountModuleFieldParams =
    {
      offset: 0,
      limit: 200,
      order: 'module',
      orient: 'asc',
      term: { module: 'Accounts' }
    }
    this.api.getFieldsList(accountModuleFieldParams)
      .subscribe((res: any[]) => {
        this.fields = res.map(moduleField => new ModuleField(moduleField));
        this.loading = false;
        this.accountForm = this.createForm();
      }, () => { this.loading = true; });
  }

  createForm() {
    return this.formBuilder.group({
      accountName: [this.account.accountName, Validators.required],
      partnerType: [this.account.partnerType, Validators.required],
      phone: requiredField('phone', this.fields) ? [this.account.phone, Validators.required] : [this.account.phone],
      csRepEmail: requiredField('csRepEmail', this.fields) ? [this.account.csRepEmail, Validators.required] : [this.account.csRepEmail],
      accountType: ['Active']
    });
  }

  save() {
    if (this.accountForm.invalid) {
      console.error('Invalid form', this.accountForm);
      return;
    }

    let data = this.accountForm.getRawValue();
    this.dialogRef.close(data);
  }
}

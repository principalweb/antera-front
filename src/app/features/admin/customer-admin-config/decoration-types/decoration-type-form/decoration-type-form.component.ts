import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { DecorationTypeDetails } from 'app/models/decoration-type';
import { DecorationTypesService } from '../decoration-types.service';

@Component({
  selector: 'app-decoration-type-form',
  templateUrl: './decoration-type-form.component.html',
  styleUrls: ['./decoration-type-form.component.scss'],
})
export class DecorationTypeFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  decoTypeForm: FormGroup;
  
  decoTypeDetails: DecorationTypeDetails;
  incomeAccounts: any[];
  expenseAccounts: any[];
  decorationGroups: any[];
  assetAccounts: any[];
  loading: false;

  constructor(
    public dialogRef: MatDialogRef<DecorationTypeFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private decoTypeService: DecorationTypesService,
  )
  {
    this.decoTypeService.getFinancialAccounts()
      .subscribe((res:any) => {
        this.incomeAccounts = res.incomeAccounts;
        this.expenseAccounts = res.expenseAccounts;
        this.assetAccounts = res.assetAccounts;
      });

    this.decoTypeService.getDecorationTypesAll()
      .subscribe((res:any) => {
        this.decorationGroups = res;
      });      
      
    this.action = data.action;
    if ( this.action === 'edit' )
    {
        this.dialogTitle = 'Edit Decoration Type';
        this.decoTypeDetails = data.decoTypeDetails;
        this.decoTypeDetails.modifiedById = this.auth.getCurrentUser().userId;
        this.decoTypeDetails.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
        this.decoTypeDetails.dateModified = new Date();
    }
    else
    {
        this.dialogTitle = 'Create Decoration Type';
        this.decoTypeDetails = new DecorationTypeDetails();
        this.decoTypeDetails.createdById = this.auth.getCurrentUser().userId;
        this.decoTypeDetails.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
        this.decoTypeDetails.dateCreated = new Date();
    }
    if (this.decoTypeDetails.detailOptions.length ==0){
      this.decoTypeDetails.detailOptions.push('');
    }
    this.decoTypeForm = this.createDecorationTypeForm();
  }

  createDecorationTypeForm()
  {
    const detailOptions = this.decoTypeDetails.detailOptions
      .map(option => this.newDetailOptionForm(option));

    return this.formBuilder.group({
      name               : (this.action === 'edit') ? [{value: this.decoTypeDetails.name, disabled: true }, Validators.required] : [this.decoTypeDetails.name, Validators.required],
      detailName         : [this.decoTypeDetails.detailName],
      code               : (this.action === 'edit') ? [{value: this.decoTypeDetails.code, disabled: true }]: [this.decoTypeDetails.code],
      sku                : [this.decoTypeDetails.sku],
      incomeAccount      : [this.decoTypeDetails.incomeAccount],
      assetAccount       : [this.decoTypeDetails.assetAccount],
      expenseAccount     : [this.decoTypeDetails.expenseAccount],
      decorationGroup     : [this.decoTypeDetails.decorationGroup],
      active             : [this.decoTypeDetails.active],
      dateCreated        : [this.decoTypeDetails.dateCreated],
      dateModified       : [this.decoTypeDetails.dateModified],
      createdById        : [this.decoTypeDetails.createdById],
      createdByName      : [this.decoTypeDetails.createdByName],
      modifiedById       : [this.decoTypeDetails.modifiedById],
      modifiedByName     : [this.decoTypeDetails.modifiedByName],
      productionHour     : [this.decoTypeDetails.productionHour],
      detailOptions      : this.formBuilder.array(detailOptions)
    });
  }

  newDetailOptionForm(value: any) {
    return this.formBuilder.group({
      option: [value],
    });
  }

  addDetailOption() {
    const detailOptionsControl = <FormArray>this.decoTypeForm.get('detailOptions');
    detailOptionsControl.push(
      this.newDetailOptionForm('')
    );
  }

  ngOnInit() {
  }

  create() {
    if (this.decoTypeForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    this.decoTypeForm.value.detailOptions = 
    this.decoTypeForm.value.detailOptions.map((option) => {
      return option.option;
    });
    const data = {
      ...this.decoTypeForm.value,
      code: this.decoTypeForm.value.name,
      detailName: this.decoTypeForm.value.detailName == '' ? this.decoTypeForm.value.name : this.decoTypeForm.value.detailName
    }
    this.decoTypeDetails.setData(data);
    this.dialogRef.close(this.decoTypeDetails);
  }

  update() {
    const checkOptionError = this.decoTypeForm.value.detailOptions;
    if (checkOptionError.length == 0 ||
        (checkOptionError.length == 1 && checkOptionError[0].option.length < 1)
       ) {
        this.msg.show('Detail options value must be populated. These values will be available in the artwork detail dropdown.', 'error');
        return;
    }

    if (this.decoTypeForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    this.decoTypeForm.value.detailOptions = 
      this.decoTypeForm.value.detailOptions.map((option) => {
        return option.option;
      });

    const data = {
      ...this.decoTypeForm.value,
      id: this.decoTypeDetails.id,
      name: this.decoTypeForm.getRawValue().name,
      code: this.decoTypeForm.getRawValue().code,
      detailName: this.decoTypeForm.value.detailName == '' ? this.decoTypeForm.value.name : this.decoTypeForm.value.detailName
    }
    this.decoTypeDetails.setData(data);
    this.dialogRef.close(this.decoTypeDetails);
  }
}

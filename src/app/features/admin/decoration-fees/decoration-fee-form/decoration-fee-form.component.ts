import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LeadDetails } from 'app/models';
import { displayName } from '../../../productions/utils';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { DecorationChargeDetails } from 'app/models/decoration-charge';
import { fx2N } from 'app/utils/utils';
import { AuthService } from 'app/core/services/auth.service';
import { Observable, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FormValidationComponent } from 'app/shared/form-validation/form-validation.component';
import { ModuleField } from 'app/models/module-field';

@Component({
  selector: 'app-decoration-fee-form',
  templateUrl: './decoration-fee-form.component.html',
  styleUrls: ['./decoration-fee-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DecorationFeeFormComponent implements OnInit {

  dialogTitle: string;
  decoChargeForm: FormGroup;
  action: string;
  decoCharge: DecorationChargeDetails;
  displayName = displayName;

  filteredVendors: any;
  fx2N = fx2N;

  loading = false;
  loaded = () => {
      this.loading = false;
  };
  formValidationDlgRef: MatDialogRef<FormValidationComponent>;
  decoTypes = [];
  incomeAccounts = [];
  expenseAccounts = [];
  addonChargesList: any[] = [];
  fields = [
    {
      fieldName: 'name',
      labelName:'Name',
      required: true
    },
    {
      fieldName: 'vendorId',
      labelName:'Vendor Id',
      required: true
    },
    {
      fieldName: 'vendorName',
      labelName:'Vendor Name',
      required: true
    },
    {
      fieldName: 'decoratorType',
      labelName:'Decorator Type',
      required: true
    },
    {
      fieldName: 'price',
      labelName:'Price',
      required: true
    },
    {
      fieldName: 'stitchesStart',
      labelName:'Stitches Start',
      required: true
    },
    {
      fieldName: 'stitchesUpto',
      labelName:'Stitches Upto',
      required: true
    },
    {
      fieldName: 'qunatityStart',
      labelName:'Quantity Start',
      required: true
    },
    {
      fieldName: 'quantityUpto',
      labelName:'Quantity Upto',
      required: true
    },
    {
      fieldName: 'decorationDetail',
      labelName:'Decoration Detail',
      required: true
    }
  ];
  moduleFields: any[] = [];
  constructor(
    public dialogRef: MatDialogRef<DecorationFeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private api: ApiService,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    public dialog: MatDialog,
  ) 
  {
    this.action = data.action;

    if ( this.action === 'edit' )
    {
        this.dialogTitle = 'Edit Decoration Fees';
        this.decoCharge = data.decoChargeDetails;
    }
    else
    {
        this.dialogTitle = 'Create Decoration Fees';
        this.decoCharge = new DecorationChargeDetails();
    }

    //console.log(this.decoCharge);
    this.decoChargeForm = this.createDecoChargeForm();

    this.filteredVendors = this.decoChargeForm.get('vendorName')
      .valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(keyword => 
          this.api.getVendorAutocomplete(keyword)
        )
      );
    
    this.loading = true;
    forkJoin([
      this.api.getDecoratorTypes(),
      this.api.getFinancialAccountList(),
      this.api.getAddonCharges({term: {status: '1'}, listOnly: '1'})
    ]).subscribe((res: any) => {
        this.loading = false;
        this.decoTypes = res[0];
        this.incomeAccounts = res[1].incomeAccounts;
        this.expenseAccounts = res[1].expenseAccounts;
        this.addonChargesList = res[2];
    });
    
    this.moduleFields = this.fields.map(moduleField => new ModuleField(moduleField));
  }

  createDecoChargeForm()
  {
    return this.formBuilder.group({
      id                      : this.decoCharge.id,

      name                    : [this.decoCharge.name, Validators.required],
      vendorId                : [this.decoCharge.vendorId, Validators.required],
      vendorName              : [this.decoCharge.vendorName, Validators.required],

      decoratorType           : [this.decoCharge.decoratorType, Validators.required],
      price                   : [fx2N(this.decoCharge.price), Validators.required],

      stitchesStart           : [this.decoCharge.stitchesStart, Validators.required],
      stitchesUpto            : [this.decoCharge.stitchesUpto, Validators.required],

      qunatityStart           : [this.decoCharge.qunatityStart, Validators.required],
      quantityUpto            : [this.decoCharge.quantityUpto, Validators.required],

      description             : this.decoCharge.description,

      salePrice               : fx2N(this.decoCharge.salePrice),
      rank                    : this.decoCharge.rank,

      setupCharge             : fx2N(this.decoCharge.setupCharge),
      setupChargeSalePrice    : fx2N(this.decoCharge.setupChargeSalePrice),

      priority                : this.decoCharge.priority,
      expenseAccount          : this.decoCharge.expenseAccount,

      incomeAccount           : this.decoCharge.incomeAccount,
      showClient              : this.decoCharge.showClient,

      decorationDetail        : [this.decoCharge.decorationDetail, Validators.required],
      taxable                 : [this.decoCharge.taxable == '1' ? true : false],
      addonCharges            : [this.decoCharge.addonCharges],
    });
  }

  create() {
      if (this.decoChargeForm.invalid) {
        
          this.msg.show('Please complete the form first', 'error');
          
          this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
            panelClass: 'app-form-validation',
            data: {
              action: 'update',
              moduleForm: this.decoChargeForm,
              fields: this.moduleFields,
              excludeInvalidControls: []
             }
          });
    
          this.formValidationDlgRef.afterClosed().subscribe(data => {
            if (data) {
              data.invalidControls.forEach((control) => {
                this.decoChargeForm.get(control).markAsTouched();
              });
            }
            this.formValidationDlgRef = null;
          });
          return;
      }

      this.decoCharge.setData(this.decoChargeForm.value);
      const user = this.auth.getCurrentUser();
      this.decoCharge.modifiedUserId = user.userId;
      this.dialogRef.close(this.decoCharge);
  }

  update() {
      if (this.decoChargeForm.invalid) {
          this.msg.show('Please complete the form first', 'error');
          this.formValidationDlgRef = this.dialog.open(FormValidationComponent, {
            panelClass: 'app-form-validation',
            data: {
              action: 'update',
              moduleForm: this.decoChargeForm,
              fields: this.moduleFields,
              excludeInvalidControls: []
             }
          });
    
          this.formValidationDlgRef.afterClosed().subscribe(data => {
            if (data) {
              data.invalidControls.forEach((control) => {
                this.decoChargeForm.get(control).markAsTouched();
              });
            }
            this.formValidationDlgRef = null;
          });
        return;
      }

      this.decoCharge.setData(this.decoChargeForm.value);
      const user = this.auth.getCurrentUser();
      this.decoCharge.modifiedUserId = user.userId;
      this.dialogRef.close(['save', this.decoCharge]);
  }

  ngOnInit() {
  
  }

  selectVendor(ev){
    const vendor = ev.option.value;
    this.decoChargeForm.patchValue({
        vendorName: vendor.name,
        vendorId: vendor.id
    });
  }
  compareCharges(ac1, ac2) {
      return ac1 && ac2 ? ac1.id === ac2.id : ac1 === ac2;
  }
}

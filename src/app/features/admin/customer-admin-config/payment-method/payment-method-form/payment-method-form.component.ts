import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { DropdownOption } from 'app/models/dropdown-option';
import { PaymentMethodService } from '../payment-mehtod.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-payment-method-form',
  templateUrl: './payment-method-form.component.html',
  styleUrls: ['./payment-method-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PaymentMethodFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  paymentMethodForm: FormGroup;
  dropdownOption: DropdownOption;
  name: string;
  loading: false;
  paymentData: any;

  constructor(
    public dialogRef: MatDialogRef<PaymentMethodFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private auth: AuthService,
    private service: PaymentMethodService,
    private msg: MessageService
  ) { 
    this.paymentData = data.data;
    this.action = data.action;
    if ( this.action === 'edit' )
    {
      console.log("data",data)
        this.dialogTitle = 'Edit';
        this.paymentMethodForm = this.formBuilder.group({
          label              : data.data.paymentLabel,
          value              : data.data.paymentValue,
          enable             : data.data.enable
        });
    }
    else
    {
      this.dialogTitle = 'Create';

      this.paymentMethodForm = this.formBuilder.group({
        label              : '',
        value              : '',
        enable             : false
      });
    }
  }

  ngOnInit(): void {
    
  }


  create() {
    
    let data = this.paymentMethodForm.value;
    if(data.label === "") {
      this.msg.show("Label is required","error");
      return;
    }
    if(data.value === "") {
      this.msg.show("Value is required","error");
      return;
    }
    this.dialogRef.close(data);
  }

  update() {
    
    let data = this.paymentMethodForm.value;
    Object.assign(data,{id:this.paymentData.id});
    if(data.label === "") {
      this.msg.show("Label is required","error");
      return;
    }
    if(data.value === "") {
      this.msg.show("Value is required","error");
      return;
    }
    this.dialogRef.close(data);
  }
}

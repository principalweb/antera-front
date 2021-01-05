import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, concatMap } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { HttpErrorResponse } from '@angular/common/http';
import { flatten } from "app/utils/utils";
import { PurchaseOrderService } from '../../services/purchase-order.service';

@Component({
  selector: 'edit-shipping-dialog',
  templateUrl: './edit-shipping-dialog.component.html',
  styleUrls: ['./edit-shipping-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditShippingDialogComponent implements OnInit {
  editShippingForm: FormGroup;
  matcher = new MyErrorStateMatcher();
  accountName: string;
  address: string;
  city: string;
  loading: boolean = false;
  state: string;
  postalCode: string;
  phone: string;
  country: string;
  email: string;
  accounts: Observable<any>;
  currentShipping: {[key: string]: string};
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public dialogRef: MatDialogRef<EditShippingDialogComponent>,
    private messageService: MessageService,
    private purchaseOrderService: PurchaseOrderService,
    private api: ApiService,
    private fb: FormBuilder) {
      this.accountName = this.data.shipInfo.accountName;
      this.address = this.comma(this.data.shipInfo.addressLines);
      this.city = this.data.shipInfo.city;
      this.state = this.data.shipInfo.state;
      this.postalCode = this.data.shipInfo.postalCode;
      this.phone = this.data.shipInfo.phone;
      this.email = this.data.shipInfo.email;
      this.country = this.data.shipInfo.country;
     }

  ngOnInit() {
    this.createForm();
  }

  comma(val: string[]){
    let str = "";
    val.forEach((el, i) => {
      str += el;
      if (i != val.length - 1) str += ", ";
    });
    return str;
  }
/** changed  getVendorAutocomplete to getAccountAutocomplete to get the customer too */
  subscribeToAccountAutocomplete() {
    this.accounts = this.editShippingForm.controls.accountName.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((val) => this.api.getAccountAutocomplete(val))
    );
  }

  concatenateAddresses(addresses: string[]){

  }

  selectAccount(event) {
    const account = event.option.value;
    this.currentShipping = {
      id: account.id,
      name: account.name
    };
    console.log("account selected", account);
    this.editShippingForm.patchValue({
      accountName: account.name,
      address: !account.shippingAddressStreet2
        ? account.shippingAddressStreet
        : `${account.shippingAddressStreet} ${account.shippingAddressStreet2}`,
      city: account.shippingAddressCity,
      state: account.shippingAddressState,
      postalCode: account.shippingAddressPostalcode,
      phone: account.phoneOffice,
      email: account.email,
      country: account.shippingAddressCountry,
    });
  }

  dontAllow(){
    return !this.editShippingForm.valid;
  }

  createForm(){
    this.editShippingForm = this.fb.group({
      accountName: [this.accountName, Validators.required, this.realAccount.bind(this)],
      address: [this.address, Validators.required],
      city: [this.city, Validators.required],
      state: [this.state, Validators.required],
      postalCode: [this.postalCode, Validators.required],
      phone: [this.phone, Validators.required],
      email: [this.email, [Validators.required, Validators.email]],
      country: [this.country, Validators.required]
    });
    this.subscribeToAccountAutocomplete();
  }



  realAccount(formControl: FormControl) : Promise<any> | Observable<any> {
    return forkJoin(
      this.api.getAccountAutocomplete(formControl.value),
      this.api.getVendorAutocomplete(formControl.value)
    )
    .pipe(concatMap((accounts: any[] )=> {
      const returnedAccounts = flatten(accounts);
      if (returnedAccounts.findIndex((account: any) => account.name === formControl.value) === -1){
        return of({realAccount: true});
      } else {
        const currentAccount = returnedAccounts.find((account: any) =>  account.name === formControl.value);
        this.currentShipping = {
          ...this.currentShipping,
          id: currentAccount.id
        }
        return of(null);
      }
      
    }));
  }

  editShipping(){
    this.loading = true;
    const shipInfo = {
      "shipInfoId": this.data.shipInfo.id,
      "name": this.data.shipInfo.name,
      "accountId": this.currentShipping.id ? this.currentShipping.id : this.data.shipInfo.accountId,
      "accountName": this.editShippingForm.get("accountName").value,
      "addressLines": this.editShippingForm.controls.address?.value.split(" "),
      city: this.editShippingForm.controls.city.value,
      state: this.editShippingForm.controls.state.value,
      postalCode: this.editShippingForm.controls.postalCode.value,
      country: this.editShippingForm.controls.country.value,
      phone: this.editShippingForm.controls.phone.value,
      email: this.editShippingForm.controls.email.value,
      //serviceEndpoint: this.data.shipInfo.serviceEndpoint,
      serviceEndpoint: "DecoVendor",
      transportMethod: this.data.shipInfo.transportMethod
    }
    this.api.editShippingDetails(shipInfo).subscribe(res => {
      this.messageService.show("Shipping Info Updated", "success");
      this.loading = false;
      this.dialogRef.close();
      this.purchaseOrderService.getPurchaseOrderDetail();
    }, (error: HttpErrorResponse) => {
      this.messageService.show("There was a problem updating your Info", "error");
      this.loading = false;
      console.log("error", error);
    })
  }

}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid);
  }
}
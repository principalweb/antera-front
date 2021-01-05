import { Component, OnInit, Input, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from 'app/models';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.scss']
})
export class LocationFormComponent implements OnInit {
  @Input() location: Location;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Optional() private dialogRef: MatDialogRef<LocationFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) data
  ) { }

  ngOnInit() {
    this.form = this.createForm();
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }


  createForm() {
    const form = this.fb.group({
      companyName: [],
      locationName: [],
      description: [],
      salesRep: [],
      salesRepId: [],
      locationType: [],
      industry: [],
      annualRevenue: [],
      phoneFax: [],
      billingAddressStreet: [],
      billingAddressStreet2: [],
      billingAddressCity: [],
      billingAddressState: [],
      billingAddressPostalcode: [],
      billingAddressCountry: [],
      billingProvice: [],
      shippingAddressStreet: [],
      shippingAddressStreet2: [],
      shippingAddressCity: [],
      shippingAddressState: [],
      shippingAddressPostalcode: [],
      shippingAddressCountry: [],
      shippingProvice: [],
      rating: [],
      phoneOffice: [],
      phoneAlternate: [],
      website: [],
      ownership: [],
      employees: [],
      ticketSymbol: [],
      deliveryContact: [],
      qboSalesTax: [],
      qbdSalesTax: [],
      taxRate: [],
      modifiedUserId: [],
    });
    return form;
  }

}

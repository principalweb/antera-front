import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Location } from '../location.model';
import { MessageService } from 'app/core/services/message.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ApiService } from 'app/core/services/api.service';
import { displayName } from 'app/utils/utils';

@Component({
    selector: 'fuse-location-form',
    templateUrl: './location-form.component.html',
    styleUrls: ['./location-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseLocationFormComponent implements OnInit {
    action: string;
    dialogTitle: string;
    location: Location;
    locationForm: FormGroup;
    filteredUsers: Object;

    displayName = displayName;
    filteredContacts = [];

    constructor(
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public dialogRef: MatDialogRef<FuseLocationFormComponent>,
        private msg: MessageService,
        private api: ApiService,
    ) {
        this.action = data.action;

        if (this.action === 'edit') {
            this.dialogTitle = 'Edit Location';
            this.location = data.location;
        } else {
            this.dialogTitle = 'New Location';
            this.location = new Location({});
        }
    }

    ngOnInit() {
        this.locationForm = this.formBuilder.group({
            companyName: [this.location.companyName],
            contact: [this.location.contact],
            deliveryContact: [this.location.deliveryContact],
            deliveryContactId: [this.location.deliveryContactId],
            salesRep: [this.location.salesRep],
            salesRepId: [this.location.salesRepId],
            locationName: [this.location.locationName],
            phoneOffice: [this.location.phoneOffice],
            locationType: [this.location.locationType],
            phoneFax: [this.location.phoneFax],

            // Shipping
            shippingAddressCity: [this.location.shippingAddressCity],
            shippingAddressCountry: [this.location.shippingAddressCountry],
            shippingAddressPostalcode: [this.location.shippingAddressPostalcode],
            shippingAddressState: [this.location.shippingAddressState],
            shippingAddressStreet: [this.location.shippingAddressStreet],
            shippingAddressStreet2: [this.location.shippingAddressStreet2],

            // Billing
            billingAddressCity: [this.location.billingAddressCity],
            billingAddressCountry: [this.location.billingAddressCountry],
            billingAddressPostalcode: [this.location.billingAddressPostalcode],
            billingAddressState: [this.location.billingAddressState],
            billingAddressStreet: [this.location.billingAddressStreet],
            billingAddressStreet2: [this.location.billingAddressStreet2],

            description: [this.location.description],
            accounts: [this.location.accounts],
        });

        this.locationForm.get('salesRep').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe(keyword => {
            if (keyword && keyword.length >= 3) {
                this.api.getUserAutocomplete(keyword).subscribe(res => {
                    this.filteredUsers = res;
                });
            }
        });

        this.locationForm.get('deliveryContact').valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe(keyword => {
            if (keyword && keyword.length >= 3) {
		  this.api.getContactAutocomplete(keyword).subscribe((res: any[]) => {
		    this.filteredContacts = res;
		  });
            }
        });

    
    }

    save(form) {
        if (this.locationForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        this.dialogRef.close([
            'save',
            {
                ...this.location,
                ...form.getRawValue()
            }
        ]);
    }

    selectAssignee(ev) {
        const assignee = ev.option.value;
        this.locationForm.get('salesRep').setValue(assignee.name);
        this.locationForm.get('salesRepId').setValue(assignee.id);
    }

    clearAssignee() {
      this.locationForm.patchValue({
        salesRep: '',
        salesRepId: ''
      });
    }

    selectContact(ev) {
        const contact = ev.option.value;
        this.locationForm.get('deliveryContact').setValue(contact.name);
        this.locationForm.get('deliveryContactId').setValue(contact.id);
    }
    
    clearContact() {
      this.locationForm.patchValue({
        deliveryContact: '',
        deliveryContactId: ''
      });
    }
    
}

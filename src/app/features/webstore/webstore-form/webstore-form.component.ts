import { Component, Inject, Input, ViewEncapsulation, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { WebstoreService } from '../webstore.service';
import { Webstore } from '../webstore.model';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { MessageService } from 'app/core/services/message.service';

@Component({
    selector: 'fuse-webstore-form',
    templateUrl: './webstore-form.component.html',
    styleUrls: ['./webstore-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseWebstoreFormComponent implements OnInit {
    action: string;
    dialogTitle: string;
    webstore= new Webstore();
    webstoreForm: FormGroup;

    allStores = [
        'Tiger Construction',
        '4 Sizzle',
        'Apple',
        'BMW',
        'Demo Products List',
        'Dev Store',
        'Gulfstream',
        'Products',
        'Resin',
        'River City',
        'Rolex'
    ];

    @ViewChild('storeInput', {static: false}) storeInput: ElementRef;


    constructor(
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public dialogRef: MatDialogRef<FuseWebstoreFormComponent>,
        private msg: MessageService
    ) {
        this.action = data.action;

        if ( this.action === 'edit' ) {
            this.dialogTitle = 'Edit Webstore';
            this.webstore = new Webstore(data.webstore);
        } else {
            this.dialogTitle = 'New Webstore';
            this.webstore = new Webstore();
        }
    }

    ngOnInit() {
        this.webstoreForm = this.formBuilder.group({
            clientName: [this.webstore.clientName, Validators.required],
            logo: [this.webstore.logo],
            hostName: [this.webstore.hostName, Validators.required],
            crmUrl: [this.webstore.crmUrl],
            crmAccount: [this.webstore.crmAccount],
            orderType: [this.webstore.orderType],
            salesPerson: [this.webstore.salesPerson],
            currency: [this.webstore.currency],
            css: [this.webstore.css],
            enabled: [this.webstore.enabled],
            distributor: [this.webstore.distributor]
        });
    }

    save(form) {
        if (this.webstoreForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        this.dialogRef.close([
            'save',
            {
                ...this.webstore,
                ...form.getRawValue()
            }
        ]);
    }

}

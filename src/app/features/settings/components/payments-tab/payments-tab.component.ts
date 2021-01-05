import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl,Validators} from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { CardConnectCreds } from 'app/models/cardconnect';
import { MessageService } from 'app/core/services/message.service';

@Component({
    selector: 'app-payments-tab',
    templateUrl: './payments-tab.component.html',
    styleUrls: ['./payments-tab.component.scss']
})
export class PaymentsTabComponent implements OnInit {

    enabled = true;
    loading = false;
    creds: CardConnectCreds= new CardConnectCreds({});
    credsForm: FormGroup;

    constructor(
       private formBuilder: FormBuilder,
       private msg: MessageService,
       private api: ApiService
    ) { }

    ngOnInit() {
        this.getCurrentSettings();
        this.createForm();
    }

    getCurrentSettings() {
        this.loading = true;
        this.api.getCardConnectCreds().subscribe((creds: any)=> {
            this.creds = new CardConnectCreds(creds);
            this.creds.enabled = creds.enabled == 1 ? true : false;
            this.creds.sandbox = creds.sandbox == 1 ? true : false;
            this.creds.sendemail = creds.sendemail == 1 ? true : false;
            this.createForm();
            this.loading = false;
        }, () => {
            this.loading = false;
        });
    }

    createForm() {
        this.credsForm = this.formBuilder.group({
            enabled:    [this.creds.enabled],
            merchantid: [this.creds.merchantid, Validators.required],
            username:   [this.creds.username, Validators.required],
            password:   [this.creds.password, Validators.required],
            sendemail:  [this.creds.sendemail],
            echeck:     [this.creds.echeck],
            sandbox:    [this.creds.sandbox]
        });
    }

    save() {
        this.loading = true;
        this.api.saveCardConnectCreds({
            ...this.creds,
            ...this.credsForm.value
        }).subscribe((res: any) => {
                this.msg.show(res.msg, 'error');
                this.loading = false;
            }, () => {
                this.loading = false;
            }
        );
    }
}

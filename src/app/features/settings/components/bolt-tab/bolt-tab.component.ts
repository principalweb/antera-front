import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl,Validators} from '@angular/forms';
import { CardConnectBoltCreds } from 'app/models/cardconnect';
import { ApiService } from 'app/core/services/api.service';

import { fuseAnimations } from '@fuse/animations';
import { MessageService } from 'app/core/services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bolt-tab',
  templateUrl: './bolt-tab.component.html',
  styleUrls: ['./bolt-tab.component.scss']
})
export class BoltTabComponent implements OnInit {

//  enabled = true;
//  testmode = true;

  bolt: CardConnectBoltCreds = new CardConnectBoltCreds({}); 
  boltForm: FormGroup;

  loading = false;

  constructor(
       private formBuilder: FormBuilder,
       private msg: MessageService,
       private api: ApiService
  ) {
  }

  ngOnInit() {
    this.getBoltCreds();
    this.createForm();
  }

  getBoltCreds() {
    this.loading = true;
    this.api.getBoltCreds()
      .subscribe((bolt:any) => {
        this.bolt = new CardConnectBoltCreds(bolt);
        this.bolt.enabled  = bolt.enabled == 1 ? true : false;
        this.bolt.testmode = bolt.testmode == 1 ? true : false;
        this.createForm();
        this.loading = false;
      }, () => {
        this.loading = true;
      });
  }

  createForm() {
        this.boltForm = this.formBuilder.group({
        username          : [this.bolt.username, Validators.required],
        password          : [this.bolt.password, Validators.required],
        merchantid        : [this.bolt.merchantid, Validators.required],
        hsn               : [this.bolt.hsn, Validators.required],
        apikey            : [this.bolt.apikey],
        enabled           : [this.bolt.enabled],
        testmode          : [this.bolt.testmode]
    });
  }

   save() {
        this.loading = true;
        this.api.saveBoltCreds({
              ...this.bolt,
              ...this.boltForm.value
            })
            .subscribe((data:any) => {
                    this.msg.show(data.msg, 'error');
                    this.loading = false;
                }, () => {
                    this.loading = false;
                }
            );
    }
}

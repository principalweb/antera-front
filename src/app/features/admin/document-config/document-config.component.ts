import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-document-config',
  templateUrl: './document-config.component.html',
  styleUrls: ['./document-config.component.scss']
})
export class DocumentConfigComponent implements OnInit {

  configForm: FormGroup;
  loading = true;
  settled = true; 

  constructor(
    private fb: FormBuilder, 
    private api: ApiService,
    private msg: MessageService) { }

  ngOnInit() {
    this.getConfig();
  }

  getConfig() {
    this.loading = true;
    this.api.getAdvanceSystemConfigAll({module: 'Documents'})
      .subscribe((res :any) => {
        this.configForm = this.createDocConfigForm(res.settings);
        this.loading = false;
        this.settled = false;
      }, () => {
        this.loading = false;
      });
  }

  createDocConfigForm(setting) {
    return this.fb.group({
      artworkProofEmailAddress                  : [setting.artworkProofEmailAddress ? setting.artworkProofEmailAddress : ''],
      artworkProofFax                           : [setting.artworkProofFax ? setting.artworkProofFax : ''],
      showPaymentsReceivedInOrderConfirmation   : [setting.showPaymentsReceivedInOrderConfirmation == '1' ? true : false]
    });
  }

  save() {
    const postData = {
      module: 'Documents',
      settings: {
        ...this.configForm.value,
        showPaymentsReceivedInOrderConfirmation: this.configForm.value.showPaymentsReceivedInOrderConfirmation == true ? '1' : '0'
      }
    };

    this.loading = true;
    this.api.updateAdvanceSystemConfigAll(postData)
        .subscribe((res: any) => {
          this.loading = false;
          this.msg.show('Document Settings updated', 'success');
        },(err) => {
          this.loading = false;
          this.msg.show(err, 'success');
        });
  }

  reset() {
    this.configForm.setValue({});
  }

}

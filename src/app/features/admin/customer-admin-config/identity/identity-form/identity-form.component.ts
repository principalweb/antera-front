import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { Subscription ,  Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { IdentityService } from 'app/core/services/identity.service';
import { ApiService } from 'app/core/services/api.service';
import { IdentityDetail } from 'app/models';

@Component({
  selector: 'app-identity-form',
  templateUrl: './identity-form.component.html',
  styleUrls: ['./identity-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class IdentityFormComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  onDataChanged: Subscription;
  onDataUpdated: Subscription;
  dataForm: FormGroup;
  formData: IdentityDetail = {id:"",name:"",billingStreet:"",billingCity:"",billingState:"",billingPostalcode:"",billingCountry:"",phone:"",shippingStreet:"",shippingCity:"",shippingState:"",shippingPostalcode:"",shippingCountry:"",logo:"",altLogo:""};
  dataId: string = '0';
  logo: string = '';
  altLogo: string = '';
  
  constructor(
                private dataService: IdentityService,
                private api: ApiService,
                public dialogRef: MatDialogRef<IdentityFormComponent>,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.dataId = '0';
      if(this.data.id) {
          this.dataId = this.data.id;
      }
      this.dataForm = this.fb.group(this.formData);
  }

  ngOnInit() {

      this.onDataUpdated =
        this.dataService.onDataUpdated
            .subscribe((savedData:any) => {
                this.loading = false;
                if(savedData.id != undefined) {
                    this.dataId = savedData.id;
                    this.loadData();
                }
            });

      this.onDataChanged =
        this.dataService.onDataChanged
            .subscribe((data:any) => {
                if(data && data.name != null) {
                    this.formData = data;
                }
                this.dataForm = this.fb.group({
                    id: new FormControl(this.formData.id),
                    name: new FormControl(this.formData.name),
                    billingStreet: new FormControl(this.formData.billingStreet),
                    billingCity: new FormControl(this.formData.billingCity),
                    billingState: new FormControl(this.formData.billingState),
                    billingPostalcode: new FormControl(this.formData.billingPostalcode),
                    billingCountry: new FormControl(this.formData.billingCountry),
                    shippingStreet: new FormControl(this.formData.shippingStreet),
                    shippingCity: new FormControl(this.formData.shippingCity),
                    shippingState: new FormControl(this.formData.shippingState),
                    shippingPostalcode: new FormControl(this.formData.shippingPostalcode),
                    shippingCountry: new FormControl(this.formData.shippingCountry),
                    phone: new FormControl(this.formData.phone),
                    logoUpload: new FormControl(),
                    altLogoUpload: new FormControl()
                    });
                this.logo = this.formData.logo;
                this.altLogo = this.formData.altLogo;
                this.loading = false;
            });
    this.loadData();
  }

  loadData() {
    if(this.dataId != '0') {
        this.loading = true;
        this.dataService.getData(this.dataId);
    }
  }

  save() {
    this.loading = true;
    this.dataService.updateData({...this.dataForm.value, logo:this.logo, altLogo:this.altLogo},this.dialogRef);
  }

  ngOnDestroy() {
      this.onDataUpdated.unsubscribe();
      this.onDataChanged.unsubscribe();
      this.dataId = '0';
  }

    onFileChange(event, type) {
        if(event.target.files.length > 0) {
            const data = new FormData();
            data.append('File', event.target.files[0]);
            this.api.uploadAnyFile(data)
                .subscribe((res: any) => {
                    if(type === 'altLogo') {
                        this.altLogo = res.url;
                    } else {
                        this.logo = res.url;
                    }                    
                }, (err => {
                    this.loading = false;
                }));                
            console.log(this.logo);
        }
    }
}

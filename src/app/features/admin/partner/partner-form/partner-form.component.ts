import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { Subscription ,  Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { PartnerService } from 'app/core/services/partner.service';
import { PartnerDetail } from 'app/models';


@Component({
  selector: 'app-partner-form',
  templateUrl: './partner-form.component.html',
  styleUrls: ['./partner-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class PartnerFormComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  onDataChanged: Subscription;
  onDataUpdated: Subscription;
  dataForm: FormGroup;
  formData: PartnerDetail = {id:"",name:"",clientCompany:"",clientStreet:"",clientCity:"",clientState:"",clientPostalcode:"",clientCountry:"",clientPhone:"",clientWebsite:"",altLogo:""};
  dataId: string = '0';
  altLogo: string = '';

  constructor(
                private dataService: PartnerService,
                private api: ApiService,
                public dialogRef: MatDialogRef<PartnerFormComponent>,
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
                    clientCompany: new FormControl(this.formData.clientCompany),
                    clientStreet: new FormControl(this.formData.clientStreet),
                    clientCity: new FormControl(this.formData.clientCity),
                    clientState: new FormControl(this.formData.clientState),
                    clientPostalcode: new FormControl(this.formData.clientPostalcode),
                    clientCountry: new FormControl(this.formData.clientCountry),
                    clientPhone: new FormControl(this.formData.clientPhone),
                    clientWebsite: new FormControl(this.formData.clientWebsite),
                    altLogoUpload: new FormControl()
                    });
                this.loading = false;
                this.altLogo = this.formData.altLogo;
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
    this.dataService.updateData({...this.dataForm.value, altLogo:this.altLogo});
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
              this.altLogo = res.url;                  
            }, (err => {
                this.loading = false;
            }));                
        console.log(this.altLogo);
    }
  }
}

import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { Subscription ,  Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { InventoryService } from 'app/core/services/inventory.service';
import { LocalBin } from 'app/models';

@Component({
  selector: 'app-bin-form',
  templateUrl: './bin-form.component.html',
  styleUrls: ['./bin-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class BinFormComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  onDataChanged: Subscription;
  onDataUpdated: Subscription;
  dataForm: FormGroup;
  formData: LocalBin = {id:"",name:"",siteId:""};
  dataId: string = '0';

  constructor(
                private dataService: InventoryService,
                public dialogRef: MatDialogRef<BinFormComponent>,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.dataId = '0';
      if(this.data.id) {
          this.dataId = this.data.id;
      } else if(this.data.siteId) {
          this.formData.siteId = this.data.siteId;
      }
      this.dataForm = this.fb.group(this.formData);
  }

  ngOnInit() {

      this.onDataUpdated =
        this.dataService.onBinDataUpdated
            .subscribe((savedData:any) => {
                this.loading = false;
                if(savedData.id != undefined) {
                    this.dataId = savedData.id;
                    this.loadData();
                }
            });

      this.onDataChanged =
        this.dataService.onBinDataChanged
            .subscribe((data:any) => {
                if(data && data.name != null) {
                    this.formData = data;
                }
                this.dataForm = this.fb.group({
                    id: new FormControl(this.dataId),
                    name: new FormControl(this.formData.name),
                    siteId: new FormControl(this.formData.siteId)
                    });
                this.loading = false;
            });
    this.loadData();
  }

  loadData() {
    if(this.dataId != '0') {
        this.loading = true;
        this.dataService.getBinData(this.dataId);
    }
  }

  save() {
    this.loading = true;
    this.dataService.updateBinData(this.dataForm.value,this.dialogRef);
  }

  ngOnDestroy() {
      this.onDataUpdated.unsubscribe();
      this.onDataChanged.unsubscribe();
      this.dataId = '0';
      this.formData.siteId = '';
  }

}

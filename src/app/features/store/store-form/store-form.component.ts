import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { Subscription ,  Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataSource } from '@angular/cdk/collections';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { StoreService } from 'app/core/services/store.service';
import { Store } from 'app/models';

@Component({
  selector: 'app-store-form',
  templateUrl: './store-form.component.html',
  styleUrls: ['./store-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class StoreFormComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  onDataChanged: Subscription;
  onDataUpdated: Subscription;
  dataForm: FormGroup;
  formData: Store = {id:"",name:"",url:"",enabled:false};
  dialogTitle: string;
  constructor(
                private storeService: StoreService,
                public dialogRef: MatDialogRef<StoreFormComponent>,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      if(this.data.id) {
          this.formData = this.data;
          this.dialogTitle = 'Edit Webstore';
          if(this.data.enabled == "1") {
              this.formData.enabled = true;
          } else {
              this.formData.enabled = false;
          }
      }else{
        this.dialogTitle = 'Add Webstore';
      }
      this.dataForm = this.fb.group(this.formData);

      this.onDataUpdated =
        this.storeService.onStoreUpdated
            .subscribe(data => {
                this.loading = false;
            });

      /*this.onDataChanged =
        this.storeService.onStoreChanged
            .subscribe(store => {
                if(store && store.name != null) {
                    this.formData = store;
                    if(store.enabled == "1") {
                        this.formData.enabled = true;
                    } else {
                        this.formData.enabled = false;
                    }
                }
                this.dataForm = this.fb.group(this.formData);
            });*/
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    //this.loading = true;
    //this.storeService.getStoreDetails({id:this.data.id});
  }

  save() {
    this.loading = true;
    this.storeService.updateStore(this.dataForm.value,this.dialogRef);
  }

  ngOnDestroy() {
        this.onDataUpdated.unsubscribe();
        this.onDataUpdated.unsubscribe();
  }

}

import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { Subscription ,  Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { ProductService } from 'app/core/services/product.service';
import { SizeLabel } from 'app/models';

@Component({
  selector: 'labels-form',
  templateUrl: './labels-form.component.html',
  styleUrls: ['./labels-form.component.scss'],
  animations   : fuseAnimations
})
export class LabelsFormComponent implements OnInit, OnDestroy {
  loading = false;
  onDataChanged: Subscription;
  onDataUpdated: Subscription;
  dataForm: FormGroup;
  formData: SizeLabel = {id: '', name: ''};
  dataId = '0';

  constructor(
                private dataService: ProductService,
                public dialogRef: MatDialogRef<LabelsFormComponent>,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any
  ) {
      this.dataId = '0';
      if (this.data.id) {
          this.dataId = this.data.id;
      }
      this.dataForm = this.fb.group(this.formData);
  }

  ngOnInit() {

      this.onDataUpdated =
        this.dataService.onLabelsDataUpdated
            .subscribe((savedData: any) => {
                this.loading = false;
                if (savedData.id != undefined) {
                    this.dataId = savedData.id;
                    this.loadData();
                }
            });

      this.onDataChanged =
        this.dataService.onLabelsDataChanged
            .subscribe((data: any) => {
                if (data && data.name != null) {
                    this.formData = data;
                }
                this.dataForm = this.fb.group({
                    id: new FormControl(this.formData.id),
                    name: new FormControl(this.formData.name),
                    });
                this.loading = false;
            });

    this.loadData();
  }

  loadData() {
    if (this.dataId != '0') {
        this.loading = true;
        this.dataService.getLabelsData(this.dataId);
    }

  }

  save() {
    this.loading = true;
    this.dataService.updateLabelsData(this.dataForm.value);
  }

  ngOnDestroy() {
      this.onDataUpdated.unsubscribe();
      this.onDataChanged.unsubscribe();
      this.dataId = '0';
  }

}

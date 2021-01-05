import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Subscription , Observable, interval } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { CategoryService } from 'app/core/services/category.service';
import { IntegrationService } from 'app/core/services/integration.service';
import { QbService } from 'app/core/services/qb.service';
import { CategoryLocations, CategoryDetail, Category } from 'app/models';

import { TaxCollection } from 'app/models/tax-collection';
import { TaxCategory } from 'app/models/tax-category';
import { RestParams } from 'app/models/rest-params';

import { map, startWith, debounce, switchMap } from 'rxjs/operators';
import { InventoryService } from 'app/core/services/inventory.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-inventory-adjustment-notes',
  templateUrl: './inventory-adjustment-notes.component.html',
  styleUrls: ['./inventory-adjustment-notes.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
}) 
export class InventoryAdjustmentNotesComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  onDataChanged: Subscription;
  onDataUpdated: Subscription;
  dataForm: FormGroup;
  formData = { note: "" };
  
  constructor(
                private dataService: InventoryService,
                private msg: MessageService,
                public dialogRef: MatDialogRef<InventoryAdjustmentNotesComponent>,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
      
  }

  ngAfterViewInit() {
    //this.dialogRef.close({result:"test"})
  }

  ngOnInit() {
    this.dataForm = this.fb.group({
      note: new FormControl(this.formData.note),
     });
     this.dataForm.setValue({ note: this.data.note })
     //this.dialogRef.close({result:"test"})
  }

  close() {
    // this.dialogRef.close({ note: this.dataForm.value.note, binId: this.data.binId, sku: this.data.sku });
    this.dialogRef.close();
  }
  
  save() {
    this.dialogRef.close({ note: this.dataForm.value.note, binId: this.data.binId, sku: this.data.sku });
    // if(this.dataForm.value.note === "") {
    //   this.msg.show("Please add note.", 'error');
    //   return
    // }
    // let note = this.dataForm;
    // let data = {
    //   id: this.data.id,
    //   sku: this.data.sku,
    //   bin: this.data.binId,
    //   site: this.data.siteId,
    //   note: this.dataForm.value.note,
    //   update: 1
    // }
    // this.dataService.saveAdjustInventory(data)
    //   .subscribe((response: any) => {
    //     if(response.error === "1") {
    //       this.msg.show("Inventory does not exist.", 'error');
    //     } else {
    //       Object.assign(this.data,{note: response.data.note})
    //       this.msg.show("Update note successfully.", 'success');
    //     }
        
    //   }, (err: any) => {
    //     this.msg.show("Failed to update note", 'error');
    // });    
  }


  ngOnDestroy() {
      // this.onDataUpdated.unsubscribe();
      // this.onDataChanged.unsubscribe();
      //this.dataId = '0';
  }
}

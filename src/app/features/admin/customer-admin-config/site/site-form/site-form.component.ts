import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { InventoryService } from 'app/core/services/inventory.service';
import { ApiService } from 'app/core/services/api.service';
import { LocalSite } from 'app/models';

import { MessageService } from 'app/core/services/message.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-site-form',
  templateUrl: './site-form.component.html',
  styleUrls: ['./site-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SiteFormComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  onDataChanged: Subscription;
  onDataUpdated: Subscription;
  dataForm: FormGroup;
  formData: LocalSite = { id: "", name: "", customerOwned: false, customer: "", customerName: "" };
  dataId: string = '0';
  filteredAccounts: Observable<any>;

  constructor(
    private dataService: InventoryService,
    private api: ApiService,
    private msg: MessageService,
    public dialogRef: MatDialogRef<SiteFormComponent>,
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
      this.dataService.onSiteDataUpdated
        .subscribe((savedData: any) => {
          this.loading = false;
          if (savedData.id != undefined) {
            this.dataId = savedData.id;
            this.loadData();
          }
        });

    this.onDataChanged =
      this.dataService.onSiteDataChanged
        .subscribe((data: any) => {
          if (data && data.name != null) {
            this.formData.id = data.id;
            this.formData.name = data.name;
            this.formData.customerOwned = data.customerOwned == 1 ? true : false;
            this.formData.customer = data.customer;
            this.formData.customerName = data.customerName;
          }
          this.dataForm = this.fb.group({
            id: new FormControl(this.dataId),
            name: new FormControl(this.formData.name),
            customerOwned: new FormControl(this.formData.customerOwned),
            customer: new FormControl(this.formData.customer),
            customerName: new FormControl(this.formData.customerName)
          });

          this.filteredAccounts = this.dataForm.get('customerName').valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(val => this.api.getCustomerAutocomplete(val)),
          );
          this.loading = false;
        });

    this.loadData();
  }

  loadData() {
    if (this.dataId != '0') {
      this.loading = true;
      this.dataService.getSiteData(this.dataId);
    } else {
      this.filteredAccounts = this.dataForm.get('customerName').valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(val => this.api.getCustomerAutocomplete(val)),
      );
    }
  }

  save() {
    this.loading = true;
    let data = this.dataForm.value;
    if (data.customerOwned && data.customer == "") {
      this.msg.show("Please select Customer", 'error');
      this.loading = false;
      return;
    }
    data.customer = data.customerOwned ? data.customer : "";
    data.customerOwned = data.customerOwned ? 1 : 0;
    this.dataService.updateSiteData(this.dataForm.value);
  }

  ngOnDestroy() {
    this.onDataUpdated.unsubscribe();
    this.onDataChanged.unsubscribe();
    this.dataId = '0';
  }

  selectAccount(ev) {
    const acc = ev.option.value;
    this.dataForm.get('customer').setValue(acc.id);
    this.dataForm.get('customerName').setValue(acc.name);
  }
}

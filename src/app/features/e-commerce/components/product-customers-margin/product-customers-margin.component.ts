import { Component, OnInit, Input } from '@angular/core';
import { ProductDetails, CustomerMarginProductDataSource } from '../../../../models';
import { ProductImageUploadComponent } from '../product-image-upload/product-image-upload.component';
import { MatTableDataSource } from '@angular/material/table';
import { EcommerceProductService } from '../../product/product.service';
import { uniqBy, sortBy, each } from 'lodash';
import { ProductLogoBlockDialogComponent } from '../product-logo-block-dialog/product-logo-block-dialog.component';
import { MessageService } from 'app/core/services/message.service';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';
import { ApiService } from 'app/core/services/api.service';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-product-customers-margin',
  templateUrl: './product-customers-margin.component.html',
  styleUrls: ['./product-customers-margin.component.scss']
})
export class ProductCustomersMarginComponent implements OnInit {
  @Input() product = new ProductDetails();
  arr: CustomerMarginProductDataSource[] = [];
  @Input() form: FormGroup

  formGroup: FormGroup;
  filteredAccounts: any;
  dataSource: MatTableDataSource<CustomerMarginProductDataSource> | null;
  displayedColumns: string[] = ['customerName'];
  constructor(
    private dialog: MatDialog,
    private productService: EcommerceProductService,
    private msg: MessageService,
    private fb: FormBuilder,
    private api: ApiService
  ) {
  }

  ngOnInit() {
    console.log("this.customerMarginArray.controls",this.customerMarginArray.controls)
    let controls = this.customerMarginArray.controls;
    for(let i=0;i<controls.length;i++) {
      this.ManageAccountNameControl(i);
    }
  }

  ManageAccountNameControl(index: number) {
    console.log("index",index);
    var arrayControl = this.form.get('customerMarginArray') as FormArray;
    this.filteredAccounts = arrayControl.at(index).get('accountName').valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => this.api.getCustomerAutocomplete(val))
    );
  }

  get customerMarginArray(): FormArray {
    return <FormArray>this.form.get('customerMarginArray');
  }

  addRow() {
    const controls = <FormArray>this.form.controls['customerMarginArray'];
    let formGroup = this.fb.group({
        accountName: '',
        accountId: '',
        margin: '',
        delete: false
      });
    controls.push(formGroup);
    this.ManageAccountNameControl(controls.length - 1);
  }

  removeRow(idx: number) {
   this.customerMarginArray.removeAt(idx);
  }

  selectAccount(ev,index) {
    const acc = ev.option.value;
    this.customerMarginArray.controls[index].patchValue({
      accountId: acc.id,
      accountName: acc.name
    });
  }
}

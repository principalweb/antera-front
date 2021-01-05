import { Component, OnInit, Input, OnChanges, SimpleChanges, EventEmitter, OnDestroy, Output, Optional, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { takeUntil, debounceTime, skip, map, distinctUntilChanged, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ProductConfig, Location } from 'app/models';
import * as moment from 'moment';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { displayName } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-order-item-form',
  templateUrl: './order-item-form.component.html',
  styleUrls: ['./order-item-form.component.scss']
})
export class OrderItemFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() item: any;
  @Input() product: any;
  @Input() accountId: any;
  form: FormGroup;
  config: any;
  destroyed$ = new Subject();
  displayName = displayName;
  isTaxExempt: boolean = false;
  hasLinePrice: boolean = false;

  @Output() itemChanged: EventEmitter<any> = new EventEmitter();
  @Output() actions: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();
  filteredAccounts: any[];
  filteredLocations: any[];
  filteredVendors: any[];
  locations: any[];


  constructor(
    private fb: FormBuilder,
    @Optional() public dialogRef: MatDialogRef<OrderItemFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private api: ApiService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.hasPrice();
    this.isAccountTaxExempt(this.accountId);
    this.form = this.createForm();
   
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.form && changes.item && changes.item.currentValue) {

      const _item = {
        ...changes.item.currentValue,
        inhandDate: this.item.inhandDate ? moment(this.item.inhandDate).toDate() : null
      };

      const config = new ProductConfig(_item);
      
      this.form.patchValue(config);
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  createForm() {

    this.form = this.fb.group({
      rollAddonChargesToProduct: [false],
      rollDecoChargesToProduct: [false],
      rollDecoAddonChargesToProduct: [false],
      allowParentKitCalc: [false],
      chargeSalesTax: [false],
      payCommission: [false],
      hideLine: [false],
      overrideInHandDate: [false],
      inhandDate: Date,
      alternateShipToAccountId: [],
      alternateShipToAccount: [],
      shipToLocationId: [],
      shipToLocationName: [],
      itemTax: [0],
      itemTaxOff: [1],
      // Extended params for System Admin
      defaultTaxRate: [],
      productsMargin: [],
      decoMargin: [],
      vendorName: [],
      vendorId: [],
      shippingMargin: [],
      // GST
      chargeGstTaxOnPo: [],
    });

    this.form.get('alternateShipToAccount').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
      this.api.getAccountAutocomplete(keyword)
        .subscribe((res: any[]) => {
          this.filteredAccounts = res;
        });
    });

    this.form.get('vendorName').valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
      this.api.getAccountAutocomplete(keyword)
        .subscribe((res: any[]) => {
          this.filteredVendors = res;
        });
    });

    this.form.get('chargeSalesTax').valueChanges.pipe(
      distinctUntilChanged(),
    ).subscribe((chargeSalesTax) => {
      console.log('chargeSalesTax', chargeSalesTax);
      this.form.patchValue({
        itemTaxOff: chargeSalesTax ? '0' : '1',
      });
    });

    if (this.config && this.config.edit == '0') {
      this.form.disable();
    }

    if (this.item) {
      const _item = {
        ...this.item,
        ...new ProductConfig(this.item)
      };

      this.form.patchValue({
        ..._item,
        itemTaxOff: this.item.itemTaxOff,
        inhandDate: this.item.inhandDate ? moment(this.item.inhandDate).toDate() : null
      });
    }
    

    if (this.item.alternateShipToAccountId) {
      this.getAccountLocations(this.item.alternateShipToAccountId).subscribe((locations) => { });
    }

    this.form.valueChanges.pipe(
      takeUntil(this.destroyed$),
      skip(1),
      debounceTime(500),
    ).subscribe((value) => {
      this.itemChanged.emit({ data: value, valid: this.form.valid });
    });
    return this.form;
  }

  emitClose() {
    this.close.emit(true);

    if (this.dialogRef) {
      this.dialogRef.close(false);
    }
  }

  save() {
    const config = new ProductConfig(this.form.value).toObject();
    const data = {
      ...this.item,
      ...this.form.value,
      ...config,
    };

    const action = {
      type: 'itemChange',
      valid: this.form.valid,
      closeOnSuccess: true,
      payload: data
    };

    this.actions.emit(action);

    if (this.dialogRef) {
      this.dialogRef.close(action);
    }

  }

  clearAlternateShipTo(ev) {
    ev.stopPropagation();
    this.locations = undefined;
    this.form.patchValue({
      alternateShipToAccountId: '',
      alternateShipToAccount: '',
      shipToLocationId: '',
      shipToLocationName: '',
    });
  }

  clearShipToLocation(ev) {
    ev.stopPropagation();
    this.form.patchValue({
      shipToLocationId: '',
      shipToLocationName: ''
    });
  }

  selectAlternateVendor(ev) {
    const account = ev.option.value;
    this.form.patchValue({
      vendorId: account.id,
      vendorName: account.name
    });
  }

  // This should set the default product vendor
  clearAlternateVendor() {
    const data = {
      vendorId: '',
      vendorName: ''
    };
    if (this.product) {
      data.vendorId = this.product.vendorId;
      data.vendorName = this.product.vendorName;
    }
    this.form.patchValue(data);
  }

  getAccountLocations(accountId) {
    return this.api.getLocationsForAccount(accountId).pipe(
      tap((locations: Location[]) => {
        this.locations = locations;
      })
    );
  }

  isAccountTaxExempt(accountId) {
    const data = {
      chargeSalesTax: false, 
      itemTaxOff: 1,
    };
    return this.api.getAccountDetails(accountId).subscribe((res: any) => {
      this.isTaxExempt = Boolean(Number(res.taxExempt));
      console.log('taxExempt', this.isTaxExempt);
      if (this.isTaxExempt == true) {
        this.form.patchValue(data);
      }
    });
  }

  hasPrice() {
    
    if((this.item.lineType == '4') || (this.item.lineType == '5')) {
      console.log(this.hasLinePrice,this.item.lineType);
      this.hasLinePrice = false;
      console.log(this.hasLinePrice);
    } else {
      if(this.item.totalPrice !== 0) {
        this.hasLinePrice = true;
        console.log(this.hasLinePrice);
      }
    }
    console.log(this.hasLinePrice);
  }

  selectAccount(ev) {
    const account = ev.option.value;
    this.getAccountLocations(account.id).subscribe((locations) => { });
    this.form.patchValue({
      alternateShipToAccountId: account.id,
      alternateShipToAccount: account.name
    });


  }

  getLocationName() {
    const locationId = this.form.get('shipToLocationId').value;
    if (locationId) {
      const location = this.locations.find((_location) => _location.id === locationId);
      const value = location && location.locationName;
      return value ? value : '';
    }
    return '';
  }

  addCustomerLocation() {
    // this.dialog.open();
  }
}

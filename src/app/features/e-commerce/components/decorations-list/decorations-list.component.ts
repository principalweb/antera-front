import { Component, OnInit, Inject, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { ArtworksService } from 'app/core/services/artworks.service';
import { EcommerceOrderService } from '../../order.service';
import { Observable } from 'rxjs';
import { find } from 'lodash';
import { DecorationChargesComponent } from '../decoration-charges/decoration-charges.component';
import { fx2Str, fx2N } from 'app/utils/utils';
import { ProductNoteComponent } from '../product-note/product-note.component';
import { get } from 'lodash';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-decorations-list',
  templateUrl: './decorations-list.component.html',
  styleUrls: ['./decorations-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DecorationsListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['checkbox', 'designNo', 'image', 'name', 'decoLocation', 'decoTypeName', 'decoVendor', 'vendorSupplierDecorated', 'quantity', 'cost', 'price', 'actions'];
  list = [];
  lineItem: any = {};
  checkboxes: any = {};
  color = '';
  form: FormGroup;
  designLocations = [];
  filteredVendors: Observable<any>;
  margin = 0;
  loading = false;
  loaded = () => {
    this.loading = false;
  }
  //for permission check
  orderId: any;
  defaultDecoMargin: number;

  constructor(
    private dialogRef: MatDialogRef<DecorationsListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public selection: SelectionService,
    private api: ApiService,
    private orderService: EcommerceOrderService,
    private artworks: ArtworksService,
    private fb: FormBuilder,
    private msg: MessageService,
    private dialog: MatDialog,
    private router: Router
  ) {

    this.lineItem = data.row.lineItem;
    this.defaultDecoMargin = data.decoMargin;
    
    data.row.lineItem.decoVendors.forEach(v => {
      let q = 0;
      // v.decorationDetails.forEach(decoDetail => {
      //   const mrow = find(data.matrixRows, { matrixUpdateId: decoDetail.matrixId });
      //   if (mrow) {
      //     q += Number(mrow.quantity);
      //   }
      // });
      // q = v.quantity; // Temporary solution
    
      const decorationMatrixIds = v.decorationDetails.map((detail) => detail.matrixId);
      data.row.matrixRows.forEach((row) => {
        if (decorationMatrixIds.includes(row.matrixUpdateId)) {
          q = row.quantity;
        } 
      });
      if (q === 0) {
        return;
      }

      let row = {
        id: v.decoVendorRecordId,
        designNo: v.designModal,
        image: '',
        name: v.designName,
        decoLocation: v.decoLocation,
        decoType: v.decoType,
        decoTypeName: v.decoTypeName,
        vendorSupplierDecorated: +v.vendorSupplierDecorated,
        quantity: q,
        price: fx2Str(v.customerPrice),
        cost: fx2Str(v.itemCost),
        origCustomerPrice: v.origCustomerPrice,
        origCustomerCost: v.origCustomerCost,
        decoVendorId: v.vendorId,
        decoVendorName: v.vendorName,
        designId: v.designId,
        decorationNotes: v.decorationNotes
      };

      if (v.decorationDetails && v.decorationDetails.length > 0) {
        if (v.decorationDetails[0] && v.decorationDetails[0].variationImagesThumbnail && v.decorationDetails[0].variationImagesThumbnail[0]) {
          row.image = v.decorationDetails[0].variationImagesThumbnail[0];
        }
      }

      this.list.push(row);
    });

    const obj: any = {};
    this.list.forEach((row, i) => {
      obj[`decoId${i}`] = [row.id, Validators.required];
      obj[`decoLocation${i}`] = [row.decoLocation, Validators.required];
      obj[`decoVendorId${i}`] = row.decoVendorId;
      const supplierDecorated = +row.vendorSupplierDecorated;
      obj[`decoVendorName${i}`] = supplierDecorated ? [row.decoVendorName] : [row.decoVendorName, Validators.required];
      obj[`vendorSupplierDecorated${i}`] = [supplierDecorated];
      obj[`price${i}`] = row.price;
      obj[`cost${i}`] = row.cost;
      obj[`decorationNotes${i}`] = [row.decorationNotes];
    });
    obj.margin = this.lineItem.decoMargin;

    this.form = this.fb.group(obj);
    this.selection.init(this.list);

    this.orderId = data.oId;
  }

  ngAfterViewInit(): void {
    this.setValidatorsListener();
  }

  setValidatorsListener()  {
    const updateControls = () => {
      this.list.forEach((row, i) => {
        const vendorControl = this.form.get(`decoVendorName${i}`); 
        const supplierDecoratedControl = this.form.get(`vendorSupplierDecorated${i}`);
        if (supplierDecoratedControl.value) {
          vendorControl.setValidators(null);
        } else {
          vendorControl.setValidators([Validators.required]);
        }
        vendorControl.updateValueAndValidity({emitEvent : false});
      });
    };

    // On form updates
    this.form.valueChanges.subscribe((res) => {
      updateControls();
    });
  }

  clearMargin() {
    this.form.get('margin').setValue(null);
    this.updateMargin();
  }

  updateMargin() {
    const margin = this.form.get('margin').value;
    for (let i = 0; i < this.list.length; i++) {
      const deco = this.list[i];
      const priceField = this.form.get(`price${i}`);
      const costField = this.form.get(`cost${i}`);

      if (margin === null || margin === '') {
        // Reset margin by passing null
        priceField.setValue(deco.origCustomerPrice);
      } else if (margin === 0) {
        // Handle zero margin
        priceField.setValue(costField.value);
      } else {
        let newPrice = fx2N(costField.value * 100 / (100 - margin));
        priceField.setValue(newPrice);
      }
    }
  }

  ngOnInit() {
    this.selection.reset(false);
    this.selection.onSelectionChanged.subscribe(selection => {
      this.checkboxes = selection;
    });
    this.artworks.getDesignLocations()
        .subscribe((locations: any[]) => {
          this.designLocations = locations;
        });
  }

  addDecoration(ev) {
    ev.preventDefault();

    this.dialogRef.close({
      action: 'add'
    });
  }

  deleteDecoration(ev) {
    ev.preventDefault();
    
    const confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete selected design(s)?';

    confirmDialogRef.afterClosed().subscribe(result => {
      if ( result )
      {
        const selection = this.checkboxes;
        this.loading = true;
        this.api.deleteDesignFromLineItem({
          orderId: this.orderService.order.id,
          lineItemId: this.lineItem.lineItemUpdateId,
          decoVendorRecordIds: this.selection.selectedIds
        }).pipe(
          switchMap(() => this.orderService.getOrder(this.orderService.order.id)),
        ).subscribe(res => {
          this.list = this.list.filter(item => !selection[item.id]);
          this.loading = false;
          this.selection.init(this.list);
        }, this.loaded)
      }
    });
  }

  onSelectedChange(id) {
    this.selection.toggle(id);
  }

  toggleAll(ev) {
    this.selection.reset(ev.checked);
  }

  showVendors(r) {
    this.filteredVendors = this.api.getDecoratorVendorsByDecoType({
      decoType: r.decoType
    });
  }

  getDecoVendors(row) {
    this.filteredVendors = this.api.getDecoratorVendorsByDecoType({decoType: row.decoType});
  }

  selectDecoVendor(ev, i) {
    const vendor = ev.option.value;
    this.form.patchValue({
      ['decoVendorId'+i]: vendor.id,
      ['decoVendorName'+i]: vendor.vendor,
    });

    this.loading = true;
    const v = this.list[i];
    const v1 = find(this.data.row.lineItem.decoVendors, { decoVendorRecordId: v.id })

    v1.vendorId = vendor.id;
    v1.vendorName = vendor.vendor;
    this.api.linkDecoChargeToDecoVendor(v1)
      .subscribe(
        (res: any) => {
          if (res.status === 'error') {
            this.msg.show(res.msg, 'error');
          } else {
            this.form.patchValue({
              ['price'+i]: res.extra.customerPrice,
              ['cost'+i]: res.extra.itemCost,
              ['vendorSupplierDecorated'+i]: +res.extra.vendorSupplierDecorated
            });
          }
          this.loading = false;
        },
        this.loaded
      );
  }

  save() {
    if (this.form.invalid) {
      return;
    }

    this.dialogRef.close({
      data: this.form.value,
      action: 'save'
    })
  }

  showDecorationCharges(ev) {
    ev.preventDefault();

    if (this.selection.selectedCount !== 1) {
      this.msg.show('Please select 1 decoration.', 'error');
      return;
    }

    const vendor = find(this.data.row.lineItem.decoVendors, {
      decoVendorRecordId: this.selection.selectedIds[0]
    });

    const selectedMatrixRows = this.orderService.selectedMatrixRows;

    const dialogRef = this.dialog.open(DecorationChargesComponent, {
      data: {
        charges: vendor.addonCharges,
        product: this.data.row,
        oId: this.data.oId,
        matrixRows: selectedMatrixRows
      }
    });

    dialogRef.afterClosed().subscribe(
      (res) => {
        if (res && res.action === 'save') {
          this.loading = true;

          vendor.addonCharges = res.charges;

          let request = this.api.updateDecoVendors(
            this.orderService.order.id,
            this.lineItem.lineItemUpdateId,
            this.data.row.lineItem.decoVendors
          );

          if (res.deleted.length > 0) {
            request = request.pipe(
              switchMap(() =>
                this.api.deleteAddonCharges(
                  this.orderService.order.id,
                  this.lineItem.lineItemUpdateId,
                  res.deleted
                )
              ),
            );
          }

          request.pipe(
            switchMap(() => this.orderService.getOrder(this.orderService.order.id))
          ).subscribe(
            () => {
              this.dialogRef.close();
            },
            this.loaded
          );
        }
      }
    );
  }

  showVariations(item) {
    this.dialogRef.close({
      action: 'change-variation',
      designId: item.designId,
      color: this.data.row.color,
      decoVendorRecordId: item.id,
      itemNo: this.lineItem.itemNo
    });
  }

  applyToAll() {

    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close({
      data: this.form.value,
      action: 'apply-to-all'
    })
  }

  applyToRemaining() {

    if (this.form.invalid) {
      return;
    }
    this.dialogRef.close({
      data: this.form.value,
      action: 'apply-to-remaining'
    })
  }

  gotoArtwork(item) {
    this.api.getArtworkIdFromDesignId(item.designId)
      .subscribe(res => {
        this.dialogRef.close();
        this.router.navigate(['/artworks', res]);
      });
  }

  editDecorationNotes(item, i) {
    let dialogRef = this.dialog.open(ProductNoteComponent, {
      panelClass: 'product-note-dialog',
      data      : {
          type: 'Decoration Note',
          decorationNote: !item.decorationNotes ? '' : item.decorationNotes,
      }
    });

    dialogRef.afterClosed()
      .subscribe((decorationNotes: any) => {
          if (decorationNotes == undefined) return;
          this.form.patchValue({
            ['decorationNotes'+i]: decorationNotes,
          });
          this.save();
      });
  }
}

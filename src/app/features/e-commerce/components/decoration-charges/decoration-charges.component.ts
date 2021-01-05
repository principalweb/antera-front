import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { findIndex, sortBy, sum, unionBy, each, remove } from 'lodash';

import { AdditionalCharge } from 'app/models';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { EditChargeComponent } from '../edit-charge/edit-charge.component';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-decoration-charges',
  templateUrl: './decoration-charges.component.html',
  styleUrls: ['./decoration-charges.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DecorationChargesComponent implements OnInit {

  additionalCharges: any;
  filteredCharges: any[];
  totalCount = 0;

  selectCharges = new FormControl();
  selectedCharges: any = [];

  search = new FormControl('');
  displayColumns = [
    'code', 'name', 'description', 'quantity', 'cost',
    'price', 'itemTaxOff', 'chargeGstTaxOnPo', 'isCommissionEnabled',
    'matchOrderQty', 'actions'
  ];

  // for permission check
  orderId: any;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DecorationChargesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msg: MessageService,
    private api: ApiService
  ){

    const mrows = data.product.lineItem.matrixRows.filter((item) => data.matrixRows.includes(item.matrixUpdateId));
    this.totalCount = sum(
      mrows.map(row => Number(row.quantity))
    );

    this.orderId = data.oId;
  }

  ngOnInit() {
    this.api.getAddonCharges({term:{status:'1'}}).subscribe(
      (res: any[]) => {
        this.additionalCharges = unionBy(
          this.data.charges.map(r => new AdditionalCharge(r)),
          res.map(r => AdditionalCharge.fromCharge(r)),
          'code'
        )
        this.filteredCharges = this.additionalCharges;
      },
      (err) => {}
    )
    this.selectedCharges = this.data.charges.map(c => new AdditionalCharge(c)) || [];
    this.selectCharges.setValue(this.selectedCharges.map(c => c.code));

    this.search.valueChanges.pipe(
      distinctUntilChanged(),
    ).subscribe(val => {
        this.filteredCharges =
          this.additionalCharges.filter(charge =>
            charge.name.toLowerCase().indexOf(val.toLowerCase()) >= 0
          );

        const selectedCodes = [];
        each(this.selectedCharges, ch => {
          if (findIndex(this.filteredCharges, { code: ch.code }) > -1) {
            selectedCodes.push(ch.code);
          }
        });

        this.selectCharges.setValue(selectedCodes);
      });
  }

  changeSelectedCharges(codes){
    each(this.filteredCharges, ch => {
      if (codes.indexOf(ch.code) > -1) {
        const j = findIndex(this.selectedCharges, { code: ch.code });
        if (j < 0) {

          // Temporary fix due to naming mismatch
          ch.itemCode = ch.code;
          ch.addonChargesType = ch.chargeType;
          this.selectedCharges.push(ch);
        }
      } else {
        remove(this.selectedCharges, { code: ch.code });
      }
    });
    this.selectedCharges = this.selectedCharges.slice(0);
  }

  onEditCharge(row, i){
    const dialogRef = this.dialog.open(EditChargeComponent, {
      data: {
        vendor: true,
        addon: row,
      },
      panelClass: "order-edit-charge-modal"
    });

    dialogRef.afterClosed().subscribe((data) => {
      if(!data)
        return;

      const id = findIndex(this.additionalCharges, { code: row.code });
      this.additionalCharges[id].setData(data);

      const i = findIndex(this.selectedCharges, { code: row.code });
      this.selectedCharges[i].setData(data);
    });
  }

  save(){
    const deletedCharges = [];
    this.data.charges.forEach(charge => {
      const i = findIndex(this.selectedCharges, { code: charge.code });
      if (i < 0) {
        deletedCharges.push(charge.addonChargeUpdateId);
      }
    });

    this.dialogRef.close({
      action: 'save',
      charges: this.selectedCharges.map(c => c.toObject()),
      deleted: deletedCharges
    });
  }

  /* Temporarily disabled.
  addCharge() {
    const dialogRef = this.dialog.open(EditChargeComponent, {
      data: {},
      panelClass: "order-edit-charge-modal"
    });

    dialogRef.afterClosed().subscribe((data) => {
      if(!data) {
        return;
      }

      const i = findIndex(this.additionalCharges, { code: data.code });

      if (i >= 0) {
        this.msg.show('Item code already exists', 'error');
        return;
      }

      this.selectedCharges.push(
        new AdditionalCharge({
          ...data,
          matchOrderQty: false,
          itemTaxOff: false,
          chargeGstTaxOnPo: false,
          isCommissionEnabled: false
        })
      );
      this.selectedCharges = this.selectedCharges.slice(0);
    });
  }
  */
 
  deleteCharge(i) {
    this.selectedCharges.splice(i, 1);
    this.selectCharges.setValue(this.selectedCharges.map(c => c.code));
    this.selectedCharges = this.selectedCharges.slice(0);
  }

  checkQuantity(element) {
    if (element.matchOrderQty) {
      element.quantity = this.totalCount;
    } else {
      element.quantity = 1;
    }
  }

  clearSearch() {
    this.search.setValue('');
  }
}

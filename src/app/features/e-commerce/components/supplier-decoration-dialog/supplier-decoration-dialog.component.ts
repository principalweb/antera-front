import { Component, OnInit, Input, Optional, Inject } from '@angular/core';
import { ProductDetails } from 'app/models';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrderItemFormComponent } from '../../order-form/order-item/order-item-form/order-item-form.component';

@Component({
  selector: 'supplier-decoration-dialog',
  templateUrl: './supplier-decoration-dialog.component.html',
  styleUrls: ['./supplier-decoration-dialog.component.scss']
})
export class SupplierDecorationDialogComponent implements OnInit {

  @Input() product: ProductDetails;
  @Input() location: any;
  @Input() decoration: any;
  tabIndex = 0;
  locationQuantities: [];
  locationTableMap: any;
  decorationIndex: number = 0;

  constructor(
    @Optional() public dialogRef: MatDialogRef<OrderItemFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
  ) { }

  ngOnInit() {
    this.setInitialTab();

    this.locationTableMap = this.product.SupplierLocationArray.Location.reduce((tableMap, location, index) => {
      let table = {};
      location.DecorationArray.Decoration.forEach(decoration => {
        if (!table[decoration.decorationId]) {
          table[decoration.decorationId] = { ...decoration };
          table[decoration.decorationId]['chargeMap'] = {};
        }

        decoration.ChargeArray.Charge.forEach(charge => {
          if (!table[decoration.decorationId]['chargeMap'][charge.chargeId]) {
            table[decoration.decorationId]['chargeMap'][charge.chargeId] = { ...charge };
            table[decoration.decorationId]['chargeMap'][charge.chargeId]['priceMap'] = {};
            charge.ChargePriceArray.ChargePrice.forEach((price) => {
              if (!table[decoration.decorationId]['chargeMap'][charge.chargeId]['priceMap'][price.xMinQty]) {
                table[decoration.decorationId]['chargeMap'][charge.chargeId]['priceMap'][price.xMinQty] = { ...price };
              }
            });
          }
        });
      });

      tableMap[location.locationId] = table;
      return tableMap;
    }, {});

    this.locationQuantities = this.product.SupplierLocationArray.Location.reduce((locationQuantities, location, index) => {
      // LocationArray.Location
      // DecorationArray.Decoration
      // ChargeArray.Charge
      location.DecorationArray.Decoration.forEach(decoration => {
        const quantities = [];
        if (!locationQuantities[location.locationId]) {
          locationQuantities[location.locationId] = {};
        }

        decoration.ChargeArray.Charge.forEach(charge => {
          charge.ChargePriceArray.ChargePrice.forEach((price) => {
            if (quantities.indexOf(price.xMinQty) === -1) {
              quantities.push(price.xMinQty);
            }
          });
        });
        quantities.sort();

        locationQuantities[location.locationId][decoration.decorationId] = quantities;
      });
      return locationQuantities;
    }, {});
  }

  private setInitialTab() {
    let location = this.location;
    let locationIndex;
    if (location) {
      locationIndex = this.product.SupplierLocationArray.Location.findIndex((location) => location.locationId === this.location.locationId);
    } else {
      locationIndex = this.product.SupplierLocationArray.Location.findIndex((location) => location.defaultLocation == '1');
    }

    if (locationIndex === -1) {
      locationIndex = 0;
    }

    location = this.product.SupplierLocationArray.Location[locationIndex];

    if (this.decoration) {
      this.decorationIndex = location.DecorationArray.Decoration.findIndex((deco) => deco.decorationId === this.decoration.decorationId);
    } else {
      this.decorationIndex = location.DecorationArray.Decoration.findIndex((deco) => deco.defaultDecoration == '1');
      if (this.decorationIndex === -1) {
        this.decorationIndex = 0;
      }
    }
    this.tabIndex = locationIndex;
  }

  getChargePrice(locationId, decorationId, chargeId, qty) {
    return this.locationTableMap
      && this.locationTableMap[locationId]
      && this.locationTableMap[locationId][decorationId]
      && this.locationTableMap[locationId][decorationId]['chargeMap']
      && this.locationTableMap[locationId][decorationId]['chargeMap'][chargeId]
      && this.locationTableMap[locationId][decorationId]['chargeMap'][chargeId]['priceMap']
      && this.locationTableMap[locationId][decorationId]['chargeMap'][chargeId]['priceMap'][qty];
  }

}

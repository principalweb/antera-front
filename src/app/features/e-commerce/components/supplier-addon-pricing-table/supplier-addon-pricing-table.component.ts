import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ProductDetails } from 'app/models';

@Component({
  selector: 'supplier-addon-pricing-table',
  templateUrl: './supplier-addon-pricing-table.component.html',
  styleUrls: ['./supplier-addon-pricing-table.component.css']
})
export class SupplierAddonPricingTableComponent implements OnInit {

  @Input() product: ProductDetails;
  @Input() location: any;
  @Input() decoration: any;
  @Output() addCharge: EventEmitter<any> = new EventEmitter<any>();
  chargeTable: {};
  quantities: any[];

  constructor() { }

  ngOnInit() {
    this.mapToTable();
  }

  addChargeAction(charge) {
    this.addCharge.emit(charge);
  }

  mapToTable() {
    let table = {};
    let quantities = [];

    this.decoration.ChargeArray.Charge.forEach(charge => {
      if (!table[charge.chargeId]) {
        table[charge.chargeId] = { ...charge };
        table[charge.chargeId]['priceMap'] = {};
        charge.ChargePriceArray.ChargePrice.forEach((price) => {
          if (!table[charge.chargeId]['priceMap'][price.xMinQty]) {
            table[charge.chargeId]['priceMap'][price.xMinQty] = { ...price };
          }
        });
      }
      charge.ChargePriceArray.ChargePrice.forEach((price) => {
        if (quantities.indexOf(price.xMinQty) === -1) {
          quantities.push(price.xMinQty);
        }
      });
    });

    quantities.sort();
    this.quantities = quantities;
    this.chargeTable = table;
  }

  getChargePrice(chargeId, qty) {
    return this.chargeTable && this.chargeTable[chargeId]['priceMap'] && this.chargeTable[chargeId]['priceMap'][qty];
  }

}

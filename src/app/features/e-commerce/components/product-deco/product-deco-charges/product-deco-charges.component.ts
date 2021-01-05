import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { findIndex, sortBy, sum, unionBy, each, remove } from 'lodash';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ArtworksService } from 'app/core/services/artworks.service';
import { AdditionalCharge } from 'app/models';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { EcommerceProductService } from 'app/features/e-commerce/product/product.service';
/*import { EditChargeComponent } from '../edit-charge/edit-charge.component';*/
import { distinctUntilChanged } from 'rxjs/operators';

import { ProductDecoChargePriceComponent } from '../product-deco-charge-price/product-deco-charge-price.component';

@Component({
  selector: 'product-deco-charges',
  templateUrl: './product-deco-charges.component.html',
  styleUrls: ['./product-deco-charges.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductDecoChargesComponent implements OnInit {
  @Input() productDecoId: string;

  additionalCharges: any;
  filteredCharges: any[];
  totalCount = 0;
  onProductChanged: Subscription;
  supplierLocations: any[];

  selectCharges = new FormControl();
  selectedCharges: any = [];
  data: any = {charges: []};

  search = new FormControl('');
  displayColumns = [
    'code', 'name', 'description', 'isSupplierDecorated', 'actions'
  ];

  constructor(
    public dialog: MatDialog,
    private msg: MessageService,
    private productService: EcommerceProductService,
    private dataService: ArtworksService,
    private api: ApiService
  ) {
      this.onProductChanged =
        this.productService.onProductChanged
            .subscribe((data:any) => {
                this.supplierLocations = data.SupplierLocationArray.Location;
            });
  }

  ngOnInit() {

    this.api.getAddonCharges({term: {status: '1'}}).subscribe(
      (res: any[]) => {
        this.additionalCharges = unionBy(
          this.data.charges.map(r => new AdditionalCharge(r)),
          res.map(r => AdditionalCharge.fromCharge(r)),
          'code'
        );
        this.filteredCharges = sortBy(this.additionalCharges, 'name');
      },
      (err) => {}
    );
    this.loadData();

    this.search.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(val => {
        this.filteredCharges =
          this.additionalCharges.filter(charge =>
            charge.name.toLowerCase().indexOf(val.toLowerCase()) >= 0
          );

        this.filteredCharges = sortBy(this.filteredCharges, 'name');
        const selectedCodes = [];
        each(this.selectedCharges, ch => {
          if (findIndex(this.filteredCharges, { id: ch.id }) > -1) {
            selectedCodes.push(ch.id);
          }
        });

        this.selectCharges.setValue(selectedCodes);
      });
  }

  loadData() {
    if (this.productDecoId != '0') {
        this.dataService.getProductDecoData(this.productDecoId)
            .subscribe((data: any) => {
              this.data = data;
              this.selectedCharges = this.data.charges.map(c => {
                                                                  c.supplierDecorationAvail = c.supplierDecorationAvail == "1"?true:false;
                                                                  c.supplierDecorated = c.supplierDecorated == "1"?true:false;
                                                                  return c;
                                                                });
              this.selectCharges.setValue(this.selectedCharges.map(c => c.chargeId));
            }, err => {
                this.msg.show(err.message, 'error');
            });
    }
  }

  editCharge(i) {
    const dialogRef = this.dialog.open(ProductDecoChargePriceComponent, {
      data: this.selectedCharges[i],
      panelClass: "antera-details-dialog"
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }

      this.selectedCharges[i].ChargePriceArray.ChargePrice = data;
    });
  }

  deleteCharge(i) {
    this.selectedCharges.splice(i, 1);
    this.selectCharges.setValue(this.selectedCharges.map(c => c.chargeId));
    this.selectedCharges = this.selectedCharges.slice(0);
  }

  changeSelectedCharges(codes){
    each(this.filteredCharges, ch => {
      if (codes.indexOf(ch.id) > -1) {
        const j = findIndex(this.selectedCharges, { chargeId: ch.id });
        if (j < 0) {
          ch.supplierChargeId = false;
          ch.supplierDecorated = false;
          ch.supplierDecorationAvail = false;
          if (this.data.supplierDeco && this.data.supplierDecoId) {
            if (this.supplierLocations.length > 0) {
              this.supplierLocations.forEach(loc => {
                if (loc.DecorationArray && loc.DecorationArray.Decoration && loc.DecorationArray.Decoration.length > 0) {
                  loc.DecorationArray.Decoration.forEach(deco => {
                    if (deco.decorationId == this.data.supplierDecoId) {
                      if (deco.ChargeArray && deco.ChargeArray.Charge) {
                        deco.ChargeArray.Charge.forEach(charge => {
                          if(charge.chargeId == ch.id) {
                            ch.supplierDecorationAvail = true;
                            ch.supplierChargeId = charge.id;
                            return;
                          }
                        });
                      }
                    }
                  });
                }
                if (ch.supplierDecorationAvail) {
                  return;
                }
              });
            }
          }
          const chp = [{
                        xMinQty: ch.quantity,
                        xUom: 'EA',
                        yMinQty: '0',
                        yUom: '',
                        salePrice: ch.price,
                        price: ch.cost,
          }];
          this.selectedCharges.push({
                                    productDecoId: this.productDecoId,
                                    supplierChargeId: ch.supplierChargeId,
                                    supplierDecorated: ch.supplierDecorated,
                                    supplierDecorationAvail: ch.supplierDecorationAvail,
                                    chargeCode: ch.code,
                                    chargeName: ch.name,
                                    chargeId: ch.id,
                                    chargeDescription: ch.description,
                                    ChargePriceArray: {ChargePrice: chp}
                                  });
        }
      } else {
        remove(this.selectedCharges, { chargeId: ch.id });
      }
    });
    this.selectedCharges = this.selectedCharges.slice(0);
  }

  save(){
    this.data.charges = this.selectedCharges;
    this.dataService.updateProductDecoData(this.data)
        .subscribe((data:any) => {
            this.msg.show(data.msg, 'error');
            if (data.id) {
              this.loadData();
            }
        }, err => {
            this.msg.show(err.message, 'error');
        });
  }

  clearSearch() {
    this.search.setValue('');
  }

}

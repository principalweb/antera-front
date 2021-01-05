import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { findIndex, sortBy, unionBy, each, remove } from 'lodash';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ArtworksService } from 'app/core/services/artworks.service';
import { AdditionalCharge } from 'app/models';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
import { EcommerceProductService } from 'app/features/e-commerce/product/product.service';
import { distinctUntilChanged } from 'rxjs/operators';

import { ProductChargePriceComponent } from './product-charge-price/product-charge-price.component';

@Component({
  selector: 'app-product-charges',
  templateUrl: './product-charges.component.html',
  styleUrls: ['./product-charges.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductChargesComponent implements OnInit {

  @Output() save = new EventEmitter();

  additionalCharges: any;
  filteredCharges: any[];
  totalCount = 0;
  onProductChanged: Subscription;

  selectCharges = new FormControl();
  selectedCharges: any = [];
  data: any = {charges: []};

  search = new FormControl('');
  displayColumns = [
    'code', 'name', 'description', 'actions'
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
        .subscribe((data: any) => {
            this.selectedCharges = data.ChargeArray.Charge || [];
            this.selectCharges.setValue(this.selectedCharges.map(c => c.chargeId));
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

    this.search.valueChanges.pipe(
      distinctUntilChanged()
    ).subscribe(val => {
      if (val !== '') {
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
      } else{
        this.filteredCharges = sortBy(this.additionalCharges, 'name');
        this.selectCharges.setValue(this.selectedCharges.map(c => c.chargeId));
      }
    });
  }

  editCharge(i) {
    const dialogRef = this.dialog.open(ProductChargePriceComponent, {
      data: this.selectedCharges[i],
      panelClass: 'antera-details-dialog'
    });

    dialogRef.afterClosed().subscribe((data) => {
      if (!data) {
        return;
      }

      this.selectedCharges[i].ChargePriceArray.ChargePrice = data;
      this.save.emit(this.selectedCharges);
    });
  }

  deleteCharge(i) {
    this.selectedCharges.splice(i, 1);
    this.selectCharges.setValue(this.selectedCharges.map(c => c.chargeId));
    this.selectedCharges = this.selectedCharges.slice(0);
    this.save.emit(this.selectedCharges);
  }

  changeSelectedCharges(codes){
    each(this.filteredCharges, ch => {
      if (codes.indexOf(ch.id) > -1) {
        const j = findIndex(this.selectedCharges, { chargeId: ch.id });
        if (j < 0) {
          const chp = [{
                        xMinQty: ch.quantity,
                        xUom: 'EA',
                        yMinQty: '0',
                        yUom: '',
                        salePrice: ch.price,
                        price: ch.cost,
          }];
          this.selectedCharges.push({
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
    this.save.emit(this.selectedCharges);
  }

  update() {
  }

  clearSearch() {
    this.search.setValue('');
  }
}

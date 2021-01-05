import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { ProductPricingMethodService } from 'app/features/e-commerce/products/product-pricing/product-pricing-method.service';
import { NewPricingMethodDialogComponent } from './new-pricing-method-dialog/new-pricing-method-dialog.component';

@Component({
  selector: "app-pricing-methods",
  templateUrl: './pricing-methods.component.html',
  styleUrls: ['./pricing-methods.component.scss'],
})
export class PricingMethodsComponent implements OnInit {
  pricingMethods = [];
  
  dialogRef: any;
  constructor(
    public dialog: MatDialog,
    private msg: MessageService,
    private productPricingMethodService: ProductPricingMethodService,
    ) {}

  ngOnInit(): void {
    this.loadPricingMethods();
  }

  private loadPricingMethods() {
    this.productPricingMethodService
      .getPricingMethodList()
      .subscribe((pricingMethods: []) => {
        pricingMethods.forEach((pricingMethod) => {
          this.pricingMethods.push(pricingMethod);
        });
      });
  }

  newPricingMethod() {
    this.dialogRef = this.dialog.open(NewPricingMethodDialogComponent, {
      data: {
        action: 'new pricing level',
      },
    });

    this.dialogRef
      .afterClosed()
      .subscribe((newPricingLevel ) => {
        this.loadPricingMethods();
        console.log('new pricing level ------->>>>>', newPricingLevel);
              // this.decoTypeGroupsList.loading = false;
            }
          );
  }
}

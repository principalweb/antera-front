import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef, ViewChild, Optional, Inject } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { EcommerceProductsService } from '../../products/products.service';
import { ProductImagesComponent } from '../../products/product-images/product-images.component';
import { ProductListComponent } from '../../products/product-list/product-list.component';
import { takeUntil } from 'rxjs/operators';
import { ProductUniversalSearchComponent } from '../../components/product-universal-search/product-universal-search.component';
import { ProductDetails } from 'app/models';
import { OrderCreateProductDialogComponent } from '../order-add-item/order-create-product-dialog/order-create-product-dialog.component';
import { ProductService } from 'app/core/services/product.service';

@Component({
  selector: 'app-order-find-products',
  templateUrl: './order-find-products.component.html',
  styleUrls: ['./order-find-products.component.scss'],
  providers: [
    ProductService
  ]
})
export class OrderFindProductsComponent implements OnInit {

  view = 'images';

  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() actions: EventEmitter<any> = new EventEmitter();

  @ViewChild(ProductImagesComponent) imagesView: ProductImagesComponent;
  @ViewChild(ProductListComponent) listView: ProductListComponent;

  constructor(
    private cd: ChangeDetectorRef,
    @Optional() public dialogRef: MatDialogRef<OrderFindProductsComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: any,
    private dialog: MatDialog,
    private productsService: EcommerceProductsService,
  ) { }

  ngOnInit() {

    // Mark for check when changes occur
    // TODO: Unsubscribe properly.
    this.productsService.onProductsChanged.subscribe((res) => {
      this.cd.markForCheck();
    });
  }

  changeView(event: MatButtonToggleChange) {
    this.view = event.value;
    this.cd.markForCheck();
  }

  emitClose() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.close.emit(true);
  }

  clearFilters() {
    if (this.view === 'images') {
      this.imagesView.clearFilters();
    } else {
      this.listView.clearFilters();
    }
  }

  openAdvanceSearchDialog() {
    const dialog = this.dialog.open(ProductUniversalSearchComponent, {
      panelClass: 'product-universal-search',
      data: {
        addTo: 'order',
        parent: this,
        addFirstRow: true,
      }
    });

    dialog.afterClosed().subscribe(
      (action) => {
        if (action === 'add_to_product') {
          // Product has already been added in the product search dialog
          this.dialogRef.close({ type: 'productAddedToOrder' });
        }
      }
    );
  }

  addNewProduct() {
    const productDetails = new ProductDetails({
      poType: 'DropShip',
      productType: 1,
    });

    const dialogRef = this.dialog.open(OrderCreateProductDialogComponent, {
      width: '90vw',
      height: '90vh',
    });

    dialogRef.componentInstance.product = productDetails;

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        const action = {
          type: 'addProductsToOrder',
          payload: [res.id]
        };

        if (this.dialogRef) {
          this.dialogRef.close(action);
        }
      }
    });
  }

  addToOrder() {
    const selection = this.productsService.onSelectionChanged.getValue();
    console.log('Add to order', selection);

    const action = {
      type: 'addProductsToOrder',
      payload: selection
    };

    if (this.dialogRef) {
      this.dialogRef.close(action);
    }

    this.actions.emit(action);
  }

}

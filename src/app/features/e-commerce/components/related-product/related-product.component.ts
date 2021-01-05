import { Component, EventEmitter, OnInit, Input, ViewEncapsulation, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EcommerceProductsService } from '../../products/products.service';
import { MessageService } from 'app/core/services/message.service';
import { ProductManualEntryComponent } from '../product-manual-entry/product-manual-entry.component';
import { ProductUniversalSearchComponent } from '../product-universal-search/product-universal-search.component';
import { ProductDetails } from '../../../../models';
import { fuseAnimations } from '@fuse/animations';
import { RelatedProductListComponent } from '../related-product-list/related-product-list.component';

@Component({
  selector: 'related-product',
  templateUrl: './related-product.component.html',
  styleUrls: ['./related-product.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class RelatedProductComponent implements OnInit {
  @Input() product = new ProductDetails();
  @Output() save = new EventEmitter();
  @ViewChild(RelatedProductListComponent) dataList: RelatedProductListComponent;

  public view: string;
  selectedProducts = [];
  onSelectionChangedSubscription: Subscription;

  constructor(
    private msg: MessageService,
    private dialog: MatDialog,
    private productsService: EcommerceProductsService
  ) { }

  ngOnInit() {
    this.showView('related');

    this.onSelectionChangedSubscription =
      this.productsService.onSelectionChanged.subscribe(selection => {
        this.selectedProducts = selection;
      });
  }

  showView(view) {
      this.view = view;
  }

  addToList() {
    if (this.selectedProducts && this.selectedProducts.length == 0) {
      this.msg.show('Please select products to add.', 'error');
      return;
    }
    this.showView('related');
    this.selectedProducts.forEach(id => {
        if (id == this.product.id) {
          this.msg.show('Selected product -' + this.product.productId + ' is same as the main product.', 'error');
        } else {
          const c = this.product.RelatedProductArray.RelatedProduct.find((v) =>  v.pId == id);
          if (c) {
            this.msg.show('Selected product -' + c.productId + ' already attached.', 'error');
          } else {
            const prd = this.productsService.products.find((v) =>  v.id == id);
            if (prd) {
              if (prd.productType == 2) {
                this.msg.show('Selected product -' + prd.productId + ' is kit.', 'error');
              } else {
                this.product.RelatedProductArray.RelatedProduct.push({
                    id: '',
                    pId: id,
                    productId: prd.productId,
                    productName: prd.productName,
                    vendorName: prd.vendorName,
                    vendorId: prd.vendorId,
                    MediaContent: prd.MediaContent,
                    type: '1',
                });
              }
            }
          }
        }
    });
    //this.save.emit();
  }

  newProduct() {
    this.dialog.open(ProductManualEntryComponent, {
      panelClass: 'product-manual-entry-dialog'
    });
  }

  openAdvanceSearchDialog() {
    const dialog = this.dialog.open(ProductUniversalSearchComponent, {
      panelClass: 'product-universal-search',
      data: {
        addTo: 'kit',
        parent: this
      }
    });

    dialog.afterClosed().subscribe(
      action => {
        if (action === 'add_to_product') {
          this.view = 'related';
        }
      }
    )
  }

  clearFilters() {
    this.productsService.messageQueue.next({ type: 'clear-filters' });
  }

  deleteSelectedData() {
    this.dataList.deleteSelected();
  }

}

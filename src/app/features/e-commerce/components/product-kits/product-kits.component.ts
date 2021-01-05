import { Component, EventEmitter, OnInit, Input, ViewEncapsulation, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EcommerceProductsService } from '../../products/products.service';
import { MessageService } from 'app/core/services/message.service';
import { KitListComponent } from './kit-list/kit-list.component';
import { ProductManualEntryComponent } from '../product-manual-entry/product-manual-entry.component';
import { ProductUniversalSearchComponent } from '../product-universal-search/product-universal-search.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ProductDetails } from '../../../../models';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-product-kits',
  templateUrl: './product-kits.component.html',
  styleUrls: ['./product-kits.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class ProductKitsComponent implements OnInit {
  @Input() product = new ProductDetails();
  @Output() save = new EventEmitter();
  @ViewChild(KitListComponent) dataList: KitListComponent;

  public view:string;
  selectedProducts = [];
  onSelectionChangedSubscription: Subscription;

  constructor(
    private msg: MessageService,
    private dialog: MatDialog,
    private productsService: EcommerceProductsService
  ) { }

  ngOnInit() {
    this.showView("kit");

    this.onSelectionChangedSubscription =
      this.productsService.onSelectionChanged.subscribe(selection => {
        this.selectedProducts = selection;
      });
  }

  showView(view) {
      this.view = view;
  }

  addToKit() {
    if (this.selectedProducts && this.selectedProducts.length == 0) {
      this.msg.show('Please select products to add.', 'error');
      return;
    }
    this.showView('kit');
    this.selectedProducts.forEach(id => {
        if(id == this.product.id) {
          this.msg.show('Selected product -' + this.product.productId + ' is same as the Kit.', 'error');
        } else {
            this.product.KitArray.Kit.push({
                pId:id,
                hide:"0",
                KitPartArray:{
                    KitPart:[]
                }
            });
        }
    });
    this.save.emit();
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
          this.view = 'kit';
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

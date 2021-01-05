import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EcommerceOrderService } from '../../order.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { OrderCreateProductDialogComponent } from './order-create-product-dialog/order-create-product-dialog.component';
import { ProductDetails } from 'app/models';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';

@Component({
  selector: 'app-order-add-item',
  templateUrl: './order-add-item.component.html',
  styleUrls: ['./order-add-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderAddItemComponent implements OnInit {
  form: FormGroup;
  products: any[];
  @Output() productSelected: EventEmitter<any> = new EventEmitter();
  @Output() createNewSelected: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    private api: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit() {

    this.form = this.fb.group({
      productName: [''],
    });

    this.form.get('productName').valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
    ).subscribe((term: any) => {
      this.search(term);
    });
  }

  displayFn(item?: any): string | undefined {
    return item ? item.productName : undefined;
  }

  selectProduct(event) {
    const product = event.option.value;

    if (product && product.productName) {
      this.products = [];
      this.productSelected.emit(product);

      // Clear input
      this.form.patchValue({
        productName: null,
      }, { onlySelf: true, emitEvent: false });

    } else {
      // Add new product selected
      this.addNewProduct(product);
    }
    this.cd.markForCheck();
  }

  addNewProduct(productName?: string) {
    // Clear input
    const productDetails = new ProductDetails({
      productName: productName,
      poType: 'DropShip'
    });

    this.form.patchValue({
      productName: null,
    }, { onlySelf: true, emitEvent: false });

    const dialogRef = this.dialog.open(OrderCreateProductDialogComponent, {
      width: '90vw',
      height: '90vh',
    });

    dialogRef.componentInstance.product = productDetails;

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.productSelected.emit(res);
      }
    });
  }

  search(term: string) {
    if (typeof term === 'string') {
      this.api.productSearch(term).subscribe((products: Partial<ProductDetails>[]) => {
        this.products = products;
        this.cd.markForCheck();
      });
    }
  }

}

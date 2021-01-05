import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toLower } from 'lodash';
import { fuseAnimations } from '@fuse/animations';

import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { IntegrationService } from 'app/core/services/integration.service';
import { EcommerceOrderService } from '../../order.service';
import { OrderDetails } from 'app/models';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'product-add-widget',
  templateUrl: './product-add-widget.component.html',
  styleUrls: ['./product-add-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProductAddWidgetComponent implements OnInit {
  @Output() onDelete = new EventEmitter();
  @Output() onAdd = new EventEmitter();
  @Output() onShowProductsView = new EventEmitter();
  @Output() onDecorationChange = new EventEmitter();

  searchInput: FormControl;
  products: any[] = [];
  selectedProduct = null;
  showDecoration = false;
  taxJar = false;
  shipStation = false;
  loading = false;
  context: any;

  constructor(
    private api: ApiService,
    public orderService: EcommerceOrderService,
    private integration: IntegrationService,
    private msg: MessageService,
    private route: ActivatedRoute,
  ) {
    this.searchInput = new FormControl();
  }

  ngOnInit() {

    this.context = this.orderService.context;

    this.searchInput.valueChanges.pipe(
      distinctUntilChanged(),
    ).subscribe((val: string) => {
        if (val.length < 3) {
          this.products = [];
        } else {
          this.products = this.orderService.productsList
            .filter((p: any) => {
              const pid = toLower(p.productId);
              const v = toLower(val);
              return pid.indexOf(v) >= 0;
            })
            .slice(0, 5);
        }
      });
        this.integration.connectorGetConfig("TAXJAR", {0:"enabled"})
            .subscribe((response:any) => {
                this.taxJar = response.enabled == "1"?true:false;
            });
        this.integration.connectorGetConfig("SHIPSTATION", {0:"enabled"})
            .subscribe((response:any) => {
                this.shipStation = response.enabled == "1"?true:false;
            });

  }

  getProductLists(val) {
    const terms = { productId: val };

    return this.api.getProductList(terms, 0, 5);
  }

  selectProduct(ev) {
    this.selectedProduct = ev.option.value;
    this.searchInput.setValue(this.selectedProduct.productId);
  }

  addProduct() {
    if (!this.selectedProduct) {
      this.msg.show('Please select a product', 'error');
      return;
    }

    this.onAdd.emit(this.selectedProduct.id);
    this.searchInput.setValue('');
  }

  clear() {
    this.searchInput.setValue('');
  }

  showProductsView() {
    this.onShowProductsView.emit();
  }

  delete() {
    this.onDelete.emit();
  }

  toggleDecoration(ev) {
    this.onDecorationChange.next(ev.checked);
  }

  calculateTax() {
      this.loading = true;
      if(this.orderService.order.id) {
        this.orderService.calculateTax()
            .subscribe((response:any) => {
                if(response.error) {
                  this.msg.show(response.msg, 'error');
                } else {
                  let order = new OrderDetails(response.extra);
                  this.orderService.onOrderChanged.next(order);
                  if(response.msg) {
                      this.msg.show(response.msg, 'error');
                  } else {
                      this.msg.show('Tax updated', 'error');
                  }
                }
                this.loading = false;
            });
      }
  }


  createOrderToShipStation() {
        if(this.orderService.order.id) {
            this.orderService.createOrderToShipStation()
                .subscribe((response:any) => { });
        }
    }


  getOrderToShipStation() {
      this.loading = true;
      if(this.orderService.order.id) {
        this.orderService.getOrderShipStation()
            .subscribe((response:any) => {
                if(response.error) {
                  this.msg.show(response.msg, 'error');
                } else {
                  let order = new OrderDetails(response.extra);
                  this.orderService.onOrderChanged.next(order);
                  if(response.msg) {
                      this.msg.show(response.msg, 'error');
                  } else {
                     console.log(response);
                      this.msg.show('Ship Station Updated', 'error');
                  }
               }
                this.loading = false;
            });
      }
  }

}

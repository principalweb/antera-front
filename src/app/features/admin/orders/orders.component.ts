import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { ProductConfig } from 'app/models';
import { find, findIndex, isEmpty, groupBy, sum, filter, each, keys } from 'lodash';
@Component({
  selector: 'app-order-settings',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  ordersConfigForm: FormGroup;
  loading = true;
  orderTypes = [];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  poDocs = [
    {label: '---', value: '0'},
    {label: 'PO', value: '1'},
    {label: 'Vouching', value: '2'},
  ];
  defaultDecorationPriceLogicList = [{name:'Do not calculate margin use deco price',value:'PRICE'}, {name:'Override deco price and calculate margin',value:'MARGIN'}]
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private msg: MessageService
  ) {

    this.api.getStatuses('Order').subscribe((res: any[]) => {
	    if (!res) return;
	    this.orderTypes = res;
	});
  }

  ngOnInit() {
    this.getConfig();
  }

  getConfig() {
    this.loading = true;
    this.api.getAdvanceSystemConfigAll({module: 'Orders'})
      .subscribe((res :any) => {
        this.loading = false;
        const config = new ProductConfig(res.settings);
        this.ordersConfigForm = this.fb.group(config);
      }, () => {
        this.loading = false;
        this.msg.show('Server Connection Error', 'error');
      });
  }

  save() {
    const config = new ProductConfig(this.ordersConfigForm.value);
    const postData = {
      module: 'Orders',
      settings: {
        ...config.toObject()
      }
    };
    this.loading = true;
    this.api.updateAdvanceSystemConfigAll(postData)
        .subscribe((res: any) => {
          this.loading = false;
          this.msg.show('Order Settings updated', 'success');
        },(err) => {
          this.loading = false;
          this.msg.show(err, 'success');
        });
  }
}

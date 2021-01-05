import { Component, OnInit, Input } from '@angular/core';
import { IOrder } from '../interfaces';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {

  @Input() order: IOrder;

  constructor() { }

  ngOnInit() {
  }

}

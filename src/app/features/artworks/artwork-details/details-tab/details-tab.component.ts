import { Component, OnInit, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ArtworksService } from 'app/core/services/artworks.service';

import { priorities } from '../../constants';
import { displayName } from '../../utils';

@Component({
  selector: 'app-artwork-details-tab',
  templateUrl: './details-tab.component.html',
  styleUrls: ['./details-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DetailsTabComponent implements OnInit, OnDestroy {
  @Input() embedded = false;

  displayName = displayName;

  filteredAssignees = this.service.onFilteredAssigneesChanged;
  filteredCustomers = this.service.onFilteredCustomersChanged;
  filteredOrders = this.service.onFilteredOrdersChanged;
  filteredDesignTypes = this.service.onFilteredDesignTypesChanged;

  priorities = priorities;
  statusList = this.service.onStatusListChanged;
  onStatusChanged: Subscription;
  form: FormGroup;

  constructor(
    private service: ArtworksService,
    private fb: FormBuilder
  ) {
  }

  createForm() {
    this.form = this.fb.group({
      identity: '',
      designNo: '',
      designTypeId: '',
      designTypeName: '',
      orderId: '',
      orderNum: '',
      assignedId: '',
      assignee: '',
      customerId: '',
      customerName: '',
      priority: '',
      statusId: '',
      statusName: '',
      category: '',
      color: '',
      notes: '',
      dueDate: '',
      createdDate: '',
      estimated: ''
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.onStatusChanged.unsubscribe();
  }

  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.form.patchValue({
      assignedId: assignee.id,
      assignee: assignee.name
    });
  }

  selectCustomer(ev) {
    const customer = ev.option.value;
    this.form.patchValue({
      customerId: customer.id,
      customerName: customer.name
    });
  }

  selectOrder(ev) {
    const order = ev.option.value;
    this.form.patchValue({
      customerId: order.customerId,
      customerName: order.customerName,
      identity: order.identity,
      orderId: order.id,
      orderNum: order.orderNo
    })
  }

  selectDesignType(ev) {
    const dtype = ev.option.value;
    this.form.patchValue({
      designTypeId: dtype.id,
      designTypeName: dtype.name
    });
  }

  selectStatus(ev) {
    const status = ev.option.value;
    this.form.patchValue({
      statusId: status.id,
      statusName: status.name
    });
    this.form.get('statusName').setValue(status.name);
  }

  create() {
    
  }

  cancel() {

  }
}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription ,  Observable, merge } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { InventoryService } from 'app/core/services/inventory.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class InventoryComponent implements OnInit {

  searchInput: FormControl;
  onInventoryValueChangedSubscription: Subscription;
  inventoryValue = {stockValue:0, reservedValue:0};
  loading = false;

  constructor(
    private inventoryService: InventoryService,
    private msg: MessageService
  ) {
        this.searchInput = new FormControl('');
      this.onInventoryValueChangedSubscription = this.inventoryService.onInventoryValueChanged.subscribe((response) => {
        this.inventoryValue = response;
      });
  }

  ngOnInit() {
  }

}

import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FormControl } from '@angular/forms';
import { OpenPOListComponent } from './open-po-list/open-po-list.component';

@Component({
  selector: 'app-vouchings',
  templateUrl: './vouchings.component.html',
  styleUrls: ['./vouchings.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class VouchingsComponent implements OnInit {

  @ViewChild(OpenPOListComponent) openPOList: OpenPOListComponent;

  viewMyItems = false;
  searchInput: FormControl;

  constructor(

  )
  {
    this.searchInput = new FormControl('');
  }

  ngOnInit() {

  }

  newInvoice() {

  }

  clearFilters() {
    this.openPOList.clearFilters();
  }

  vouchNow() {
    this.openPOList.editRow({});
  }

  deleteSelectedVouchings() {

  }

  changeShowMyItems(ev) {

  }

  clearSearch() {

  }
}

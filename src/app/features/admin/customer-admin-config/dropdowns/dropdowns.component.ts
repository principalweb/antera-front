import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DropdownListComponent } from './dropdown-list/dropdown-list.component';

@Component({
  selector: 'app-admin-dropdown',
  templateUrl: './dropdowns.component.html',
  styleUrls: ['./dropdowns.component.scss'],
})
export class AdminDropdownComponent implements OnInit {

  @ViewChild(DropdownListComponent) dropdownList: DropdownListComponent;

  constructor( 
  ) { 
  }

  ngOnInit() {

  }

  clearFilters() {
    this.dropdownList.clearFilters();
  }

}

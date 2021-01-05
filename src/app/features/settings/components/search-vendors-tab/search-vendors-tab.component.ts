import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-vendors-tab',
  templateUrl: './search-vendors-tab.component.html',
  styleUrls: ['./search-vendors-tab.component.scss']
})
export class SearchVendorsTabComponent implements OnInit {

  search: any;

  vendorsList = [
    'Alpha Shirt Company',
    'alphaborder',
    'Ann Arbor T-shirt Company',
    'Custom Shirts & Promotions, LLC',
    'International Alliance Traders Inc Canada',
    'SanMar Canada',
    'T-shirt Tycoon Solutions, Inc'
  ];

  constructor() { }

  ngOnInit() {
  }

}

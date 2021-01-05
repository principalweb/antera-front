import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-additional-charges-tab',
  templateUrl: './additional-charges-tab.component.html',
  styleUrls: ['./additional-charges-tab.component.scss']
})
export class AdditionalChargesTabComponent implements OnInit {

  enabled = true;
  constructor() { }

  ngOnInit() {
  }

}

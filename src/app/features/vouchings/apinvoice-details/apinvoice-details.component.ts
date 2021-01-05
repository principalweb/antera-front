import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'apinvoice-details',
  templateUrl: './apinvoice-details.component.html',
  styleUrls: ['./apinvoice-details.component.css']
})
export class ApinvoiceDetailsComponent implements OnInit {
  @Input() apInvoice: any;

  constructor() { }

  ngOnInit() {
  }

}

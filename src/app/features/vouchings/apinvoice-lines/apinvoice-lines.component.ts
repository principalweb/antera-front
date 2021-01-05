import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'apinvoice-lines',
  templateUrl: './apinvoice-lines.component.html',
  styleUrls: ['./apinvoice-lines.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApinvoiceLinesComponent implements OnInit {
  @Input() dataSource: any[];
  displayedColumns: string[] = ['details', 'uom', 'type', 'quantity', 'price', 'totalPrice'];

  constructor() { }

  ngOnInit() {
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
@Component({
  selector: 'executive-dashboard',
  templateUrl: './executive.component.html',
  animations   : fuseAnimations,
  styleUrls: ['./executive.component.css']
})
export class ExecutiveComponent implements OnInit {
  @Input() widgetsExecutiveData:any;
  constructor() { }

  ngOnInit() {
  }

}

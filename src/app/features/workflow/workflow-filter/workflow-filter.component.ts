import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

import { workflowProcess } from '../workflow-stats-template';

import { WorkflowControlService } from '../workflow-control.service';

@Component({
  selector: 'workflow-filter',
  templateUrl: './workflow-filter.component.html',
  styleUrls: ['./workflow-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorkflowFilterComponent implements OnInit {

  @Input()
  value: any;

  constructor(public wcs: WorkflowControlService) { }

  ngOnInit() {
    console.log(this.value);
  }

  performFilter(cate, type){
    console.log(this.wcs.filter);
    setTimeout(() => this.wcs.filterTerm.next([cate, type]), 100);
  }

}

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'paginator-container',
  templateUrl: './paginator-container.component.html',
  styleUrls: ['./paginator-container.component.css']
})
export class PaginatorContainerComponent implements OnInit {
@Input() productId: number;
@ViewChild(MatPaginator) paginator: MatPaginator;
totalCount: number;


  constructor() { }

  ngOnInit() {
  }

  paginate(event) {
    console.log("paginate");
  }

}

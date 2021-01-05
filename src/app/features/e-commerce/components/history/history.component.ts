import { Component, OnChanges, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { HistoryService } from './history.service';
import { ActivatedRoute, Router, Params } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class HistoryComponent implements AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  @ViewChild(MatSort)
  sort: MatSort;

  displayedColumns = ['name', 'description', 'username','tts'];
  dataSource: MatTableDataSource<any>;

  historyChanged: Subscription;
  loading = false;
  interval: any;
  orderId = "";
  
  constructor(public historyService: HistoryService,private route: ActivatedRoute,) {
    this.route.params.subscribe(params => {
      this.orderId = params.id
    })
    this.dataSource = new MatTableDataSource<any>([]);

    this.historyChanged = this.historyService.trackActivities.subscribe( activities => {
      //console.log()
      this.dataSource.data = activities;
    });

    // this.interval = setInterval(() => {
    //   this.history.recordActivity(this.orderId).then(data => {
    //     this.loading = false;
    //   });
    // }, 10);

    setTimeout(() => clearInterval(this.interval), 30);
  }

  ngOnInit() {
    
    this.fetchList();
  }

  fetchList() {
    this.loading = true;
    Promise.all([
        //this.historyService.getTotalCount(),
        this.historyService.getOrderHistory(this.orderId)
    ])
    .then(data => {
        this.loading = false;
        //this.paginator.firstPage();
    });
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.historyChanged.unsubscribe();
  }

}

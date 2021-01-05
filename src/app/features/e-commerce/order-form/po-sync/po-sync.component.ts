import { MessageService } from 'app/core/services/message.service';
import { QbService } from 'app/core/services/qb.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { Observable, of, empty, fromEvent, from } from 'rxjs';
import {
  delay,
  switchMapTo,
  concatAll,
  count,
  scan,
  withLatestFrom,
  share
} from 'rxjs/operators';

@Component({
  selector: 'po-sync',
  templateUrl: './po-sync.component.html',
  styleUrls: ['./po-sync.component.scss']
})
export class PoSyncComponent implements OnInit, AfterViewInit {

  vendorStatus = [];
  vendors = [];
  synced = 0;
  buffer = 10;
  order;
  allSynced = false;

  constructor(
    public dialogRef: MatDialogRef<PoSyncComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private qbService: QbService,
    private msg: MessageService,
  ) {
    this.vendorStatus = [];
    this.vendors = [];
    this.order = data.order;
    data.order.lineItems.forEach(l => {
      if (!this.vendorStatus[l.vendorId] && l.vendorId  !== '') {
        this.vendorStatus[l.vendorId] = {status: 'Waiting', class: ''};
        this.vendors.push({id: l.vendorId, name: l.vendorName, status: 'Waiting'});
      }
      l.decoVendors.forEach(d => {
        if (!this.vendorStatus[d.vendorId] && d.vendorId  !== '') {
          this.vendorStatus[d.vendorId] = {status: 'Waiting', class: ''};
          this.vendors.push({id: d.vendorId, name: d.vendorName, status: 'Waiting'});
        }
      });
    });
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.allSynced = true;
    const requests = [];
    this.vendors.forEach(v => {
      requests.push(this.qbService.pushEntityMap('PurchaseOrder', this.order.id, v.id));
    });

    const loadButton = document.getElementById('load');
    const content = document.getElementById('data');

    // update progress bar as requests complete
    const updateProgress = progressRatio => {
      this.synced = 100 * progressRatio;
      this.buffer = 100 * (progressRatio + 0.1);
      if (progressRatio === 1) {
        this.dialogRef.close({allSynced: this.allSynced});
        // finished
      } else {
      }
    };
    // simple helper to log updates
    const updateContent = newContent => {
      content.innerHTML += newContent;
    };

    const displayData = data => {
      if (data.data.relatedId) {
        this.vendorStatus[data.data.relatedId] = {status: data.msg, class: data.code === '200' ? 'green' : 'red'};
        if (data.code !== '200') {
          this.msg.show(data.msg, 'error');
          this.allSynced = false;
        }
      }
    };

    // simulate 5 seperate requests that complete at variable length
    const observables: Array<Observable<string>> = requests;

    const array$ = from(observables);
    const requests$ = array$.pipe(concatAll());
    const clicks$ = fromEvent(loadButton, 'click');

    const progress$ = clicks$.pipe(switchMapTo(requests$), share());

    const count$ = array$.pipe(count());

    const ratio$ = progress$.pipe(
      scan((current: any) => current + 1, 0),
      withLatestFrom(count$, (current, count) => current / count)
    );

    clicks$.pipe(switchMapTo(ratio$)).subscribe(updateProgress, (err) => {
      this.msg.show(err.error, 'error');
    });

    progress$.subscribe(displayData);
    loadButton.click();
  }

  // ngOnInit() {
  //   // const loadButton = document.getElementById('load');
  //   // const requests: Array<Observable<Object>> = [];
  //   // this.vendors.forEach(v => {
  //   //   requests.push(this.qbService.pushEntityMap('PurchaseOrder', this.order.id, v.id));
  //   // });
  //   // const array$ = from(requests);
  //   // const requests$ = array$.pipe(concatAll());
  //   // const count$ = array$.pipe(count());
  //   // const clicks$ = fromEvent(loadButton, 'click');
  //   // const progress$ = clicks$.pipe(switchMapTo(requests$), share());
  //   // const ratio$ = progress$.pipe(
  //   //   scan(current => current + 1, 0),
  //   //   withLatestFrom(count$, (current, count) => current / count)
  //   // );
  //   // clicks$.pipe(switchMapTo(ratio$)).subscribe(updateProgress);

  // }



}

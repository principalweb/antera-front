import { MessageService } from './../../../core/services/message.service';
import { fx2N } from 'app/utils/utils';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ApCreditAllocationLog } from 'app/models';
import { ApCreditService } from 'app/core/services/ap-credit.service';

@Component({
  selector: 'vouching-credits-list',
  templateUrl: './vouching-credits-list.component.html',
  styleUrls: ['./vouching-credits-list.component.css']
})
export class VouchingCreditsListComponent implements OnInit, OnChanges {
  @Input() vouchingForm: FormGroup;
  @Input() allocationLogs = [];
  @Input() orderIds: [];
  @Input() vendorId: string;
  @Output() totalCredit = new EventEmitter<number>();
  lines = [];
  dataSource: MatTableDataSource<ApCreditAllocationLog> | null;

  displayedColumns: string[] = ['notes', 'amount', 'available', 'creditApplied'];

  constructor(
    private apCreditService: ApCreditService,
    private msg: MessageService
  ) {
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource([]);
    this.calculateTotal();
  }

  applyCredits() {
    this.lines.forEach(l => {
      l.creditApplied = 0;
      l.creditAvailable = false;
      this.allocationLogs.forEach(a => {
        if (a.apCreditId === l.id) {
          l.balance = a.amount;
          l.creditApplied = a.amount;
          l.creditAvailable = true;
        }
      });
      if (l.amount === l.balance) {
        l.creditAvailable = true;
      }
    });
    this.dataSource = new MatTableDataSource(this.lines);
  }

  ngOnChanges(changes: SimpleChanges) {
    let vendorId = this.vendorId;
    if (changes.vendorId) {
      vendorId = changes.vendorId.currentValue;
    }
    let orderIds = this.orderIds;
    if (changes.orderIds) {
      orderIds = changes.orderIds.currentValue;
    }
    if (vendorId && orderIds) {
      this.apCreditService.getVendorCreditList({vendorId: vendorId, orderIds: orderIds})
        .subscribe((res: any) => {
          if (res.data && res.data[0]) {
            this.lines = res.data;
            this.applyCredits();
            this.calculateTotal();
          }
        }, (err) => {
      });
    }
    if (changes.allocationLogs) {
      this.applyCredits();
    }
    this.calculateTotal();
  }

  calculateTotal() {
    let total = 0;
    if (this.dataSource && this.dataSource.data) {
      this.dataSource.data.forEach(c => {
        if (Number(c.creditApplied) < 0) {
          this.msg.show('Applied credit should be more zero!', 'error');
        } else if (c.balance - Number(c.creditApplied) < 0) {
          this.msg.show('Applied credit ' + Number(c.creditApplied) + ' is more than available!', 'error');
        }
        total += Number(c.creditApplied);
      });
    }
    this.totalCredit.emit(total);
  }

  public getAppliedCreditLines() {
    const creditLines = [];
    let err = false;
    if (this.dataSource && this.dataSource.data) {
      this.dataSource.data.forEach(c => {
        if (Number(c.creditApplied) < 0) {
          this.msg.show('Applied credit should be more than zero!', 'error');
          err = true;
          return;
        } else if (c.balance - Number(c.creditApplied) < 0) {
          this.msg.show('Applied credit ' + Number(c.creditApplied) + ' is more than available!', 'error');
          err = true;
          return;
        }
        creditLines.push(c);
      });
    }
    if (err) {
      return {error: true};
    }
    return creditLines;
  }

}

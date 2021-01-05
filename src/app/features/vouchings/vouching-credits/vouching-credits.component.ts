import { VouchingCreditsListComponent } from './../vouching-credits-list/vouching-credits-list.component';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'vouching-credits',
  templateUrl: './vouching-credits.component.html',
  styleUrls: ['./vouching-credits.component.scss']
})
export class VouchingCreditsComponent implements OnInit {
  @ViewChild(VouchingCreditsListComponent) creditList: VouchingCreditsListComponent;

  @Input() vendorId = '';
  @Input() orderIds = [];
  @Input() vouchingForm: FormGroup;
  @Input() allocationLogs = [];
  @Output() totalCredit = new EventEmitter<number>();

  creditLines = [];

  action = 'list';

  constructor() { }

  ngOnInit() {
  }

  addCredit() {
    this.action = 'add-credit';
  }

  creditsSelected(credits) {
    if (credits.length > -1) {
      credits.forEach(v => {
        const lineFound = this.creditLines.filter(cl => cl.apCreditId === v.id);
        if (lineFound.length <= 0 && v.balance > 0) {
          this.creditLines.push(
            {
              id: '',
              apCreditId: v.id,
              vouchingId: '',
              typeId: '1',
              type: 'Debit',
              balance: v.balance,
              amount: '',
              notes: v.notes,
              info: ''
            }
          );
        } else if (lineFound.length === 1) {
          lineFound[0].balance = v.balance;
        }
      });
    }
    this.action = 'list';
  }

  updateTotalCredit(totalCredit) {
    this.totalCredit.emit(totalCredit);
  }

  public getAppliedCreditLines() {
    return this.creditList.getAppliedCreditLines();
  }

  resetList() {
    // this.creditList.creditLines = [];
  }

}

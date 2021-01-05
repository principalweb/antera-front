import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-select-payment-dialog',
  templateUrl: './select-payment-dialog.component.html',
  styleUrls: ['./select-payment-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectPaymentDialogComponent implements OnInit {
    creditAmount : any = 0;
    accountId: any;
    boltEnabled = false;
  constructor(
    public dialogRef: MatDialogRef<SelectPaymentDialogComponent>,
    private api: ApiService,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {
        this.accountId = data.accountId;
  }

  ngOnInit() {
      this.getCurrentCreditAmount();
      console.log(this.creditAmount);
      this.isBoltEnabled();
  }

  onCheckCashSelected(){
    this.dialogRef.close({
      type: 'Cash_Check'
    });
  }

  onCreditCardSelected(){
    this.dialogRef.close({
      type: 'Credit_Card'
    });
  }

  onApplyCreditSelected(){
    this.dialogRef.close({
      type: 'Credit_Memo'
    });
  }

  getCurrentCreditAmount() {
    if(this.accountId) {
        this.api.getCurrentCreditAmount({ accountId: this.accountId}).subscribe((credit: number) => {
            this.creditAmount = credit;
        });
    }
  }
  isBoltEnabled() {
    this.api.getBoltCreds()
          .subscribe((bolt:any) => {
            this.boltEnabled = bolt.enabled == 1 ? true : false;
            console.log(this.boltEnabled);
          }, () => {
              this.boltEnabled = false;
            });
    }
}

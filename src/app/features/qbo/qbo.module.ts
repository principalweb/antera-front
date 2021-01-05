import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QboTransactionReportComponent } from './qbo-transaction-report/qbo-transaction-report.component';

@NgModule({
  declarations: [QboTransactionReportComponent],
  imports: [
    CommonModule
  ],
  exports: [
    QboTransactionReportComponent
  ],
})
export class QboModule { }

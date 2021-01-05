import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';


@Component({
  selector: 'app-pricing-methods-qty-breaks-dialog',
  templateUrl: './pricing-methods-qty-breaks-dialog.component.html',
  styleUrls: ['./pricing-methods-qty-breaks-dialog.component.scss']
})
export class PricingMethodsQtyBreaksDialogComponent implements OnInit {

  priceBreaks: string[] = [];

  newPriceBreak: string;

  drop(event: CdkDragDrop<number[]>) {
    moveItemInArray(this.priceBreaks, event.previousIndex, event.currentIndex);
  }

  constructor(
    public dialogRef: MatDialogRef<PricingMethodsQtyBreaksDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private msg: MessageService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    const tableHeadersStrings = ['name', 'type', 'range', 'operator', 'percentage', 'quantityRange', ' '];
    const priceBreakNumbersOnly = this.data.priceBreaks.filter( ( el ) => !tableHeadersStrings.includes( el ) );
    this.priceBreaks = [... priceBreakNumbersOnly];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  pushToList(){
     this.priceBreaks.push( this.newPriceBreak.toString());
     this.newPriceBreak = null;
  }

  remove(priceBreak: string): void {
    const index = this.priceBreaks.indexOf(priceBreak);

    if (index >= 0) {
      this.priceBreaks.splice(index, 1);
    }
  }

}

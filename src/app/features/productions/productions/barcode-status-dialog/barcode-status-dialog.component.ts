import { Component, OnInit, ViewEncapsulation, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductionsService, Status} from 'app/core/services/productions.service';
import JsBarcode from "jsbarcode";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'barcode-status-dialog',
  templateUrl: './barcode-status-dialog.component.html',
  styleUrls: ['./barcode-status-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BarcodeStatusDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  destroyed$ = new Subject<boolean>();

  constructor(public dialogRef: MatDialogRef<BarcodeStatusDialogComponent>,
    public productionService: ProductionsService, ) {
     }

  ngOnInit() {
    
  }

  generateBarcodes(){
    console.log("statuses", this.productionService.onStatusListChanged.value);
    this.productionService.onStatusListChanged.value
    .forEach((status: Status) => JsBarcode(`#st-${status.id}`, `st${status.id}`, {
      width: 2,
      height: 50
    }));
  }

  ngAfterViewInit(){
    this.generateBarcodes();
    setTimeout(() => window.print(), 800);
  }

  printView(id){
    window.open(`${window.location.href}/status-barcodes/${id}`, '_blank');
  }

  ngOnDestroy(){
    this.destroyed$.next(true);
  }

}

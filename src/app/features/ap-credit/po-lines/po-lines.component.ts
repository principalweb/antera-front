import { fuseAnimations } from './../../../../@fuse/animations/index';
import { MessageService } from './../../../core/services/message.service';
import { Component, OnInit, Inject } from '@angular/core';
import { ApCreditService } from 'app/core/services/ap-credit.service';
import { FormControl, AbstractControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PoLines } from 'app/models/ap-credit'
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'po-lines',
  templateUrl: './po-lines.component.html',
  styleUrls: ['./po-lines.component.scss'],
  animations   : fuseAnimations,
})
export class PoLinesComponent implements OnInit {

  searchPo: FormControl;
  poLoading = false;
  filteredPos = [];

  order: {
    id: '',
    orderNumber: '',
  };

  dataSource: MatTableDataSource<PoLines> | null;
  selection = new SelectionModel<PoLines>(true, []);

  data: any;

  displayedColumns: string[] = ['select', 'image', 'details', 'quantity', 'price', 'total'];

  loadLines = false;

  constructor(
    public dialogRef: MatDialogRef<PoLinesComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private msg: MessageService,
    private apCreditService: ApCreditService
  ) {
    this.data = data;
    this.searchPo = new FormControl('', [RequireMatch]);
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource([]);
    this.searchPo.valueChanges
    .pipe(
      debounceTime(300),
      tap(() => {
        this.poLoading = true;
      }),
      switchMap(search => this.apCreditService.getVendorPoAutoComplete(this.data.vendorId, search)
      .pipe(
        finalize(() => {
          this.poLoading = false;
        }),
        )
      )
    )
    .subscribe((pos: any) => this.filteredPos = pos.data);
  }

  fetchLines() {
    this.loadLines = true;
    this.apCreditService.getPo(this.data.vendorId, this.order.id)
      .subscribe((response: any) => {
        this.selection.clear();
        if (response && response.msg) {
          this.msg.show(response.msg, 'error');
          this.dataSource = new MatTableDataSource([]);
        } else if (response) {
          if (response.length === 0) {
            this.msg.show('No valid lines found for the vendor and order number specified!', 'error');
          }
          this.dataSource = new MatTableDataSource(response);
          this.masterToggle();
        }
        this.loadLines = false;
      }, err => {
        this.selection.clear();
        this.loadLines = false;
        this.msg.show(err.message, 'error');
      });
  }

  addToCredit() {
    if (this.selection.selected.length <= 0) {
      this.msg.show('Please select lines', 'error');
      return;
    }
    this.dialogRef.close(this.selection.selected);
  }

  poDisplay(data) {
    if (data) {
      this.order = data;
      this.fetchLines();
      return data.orderNumber;
    }
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

}

export function RequireMatch(control: AbstractControl) {
  const selection: any = control.value;
  if (typeof selection === 'string') {
      return { incorrect: true };
  }
  return null;
}

import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ApiService } from 'app/core/services/api.service';


@Component({
  selector: 'app-item-type-dialog',
  templateUrl: './item-type-dialog.component.html',
  styleUrls: ['./item-type-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ItemTypeDialogComponent implements OnInit {
  list = [];
  displayedColumns = ['size', 'quantity', 'inventory', 'warehouse', 'type'];
  warehouses = [];
  loading = false;

  form: FormGroup;
  imageUrl = '';
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ItemTypeDialogComponent>,
    private fb: FormBuilder,
    private api: ApiService
  ) {
    this.list = data.rows;
    const obj = {};
    this.list.forEach((row, i) => {
      obj['type'+i] = row.poType || 'DropShip';
      obj['warehouse'+i] = row.warehouse;
    });
    this.form = this.fb.group(obj);

    this.api.getAnteraFob()
      .subscribe((list: any) => {
        this.warehouses = list;
      });
  
    if (data.rows[0]) {
      this.imageUrl = data.rows[0].imageUrl;
    }
  }

  ngOnInit() {
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

}

import { Component, OnInit, Input, SimpleChanges, ViewEncapsulation, OnChanges } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { MessageService } from 'app/core/services/message.service';
import { StoreDataSource } from 'app/models';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { StoresFormComponent } from '../stores-form/stores-form.component';

@Component({
  selector: 'app-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class StoresListComponent implements OnInit {
  @Input() product:any;
  
  displayedColumns: string[] = ['select', 'store', 'margin'];
  dataSource = new MatTableDataSource<StoreDataSource>();
  selection = new SelectionModel<StoreDataSource>(true, []);
    
  dialogRef: MatDialogRef<StoresFormComponent>;

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private msg: MessageService
  ) { }

  ngOnInit() {
      this.buildData();
  }

  buildData() {
      this.dataSource.data = this.product.StoreArray;
        this.selection.clear();
  }

  ngOnChanges(changes: SimpleChanges) {
      if(changes.product.currentValue) {
          this.buildData();
      }
  }

  deleteSelected() {
      const selectedId = this.selection.selected.map(obj => { return obj.storeId;});
      if(selectedId.length > 0) {
          let putBack = this.product.StoreArray.filter((item, index) => {
              return !selectedId.includes(item.storeId);
          });
          this.product.StoreArray = putBack;
          this.buildData();
      } else {
          this.msg.show('Please select items to remove!', 'error');
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

  showDetail(data, index) {
        this.dialogRef = this.dialog.open(StoresFormComponent, {
            panelClass: 'app-stores-form',
            data: {...data, dataId:index} 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.updateData(response);
            });
  }

  updateData(data) {
      if(data) {
          let store = this.product.StoreArray.filter((item, index) => {
              return item.storeId == data.storeId;
          });
          if(store && ((data.id === "" && store.length >1) ||(data.id === "" && store.length ==1 && store[0].id != "") || (data.id !== "" && store.length>1))) {
              this.msg.show('Store is already tagged to product!', 'error');
              this.showDetail(data, data.dataId);
              return ;
          }
          if(data.dataId === "") {
              this.product.StoreArray.push(data);
          } else {
              this.product.StoreArray[data.dataId] = data;
          }
          this.buildData();
      }
  }

}

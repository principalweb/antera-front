import { Component, OnInit, Input, ViewChild, SimpleChanges, ViewEncapsulation, OnChanges } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/collections';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { MessageService } from 'app/core/services/message.service';
import { ProductDetails, RelatedProductDataSource } from '../../../../models';


@Component({
  selector: 'related-product-list',
  templateUrl: './related-product-list.component.html',
  styleUrls: ['./related-product-list.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class RelatedProductListComponent implements OnInit, OnChanges {
  @Input() product: ProductDetails;
  @ViewChild('table') table: MatTable<RelatedProductDataSource>;

  displayedColumns: string[] = ['select', 'vendorName', 'productId', 'productName', 'type', 'action'];
  dataSource: MatTableDataSource<RelatedProductDataSource>;
  dataForm: FormGroup;
  selection = new SelectionModel<RelatedProductDataSource>(true, []);

  productTypes = [{id: '1', name: 'Alternate Vendor'},
                  {id: '2', name: 'Related Product'}
                ];

  constructor(
    private formBuilder: FormBuilder,
    private msg: MessageService
  ) {
    this.dataSource = new MatTableDataSource<RelatedProductDataSource>();
  }

  ngOnInit() {
      this.buildData();
  }

  buildData() {
    this.dataSource = new MatTableDataSource<RelatedProductDataSource>(this.product.RelatedProductArray.RelatedProduct);
  }

  ngOnChanges(changes: SimpleChanges) {
      if (changes.product.currentValue) {
          this.buildData();
      }
  }

  removeRow(key) {
    this.product.RelatedProductArray.RelatedProduct.splice(key, 1);
    this.buildData();
  }

  deleteSelected() {
      if (this.selection.selected.length > 0) {
        this.selection.selected.forEach(item => {
          const i: number = this.product.RelatedProductArray.RelatedProduct.findIndex(d => d === item);
          this.product.RelatedProductArray.RelatedProduct.splice(i, 1);
        });
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

}

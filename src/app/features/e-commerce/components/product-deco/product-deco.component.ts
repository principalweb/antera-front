import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { fuseAnimations } from '@fuse/animations';

import { ArtworksService } from 'app/core/services/artworks.service';
import { ProductDecoListComponent } from './product-deco-list/product-deco-list.component';
import { ProductDecoFormComponent } from './product-deco-form/product-deco-form.component';

@Component({
  selector: 'app-product-deco',
  templateUrl: './product-deco.component.html',
  styleUrls: ['./product-deco.component.scss']
})
export class ProductDecoComponent implements OnInit {

  @ViewChild(ProductDecoListComponent) dataList: ProductDecoListComponent;
  dialogRef: MatDialogRef<ProductDecoFormComponent>;

  constructor(
              private dataService: ArtworksService,
              public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  createData() {
        this.dialogRef = this.dialog.open(ProductDecoFormComponent, {
            panelClass: 'app-product-deco-form',
            data: "" 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.dataList.loadData();
            });
  }

  deleteSelectedData() {
    this.dataList.deleteSelected();
  }

  clearFilters() {
    this.dataList.clearFilters();
  }

}

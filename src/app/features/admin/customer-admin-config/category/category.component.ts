import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { fuseAnimations } from '@fuse/animations';

import { CategoryService } from 'app/core/services/category.service';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryFormComponent } from './category-form/category-form.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
  @ViewChild(CategoryListComponent) dataList: CategoryListComponent;
  dialogRef: MatDialogRef<CategoryFormComponent>;

  constructor(
              private dataService: CategoryService,
              public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  createData() {
        this.dialogRef = this.dialog.open(CategoryFormComponent, {
            panelClass: 'app-category-form',
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

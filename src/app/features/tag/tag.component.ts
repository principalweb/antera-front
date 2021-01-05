import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { TagTypeFormComponent } from './tag-type-form/tag-type-form.component';
import { TagListComponent } from './tag-list/tag-list.component';
import { ApiService } from 'app/core/services/api.service';
import { TagService } from 'app/core/services/tag.service';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  animations   : fuseAnimations
})
export class TagComponent implements OnInit {
  @ViewChild(TagListComponent) tagList: TagListComponent;
  dialogRef: MatDialogRef<TagTypeFormComponent>;
  tagTypeList: [];
  tagType: "Module Tag";

  constructor(
    public dialog: MatDialog,
    private apiService: ApiService,
    private tagService: TagService
  ) {

  }

  ngOnInit() {
   
  }

  addTag() {
    this.dialogRef = this.dialog.open(TagTypeFormComponent, {
      panelClass: 'app-tag-type-form',
      data: { tagTypeList : this.tagTypeList }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    });                           
    this.dialogRef.afterClosed()
      .subscribe((response) => {
          this.tagList.loadData();
      });                                                                            
  }

  changeTagType(ev) {
    this.tagService.tagType = ev.value;
    this.tagList.loadData();
  }

  deleteSelectedTags() {
    this.tagList.deleteSelected();
  }
}

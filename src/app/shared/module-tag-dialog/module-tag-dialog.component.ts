import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from "app/core/services/api.service";
import { find } from 'lodash';

@Component({
  selector: 'app-module-tag-dialog',
  templateUrl: './module-tag-dialog.component.html',
  styleUrls: ['./module-tag-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ModuleTagDialogComponent implements OnInit {

  tagList = [];
  _selection: string[] =[];
  checkboxes: {};
  constructor(
    public dialogRef: MatDialogRef<ModuleTagDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private api: ApiService,
  ) {
    this.tagList = data;
    this.checkboxes = {};
    this.tagList.map(tag => {
      this.checkboxes[tag.id] = false;
    });
    // let payload = {
    //   "term": {
    //       "tagType": "Module Tag",
    //       "moduleType": "Accounts"
    //     }
    // };
    // this.api.getTagList(payload).subscribe((results: any) => {
    //     this.tagList = results;
    //     console.log("this.tagList",this.tagList);
    //      this.tagList.map(tag => {
    //        console.log("tag",tag)
    //       this.checkboxes[tag.id] = false;
    //     });
    // });
  }

  ngOnInit(): void {
  }

  onSelectedChange(tagId)
  {
    if ( this._selection.length > 0 )
    {
        const index = this._selection.indexOf(tagId);

        if ( index !== -1 )
        {
            this._selection.splice(index, 1);
            return;
        }
    }

    this._selection.push(tagId);
    for ( const id in this.checkboxes )
    {
        if (!this.checkboxes.hasOwnProperty(id)) {
            continue;
        }
        this.checkboxes[id] = this._selection.includes(id);
    } 
    console.log("this.checkboxes",this.checkboxes);
  }

  onTagsSelected() {

    let selectedTagList = [];
    this._selection.forEach((tId) => {
      // const tag = find(this.tagList, {
      //   id: tId
      // });
      selectedTagList.push(tId);
    });

   /*  selectedTagList = selectedTagList.map(tag => {
      return {tag: tag.id};
    })
     */
    this.dialogRef.close({
      selectedTagList: selectedTagList
    });
  }

}

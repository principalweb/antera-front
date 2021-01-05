import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TagStoreFormComponent } from '../tag-store-form/tag-store-form.component';
import { TagModuleFormComponent } from '../tag-module-form/tag-module-form.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { TagListComponent } from '../tag-list/tag-list.component';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-tag-type-form',
  templateUrl: './tag-type-form.component.html',
  styleUrls: ['./tag-type-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class TagTypeFormComponent implements OnInit {
  dataForm: FormGroup;
  moduleTagFormDialogRef: MatDialogRef<TagModuleFormComponent>;
  storeTagFormDialogRef: MatDialogRef<TagStoreFormComponent>;
  tagTypeList: [];
  @ViewChild(TagListComponent) tagList: TagListComponent;
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<TagTypeFormComponent>,
    private msg: MessageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.dataForm = this.fb.group({tagType:"Select Tag Type"});
    console.log(this.data)
    this.tagTypeList = data.tagTypeList;                                                                                                                                                                                                                                                                                              
  }

  ngOnInit(): void {
  }

  selectType(ev) {
    if(ev.value === "") {
      this.msg.show("Please select tag type", 'error');
      return false;
    }
    if(ev.value === 'Module Tag' || ev.value === 'Third-Party integration') {
      this.moduleTagFormDialogRef = this.dialog.open(TagModuleFormComponent, {
        panelClass: 'app-tag-module-form',
        data: {tagType:this.dataForm.value.tagType}
      });
      this.moduleTagFormDialogRef.afterClosed()
      .subscribe((response) => {
          this.dialogRef.close();
      });
    } else {
      this.storeTagFormDialogRef = this.dialog.open(TagStoreFormComponent, {
        panelClass: 'app-tag-store-form',
        data: {tagType:this.dataForm.value.tagType} 
      });
      this.storeTagFormDialogRef.afterClosed()
      .subscribe((response) => {
          this.dialogRef.close();
      });
    }
  }
}

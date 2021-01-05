import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TagService } from 'app/core/services/tag.service';
import { MatDialogRef, MAT_DIALOG_DATA  } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-tag-store-form',
  templateUrl: './tag-store-form.component.html',
  styleUrls: ['./tag-store-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class TagStoreFormComponent implements OnInit {
  dataForm: FormGroup;
  dialogTitle: string;
  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    public dialogRef: MatDialogRef<TagStoreFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    let formData = {name:"",url:"",enabled:false};;
    if(this.data.id) {
      formData = {name:this.data.name,url:this.data.storeUrl,enabled: false};
      this.dialogTitle = `Edit ${this.data.tagType} - ${this.data.name}`;
      if(this.data.enabled == "1") {
        formData.enabled = true;
      } else {
        formData.enabled = false;
      }
    }else{
      this.dialogTitle = `Create ${this.data.tagType}`;
    }
    this.dataForm = this.fb.group(formData);
    
  }

  ngOnInit(): void {
  }

  save() {
    if(this.data.id && this.data.id !== "") {
      let data = this.dataForm.value;
      Object.assign(data,{tagType: this.data.tagType},{id: this.data.id})
      this.tagService.updateTag(this.dataForm.value,this.dialogRef);
    } else {
      let data = this.dataForm.value;
      Object.assign(data,{tagType: this.data.tagType})
      this.tagService.createTag(this.dataForm.value,this.dialogRef);
    }   
  }
}

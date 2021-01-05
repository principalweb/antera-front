import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TagService } from 'app/core/services/tag.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';

@Component({
  selector: 'app-tag-module-form',
  templateUrl: './tag-module-form.component.html',
  styleUrls: ['./tag-module-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class TagModuleFormComponent implements OnInit {
  dataForm: FormGroup;
  dialogTitle: string;
  moduleTypeList: [];
  constructor(
    private fb: FormBuilder,
    private tagService: TagService,
    public dialogRef: MatDialogRef<TagModuleFormComponent>,
    private apiService: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    let formData = {name:"",module:"",url:"",enabled:false};;
    if(this.data.id) {
      formData = {name:this.data.name,url:this.data.storeUrl,module:this.data.moduleType,enabled: false};
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
    this.apiService.getDropdownOptions({dropdown: [
      'tag_module_list' 
      ]}).subscribe((res: any[])=>{
        console.log("res",res);
        this.moduleTypeList = res[0].options;
        console.log("this.tagTypeList",this.moduleTypeList)
    })
  }

  ngOnInit(): void {
  }

  save() {
    // let data = this.dataForm.value;
    // Object.assign(data,{tagType: this.data.tagType})
    // this.tagService.createTag(this.dataForm.value);
    let data = this.dataForm.value;
    if(this.data.id && this.data.id !== "") {
      Object.assign(data,{tagType: this.data.tagType},{id: this.data.id})
      this.tagService.updateTag(this.dataForm.value,this.dialogRef);
    } else {
      Object.assign(data,{tagType: this.data.tagType})
      this.tagService.createTag(this.dataForm.value,this.dialogRef);
    }
  }
}

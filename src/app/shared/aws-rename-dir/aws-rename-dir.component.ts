import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { Router} from '@angular/router';

@Component({
  selector: 'app-aws-rename-dir',
  templateUrl: './aws-rename-dir.component.html',
  styleUrls: ['./aws-rename-dir.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AwsRenameDirComponent implements OnInit {

  loading = false;
  folderName : string;
  dirType : string;
  folderRenameForm: FormGroup;

  constructor(
        public dialogRefRenameDir: MatDialogRef<AwsRenameDirComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private router: Router,
        private msg: MessageService      
  ) { 

        this.folderName = data.mydir
        this.dirType = data.dirType
        this.folderRenameForm = this.createFolderRenameForm();        
  }

  ngOnInit() {
  }

  createFolderRenameForm()
  {
    return this.formBuilder.group({
        folderName: [this.folderName, Validators.pattern(/^[a-zA-Z0-9_-]*$/)]
    });
  }  

  rename() {
    if(this.folderRenameForm.value.folderName !== null){
        this.dialogRefRenameDir.close(this.folderRenameForm.value);
    }  
  }

}

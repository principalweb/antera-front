import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { Router} from '@angular/router';


@Component({
  selector: 'app-aws-create-dir',
  templateUrl: './aws-create-dir.component.html',
  styleUrls: ['./aws-create-dir.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
  
})
export class AwsCreateDirComponent implements OnInit {

  loading = false;
  folderName : string;
  folderPath : string;
  folderCreateForm: FormGroup;

  constructor(
        public dialogRef: MatDialogRef<AwsCreateDirComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private router: Router,
        private msg: MessageService    
  ) { 
        this.folderPath = data.folderPath;
        this.folderCreateForm = this.createFolderCreateForm();      
  }

  ngOnInit() {
  }

  createFolderCreateForm()
  {
    return this.formBuilder.group({
        folderName: [this.folderName, Validators.pattern(/^[a-zA-Z0-9_-]*$/)]
    });
  }  

  create() {
    if(this.folderCreateForm.value.folderName !== null){
        this.dialogRef.close(this.folderCreateForm.value);
    }  
  }

}

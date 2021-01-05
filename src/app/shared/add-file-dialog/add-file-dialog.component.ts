import { Component, OnInit, OnDestroy, ViewEncapsulation, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DocumentsService } from 'app/core/services/documents.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'add-file-dialog',
  templateUrl: './add-file-dialog.component.html',
  styleUrls: ['./add-file-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddFileDialogComponent implements OnInit, OnDestroy {

  loading : boolean = false;
  addonLogo : boolean = false;
  uploadForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private documentsService: DocumentsService,
    private fb: FormBuilder,
    private msg: MessageService
  ) 
  { 
    this.createForm();
    if(data.addonLogo !== undefined){
        this.addonLogo = data.addonLogo;
    }
  }

  ngOnInit() {
  
  }

  createForm(){
    this.uploadForm = this.fb.group({
      logo: null
    });
  }

  ngOnDestroy() {

  }

  onFileChange(event) {
    if(event.target.files.length > 0) {
      let file = event.target.files[0];
      this.uploadForm.get('logo').setValue(file);
      console.log("File ->", file);
    }
  }
  
  uploadFile() {
    if (this.uploadForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    if (!this.uploadForm.get('logo').value)
      return;

    const data = new FormData();
    data.append('File', this.uploadForm.get('logo').value);

    this.loading = true;
    if(this.addonLogo){
            this.documentsService.setAddonLogoFile(data).then((res) => {
              this.loading = false;
              this.dialogRef.close(res);
            }).catch((err) => {
              this.loading = false;
            })

    }else{
            this.documentsService.setLogoFile(data).then((res) => {
              this.loading = false;
              this.dialogRef.close(res);
            }).catch((err) => {
              this.loading = false;
            })

    }

  }
}

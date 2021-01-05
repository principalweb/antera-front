import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { DecorationLocationDetails } from 'app/models/decoration-location';
import { ApiService } from 'app/core/services/api.service';


import { fuseAnimations } from '@fuse/animations';
import { MatColors } from '@fuse/mat-colors';

@Component({
  selector: 'app-decoration-location-form',
  templateUrl: './decoration-location-form.component.html',
  styleUrls: ['./decoration-location-form.component.scss'],
})
export class DecorationLocationFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  decoLocationForm: FormGroup;
  
  decoLocationDetails: DecorationLocationDetails;
  loading: false;

  constructor(
    public dialogRef: MatDialogRef<DecorationLocationFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private api: ApiService,
  )
  { 
    this.action = data.action;
    if ( this.action === 'edit' )
    {
      this.dialogTitle = 'Edit Decoration Location';
      this.decoLocationDetails = data.decoLocationDetails;
      this.decoLocationDetails.modifiedById = this.auth.getCurrentUser().userId;
      this.decoLocationDetails.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.decoLocationDetails.dateModified = new Date();
    }
    else
    {
      this.dialogTitle = 'Create Decoration Location';
      this.decoLocationDetails = new DecorationLocationDetails();
      this.decoLocationDetails.createdById = this.auth.getCurrentUser().userId;
      this.decoLocationDetails.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.decoLocationDetails.dateEntered = new Date();
    }

    this.decoLocationForm = this.createDecorationLocationForm();
  }

  createDecorationLocationForm()
  {
    return this.formBuilder.group({
      locationName       : [this.decoLocationDetails.locationName, Validators.required],
      description        : [this.decoLocationDetails.description],
      displayOrder       : [this.decoLocationDetails.displayOrder],
      dateEntered        : [this.decoLocationDetails.dateEntered],
      dateModified       : [this.decoLocationDetails.dateModified],
      createdById        : [this.decoLocationDetails.createdById],
      createdByName      : [this.decoLocationDetails.createdByName],
      modifiedById       : [this.decoLocationDetails.modifiedById],
      modifiedByName     : [this.decoLocationDetails.modifiedByName],
      locationImage      : [this.decoLocationDetails.locationImage],
      locationHexColor   : [this.decoLocationDetails.locationHexColor],
      uploadAwsFile      : ['']
    });
  }

  ngOnInit() 
  {

  }

  create() {
    if (this.decoLocationForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const data = {
      ...this.decoLocationForm.value,
    }
    this.decoLocationDetails.setData(data);
    this.dialogRef.close(this.decoLocationDetails);
  }

  update() {
    if (this.decoLocationForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const data = {
      ...this.decoLocationForm.value,
      id: this.decoLocationDetails.id
    }
    this.decoLocationDetails.setData(data);
    this.dialogRef.close(this.decoLocationDetails);
  }

  onFileUploadEventForAws(event) {
        if(event.target.files.length > 0) {
            const data = new FormData();
            data.append('File', event.target.files[0]);
            this.api.uploadAnyFile(data)
                .subscribe((res: any) => {
                    this.decoLocationDetails.locationImage = res.url;
		    this.decoLocationForm.patchValue({
		      locationImage: this.decoLocationDetails.locationImage,
		      uploadAwsFile: '',
		    });

                }, (err => {
                    this.loading = false;
                }));                
        }
  }

  removeLocationImage() {
    this.decoLocationForm.patchValue({
      locationImage: ''
    });
    this.decoLocationDetails.locationImage = '';
    //this.update();
  }

}

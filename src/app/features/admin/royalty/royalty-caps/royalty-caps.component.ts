import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CapDetails } from 'app/models';
import { displayName } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { find } from 'lodash';

export interface CapCycle{
      id: string;
      value: string;
}



@Component({
  selector: 'app-royalty-caps',
  templateUrl: './royalty-caps.component.html',
  styleUrls: ['./royalty-caps.component.scss']
})
export class RoyaltyCapsComponent {

    dialogTitle: string;
    capForm: FormGroup;
    action: string;
    cap: CapDetails;
    displayName = displayName;

    filteredCaps: any;

    loading = false;
    capCycle: CapCycle[] = [
      {id: 'monthly', value: 'Monthly'},
      {id: 'yearly', value: 'Yearly'}
    ];



  constructor
  (
        public dialogRef: MatDialogRef<RoyaltyCapsComponent>,
        @Inject(MAT_DIALOG_DATA) data: any,
        private auth: AuthService,
        private api: ApiService,
        private formBuilder: FormBuilder,
        private msg: MessageService
  )
  {
        this.action = data.action;

        if ( this.action === 'edit' )
        {
            this.dialogTitle = 'Royalty Program';
            this.cap = data.cap;
        }
        else
        {
            this.dialogTitle = 'Royalty Program';
            this.cap = new CapDetails();
        }

        this.capForm = this.createCapForm();

        this.loading = false;
  }

  createCapForm()
  {
        return this.formBuilder.group({
            id               : this.cap.id,
            capCode          : [this.cap.capCode, Validators.required],
            capCycle         : [this.cap.capCycle, Validators.required],
            capPercent       : [this.cap.capPercent, Validators.required],
            capMin           : [this.cap.capMin, Validators.required],
            capMax           : [this.cap.capMax, Validators.required],
            adPercent        : this.cap.adPercent,
            adMin            : this.cap.adMin
        });
    }

    create() {
        if (this.capForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        this.cap.setData(this.capForm.value);
        this.dialogRef.close(this.cap);
    }

    update() {
        if (this.capForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        this.cap.setData(this.capForm.value);
        this.dialogRef.close(['save', this.cap]);
    }

}

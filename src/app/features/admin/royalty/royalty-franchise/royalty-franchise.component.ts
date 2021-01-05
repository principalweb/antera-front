import { Component, Inject, ViewEncapsulation,OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FranchiseDetails } from 'app/models';
import { displayName } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { find } from 'lodash';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-royalty-franchise',
  templateUrl: './royalty-franchise.component.html',
  styleUrls: ['./royalty-franchise.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class RoyaltyFranchiseComponent implements OnInit, OnDestroy{

    dialogTitle: string;
    franchiseForm: FormGroup;
    action: string;
    franchise: FranchiseDetails;
    displayName = displayName;

    filteredCaps : any;
    franchiseSources = [];
    franchiseStatues = [];

    onCapsChanged: Subscription;
    loading = false;


  constructor(
        public dialogRef: MatDialogRef<RoyaltyFranchiseComponent>,
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
            this.dialogTitle = 'Edit Franchise';
            this.franchise = data.franchise;
        }
        else
        {
            this.dialogTitle = 'Create Franchise';
            this.franchise = new FranchiseDetails();
        }

        this.franchiseForm = this.createFranchiseForm();
        this.loading = false;

  }

  ngOnInit() {
         this.onCapsChanged = 
            this.api.getCapCodes().subscribe(caps => {
                     this.filteredCaps = caps;
                 });
  }

  ngOnDestroy() {
    this.onCapsChanged.unsubscribe();
  }

  createFranchiseForm() {
        if (this.franchise.liveDate === "0000-00-00") {
          this.franchise.liveDate = null;
        }
        let liveDate = this.franchise.liveDate ? moment(this.franchise.liveDate).toDate() : null;
        return this.formBuilder.group({
            id                      : this.franchise.id,
            franchiseName           : [this.franchise.franchiseName, Validators.required],
            franchiseNumber         : [this.franchise.franchiseNumber, Validators.required],
            capId                   : [this.franchise.capId],
            capCode                 : [this.franchise.capCode, Validators.required],
            url                     : [this.franchise.url, Validators.required],
            techFee                 : [this.franchise.techFee],
            liveDate                : [liveDate]
        });
  }

  create() {
        if (this.franchiseForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }
        //this.franchiseForm.value.capId = this.getCapId(this.franchiseForm.value.capCode);
        //this.franchiseForm.value.capId = this.caps;
        console.log(this.franchiseForm.value);
        this.franchise.setData(this.franchiseForm.value);
        this.dialogRef.close(this.franchise);
  }

  update() {
        if (this.franchiseForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }
        console.log(this.franchiseForm.value);
        this.franchise.setData(this.franchiseForm.value);
        this.dialogRef.close(['save', this.franchise]);
  }

/*    getCapId(code) {
        this.api.getCapByCodes({code:code})
            .subscribe((data: any) => {
      //      this.caps =  data;
            });
    } */

  selectCap(ev) {
    const caps = this.filteredCaps.find(filteredCaps => filteredCaps.capCode == ev.value);
        this.franchiseForm.patchValue({
            capCode: caps.capCode,
            capId: caps.id
        });
    }
}

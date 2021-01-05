import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CapDetails } from 'app/models';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';


@Component({
  selector: 'app-cap-details',
  templateUrl: './cap-details.component.html',
  styleUrls: ['./cap-details.component.scss']
})
export class CapDetailsComponent implements OnInit {
    capForm: FormGroup;
    action: string;
    cap: CapDetails;

  constructor
  (
        private auth: AuthService,
        private api: ApiService,
        private formBuilder: FormBuilder,
        private msg: MessageService
  ) 
  { 

        this.cap = new CapDetails();
        this.capForm = this.createCapForm();

  }

  ngOnInit() {
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


}

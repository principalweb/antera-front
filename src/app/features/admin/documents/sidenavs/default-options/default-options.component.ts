import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { Router} from '@angular/router';

@Component({
  selector: 'app-default-options',
  templateUrl: './default-options.component.html',
  styleUrls: ['./default-options.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DefaultOptionsComponent implements OnInit {

  loading = false;
  name : string;
  type : string;
  description : string;
  msgForm: FormGroup;

  constructor(
        public defaultOptionsDialogRef: MatDialogRef<DefaultOptionsComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private router: Router,
        private msg: MessageService      
  ) { 
        
        this.name = data.name;
        this.type = data.type;
        this.description = data.description;
        console.log(data);
        this.msgForm = this.createForm();        
  }

  ngOnInit() {
  }

  createForm()
  {
    return this.formBuilder.group({
        description: [this.description]
    });
  }

  save()
  {
    const data = {
	name: this.name,
	type : this.type,
	description : this.msgForm.value.description
    }
    this.defaultOptionsDialogRef.close(data);
  }
  
}

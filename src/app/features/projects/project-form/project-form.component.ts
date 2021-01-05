import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, ValidatorFn } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Project } from 'app/models';
import { fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { ModuleField } from 'app/models/module-field';
import { MessageService } from 'app/core/services/message.service';
import { ApiService } from 'app/core/services/api.service';
@Component({
    selector: 'fuse-project-form',
    templateUrl: './project-form.component.html',
    styleUrls: ['./project-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseProjectFormComponent implements OnInit {
    service: any;
    action: string;
    dialogTitle: string;
    project: Project;
    projectForm: FormGroup;
    fields = [];
    fieldLabel = fieldLabel;
    visibleField = visibleField;
    requiredField = requiredField;
    loading = false;


    status = ['Draft', 'In review', 'Published'];
    priorities = ['Low', 'Medium', 'High'];

    constructor(
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public dialogRef: MatDialogRef<FuseProjectFormComponent>,
        private msg: MessageService,
        private api: ApiService,
    ) {
        this.action = data.action;
        this.service = data.service;

        if ( this.action === 'edit' ) {
            this.dialogTitle = 'Edit Project';
            this.project = data.project;
        } else {
            this.dialogTitle = 'New Project';
            this.project = new Project({});
        }  
    }

    ngOnInit() {

    const projectsModuleFieldParams =
    {
      offset: 0,
      limit: 1000,
      order: 'module',
      orient: 'asc',
      term: { module: 'Projects' }
    }
    this.loading = true;
    this.api.getFieldsList(projectsModuleFieldParams)
      .subscribe((res: any[]) => {
        this.fields = res.map(moduleField => new ModuleField(moduleField));
        console.log(this.fields);
        this.loading = false;
        this.initForm();
      }, () => { this.loading = false; });
    
    }
    initForm(){

        this.projectForm = this.formBuilder.group({
            name       : [this.project.name, Validators.required],
            description: [this.project.description],
            dateCreated: [this.project.dateCreated],
            dateModified: [this.project.dateModified],
            assignedUserId: [this.project.assignedUserId],
            assignedUserName: [this.project.assignedUserName],
            assignee: [this.project.assignee],
            modifiedUserId: [this.project.modifiedUserId],
            modifiedUserName: [this.project.modifiedUserName],
            createdById: [this.project.createdById],
            createdByName: [this.project.createdByName],
            estimatedStartDate  : [this.project.estimatedStartDate, Validators.required],
            estimatedEndDate    : [this.project.estimatedEndDate, Validators.required],
            status     : [this.project.status, Validators.required],
            priority   : [this.project.priority, Validators.required]            
        });
        
    }
    save(form) {
        if (this.projectForm.invalid) {
          this.msg.show('Please complete the form first', 'error');
          return;
        }

        this.dialogRef.close([
            'save',
            {
                ...this.project,
                ...form.getRawValue()
            }
        ]);
    }

}
